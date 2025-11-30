const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// In-memory stores
const auctions = new Map(); // auction_id -> { offer: event, proposals: [event], acceptance: event|null, rejections: [event] }
const offersIndex = []; // list of offer events for pagination
const purchaseRequests = []; // { id, group_id, property_id, created_at }

// Middleware: admin check via header X-Role: admin
function requireAdmin(req, res, next) {
  const role = (req.headers['x-role'] || '').toLowerCase();
  if (role !== 'admin') {
    return res.status(403).json({
      error: 'Access denied: admin privileges required',
      code: 'FORBIDDEN_ADMIN_ONLY'
    });
  }
  next();
}

// Utilities
function nowISO() { return new Date().toISOString(); }
function makeEvent({ auction_id = null, proposal_id = null, url, quantity, group_id, operation }) {
  return {
    id: uuidv4(),
    auction_id,
    proposal_id,
    url,
    timestamp: nowISO(),
    quantity,
    group_id,
    operation,
    created_at: nowISO()
  };
}

// Health
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', time: nowISO() });
});

// Properties (mock data)
const properties = [
  { id: 'p-001', name: 'Casa Centro', location: 'Santiago', visits_available: 5 },
  { id: 'p-002', name: 'Depto Playa', location: 'Viña del Mar', visits_available: 2 },
  { id: 'p-003', name: 'Cabaña Bosque', location: 'Pucón', visits_available: 3 }
];

app.get('/api/v1/properties', (req, res) => {
  res.json({ properties });
});

app.get('/api/v1/properties/detail/:name/:location', (req, res) => {
  const { name, location } = req.params;
  const found = properties.filter(p => p.name.toLowerCase() === name.toLowerCase() && p.location.toLowerCase() === location.toLowerCase());
  if (!found.length) return res.status(404).json({ error: 'Property not found' });
  res.json({ properties: found });
});

// Purchase Requests (currently no admin restriction per spec note)
app.post('/api/v1/purchase-requests', (req, res) => {
  const { group_id, property_id } = req.body || {};
  if (!group_id || !property_id) return res.status(400).json({ error: 'group_id and property_id are required' });
  const pr = { id: uuidv4(), group_id, property_id, created_at: nowISO() };
  purchaseRequests.push(pr);
  res.status(201).json(pr);
});

// Auctions
// POST /api/v1/auctions/offer (admin)
app.post('/api/v1/auctions/offer', requireAdmin, (req, res) => {
  const { quantity, url } = req.body || {};
  const group_id = req.headers['x-group-id'] || 'unknown-group';
  if (typeof quantity !== 'number' || quantity <= 0 || !url) {
    return res.status(400).json({ error: 'Invalid body: quantity>0 and url required' });
  }
  const auction_id = uuidv4();
  const offerEvent = makeEvent({ auction_id, url, quantity, group_id, operation: 'offer' });
  auctions.set(auction_id, { offer: offerEvent, proposals: [], acceptance: null, rejections: [] });
  offersIndex.push(offerEvent);
  // Broker publish stub
  publishAuctionEvent(offerEvent);
  res.status(201).json(offerEvent);
});

// POST /api/v1/auctions/proposal (admin)
app.post('/api/v1/auctions/proposal', requireAdmin, (req, res) => {
  const { auction_id, quantity, url } = req.body || {};
  const group_id = req.headers['x-group-id'] || 'unknown-group';
  if (!auction_id || typeof quantity !== 'number' || quantity <= 0 || !url) {
    return res.status(400).json({ error: 'Invalid body: auction_id, quantity>0 and url required' });
  }
  const a = auctions.get(auction_id);
  if (!a) return res.status(404).json({ error: 'Auction not found' });
  const proposalEvent = makeEvent({ auction_id, proposal_id: uuidv4(), url, quantity, group_id, operation: 'proposal' });
  a.proposals.push(proposalEvent);
  publishAuctionEvent(proposalEvent);
  res.status(201).json(proposalEvent);
});

// POST /api/v1/auctions/accept (admin)
app.post('/api/v1/auctions/accept', requireAdmin, (req, res) => {
  const { auction_id, proposal_id } = req.body || {};
  const group_id = req.headers['x-group-id'] || 'unknown-group';
  const a = auctions.get(auction_id);
  if (!a) return res.status(404).json({ error: 'Auction not found' });
  const proposal = a.proposals.find(p => p.proposal_id === proposal_id);
  if (!proposal) return res.status(404).json({ error: 'Proposal not found' });
  const acceptanceEvent = makeEvent({ auction_id, proposal_id, url: proposal.url, quantity: proposal.quantity, group_id, operation: 'acceptance' });
  a.acceptance = acceptanceEvent;
  publishAuctionEvent(acceptanceEvent);
  res.status(201).json(acceptanceEvent);
});

// POST /api/v1/auctions/reject (admin)
app.post('/api/v1/auctions/reject', requireAdmin, (req, res) => {
  const { auction_id, proposal_id } = req.body || {};
  const group_id = req.headers['x-group-id'] || 'unknown-group';
  const a = auctions.get(auction_id);
  if (!a) return res.status(404).json({ error: 'Auction not found' });
  const proposal = a.proposals.find(p => p.proposal_id === proposal_id);
  if (!proposal) return res.status(404).json({ error: 'Proposal not found' });
  const rejectionEvent = makeEvent({ auction_id, proposal_id, url: proposal.url, quantity: proposal.quantity, group_id, operation: 'rejection' });
  a.rejections.push(rejectionEvent);
  publishAuctionEvent(rejectionEvent);
  res.status(201).json(rejectionEvent);
});

// GET /api/v1/auctions/offers (public paginated)
app.get('/api/v1/auctions/offers', (req, res) => {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.max(parseInt(req.query.limit || '10', 10), 1);
  const total_count = offersIndex.length;
  const total_pages = Math.max(Math.ceil(total_count / limit), 1);
  const start = (page - 1) * limit;
  const offers = offersIndex.slice(start, start + limit);
  res.json({ offers, total_count, page, limit, total_pages });
});

// GET /api/v1/auctions/{auction_id}
app.get('/api/v1/auctions/:auction_id', (req, res) => {
  const { auction_id } = req.params;
  const a = auctions.get(auction_id);
  if (!a) return res.status(404).json({ error: 'Auction not found' });
  const events = [a.offer, ...a.proposals];
  if (a.acceptance) events.push(a.acceptance);
  events.push(...a.rejections);
  res.json({ auction_id, events });
});

// Broker stubs
function publishAuctionEvent(event) {
  // RNF05: publish to channel properties/auctions (stub)
  console.log('[broker:publish properties/auctions]', JSON.stringify(event));
}

function consumeExternalAuctionsMock() {
  // NF04: consume other groups auctions (stubbed with a demo event)
  const externalEvent = {
    id: uuidv4(),
    auction_id: uuidv4(),
    proposal_id: null,
    url: 'https://external.example/offer/123',
    timestamp: nowISO(),
    quantity: 1,
    group_id: 'external-group',
    operation: 'offer',
    created_at: nowISO()
  };
  // store as offer
  auctions.set(externalEvent.auction_id, { offer: externalEvent, proposals: [], acceptance: null, rejections: [] });
  offersIndex.push(externalEvent);
}

// Start server
app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
  // Start mock consumer once on boot
  consumeExternalAuctionsMock();
});
