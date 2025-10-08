import { createContext, useState, useEffect } from "react";
import { apiFetch } from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    apiFetch("recetas/")
      .then(() => setUsuario({ logged: true }))
      .catch(() => setUsuario(null));
  }, []);

  const login = async (username, password) => {
    try {
      await apiFetch("login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      setUsuario({ logged: true, username });
      return true;
    } catch {
      return false;
    }
  };


  const logout = async () => {
    await apiFetch("logout/", { method: "POST" });
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
