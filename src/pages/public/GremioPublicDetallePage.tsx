import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { obtenerGremioPublico } from "../../services/publicApi";
import "./GremioPublicDetallePage.css";

type Integrante = {
  id: number;
  nombre: string;
  telefono?: string;
  correo?: string;
  fotoUrl?: string;
  cargo: string;
};

type Gremio = {
  id: number;
  nombre: string;
  rut?: string;
  rubro: string;
  region: string;
  descripcion?: string;
  logoUrl?: string;
  cartaPdfUrl?: string;
  integrantes?: Integrante[];
};

export default function GremioPublicDetallePage() {
  const { id } = useParams();
  const [gremio, setGremio] = useState<Gremio | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      try {
        if (!id) return;
        const data = await obtenerGremioPublico(id);
        setGremio(data);
      } catch (error) {
        console.error(error);
      } finally {
        setCargando(false);
      }
    }

    cargar();
  }, [id]);

  if (cargando) {
    return <div className="gremio-detalle-status">Cargando ficha...</div>;
  }

  if (!gremio) {
    return <div className="gremio-detalle-status">Gremio no encontrado.</div>;
  }

  return (
    <section className="gremio-detalle-page">
      <Link to="/gremios" className="gremio-volver">
        ← Volver al listado
      </Link>

      <div className="gremio-detalle-hero">
        <div className="gremio-detalle-logo">
          {gremio.logoUrl ? (
            <img src={gremio.logoUrl} alt={gremio.nombre} />
          ) : (
            <span>{gremio.nombre.charAt(0)}</span>
          )}
        </div>

        <div>
          <span className="gremio-detalle-tag">{gremio.rubro}</span>
          <h1>{gremio.nombre}</h1>
          <p>{gremio.region}</p>
        </div>
      </div>

      <div className="gremio-detalle-grid">
        <div className="gremio-detalle-card principal">
          <h2>Descripción</h2>
          <p>{gremio.descripcion || "Sin descripción disponible."}</p>

          {gremio.cartaPdfUrl && (
            <a
              href={gremio.cartaPdfUrl}
              target="_blank"
              rel="noreferrer"
              className="gremio-pdf-btn"
            >
              Ver carta de adhesión
            </a>
          )}
        </div>

        <div className="gremio-detalle-card">
          <h2>Información</h2>

          <div className="gremio-info-row">
            <strong>RUT</strong>
            <span>{gremio.rut || "No informado"}</span>
          </div>

          <div className="gremio-info-row">
            <strong>Rubro</strong>
            <span>{gremio.rubro}</span>
          </div>

          <div className="gremio-info-row">
            <strong>Región</strong>
            <span>{gremio.region}</span>
          </div>
        </div>
      </div>

      <div className="gremio-integrantes-section">
        <h2>Integrantes del gremio</h2>

        <div className="gremio-integrantes-grid">
          {gremio.integrantes?.map((integrante) => (
            <div className="integrante-public-card" key={integrante.id}>
              <div className="integrante-foto">
                {integrante.fotoUrl ? (
                  <img src={integrante.fotoUrl} alt={integrante.nombre} />
                ) : (
                  <span>{integrante.nombre.charAt(0)}</span>
                )}
              </div>

              <h3>{integrante.nombre}</h3>
              <p>{integrante.cargo}</p>

              {integrante.correo && <small>{integrante.correo}</small>}
              {integrante.telefono && <small>{integrante.telefono}</small>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}