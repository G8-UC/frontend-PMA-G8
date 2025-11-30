import React, { useEffect, useState } from 'react';
import { listOffers, createOffer, createProposal, acceptProposal, rejectProposal, getAuction } from '../services/auctionService';

export default function Auctions() {
  const [offers, setOffers] = useState([]);
  const [pageInfo, setPageInfo] = useState({ page: 1, limit: 10, total_pages: 1 });
  const [form, setForm] = useState({ quantity: 1, url: '' , groupId: 'group-a'});
  const [proposalForm, setProposalForm] = useState({ auction_id: '', quantity: 1, url: '', groupId: 'group-b' });
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [events, setEvents] = useState([]);
  const [message, setMessage] = useState('');

  const refreshOffers = async (page = 1) => {
    const data = await listOffers(page, pageInfo.limit);
    setOffers(data.offers || []);
    setPageInfo({ page: data.page, limit: data.limit, total_pages: data.total_pages });
  };

  useEffect(() => { refreshOffers(1); }, []);

  const submitOffer = async (e) => {
    e.preventDefault();
    try {
      const ev = await createOffer({ quantity: Number(form.quantity), url: form.url, groupId: form.groupId });
      setMessage(`Offer created: ${ev.auction_id}`);
      await refreshOffers(pageInfo.page);
    } catch (err) {
      setMessage(err?.response?.data?.error || 'Error creating offer');
    }
  };

  const submitProposal = async (e) => {
    e.preventDefault();
    try {
      const ev = await createProposal({ auction_id: proposalForm.auction_id, quantity: Number(proposalForm.quantity), url: proposalForm.url, groupId: proposalForm.groupId });
      setMessage(`Proposal created: ${ev.proposal_id}`);
      await refreshOffers(pageInfo.page);
    } catch (err) {
      setMessage(err?.response?.data?.error || 'Error creating proposal');
    }
  };

  const loadAuction = async (auctionId) => {
    setSelectedAuction(auctionId);
    try {
      const data = await getAuction(auctionId);
      setEvents(data.events || []);
    } catch (err) {
      setEvents([]);
      setMessage('Auction not found');
    }
  };

  const doAccept = async (auction_id, proposal_id) => {
    try {
      const ev = await acceptProposal({ auction_id, proposal_id, groupId: 'group-a' });
      setMessage(`Accepted proposal: ${ev.proposal_id}`);
      await loadAuction(auction_id);
    } catch (err) {
      setMessage(err?.response?.data?.error || 'Error accepting proposal');
    }
  };

  const doReject = async (auction_id, proposal_id) => {
    try {
      const ev = await rejectProposal({ auction_id, proposal_id, groupId: 'group-a' });
      setMessage(`Rejected proposal: ${ev.proposal_id}`);
      await loadAuction(auction_id);
    } catch (err) {
      setMessage(err?.response?.data?.error || 'Error rejecting proposal');
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Auctions (Admin actions visible)</h2>
      {message && <div style={{ marginBottom: 12, color: '#444' }}>{message}</div>}

      <section style={{ marginBottom: 24 }}>
        <h3>Create Offer</h3>
        <form onSubmit={submitOffer}>
          <input placeholder="URL" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} />
          <input type="number" min={1} placeholder="Quantity" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
          <input placeholder="Group ID" value={form.groupId} onChange={e => setForm({ ...form, groupId: e.target.value })} />
          <button type="submit">Publish Offer (admin)</button>
        </form>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h3>Create Proposal</h3>
        <form onSubmit={submitProposal}>
          <input placeholder="Auction ID" value={proposalForm.auction_id} onChange={e => setProposalForm({ ...proposalForm, auction_id: e.target.value })} />
          <input placeholder="URL" value={proposalForm.url} onChange={e => setProposalForm({ ...proposalForm, url: e.target.value })} />
          <input type="number" min={1} placeholder="Quantity" value={proposalForm.quantity} onChange={e => setProposalForm({ ...proposalForm, quantity: e.target.value })} />
          <input placeholder="Group ID" value={proposalForm.groupId} onChange={e => setProposalForm({ ...proposalForm, groupId: e.target.value })} />
          <button type="submit">Send Proposal (admin)</button>
        </form>
      </section>

      <section>
        <h3>Offers</h3>
        <ul>
          {offers.map(o => (
            <li key={o.id} style={{ marginBottom: 8 }}>
              <div>
                <b>Auction:</b> {o.auction_id} | <b>URL:</b> {o.url} | <b>Qty:</b> {o.quantity} | <b>Group:</b> {o.group_id}
              </div>
              <button onClick={() => loadAuction(o.auction_id)}>Load Events</button>
            </li>
          ))}
        </ul>
        <div style={{ marginTop: 12 }}>
          <button disabled={pageInfo.page <= 1} onClick={() => refreshOffers(pageInfo.page - 1)}>Prev</button>
          <span style={{ margin: '0 8px' }}>Page {pageInfo.page} / {pageInfo.total_pages}</span>
          <button disabled={pageInfo.page >= pageInfo.total_pages} onClick={() => refreshOffers(pageInfo.page + 1)}>Next</button>
        </div>
      </section>

      {selectedAuction && (
        <section style={{ marginTop: 24 }}>
          <h3>Events for {selectedAuction}</h3>
          <ul>
            {events.map(ev => (
              <li key={ev.id} style={{ marginBottom: 8 }}>
                <div>
                  <b>{ev.operation}</b> | url: {ev.url} | qty: {ev.quantity} | group: {ev.group_id} | proposal: {ev.proposal_id || '-'}
                </div>
                {ev.operation === 'proposal' && (
                  <div style={{ marginTop: 6 }}>
                    <button onClick={() => doAccept(selectedAuction, ev.proposal_id)}>Accept (admin)</button>
                    <button onClick={() => doReject(selectedAuction, ev.proposal_id)} style={{ marginLeft: 6 }}>Reject (admin)</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
