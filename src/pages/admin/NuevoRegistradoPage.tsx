import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NuevoGremioPage.css";

import {
  GENEROS,
  TIPOS_EMPRESA,
  NUM_TRABAJADORES,
  RUBROS_REGISTRO,
  ASESORIAS,
} from "../../constants/gremios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

type RegionAPI = { codigo: string; nombre: string; tipo?: string };
type ComunaAPI = { codigo: string; nombre: string; tipo?: string };

export default function NuevoRegistradoPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // geo
  const [loadingGeo, setLoadingGeo] = useState(true);
  const [errorGeo, setErrorGeo] = useState<string | null>(null);
  const [regiones, setRegiones] = useState<RegionAPI[]>([]);
  const [comunas, setComunas] = useState<ComunaAPI[]>([]);

  // personales
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [genero, setGenero] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [rut, setRut] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");

  // empresa
  const [regionCodigo, setRegionCodigo] = useState(""); // acá guardamos el CODIGO
  const [comuna, setComuna] = useState("");
  const [tipoEmpresa, setTipoEmpresa] = useState("");
  const [numeroTrabajadores, setNumeroTrabajadores] = useState("");
  const [rubro, setRubro] = useState("");
  const [asesoriaSobre, setAsesoriaSobre] = useState("");

  // 1) cargar regiones/comunas desde tu backend
  useEffect(() => {
    const loadGeo = async () => {
      setLoadingGeo(true);
      setErrorGeo(null);

      try {
        const [r1, r2] = await Promise.all([
          fetch(`${API_URL}/api/admin/registros/regiones`),
          fetch(`${API_URL}/api/admin/registros/comunas`),
        ]);

        const d1 = await r1.json().catch(() => null);
        const d2 = await r2.json().catch(() => null);

        if (!r1.ok) throw new Error(d1?.message || "No pude cargar regiones");
        if (!r2.ok) throw new Error(d2?.message || "No pude cargar comunas");

        // Nos quedamos SOLO con tipo correcto por las dudas
        const regionesOk = Array.isArray(d1) ? d1.filter((x) => x?.tipo === "region") : [];
        const comunasOk = Array.isArray(d2) ? d2.filter((x) => x?.tipo === "comuna") : [];

        setRegiones(regionesOk);
        setComunas(comunasOk);
      } catch (e: any) {
        setErrorGeo(e?.message || "Error cargando regiones/comunas");
      } finally {
        setLoadingGeo(false);
      }
    };

    loadGeo();
  }, []);

  // 2) nombre de la región (para guardar en DB)
  const regionNombre = useMemo(() => {
    if (!regionCodigo) return "";
    return regiones.find((r) => r.codigo === regionCodigo)?.nombre || "";
  }, [regionCodigo, regiones]);

  // 3) comunas filtradas por región usando prefijo del código
  // DPA: comuna.codigo = "05602" => región "05"
  const comunasDisponibles = useMemo(() => {
    if (!regionCodigo) return [];

    const region2 = String(regionCodigo).padStart(2, "0");

    return comunas
      .filter((c) => typeof c?.codigo === "string" && c.codigo.slice(0, 2) === region2)
      .map((c) => c.nombre)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, "es"));
  }, [regionCodigo, comunas]);

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
        region: regionNombre || null,
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

      {errorGeo && <div className="error-box">{errorGeo}</div>}
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
              value={regionCodigo}
              onChange={(e) => {
                setRegionCodigo(e.target.value);
                setComuna("");
              }}
              disabled={loadingGeo}
            >
              <option value="">{loadingGeo ? "Cargando..." : "—Por favor, elige una opción—"}</option>
              {regiones.map((r) => (
                <option key={r.codigo} value={r.codigo}>
                  {r.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Comuna</label>
            <select
              value={comuna}
              onChange={(e) => setComuna(e.target.value)}
              disabled={loadingGeo || !regionCodigo}
            >
              <option value="">
                {!regionCodigo
                  ? "— Elegí región primero —"
                  : comunasDisponibles.length === 0
                  ? "— No hay comunas (revisá filtro) —"
                  : "—Por favor, elige una opción—"}
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
