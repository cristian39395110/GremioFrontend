import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearToken } from "../config/auth";
import "./AdminLayout.css";
import { useEffect, useState } from "react";

export default function AdminLayout() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const [pendientes, setPendientes] = useState(0);

  const logout = () => {
    clearToken();
    localStorage.removeItem("usuario");
    navigate("/admin/login");
  };

  useEffect(() => {
  cargarPendientes();
}, []);

async function cargarPendientes() {
  try {
    const resp = await fetch(
      `${API_URL}/api/admin/gremios/contador/pendientes`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const data = await resp.json();

    setPendientes(data.cantidad || 0);
  } catch (e) {
    console.error(e);
  }
}

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

<NavLink
  to="/admin/gremios-pendientes"
  className={({ isActive }) =>
    isActive ? "side-item active" : "side-item"
  }
>
  <span>⏳ Gremios pendientes</span>

  {pendientes > 0 && (
    <span className="side-badge">
      {pendientes}
    </span>
  )}
</NavLink>

          {/* después lo activamos */}
      
           <NavLink
            to="/admin/registrados"
            className={({ isActive }) => (isActive ? "side-item active" : "side-item")}
          >
            👥 Registrados
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
