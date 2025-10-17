import { useState, useEffect } from "react";
import UnitsSelect from "./UnitsSelect";
import { useNavigate, useLocation } from "react-router-dom";

export default function IngredientesList({ value = [], onChange }) {
  const [ingredientes, setIngredientes] = useState(value);
  const navigate = useNavigate();
  const location = useLocation();

  // 🔄 Mantén sincronizado el estado interno con la prop del padre
  useEffect(() => {
    setIngredientes(value || []);
  }, [value]);

  // 🔎 Al volver del selector: aplicar acción sobre el estado ACTUAL (no snapshot)

  useEffect(() => {
    const st = location.state || {};
    const selectedList = st.selectedList;
    const selectedIngredient = st.selectedIngredient;
    const replaceIndex =
      typeof st.replaceIndex === "number" ? st.replaceIndex : null;

    // 🔹 Caso preferido: viene la lista completa creada en el selector
    if (Array.isArray(selectedList)) {
      setIngredientes(selectedList);
      onChange(selectedList);
      // ❗️NO limpies el state aquí: deja que lo limpie RecetaForm para evitar condiciones de carrera
      return;
    }

    // 🔹 Compatibilidad: por si viniera solo el ingrediente
    if (selectedIngredient) {
      setIngredientes((prev) => {
        const newList = [...prev];
        if (
          replaceIndex !== null &&
          replaceIndex >= 0 &&
          replaceIndex < newList.length
        ) {
          const prevItem = newList[replaceIndex] || {};
          newList[replaceIndex] = { ...prevItem, ingrediente: selectedIngredient };
        } else {
          newList.push({ cantidad: "", unidad: null, ingrediente: selectedIngredient });
        }
        onChange(newList);
        return newList;
      });
      return;
    }
  }, [location.state, onChange]);


  // 🚪 Abrir selector: si pasas índice → modo "reemplazar"; si no → "añadir"
  const openSelector = (replaceIndex = null) => {
    navigate("/ingredientes/seleccionar", {
      state: {
        returnTo: location.pathname,
        ingredientesActuales: ingredientes,  // 👈 pasa lista actual
        replaceIndex,
      },
    });
  };


  const handleRemove = (index) => {
    setIngredientes((prev) => {
      const newList = prev.filter((_, i) => i !== index);
      onChange(newList);
      return newList;
    });
  };

  const handleChange = (index, key, newValue) => {
    setIngredientes((prev) => {
      const newList = prev.map((item, i) =>
        i === index ? { ...item, [key]: newValue } : item
      );
      onChange(newList);
      return newList;
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
                <div className="flex gap-2">
                  {/* 🔁 Cambiar → abre selector en modo REEMPLAZO */}
                  <button
                    type="button"
                    onClick={() => openSelector(index)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    Cambiar
                  </button>
                  {/* ❌ Quitar fila */}
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
              // Si por lo que sea hubiera una fila sin ingrediente, permite seleccionarlo
              <button
                type="button"
                onClick={() => openSelector(index)}
                className="w-full border border-dashed border-gray-300 rounded-md p-2 text-gray-500 hover:bg-gray-100 transition"
              >
                + Seleccionar ingrediente
              </button>
            )}
          </div>
        </div>
      ))}

      {/* ➕ Añadir nueva fila */}
      <button
        type="button"
        onClick={() => openSelector(null)}
        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
      >
        + Añadir ingrediente
      </button>
    </div>
  );
}
