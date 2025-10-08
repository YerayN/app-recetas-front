import { createContext, useState, useEffect } from "react";
import { apiFetch } from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    // Intenta verificar la sesión (requiere SessionAuthentication en settings.py)
    apiFetch("recetas/")
      .then(() => setUsuario({ logged: true }))
      .catch(() => setUsuario(null));
  }, []);

  const login = async (username, password) => {
    try {
      await apiFetch("login/", {
        method: "POST",
        // ✅ ELIMINAR O SIMPLIFICAR EL OBJETO HEADERS
        // NO LO PASES si solo quieres Content-Type, ya que apiFetch lo añade por defecto
        // y necesitamos que apiFetch maneje el header X-CSRFToken.
        // headers: { "Content-Type": "application/json" }, ❌ ELIMINAR ESTO
        body: JSON.stringify({ username, password }),
      });
      
      // Si el login fue exitoso, el servidor ha devuelto la cookie de sesión
      setUsuario({ logged: true, username });
      return true;
    } catch {
      return false;
    }
  };


  const logout = async () => {
    // La petición POST de logout también requiere el token CSRF
    await apiFetch("logout/", { method: "POST" });
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}