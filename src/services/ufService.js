import axios from 'axios';

// API para obtener el valor de la UF
const UF_API_URL = 'https://mindicador.cl/api/uf';

class UFService {
  constructor() {
    this.cachedUFValue = null;
    this.lastFetch = null;
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 horas en millisegundos
  }

  // Obtener valor actual de la UF
  async getCurrentUFValue() {
    try {
      // Verificar si tenemos un valor en cache válido
      if (this.cachedUFValue && this.lastFetch) {
        const now = new Date().getTime();
        const timeSinceLastFetch = now - this.lastFetch;
        
        if (timeSinceLastFetch < this.cacheExpiry) {
          console.log('Using cached UF value:', this.cachedUFValue);
          return this.cachedUFValue;
        }
      }

      console.log('Fetching current UF value from API...');
      const response = await axios.get(UF_API_URL, {
        timeout: 10000 // 10 segundos timeout
      });

      if (response.data && response.data.serie && response.data.serie.length > 0) {
        // Obtener el valor más reciente
        const latestUFData = response.data.serie[0];
        const ufValue = latestUFData.valor;
        const ufDate = latestUFData.fecha;

        console.log(`UF value for ${ufDate}: $${ufValue} CLP`);

        // Actualizar cache
        this.cachedUFValue = {
          value: ufValue,
          date: ufDate,
          timestamp: new Date().getTime()
        };
        this.lastFetch = new Date().getTime();

        return this.cachedUFValue;
      } else {
        throw new Error('Invalid response format from UF API');
      }

    } catch (error) {
      console.error('Error fetching UF value:', error);
      
      // Si hay un valor en cache, usarlo como fallback
      if (this.cachedUFValue) {
        console.log('Using cached UF value as fallback:', this.cachedUFValue);
        return this.cachedUFValue;
      }

      // Valor de fallback aproximado (actualizar manualmente)
      const fallbackValue = {
        value: 37000, // Valor aproximado, actualizar periódicamente
        date: new Date().toISOString(),
        timestamp: new Date().getTime(),
        isFallback: true
      };

      console.log('Using hardcoded fallback UF value:', fallbackValue);
      return fallbackValue;
    }
  }

  // Convertir UF a CLP
  async convertUFToCLP(ufAmount) {
    try {
      const ufData = await this.getCurrentUFValue();
      const clpAmount = ufAmount * ufData.value;
      
      return {
        ufAmount,
        clpAmount: Math.round(clpAmount),
        ufValue: ufData.value,
        ufDate: ufData.date,
        isFallback: ufData.isFallback || false
      };
    } catch (error) {
      console.error('Error converting UF to CLP:', error);
      throw error;
    }
  }

  // Convertir CLP a UF
  async convertCLPToUF(clpAmount) {
    try {
      const ufData = await this.getCurrentUFValue();
      const ufAmount = clpAmount / ufData.value;
      
      return {
        clpAmount,
        ufAmount: parseFloat(ufAmount.toFixed(4)),
        ufValue: ufData.value,
        ufDate: ufData.date,
        isFallback: ufData.isFallback || false
      };
    } catch (error) {
      console.error('Error converting CLP to UF:', error);
      throw error;
    }
  }

  // Calcular 10% en CLP para propiedades en UF
  async calculate10PercentInCLP(ufPrice) {
    try {
      const tenPercentUF = ufPrice * 0.1;
      const conversion = await this.convertUFToCLP(tenPercentUF);
      
      return {
        originalUF: ufPrice,
        tenPercentUF: tenPercentUF,
        tenPercentCLP: conversion.clpAmount,
        ufValue: conversion.ufValue,
        ufDate: conversion.ufDate,
        isFallback: conversion.isFallback
      };
    } catch (error) {
      console.error('Error calculating 10% in CLP:', error);
      throw error;
    }
  }

  // Formatear precio según moneda
  formatPrice(amount, currency) {
    if (currency === 'UF') {
      return `${amount.toFixed(2)} UF`;
    } else if (currency === 'USD') {
      return `$${amount.toLocaleString('en-US')} USD`;
    } else {
      return `$${Math.round(amount).toLocaleString('es-CL')} CLP`;
    }
  }

  // Obtener información completa de precio con conversiones
  async getPriceInfo(price, currency) {
    const info = {
      original: {
        amount: price,
        currency: currency,
        formatted: this.formatPrice(price, currency)
      },
      conversions: {}
    };

    try {
      if (currency === 'UF') {
        // Convertir UF a CLP
        const ufToCLP = await this.convertUFToCLP(price);
        info.conversions.clp = {
          amount: ufToCLP.clpAmount,
          formatted: this.formatPrice(ufToCLP.clpAmount, 'CLP'),
          ufValue: ufToCLP.ufValue,
          ufDate: ufToCLP.ufDate
        };

        // Calcular 10% en CLP
        const tenPercent = await this.calculate10PercentInCLP(price);
        info.tenPercent = {
          uf: tenPercent.tenPercentUF,
          clp: tenPercent.tenPercentCLP,
          formattedUF: this.formatPrice(tenPercent.tenPercentUF, 'UF'),
          formattedCLP: this.formatPrice(tenPercent.tenPercentCLP, 'CLP')
        };

      } else if (currency === 'CLP') {
        // Convertir CLP a UF
        const clpToUF = await this.convertCLPToUF(price);
        info.conversions.uf = {
          amount: clpToUF.ufAmount,
          formatted: this.formatPrice(clpToUF.ufAmount, 'UF'),
          ufValue: clpToUF.ufValue,
          ufDate: clpToUF.ufDate
        };

        // 10% en CLP es directo
        info.tenPercent = {
          clp: Math.round(price * 0.1),
          formattedCLP: this.formatPrice(price * 0.1, 'CLP')
        };
      } else {
        // Para USD, solo calcular 10%
        info.tenPercent = {
          usd: price * 0.1,
          formattedUSD: this.formatPrice(price * 0.1, 'USD')
        };
      }

    } catch (error) {
      console.error('Error getting price info:', error);
      // Agregar información de error pero no fallar
      info.error = error.message;
    }

    return info;
  }

  // Limpiar cache (útil para testing)
  clearCache() {
    this.cachedUFValue = null;
    this.lastFetch = null;
  }
}

// Crear instancia singleton
export const ufService = new UFService();

export default ufService;