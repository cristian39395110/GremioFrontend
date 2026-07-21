import { useState } from "react";
import { REGIONES, RUBROS ,CARGOS} from "../../constants/gremios";
import { COMUNAS_POR_REGION } from "../../constants/comunas";
import { registrarGremioPublico } from "../../services/publicApi";
import "./RegistroGremioPage.css";

type Props = {
  modoIframe?: boolean;
};

type DirectorioForm = {
  nombre: string;
  apellido: string;
  cargo: string;
  celular: string;
  correo: string;
  foto: File | null;
  previewUrl: string | null;
};

const directorioVacio: DirectorioForm = {
  nombre: "",
  apellido: "",
  cargo: "",
  celular: "",
  correo: "",
  foto: null,
  previewUrl: null,
};

export default function RegistroGremioPage({ modoIframe = false }: Props) {
  const [form, setForm] = useState({
    nombre: "",
    rut: "",
    rubro: "",
    fechaCreacion: "",
    numeroSocios: "",
    numeroEmpresas: "",
    region: "",
    provincia: "",
    ciudad: "",
    direccion: "",
    sitioWeb: "",
    email: "",
    redesSociales: "",
    descripcion: "",
  });

  const [directorio, setDirectorio] = useState<DirectorioForm[]>([
    { ...directorioVacio, cargo: "Presidente" },
  ]);

  const [logo, setLogo] = useState<File | null>(null);
  const [fichaFirmada, setFichaFirmada] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");

function cambiarCampo(
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
) {
  const { name, value } = e.target;

  setForm((prev) => ({
    ...prev,
    [name]: value,
    ...(name === "region"
      ? {
          ciudad: "",
          provincia: "",
        }
      : {}),
  }));
}

  function cambiarDirectorio(
    index: number,
    campo: keyof DirectorioForm,
    valor: string
  ) {
    setDirectorio((prev) => {
      const copia = [...prev];
      copia[index] = { ...copia[index], [campo]: valor };
      return copia;
    });
  }
  function cambiarFotoDirectorio(index: number, file: File | null) {
  setDirectorio((prev) => {
    const copia = [...prev];
    const anterior = copia[index];

    if (anterior.previewUrl) {
      URL.revokeObjectURL(anterior.previewUrl);
    }

    copia[index] = {
      ...anterior,
      foto: file,
      previewUrl: file ? URL.createObjectURL(file) : null,
    };

    return copia;
  });
}

  function agregarMiembro() {
    setDirectorio([...directorio, { ...directorioVacio }]);
  }

  function quitarMiembro(index: number) {
    setDirectorio(directorio.filter((_, i) => i !== index));
  }

  async function enviarFormulario(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setOk(false);

    if (!form.nombre.trim() || !form.rubro || !form.region || !form.email.trim()) {
      setError("Completá los campos obligatorios del gremio.");
      return;
    }

    const miembrosValidos = directorio.filter(
      (m) => m.nombre.trim() || m.apellido.trim() || m.cargo.trim()
    );

    if (miembrosValidos.length === 0) {
      setError("Agregá al menos un miembro del directorio.");
      return;
    }

    if (!fichaFirmada) {
      setError("Debes subir la ficha del gremio completada y firmada.");
      return;
    }

    try {
      setEnviando(true);

      const data = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        data.append(key, value.trim());
      });

      data.append(
        "integrantes",
        JSON.stringify(
          miembrosValidos.map((m) => ({
            nombre: `${m.nombre.trim()} ${m.apellido.trim()}`.trim(),
            cargo: m.cargo.trim(),
            telefono: m.celular.trim(),
            correo: m.correo.trim(),
          }))
        )
      );

      miembrosValidos.forEach((m, index) => {
  if (m.foto) {
    data.append(`integranteFoto_${index}`, m.foto);
  }
});

      if (logo) data.append("logo", logo);
      data.append("cartaAdhesion", fichaFirmada);

      await registrarGremioPublico(data);

      setOk(true);
      setForm({
        nombre: "",
        rut: "",
        rubro: "",
        fechaCreacion: "",
        numeroSocios: "",
        numeroEmpresas: "",
        region: "",
        provincia: "",
        ciudad: "",
        direccion: "",
        sitioWeb: "",
        email: "",
        redesSociales: "",
        descripcion: "",
      });

      setDirectorio([{ ...directorioVacio, cargo: "Presidente" }]);
      setLogo(null);
      setFichaFirmada(null);
    } catch (err: any) {
      setError(err.message || "No se pudo enviar la solicitud.");
    } finally {
      setEnviando(false);
    }
  }

  const comunasDisponibles =
  COMUNAS_POR_REGION[form.region] || [];

  if (ok) {
  return (
    <section
      className={
        modoIframe
          ? "registro-gremio-page iframe"
          : "registro-gremio-page"
      }
    >
      <div className="registro-envio-exitoso">
        <h2>Formulario enviado correctamente</h2>

        <p>
          Gracias. Su solicitud fue recibida y quedó pendiente de revisión
          y aprobación.
        </p>
      </div>
    </section>
  );
}

  return (
    <section className={modoIframe ? "registro-gremio-page iframe" : "registro-gremio-page"}>
      {!modoIframe && (
        <div className="registro-hero">
          <div>
            <span>Registro público</span>
            <h1>Registra tu gremio</h1>
            <p>
              Completa los datos institucionales, agrega el directorio, descarga
              la ficha oficial, fírmala y súbela para solicitar la incorporación.
            </p>
          </div>
        </div>
      )}

      <div className="registro-layout">
        <aside className="registro-info-card">
          <span>Paso obligatorio</span>
          <h2>Ficha oficial del gremio</h2>

          <p>
            Descarga el Word, complétalo con la información del gremio,
            miembros del directorio y firma del responsable.
          </p>

          <a href="/docs/ficha-gremio.docx" download className="registro-download-btn">
            Descargar Word
          </a>

          <div className="registro-warning">
            La solicitud quedará pendiente. El administrador revisará los datos,
            el documento firmado y luego aprobará o rechazará la publicación.
          </div>
        </aside>

        <form className="registro-form" onSubmit={enviarFormulario}>
          <div className="registro-form-head">
            <span>Solicitud de incorporación</span>
            <h2>Datos del gremio</h2>
            <p>
              Estos datos se guardarán en el sistema para que el administrador
              pueda revisar y aprobar la solicitud.
            </p>
          </div>

         

          {error && <div className="registro-alert error">{error}</div>}

          <div className="registro-grid">
            <label>
              Nombre gremio *
              <input name="nombre" value={form.nombre} onChange={cambiarCampo} required />
            </label>

            <label>
              RUT
              <input name="rut" value={form.rut} onChange={cambiarCampo} />
            </label>

            <label>
              Rubro *
              <select name="rubro" value={form.rubro} onChange={cambiarCampo} required>
                <option value="">Seleccionar rubro</option>
                {RUBROS.map((rubro) => (
                  <option key={rubro} value={rubro}>
                    {rubro}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Fecha creación
              <input
                type="date"
                name="fechaCreacion"
                value={form.fechaCreacion}
                onChange={cambiarCampo}
              />
            </label>

            <label>
              Número de socios
              <input
                type="number"
                min="0"
                name="numeroSocios"
                value={form.numeroSocios}
                onChange={cambiarCampo}
              />
            </label>

            <label>
              Número de empresas
              <input
                type="number"
                min="0"
                name="numeroEmpresas"
                value={form.numeroEmpresas}
                onChange={cambiarCampo}
              />
            </label>

            <label>
              Región *
              <select name="region" value={form.region} onChange={cambiarCampo} required>
                <option value="">Seleccionar región</option>
                {REGIONES.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </label>



<label>
  Comuna *
  <select
    name="ciudad"
    value={form.ciudad}
    onChange={cambiarCampo}
    disabled={!form.region}
  >
    <option value="">
      {!form.region
        ? "Seleccionar región primero"
        : "Seleccionar comuna"}
    </option>

    {comunasDisponibles.map((comuna) => (
      <option key={comuna} value={comuna}>
        {comuna}
      </option>
    ))}
  </select>
</label>

            <label>
              Dirección
              <input name="direccion" value={form.direccion} onChange={cambiarCampo} />
            </label>

            <label>
              Sitio web
              <input name="sitioWeb" value={form.sitioWeb} onChange={cambiarCampo} />
            </label>

            <label>
              E-mail *
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={cambiarCampo}
                required
              />
            </label>

            <label>
              Redes sociales
              <input
                name="redesSociales"
                value={form.redesSociales}
                onChange={cambiarCampo}
                placeholder="LinkedIn, Instagram, Facebook..."
              />
            </label>

            <label>
              Logo del gremio
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogo(e.target.files?.[0] || null)}
              />
            </label>
          </div>

          <label className="registro-full">
            Descripción breve
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={cambiarCampo}
              rows={5}
              placeholder="Describe brevemente la actividad, representación o propósito del gremio."
            />
          </label>

          <div className="registro-directorio">
           <div className="registro-subhead">
  <div>
    <span>Miembros de Directorio</span>
    <h3>Integrantes del gremio</h3>
  </div>
</div>

            {directorio.map((miembro, index) => (
              <div className="directorio-card" key={index}>
                <div className="directorio-card-head">
                  <strong>Miembro {index + 1}</strong>

                  {directorio.length > 1 && (
                    <button type="button" onClick={() => quitarMiembro(index)}>
                      Quitar
                    </button>
                  )}
                </div>

                <div className="registro-grid">
                  <label>
                    Nombre *
                    <input
                      value={miembro.nombre}
                      onChange={(e) => cambiarDirectorio(index, "nombre", e.target.value)}
                      required={index === 0}
                    />
                  </label>

                  <label>
                    Apellido
                    <input
                      value={miembro.apellido}
                      onChange={(e) => cambiarDirectorio(index, "apellido", e.target.value)}
                    />
                  </label>

             <label>
  Cargo *
  <select
    value={miembro.cargo}
    onChange={(e) => cambiarDirectorio(index, "cargo", e.target.value)}
    required={index === 0}
  >
    <option value="">Seleccionar cargo</option>

    {CARGOS.map((cargo) => (
      <option key={cargo} value={cargo}>
        {cargo}
      </option>
    ))}
  </select>
</label>

                  <label>
                    Celular
                    <input
                      value={miembro.celular}
                      onChange={(e) => cambiarDirectorio(index, "celular", e.target.value)}
                    />
                  </label>

                  <label>
                    Correo
                    <input
                      type="email"
                      value={miembro.correo}
                      onChange={(e) => cambiarDirectorio(index, "correo", e.target.value)}
                    />
                  </label>
                  <label>
  Foto de perfil
  <input
    type="file"
    accept="image/*"
    onChange={(e) =>
      cambiarFotoDirectorio(index, e.target.files?.[0] || null)
    }
  />
</label>
                </div>
{miembro.previewUrl && (
  <div className="directorio-preview">
    <img src={miembro.previewUrl} alt={`Foto ${miembro.nombre}`} />
    <button
      type="button"
      onClick={() => cambiarFotoDirectorio(index, null)}
    >
      Quitar foto
    </button>
  </div>
)}

              </div>
            ))}
            <button
  type="button"
  onClick={agregarMiembro}
  className="agregar-miembro-btn"
>
  + Agregar miembro
</button>
          </div>

          <div className="registro-file-required">
            <label>
              Ficha completada y firmada *
              <input
                type="file"
               accept="application/pdf"
                onChange={(e) => setFichaFirmada(e.target.files?.[0] || null)}
                required
              />
            </label>

            <small>
              Formato permitido: PDF. Descargue el Word, complételo, fírmelo y expórtelo como PDF antes de subirlo.
            </small>
          </div>

          <button type="submit" disabled={enviando}>
            {enviando ? "Enviando solicitud..." : "Enviar solicitud"}
          </button>
        </form>
      </div>
    </section>
  );
}