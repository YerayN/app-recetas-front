import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api";

export default function RecetaForm({ onSubmit, modo = "crear", onUpdate }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tiempo, setTiempo] = useState("");
  const [instrucciones, setInstrucciones] = useState("");
  const [imagen, setImagen] = useState(null);
  const [imagenExistente, setImagenExistente] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    if (modo === "editar" && id) {
      apiFetch(`recetas/${id}/`)
        .then((data) => {
          setNombre(data.nombre || "");
          setDescripcion(data.descripcion || "");
          setTiempo(data.tiempo_preparacion || "");
          setInstrucciones(data.instrucciones || "");
          setImagenExistente(data.imagen || "");
        })
        .catch((err) => console.error("Error cargando receta:", err));
    }
  }, [modo, id]);

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
        if (uploadData.secure_url) {
          imageUrl = uploadData.secure_url;
        } else {
          throw new Error("Error al subir imagen a Cloudinary");
        }
      }

      const formData = new FormData();
      formData.append("nombre", nombre);
      formData.append("descripcion", descripcion);
      formData.append("tiempo_preparacion", tiempo);
      formData.append("instrucciones", instrucciones);
      formData.append("imagen", imageUrl);

      if (modo === "editar") {
        await apiFetch(`recetas/${id}/`, { method: "PUT", body: formData });
        setMensaje("✅ Receta actualizada correctamente");
        if (onUpdate) onUpdate();
        setTimeout(() => navigate("/recetas"), 1000);
      } else {
        await apiFetch("recetas/", { method: "POST", body: formData });
        setMensaje("✅ Receta creada correctamente");
        if (onUpdate) onUpdate();
        setTimeout(() => navigate("/recetas"), 1000);
      }
    } catch (error) {
      console.error(error);
      setMensaje("❌ Error al guardar la receta");
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-sm p-6 max-w-2xl mx-auto mt-8 space-y-4"
    >
      <h2 className="text-2xl font-semibold text-[#8B5CF6] mb-4">
        {modo === "editar" ? "Editar receta" : "Añadir nueva receta"}
      </h2>

      {mensaje && (
        <p className="text-center text-sm font-medium text-gray-600">{mensaje}</p>
      )}

      {/* inputs como los tenías */}

      <div className="space-y-3">
  <input
    type="text"
    value={nombre}
    onChange={(e) => setNombre(e.target.value)}
    placeholder="Nombre de la receta"
    className="w-full border rounded-md p-2"
    required
  />

  <textarea
    value={descripcion}
    onChange={(e) => setDescripcion(e.target.value)}
    placeholder="Descripción"
    className="w-full border rounded-md p-2"
  />

  <input
    type="number"
    value={tiempo}
    onChange={(e) => setTiempo(e.target.value)}
    placeholder="Tiempo de preparación (min)"
    className="w-full border rounded-md p-2"
  />

  <textarea
    value={instrucciones}
    onChange={(e) => setInstrucciones(e.target.value)}
    placeholder="Instrucciones"
    className="w-full border rounded-md p-2"
  />

  <input
    type="file"
    accept="image/*"
    onChange={(e) => setImagen(e.target.files[0])}
    className="w-full border rounded-md p-2"
  />

  {imagenExistente && (
    <img
      src={imagenExistente}
      alt="Previsualización"
      className="w-32 h-32 object-cover rounded-md"
    />
  )}

  <button
    type="submit"
    disabled={subiendo}
    className="bg-[#8B5CF6] text-white px-4 py-2 rounded-md hover:bg-[#7C3AED]"
  >
    {subiendo ? "Guardando..." : modo === "editar" ? "Actualizar" : "Guardar"}
  </button>
</div>


    </form>
  );
}
