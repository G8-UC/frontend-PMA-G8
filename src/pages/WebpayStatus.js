import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './WebpayStatus.css';
import authService from '../services/authService';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function WebpayStatus() {
  const query = useQuery();
  const navigate = useNavigate();
  const token = query.get('token_ws') || query.get('token') || '';
  const [loading, setLoading] = useState(true);
  const [statusInfo, setStatusInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setError('token_ws no proporcionado en la URL');
      setLoading(false);
      return;
    }

    const fetchStatus = async () => {
      try {
        setLoading(true);
        const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
        // Añadir Authorization header con el access token del usuario logeado (Auth0)
        const userToken = authService.getAccessToken && authService.getAccessToken();
        const headers = {
          'Accept': 'application/json',
          ...(userToken ? { 'Authorization': `Bearer ${userToken}` } : {}),
        };

        const res = await fetch(`${API_BASE}/webpay/status?token_ws=${encodeURIComponent(token)}`, {
          method: 'GET',
          headers,
        });
        if (!res.ok) {
          const txt = await res.text().catch(() => null);
          throw new Error(txt || `Error ${res.status}`);
        }
        const data = await res.json();
        setStatusInfo(data);
      } catch (err) {
        console.error('Error fetching webpay status:', err);
        setError(err.message || 'Error al consultar estado de pago');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [token]);

  return (
    <div className="webpay-status-container">
      <h2 className="webpay-status-title">Estado de Pago WebPay</h2>
      {!token && (
        <div className="alert alert-warning">No se encontró token de WebPay en la URL.</div>
      )}

  {loading && <div className="webpay-loading">Cargando estado...</div>}

  {error && <div className="alert alert-danger">{typeof error === 'string' ? error : (error && (error.message || String(error)))}</div>}

      {statusInfo && (
        <div className="webpay-status-card">
          <p><strong>Compra:</strong> {statusInfo.compra_id}</p>
          <p><strong>Estado:</strong> {statusInfo.status}</p>
          <p><strong>Propiedad:</strong> {statusInfo.property_name} ({statusInfo.property_id})</p>
          <p><strong>Precio:</strong> {statusInfo.price}</p>

          {statusInfo.status === 'VALIDATED' || statusInfo.status === 'VALIDADO' || statusInfo.status === 'ACCEPTED' ? (
            <div className="alert alert-success">Pago aprobado. La visita fue reservada.</div>
          ) : (
            <div className="alert alert-warning">Pago no aprobado o pendiente. Revisar notificaciones.</div>
          )}

          <div className="webpay-actions">
            <button className="btn btn-primary" onClick={() => navigate('/my-rentals')}>Ver mis solicitudes</button>
          </div>
        </div>
      )}
    </div>
  );
}