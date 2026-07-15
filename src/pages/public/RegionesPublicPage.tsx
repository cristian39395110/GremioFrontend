import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { obtenerGremiosPorRegion } from "../../services/publicApi";
import "./RegionesPublicPage.css";

type Integrante = {
  id: number;
  nombre: string;
  cargo: string;
};

type Gremio = {
  id: number;
  nombre: string;
  rubro: string;
  region: string;
  descripcion?: string;
  logoUrl?: string;
  integrantes?: Integrante[];
};

type RegionesAgrupadas = Record<string, Gremio[]>;

export default function RegionesPublicPage() {
  const [regiones, setRegiones] = useState<RegionesAgrupadas>({});
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarRegiones();
  }, []);

  async function cargarRegiones() {
    try {
      setCargando(true);
      setError("");

      const data = await obtenerGremiosPorRegion();

      if (Array.isArray(data)) {
        const agrupado: RegionesAgrupadas = {};

        data.forEach((item: any) => {
          const nombre = item.nombre || item.region || "Sin región";
          agrupado[nombre] = item.gremios || [];
        });

        setRegiones(agrupado);
      } else {
        setRegiones(data || {});
      }
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las regiones.");
    } finally {
      setCargando(false);
    }
  }

  const regionesFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();

    return Object.entries(regiones)
      .filter(([region, gremios]) => {
        if (!q) return true;

        return (
          region.toLowerCase().includes(q) ||
          gremios.some((g) =>
            `${g.nombre} ${g.rubro} ${g.descripcion || ""}`
              .toLowerCase()
              .includes(q)
          )
        );
      })
      .sort(([a], [b]) => a.localeCompare(b));
  }, [regiones, busqueda]);

  const totalRegiones = Object.keys(regiones).length;
  const totalGremios = Object.values(regiones).reduce(
    (acc, lista) => acc + lista.length,
    0
  );

  return (
    <section className="regiones-public-page">
      <div className="regiones-hero">
        <div>
          <span>Regiones</span>
          <h1>Gremios agrupados por región</h1>
          <p>
            Conoce la presencia gremial en Chile, organizada por territorio y
            actividad productiva.
          </p>
        </div>

        <div className="regiones-hero-stats">
          <div>
            <strong>{totalRegiones}</strong>
            <small>Regiones</small>
          </div>

          <div>
            <strong>{totalGremios}</strong>
            <small>Gremios</small>
          </div>
        </div>
      </div>

      <div className="regiones-search-card">
        <div>
          <span>Buscar</span>
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar región, gremio o rubro..."
          />
        </div>

        <Link to="/gremios">Ver directorio completo +</Link>
      </div>

      {cargando && (
        <div className="regiones-loading">Cargando regiones...</div>
      )}

      {error && <div className="regiones-error">{error}</div>}

      {!cargando && !error && regionesFiltradas.length === 0 && (
        <div className="regiones-empty">
          <h2>No se encontraron resultados</h2>
          <p>Probá con otra región, gremio o rubro.</p>
        </div>
      )}

      {!cargando && !error && regionesFiltradas.length > 0 && (
        <div className="regiones-list">
          {regionesFiltradas.map(([region, gremios]) => (
            <section className="region-block" key={region}>
              <div className="region-block-head">
                <div className="region-title-wrap">
                  <div className="region-icon-auto">
                    {region.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <span>Región</span>
                    <h2>{region}</h2>
                  </div>
                </div>

                <strong>{gremios.length} gremios</strong>
              </div>

              <div className="region-gremios-grid">
                {gremios.map((gremio) => {
                  const presidente = gremio.integrantes?.find((i) =>
                    i.cargo?.toLowerCase().includes("presidente")
                  );

                  return (
                    <Link
                      to={`/gremios/${gremio.id}`}
                      className="region-gremio-card"
                      key={gremio.id}
                    >
                      <div className="region-logo">
                        {gremio.logoUrl ? (
                          <img src={gremio.logoUrl} alt={gremio.nombre} />
                        ) : (
                          <span>{gremio.nombre.charAt(0)}</span>
                        )}
                      </div>

                      <div className="region-card-body">
                        <h3>{gremio.nombre}</h3>
                        <p>{gremio.rubro}</p>

                        {presidente && (
                          <small>Presidente: {presidente.nombre}</small>
                        )}
                      </div>

                      <div className="region-card-footer">Ver ficha +</div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}