import { useState, useEffect } from "react";
import UnitsSelect from "./UnitsSelect";

export default function IngredientesList({ value = [], onChange, onOpenSelector }) {
  const [ingredientes, setIngredientes] = useState(value);

  useEffect(() => setIngredientes(value || []), [value]);

  const handleChange = (index, key, newValue) => {
    const newList = ingredientes.map((item, i) =>
      i === index ? { ...item, [key]: newValue } : item
    );
    setIngredientes(newList);
    onChange(newList);
  };

  const handleRemove = (index) => {
    const newList = ingredientes.filter((_, i) => i !== index);
    setIngredientes(newList);
    onChange(newList);
  };

  return (
    <div className="space-y-4">
      {ingredientes.map((item, index) => (
        <div
          key={index}
          className="flex flex-col md:flex-row gap-2 md:items-center border p-3 rounded-md bg-white shadow-sm"
        >
          <input
            type="number"
            min="0"
            value={item.cantidad ?? ""}
            onChange={(e) => handleChange(index, "cantidad", e.target.value)}
            placeholder="Cantidad"
            className="w-full md:w-24 border rounded-md p-2"
          />

          <div className="flex-1">
            <UnitsSelect
              value={item.unidad}
              onChange={(u) => handleChange(index, "unidad", u)}
            />
          </div>

          <div className="flex-1">
            {item.ingrediente ? (
              <div className="flex items-center justify-between border rounded-md p-2 bg-gray-50">
                <span className="text-gray-700">
                  {item.ingrediente.nombre || "Ingrediente sin nombre"}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenSelector(index)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    Cambiar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onOpenSelector(index)}
                className="w-full border border-dashed border-gray-300 rounded-md p-2 text-gray-500 hover:bg-gray-100 transition"
              >
                + Seleccionar ingrediente
              </button>
            )}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onOpenSelector(null)}
        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
      >
        + Añadir ingrediente
      </button>
    </div>
  );
}
