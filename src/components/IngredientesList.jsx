import { useState, useEffect } from "react";
import UnitsSelect from "./UnitsSelect";
import IngredienteAutocomplete from "./IngredienteAutocomplete";
import { useNavigate, useLocation } from "react-router-dom";

export default function IngredientesList({ value = [], onChange }) {
  const [ingredientes, setIngredientes] = useState(value);
  const navigate = useNavigate();
  const location = useLocation();

  // 🔹 Sincronizar prop -> estado local
  useEffect(() => {
    setIngredientes(value || []);
  }, [value]);

  useEffect(() => {
    const selectedList = location.state?.selectedList;
    if (!selectedList) return;

    setIngredientes(selectedList);
    onChange(selectedList);

    setTimeout(() => {
      navigate(location.pathname, { replace: true, state: null });
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 100);
  }, [location.state, navigate, location.pathname, onChange]);




  // 🔹 Eliminar ingrediente
  const handleRemove = (index) => {
    setIngredientes((prev) => {
      const newList = prev.filter((_, i) => i !== index);
      onChange(newList);
      return newList;
    });
  };

  // 🔹 Cambiar valor de cantidad/unidad/ingrediente
  const handleChange = (index, key, newValue) => {
    setIngredientes((prev) => {
      const newList = prev.map((item, i) =>
        i === index ? { ...item, [key]: newValue } : item
      );
      onChange(newList);
      return newList;
    });
  };

  // 🔹 Abrir selector y pasar a qué ruta debe volver
  const openSelector = () => {
    navigate("/ingredientes/seleccionar", {
      state: { returnTo: location.pathname, currentList: ingredientes },
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

      {/* Botón principal → abre el selector visual */}
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
