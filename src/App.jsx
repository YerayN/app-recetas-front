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

import { apiFetch, getCsrfToken } from "./services/api";

function AppContent() {
  const [recetas, setRecetas] = useState([]);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { usuario, logout } = useContext(AuthContext);

  const fetchRecetas = async () => {
    try {
      const data = await apiFetch("recetas/");
      setRecetas(data);
    } catch (error) {
      console.error("Error cargando recetas:", error);
    }
  };

  const handleCreate = () => {
    fetchRecetas();
  };

  useEffect(() => {
    getCsrfToken();
    fetchRecetas();
  }, [usuario]);

  const isAuthPage = pathname.includes("/login") || pathname.includes("/registro");
  const isProtected = !isAuthPage && usuario;

  // Función para detectar ruta activa en móvil
  const isActive = (path) =>
    pathname === path ? "text-[#8B5CF6]" : "text-gray-500";

  return (
    <div className="min-h-screen bg-[#FAF8F6] pb-16 md:pb-0">
      {/* --- Header (solo en escritorio) --- */}
      <header className="hidden md:block bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-[#8B5CF6]">
            RecetasApp
          </Link>
          {isProtected && (
            <div className="flex space-x-6 text-sm font-medium text-gray-600">
              <Link
                to="/"
                className={`hover:text-[#8B5CF6] transition ${
                  pathname === "/" ? "text-[#8B5CF6]" : ""
                }`}
              >
                Inicio
              </Link>
              <Link
                to="/recetas"
                className={`hover:text-[#8B5CF6] transition ${
                  pathname.startsWith("/recetas") && !pathname.includes("nueva")
                    ? "text-[#8B5CF6]"
                    : ""
                }`}
              >
                Recetas
              </Link>
              <Link
                to="/recetas/nueva"
                className={`hover:text-[#8B5CF6] transition ${
                  pathname.includes("/nueva") ? "text-[#8B5CF6]" : ""
                }`}
              >
                Añadir receta
              </Link>
              <Link
                to="/plan-semanal"
                className={`hover:text-[#8B5CF6] transition ${
                  pathname.includes("/plan-semanal") ? "text-[#8B5CF6]" : ""
                }`}
              >
                Plan semanal
              </Link>
              <Link
                to="/lista-compra"
                className={`hover:text-[#8B5CF6] transition ${
                  pathname.includes("/lista-compra") ? "text-[#8B5CF6]" : ""
                }`}
              >
                Lista
              </Link>

              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="text-gray-600 hover:text-red-500 transition ml-4"
                title="Cerrar sesión"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 inline-block" />
              </button>
            </div>
          )}
          {!usuario && !isAuthPage && (
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg bg-[#8B5CF6] text-white text-sm font-medium hover:bg-[#7C3AED] transition"
            >
              Iniciar Sesión
            </Link>
          )}
        </nav>
      </header>

      {/* --- Main --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <section className="text-center py-20">
                  <h1 className="text-4xl font-extrabold text-[#8B5CF6] mb-4">
                    Bienvenido a RecetasApp
                  </h1>
                  <p className="text-lg text-gray-600">
                    Tu gestor de recetas y planificador semanal. Organiza tus recetas y genera tu lista de la compra en un solo lugar.
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

          <Route
            path="/lista-compra"
            element={
              <ProtectedRoute>
                <div className="text-center py-10 text-gray-600">
                  Aquí irá tu lista de la compra 🛒
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {/* --- Bottom Nav (solo móvil) --- */}
      {isProtected && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md flex justify-around py-2 z-50">
          <Link to="/" className={`flex flex-col items-center ${isActive("/")}`}>
            <HomeIcon className="h-6 w-6" />
          </Link>
          <Link
            to="/recetas"
            className={`flex flex-col items-center ${isActive("/recetas")}`}
          >
            <BookOpenIcon className="h-6 w-6" />
          </Link>
          <Link
            to="/recetas/nueva"
            className={`flex flex-col items-center ${isActive("/recetas/nueva")}`}
          >
            <PlusCircleIcon className="h-7 w-7" />
          </Link>
          <Link
            to="/plan-semanal"
            className={`flex flex-col items-center ${isActive("/plan-semanal")}`}
          >
            <CalendarIcon className="h-6 w-6" />
          </Link>
          <Link
            to="/lista-compra"
            className={`flex flex-col items-center ${isActive("/lista-compra")}`}
          >
            <ShoppingCartIcon className="h-6 w-6" />
          </Link>
        </nav>
      )}
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
