import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { obtenerGremiosPorRubro } from "../../services/publicApi";
import "./RubrosPublicPage.css";

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

type RubrosAgrupados = Record<string, Gremio[]>;

export default function RubrosPublicPage() {
  const [rubros, setRubros] = useState<RubrosAgrupados>({});
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarRubros();
  }, []);

  async function cargarRubros() {
    try {
      setCargando(true);
      setError("");

      const data = await obtenerGremiosPorRubro();

      if (Array.isArray(data)) {
        const agrupado: RubrosAgrupados = {};

        data.forEach((item: any) => {
          const nombre = item.nombre || item.rubro || "Sin rubro";
          agrupado[nombre] = item.gremios || [];
        });

        setRubros(agrupado);
      } else {
        setRubros(data || {});
      }
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los rubros.");
    } finally {
      setCargando(false);
    }
  }

  const rubrosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();

    return Object.entries(rubros)
      .filter(([rubro, gremios]) => {
        if (!q) return true;

        return (
          rubro.toLowerCase().includes(q) ||
          gremios.some((g) =>
            `${g.nombre} ${g.region} ${g.descripcion || ""}`
              .toLowerCase()
              .includes(q)
          )
        );
      })
      .sort(([a], [b]) => a.localeCompare(b));
  }, [rubros, busqueda]);

  const totalRubros = Object.keys(rubros).length;
  const totalGremios = Object.values(rubros).reduce(
    (acc, lista) => acc + lista.length,
    0
  );

  return (
    <section className="rubros-public-page">
      <div className="rubros-hero">
        <div>
          <span>Rubros</span>
          <h1>Gremios agrupados por rubro</h1>
          <p>
            Explora la red gremial según su actividad, sector productivo o área
            de representación.
          </p>
        </div>

        <div className="rubros-hero-stats">
          <div>
            <strong>{totalRubros}</strong>
            <small>Rubros</small>
          </div>

          <div>
            <strong>{totalGremios}</strong>
            <small>Gremios</small>
          </div>
        </div>
      </div>

      <div className="rubros-search-card">
        <div>
          <span>Buscar</span>
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar rubro, gremio o región..."
          />
        </div>

        <Link to="/gremios">Ver directorio completo +</Link>
      </div>

      {cargando && <div className="rubros-loading">Cargando rubros...</div>}

      {error && <div className="rubros-error">{error}</div>}

      {!cargando && !error && rubrosFiltrados.length === 0 && (
        <div className="rubros-empty">
          <h2>No se encontraron resultados</h2>
          <p>Probá con otro rubro, gremio o región.</p>
        </div>
      )}

      {!cargando && !error && rubrosFiltrados.length > 0 && (
        <div className="rubros-list">
          {rubrosFiltrados.map(([rubro, gremios]) => (
            <section className="rubro-block" key={rubro}>
              <div className="rubro-block-head">
                <div>
                  <span>Rubro</span>
                  <h2>{rubro}</h2>
                </div>

                <strong>{gremios.length} gremios</strong>
              </div>

              <div className="rubro-gremios-grid">
                {gremios.map((gremio) => {
                  const presidente = gremio.integrantes?.find((i) =>
                    i.cargo?.toLowerCase().includes("presidente")
                  );

                  return (
                    <Link
                      to={`/gremios/${gremio.id}`}
                      className="rubro-gremio-card"
                      key={gremio.id}
                    >
                      <div className="rubro-logo">
                        {gremio.logoUrl ? (
                          <img src={gremio.logoUrl} alt={gremio.nombre} />
                        ) : (
                          <span>{gremio.nombre.charAt(0)}</span>
                        )}
                      </div>

                      <div className="rubro-card-body">
                        <h3>{gremio.nombre}</h3>
                        <p>{gremio.region}</p>

                        {presidente && (
                          <small>Presidente: {presidente.nombre}</small>
                        )}
                      </div>

                      <div className="rubro-card-footer">Ver ficha +</div>
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