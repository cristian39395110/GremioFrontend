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
  const [slideActual, setSlideActual] = useState(0);
const [cargando, setCargando] = useState(true);

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
  } finally {
    setCargando(false);
  }
};

  const totalGremios = useMemo(() => {
    if (!Array.isArray(rubros)) return 0;

    return rubros.reduce((acc, item) => acc + Number(item.total || 0), 0);
  }, [rubros]);
  const slides = [
  {
    imagen:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1600&q=85",
    titulo: "Somos la Multigremial más grande de Chile",
    etiqueta: "Multigremial Chile",
    boton: "VER GREMIOS +",
    link: "/gremios",
  },
  {
    imagen:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=85",
    titulo: cargando
      ? "Conectando a los gremios de Chile"
      : `Somos ${totalGremios} gremios a lo largo de todo Chile`,
    etiqueta: "Directorio gremial",
    boton: "BUSCAR +",
    link: "/gremios",
  },
  {
    imagen:
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1600&q=85",
    titulo: "Registra tu gremio aquí",
    etiqueta: "Registro público",
    boton: "REGISTRAR +",
    link: "/registro-gremio",
  },
];

const siguienteSlide = () => {
  setSlideActual((prev) =>
    prev === slides.length - 1 ? 0 : prev + 1
  );
};

const anteriorSlide = () => {
  setSlideActual((prev) =>
    prev === 0 ? slides.length - 1 : prev - 1
  );
};  
useEffect(() => {
  const intervalo = setInterval(() => {
    setSlideActual((prev) =>
      prev === slides.length - 1 ? 0 : prev + 1
    );
  }, 5000);

  return () => clearInterval(intervalo);
}, []);

  return (
    <div className="home-mg">
  <section className="home-carousel">
  <Link
    to={slides[slideActual].link}
    className="home-carousel-slide"
  >
    <img
      src={slides[slideActual].imagen}
      alt={slides[slideActual].titulo}
    />

    <div className="home-card-overlay" />

    <div className="home-carousel-content">
      <span>{slides[slideActual].etiqueta}</span>

      <h1>{slides[slideActual].titulo}</h1>

      <small>{slides[slideActual].boton}</small>
    </div>
  </Link>

  <button
    type="button"
    className="home-carousel-arrow home-carousel-arrow-left"
    onClick={(e) => {
      e.preventDefault();
      anteriorSlide();
    }}
    aria-label="Imagen anterior"
  >
    ‹
  </button>

  <button
    type="button"
    className="home-carousel-arrow home-carousel-arrow-right"
    onClick={(e) => {
      e.preventDefault();
      siguienteSlide();
    }}
    aria-label="Imagen siguiente"
  >
    ›
  </button>

  <div className="home-carousel-dots">
    {slides.map((_, index) => (
      <button
        key={index}
        type="button"
        className={index === slideActual ? "active" : ""}
        onClick={() => setSlideActual(index)}
        aria-label={`Ir a imagen ${index + 1}`}
      />
    ))}
  </div>
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