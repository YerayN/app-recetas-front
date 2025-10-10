import RecetaMiniCard from "./RecetaMiniCard";

export default function ComidaSeccion({
  dia,
  tipo,
  icono,
  nombre,
  recetas,
  onAdd,
  onRemove,
  onAdjust, // 👈 añadimos
}) {
  return (
    <div className="border rounded-xl p-2">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-700">
          {icono} {nombre}
        </h3>
        <button
          onClick={() => onAdd(dia, tipo, null)}
          className="text-[#8B5CF6] text-sm font-medium hover:underline"
        >
          + Añadir
        </button>
      </div>

      <div className="flex flex-col gap-1">
        {recetas.length > 0 ? (
          recetas.map((receta, i) => (
            <div key={i}>
              <RecetaMiniCard
                receta={receta}
                onRemove={() => onRemove(dia, tipo, i)}
              />

              <div className="flex justify-between items-center text-xs text-gray-500 mt-1 mb-2 px-1">
                <span>👥 {receta.comensales || 2} comensales</span>
                <button
                  onClick={() => onAdjust && onAdjust(dia, tipo, receta)}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-md px-2 py-1 text-xs transition"
                >
                  Serán más comensales?
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-gray-400 italic text-center">— vacío —</p>
        )}
      </div>
    </div>
  );
}
