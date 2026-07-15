import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { REGIONES, RUBROS, CARGOS } from "../../constants/gremios";
import { COMUNAS_POR_REGION } from "../../constants/comunas";
import "./NuevoGremioPage.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

type IntegranteForm = {
  id?: number;                 // 👈 CLAVE PRO
  nombre: string;
  telefono: string;
  correo: string;
  cargo: string;
  foto: File | null;           // foto NUEVA (opcional)
  fotoUrl?: string | null;     // foto ACTUAL
};


export default function NuevoGremioPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const esEdicion = Boolean(id);

  const [nombre, setNombre] = useState("");
  const [rut, setRut] = useState("");
  const [rubro, setRubro] = useState("");
  const [region, setRegion] = useState("");
  const [fechaCreacion, setFechaCreacion] = useState("");
const [numeroSocios, setNumeroSocios] = useState("");
const [numeroEmpresas, setNumeroEmpresas] = useState("");
const [provincia, setProvincia] = useState("");
const [ciudad, setCiudad] = useState("");
const [direccion, setDireccion] = useState("");
const [sitioWeb, setSitioWeb] = useState("");
const [email, setEmail] = useState("");
const [redesSociales, setRedesSociales] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [logo, setLogo] = useState<File | null>(null);
  const [cartaPdf, setCartaPdf] = useState<File | null>(null);

  const [logoActualUrl, setLogoActualUrl] = useState<string | null>(null);
  const [cartaActualUrl, setCartaActualUrl] = useState<string | null>(null);

  const [integrantes, setIntegrantes] = useState<IntegranteForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* =====================
     INTEGRANTES
  ====================== */
  const agregarIntegrante = () => {
    setIntegrantes([
      ...integrantes,
      {
        nombre: "",
        telefono: "",
        correo: "",
        cargo: "Miembro",
        foto: null,
        fotoUrl: null,
      },
    ]);
  };

const actualizarIntegrante = <K extends keyof IntegranteForm>(
  index: number,
  campo: K,
  valor: IntegranteForm[K]
) => {
  setIntegrantes((prev) => {
    const copia = [...prev];
    const item = copia[index];
    if (!item) return prev; // evita el undefined

    copia[index] = { ...item, [campo]: valor };
    return copia;
  });
};


  const eliminarIntegrante = (index: number) => {
    setIntegrantes(integrantes.filter((_, i) => i !== index));
  };

  /* =====================
     SUBMIT
  ====================== */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nombre || !rubro || !region) {
      setError("Completá los datos obligatorios");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("nombre", nombre);
      if (rut.trim()) formData.append("rut", rut.trim());
      formData.append("rubro", rubro);
      formData.append("region", region);
      formData.append("fechaCreacion", fechaCreacion);
formData.append("numeroSocios", numeroSocios);
formData.append("numeroEmpresas", numeroEmpresas);
formData.append("provincia", provincia);
formData.append("ciudad", ciudad);
formData.append("direccion", direccion);
formData.append("sitioWeb", sitioWeb);
formData.append("email", email);
formData.append("redesSociales", redesSociales);
      formData.append("descripcion", descripcion);

      if (logo) formData.append("logo", logo);
      if (cartaPdf) formData.append("cartaAdhesion", cartaPdf);

      // 👉 integrantes (SIN foto, solo data + fotoUrl)
      formData.append(
        "integrantes",
        JSON.stringify(
          integrantes.map((i) => ({
            id: i.id ?? null,
            nombre: i.nombre,
            telefono: i.telefono,
            correo: i.correo,
            cargo: i.cargo,
            fotoUrl: i.fotoUrl ?? null,
          }))
        )
      );

      // 👉 fotos nuevas (si hay)
      integrantes.forEach((i, idx) => {
        if (!i.foto) return;

        if (i.id) {
          formData.append(`integranteFotoId_${i.id}`, i.foto);
        } else {
          formData.append(`integranteFotoNew_${idx}`, i.foto);
        }
      });

      const url = esEdicion
        ? `${API_URL}/api/admin/gremios/${id}`
        : `${API_URL}/api/admin/gremios`;

      const method = esEdicion ? "PUT" : "POST";

      const resp = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await resp.json();
      if (!resp.ok)
        throw new Error(
          data.message ||
            (esEdicion
              ? "Error al actualizar gremio"
              : "Error al crear gremio")
        );

      navigate("/admin/gremios");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }

  };



