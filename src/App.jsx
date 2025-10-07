import { useState, useEffect, useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import RecetaForm from "./pages/RecetaForm";
import RecetasList from "./pages/RecetasList";
import RecetaDetalle from "./pages/RecetaDetalle";
import PlanSemanal from "./pages/PlanSemanal";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthContext } from "./context/AuthContext";

import {
  HomeIcon,
  BookOpenIcon,
  PlusCircleIcon,
  CalendarIcon,
  ShoppingCartIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

import { API } from "../config";
function AppContent() {
  const [recetas, setRecetas] = useState([]);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { usuario, logout } = useContext(AuthContext);

  // 🔹 Cargar recetas desde el backend
  const fetchRecetas = async () => {
    try {
      const res = await fetch(`${API}/recetas/`, { credentials: "include" });
      if (!res.ok) throw new Error("Error al cargar recetas");
      const data = await res.json();
      setRecetas(data);
    } catch (error) {
      console.error("Error cargando recetas:", error);
    }
  };

  useEffect(() => {
    fetchRecetas();
  }, []);

  // 🔹 Crear receta
  const handleCreate = async (formData) => {
    try {
      const res = await fetch(`${API}/recetas/`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("POST /recetas/ error:", data);
        const msg =
          typeof data === "object" && data
            ? Object.entries(data)
                .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
                .join("\n")
            : "Error al guardar receta";
        alert(`❌ ${msg}`);
        return;
      }

      await fetchRecetas();
      navigate("/recetas");
    } catch (error) {
      console.error("Error al crear receta:", error);
      alert("❌ Error de conexión con el servidor");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F6] text-gray-800 flex flex-col font-['Inter'] pb-20 md:pb-0">
      {/* HEADER */}
      <header className="w-full border-b border-gray-200 bg-[#FAF8F6]/70 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-[#8B5CF6]">
            <Link to="/">Recetas App</Link>
          </h1>

          {/* Menú principal */}
          <nav className="hidden md:flex gap-6 text-sm font-medium items-center">
            {usuario?.logged ? (
              <>
                <Link to="/" className="hover:text-[#8B5CF6] transition-colors">
                  Inicio
                </Link>
                <Link
                  to="/recetas"
                  className="hover:text-[#8B5CF6] transition-colors"
                >
                  Mis recetas
                </Link>
                <Link
                  to="/recetas/nueva"
                  className="hover:text-[#8B5CF6] transition-colors"
                >
                  Nueva receta
                </Link>
                <Link
                  to="/plan-semanal"
                  className="hover:text-[#8B5CF6] transition-colors"
                >
                  Plan semanal
                </Link>
                <Link
                  to="/lista"
                  className="hover:text-[#8B5CF6] transition-colors"
                >
                  Lista
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-1 text-gray-600 hover:text-red-500 transition"
                  title="Cerrar sesión"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-[#8B5CF6]">
                  Iniciar sesión
                </Link>
                <Link to="/registro" className="hover:text-[#8B5CF6]">
                  Registrarse
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* CONTENIDO DE LAS RUTAS */}
      <main className="flex-grow">
        <Routes>
          {/* PÁGINAS DE LOGIN Y REGISTRO */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          {/* RUTAS PRIVADAS */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <section className="text-center mt-12 px-6">
                  <h2 className="text-3xl md:text-4xl font-semibold mb-3 text-gray-800">
                    Tu cocina, organizada a tu ritmo 🍃
                  </h2>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Planifica tus comidas, guarda tus recetas y genera tu lista
                    de la compra en un solo lugar.
                  </p>
                </section>
              </ProtectedRoute>
            }
          />

          <Route
            path="/recetas"
            element={
              <ProtectedRoute>
                <RecetasList recetas={recetas} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/recetas/nueva"
            element={
              <ProtectedRoute>
                <RecetaForm onSubmit={handleCreate} onUpdate={fetchRecetas} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/recetas/:id"
            element={
              <ProtectedRoute>
                <RecetaDetalle onDelete={fetchRecetas} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/recetas/:id/editar"
            element={
              <ProtectedRoute>
                <RecetaForm modo="editar" onUpdate={fetchRecetas} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/plan-semanal"
            element={
              <ProtectedRoute>
                <PlanSemanal />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {/* NAV INFERIOR (solo móvil) */}
      {/* igual que tenías, sin cambios */}
      {/* FOOTER igual */}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
