// src/services/api.js

export const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

// ================================================
// 🔐 MANEJO DE TOKEN CSRF
// ================================================

let csrfToken = null;

/**
 * Obtiene el token CSRF del backend.
 * Ahora el backend lo devuelve en el response body Y en el header.
 */
export async function getCsrfToken() {
  try {
    const cleanApiUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    const csrfUrl = `${cleanApiUrl}/auth/csrf-cookie/`;

    const response = await fetch(csrfUrl, {
      method: 'GET',
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to get CSRF token");
    }

    // Leer el token del header X-CSRFToken
    const tokenFromHeader = response.headers.get('X-CSRFToken');
    
    if (tokenFromHeader) {
      csrfToken = tokenFromHeader;
      console.log("✅ CSRF Token obtenido del header");
      return csrfToken;
    }

    // Si no está en el header, intentar del body
    const data = await response.json();
    if (data.csrfToken) {
      csrfToken = data.csrfToken;
      console.log("✅ CSRF Token obtenido del body");
      return csrfToken;
    }
    
    throw new Error("CSRF token not found in response");

  } catch (error) {
    console.error("❌ Error al obtener CSRF token:", error);
    return null;
  }
}

// ================================================
// 🌐 FUNCIÓN FETCH PRINCIPAL
// ================================================

/**
 * Función fetch mejorada que:
 * - Construye URLs correctamente
 * - Inyecta el token CSRF en mutaciones
 * - Maneja credenciales y errores
 */
export async function apiFetch(endpoint, options = {}) {
  // Limpiar y construir la URL
  const cleanApiUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const url = `${cleanApiUrl}/${cleanEndpoint}`;
  
  const method = options.method ? options.method.toUpperCase() : "GET";
  
  // Preparar headers
  let headers = { ...options.headers };
  
  // Añadir token CSRF para mutaciones
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    // Siempre intentar obtener el token actualizado
    const token = await getCsrfToken();
    
    if (token) {
      headers["X-CSRFToken"] = token;
      console.log(`🔐 Token CSRF añadido para ${method} ${endpoint}`);
    } else {
      console.warn(`⚠️ No se pudo obtener token CSRF para ${method} ${endpoint}`);
    }
  }

  // Añadir Content-Type solo si no está ya definido
  if (!headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  // Realizar la petición
  const response = await fetch(url, {
    ...options,
    method,
    credentials: "include",
    headers,
  });
  
  // Si el login fue exitoso, capturar el token del header
  if (endpoint === "login/" && response.ok) {
    const tokenFromHeader = response.headers.get('X-CSRFToken');
    if (tokenFromHeader) {
      csrfToken = tokenFromHeader;
      console.log("✅ CSRF Token actualizado después del login");
    }
  }
  
  // Manejar respuesta
  if (!response.ok) {
    let errorData = null;
    try {
      errorData = await response.json();
    } catch {
      // No hay JSON en la respuesta
    }
    
    const errorMessage = errorData?.detail || errorData?.error || `Error ${response.status}`;
    console.error(`❌ Error ${response.status} en ${url}:`, errorMessage);
    throw new Error(errorMessage);
  }

  // Para DELETE normalmente no hay contenido
  if (response.status === 204) {
    console.log(`✅ ${method} exitoso: ${endpoint}`);
    return true;
  }

  // Parsear JSON
  try {
    return await response.json();
  } catch {
    return null;
  }
}

// ================================================
// 📦 FUNCIONES DE RECETAS
// ================================================

export async function getRecetas() {
  return await apiFetch("recetas/");
}

export async function createReceta(data) {
  return await apiFetch("recetas/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateReceta(id, data) {
  return await apiFetch(`recetas/${id}/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteReceta(id) {
  return await apiFetch(`recetas/${id}/`, {
    method: "DELETE",
  });
}

// ================================================
// 🧂 FUNCIONES DE INGREDIENTES
// ================================================

export async function getIngredientes(search = "") {
  const endpoint = search 
    ? `ingredientes/?search=${encodeURIComponent(search)}`
    : "ingredientes/";
  
  const data = await apiFetch(endpoint);
  return extractResults(data);
}

export async function fetchIngredientes(search = "") {
  return await getIngredientes(search);
}

// ================================================
// ⚖️ FUNCIONES DE UNIDADES
// ================================================

export async function getUnidades() {
  const data = await apiFetch("unidades/");
  const results = extractResults(data);
  
  return results.map((u) => ({
    id: u.id,
    nombre: u.nombre ?? u.name ?? "",
    abreviatura: u.abreviatura ?? u.abbrev ?? "",
  }));
}

// ================================================
// 🧩 FUNCIONES DE INGREDIENTES-RECETA
// ================================================

export async function getIngredientesReceta(recetaId) {
  const data = await apiFetch(`ingredientesreceta/?receta=${recetaId}`);
  return extractResults(data);
}

// ================================================
// 🛠️ HELPERS
// ================================================

/**
 * Extrae resultados de una respuesta que puede ser:
 * - Un array directo
 * - Un objeto con paginación { results: [...] }
 */
function extractResults(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
}