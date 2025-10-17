import { useState, useEffect } from "react";
import UnitsSelect from "./UnitsSelect";
import IngredienteAutocomplete from "./IngredienteAutocomplete";
import { useNavigate, useLocation } from "react-router-dom";

export default function IngredientesList({ value = [], onChange }) {
  const [ingredientes, setIngredientes] = useState(value);
  const navigate = useNavigate();
  const location = useLocation();

  // sincroniza props -> estado interno
  useEffect(() => {
    setIngredientes(value || []);
  }, [value]);

  // ✅ recoger ingrediente devuelto desde el selector
  useEffect(() => {
    const selected = location.state?.selectedIngredient;
    if (!selected) return;

    const newList = [
      ...ingredientes,
      { cantidad: "", unidad: null, ingrediente: selected },
    ];
    setIngredientes(newList);
    onChange(newList);

    // limpiar el state para evitar repetición en siguientes renders
    navigate(location.pathname, { replace: true, state: null });

    // (opcional) scroll al final para que se vea la nueva fila
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]); // se dispara al volver con state

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

  // 🔗 abrir selector pasando a qué ruta debe volver
  const openSelector = () => {
    navigate("/ingredientes/seleccionar", {
      state: { returnTo: location.pathname },
    });
  };

  return (
    <div className="space-y-4">
      {ingredientes.map((item, index) => (
        <div
          key={index}
          className="flex flex-col md:flex-row gap-2 md:items-center border p-3 rounded-md bg-white shadow-sm"
        >
          {/* Cantidad */}
          <input
            type="number"
            min="0"
            value={item.cantidad ?? ""}
            onChange={(e) => handleChange(index, "cantidad", e.target.value)}
            placeholder="Cantidad"
            className="w-full md:w-24 border rounded-md p-2"
          />

          {/* Unidad */}
          <div className="flex-1">
            <UnitsSelect
              value={item.unidad}
              onChange={(u) => handleChange(index, "unidad", u)}
            />
          </div>

          {/* Ingrediente */}
          <div className="flex-1">
            {item.ingrediente ? (
              <div className="flex items-center justify-between border rounded-md p-2 bg-gray-50">
                <span className="text-gray-700">
                  {item.ingrediente.nombre || "Ingrediente sin nombre"}
                </span>
                <button
                  onClick={() => handleChange(index, "ingrediente", null)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Cambiar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={openSelector}
                className="w-full border border-dashed border-gray-300 rounded-md p-2 text-gray-500 hover:bg-gray-100 transition"
              >
                + Seleccionar ingrediente
              </button>
            )}
          </div>

          {/* Eliminar */}
          <button
            onClick={() => handleRemove(index)}
            className="mt-4 sm:mt-0 bg-red-500 hover:bg-red-600 text-white rounded-lg px-3 py-2 w-full sm:w-auto transition"
          >
            Eliminar
          </button>
        </div>
      ))}

      {/* Añadir nuevo ingrediente → abre el selector visual */}
      <button
        type="button"
        onClick={openSelector}
        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
      >
        + Añadir ingrediente
      </button>
    </div>
  );
}
