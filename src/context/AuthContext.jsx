import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

import { API } from "../config";
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);

  // Comprobar sesión activa
  useEffect(() => {
    fetch(`${API}/recetas/`, { credentials: "include" })
      .then(res => {
        if (res.ok) setUsuario({ logged: true });
        else setUsuario(null);
      })
      .catch(() => setUsuario(null));
  }, []);

  const login = async (username, password) => {
    const res = await fetch(`${API}/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });
    if (res.ok) {
      setUsuario({ logged: true, username });
      return true;
    }
    return false;
  };

  const logout = async () => {
    await fetch(`${API}/logout/`, {
      method: "POST",
      credentials: "include",
    });
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