const descargarArchivo = async (url: string, nombre: string) => {
  try {
    const r = await fetch(url);
    const blob = await r.blob();

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = nombre;

    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(a.href);
  } catch {
    window.open(url, "_blank");
  }
};


  /* =====================
     CARGAR GREMI0 (EDITAR)
  ====================== */
  useEffect(() => {
    if (!esEdicion) return;

    const cargar = async () => {
      setLoading(true);
      setError(null);

      try {
        const resp = await fetch(`${API_URL}/api/admin/gremios/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await resp.json();
        if (!resp.ok) throw new Error(data?.message);

        setNombre(data.nombre || "");
        setRut(data.rut || "");
        setRubro(data.rubro || "");
        setRegion(data.region || "");
        setFechaCreacion(data.fechaCreacion || "");
setNumeroSocios(data.numeroSocios || "");
setNumeroEmpresas(data.numeroEmpresas || "");
setProvincia(data.provincia || "");
setCiudad(data.ciudad || "");
setDireccion(data.direccion || "");
setSitioWeb(data.sitioWeb || "");
setEmail(data.email || "");
setRedesSociales(data.redesSociales || "");
        setDescripcion(data.descripcion || "");

        setLogoActualUrl(data.logoUrl || null);
        setCartaActualUrl(data.cartaPdfUrl || null);

        setIntegrantes(
          (data.integrantes || []).map((i: any) => ({
            id: i.id,
            nombre: i.nombre || "",
            telefono: i.telefono || "",
            correo: i.correo || "",
            cargo: i.cargo || "Miembro",
            foto: null,
            fotoUrl: i.fotoUrl || null,
          }))
        );
      } catch (e: any) {
        setError(e.message || "Error al cargar");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [esEdicion, id]);


  const comunasDisponibles = COMUNAS_POR_REGION[region] || [];

  /* =====================
     RENDER
  ====================== */
  return (
    <div className="nuevo-gremio-page">
      <div className="page-header">
        <h2>{esEdicion ? "Editar Gremio" : "Nuevo Gremio"}</h2>
        <button className="btn-secondary" onClick={() => navigate("/admin/gremios")}>
          ← Volver
        </button>
      </div>

      {error && <div className="error-box">{error}</div>}

      <form onSubmit={handleSubmit}>
        <h3>Datos del Gremio</h3>

        <input placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} />
        <input placeholder="RUT (opcional)" value={rut} onChange={e => setRut(e.target.value)} />

        <select value={rubro} onChange={e => setRubro(e.target.value)}>
          <option value="">Seleccionar rubro</option>
          {RUBROS.map(r => <option key={r}>{r}</option>)}
        </select>

       <select
  value={region}
  onChange={(e) => {
    setRegion(e.target.value);
    setCiudad("");
    
  }}
>
          <option value="">Seleccionar región</option>
          {REGIONES.map(r => <option key={r}>{r}</option>)}
        </select>

<select
  value={ciudad}
  onChange={(e) => setCiudad(e.target.value)}
  disabled={!region}
>
  <option value="">
    {!region ? "Seleccionar región primero" : "Seleccionar comuna"}
  </option>

  {comunasDisponibles.map((comuna) => (
    <option key={comuna} value={comuna}>
      {comuna}
    </option>
  ))}
</select>

<input type="date" value={fechaCreacion} onChange={e => setFechaCreacion(e.target.value)} />

<input placeholder="Número de socios" value={numeroSocios} onChange={e => setNumeroSocios(e.target.value)} />

<input placeholder="Número de empresas" value={numeroEmpresas} onChange={e => setNumeroEmpresas(e.target.value)} />



<input placeholder="Dirección" value={direccion} onChange={e => setDireccion(e.target.value)} />

<input placeholder="Sitio web" value={sitioWeb} onChange={e => setSitioWeb(e.target.value)} />

<input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />

<input placeholder="Redes sociales" value={redesSociales} onChange={e => setRedesSociales(e.target.value)} />


        <textarea placeholder="Descripción" value={descripcion} onChange={e => setDescripcion(e.target.value)} />
{/* ===== Logo ===== */}
<div className="archivo-block">
  <div className="archivo-head">
    <label className="archivo-label">Logo del gremio</label>

    {esEdicion && logoActualUrl && (
      <a
        className="archivo-chip"
        href={logoActualUrl}
        onClick={(e) => {
          e.preventDefault();
          descargarArchivo(logoActualUrl, `logo_gremio_${id}.jpg`);
        }}
      >
        <span className="archivo-chip-muted">Actual</span>
        <span className="archivo-chip-link">Descargar</span>
      </a>
    )}
  </div>

  <input
    className="archivo-input"
    type="file"
    accept="image/*"
    onChange={(e) => setLogo(e.target.files?.[0] || null)}
  />
</div>

{/* ===== Carta ===== */}
<div className="archivo-block">
  <div className="archivo-head">
    <label className="archivo-label">Carta de adhesión</label>

    {esEdicion && cartaActualUrl && (
      <a
        className="archivo-chip"
        href={cartaActualUrl}
        onClick={(e) => {
          e.preventDefault();
          descargarArchivo(cartaActualUrl, `carta_gremio_${id}.pdf`);
        }}
      >
        <span className="archivo-chip-muted">Actual</span>
        <span className="archivo-chip-link">Descargar</span>
      </a>
    )}
  </div>

  {esEdicion && cartaActualUrl && (
    <div className="archivo-help">
      Subí un PDF nuevo solo si querés reemplazar el actual.
    </div>
  )}

  <input
    className="archivo-input"
    type="file"
    accept="application/pdf"
    onChange={(e) => setCartaPdf(e.target.files?.[0] || null)}
  />
</div>


        <h3>Integrantes</h3>

        {integrantes.map((i, idx) => (
          <div key={idx} className="integrante-box">
            <input value={i.nombre} onChange={e => actualizarIntegrante(idx, "nombre", e.target.value)} placeholder="Nombre" />
            <input value={i.telefono} onChange={e => actualizarIntegrante(idx, "telefono", e.target.value)} placeholder="Teléfono" />
            <input value={i.correo} onChange={e => actualizarIntegrante(idx, "correo", e.target.value)} placeholder="Correo" />

            <select value={i.cargo} onChange={e => actualizarIntegrante(idx, "cargo", e.target.value)}>
              {CARGOS.map(c => <option key={c}>{c}</option>)}
            </select>
{/* ===== Foto integrante ===== */}
<div className="archivo-block">
  <div className="archivo-head">
    <label className="archivo-label">Foto de perfil</label>

    {i.fotoUrl && (
      <a
        className="archivo-chip"
        href={i.fotoUrl}
        onClick={(e) => {
          e.preventDefault();
          descargarArchivo(i.fotoUrl!, `integrante_${i.id ?? idx}.jpg`);
        }}
      >
        <span className="archivo-chip-muted">Actual</span>
        <span className="archivo-chip-link">Descargar</span>
      </a>
    )}
  </div>

  <input
    className="archivo-input"
    type="file"
    accept="image/*"
    onChange={(e) =>
      actualizarIntegrante(idx, "foto", e.target.files?.[0] || null)
    }
  />
</div>

            <button type="button" className="danger" onClick={() => eliminarIntegrante(idx)}>
              Quitar
            </button>
          </div>
        ))}

        <button type="button" onClick={agregarIntegrante}>➕ Agregar integrante</button>

        <br /><br />

        <button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Guardar Gremio"}
        </button>
      </form>
    </div>
  );
}
