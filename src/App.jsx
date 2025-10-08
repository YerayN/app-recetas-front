import { useState, useEffect, useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
  Navigate,
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

// 🔹 Inicialización segura: obtener CSRF y cargar recetas si hay sesión
useEffect(() => {
  const init = async () => {
    // Asegura que el token CSRF y la cookie se sincronicen
    await getCsrfToken();
    if (usuario) await fetchRecetas();
  };
  init();
}, [usuario]);


// 🔹 Redirección automática según sesión (solo cuando AuthContext terminó de cargar)
const [authLoaded, setAuthLoaded] = useState(false);

useEffect(() => {
  // este timeout da margen a AuthContext a resolver la sesión
  const timer = setTimeout(() => setAuthLoaded(true), 200);
  return () => clearTimeout(timer);
}, []);

useEffect(() => {
  if (!authLoaded) return; // ⛔ espera a que AuthContext esté listo

  if (usuario && (pathname === "/login" || pathname === "/registro")) {
    navigate("/"); // logueado → home
  } else if (!usuario && pathname !== "/login" && pathname !== "/registro") {
    navigate("/login"); // no logueado → login
  }
}, [usuario, pathname, navigate, authLoaded]);

const isProtected = usuario;

  return (
    <div className="min-h-screen bg-[#FAF8F6] pb-20 md:pb-0">
      {/* --- Header escritorio --- */}
      <header className="hidden md:block bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-[#8B5CF6]">
            RecetasApp
          </Link>

          {isProtected && (
            <div className="flex space-x-8 text-[15px] font-medium text-gray-600">
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
                  pathname.startsWith("/recetas") &&
                  !pathname.includes("nueva")
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
                    Tu gestor de recetas y planificador semanal. Organiza tus
                    recetas y genera tu lista de la compra en un solo lugar.
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
                <RecetaForm onUpdate={fetchRecetas} />
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

          {/* 🔹 cualquier ruta desconocida → home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* --- Bottom Nav móvil --- */}
      {isProtected && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md flex justify-around items-center py-3 z-50">
          {[
            { to: "/", icon: HomeIcon },
            { to: "/recetas", icon: BookOpenIcon },
            { to: "/recetas/nueva", icon: PlusCircleIcon },
            { to: "/plan-semanal", icon: CalendarIcon },
            { to: "/lista-compra", icon: ShoppingCartIcon },
          ].map(({ to, icon: Icon }, i) => (
            <Link
              key={i}
              to={to}
              className={`flex flex-col items-center relative ${
                pathname === to ? "text-[#8B5CF6]" : "text-gray-500"
              }`}
            >
              <Icon
                className={`${
                  to === "/recetas/nueva" ? "h-9 w-9" : "h-7 w-7"
                } transition-colors`}
              />
              {pathname === to && (
                <span className="absolute bottom-[-8px] w-1.5 h-1.5 bg-[#8B5CF6] rounded-full transition-transform duration-300 scale-100"></span>
              )}
            </Link>
          ))}
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
