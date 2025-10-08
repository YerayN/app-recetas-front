// src/services/api.js
// -------------------------------------------------------------
// 🌍 Configuración base de la API
// -------------------------------------------------------------
const BASE_URL = "https://app-recetas-production.up.railway.app/api/";

// -------------------------------------------------------------
// 🔐 Manejo de cookies y CSRF
// -------------------------------------------------------------
let csrfTokenCache = null;

// Obtener cookie de Django por nombre
export function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

// -------------------------------------------------------------
// 🔹 Obtener el token CSRF del backend
// -------------------------------------------------------------
export async function getCsrfToken(forceRefresh = false) {
  if (csrfTokenCache && !forceRefresh) return csrfTokenCache;

  try {
    const res = await fetch(`${BASE_URL}csrf/`, {
      method: "GET",
      credentials: "include", // 🔥 permite recibir cookie
    });

    if (!res.ok) throw new Error("No se pudo obtener el token CSRF");
    const data = await res.json();

    csrfTokenCache = data.csrfToken || getCookie("csrftoken");
    console.log("🔐 CSRF Token obtenido del body");
    return csrfTokenCache;
  } catch (error) {
    console.error("❌ Error obteniendo CSRF token:", error);
    return null;
  }
}

// -------------------------------------------------------------
// 🔹 Utilidad general para peticiones autenticadas
// -------------------------------------------------------------
export async function apiFetch(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const method = options.method || "GET";

  const headers = {
    Accept: "application/json",
    ...(options.headers || {}),
  };

  // Añadir token CSRF solo si no es un GET
  if (method !== "GET" && !(options.body instanceof FormData)) {
    const csrf = getCookie("csrftoken") || csrfTokenCache;
    if (csrf) headers["X-CSRFToken"] = csrf;
  }

  const opts = {
    method,
    credentials: "include", // 🔥 envía sessionid + csrftoken
    headers,
  };

  // Manejar el cuerpo según tipo
  if (options.body) {
    if (options.body instanceof FormData) {
      opts.body = options.body; // no añadir Content-Type
    } else if (typeof options.body === "string") {
      headers["Content-Type"] = "application/json";
      opts.body = options.body;
    } else {
      headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(options.body);
    }
  }

  try {
    const res = await fetch(url, opts);

    if (!res.ok) {
      if (res.status === 403)
        console.warn(`🚫 403 en ${url}: Las credenciales no se proveyeron.`);
      else if (res.status === 401)
        console.warn(`🔒 401 en ${url}: Sesión expirada o no autorizada.`);
      else console.error(`❌ ${res.status} ${res.statusText} en ${url}`);
      throw new Error(`Error ${res.status} en ${endpoint}`);
    }

    if (res.status === 204) return null;

    const type = res.headers.get("content-type");
    return type && type.includes("application/json")
      ? await res.json()
      : await res.text();
  } catch (err) {
    console.error("❌ Error en apiFetch:", err);
    throw err;
  }
}

// -------------------------------------------------------------
// 🧠 Autenticación
// -------------------------------------------------------------

// Login (autenticación basada en sesión)
export async function loginUser(username, password) {
  try {
    const csrf = await getCsrfToken(true);
    const res = await fetch(`${BASE_URL}login/`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrf,
      },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) throw new Error("Error al iniciar sesión");
    console.log("✅ Login correcto");
    return true;
  } catch (error) {
    console.error("❌ Error en loginUser:", error);
    return false;
  }
}

// Logout
export async function logoutUser() {
  try {
    const csrf = getCookie("csrftoken") || (await getCsrfToken());
    const res = await fetch(`${BASE_URL}logout/`, {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRFToken": csrf,
      },
    });
    if (!res.ok) throw new Error("Error al cerrar sesión");
    console.log("✅ Logout correcto");
    return true;
  } catch (error) {
    console.error("❌ Error en logoutUser:", error);
    return false;
  }
}

// Verificar si hay sesión activa
export async function checkSession() {
  try {
    const res = await fetch(`${BASE_URL}recetas/`, {
      method: "GET",
      credentials: "include",
    });
    if (res.ok) {
      console.log("🔑 Sesión activa detectada");
      return true;
    } else {
      console.warn("⚠️ Sesión no activa");
      return false;
    }
  } catch (err) {
    console.error("❌ Error verificando sesión:", err);
    return false;
  }
}

// -------------------------------------------------------------
// 🧾 Funciones auxiliares específicas del proyecto
// -------------------------------------------------------------

// 🔹 Obtener lista de recetas
export async function fetchRecetas() {
  try {
    const data = await apiFetch("recetas/");
    return data;
  } catch (error) {
    console.error("❌ Error cargando recetas:", error);
    throw error;
  }
}

// 🔹 Crear receta
export async function createReceta(receta) {
  try {
    const data = await apiFetch("recetas/", {
      method: "POST",
      body: JSON.stringify(receta),
    });
    return data;
  } catch (error) {
    console.error("❌ Error creando receta:", error);
    throw error;
  }
}

// 🔹 Actualizar receta
export async function updateReceta(id, receta) {
  try {
    const data = await apiFetch(`recetas/${id}/`, {
      method: "PUT",
      body: JSON.stringify(receta),
    });
    return data;
  } catch (error) {
    console.error("❌ Error actualizando receta:", error);
    throw error;
  }
}

// 🔹 Eliminar receta
export async function deleteReceta(id) {
  try {
    await apiFetch(`recetas/${id}/`, { method: "DELETE" });
    console.log("✅ Receta eliminada correctamente");
  } catch (error) {
    console.error("❌ Error eliminando receta:", error);
    throw error;
  }
}

// -------------------------------------------------------------
// 📦 Plan Semanal
// -------------------------------------------------------------

export async function fetchPlan() {
  try {
    return await apiFetch("plan/");
  } catch (err) {
    console.error("❌ Error al obtener plan semanal:", err);
    throw err;
  }
}

export async function addToPlan(dia, tipo_comida, receta_id) {
  try {
    await apiFetch("plan/", {
      method: "POST",
      body: JSON.stringify({ dia, tipo_comida, receta_id }),
    });
    console.log("✅ Añadido al plan");
  } catch (err) {
    console.error("❌ Error añadiendo al plan:", err);
  }
}

export async function deleteFromPlan(itemId) {
  try {
    await apiFetch(`plan/${itemId}/`, { method: "DELETE" });
    console.log("✅ Eliminado del plan");
  } catch (err) {
    console.error("❌ Error eliminando del plan:", err);
  }
}

// -------------------------------------------------------------
// 🧾 Ingredientes y unidades
// -------------------------------------------------------------
export async function fetchIngredientes(search = "") {
  try {
    return await apiFetch(`ingredientes/?search=${encodeURIComponent(search)}`);
  } catch (error) {
    console.error("❌ Error cargando ingredientes:", error);
    return [];
  }
}

export async function fetchUnidades() {
  try {
    return await apiFetch("unidades/");
  } catch (error) {
    console.error("❌ Error cargando unidades:", error);
    return [];
  }
}

// -------------------------------------------------------------
// ☁️ Subida de imagen a Cloudinary (ya separada del backend)
// -------------------------------------------------------------
export async function uploadToCloudinary(file) {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", "recetas_app");

  try {
    const res = await fetch("https://api.cloudinary.com/v1_1/daovhj0i4/image/upload", {
      method: "POST",
      body: data,
    });
    const result = await res.json();
    if (!res.ok || !result.secure_url)
      throw new Error("Error subiendo imagen a Cloudinary");
    return result.secure_url;
  } catch (err) {
    console.error("❌ Error en uploadToCloudinary:", err);
    throw err;
  }
}
