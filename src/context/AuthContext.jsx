import { createContext, useState, useEffect } from "react";
import { apiFetch, getCsrfToken } from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Al iniciar la app:
    // 1. Obtener el token CSRF primero
    // 2. Verificar si hay sesión activa
    const initAuth = async () => {
      try {
        // Paso 1: Obtener token CSRF
        await getCsrfToken();
        
        // Paso 2: Verificar sesión (requiere SessionAuthentication)
        await apiFetch("recetas/");
        setUsuario({ logged: true });
      } catch (error) {
        console.log("No hay sesión activa");
        setUsuario(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    try {
      // apiFetch manejará automáticamente el token CSRF
      // y lo actualizará después del login exitoso
      await apiFetch("login/", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      
      setUsuario({ logged: true, username });
      return true;
    } catch (error) {
      console.error("Error en login:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await apiFetch("logout/", { method: "POST" });
      setUsuario(null);
    } catch (error) {
      console.error("Error en logout:", error);
      // Aunque falle, limpiamos la sesión local
      setUsuario(null);
    }
  };

  // Mostrar loading mientras verificamos la sesión
  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}