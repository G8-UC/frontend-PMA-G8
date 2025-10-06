import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://nicoriquelmecti.space/api/v1';

class WalletService {
  constructor() {
    this.localWallets = new Map(); // Cache local para desarrollo
  }

  // Obtener balance del wallet
  async getWalletBalance(userId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/wallet/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.warn('⚠️ Error obteniendo wallet del backend, usando mock');
      
      // Fallback: wallet mock con saldo inicial
      if (!this.localWallets.has(userId)) {
        this.localWallets.set(userId, {
          user_id: userId,
          balance_clp: 50000, // Saldo inicial para testing
          balance_uf: 1.5,
          last_updated: new Date().toISOString(),
          transactions: [
            {
              id: 'initial_balance',
              type: 'initial_deposit',
              amount: 50000,
              currency: 'CLP',
              status: 'completed',
              timestamp: new Date().toISOString(),
              description: 'Saldo inicial'
            }
          ]
        });
      }
      
      return this.localWallets.get(userId);
    }
  }

  // Recargar dinero al wallet
  async rechargeWallet(userId, amount, currency = 'CLP', paymentMethod = 'credit_card') {
    try {
      const rechargeData = {
        user_id: userId,
        amount: amount,
        currency: currency,
        payment_method: paymentMethod,
        timestamp: new Date().toISOString(),
        transaction_type: 'recharge'
      };

      console.log('💰 Recargando wallet:', rechargeData);

      const response = await axios.post(`${API_BASE_URL}/wallet/recharge`, rechargeData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;

    } catch (error) {
      console.warn('⚠️ Error recargando en backend, simulando localmente');
      
      // Fallback: simular recarga local
      const wallet = await this.getWalletBalance(userId);
      
      // Simular tiempo de procesamiento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const transaction = {
        id: `recharge_${Date.now()}`,
        type: 'recharge',
        amount: amount,
        currency: currency,
        status: 'completed',
        timestamp: new Date().toISOString(),
        payment_method: paymentMethod,
        description: `Recarga de ${currency === 'UF' ? amount + ' UF' : '$' + amount.toLocaleString('es-CL') + ' CLP'}`
      };

      if (currency === 'CLP') {
        wallet.balance_clp += amount;
      } else if (currency === 'UF') {
        wallet.balance_uf += amount;
      }

      wallet.transactions.unshift(transaction);
      wallet.last_updated = new Date().toISOString();
      
      this.localWallets.set(userId, wallet);
      
      return {
        success: true,
        transaction: transaction,
        new_balance: {
          clp: wallet.balance_clp,
          uf: wallet.balance_uf
        }
      };
    }
  }

  // Pagar visita desde wallet
  async payVisitFromWallet(userId, propertyId, amount, currency, propertyName) {
    try {
      const wallet = await this.getWalletBalance(userId);
      
      // Verificar saldo suficiente
      const currentBalance = currency === 'UF' ? wallet.balance_uf : wallet.balance_clp;
      
      if (currentBalance < amount) {
        throw new Error(`Saldo insuficiente. Tienes ${currency === 'UF' ? amount.toFixed(2) + ' UF' : '$' + currentBalance.toLocaleString('es-CL') + ' CLP'}, necesitas ${currency === 'UF' ? amount.toFixed(2) + ' UF' : '$' + amount.toLocaleString('es-CL') + ' CLP'}`);
      }

      const paymentData = {
        user_id: userId,
        property_id: propertyId,
        amount: amount,
        currency: currency,
        payment_source: 'wallet',
        timestamp: new Date().toISOString(),
        transaction_type: 'visit_payment'
      };

      console.log('🏠 Pagando visita desde wallet:', paymentData);

      // Simular tiempo de procesamiento
      await new Promise(resolve => setTimeout(resolve, 1000));

      const transaction = {
        id: `visit_${Date.now()}`,
        type: 'visit_payment',
        amount: amount,
        currency: currency,
        property_id: propertyId,
        status: 'completed',
        timestamp: new Date().toISOString(),
        description: `Pago de visita - ${propertyName || 'Propiedad'}`
      };

      // Descontar del balance
      if (currency === 'UF') {
        wallet.balance_uf -= amount;
      } else {
        wallet.balance_clp -= amount;
      }

      wallet.transactions.unshift(transaction);
      wallet.last_updated = new Date().toISOString();
      
      this.localWallets.set(userId, wallet);
      
      return {
        success: true,
        transaction: transaction,
        new_balance: {
          clp: wallet.balance_clp,
          uf: wallet.balance_uf
        }
      };

    } catch (error) {
      console.error('❌ Error pagando visita:', error);
      throw error;
    }
  }

  // Obtener historial de transacciones (soporta paginación y filtros).
  // Devuelve { transactions: [...], has_more: boolean } para compatibilidad con la UI.
  async getTransactionHistory(userId, page = 1, pageSize = 20, filter = 'all') {
    try {
      const offset = (page - 1) * pageSize;
      const response = await axios.get(`${API_BASE_URL}/wallet/${userId}/transactions?limit=${pageSize}&offset=${offset}&filter=${filter}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      // Se asume que el backend devuelve { transactions: [...], total: N }
      const data = response.data;
      const transactions = Array.isArray(data.transactions) ? data.transactions : data;
      const total = data.total || (Array.isArray(data.transactions) ? data.transactions.length : transactions.length);

      // Asegurar que cada transacción tenga el campo `created_at` (mapeo desde `timestamp` si es necesario)
      const normalized = transactions.map(tx => ({
        ...tx,
        created_at: tx.created_at || tx.timestamp || tx.date || new Date().toISOString()
      }));

      return {
        transactions: normalized,
        has_more: offset + pageSize < total
      };
    } catch (error) {
      console.warn('\u26a0\ufe0f Error obteniendo transacciones, usando cache local');

      const wallet = await this.getWalletBalance(userId);
      const allTx = Array.isArray(wallet.transactions) ? wallet.transactions : [];

      // Aplicar filtro simple en fallback (recharge/payment/all)
      const filtered = filter === 'all' ? allTx : allTx.filter(t => {
        if (filter === 'recharge') return (t.type || t.transaction_type) === 'recharge' || (t.type === 'initial_deposit');
        if (filter === 'payment') return (t.type || t.transaction_type) === 'payment' || (t.type === 'visit_payment');
        return true;
      });

      const offset = (page - 1) * pageSize;
      const pageTx = filtered.slice(offset, offset + pageSize).map(tx => ({
        ...tx,
        created_at: tx.created_at || tx.timestamp || tx.date || new Date().toISOString()
      }));

      return {
        transactions: pageTx,
        has_more: offset + pageSize < filtered.length
      };
    }
  }

  // Verificar si tiene saldo suficiente
  async hasSufficientBalance(userId, amount, currency) {
    try {
      const wallet = await this.getWalletBalance(userId);
      const currentBalance = currency === 'UF' ? wallet.balance_uf : wallet.balance_clp;
      return currentBalance >= amount;
    } catch (error) {
      console.error('Error verificando saldo:', error);
      return false;
    }
  }
}

export default new WalletService();