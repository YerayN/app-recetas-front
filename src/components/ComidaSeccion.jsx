import RecetaMiniCard from "./RecetaMiniCard";

export default function ComidaSeccion({ dia, tipo, icono, nombre, recetas, onAdd, onRemove }) {
  return (
    <div className="border rounded-xl p-2">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-700">
          {icono} {nombre}
        </h3>
        <button
          onClick={() => onAdd(dia, tipo, null)} // abriremos el modal aquí luego
          className="text-[#8B5CF6] text-sm font-medium hover:underline"
        >
          + Añadir
        </button>
      </div>

      <div className="flex flex-col gap-1">
        {recetas.length > 0 ? (
          recetas.map((receta, i) => (
            <RecetaMiniCard
              key={i}
              receta={receta}
              onRemove={() => onRemove(dia, tipo, i)}
            />
          ))
        ) : (
          <p className="text-xs text-gray-400 italic text-center">— vacío —</p>
        )}
      </div>
    </div>
  );
}
