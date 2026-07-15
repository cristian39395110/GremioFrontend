import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NuevoGremioPage.css";

import {
  GENEROS,
  TIPOS_EMPRESA,
  NUM_TRABAJADORES,
  RUBROS_REGISTRO,
  ASESORIAS,
  REGIONES,
} from "../../constants/gremios";

import { COMUNAS_POR_REGION } from "../../constants/comunas";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";



export default function NuevoRegistradoPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // geo


  // personales
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [genero, setGenero] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [rut, setRut] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");

  // empresa
const [region, setRegion] = useState("");
const [comuna, setComuna] = useState("");
  const [tipoEmpresa, setTipoEmpresa] = useState("");
  const [numeroTrabajadores, setNumeroTrabajadores] = useState("");
  const [rubro, setRubro] = useState("");
  const [asesoriaSobre, setAsesoriaSobre] = useState("");

  // 1) cargar regiones/comunas desde tu backend


  // 2) nombre de la región (para guardar en DB)


  // 3) comunas filtradas por región usando prefijo del código
  // DPA: comuna.codigo = "05602" => región "05"
const comunasDisponibles = useMemo(() => {
  if (!region) return [];

  return [...(COMUNAS_POR_REGION[region] || [])].sort((a, b) =>
    a.localeCompare(b, "es")
  );
}, [region]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nombres.trim() || !apellidos.trim()) {
      setError("Nombres y apellidos son obligatorios");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        genero: genero || null,
        fechaNacimiento: fechaNacimiento || null,
        rut: rut.trim() || null,
        telefono: telefono.trim() || null,
        email: email.trim() || null,

        // guardamos texto “humano” en tu DB
       region: region || null,
        comuna: comuna || null,

        tipoEmpresa: tipoEmpresa || null,
        numeroTrabajadores: numeroTrabajadores || null,
        rubro: rubro || null,
        asesoriaSobre: asesoriaSobre || null,
      };

      const resp = await fetch(`${API_URL}/api/admin/registros`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await resp.json().catch(() => null);
      if (!resp.ok) throw new Error(data?.message || "Error al crear registrado");

      navigate("/admin/registrados");
    } catch (err: any) {
      setError(err?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nuevo-gremio-page">
      <div className="page-header">
        <h2>Nuevo Registro</h2>
        <button className="btn-secondary" onClick={() => navigate("/admin/registrados")}>
          ← Volver
        </button>
      </div>

      
      {error && <div className="error-box">{error}</div>}

      <form onSubmit={handleSubmit}>
        <h3>Datos personales</h3>

        <div className="two-columns">
          <div>
            <label>Nombres</label>
            <input value={nombres} onChange={(e) => setNombres(e.target.value)} placeholder="Nombres" />
          </div>

          <div>
            <label>Apellidos</label>
            <input value={apellidos} onChange={(e) => setApellidos(e.target.value)} placeholder="Apellidos" />
          </div>
        </div>

        <div className="two-columns">
          <div>
            <label>Género</label>
            <select value={genero} onChange={(e) => setGenero(e.target.value)}>
              <option value="">—Por favor, elige una opción—</option>
              {GENEROS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Fecha de nacimiento</label>
            <input type="date" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} />
          </div>
        </div>

        <div className="two-columns">
          <div>
            <label>RUT</label>
            <input value={rut} onChange={(e) => setRut(e.target.value)} placeholder="Ingrese RUT" />
          </div>

          <div>
            <label>Número telefónico</label>
            <input value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="+56..." />
          </div>
        </div>

        <label>E-mail</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" />

        <h3>Datos de empresa</h3>

        <div className="two-columns">
          <div>
            <label>Región</label>
 <select
  value={region}
  onChange={(e) => {
    setRegion(e.target.value);
    setComuna("");
  }}
>
  <option value="">—Por favor, elige una opción—</option>

  {REGIONES.map((r) => (
    <option key={r} value={r}>
      {r}
    </option>
  ))}
</select>
          </div>

          <div>
            <label>Comuna</label>
<select
  value={comuna}
  onChange={(e) => setComuna(e.target.value)}
  disabled={!region}
>
  <option value="">
    {!region ? "— Elegí región primero —" : "—Por favor, elige una opción—"}
  </option>

  {comunasDisponibles.map((c) => (
    <option key={c} value={c}>
      {c}
    </option>
  ))}
</select>
          </div>
        </div>

        <div className="two-columns">
          <div>
            <label>Tipo de Empresa</label>
            <select value={tipoEmpresa} onChange={(e) => setTipoEmpresa(e.target.value)}>
              <option value="">—Por favor, elige una opción—</option>
              {TIPOS_EMPRESA.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Número de Trabajadores</label>
            <select value={numeroTrabajadores} onChange={(e) => setNumeroTrabajadores(e.target.value)}>
              <option value="">—Por favor, elige una opción—</option>
              {NUM_TRABAJADORES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="two-columns">
          <div>
            <label>Rubro</label>
            <select value={rubro} onChange={(e) => setRubro(e.target.value)}>
              <option value="">—Por favor, elige una opción—</option>
              {RUBROS_REGISTRO.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Deseo recibir asesoría sobre:</label>
            <select value={asesoriaSobre} onChange={(e) => setAsesoriaSobre(e.target.value)}>
              <option value="">—Por favor, elige una opción—</option>
              {ASESORIAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Terminar Registro"}
        </button>
      </form>
    </div>
  );
}
