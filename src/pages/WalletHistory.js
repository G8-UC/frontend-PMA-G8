import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../hooks/useWallet';
import walletService from '../services/walletService';
import { FaWallet, FaArrowDown, FaArrowUp, FaCalendarAlt, FaSpinner, FaSync } from 'react-icons/fa';
import WalletBalance from '../components/WalletBalance';
import WalletRechargeModal from '../components/WalletRechargeModal';
import './WalletHistory.css';

function WalletHistory() {
  const { user, isAuthenticated } = useAuth();
  const { wallet, formatBalance, refreshWallet } = useWallet();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'recharge', 'payment'
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadTransactions();
    }
  }, [isAuthenticated, user, filter]);

  const loadTransactions = async (pageNum = 1, append = false) => {
    try {
      setLoading(!append);
      setError('');

      const userId = user.id || user.sub || 'mock_user';
      const response = await walletService.getTransactionHistory(userId, pageNum, 20, filter);
      
      if (append) {
        setTransactions(prev => [...prev, ...response.transactions]);
      } else {
        setTransactions(response.transactions);
      }
      
      setHasMore(response.has_more);
      setPage(pageNum);
      
    } catch (err) {
      setError('Error al cargar el historial de transacciones');
      console.error('Error loading transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      loadTransactions(page + 1, true);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1);
    setHasMore(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'recharge':
        return <FaArrowDown className="transaction-icon recharge" />;
      case 'payment':
        return <FaArrowUp className="transaction-icon payment" />;
      default:
        return <FaWallet className="transaction-icon" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      completed: { text: 'Completado', className: 'success' },
      pending: { text: 'Pendiente', className: 'warning' },
      failed: { text: 'Fallido', className: 'danger' },
      cancelled: { text: 'Cancelado', className: 'secondary' }
    };

    const statusInfo = statusMap[status] || { text: status, className: 'secondary' };
    
    return (
      <span className={`status-badge ${statusInfo.className}`}>
        {statusInfo.text}
      </span>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="wallet-history">
        <div className="container">
          <div className="auth-required">
            <h2>Inicia sesión para ver tu historial de wallet</h2>
            <p>Necesitas estar autenticado para acceder a tu historial de transacciones.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-history">
      <div className="container">
        <div className="wallet-header">
          <h1>Mi Wallet</h1>
          <div className="wallet-summary">
            <WalletBalance 
              showRechargeButton={true}
              onRecharge={() => setShowRechargeModal(true)}
            />
          </div>
        </div>

        <div className="transactions-section">
          <div className="section-header">
            <h2>Historial de Transacciones</h2>
            <div className="section-actions">
              <button
                className="refresh-btn"
                onClick={() => {
                  refreshWallet();
                  loadTransactions(1, false);
                }}
                disabled={loading}
              >
                <FaSync className={loading ? 'spinning' : ''} />
                Actualizar
              </button>
            </div>
          </div>

          <div className="transaction-filters">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => handleFilterChange('all')}
            >
              Todas
            </button>
            <button
              className={`filter-btn ${filter === 'recharge' ? 'active' : ''}`}
              onClick={() => handleFilterChange('recharge')}
            >
              Recargas
            </button>
            <button
              className={`filter-btn ${filter === 'payment' ? 'active' : ''}`}
              onClick={() => handleFilterChange('payment')}
            >
              Pagos
            </button>
          </div>

          {loading && transactions.length === 0 ? (
            <div className="loading-state">
              <FaSpinner className="spinner" />
              <span>Cargando transacciones...</span>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <button 
                className="btn btn-primary"
                onClick={() => loadTransactions(1, false)}
              >
                Reintentar
              </button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="empty-state">
              <FaWallet className="empty-icon" />
              <h3>No hay transacciones</h3>
              <p>Aún no tienes transacciones en tu wallet.</p>
              <button
                className="btn btn-primary"
                onClick={() => setShowRechargeModal(true)}
              >
                Realizar primera recarga
              </button>
            </div>
          ) : (
            <>
              <div className="transactions-list">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="transaction-item">
                    <div className="transaction-icon-wrapper">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    
                    <div className="transaction-details">
                      <div className="transaction-main">
                        <h4 className="transaction-title">
                          {transaction.description || (
                            transaction.type === 'recharge' ? 'Recarga de wallet' : 
                            transaction.type === 'payment' ? 'Pago de visita' : 
                            'Transacción'
                          )}
                        </h4>
                        <div className="transaction-meta">
                          <FaCalendarAlt className="meta-icon" />
                          <span>{formatDate(transaction.created_at)}</span>
                          {transaction.payment_method && (
                            <span className="payment-method">
                              • {transaction.payment_method}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {transaction.property_name && (
                        <div className="transaction-property">
                          <span>Propiedad: {transaction.property_name}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="transaction-amount">
                      <span className={`amount ${transaction.type === 'recharge' ? 'positive' : 'negative'}`}>
                        {transaction.type === 'recharge' ? '+' : '-'}
                        {formatBalance(transaction.amount, transaction.currency)}
                      </span>
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>
                ))}
              </div>

              {hasMore && (
                <div className="load-more">
                  <button
                    className="btn btn-outline"
                    onClick={loadMore}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="spinner" />
                        Cargando...
                      </>
                    ) : (
                      'Cargar más transacciones'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <WalletRechargeModal
        isOpen={showRechargeModal}
        onClose={() => setShowRechargeModal(false)}
      />
    </div>
  );
}

export default WalletHistory;