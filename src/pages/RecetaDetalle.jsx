import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

export default function RecetaDetalle({ onDelete }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [receta, setReceta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReceta = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/recetas/${id}/`);
        const data = await res.json();
        setReceta(data);
      } catch (error) {
        console.error("Error al cargar receta:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReceta();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F6] text-gray-600">
        Cargando receta...
      </div>
    );
  }

  if (!receta) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF8F6] text-gray-600">
        <p>No se encontró la receta 😢</p>
        <Link
          to="/recetas"
          className="mt-4 text-[#8B5CF6] font-medium hover:underline"
        >
          Volver a la lista
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F6] text-gray-800 font-['Inter']">
      <div className="max-w-3xl mx-auto py-8 px-4">
        {/* Botón volver */}
        <Link
          to="/recetas"
          className="inline-block text-[#8B5CF6] hover:underline mb-4"
        >
          ← Volver a mis recetas
        </Link>

        {/* Imagen */}
        {receta.imagen && (
          <img
            src={receta.imagen}
            alt={receta.nombre}
            className="w-full h-64 object-cover rounded-2xl shadow-sm mb-6"
          />
        )}

        {/* Título y descripción */}
        <h1 className="text-3xl font-semibold mb-2">{receta.nombre}</h1>
        <p className="text-gray-600 mb-4">{receta.descripcion}</p>

        {/* Tiempo */}
        {receta.tiempo_preparacion && (
          <p className="text-sm text-gray-500 mb-6">
            ⏱️ Tiempo de preparación: {receta.tiempo_preparacion} min
          </p>
        )}

        {/* Ingredientes */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-[#8B5CF6] mb-2">
            Ingredientes
          </h2>
          {receta.ingredientes?.length > 0 ? (
            <ul className="list-disc list-inside text-gray-700">
              {receta.ingredientes.map((ing, i) => (
                <li key={i}>
                  {ing.cantidad ? `${ing.cantidad} ` : ""}
                  {ing.unidad ? `${ing.unidad} de ` : ""}
                  {ing.ingrediente?.nombre || "Ingrediente sin nombre"}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No se añadieron ingredientes.</p>
          )}
        </div>

        {/* Instrucciones */}
        <div>
          <h2 className="text-xl font-semibold text-[#8B5CF6] mb-2">
            Instrucciones
          </h2>
          <p className="whitespace-pre-line leading-relaxed text-gray-700">
            {receta.instrucciones || "Sin instrucciones registradas."}
          </p>
        </div>

        {/* 🔧 Botones CRUD */}
        <div className="flex gap-3 mt-6">
          <Link
            to={`/recetas/${receta.id}/editar`}
            className="px-4 py-2 rounded-lg bg-[#8B5CF6] text-white text-sm font-medium hover:bg-[#7C3AED] transition"
          >
            ✏️ Editar
          </Link>
          <button
            onClick={async () => {
              if (confirm("¿Seguro que quieres eliminar esta receta?")) {
                await fetch(`http://127.0.0.1:8000/api/recetas/${receta.id}/`, {
                  method: "DELETE",
                });

                if (onDelete) onDelete();
                alert("✅ Receta eliminada correctamente");
                navigate("/recetas");
              }
            }}
            className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition"
          >
            🗑️ Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
