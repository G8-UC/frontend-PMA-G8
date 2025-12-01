import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.ics2173-2025-2-paurovira.me/api/v1';

// Crear instancia separada de Axios para evitar interceptores globales
const auctionAxios = axios.create();

class AuctionService {
  async getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    // Fallback normal con Auth0
    if (window.auth0Client && window.auth0Client.getAccessTokenSilently) {
      try {
        const auth0Token = await window.auth0Client.getAccessTokenSilently();
        if (auth0Token) {
          headers.Authorization = `Bearer ${auth0Token}`;
        }
      } catch (error) {
        console.log('Could not get Auth0 token:', error);
      }
    }
    
    return headers;
  }

  // GET /admin/reserved-visits
  async getReservedVisits(availableOnly = true) {
    const headers = await this.getAuthHeaders();
    const response = await auctionAxios.get(`${API_BASE_URL}/admin/reserved-visits`, { 
      headers, 
      params: { available_only: availableOnly },
      timeout: 10000 
    });
    return response.data?.visits || [];
  }

  // GET /admin/auctions/offers
  async getMyOffers(statusFilter = null) {
    const headers = await this.getAuthHeaders();
    const params = statusFilter ? { status_filter: statusFilter } : {};
    const response = await auctionAxios.get(`${API_BASE_URL}/admin/auctions/offers`, { 
      headers, 
      params,
      timeout: 10000 
    });
    return response.data?.auctions || [];
  }

  // POST /admin/auctions/offers
  async createOffer(propertyUrl, quantity = 1) {
    const headers = await this.getAuthHeaders();
    const response = await auctionAxios.post(
      `${API_BASE_URL}/admin/auctions/offers`,
      { url: propertyUrl, quantity },
      { headers, timeout: 10000 }
    );
    return response.data;
  }

  // DELETE /admin/auctions/offers/{auction_id}
  async cancelOffer(auctionId) {
    const headers = await this.getAuthHeaders();
    const response = await auctionAxios.delete(
      `${API_BASE_URL}/admin/auctions/offers/${auctionId}`,
      { headers, timeout: 10000 }
    );
    return response.data;
  }

  // GET /admin/auctions/external
  async getExternalOffers(statusFilter = 'active') {
    const headers = await this.getAuthHeaders();
    const response = await auctionAxios.get(`${API_BASE_URL}/admin/auctions/external`, { 
      headers, 
      params: { status_filter: statusFilter },
      timeout: 10000 
    });
    return response.data?.auctions || [];
  }

  // GET /admin/auctions/proposals/received
  async getReceivedProposals(statusFilter = null) {
    const headers = await this.getAuthHeaders();
    const params = statusFilter ? { status_filter: statusFilter } : {};
    const response = await auctionAxios.get(`${API_BASE_URL}/admin/auctions/proposals/received`, { 
      headers, 
      params,
      timeout: 10000 
    });
    return response.data?.auctions || [];
  }

  // GET /admin/auctions/proposals/sent
  async getSentProposals(statusFilter = null) {
    const headers = await this.getAuthHeaders();
    const params = statusFilter ? { status_filter: statusFilter } : {};
    const response = await auctionAxios.get(`${API_BASE_URL}/admin/auctions/proposals/sent`, { 
      headers, 
      params,
      timeout: 10000 
    });
    return response.data?.auctions || [];
  }

  // POST /admin/auctions/proposals
  async createProposal(auctionId, propertyUrl, quantity = 1) {
    const headers = await this.getAuthHeaders();
    const response = await auctionAxios.post(
      `${API_BASE_URL}/admin/auctions/proposals`,
      { 
        auction_id: auctionId, 
        url: propertyUrl,
        quantity 
      },
      { headers, timeout: 10000 }
    );
    return response.data;
  }

  // POST /admin/auctions/proposals/{proposal_id}/accept?auction_id={auction_id}
  async acceptProposal(proposalId, auctionId) {
    const headers = await this.getAuthHeaders();
    const response = await auctionAxios.post(
      `${API_BASE_URL}/admin/auctions/proposals/${proposalId}/accept`,
      {},
      { 
        headers, 
        params: { auction_id: auctionId },
        timeout: 10000 
      }
    );
    return response.data;
  }

  // POST /admin/auctions/proposals/{proposal_id}/reject?auction_id={auction_id}
  async rejectProposal(proposalId, auctionId) {
    const headers = await this.getAuthHeaders();
    const response = await auctionAxios.post(
      `${API_BASE_URL}/admin/auctions/proposals/${proposalId}/reject`,
      {},
      { 
        headers, 
        params: { auction_id: auctionId },
        timeout: 10000 
      }
    );
    return response.data;
  }

  // GET /admin/auctions/events
  async getAuctionEvents(limit = 50) {
    const headers = await this.getAuthHeaders();
    const response = await auctionAxios.get(`${API_BASE_URL}/admin/auctions/events`, {
      headers,
      params: { limit },
      timeout: 10000
    });
    return response.data || [];
  }
}

export const auctionService = new AuctionService();