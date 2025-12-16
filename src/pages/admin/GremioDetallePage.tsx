import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./GremioDetallePage.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

type Integrante = {
  id: number;
  nombre: string;
  telefono?: string;
  correo?: string;
  cargo: "Presidente" | "Vicepresidente" | "Miembro";
  fotoUrl?: string | null;
};

type Gremio = {
  id: number;
  nombre: string;
  rut: string;
  rubro: string;
  region: string;
  descripcion?: string | null;
  logoUrl?: string | null;
  cartaPdfUrl?: string | null;
  integrantes?: Integrante[];
};

export default function GremioDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [gremio, setGremio] = useState<Gremio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const resp = await fetch(`${API_URL}/api/admin/gremios/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.message || "Error al cargar gremio");

      setGremio(data);
    } catch (e: any) {
      setError(e.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  // Descarga “real” (baja el archivo con nombre) usando fetch+blob
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
      // si el navegador bloquea, abrimos en otra pestaña
      window.open(url, "_blank");
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  if (loading) return <div className="gd-loader">Cargando ficha…</div>;
  if (error) return <div className="gd-error">{error}</div>;
  if (!gremio) return <div className="gd-error">No encontrado</div>;

  return (
    <div className="gd-page">
      <div className="gd-top">
        <div>
          <h2 className="gd-title">Ficha del Gremio</h2>
         
        </div>

        <div className="gd-actions">
          <button className="gd-btn" onClick={() => navigate("/admin/gremios")}>
            ← Volver
          </button>
          <button className="gd-btn primary" onClick={() => navigate(`/admin/gremios/${gremio.id}`)}>
            ✏️ Editar
          </button>
        </div>
      </div>

      <div className="gd-grid">
        {/* CARD DATOS */}
        <section className="gd-card">
          <div className="gd-card-head">
            <div className="gd-card-title">Datos del gremio</div>

            {gremio.logoUrl ? (
              <img className="gd-logo" src={gremio.logoUrl} alt="Logo gremio" />
            ) : (
              <div className="gd-logo placeholder">Sin logo</div>
            )}
          </div>

          <div className="gd-kv">
            <div className="kv">
              <span>Nombre</span>
              <strong>{gremio.nombre}</strong>
            </div>
            <div className="kv">
              <span>RUT</span>
              <strong>{gremio.rut}</strong>
            </div>
            <div className="kv">
              <span>Rubro</span>
              <strong>{gremio.rubro}</strong>
            </div>
            <div className="kv">
              <span>Región</span>
              <strong>{gremio.region}</strong>
            </div>
          </div>

          {gremio.descripcion ? (
            <div className="gd-desc">
              <div className="gd-desc-title">Descripción</div>
              <p>{gremio.descripcion}</p>
            </div>
          ) : (
            <div className="gd-muted">Sin descripción.</div>
          )}

          {/* PDF */}
          <div className="gd-pdf">
            <div className="gd-desc-title">Carta de adhesión (PDF)</div>

            {gremio.cartaPdfUrl ? (
              <div className="gd-pdf-actions">
           
                <button
                  type="button"
                  className="gd-btn small"
                  onClick={() => descargarArchivo(gremio.cartaPdfUrl!, `carta_gremio_${gremio.id}.pdf`)}
                >
                  Descargar
                </button>
              </div>
            ) : (
              <div className="gd-muted">No hay PDF cargado.</div>
            )}
          </div>
        </section>

        {/* CARD INTEGRANTES */}
        <section className="gd-card">
          <div className="gd-card-title">Integrantes</div>

          {!gremio.integrantes || gremio.integrantes.length === 0 ? (
            <div className="gd-empty">
              <div className="gd-empty-icon">👥</div>
              <div>
                <strong>No hay integrantes cargados</strong>
                <div className="gd-muted">Podés agregarlos desde “Editar”.</div>
              </div>
            </div>
          ) : (
            <div className="gd-integrantes">
              {gremio.integrantes.map((i) => (
                <div key={i.id} className="gd-integrante">
                  <div className="gd-foto-wrap">
                    {i.fotoUrl ? (
                      <img className="gd-foto" src={i.fotoUrl} alt={i.nombre} />
                    ) : (
                      <div className="gd-foto placeholder">Sin foto</div>
                    )}
                  </div>

                  <div className="gd-int-body">
                    <div className="gd-int-name">{i.nombre}</div>
                    <div className="gd-int-meta">
                      <span className={`badge ${i.cargo.toLowerCase()}`}>{i.cargo}</span>
                      {i.telefono && <span>📞 {i.telefono}</span>}
                      {i.correo && <span>✉️ {i.correo}</span>}
                    </div>

                    <div className="gd-int-actions">
                      {i.fotoUrl ? (
                        <>
                         
                          <button
                            type="button"
                            className="gd-btn small"
                            onClick={() => descargarArchivo(i.fotoUrl!, `integrante_${i.id}.jpg`)}
                          >
                            Descargar
                          </button>
                        </>
                      ) : (
                        <div className="gd-muted">Sin archivo.</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
