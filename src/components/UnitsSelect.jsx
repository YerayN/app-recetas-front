import { useEffect, useState } from 'react';
import { getUnidades as fetchUnits } from "../services/api";

export default function UnitsSelect({
  value,               // id de unidad seleccionado (number|string|null)
  onChange,            // (id) => void
  placeholder = 'Selecciona unidad...',
  disabled = false,
  className = ''
}) {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchUnits();
        if (!cancelled) setUnits(data);
      } catch (e) {
        if (!cancelled) setErr(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (err) {
    return (
      <div className="text-red-600 text-sm">
        Error cargando unidades: {err}
      </div>
    );
  }

  return (
    <select
      className={`border rounded px-2 py-1 ${className}`}
      disabled={disabled || loading}
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value ? Number(e.target.value) : null)}
    >
      <option value="" disabled>
        {loading ? 'Cargando unidades...' : placeholder}
      </option>
      {units.map(u => (
        <option key={u.id} value={u.id}>
          {u.abreviatura ? `${u.nombre} (${u.abreviatura})` : u.nombre}
        </option>
      ))}
    </select>
  );
}
