export default function RecetaMiniCard({ receta, onRemove }) {
  return (
    <div className="bg-[#F3F0FF] rounded-xl p-2 shadow-sm flex justify-between items-center">
      <p className="text-sm font-medium text-[#8B5CF6] truncate">
        {receta?.nombre || "Receta sin nombre"}
      </p>
      <button
        onClick={onRemove}
        className="text-gray-400 hover:text-red-500 text-sm ml-2"
        aria-label="Eliminar receta"
      >
        ✕
      </button>
    </div>
  );
}
