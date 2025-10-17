// src/pages/SelectorIngredientes.jsx
import { useState, useEffect, useMemo } from "react";
import { fetchIngredientes } from "../services/api";

// 🔹 Etiquetas legibles
const CATEGORIA_LABEL = {
  frutas_verduras: "Frutas y verduras",
  carnes_charcuteria: "Carnes y charcutería",
  pescados_marisco: "Pescados y marisco",
  aceites_especias_salsas: "Aceites, especias y salsas",
  arroz_legumbres_pasta: "Arroz, legumbres y pasta",
  dulces: "Dulces",
  snacks: "Snacks y frutos secos",
  panaderia: "Panadería",
  lacteos: "Lácteos",
  bebidas: "Bebidas",
  congelados: "Congelados",
  desayunos_cereales: "Desayunos y cereales",
  conservas_caldos: "Conservas y caldos",
  otros: "Otros",
};

// 🔸 Iconos por categoría (Font Awesome)
const CATEGORIA_ICONO = {
  frutas_verduras: "fa-solid fa-apple-whole",
  carnes_charcuteria: "fa-solid fa-drumstick-bite",
  pescados_marisco: "fa-solid fa-fish",
  aceites_especias_salsas: "fa-solid fa-bottle-droplet",
  arroz_legumbres_pasta: "fa-solid fa-bowl-rice",
  dulces: "fa-solid fa-candy-cane",
  snacks: "fa-solid fa-cookie-bite",
  panaderia: "fa-solid fa-bread-slice",
  lacteos: "fa-solid fa-cheese",
  bebidas: "fa-solid fa-mug-saucer",
  congelados: "fa-solid fa-snowflake",
  desayunos_cereales: "fa-solid fa-seedling",
  conservas_caldos: "fa-solid fa-jar",
  otros: "fa-solid fa-box",
};

export default function SelectorIngredientes({ onSelect }) {
  const [ingredientes, setIngredientes] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchIngredientes("")
      .then((data) => setIngredientes(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error cargando ingredientes:", err));
  }, []);

  const categorias = useMemo(() => {
    return ingredientes.reduce((acc, ing) => {
      const key = ing.categoria || "otros";
      const label = CATEGORIA_LABEL[key] || "Otros";
      if (!acc[label]) acc[label] = [];
      acc[label].push(ing);
      return acc;
    }, {});
  }, [ingredientes]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return ingredientes.filter((i) => i.nombre.toLowerCase().includes(q));
  }, [ingredientes, search]);

  const iconoCategoria = (categoria) =>
    CATEGORIA_ICONO[categoria] || CATEGORIA_ICONO.otros;

  return (
    <div>
      <div className="sticky top-0 bg-white pb-3 z-10">
        <input
          type="text"
          placeholder="Buscar ingrediente…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-full p-3 pl-4 focus:ring-2 focus:ring-[#8B5CF6]"
        />
      </div>

      {search ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-4">
          {filtered.map((ing) => (
            <button
              key={ing.id}
              onClick={() => onSelect(ing)}
              className="flex flex-col items-center text-center bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition"
            >
              <i
                className={`${iconoCategoria(
                  ing.categoria
                )} text-3xl text-[#8B5CF6] mb-2`}
              ></i>
              <span className="text-sm text-gray-700">{ing.nombre}</span>
            </button>
          ))}
        </div>
      ) : (
        Object.entries(categorias).map(([label, items]) => (
          <div key={label} className="mt-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">{label}</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {items.map((ing) => (
                <button
                  key={ing.id}
                  onClick={() => onSelect(ing)}
                  className="flex flex-col items-center text-center bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition"
                >
                  <i
                    className={`${iconoCategoria(
                      ing.categoria
                    )} text-3xl text-[#8B5CF6] mb-2`}
                  ></i>
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
