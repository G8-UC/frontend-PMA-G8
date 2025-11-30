import axios from 'axios';

// Auto-detect API base including versioned prefix to avoid 404s
// Default to http://<host>:8000/api/v1 unless REACT_APP_API_URL is provided
const defaultHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const rawBase = process.env.REACT_APP_API_URL || `http://${defaultHost}:8000`;
const API_BASE = `${rawBase.replace(/\/$/, '')}/api/v1`;

const adminHeaders = (groupId) => ({
  'X-Role': 'admin',
  ...(groupId ? { 'X-Group-Id': groupId } : {})
});

export const listOffers = async (page = 1, limit = 10) => {
  const { data } = await axios.get(`${API_BASE}/auctions/offers`, { params: { page, limit } });
  return data;
};

export const getAuction = async (auctionId) => {
  const { data } = await axios.get(`${API_BASE}/auctions/${auctionId}`);
  return data;
};

export const createOffer = async ({ quantity, url, groupId }) => {
  const { data } = await axios.post(`${API_BASE}/auctions/offer`, { quantity, url }, { headers: adminHeaders(groupId) });
  return data;
};

export const createProposal = async ({ auction_id, quantity, url, groupId }) => {
  const { data } = await axios.post(`${API_BASE}/auctions/proposal`, { auction_id, quantity, url }, { headers: adminHeaders(groupId) });
  return data;
};

export const acceptProposal = async ({ auction_id, proposal_id, groupId }) => {
  const { data } = await axios.post(`${API_BASE}/auctions/accept`, { auction_id, proposal_id }, { headers: adminHeaders(groupId) });
  return data;
};

export const rejectProposal = async ({ auction_id, proposal_id, groupId }) => {
  const { data } = await axios.post(`${API_BASE}/auctions/reject`, { auction_id, proposal_id }, { headers: adminHeaders(groupId) });
  return data;
};
