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

// ✅ Importar la nueva función para obtener el token CSRF
import { apiFetch, getCsrfToken } from "./services/api";

function AppContent() {
  const [recetas, setRecetas] = useState([]);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { usuario, logout } = useContext(AuthContext);

  // 🔹 Cargar recetas desde el backend
  const fetchRecetas = async () => {
    try {
      // Esta llamada GET debería funcionar ahora gracias a SessionAuthentication en settings.py
      const data = await apiFetch("recetas/");
      setRecetas(data);
    } catch (error) {
      console.error("Error cargando recetas:", error);
    }
  };

  const handleCreate = () => {
    // Después de crear, solo recargamos la lista
    fetchRecetas();
  };

  // 💡 Llamada para inicializar la obtención del CSRF Token
  useEffect(() => {
    // 1. Obtener el token CSRF tan pronto como la aplicación cargue
    getCsrfToken();
    
    // 2. Cargar las recetas (se ejecutará al inicio y después del login)
    fetchRecetas();

  }, [usuario]); // Esto asegura que la autenticación y la carga inicial sucedan al montar/después del login


  // ... (resto de tu componente AppContent sin cambios)
  const isAuthPage = pathname.includes("/login") || pathname.includes("/registro");
  const isProtected = !isAuthPage && usuario;

  return (
    <div className="min-h-screen bg-[#FAF8F6]">
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-[#8B5CF6]">
            RecetasApp
          </Link>
          {isProtected && (
            <div className="flex space-x-4">
              <Link to="/plan-semanal" className="text-gray-600 hover:text-[#8B5CF6] transition">
                <CalendarIcon className="h-6 w-6" />
              </Link>
              <Link to="/recetas" className="text-gray-600 hover:text-[#8B5CF6] transition">
                <BookOpenIcon className="h-6 w-6" />
              </Link>
              <Link to="/recetas/nueva" className="text-gray-600 hover:text-[#8B5CF6] transition">
                <PlusCircleIcon className="h-6 w-6" />
              </Link>
              {/* <Link to="/lista-compra" className="text-gray-600 hover:text-[#8B5CF6] transition">
                <ShoppingCartIcon className="h-6 w-6" />
              </Link> */}
              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="text-gray-600 hover:text-red-500 transition"
              >
                <ArrowRightOnRectangleIcon className="h-6 w-6" />
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
                    Tu gestor de recetas y planificador semanal. Organiza tus recetas y genera tu lista
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