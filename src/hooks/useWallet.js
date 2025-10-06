import { useState, useEffect } from 'react';
import walletService from '../services/walletService';
import { useAuth } from '../context/AuthContext';

export const useWallet = () => {
  const { user, isAuthenticated } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar wallet del usuario
  const loadWallet = async () => {
    if (!user || !isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const walletData = await walletService.getWalletBalance(user.id || user.sub || 'mock_user');
      setWallet(walletData);
    } catch (err) {
      setError(err.message);
      console.error('Error cargando wallet:', err);
    } finally {
      setLoading(false);
    }
  };

  // Recargar wallet
  const rechargeWallet = async (amount, currency = 'CLP', paymentMethod = 'credit_card') => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await walletService.rechargeWallet(
        user.id || user.sub || 'mock_user', 
        amount, 
        currency, 
        paymentMethod
      );
      
      // Recargar wallet actualizado
      await loadWallet();
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Pagar visita desde wallet
  const payVisitFromWallet = async (propertyId, amount, currency, propertyName) => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await walletService.payVisitFromWallet(
        user.id || user.sub || 'mock_user', 
        propertyId, 
        amount, 
        currency,
        propertyName
      );
      
      // Recargar wallet actualizado
      await loadWallet();
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Verificar saldo suficiente
  const hasSufficientBalance = async (amount, currency) => {
    if (!user) return false;
    
    try {
      return await walletService.hasSufficientBalance(
        user.id || user.sub || 'mock_user', 
        amount, 
        currency
      );
    } catch (err) {
      console.error('Error verificando saldo:', err);
      return false;
    }
  };

  // Formatear balance
  const formatBalance = (amount, currency) => {
    if (currency === 'UF') {
      return `${amount.toFixed(2)} UF`;
    }
    return `$${Math.round(amount).toLocaleString('es-CL')} CLP`;
  };

  // Cargar wallet automáticamente
  useEffect(() => {
    if (isAuthenticated && user) {
      loadWallet();
    } else {
      setWallet(null);
    }
  }, [isAuthenticated, user]);

  return {
    wallet,
    loading,
    error,
    rechargeWallet,
    payVisitFromWallet,
    hasSufficientBalance,
    formatBalance,
    refreshWallet: loadWallet,
    clearError: () => setError(null)
  };
};