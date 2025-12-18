import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams,useLocation  } from "react-router-dom";
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


type Registrado = {
  id: number;
  nombres: string;
  apellidos: string;
  genero?: string | null;
  fechaNacimiento?: string | null;
  rut?: string | null;
  telefono?: string | null;
  email?: string | null;
  region?: string | null;   // guardás nombre
  comuna?: string | null;   // guardás nombre
  tipoEmpresa?: string | null;
  numeroTrabajadores?: string | null;
  rubro?: string | null;
  asesoriaSobre?: string | null;
};

export default function RegistradoDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
const esEditar = location.pathname.endsWith("/editar");
const esVer = location.pathname.endsWith("/ver");

const [modoEdicion, setModoEdicion] = useState(esEditar);
 

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [loadingGeo, setLoadingGeo] = useState(true);
  const [errorGeo, setErrorGeo] = useState<string | null>(null);
  const [regiones, setRegiones] = useState<RegionAPI[]>([]);
  const [comunas, setComunas] = useState<ComunaAPI[]>([]);

  // form
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [genero, setGenero] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [rut, setRut] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");

  const [regionCodigo, setRegionCodigo] = useState(""); // select por codigo
  const [comuna, setComuna] = useState("");

  const [tipoEmpresa, setTipoEmpresa] = useState("");
  const [numeroTrabajadores, setNumeroTrabajadores] = useState("");
  const [rubro, setRubro] = useState("");
  const [asesoriaSobre, setAsesoriaSobre] = useState("");

  // referencia para precargar
  const [registradoOriginal, setRegistradoOriginal] = useState<Registrado | null>(null);

  
