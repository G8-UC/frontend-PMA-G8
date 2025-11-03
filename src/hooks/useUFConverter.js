import { useState, useEffect, useCallback } from 'react';
import { ufService } from '../services/ufService';

export function useUFConverter() {
  const [ufValue, setUFValue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadUFValue = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const ufData = await ufService.getCurrentUFValue();
      setUFValue(ufData);
      setLastUpdated(new Date());
      
    } catch (err) {
      console.error('Error loading UF value:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar valor de UF al inicializar
  useEffect(() => {
    loadUFValue();
  }, [loadUFValue]);

  const convertUFToCLP = useCallback(async (ufAmount) => {
    try {
      return await ufService.convertUFToCLP(ufAmount);
    } catch (err) {
      console.error('Error converting UF to CLP:', err);
      throw err;
    }
  }, []);

  const convertCLPToUF = useCallback(async (clpAmount) => {
    try {
      return await ufService.convertCLPToUF(clpAmount);
    } catch (err) {
      console.error('Error converting CLP to UF:', err);
      throw err;
    }
  }, []);

  const calculate10PercentInCLP = useCallback(async (ufPrice) => {
    try {
      return await ufService.calculate10PercentInCLP(ufPrice);
    } catch (err) {
      console.error('Error calculating 10% in CLP:', err);
      throw err;
    }
  }, []);

  const getPriceInfo = useCallback(async (price, currency) => {
    try {
      return await ufService.getPriceInfo(price, currency);
    } catch (err) {
      console.error('Error getting price info:', err);
      throw err;
    }
  }, []);

  const formatPrice = useCallback((amount, currency) => {
    return ufService.formatPrice(amount, currency);
  }, []);

  const refreshUFValue = useCallback(() => {
    ufService.clearCache();
    loadUFValue();
  }, [loadUFValue]);

  return {
    ufValue,
    loading,
    error,
    lastUpdated,
    convertUFToCLP,
    convertCLPToUF,
    calculate10PercentInCLP,
    getPriceInfo,
    formatPrice,
    refreshUFValue
  };
}