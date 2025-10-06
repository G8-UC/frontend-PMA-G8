import React from 'react';
import { useWallet } from '../hooks/useWallet';
import './WalletBalance.css';

const WalletBalance = ({ showRechargeButton = true, onRecharge = null }) => {
  const { wallet, loading, error, formatBalance } = useWallet();

  if (loading) {
    return (
      <div className="wallet-balance loading">
        <span>Cargando balance...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wallet-balance error">
        <span>Error: {error}</span>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="wallet-balance">
        <span>Balance no disponible</span>
      </div>
    );
  }

  return (
    <div className="wallet-balance">
      <div className="balance-info">
        <span className="balance-label">Tu saldo:</span>
        <span className="balance-amount">
          {formatBalance(wallet.balance_clp, 'CLP')}
        </span>
        {wallet.balance_uf > 0 && (
          <span className="balance-uf">
            {formatBalance(wallet.balance_uf, 'UF')}
          </span>
        )}
      </div>
      
      {showRechargeButton && (
        <button 
          className="recharge-button"
          onClick={onRecharge}
          type="button"
        >
          Recargar
        </button>
      )}
    </div>
  );
};

export default WalletBalance;