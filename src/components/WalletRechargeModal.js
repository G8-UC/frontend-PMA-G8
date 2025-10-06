import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import './WalletRechargeModal.css';

const WalletRechargeModal = ({ isOpen, onClose }) => {
  const { rechargeWallet, loading } = useWallet();
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [currency] = useState('CLP');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Montos predefinidos
  const predefinedAmounts = [10000, 25000, 50000, 100000, 200000, 500000];

  const handleAmountSelect = (selectedAmount) => {
    setAmount(selectedAmount.toString());
    setError('');
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    setAmount(value);
    setError('');
  };

  const formatCurrency = (value) => {
    if (!value) return '';
    return Math.round(value).toLocaleString('es-CL');
  };

  const validateAmount = () => {
    const numAmount = parseInt(amount);
    
    if (!amount || numAmount <= 0) {
      setError('Ingresa un monto válido');
      return false;
    }
    
    if (numAmount < 1000) {
      setError('El monto mínimo es $1.000');
      return false;
    }
    
    if (numAmount > 1000000) {
      setError('El monto máximo es $1.000.000');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateAmount()) return;
    
    setError('');
    
    try {
      await rechargeWallet(parseInt(amount), currency, paymentMethod);
      setSuccess(true);
      
      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setAmount('');
      }, 2000);
      
    } catch (err) {
      setError(err.message || 'Error al procesar la recarga');
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setAmount('');
      setError('');
      setSuccess(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="wallet-recharge-modal-overlay" onClick={handleClose}>
      <div className="wallet-recharge-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Recargar Wallet</h2>
          <button 
            className="close-button"
            onClick={handleClose}
            disabled={loading}
          >
            ×
          </button>
        </div>

        {success ? (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h3>¡Recarga exitosa!</h3>
            <p>Se han agregado ${formatCurrency(amount)} a tu wallet</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="predefined-amounts">
              <p>Montos frecuentes:</p>
              <div className="amount-buttons">
                {predefinedAmounts.map(predefinedAmount => (
                  <button
                    key={predefinedAmount}
                    type="button"
                    className={`amount-button ${amount === predefinedAmount.toString() ? 'selected' : ''}`}
                    onClick={() => handleAmountSelect(predefinedAmount)}
                  >
                    ${formatCurrency(predefinedAmount)}
                  </button>
                ))}
              </div>
            </div>

            <div className="custom-amount">
              <label htmlFor="customAmount">O ingresa un monto personalizado:</label>
              <div className="amount-input-wrapper">
                <span className="currency-symbol">$</span>
                <input
                  id="customAmount"
                  type="text"
                  value={formatCurrency(amount)}
                  onChange={handleCustomAmountChange}
                  placeholder="0"
                  className="amount-input"
                />
                <span className="currency-code">CLP</span>
              </div>
            </div>

            <div className="payment-method">
              <label htmlFor="paymentMethod">Método de pago:</label>
              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="payment-select"
              >
                <option value="credit_card">Tarjeta de Crédito</option>
                <option value="debit_card">Tarjeta de Débito</option>
                <option value="transfer">Transferencia Bancaria</option>
                <option value="webpay">Webpay</option>
              </select>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="submit-button"
                disabled={loading || !amount}
              >
                {loading ? 'Procesando...' : `Recargar $${formatCurrency(amount)}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default WalletRechargeModal;