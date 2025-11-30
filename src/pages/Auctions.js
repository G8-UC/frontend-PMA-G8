import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { auctionService } from '../services/auctionService';
import { 
  FaGavel, FaExchangeAlt, FaInbox, FaPaperPlane, FaHistory,
  FaSpinner, FaCheckCircle, FaTimesCircle, FaClock, FaPlus, 
  FaTimes, FaExternalLinkAlt, FaCheck, FaBan, FaSync
} from 'react-icons/fa';
import LoadingScreen from '../components/common/LoadingScreen';
import './Auctions.css';

function Auctions() {
  const { isAuthenticated, isLoading: authLoading } = useAuth0();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('my-offers');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  
  const [reservedVisits, setReservedVisits] = useState([]);
  const [myOffers, setMyOffers] = useState([]);
  const [externalOffers, setExternalOffers] = useState([]);
  const [receivedProposals, setReceivedProposals] = useState([]);
  const [sentProposals, setSentProposals] = useState([]);
  const [events, setEvents] = useState([]);
  
  // Modal crear oferta
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [offerQuantity, setOfferQuantity] = useState(1);
  const [creating, setCreating] = useState(false);
  
  // Modal crear propuesta
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [selectedVisitForProposal, setSelectedVisitForProposal] = useState(null);
  const [proposalQuantity, setProposalQuantity] = useState(1);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      switch (activeTab) {
        case 'my-offers':
          const [offers, visits] = await Promise.all([
            auctionService.getMyOffers(),
            auctionService.getReservedVisits(true)
          ]);
          setMyOffers(Array.isArray(offers) ? offers : []);
          setReservedVisits(Array.isArray(visits) ? visits : []);
          break;
        case 'external':
          const [external, visitsForProposal] = await Promise.all([
            auctionService.getExternalOffers(),
            auctionService.getReservedVisits(true)
          ]);
          setExternalOffers(Array.isArray(external) ? external : []);
          setReservedVisits(Array.isArray(visitsForProposal) ? visitsForProposal : []);
          break;
        case 'received':
          const received = await auctionService.getReceivedProposals();
          setReceivedProposals(Array.isArray(received) ? received : []);
          break;
        case 'sent':
          const sent = await auctionService.getSentProposals();
          setSentProposals(Array.isArray(sent) ? sent : []);
          break;
        case 'history':
          const historyData = await auctionService.getAuctionEvents(100);
          setEvents(Array.isArray(historyData) ? historyData : []);
          break;
        default:
          break;
      }
    } catch (err) {
      console.error('Error loading auction data:', err);
      setError(err.response?.data?.detail || err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadData();
  }, [isAuthenticated, authLoading, navigate, loadData]);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Crear oferta
  const handleCreateOffer = async () => {
    if (!selectedVisit) return;
    setCreating(true);
    try {
      await auctionService.createOffer(selectedVisit.property_url, offerQuantity);
      setSuccessMsg('¡Oferta creada exitosamente!');
      setShowCreateModal(false);
      setSelectedVisit(null);
      setOfferQuantity(1);
      loadData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al crear la oferta');
    } finally {
      setCreating(false);
    }
  };

  // Cancelar oferta
  const handleCancelOffer = async (auctionId) => {
    if (!window.confirm('¿Estás seguro de cancelar esta oferta?')) return;
    try {
      await auctionService.cancelOffer(auctionId);
      setSuccessMsg('Oferta cancelada');
      loadData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al cancelar la oferta');
    }
  };

  // Crear propuesta (ofrecer nuestra visita por la de otro grupo)
  const handleCreateProposal = async () => {
    if (!selectedOffer || !selectedVisitForProposal) return;
    setCreating(true);
    try {
      await auctionService.createProposal(
        selectedOffer.auction_id, 
        selectedVisitForProposal.property_url,
        proposalQuantity
      );
      setSuccessMsg('¡Propuesta enviada!');
      setShowProposalModal(false);
      setSelectedOffer(null);
      setSelectedVisitForProposal(null);
      setProposalQuantity(1);
      loadData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al crear la propuesta');
    } finally {
      setCreating(false);
    }
  };

  // Aceptar propuesta
  const handleAcceptProposal = async (proposal) => {
    if (!window.confirm('¿Aceptar esta propuesta? Se realizará el intercambio.')) return;
    try {
      await auctionService.acceptProposal(proposal.proposal_id, proposal.auction_id);
      setSuccessMsg('¡Propuesta aceptada! Intercambio completado.');
      loadData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al aceptar');
    }
  };

  // Rechazar propuesta
  const handleRejectProposal = async (proposal) => {
    if (!window.confirm('¿Rechazar esta propuesta?')) return;
    try {
      await auctionService.rejectProposal(proposal.proposal_id, proposal.auction_id);
      setSuccessMsg('Propuesta rechazada');
      loadData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al rechazar');
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      active: { icon: <FaClock />, text: 'Activa', cls: 'status-active' },
      accepted: { icon: <FaCheckCircle />, text: 'Aceptada', cls: 'status-accepted' },
      rejected: { icon: <FaTimesCircle />, text: 'Rechazada', cls: 'status-rejected' },
      cancelled: { icon: <FaBan />, text: 'Cancelada', cls: 'status-cancelled' },
      pending: { icon: <FaClock />, text: 'Pendiente', cls: 'status-pending' }
    };
    const c = config[status?.toLowerCase()] || config.pending;
    return <span className={`status-badge ${c.cls}`}>{c.icon} {c.text}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatPrice = (price, currency = 'CLP') => {
    if (!price) return '-';
    if (currency === 'UF') return `${price} UF`;
    if (currency === 'USD') return `$${Number(price).toLocaleString()} USD`;
    return `$${Number(price).toLocaleString()} CLP`;
  };

  if (authLoading) return <LoadingScreen />;

  return (
    <div className="auctions-page">
      <div className="auctions-container">
        <div className="auctions-header">
          <h1><FaGavel /> Sistema de Subastas</h1>
          <p>Gestiona intercambios de visitas con otros grupos</p>
        </div>

        {successMsg && <div className="alert alert-success"><FaCheckCircle /> {successMsg}</div>}
        {error && <div className="alert alert-error"><FaTimesCircle /> {error} <button onClick={() => setError(null)}>×</button></div>}

        <div className="auctions-tabs">
          {[
            { id: 'my-offers', icon: <FaGavel />, label: 'Mis Ofertas' },
            { id: 'external', icon: <FaExchangeAlt />, label: 'Ofertas Externas' },
            { id: 'received', icon: <FaInbox />, label: 'Propuestas Recibidas' },
            { id: 'sent', icon: <FaPaperPlane />, label: 'Propuestas Enviadas' },
            { id: 'history', icon: <FaHistory />, label: 'Historial' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="auctions-actions">
          <button className="btn-refresh" onClick={loadData} disabled={loading}>
            <FaSync className={loading ? 'spinning' : ''} /> Actualizar
          </button>
          {activeTab === 'my-offers' && (
            <button className="btn-create" onClick={() => setShowCreateModal(true)}>
              <FaPlus /> Nueva Oferta
            </button>
          )}
        </div>

        <div className="auctions-content">
          {loading ? (
            <div className="loading-state"><FaSpinner className="spinning" /><p>Cargando...</p></div>
          ) : (
            <>
              {/* TAB: MIS OFERTAS */}
              {activeTab === 'my-offers' && (
                <div className="section">
                  <h3>Mis Ofertas ({myOffers.length})</h3>
                  {myOffers.length === 0 ? (
                    <div className="empty-state"><FaGavel /><p>No tienes ofertas</p></div>
                  ) : (
                    <div className="cards-grid">
                      {myOffers.map(offer => (
                        <div key={offer.auction_id} className="card">
                          <div className="card-header">
                            {getStatusBadge(offer.status)}
                            <span className="card-id">{offer.auction_id?.slice(0, 8)}...</span>
                          </div>
                          <div className="card-body">
                            <a href={offer.url} target="_blank" rel="noopener noreferrer" className="card-link">
                              Ver propiedad <FaExternalLinkAlt />
                            </a>
                            <p className="card-meta">Cantidad: {offer.quantity}</p>
                            <p className="card-meta">Creada: {formatDate(offer.created_at)}</p>
                          </div>
                          {offer.status === 'active' && (
                            <div className="card-actions">
                              <button className="btn-cancel" onClick={() => handleCancelOffer(offer.auction_id)}>
                                <FaTimes /> Cancelar
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <h3 className="mt-4">Visitas Disponibles para Ofertar ({reservedVisits.length})</h3>
                  {reservedVisits.length === 0 ? (
                    <div className="empty-state small"><p>No tienes visitas reservadas disponibles</p></div>
                  ) : (
                    <div className="visits-list">
                      {reservedVisits.map((visit, idx) => (
                        <div key={idx} className="visit-item">
                          <div className="visit-info">
                            <p className="visit-name">{visit.property_name || 'Propiedad'}</p>
                            <p className="visit-location">{visit.property_location}</p>
                            <p className="visit-price">{formatPrice(visit.property_price, visit.property_currency)}</p>
                            <p className="visit-qty">Disponibles: {visit.available_quantity}/{visit.quantity}</p>
                          </div>
                          <button
                            className="btn-offer"
                            onClick={() => { setSelectedVisit(visit); setOfferQuantity(1); setShowCreateModal(true); }}
                            disabled={visit.available_quantity < 1}
                          >
                            <FaGavel /> Ofertar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: OFERTAS EXTERNAS */}
              {activeTab === 'external' && (
                <div className="section">
                  <h3>Ofertas de Otros Grupos ({externalOffers.length})</h3>
                  {externalOffers.length === 0 ? (
                    <div className="empty-state"><FaExchangeAlt /><p>No hay ofertas externas disponibles</p></div>
                  ) : (
                    <div className="cards-grid">
                      {externalOffers.map(offer => (
                        <div key={offer.auction_id} className="card external">
                          <div className="card-header">
                            <span className="group-badge">Grupo {offer.group_id}</span>
                            {getStatusBadge(offer.status)}
                          </div>
                          <div className="card-body">
                            <a href={offer.url} target="_blank" rel="noopener noreferrer" className="card-link">
                              Ver propiedad <FaExternalLinkAlt />
                            </a>
                            <p className="card-meta">Cantidad: {offer.quantity}</p>
                            <p className="card-meta">Publicada: {formatDate(offer.timestamp)}</p>
                          </div>
                          {offer.status === 'active' && reservedVisits.length > 0 && (
                            <div className="card-actions">
                              <button
                                className="btn-proposal"
                                onClick={() => { 
                                  setSelectedOffer(offer); 
                                  setSelectedVisitForProposal(null);
                                  setProposalQuantity(1); 
                                  setShowProposalModal(true); 
                                }}
                              >
                                <FaPaperPlane /> Enviar Propuesta
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: PROPUESTAS RECIBIDAS */}
              {activeTab === 'received' && (
                <div className="section">
                  <h3>Propuestas Recibidas ({receivedProposals.length})</h3>
                  {receivedProposals.length === 0 ? (
                    <div className="empty-state"><FaInbox /><p>No has recibido propuestas</p></div>
                  ) : (
                    <div className="proposals-list">
                      {receivedProposals.map(p => (
                        <div key={p.proposal_id} className="proposal-card">
                          <div className="proposal-header">
                            <span className="group-badge">De Grupo {p.group_id}</span>
                            {getStatusBadge(p.status)}
                          </div>
                          <div className="proposal-body">
                            <p><strong>Nos ofrecen:</strong></p>
                            <p><a href={p.url} target="_blank" rel="noopener noreferrer">{p.url} <FaExternalLinkAlt /></a></p>
                            <p>Cantidad: {p.quantity} visita(s)</p>
                            <p className="card-meta">Recibida: {formatDate(p.created_at)}</p>
                          </div>
                          {(p.status === 'pending' || p.status === 'active') && (
                            <div className="proposal-actions">
                              <button className="btn-accept" onClick={() => handleAcceptProposal(p)}>
                                <FaCheck /> Aceptar
                              </button>
                              <button className="btn-reject" onClick={() => handleRejectProposal(p)}>
                                <FaBan /> Rechazar
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: PROPUESTAS ENVIADAS */}
              {activeTab === 'sent' && (
                <div className="section">
                  <h3>Propuestas Enviadas ({sentProposals.length})</h3>
                  {sentProposals.length === 0 ? (
                    <div className="empty-state"><FaPaperPlane /><p>No has enviado propuestas</p></div>
                  ) : (
                    <div className="proposals-list">
                      {sentProposals.map(p => (
                        <div key={p.proposal_id} className="proposal-card sent">
                          <div className="proposal-header">
                            <span className="group-badge">A Grupo {p.target_group_id}</span>
                            {getStatusBadge(p.status)}
                          </div>
                          <div className="proposal-body">
                            <p><strong>Ofrecimos:</strong></p>
                            <p><a href={p.url} target="_blank" rel="noopener noreferrer">{p.url} <FaExternalLinkAlt /></a></p>
                            <p>Cantidad: {p.quantity} visita(s)</p>
                            <p className="card-meta">Enviada: {formatDate(p.created_at)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: HISTORIAL */}
              {activeTab === 'history' && (
                <div className="section">
                  <h3>Historial de Eventos ({events.length})</h3>
                  {events.length === 0 ? (
                    <div className="empty-state"><FaHistory /><p>No hay eventos registrados</p></div>
                  ) : (
                    <div className="events-timeline">
                      {events.map((ev, idx) => (
                        <div key={idx} className={`event-item ${ev.event_type}`}>
                          <div className="event-dot"></div>
                          <div className="event-content">
                            <p className="event-type">{ev.event_type?.replace(/_/g, ' ')}</p>
                            <p className="event-message">{ev.message}</p>
                            <p className="event-meta">
                              {ev.group_id && <span>Grupo {ev.group_id}</span>}
                              {ev.counterparty_group_id && <span> ↔ Grupo {ev.counterparty_group_id}</span>}
                            </p>
                            <p className="event-date">{formatDate(ev.created_at)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* MODAL: CREAR OFERTA */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2><FaGavel /> Crear Nueva Oferta</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}><FaTimes /></button>
            </div>
            <div className="modal-body">
              {selectedVisit ? (
                <>
                  <div className="selected-item">
                    <h4>{selectedVisit.property_name || 'Propiedad'}</h4>
                    <p>{selectedVisit.property_location}</p>
                    <p>{formatPrice(selectedVisit.property_price, selectedVisit.property_currency)}</p>
                    <p>Disponibles: {selectedVisit.available_quantity}</p>
                  </div>
                  <div className="form-group">
                    <label>Cantidad a ofertar:</label>
                    <input
                      type="number"
                      min="1"
                      max={selectedVisit.available_quantity}
                      value={offerQuantity}
                      onChange={e => setOfferQuantity(Math.min(parseInt(e.target.value) || 1, selectedVisit.available_quantity))}
                    />
                    <span className="hint">Máximo: {selectedVisit.available_quantity}</span>
                  </div>
                </>
              ) : (
                <div className="visit-selector">
                  <p>Selecciona una visita para ofertar:</p>
                  {reservedVisits.filter(v => v.available_quantity > 0).map((v, i) => (
                    <div key={i} className="visit-option" onClick={() => setSelectedVisit(v)}>
                      <p><strong>{v.property_name || 'Propiedad'}</strong></p>
                      <p>{v.property_location} - Disponibles: {v.available_quantity}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => { setShowCreateModal(false); setSelectedVisit(null); }}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleCreateOffer} disabled={!selectedVisit || creating}>
                {creating ? <FaSpinner className="spinning" /> : <FaGavel />}
                {creating ? ' Creando...' : ' Crear Oferta'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREAR PROPUESTA */}
      {showProposalModal && selectedOffer && (
        <div className="modal-overlay" onClick={() => setShowProposalModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2><FaPaperPlane /> Enviar Propuesta</h2>
              <button className="modal-close" onClick={() => setShowProposalModal(false)}><FaTimes /></button>
            </div>
            <div className="modal-body">
              <div className="selected-item">
                <h4>Oferta del Grupo {selectedOffer.group_id}</h4>
                <p><a href={selectedOffer.url} target="_blank" rel="noopener noreferrer">{selectedOffer.url}</a></p>
                <p>Ofrecen: {selectedOffer.quantity} visita(s)</p>
              </div>
              
              <hr style={{border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '1rem 0'}} />
              
              <p style={{color: 'rgba(255,255,255,0.8)', marginBottom: '1rem'}}>
                <strong>Selecciona qué visita ofrecer a cambio:</strong>
              </p>
              
              {selectedVisitForProposal ? (
                <>
                  <div className="selected-item">
                    <h4>{selectedVisitForProposal.property_name || 'Propiedad'}</h4>
                    <p>{selectedVisitForProposal.property_location}</p>
                    <p>Disponibles: {selectedVisitForProposal.available_quantity}</p>
                    <button 
                      className="btn-secondary" 
                      style={{marginTop: '0.5rem', padding: '0.3rem 0.8rem', fontSize: '0.8rem'}}
                      onClick={() => setSelectedVisitForProposal(null)}
                    >
                      Cambiar
                    </button>
                  </div>
                  <div className="form-group">
                    <label>Cantidad a ofrecer:</label>
                    <input
                      type="number"
                      min="1"
                      max={selectedVisitForProposal.available_quantity}
                      value={proposalQuantity}
                      onChange={e => setProposalQuantity(Math.min(parseInt(e.target.value) || 1, selectedVisitForProposal.available_quantity))}
                    />
                    <span className="hint">Máximo: {selectedVisitForProposal.available_quantity}</span>
                  </div>
                </>
              ) : (
                <div className="visit-selector">
                  {reservedVisits.filter(v => v.available_quantity > 0).length === 0 ? (
                    <p style={{color: '#ff6b6b'}}>No tienes visitas disponibles para ofrecer</p>
                  ) : (
                    reservedVisits.filter(v => v.available_quantity > 0).map((v, i) => (
                      <div key={i} className="visit-option" onClick={() => setSelectedVisitForProposal(v)}>
                        <p><strong>{v.property_name || 'Propiedad'}</strong></p>
                        <p>{v.property_location} - Disponibles: {v.available_quantity}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => { setShowProposalModal(false); setSelectedOffer(null); setSelectedVisitForProposal(null); }}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleCreateProposal} disabled={!selectedVisitForProposal || creating}>
                {creating ? <FaSpinner className="spinning" /> : <FaPaperPlane />}
                {creating ? ' Enviando...' : ' Enviar Propuesta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Auctions;