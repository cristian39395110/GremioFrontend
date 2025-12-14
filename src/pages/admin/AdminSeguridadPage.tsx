import { useState } from "react";

import "./AdminSeguridadPage.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function AdminSeguridadPage() {
  const [email, setEmail] = useState("");
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");

  const cambiarEmail = async () => {
    await fetch(`${API_URL}/api/admin/cambiar-email`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ email }),
    });
    alert("Email actualizado");
  };

  const cambiarPassword = async () => {
    await fetch(`${API_URL}/api/admin/cambiar-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        passwordActual,
        passwordNueva,
      }),
    });
    alert("Contraseña actualizada");
  };

  return (
    <div className="seguridad-box">
      <h2>🔐 Seguridad de la cuenta</h2>

      <div className="seguridad-card">
        <h3>Cambiar email</h3>
        <input
          type="email"
          placeholder="Nuevo email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={cambiarEmail}>Actualizar email</button>
      </div>

      <div className="seguridad-card">
        <h3>Cambiar contraseña</h3>
        <input
          type="password"
          placeholder="Contraseña actual"
          value={passwordActual}
          onChange={(e) => setPasswordActual(e.target.value)}
        />
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={passwordNueva}
          onChange={(e) => setPasswordNueva(e.target.value)}
        />
        <button onClick={cambiarPassword}>Actualizar contraseña</button>
      </div>
    </div>
  );
}
