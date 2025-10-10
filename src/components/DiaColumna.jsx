import ComidaSeccion from "./ComidaSeccion";

const tiposComidaOrden = [
  { clave: "desayuno", icono: "🥣", nombre: "Desayuno" },
  { clave: "almuerzo", icono: "🍽️", nombre: "Almuerzo" },
  { clave: "comida", icono: "🍛", nombre: "Comida" },
  { clave: "merienda", icono: "🍪", nombre: "Merienda" },
  { clave: "cena", icono: "🌙", nombre: "Cena" },
  { clave: "snack", icono: "🍎", nombre: "Snack" },
];

export default function DiaColumna({ nombre, comidas, onAdd, onRemove, onAdjust }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-3 flex flex-col">
      <h2 className="text-lg font-semibold text-[#8B5CF6] mb-2 text-center">
        {nombre}
      </h2>

      <div className="flex flex-col gap-2">
        {tiposComidaOrden.map(({ clave, icono, nombre: nombreComida }) => (
          <ComidaSeccion
            key={clave}
            dia={nombre}
            tipo={clave}
            icono={icono}
            nombre={nombreComida}
            recetas={comidas[clave]}
            onAdd={onAdd}
            onRemove={onRemove}
            onAdjust={onAdjust}
          />
        ))}
      </div>
    </div>
  );
}
