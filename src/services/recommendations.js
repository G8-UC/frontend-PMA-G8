const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000/api/v1";

export async function getUserRecommendations(userId) {
  try {
    const res = await fetch(
      `${API_BASE_URL}/users/${encodeURIComponent(userId)}/recommendations`
    );

    if (!res.ok) {
      throw new Error("Error al obtener recomendaciones");
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error en getUserRecommendations:", error);
    throw error;
  }
}


export async function getWorkersStatus() {
  const res = await fetch(`${API_BASE_URL}/workers/status`);
  if (!res.ok) throw new Error("Error al verificar estado de workers");
  return res.json();
}
