import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api";
import IngredientesList from "../components/IngredientesList";
import SelectorIngredientes from "../pages/SelectorIngredientes";

export default function RecetaForm({ onSubmit, modo = "crear", onUpdate }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tiempo, setTiempo] = useState("");
  const [instrucciones, setInstrucciones] = useState("");
  const [categoriaNutricional, setCategoriaNutricional] = useState("");
  const [ingredientes, setIngredientes] = useState([]);
  const [imagen, setImagen] = useState(null);
  const [imagenExistente, setImagenExistente] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [sugerencia, setSugerencia] = useState("");

  // 🔹 control del modal selector
  const [mostrarSelector, setMostrarSelector] = useState(false);
  const [replaceIndex, setReplaceIndex] = useState(null);

  const correoSoporte =
    import.meta.env.VITE_SOPORTE_EMAIL || "ny93yeray@gmail.com";

  const handleEnviarSugerencia = () => {
    if (!sugerencia.trim()) return;
    const subject = "Sugerencia de ingrediente faltante";
    const body = `Hola,\n\nMe falta el siguiente ingrediente en la lista:\n\n${sugerencia}\n\n(Enviado desde La Despensa)`;
    const mailto = `mailto:${correoSoporte}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  };

  // 🔹 Cargar datos al editar receta
  useEffect(() => {
    if (modo === "editar" && id) {
      apiFetch(`recetas/${id}/`)
        .then((data) => {
          setNombre(data.nombre || "");
          setDescripcion(data.descripcion || "");
          setTiempo(data.tiempo_preparacion || "");
          setInstrucciones(data.instrucciones || "");
          setCategoriaNutricional(data.categoria_nutricional || "");
          setImagenExistente(data.imagen || "");

          if (Array.isArray(data.ingredientes)) {
            const normalizados = data.ingredientes.map((item) => {
              const ingrId =
                typeof item.ingrediente === "object"
                  ? item.ingrediente?.id
                  : item.ingrediente;

              const ingrNombre =
                item.ingrediente_nombre ||
                (typeof item.ingrediente === "object"
                  ? item.ingrediente?.nombre
                  : "") ||
                "";

              const unidadId =
                typeof item.unidad === "object"
                  ? item.unidad?.id
                  : item.unidad ?? null;

              return {
                ingrediente: { id: ingrId, nombre: ingrNombre },
                cantidad: item.cantidad ?? "",
                unidad: unidadId,
              };
            });

            setIngredientes(normalizados);
          } else {
            setIngredientes([]);
          }
        })
        .catch((err) => {
          console.error("❌ Error cargando receta:", err);
        });
    }
  }, [modo, id]);

  // 🔹 Guardar receta
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setSubiendo(true);

    try {
      let imageUrl = imagenExistente;

      if (imagen) {
        const data = new FormData();
        data.append("file", imagen);
        data.append("upload_preset", "recetas_app");
        const uploadRes = await fetch(
          "https://api.cloudinary.com/v1_1/daovhj0i4/image/upload",
          { method: "POST", body: data }
        );
        const uploadData = await uploadRes.json();
        if (uploadData.secure_url) imageUrl = uploadData.secure_url;
        else throw new Error("Error al subir imagen a Cloudinary");
      }

      const nuevaReceta = {
        nombre,
        descripcion,
        tiempo_preparacion: tiempo,
        instrucciones,
        categoria_nutricional: categoriaNutricional || null,
        imagen: imageUrl,
        ingredientes: ingredientes
          .filter((i) => i.ingrediente && i.ingrediente.id)
          .map((i) => ({
            ingrediente: i.ingrediente.id,
            cantidad: i.cantidad ? parseFloat(i.cantidad) : null,
            unidad: i.unidad ?? null,
          })),
      };

      if (modo === "editar") {
        await apiFetch(`recetas/${id}/`, {
          method: "PUT",
          body: JSON.stringify(nuevaReceta),
        });
        setMensaje("✅ Receta actualizada correctamente");
      } else {
        await apiFetch("recetas/", {
          method: "POST",
          body: JSON.stringify(nuevaReceta),
        });
        setMensaje("✅ Receta creada correctamente");
      }

      if (onUpdate) onUpdate();
      setTimeout(() => navigate("/recetas"), 1000);
    } catch (error) {
      console.error(error);
      setMensaje("❌ Error al guardar la receta");
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm p-6 max-w-2xl mx-auto mt-8 space-y-4"
      >
        <h2 className="text-2xl font-semibold text-[#8B5CF6] mb-4">
          {modo === "editar" ? "Editar receta" : "Añadir nueva receta"}
        </h2>

        {mensaje && (
          <p className="text-center text-sm font-medium text-gray-600">
            {mensaje}
          </p>
        )}

        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-[#8B5CF6]"
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-[#8B5CF6]"
          />
        </div>

        {/* Tiempo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tiempo (min)
          </label>
          <input
            type="number"
            value={tiempo}
            onChange={(e) => setTiempo(e.target.value)}
            className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-[#8B5CF6]"
          />
        </div>

        {/* Instrucciones */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Instrucciones
          </label>
          <textarea
            value={instrucciones}
            onChange={(e) => setInstrucciones(e.target.value)}
            rows="4"
            className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-[#8B5CF6]"
          />
        </div>

        {/* Categoría nutricional */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoría nutricional (opcional)
          </label>
          <select
            value={categoriaNutricional}
            onChange={(e) => setCategoriaNutricional(e.target.value)}
            className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-[#8B5CF6]"
          >
            <option value="">-- Sin categoría --</option>
            <option value="carbohidratos">Carbohidratos</option>
            <option value="proteinas">Proteínas</option>
            <option value="grasas">Grasas</option>
            <option value="fibra">Fibra</option>
          </select>
        </div>

        {/* Ingredientes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ingredientes
          </label>
          <IngredientesList
            value={ingredientes}
            onChange={setIngredientes}
            onOpenSelector={(i) => {
              setReplaceIndex(i);
              setMostrarSelector(true);
            }}
          />
        </div>

        {/* Imagen */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Imagen
          </label>
          {imagenExistente && !imagen && (
            <img
              src={imagenExistente}
              alt="Vista previa"
              className="w-32 h-32 object-cover rounded-lg border border-gray-200 mb-2"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImagen(e.target.files[0])}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-[#8B5CF6]/10 file:text-[#8B5CF6] hover:file:bg-[#8B5CF6]/20 cursor-pointer"
          />
        </div>

        {/* Botón guardar */}
        <button
          type="submit"
          disabled={subiendo}
          className={`w-full py-3 rounded-xl font-medium transition text-white ${
            subiendo
              ? "bg-[#A8BDA8]/60 cursor-not-allowed"
              : "bg-[#8B5CF6] hover:bg-[#7C3AED]"
          }`}
        >
          {subiendo
            ? "Guardando..."
            : modo === "editar"
            ? "Guardar cambios"
            : "Guardar receta"}
        </button>
      </form>

      {/* Modal selector */}
      {mostrarSelector && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl p-6 max-h-[80vh] overflow-y-auto w-[90%] md:w-[600px] relative">
            <button
              onClick={() => setMostrarSelector(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <SelectorIngredientes
              onSelect={(ing) => {
                setIngredientes((prev) => {
                  const nueva = [...prev];
                  if (replaceIndex != null) {
                    nueva[replaceIndex] = {
                      ...nueva[replaceIndex],
                      ingrediente: ing,
                    };
                  } else {
                    nueva.push({ cantidad: "", unidad: null, ingrediente: ing });
                  }
                  return nueva;
                });
                setMostrarSelector(false);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
