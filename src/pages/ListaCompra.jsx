// src/pages/ListaCompra.jsx
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../services/api";

const LS_KEY = "lista-compra:checked:v1";

function useCheckedState() {
  const [checked, setChecked] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(checked));
  }, [checked]);

  const toggle = (categoriaKey, itemKey) => {
    setChecked((prev) => {
      const cat = prev[categoriaKey] || {};
      return { ...prev, [categoriaKey]: { ...cat, [itemKey]: !cat[itemKey] } };
    });
  };

  const setAll = (categoriaKey, itemKeys, value) => {
    setChecked((prev) => {
      const nextCat = { ...(prev[categoriaKey] || {}) };
      itemKeys.forEach((k) => (nextCat[k] = value));
      return { ...prev, [categoriaKey]: nextCat };
    });
  };

  const isChecked = (categoriaKey, itemKey) =>
    Boolean(checked?.[categoriaKey]?.[itemKey]);

  return { checked, toggle, setAll, isChecked };
}

function formatCantidad(n) {
  if (n == null) return "";
  // Redondeo “agradable”: enteros o 2 decimales máximo
  const rounded = Math.round(n * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
}

export default function ListaCompra() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const { toggle, setAll, isChecked } = useCheckedState();

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await apiFetch("lista-compra/");
        setData(resp || []);
      } catch (e) {
        console.error("Error cargando lista:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtrado = useMemo(() => {
    if (!q.trim()) return data;
    const query = q.toLowerCase();
    return data
      .map((cat) => ({
        ...cat,
        items: cat.items.filter((it) =>
          it.ingrediente_nombre.toLowerCase().includes(query)
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [data, q]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-gray-500">
        Cargando lista de la compra...
      </div>
    );
  }

  return (
    <div className="py-6">
      <h1 className="text-2xl font-semibold text-[#8B5CF6] mb-4 text-center">
        Lista de la compra 🛒
      </h1>

      {/* Buscador */}
      <div className="max-w-3xl mx-auto mb-6">
        <input
          type="text"
          placeholder="Buscar ingrediente..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] bg-white"
        />
      </div>

      {/* Categorías */}
      <div className="max-w-3xl mx-auto space-y-6">
        {filtrado.length === 0 ? (
          <p className="text-center text-gray-500">
            No hay ingredientes (revisa tu plan semanal).
          </p>
        ) : (
          filtrado.map((cat) => {
            const itemKeys = cat.items.map(
              (it) => `${it.ingrediente_id}:${it.unidad?.id ?? "none"}`
            );

            return (
              <div key={cat.categoria_key} className="bg-white rounded-2xl border p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {cat.categoria_label}
                  </h2>
                  <div className="flex gap-2 text-sm">
                    <button
                      onClick={() => setAll(cat.categoria_key, itemKeys, true)}
                      className="px-3 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200"
                    >
                      Marcar todo
                    </button>
                    <button
                      onClick={() => setAll(cat.categoria_key, itemKeys, false)}
                      className="px-3 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
                    >
                      Desmarcar
                    </button>
                  </div>
                </div>

                <ul className="divide-y">
                  {cat.items.map((it) => {
                    const unidadLabel =
                      it.unidad?.abreviatura ||
                      it.unidad?.nombre ||
                      "";

                    const key = `${it.ingrediente_id}:${it.unidad?.id ?? "none"}`;
                    const checked = isChecked(cat.categoria_key, key);

                    return (
                      <li key={key} className="py-3">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggle(cat.categoria_key, key)}
                            className="mt-1 h-5 w-5 rounded border-gray-300 text-[#8B5CF6] focus:ring-[#8B5CF6]"
                          />
                          <div className={checked ? "opacity-60 line-through" : ""}>
                            <div className="text-gray-800">
                              <span className="font-medium">{it.ingrediente_nombre}</span>{" "}
                              <span className="text-gray-500">
                                — {formatCantidad(it.cantidad_total)}
                                {unidadLabel ? ` ${unidadLabel}` : ""}
                              </span>
                            </div>

                            {/* Detalle de procedencia (recetas) */}
                            {it.detalles?.length > 0 && (
                              <div className="text-xs text-gray-400 mt-1">
                                {it.detalles.map((d, i) => (
                                  <span key={i}>
                                    {i > 0 ? " · " : ""}
                                    {d.receta_nombre} ({d.comensales} comensales)
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
