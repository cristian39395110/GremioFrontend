import { Link, NavLink, Outlet } from "react-router-dom";
import "./PublicLayout.css";

export default function PublicLayout() {
  return (
    <div className="public-layout">
      <header className="public-header">
        <div className="public-header-inner">
         <Link to="/" className="public-logo">
  <img
    src="/images/logo-multigremial.png"
    alt="Multigremial Nacional"
  />
</Link>

<nav className="public-nav">
  <NavLink to="/" end>
    Inicio
  </NavLink>

  <NavLink to="/gremios">
    Gremios
  </NavLink>

  <NavLink to="/rubros">
    Rubros
  </NavLink>

  <NavLink to="/regiones">
    Regiones
  </NavLink>

  <NavLink to="/registro-gremio" className="public-nav-button">
    Registrar gremio
  </NavLink>
</nav>
        </div>
      </header>

      <main className="public-main">
        <Outlet />
      </main>

      <footer className="public-footer">
        <div className="public-footer-inner">
          <div>
            <strong>Multigremial Chile</strong>
            <p>Los gremios mueven a Chile.</p>
          </div>

          <div className="public-footer-links">
            <Link to="/gremios">Gremios</Link>
            <Link to="/registro-gremio">Registrar gremio</Link>
          
          </div>
        </div>
      </footer>
    </div>
  );
}