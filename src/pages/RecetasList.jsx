import { Link } from "react-router-dom";
import { PlusCircleIcon } from "@heroicons/react/24/outline";

export default function RecetasList({ recetas }) {
  if (!recetas || recetas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-24">
        <div className="bg-[#F3E8FF]/50 p-10 rounded-3xl border border-[#E9D5FF] shadow-sm max-w-md">
          <PlusCircleIcon className="h-12 w-12 text-[#8B5CF6] mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-[#8B5CF6] mb-2">
            Aún no tienes recetas guardadas
          </h2>
          <p className="text-gray-600 mb-6">
            Empieza creando tu primera receta y descubre lo fácil que es
            organizar tu cocina 🍳
          </p>
          <Link
            to="/recetas/nueva"
            className="inline-block bg-[#8B5CF6] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#7C3AED] transition"
          >
            Añadir receta
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {recetas.map((receta) => (
        <div
          key={receta.id}
          className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col"
        >
          {receta.imagen ? (
            <img
              src={receta.imagen}
              alt={receta.nombre}
              className="h-48 w-full object-cover"
            />
          ) : (
            <div className="h-48 w-full bg-[#A8BDA8]/20 flex items-center justify-center text-[#A8BDA8]">
              Sin imagen
            </div>
          )}

          <div className="p-4 flex flex-col gap-2 flex-grow">
            <h3 className="font-semibold text-lg">{receta.nombre}</h3>
            <p className="text-sm text-gray-500 line-clamp-2">
              {receta.descripcion}
            </p>
            <p className="text-xs text-gray-400">
              ⏱️ {receta.tiempo_preparacion} min
            </p>

            <Link
              to={`/recetas/${receta.id}`}
              className="mt-auto text-[#8B5CF6] font-medium hover:underline self-start"
            >
              Ver más →
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
