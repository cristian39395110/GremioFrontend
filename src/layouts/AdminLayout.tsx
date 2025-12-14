import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearToken } from "../config/auth";
import "./AdminLayout.css";

export default function AdminLayout() {
  const navigate = useNavigate();

  const logout = () => {
    clearToken();
    localStorage.removeItem("usuario");
    navigate("/admin/login");
  };

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-brand">
          <img src="/images/logo-MG.png" alt="MG" className="admin-logo" />
          <div className="admin-brand-text">
            <div className="admin-title">Multigremial</div>
            <div className="admin-subtitle">Administración</div>
          </div>
        </div>

        <button className="admin-logout" onClick={logout}>
          Cerrar sesión
        </button>
      </header>

      <div className="admin-body">
        <aside className="admin-sidebar">
          <NavLink
            to="/admin/gremios"
            className={({ isActive }) => (isActive ? "side-item active" : "side-item")}
          >
            🏛️ Gremios
          </NavLink>

          {/* después lo activamos */}
          <NavLink
            to="/admin/integrantes"
            className={({ isActive }) => (isActive ? "side-item active" : "side-item")}
          >
            👥 Integrantes
          </NavLink>

          <NavLink
  to="/admin/seguridad"
  className={({ isActive }) => (isActive ? "side-item active" : "side-item")}
>
  🔐 Seguridad
</NavLink>

        </aside>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
