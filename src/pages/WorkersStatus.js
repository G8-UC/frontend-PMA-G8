import React, { useEffect, useState } from "react";
import { getWorkersStatus } from "../services/recommendations";

export default function WorkersStatus() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getWorkersStatus()
      .then((data) => {
        setStatus(data.ok);
      })
      .catch((err) => {
        setError(err.message);
        setStatus(false);
      });
  }, []);

  return (
    <div className="page-container" style={{ textAlign: "center", marginTop: "4rem" }}>
      <h1>Estado del servicio de recomendaciones</h1>

      {status === null && <p>Chequeando servicio...</p>}
      {status === true && (
        <p style={{ color: "green", fontWeight: "bold" }}>
          Servicio operativo ✅
        </p>
      )}
      {status === false && (
        <p style={{ color: "red", fontWeight: "bold" }}>
          Servicio no disponible ❌
        </p>
      )}

      {error && <p style={{ color: "gray" }}>Detalle: {error}</p>}
    </div>
  );
}
