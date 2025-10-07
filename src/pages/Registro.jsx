import { useState } from "react";

const API = "http://127.0.0.1:8000/api/register/";

export default function Registro() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [ok, setOk] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) setOk(true);
    else setError("No se pudo registrar el usuario");
  };

  if (ok)
    return (
      <div className="text-center mt-20">
        <p className="text-green-600 font-medium">
          ¡Usuario registrado! Ya puedes iniciar sesión.
        </p>
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF8F6]">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-2xl p-6 w-80"
      >
        <h1 className="text-xl font-semibold text-[#8B5CF6] mb-4 text-center">
          Crear cuenta
        </h1>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-3 text-sm"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-4 text-sm"
        />

        <button
          type="submit"
          className="w-full bg-[#8B5CF6] text-white rounded-lg py-2 text-sm hover:bg-[#7C3AED] transition"
        >
          Registrarse
        </button>
      </form>
    </div>
  );
}
