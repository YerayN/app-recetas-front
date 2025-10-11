import { useState, useEffect } from "react";
import DiaColumna from "../components/DiaColumna";
import ModalSeleccionReceta from "../components/ModalSeleccionReceta";
import { apiFetch } from "../services/api";

const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const tiposComida = ["desayuno", "almuerzo", "comida", "merienda", "cena", "snack"];

export default function PlanSemanal() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);
  const [plan, setPlan] = useState(
    Object.fromEntries(
      diasSemana.map((dia) => [
        dia,
        Object.fromEntries(tiposComida.map((tc) => [tc, []])),
      ])
    )
  );

  const [recetas, setRecetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [listaCompra, setListaCompra] = useState([]);
  const [mostrarLista, setMostrarLista] = useState(false);

  // 🔹 Cargar recetas
  useEffect(() => {
    const fetchRecetas = async () => {
      try {
        const data = await apiFetch("recetas/");
        setRecetas(data);
      } catch (err) {
        setError("Error al cargar recetas");
      } finally {
        setLoading(false);
      }
    };
    fetchRecetas();
  }, []);

  // 🔹 Cargar plan semanal
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const data = await apiFetch("plan/");
        const nuevoPlan = Object.fromEntries(
          diasSemana.map((dia) => [
            dia,
            Object.fromEntries(tiposComida.map((tc) => [tc, []])),
          ])
        );

        data.forEach((item) => {
          nuevoPlan[item.dia][item.tipo_comida].push({
            ...item.receta,
            comensales: item.comensales, // usa el valor real del backend
            id_plan: item.id,
          });
        });

        setPlan(nuevoPlan);
      } catch {
        setError("No se pudo cargar el plan semanal.");
      }
    };
    fetchPlan();
  }, []);

  // 🔹 Guardar receta en el plan
  const savePlanItem = async (dia, tipo, recetaId, comensales = 2) => {
    try {
      await apiFetch("plan/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dia,
          tipo_comida: tipo,
          receta_id: recetaId,
          comensales,
        }),
      });
      console.log("✅ Plan guardado correctamente");
    } catch (err) {
      console.error("Error guardando plan:", err);
    }
  };

  // 🔹 Eliminar una receta del plan
  const deletePlanItem = async (dia, tipo, recetaId) => {
    try {
      const data = await apiFetch("plan/");
      const item = data.find(
        (p) => p.dia === dia && p.tipo_comida === tipo && p.receta.id === recetaId
      );
      if (item) {
        await apiFetch(`plan/${item.id}/`, { method: "DELETE" });
      }
    } catch (err) {
      console.error("Error eliminando plan:", err);
    }
  };

  // 🔹 Añadir receta (usa comensales por defecto del hogar = 2 aquí)
  const handleAddReceta = (dia, tipo, receta) => {
    if (!receta) {
      setDiaSeleccionado(dia);
      setTipoSeleccionado(tipo);
      setModalAbierto(true);
      return;
    }

    const comensales = 2;

    setPlan((prev) => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        [tipo]: [...prev[dia][tipo], { ...receta, comensales }],
      },
    }));

    savePlanItem(dia, tipo, receta.id, comensales);
    setModalAbierto(false);
  };

  // 🔹 Eliminar receta (local + backend)
  const handleRemoveReceta = (dia, tipoComida, index) => {
    const recetaEliminada = plan[dia][tipoComida][index];
    if (!recetaEliminada) return;

    setPlan((prev) => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        [tipoComida]: prev[dia][tipoComida].filter((_, i) => i !== index),
      },
    }));

    deletePlanItem(dia, tipoComida, recetaEliminada.id);
  };

  // 🔹 Ajustar comensales
  const handleAdjustComensales = async (dia, tipo, receta) => {
    const nuevoValor = prompt(
      `¿Cuántos comensales comerán ${receta.nombre}?`,
      receta.comensales ?? 2
    );

    if (!nuevoValor || isNaN(nuevoValor)) return;

    try {
      const planId = receta.id_plan ?? receta.id;
      const resp = await apiFetch(`plan/${planId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comensales: Number(nuevoValor) }),
      });

      const valorReal = resp?.comensales ?? Number(nuevoValor);

      setPlan((prev) => ({
        ...prev,
        [dia]: {
          ...prev[dia],
          [tipo]: prev[dia][tipo].map((r) =>
            (r.id_plan ?? r.id) === planId
              ? { ...r, comensales: valorReal }
              : r
          ),
        },
      }));
    } catch (error) {
      console.error("Error al actualizar comensales:", error);
    }
  };

  // 🛒 Generar lista de la compra
  const generarListaCompra = async () => {
    try {
      const data = await apiFetch("plan/lista-compra/");
      setListaCompra(Array.isArray(data) ? data : []);
      setMostrarLista(true);
    } catch (error) {
      console.error("Error al generar lista de la compra:", error);
      alert("Error al generar la lista de la compra");
    }
  };

  // Agrupar por categoría (función util)
  const agruparPorCategoria = (lista) =>
    lista.reduce((acc, item) => {
      const cat = item.categoria || "otros";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});

  const grupos = agruparPorCategoria(listaCompra);

  return (
    <div className="min-h-screen bg-[#FAF8F6] p-4">
      <h1 className="text-2xl font-semibold text-[#8B5CF6] mb-6 text-center">
        Plan Semanal 🍽️
      </h1>

      {error && (
        <p className="text-center text-red-500 text-sm mb-4">⚠️ {error}</p>
      )}

      {/* Botón lista */}
      <div className="flex justify-center mb-6">
        <button
          onClick={generarListaCompra}
          className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-4 py-2 rounded-lg shadow-md transition"
        >
          🛒 Generar lista de la compra
        </button>
      </div>

      {/* Lista generada */}
      {mostrarLista && (
        <div className="bg-white shadow-md rounded-2xl p-4 mb-6 max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold text-[#8B5CF6] mb-3 text-center">
            Lista de la compra
          </h2>

          {Object.keys(grupos).length > 0 ? (
            Object.entries(grupos).map(([categoria, items]) => (
              <div key={categoria} className="mb-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-2 border-b pb-1">
                  {categoria.replaceAll("_", " ").toUpperCase()}
                </h3>
                <ul className="space-y-1 text-gray-700">
                  {items.map((i, idx) => (
                    <li key={`${categoria}-${idx}`}>
                      {i.nombre}: <b>{Math.round(i.cantidad * 100) / 100}</b> {i.unidad}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 italic">
              No hay ingredientes en la lista
            </p>
          )}
        </div>
      )}

      {loading ? (
        <p className="text-center text-gray-500 mt-8">Cargando recetas...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {diasSemana.map((dia) => (
            <DiaColumna
              key={dia}
              nombre={dia}
              comidas={plan[dia]}
              onAdd={handleAddReceta}
              onRemove={handleRemoveReceta}
              onAdjust={handleAdjustComensales}
            />
          ))}
        </div>
      )}

      {modalAbierto && (
        <ModalSeleccionReceta
          recetas={recetas}
          onSelect={(receta) =>
            handleAddReceta(diaSeleccionado, tipoSeleccionado, receta)
          }
          onClose={() => setModalAbierto(false)}
        />
      )}
    </div>
  );
}
