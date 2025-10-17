// src/pages/SelectorIngredientes.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchIngredientes } from "../services/api";

export default function SelectorIngredientes() {
  const [ingredientes, setIngredientes] = useState([]);
  const [categorias, setCategorias] = useState({});
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  // 🔹 Cargar ingredientes desde la API
  useEffect(() => {
    fetchIngredientes("")
      .then((data) => {
        setIngredientes(data);
        // Agrupar por categoría
        const grouped = data.reduce((acc, ing) => {
          const cat = ing.categoria?.nombre || "Otros";
          acc[cat] = acc[cat] ? [...acc[cat], ing] : [ing];
          return acc;
        }, {});
        setCategorias(grouped);
      })
      .catch((err) => console.error("Error cargando ingredientes:", err));
  }, []);

  const handleSelect = (ing) => {
    navigate(-1, { state: { selectedIngredient: ing } });
  };

  const filtered = ingredientes.filter((i) =>
    i.nombre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FAF8F6] p-4">
      {/* 🔍 Buscador */}
      <div className="sticky top-0 bg-[#FAF8F6] pb-3 z-10">
        <input
          type="text"
          placeholder="Buscar ingrediente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-full p-3 pl-4 focus:ring-2 focus:ring-[#8B5CF6]"
        />
      </div>

      {/* 📦 Listado */}
      {search ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-4">
          {filtered.map((ing) => (
            <button
              key={ing.id}
              onClick={() => handleSelect(ing)}
              className="flex flex-col items-center text-center bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition"
            >
              <img
                src={ing.icono || "/placeholder.png"}
                alt={ing.nombre}
                className="w-12 h-12 object-contain mb-2"
              />
              <span className="text-sm text-gray-700">{ing.nombre}</span>
            </button>
          ))}
        </div>
      ) : (
        Object.entries(categorias).map(([cat, items]) => (
          <div key={cat} className="mt-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">{cat}</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {items.map((ing) => (
                <button
                  key={ing.id}
                  onClick={() => handleSelect(ing)}
                  className="flex flex-col items-center text-center bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition"
                >
                  <img
                    src={ing.icono || "/placeholder.png"}
                    alt={ing.nombre}
                    className="w-12 h-12 object-contain mb-2"
                  />
                  <span className="text-sm text-gray-700">{ing.nombre}</span>
                </button>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
