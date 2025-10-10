import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";

export default function UnitsSelect({
  value,
  onChange,
  placeholder = "Unidad de medida",
  disabled = false,
  className = "",
}) {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await apiFetch("unidades/");
        if (!cancelled) setUnits(data);
      } catch (e) {
        if (!cancelled) setErr(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (err) {
    return <div className="text-red-600 text-sm">Error cargando unidades: {err}</div>;
  }

  return (
    <select
      className={`border rounded px-2 py-1 ${className}`}
      disabled={disabled || loading}
      value={value ?? ""}
      onChange={(e) =>
        onChange?.(e.target.value ? Number(e.target.value) : null)
      }
    >
      <option value="" disabled>
        {loading ? "Cargando unidades..." : placeholder}
      </option>
      {units.map((u) => (
        <option key={u.id} value={u.id}>
          {u.abreviatura ? `${u.nombre} (${u.abreviatura})` : u.nombre}
        </option>
      ))}
    </select>
  );
}
