import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { obtenerGremiosPublicos } from "../../services/publicApi";
import "./GremiosPublicPage.css";

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

export default function GremiosPublicPage() {
  const [gremios, setGremios] = useState<Gremio[]>([]);
  const [buscar, setBuscar] = useState("");
  const [busquedaFinal, setBusquedaFinal] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarGremios();
  }, [page, busquedaFinal]);

  async function cargarGremios() {
    try {
      setCargando(true);

      const data = await obtenerGremiosPublicos({
        buscar: busquedaFinal,
        page,
        limit: 16,
      });

      setGremios(data.gremios || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || data.count || data.gremios?.length || 0);

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  }

  function buscarGremios(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setBusquedaFinal(buscar.trim());
  }

  function limpiarBusqueda() {
    setBuscar("");
    setBusquedaFinal("");
    setPage(1);
  }

  return (
    <section className="gremios-public-page">
      <div className="gremios-public-hero">
        <div>
          <span>Directorio público</span>
          <h1>Listado de gremios</h1>
          <p>
            Busca organizaciones por nombre de gremio, rubro, región,
            descripción o nombre del presidente.
          </p>
        </div>

        <div className="gremios-hero-number">
          <strong>{total || "+"}</strong>
          <small>gremios</small>
        </div>
      </div>

      <form className="gremios-search-panel" onSubmit={buscarGremios}>
        <div className="gremios-search-field">
          <span>Buscar</span>
          <input
            type="search"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            placeholder="Nombre, rubro, descripción o presidente..."
          />
        </div>

        <button type="submit">Buscar +</button>
      </form>

      {busquedaFinal && (
        <div className="gremios-active-search">
          <p>
            Resultado para: <strong>{busquedaFinal}</strong>
          </p>

          <button onClick={limpiarBusqueda}>Limpiar búsqueda</button>
        </div>
      )}

      {cargando ? (
        <div className="gremios-loading">Cargando gremios...</div>
      ) : gremios.length === 0 ? (
        <div className="gremios-empty">
          <h2>No se encontraron gremios</h2>
          <p>Probá con otro nombre, rubro, región o presidente.</p>
        </div>
      ) : (
        <>
          <div className="gremios-grid">
            {gremios.map((gremio) => {
              const presidente = gremio.integrantes?.find((i) =>
                i.cargo?.toLowerCase().includes("presidente")
              );

              return (
                <Link
                  key={gremio.id}
                  to={`/gremios/${gremio.id}`}
                  className="gremio-card"
                >
                  <div className="gremio-logo-box">
                    {gremio.logoUrl ? (
                      <img src={gremio.logoUrl} alt={gremio.nombre} />
                    ) : (
                      <span>{gremio.nombre.charAt(0)}</span>
                    )}
                  </div>

                  <div className="gremio-card-body">
                    <h2>{gremio.nombre}</h2>

                    <div className="gremio-tags">
                      <span>{gremio.rubro || "Sin rubro"}</span>
                      <span>{gremio.region || "Sin región"}</span>
                    </div>

                    {presidente && (
                      <p className="gremio-presidente">
                        Presidente: {presidente.nombre}
                      </p>
                    )}
                  </div>

                  <div className="gremio-card-footer">Ver ficha +</div>
                </Link>
              );
            })}
          </div>

          <div className="gremios-pagination">
            <button
              disabled={page <= 1}
              onClick={() => setPage((prev) => prev - 1)}
            >
              Anterior
            </button>

            <span>
              Página <strong>{page}</strong> de <strong>{totalPages}</strong>
            </span>

            <button
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </section>
  );
}