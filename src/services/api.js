// src/services/api.js

export const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/";

export async function apiFetch(endpoint, options = {}) {
  const cleanUrl = `${API_URL.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;
  const response = await fetch(cleanUrl, {
    ...options,
    credentials: "include",
  });

  // Si la respuesta no es JSON o hay error, manejarlo
  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    console.error(`❌ Error ${response.status} en ${cleanUrl}`, data);
    throw new Error(data?.detail || "Error en la petición");
  }

  return data;
}


/* ===============================
   📘  Helpers
=============================== */
async function handleResponse(response, errorMessage) {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${errorMessage}: ${text || response.status}`);
  }
  // Si es DELETE, no hay JSON que devolver
  if (response.status === 204) return true;
  return await response.json();
}

function extractResults(data) {
  // DRF puede devolver lista directa o paginada
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
}

/* ===============================
   📦  Recetas
=============================== */
export async function getRecetas() {
  const response = await fetch(`${API_URL}/recetas/`);
  return await handleResponse(response, "Error al obtener las recetas");
}

export async function createReceta(data) {
  const response = await fetch(`${API_URL}/recetas/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await handleResponse(response, "Error al crear la receta");
}

export async function updateReceta(id, data) {
  const response = await fetch(`${API_URL}/recetas/${id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await handleResponse(response, "Error al actualizar la receta");
}

export async function deleteReceta(id) {
  const response = await fetch(`${API_URL}/recetas/${id}/`, {
    method: "DELETE",
  });
  return await handleResponse(response, "Error al eliminar la receta");
}

/* ===============================
   🧂  Ingredientes
=============================== */
export async function getIngredientes(search = "") {
  const url = search
    ? `${API_URL}/ingredientes/?search=${encodeURIComponent(search)}`
    : `${API_URL}/ingredientes/`;
  const response = await fetch(url);
  const data = await handleResponse(response, "Error al obtener los ingredientes");
  return extractResults(data);
}

/* ===============================
   ⚖️  Unidades
=============================== */
export async function getUnidades() {
  const response = await fetch(`${API_URL}/unidades/`);
  const data = await handleResponse(response, "Error al obtener las unidades");
  return extractResults(data).map((u) => ({
    id: u.id,
    nombre: u.nombre ?? u.name ?? "",
    abreviatura: u.abreviatura ?? u.abbrev ?? "",
  }));
}

/* ===============================
   🧩  Ingrediente-Receta (opcional)
=============================== */
// Si más adelante deseas manejar esta tabla directamente:
export async function getIngredientesReceta(recetaId) {
  const response = await fetch(`${API_URL}/ingredientesreceta/?receta=${recetaId}`);
  const data = await handleResponse(response, "Error al obtener los ingredientes de la receta");
  return extractResults(data);
}


export async function fetchIngredientes(search = "") {
  const response = await fetch(`${API_URL}/ingredientes/?search=${search}`);
  if (!response.ok) throw new Error("Error al obtener ingredientes");
  return await response.json();
}