useEffect(() => {
  setModoEdicion(esEditar);
}, [esEditar]);


  // 1) cargar geo
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
const regionesOk = Array.isArray(d1) ? d1.filter((x) => x?.tipo === "region") : [];
const comunasOk  = Array.isArray(d2) ? d2.filter((x) => x?.tipo === "comuna") : [];

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

  // 2) cargar registrado
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const resp = await fetch(`${API_URL}/api/admin/registros/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        const data = await resp.json().catch(() => null);
        if (!resp.ok) throw new Error(data?.message || "No pude cargar el registrado");

        setRegistradoOriginal(data);

        // set fields
        setNombres(data?.nombres || "");
        setApellidos(data?.apellidos || "");
        setGenero(data?.genero || "");
        setFechaNacimiento(data?.fechaNacimiento || "");
        setRut(data?.rut || "");
        setTelefono(data?.telefono || "");
        setEmail(data?.email || "");

        setTipoEmpresa(data?.tipoEmpresa || "");
        setNumeroTrabajadores(data?.numeroTrabajadores || "");
        setRubro(data?.rubro || "");
        setAsesoriaSobre(data?.asesoriaSobre || "");

        // region/comuna se resuelve cuando tengamos regiones cargadas (otro effect abajo)
        setComuna(data?.comuna || "");
      } catch (e: any) {
        setError(e?.message || "Error");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  // 3) cuando ya tengo regiones + registrado, convierto regionNombre -> regionCodigo
useEffect(() => {
  if (loadingGeo) return;
  if (!registradoOriginal) return;

  const regionNombreDB = (registradoOriginal.region || "").trim().toLowerCase();
  if (!regionNombreDB) return;

  const found =
    regiones.find((r) => (r.nombre || "").trim().toLowerCase() === regionNombreDB) ||
    regiones.find((r) => (r.nombre || "").toLowerCase().includes(regionNombreDB)) ||
    regiones.find((r) => regionNombreDB.includes((r.nombre || "").toLowerCase()));

  setRegionCodigo(found ? found.codigo : "");
}, [loadingGeo, registradoOriginal, regiones]);


  // 4) comunas filtradas por codigo_padre
const comunasDisponibles = useMemo(() => {
  if (!regionCodigo) return [];

  const region2 = String(regionCodigo).padStart(2, "0");

  return comunas
    .filter((c) => typeof c?.codigo === "string" && c.codigo.slice(0, 2) === region2)
    .map((c) => c.nombre)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "es"));
}, [regionCodigo, comunas]);


  // 5) nombre de región para guardar en DB
  const regionNombre = useMemo(() => {
    if (!regionCodigo) return "";
    return regiones.find((r) => r.codigo === regionCodigo)?.nombre || "";
  }, [regionCodigo, regiones]);

  const resetForm = () => {
    if (!registradoOriginal) return;

    setNombres(registradoOriginal.nombres || "");
    setApellidos(registradoOriginal.apellidos || "");
    setGenero(registradoOriginal.genero || "");
    setFechaNacimiento(registradoOriginal.fechaNacimiento || "");
    setRut(registradoOriginal.rut || "");
    setTelefono(registradoOriginal.telefono || "");
    setEmail(registradoOriginal.email || "");

    setTipoEmpresa(registradoOriginal.tipoEmpresa || "");
    setNumeroTrabajadores(registradoOriginal.numeroTrabajadores || "");
    setRubro(registradoOriginal.rubro || "");
    setAsesoriaSobre(registradoOriginal.asesoriaSobre || "");

    setComuna(registradoOriginal.comuna || "");

    // regionCodigo se recalcula por effect con regiones
    const rn = (registradoOriginal.region || "").trim();
    const found = regiones.find((r) => (r.nombre || "").trim() === rn);
    setRegionCodigo(found ? found.codigo : "");
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nombres.trim() || !apellidos.trim()) {
      setError("Nombres y apellidos son obligatorios");
      return;
    }

    try {
      const payload = {
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        genero: genero || null,
        fechaNacimiento: fechaNacimiento || null,
        rut: rut.trim() || null,
        telefono: telefono.trim() || null,
        email: email.trim() || null,

        region: regionNombre || null,
        comuna: comuna || null,

        tipoEmpresa: tipoEmpresa || null,
        numeroTrabajadores: numeroTrabajadores || null,
        rubro: rubro || null,
        asesoriaSobre: asesoriaSobre || null,
      };

      const resp = await fetch(`${API_URL}/api/admin/registros/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await resp.json().catch(() => null);
      if (!resp.ok) throw new Error(data?.message || "Error al actualizar");

      // refrescá original
      setRegistradoOriginal((prev) => (prev ? { ...prev, ...payload } as any : prev));
      setModoEdicion(false);
    } catch (e: any) {
      setError(e?.message || "Error");
    }
  };

  const soloLectura = !modoEdicion;

  return (
    <div className="nuevo-gremio-page">
      <div className="page-header">
        <h2>Detalle del Registrado</h2>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-secondary" onClick={() => navigate("/admin/registrados")}>
            ← Volver
          </button>

       {esVer ? null : !modoEdicion ? (
  <button
    type="button"
    className="btn-secondary"
    onClick={() => setModoEdicion(true)}
    disabled={loading || loadingGeo}
  >
    ✏️ Editar
  </button>
) : (
  <button
    type="button"
    className="btn-secondary"
    onClick={() => {
      resetForm();
      setModoEdicion(false);
      navigate(`/admin/registrados/${id}/ver`);
    }}
  >
    ✖ Cancelar
  </button>
)}

        </div>
      </div>

      {errorGeo && <div className="error-box">{errorGeo}</div>}
      {error && <div className="error-box">{error}</div>}

      {loading ? (
        <div style={{ padding: 16 }}>Cargando...</div>
      ) : (
        <form onSubmit={handleGuardar}>
          <h3>Datos personales</h3>

          <div className="two-columns">
            <div>
              <label>Nombres</label>
              <input value={nombres} onChange={(e) => setNombres(e.target.value)} disabled={soloLectura} />
            </div>

            <div>
              <label>Apellidos</label>
              <input value={apellidos} onChange={(e) => setApellidos(e.target.value)} disabled={soloLectura} />
            </div>
          </div>

          <div className="two-columns">
            <div>
              <label>Género</label>
              <select value={genero} onChange={(e) => setGenero(e.target.value)} disabled={soloLectura}>
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
              <input
                type="date"
                value={fechaNacimiento || ""}
                onChange={(e) => setFechaNacimiento(e.target.value)}
                disabled={soloLectura}
              />
            </div>
          </div>

          <div className="two-columns">
            <div>
              <label>RUT</label>
              <input value={rut} onChange={(e) => setRut(e.target.value)} disabled={soloLectura} />
            </div>

            <div>
              <label>Número telefónico</label>
              <input value={telefono} onChange={(e) => setTelefono(e.target.value)} disabled={soloLectura} />
            </div>
          </div>

          <div>
            <label>E-mail</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} disabled={soloLectura} />
          </div>

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
                disabled={soloLectura || loadingGeo}
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
                disabled={soloLectura || loadingGeo || !regionCodigo}

              >
                <option value="">
                  {!regionCodigo
                    ? "— Elegí región primero —"
                    : comunasDisponibles.length === 0
                    ? "— Sin comunas para esta región —"
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
              <select value={tipoEmpresa} onChange={(e) => setTipoEmpresa(e.target.value)} disabled={soloLectura}>
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
              <select
                value={numeroTrabajadores}
                onChange={(e) => setNumeroTrabajadores(e.target.value)}
                disabled={soloLectura}
              >
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
              <select value={rubro} onChange={(e) => setRubro(e.target.value)} disabled={soloLectura}>
                <option value="">—Por favor, elige una opción—</option>
                {RUBROS_REGISTRO.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Deseo recibir asesoría sobre</label>
              <select value={asesoriaSobre} onChange={(e) => setAsesoriaSobre(e.target.value)} disabled={soloLectura}>
                <option value="">—Por favor, elige una opción—</option>
                {ASESORIAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {modoEdicion && (
            <button type="submit" disabled={loadingGeo}>
              Guardar cambios
            </button>
          )}
        </form>
      )}
    </div>
  );
}
