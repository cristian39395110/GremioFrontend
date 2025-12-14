import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { REGIONES, RUBROS, CARGOS } from "../../constants/gremios";
import "./NuevoGremioPage.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

type IntegranteForm = {
  nombre: string;
  telefono: string;
  correo: string;
  cargo: string;
  foto: File | null;
};

export default function NuevoGremioPage() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [rut, setRut] = useState("");
  const [rubro, setRubro] = useState("");
  const [region, setRegion] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [cartaPdf, setCartaPdf] = useState<File | null>(null);

  const [integrantes, setIntegrantes] = useState<IntegranteForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const agregarIntegrante = () => {
    setIntegrantes([
      ...integrantes,
      { nombre: "", telefono: "", correo: "", cargo: "Miembro", foto: null },
    ]);
  };

  const actualizarIntegrante = (
    index: number,
    campo: keyof IntegranteForm,
    valor: any
  ) => {
    const copia = [...integrantes];
    copia[index][campo] = valor;
    setIntegrantes(copia);
  };

  const eliminarIntegrante = (index: number) => {
    setIntegrantes(integrantes.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nombre  || !rubro || !region) {
      setError("Completá los datos obligatorios");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("nombre", nombre);
      if (rut.trim()) {
  formData.append("rut", rut.trim());
}
      formData.append("rubro", rubro);
      formData.append("region", region);
      formData.append("descripcion", descripcion);

      if (logo) formData.append("logo", logo);
      if (cartaPdf) formData.append("cartaAdhesion", cartaPdf);

      formData.append(
        "integrantes",
        JSON.stringify(integrantes.map(({ foto, ...rest }) => rest))
      );

      integrantes.forEach((i, idx) => {
        if (i.foto) {
          formData.append(`integranteFoto_${idx}`, i.foto);
        }
      });

      const resp = await fetch(`${API_URL}/api/admin/gremios`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data.message || "Error al crear gremio");

      navigate("/admin/gremios");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nuevo-gremio-page">
      <div className="page-header">
        <h2>Nuevo Gremio</h2>
        <button className="btn-secondary" onClick={() => navigate("/admin/gremios")}>
          ← Volver
        </button>
      </div>

      {error && <div className="error-box">{error}</div>}

      <form onSubmit={handleSubmit}>
        <h3>Datos del Gremio</h3>

        <input placeholder="Nombre del gremio" value={nombre} onChange={e => setNombre(e.target.value)} />
        <input
  placeholder="RUT (opcional)"
  value={rut}
  onChange={e => setRut(e.target.value)}
/>


        <select value={rubro} onChange={e => setRubro(e.target.value)}>
          <option value="">Seleccionar rubro</option>
          {RUBROS.map(r => <option key={r}>{r}</option>)}
        </select>

        <select value={region} onChange={e => setRegion(e.target.value)}>
          <option value="">Seleccionar región</option>
          {REGIONES.map(r => <option key={r}>{r}</option>)}
        </select>

        <textarea placeholder="Descripción" value={descripcion} onChange={e => setDescripcion(e.target.value)} />

        <label>Logo</label>
        <input type="file" accept="image/*" onChange={e => setLogo(e.target.files?.[0] || null)} />

        <label>Carta de adhesión (PDF)</label>
        <input type="file" accept="application/pdf" onChange={e => setCartaPdf(e.target.files?.[0] || null)} />

        <h3>Integrantes</h3>

        {integrantes.map((i, idx) => (
          <div key={idx} className="integrante-box">
            <input placeholder="Nombre" value={i.nombre} onChange={e => actualizarIntegrante(idx, "nombre", e.target.value)} />
            <input placeholder="Teléfono" value={i.telefono} onChange={e => actualizarIntegrante(idx, "telefono", e.target.value)} />
            <input placeholder="Correo" value={i.correo} onChange={e => actualizarIntegrante(idx, "correo", e.target.value)} />

            <select value={i.cargo} onChange={e => actualizarIntegrante(idx, "cargo", e.target.value)}>
              {CARGOS.map(c => <option key={c}>{c}</option>)}
            </select>

            <input type="file" accept="image/*" onChange={e => actualizarIntegrante(idx, "foto", e.target.files?.[0] || null)} />

            <button type="button" className="danger" onClick={() => eliminarIntegrante(idx)}>
              Quitar
            </button>
          </div>
        ))}

        <button type="button" onClick={agregarIntegrante}>
          ➕ Agregar integrante
        </button>

        <br /><br />

        <button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Guardar Gremio"}
        </button>
      </form>
    </div>
  );
}
