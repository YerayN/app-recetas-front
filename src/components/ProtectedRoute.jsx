import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { usuario } = useContext(AuthContext);

  // Si aún no se ha determinado el estado, evita parpadeos
  if (usuario === null) return null;

  // Si no hay sesión activa, redirige a login
  if (!usuario?.logged) return <Navigate to="/login" replace />;

  // Si hay sesión, renderiza el contenido
  return children;
}
