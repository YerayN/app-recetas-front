import { useState, useEffect } from "react";
import DiaColumna from "../components/DiaColumna";
import ModalSeleccionReceta from "../components/ModalSeleccionReceta";

import { API } from "../config";
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

  // 🔹 Cargar recetas desde el backend
  useEffect(() => {
    const fetchRecetas = async () => {
      try {
        const res = await fetch(`${API}/recetas/`, {
          credentials: "include", // 👈 ESTA LÍNEA ES CLAVE
        });
        if (!res.ok) throw new Error("Error al cargar recetas");
        const data = await res.json();
        setRecetas(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecetas();
  }, []);

  // 🔹 Cargar plan semanal guardado del backend
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await fetch(`${API}/plan/`, { credentials: "include" });
        if (!res.ok) throw new Error("Error al cargar el plan semanal");
        const data = await res.json();

        const nuevoPlan = Object.fromEntries(
          diasSemana.map((dia) => [
            dia,
            Object.fromEntries(tiposComida.map((tc) => [tc, []])),
          ])
        );

        data.forEach((item) => {
          nuevoPlan[item.dia][item.tipo_comida].push(item.receta);
        });

        setPlan(nuevoPlan);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el plan semanal.");
      }
    };
    fetchPlan();
  }, []);

  // 🔹 Guardar un elemento del plan
  const savePlanItem = async (dia, tipo, recetaId) => {
  try {
    const nuevoItem = {
      dia: dia,
      tipo_comida: tipo,
      receta_id: recetaId,
    };

    const res = await fetch(`${API}/plan/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoItem),
      credentials: "include", // 👈 mantener cookies
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error("Error guardando plan:", errData);
      throw new Error("No se pudo guardar el plan");
    }

    console.log("✅ Plan guardado correctamente");
  } catch (err) {
    console.error("Error guardando plan:", err);
  }
};


  // 🔹 Eliminar un elemento del plan
  const deletePlanItem = async (dia, tipo, recetaId) => {
    try {
      const res = await fetch(`${API}/plan/`, { credentials: "include" });
      const data = await res.json();
      const item = data.find(
        (p) => p.dia === dia && p.tipo_comida === tipo && p.receta.id === recetaId
      );
      if (item) {
        await fetch(`${API}/plan/${item.id}/`, {
          method: "DELETE",
          credentials: "include",
        });
      }
    } catch (err) {
      console.error("Error eliminando plan:", err);
    }
  };

  // 🔹 Añadir receta (local + backend)
  const handleAddReceta = (dia, tipo, receta) => {
  if (!receta) {
    setDiaSeleccionado(dia);
    setTipoSeleccionado(tipo);
    setModalAbierto(true);
    return;
  }

  setPlan((prev) => ({
    ...prev,
    [dia]: {
      ...prev[dia],
      [tipo]: [...prev[dia][tipo], receta],
    },
  }));

  // 🔹 Guardar en backend (usa el id de la receta)
  savePlanItem(dia, tipo, receta.id);

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

  return (
    <div className="min-h-screen bg-[#FAF8F6] p-4">
      <h1 className="text-2xl font-semibold text-[#8B5CF6] mb-6 text-center">
        Plan Semanal 🍽️
      </h1>

      {error && (
        <p className="text-center text-red-500 text-sm mb-4">⚠️ {error}</p>
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
