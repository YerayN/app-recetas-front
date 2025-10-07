import { useState } from "react";
import UnitsSelect from "./UnitsSelect";
import IngredienteAutocomplete from "./IngredienteAutocomplete";

export default function IngredientesList({ value = [], onChange }) {
  const [ingredientes, setIngredientes] = useState(value);

  const handleAdd = () => {
    const newList = [
      ...ingredientes,
      { cantidad: "", unidad: null, ingrediente: null },
    ];
    setIngredientes(newList);
    onChange(newList);
  };

  const handleRemove = (index) => {
    const newList = ingredientes.filter((_, i) => i !== index);
    setIngredientes(newList);
    onChange(newList);
  };

  const handleChange = (index, key, newValue) => {
    const newList = ingredientes.map((item, i) =>
      i === index ? { ...item, [key]: newValue } : item
    );
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
            value={item.cantidad}
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
            <IngredienteAutocomplete
              value={item.ingrediente}
              onChange={(i) => handleChange(index, "ingrediente", i)}
            />
          </div>

          <button
            onClick={() => handleRemove(index)}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Eliminar
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={handleAdd}
        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
      >
        + Añadir ingrediente
      </button>
    </div>
  );
}
