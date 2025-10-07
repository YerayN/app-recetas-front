import { Link } from "react-router-dom";

export default function RecetasList({ recetas }) {
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

            {/* ✅ Enlace funcional */}
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
