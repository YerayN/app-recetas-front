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
      body: JSON.stringify({ username, password }),
    });
    
    setUsuario({ logged: true, username });
    return true;
  } catch (error) {
    console.error("❌ Error en login:", error);
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