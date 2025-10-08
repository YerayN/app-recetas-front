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

  // Si estamos editando, cargar la receta existente
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

    // 1️⃣ Subir imagen si se seleccionó
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

    // 2️⃣ Preparar datos del formulario
    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("descripcion", descripcion);
    formData.append("tiempo_preparacion", tiempo);
    formData.append("instrucciones", instrucciones);
    formData.append("imagen", imageUrl);

    // 3️⃣ Enviar al backend según modo
    if (modo === "editar") {
      // PUT para actualizar
      await apiFetch(`recetas/${id}/`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });
      setMensaje("✅ Receta actualizada correctamente");

      if (onUpdate) onUpdate();

      setTimeout(() => navigate("/recetas"), 1000);
    } else {
      // ✅ POST para crear nueva
      await apiFetch("recetas/", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();
      console.log("Respuesta creación:", data);

      if (res.ok) {
        if (onUpdate) onUpdate();
        setMensaje("✅ Receta creada correctamente");
        setTimeout(() => navigate("/recetas"), 1000);
      } else {
        throw new Error("Error al guardar la receta");
      }
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-[#8B5CF6]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-[#8B5CF6]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tiempo (min)</label>
        <input
          type="number"
          value={tiempo}
          onChange={(e) => setTiempo(e.target.value)}
          className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-[#8B5CF6]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Instrucciones</label>
        <textarea
          value={instrucciones}
          onChange={(e) => setInstrucciones(e.target.value)}
          rows="4"
          className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-[#8B5CF6]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
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
  );
}
