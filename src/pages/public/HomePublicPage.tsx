import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  obtenerGremiosPublicos,
  obtenerGremiosPorRubro,
  obtenerGremiosPorRegion,
} from "../../services/publicApi";
import "./HomePublicPage.css";

type Gremio = {
  id: number;
  nombre: string;
  rubro: string;
  region: string;
  descripcion?: string;
  logoUrl?: string;
};

type Grupo = {
  nombre: string;
  total: number;
};

export default function HomePublicPage() {
  const [gremios, setGremios] = useState<Gremio[]>([]);
  const [rubros, setRubros] = useState<Grupo[]>([]);
  const [, setRegiones] = useState<Grupo[]>([]);

  useEffect(() => {
    cargarHome();
  }, []);

  const cargarHome = async () => {
    try {
      const [gremiosData, rubrosData, regionesData] = await Promise.all([
        obtenerGremiosPublicos({ page: 1, limit: 8 }),
        obtenerGremiosPorRubro(),
        obtenerGremiosPorRegion(),
      ]);

      setGremios(gremiosData.gremios || []);

      setRubros(
        Array.isArray(rubrosData) ? rubrosData : rubrosData.rubros || []
      );

      setRegiones(
        Array.isArray(regionesData) ? regionesData : regionesData.regiones || []
      );
    } catch (error) {
      console.error("Error cargando home público:", error);
    }
  };

  const totalGremios = useMemo(() => {
    if (!Array.isArray(rubros)) return 0;

    return rubros.reduce((acc, item) => acc + Number(item.total || 0), 0);
  }, [rubros]);

  return (
    <div className="home-mg">
      <section className="home-marquee-grid">
        <Link to="/gremios" className="home-marquee-card home-marquee-main">
          <img
            src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80"
            alt="Multigremial Chile"
          />
          <div className="home-card-overlay" />

          <div className="home-card-content">
            <span>Multigremial Chile</span>
            <h1>Somos la Multigremial más grande de Chile</h1>
            <small>VER GREMIOS +</small>
          </div>
        </Link>

        <Link to="/gremios" className="home-marquee-card">
          <img
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80"
            alt="Gremios de Chile"
          />
          <div className="home-card-overlay" />

          <div className="home-card-content">
            <span>Directorio gremial</span>
            <h2>
              Somos {totalGremios || "XXX"} gremios a lo largo de todo Chile
            </h2>
            <small>BUSCAR +</small>
          </div>
        </Link>

        <Link to="/registro-gremio" className="home-marquee-card">
          <img
            src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80"
            alt="Registrar gremio"
          />
          <div className="home-card-overlay home-card-overlay-blue" />

          <div className="home-card-content">
            <span>Registro público</span>
            <h2>Registra tu gremio aquí</h2>
            <small>REGISTRAR +</small>
          </div>
        </Link>
      </section>

      <section className="home-slogan">
        <p>LOS GREMIOS MUEVEN A CHILE</p>
      </section>

      <section className="home-quick-links">
        <Link to="/gremios" className="home-big-link">
          <div>
            <span>Directorio</span>
            <h3>Listado de gremios</h3>
            <p>Busca gremios por nombre, rubro, región o descripción.</p>
          </div>
          <strong>VER +</strong>
        </Link>

        <Link to="/rubros" className="home-big-link">
          <div>
            <span>Rubros</span>
            <h3>Gremios agrupados por rubro</h3>
            <p>Explora la representación gremial según actividad.</p>
          </div>
          <strong>VER +</strong>
        </Link>

        <Link to="/regiones" className="home-big-link">
          <div>
            <span>Regiones</span>
            <h3>Gremios agrupados por región</h3>
            <p>Conoce la presencia gremial a lo largo del país.</p>
          </div>
          <strong>VER +</strong>
        </Link>
      </section>

      <section className="home-section">
        <div className="home-section-title">
          <span>Últimos gremios</span>
          <h2>Organizaciones registradas</h2>
        </div>

        <div className="home-gremios-list">
          {gremios.map((gremio) => (
            <Link
              key={gremio.id}
              to={`/gremios/${gremio.id}`}
              className="home-gremio-box"
            >
              <div className="home-gremio-logo">
                {gremio.logoUrl ? (
                  <img src={gremio.logoUrl} alt={gremio.nombre} />
                ) : (
                  <span>{gremio.nombre.charAt(0)}</span>
                )}
              </div>

              <h3>{gremio.nombre}</h3>
              <p>{gremio.rubro}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}