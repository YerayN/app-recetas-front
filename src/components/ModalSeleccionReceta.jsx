import { useState } from "react";

export default function ModalSeleccionReceta({ recetas, onSelect, onClose }) {
  const [busqueda, setBusqueda] = useState("");

  const recetasFiltradas = recetas.filter((r) =>
    r.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center border-b px-4 py-3">
          <h2 className="text-lg font-semibold text-[#8B5CF6]">Seleccionar receta</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg"
          >
            ✕
          </button>
        </div>

        {/* Buscador */}
        <div className="p-3 border-b">
          <input
            type="text"
            placeholder="Buscar receta..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
          />
        </div>

        {/* Lista de recetas */}
        <div className="overflow-y-auto flex-1 p-3 space-y-2">
          {recetasFiltradas.length > 0 ? (
            recetasFiltradas.map((receta) => (
              <button
                key={receta.id}
                onClick={() => onSelect(receta)}
                className="w-full text-left bg-[#F9F8FF] hover:bg-[#F3F0FF] border border-[#E6E1FF] rounded-xl p-3 transition"
              >
                <p className="text-sm font-medium text-gray-700">
                  {receta.nombre}
                </p>
                <p className="text-xs text-gray-400">
                  {receta.tiempo_preparacion} min
                </p>
              </button>
            ))
          ) : (
            <p className="text-center text-gray-400 text-sm py-4">
              No se encontraron recetas.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
