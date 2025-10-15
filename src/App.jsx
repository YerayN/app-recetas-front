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
import ListaCompra from "./pages/ListaCompra";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthContext } from "./context/AuthContext";
import logo from "./assets/logo.png";

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
          <Link to="/" className="flex items-center">
            <img src={logo} alt="RecetasApp" className="h-12 object-contain" />
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
                <section className="py-16 text-center relative overflow-hidden">
                  {/* Fondo decorativo */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#FAF8F6] via-white to-[#F3E8FF] opacity-70 -z-10"></div>

                  {/* Encabezado */}
                  <h1 className="text-5xl font-extrabold text-[#8B5CF6] mb-4">
                    ¡Bienvenido a <span className="text-[#7C3AED]">La Despensa</span>!
                  </h1>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
                    Organiza tus recetas, planifica tu semana y genera tu lista de la compra en un solo lugar.
                  </p>

                  {/* Tarjetas de acceso rápido */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto px-6">
                    {[
                      {
                        title: "Tus Recetas",
                        icon: <BookOpenIcon className="h-10 w-10 text-[#8B5CF6]" />,
                        desc: "Consulta, edita o elimina tus recetas favoritas.",
                        link: "/recetas",
                      },
                      {
                        title: "Añadir Receta",
                        icon: <PlusCircleIcon className="h-10 w-10 text-[#8B5CF6]" />,
                        desc: "Guarda nuevas ideas de cocina fácilmente.",
                        link: "/recetas/nueva",
                      },
                      {
                        title: "Plan Semanal",
                        icon: <CalendarIcon className="h-10 w-10 text-[#8B5CF6]" />,
                        desc: "Organiza tus comidas por días y horarios.",
                        link: "/plan-semanal",
                      },
                      {
                        title: "Lista de la Compra",
                        icon: <ShoppingCartIcon className="h-10 w-10 text-[#8B5CF6]" />,
                        desc: "Genera automáticamente tu lista de ingredientes.",
                        link: "/lista-compra",
                      },
                    ].map(({ title, icon, desc, link }, i) => (
                      <Link
                        key={i}
                        to={link}
                        className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition transform hover:-translate-y-1 border border-gray-100"
                      >
                        <div className="flex flex-col items-center space-y-3">
                          {icon}
                          <h3 className="font-semibold text-gray-800 text-lg">{title}</h3>
                          <p className="text-gray-500 text-sm">{desc}</p>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Frase motivadora */}
                  <p className="mt-16 text-gray-500 italic">
                    “Una buena comida empieza con una buena organización 🍳”
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
                <ListaCompra />
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
