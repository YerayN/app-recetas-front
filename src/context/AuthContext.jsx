import { createContext, useState, useEffect } from "react";
import { apiFetch, getCsrfToken } from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔹 Al iniciar la app:
    // 1. Obtener el token CSRF primero
    // 2. Esperar confirmación antes de verificar sesión
    const initAuth = async () => {
      try {
        // 1️⃣ Obtener token CSRF y esperar a que se guarde la cookie
        await getCsrfToken();
        await new Promise((r) => setTimeout(r, 200)); // pequeña pausa para asegurar cookie

        // 2️⃣ Verificar sesión (requiere SessionAuthentication)
        const data = await apiFetch("recetas/");
        if (data) {
          setUsuario({ logged: true });
        } else {
          setUsuario(null);
        }
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
      // 1️⃣ Siempre renovar token CSRF antes del login
      await getCsrfToken(true);

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
      setUsuario(null);
    }
  };

  // 🔹 Mostrar loading mientras se inicializa todo
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Cargando sesión...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
