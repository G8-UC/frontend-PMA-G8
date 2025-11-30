const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

(async () => {
  const base = process.env.API_URL || 'http://localhost:4000';
  console.log('Testing API at', base);
  try {
    // Health
    let r = await fetch(`${base}/api/v1/health`);
    console.log('Health:', await r.json());

    // Offer (admin)
    r = await fetch(`${base}/api/v1/auctions/offer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Role': 'admin', 'X-Group-Id': 'group-a' },
      body: JSON.stringify({ quantity: 2, url: 'https://mygroup.example/offer/a' })
    });
    const offer = await r.json();
    console.log('Offer:', offer);

    // Proposal (admin)
    r = await fetch(`${base}/api/v1/auctions/proposal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Role': 'admin', 'X-Group-Id': 'group-b' },
      body: JSON.stringify({ auction_id: offer.auction_id, quantity: 1, url: 'https://groupb.example/proposal/1' })
    });
    const proposal = await r.json();
    console.log('Proposal:', proposal);

    // Accept (admin)
    r = await fetch(`${base}/api/v1/auctions/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Role': 'admin', 'X-Group-Id': 'group-a' },
      body: JSON.stringify({ auction_id: offer.auction_id, proposal_id: proposal.proposal_id })
    });
    const acceptance = await r.json();
    console.log('Acceptance:', acceptance);

    // Public offers
    r = await fetch(`${base}/api/v1/auctions/offers?page=1&limit=5`);
    console.log('Offers list:', await r.json());

    // Auction events
    r = await fetch(`${base}/api/v1/auctions/${offer.auction_id}`);
    console.log('Auction events:', await r.json());

    // Admin check: try as normal user
    r = await fetch(`${base}/api/v1/auctions/offer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Role': 'user' },
      body: JSON.stringify({ quantity: 1, url: 'https://bad.example/offer' })
    });
    console.log('Normal user offer status:', r.status);
    console.log('Normal user offer body:', await r.json());

  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
