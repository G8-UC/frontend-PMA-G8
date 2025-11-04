// src/components/common/ReceiptButton.js
import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { purchaseRequestService } from "../../services/purchaseRequestService"; 
import "./ReceiptButton.css";

export default function ReceiptButton({ requestId, status, disabled, onSuccess }) {
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClick = async () => {
    setError("");
    if (!isAuthenticated) {
      await loginWithRedirect();
      return;
    }
    if (status && !["VALIDATED", "ACCEPTED"].includes(status)) {
      setError("La compra aún no está validada.");
      return;
    }

    setLoading(true);
    try {
      const receiptUrl = await purchaseRequestService.generateReceipt(requestId);
      if (!receiptUrl) throw new Error("El backend no retornó una URL de boleta.");
      window.open(receiptUrl, "_blank", "noopener,noreferrer");
      onSuccess && onSuccess(receiptUrl);
    } catch (e) {
      setError(e.message || "No fue posible generar la boleta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="receipt-btn-wrapper">
      <button
        className="receipt-btn"
        onClick={handleClick}
        disabled={loading || disabled}
        aria-busy={loading}
        title="Descargar boleta de la compra"
      >
        {loading ? "Generando…" : "Descargar boleta"}
      </button>
      {error && <p className="receipt-error">{error}</p>}
    </div>
  );
}
