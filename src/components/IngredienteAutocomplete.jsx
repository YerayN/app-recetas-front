import { useState, useEffect, useRef } from "react";
import { fetchIngredientes } from "../services/api";

export default function IngredienteAutocomplete({ value, onChange }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  // 🔹 Cerrar lista si se hace clic fuera (ideal para móvil)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔹 Buscar ingredientes con debounce
  useEffect(() => {
    const delay = setTimeout(() => {
      if (search.length > 1) {
        setLoading(true);
        fetchIngredientes(search)
          .then((data) => {
            setResults(data);
            setShowDropdown(true);
          })
          .finally(() => setLoading(false));
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [search]);

  const handleSelect = (ingrediente) => {
    onChange(ingrediente);
    setSearch(ingrediente.nombre);
    setShowDropdown(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={() => search.length > 1 && setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)} // 🔹 Cierra al perder foco
        placeholder="Buscar ingrediente..."
        className="w-full border rounded-md p-2 focus:ring-2 focus:ring-orange-400"
      />

      {loading && (
        <div className="absolute right-2 top-2 text-gray-400 text-sm">...</div>
      )}

      {showDropdown && results.length > 0 && (
        <ul className="absolute z-10 bg-white border rounded-md shadow-md w-full mt-1 max-h-40 overflow-y-auto">
          {results.map((item) => (
            <li
              key={item.id}
              onMouseDown={() => handleSelect(item)} // 🔹 Usar onMouseDown evita que se cierre antes del click
              className="px-3 py-1 hover:bg-orange-100 cursor-pointer"
            >
              {item.nombre}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
