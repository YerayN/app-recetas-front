// src/services/api.js

export const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/";

// 1. Variable para almacenar el token CSRF
let csrfToken = null;

// 2. Función para obtener el token. La petición establece la cookie.
export async function getCsrfToken() {
  if (csrfToken) return csrfToken; // Retorna si ya lo tenemos

  try {
    // ✅ Lógica de URL simplificada para obtener la URL base limpia
    const cleanApiUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    const csrfUrl = `${cleanApiUrl}/auth/csrf-cookie/`;

    // Petición GET al endpoint que Django usa para establecer la cookie
    const response = await fetch(csrfUrl, {
      method: 'GET',
      credentials: "include", // Crucial para recibir la cookie
    });

    if (!response.ok) {
        throw new Error("Failed to set CSRF cookie");
    }

    // Leemos el valor de 'csrftoken' de las cookies del documento
    const cookieMatch = document.cookie.match(/csrftoken=([^;]+)/);
    if (cookieMatch) {
      csrfToken = cookieMatch[1];
      console.log("✅ CSRF Token obtenido y almacenado.");
      return csrfToken;
    }
    
    throw new Error("CSRF token not found in cookies"); 

  } catch (error) {
    console.error("❌ Error al obtener el token CSRF:", error);
    return null; 
  }
}

// 3. Función de fetch que inyecta el token para mutaciones
export async function apiFetch(endpoint, options = {}) {
  // 💡 NUEVA LÓGICA DE CONSTRUCCIÓN DE URL
  // ------------------------------------------------------------------
  // 1. Quitar la barra final de API_URL si existe
  const cleanApiUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  // 2. Quitar la barra inicial del endpoint si existe
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  // 3. Unir
  const cleanUrl = `${cleanApiUrl}/${cleanEndpoint}`;
  // ------------------------------------------------------------------
  
  const method = options.method ? options.method.toUpperCase() : "GET";
  
  const headers = options.headers || {};
  
  // 💡 Solo necesitamos el token para métodos que modifican el servidor (mutaciones)
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    // Si no tenemos el token, intentamos obtenerlo de forma síncrona
    if (!csrfToken) {
        await getCsrfToken(); 
    }
    
    // Si el token fue encontrado, lo añadimos al header
    if (csrfToken) {
        // Django/DRF espera el token en el encabezado X-CSRFToken
        headers["X-CSRFToken"] = csrfToken; 
    } else {
        console.warn("⚠️ CSRF token is missing. POST/PUT/DELETE requests may fail.");
    }
  }

  const response = await fetch(cleanUrl, {
    ...options,
    credentials: "include", // Crucial para enviar la cookie de sesión/CSRF
    headers: {
        ...headers,
        "Content-Type": headers["Content-Type"] || "application/json",
    },
  });
  
  let data = null;
  // Intenta parsear la respuesta como JSON
  try {
    // Si es DELETE (status 204), no hay JSON que devolver
    if (response.status !== 204) {
      data = await response.json();
    }
  } catch {
    data = null;
  }

  if (!response.ok) {
    console.error(`❌ Error ${response.status} en ${cleanUrl}`, data);
    // Aseguramos que el error es descriptivo
    throw new Error(data?.detail || data?.error || `Error ${response.status} en la petición`);
  }
  
  // Si fue un 204 (DELETE), devolvemos true
  if (response.status === 204) return true;

  return data;
}

// Nota: Asegúrate de incluir aquí tus funciones helper como 'handleResponse' 
// y 'extractResults' si las usas en otras partes de tu archivo 'api.js' 
// (aunque no fueron incluidas en el snippet proporcionado).



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
