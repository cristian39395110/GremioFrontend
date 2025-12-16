import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RegistradosPage.css";

import {
  REGIONES_CHILE,
  TIPOS_EMPRESA,
  NUM_TRABAJADORES,
  RUBROS_REGISTRO,
  GENEROS,
  ASESORIAS,
} from "../../constants/gremios";

import { FaEye, FaEdit, FaTrash, FaSyncAlt, FaPlus, FaBroom } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

type Registrado = {
  id: number;

  nombres: string;
  apellidos: string;
  genero?: string | null;
  fechaNacimiento?: string | null;

  rut?: string | null;
  telefono?: string | null;
  email?: string | null;

  region?: string | null;
  tipoEmpresa?: string | null;
  numeroTrabajadores?: string | null;
  rubro?: string | null;
  deseaAsesoria?: string | null;

  createdAt?: string;
};

export default function RegistradosPage() {
  const navigate = useNavigate();

  const [items, setItems] = useState<Registrado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // filtros
  const [qTexto, setQTexto] = useState("");
  const [qRegion, setQRegion] = useState("");
  const [qRubro, setQRubro] = useState("");
  const [qTipoEmpresa, setQTipoEmpresa] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const resp = await fetch(`${API_URL}/api/admin/registrados`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.message || "Error al cargar registrados");

      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  const eliminar = async (id: number) => {
    if (!window.confirm("¿Eliminar este registro?")) return;

    try {
      const resp = await fetch(`${API_URL}/api/admin/registrados/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => null);
        throw new Error(data?.message || "No se pudo eliminar");
      }

      load();
    } catch (e: any) {
      setError(e.message || "Error al eliminar");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtrados = useMemo(() => {
    const t = qTexto.trim().toLowerCase();
    const rg = qRegion.trim().toLowerCase();
    const rb = qRubro.trim().toLowerCase();
    const te = qTipoEmpresa.trim().toLowerCase();

    return items.filter((r) => {
      const full = `${r.nombres || ""} ${r.apellidos || ""}`.toLowerCase();

      const textoOk =
        !t ||
        full.includes(t) ||
        String(r.rut || "").toLowerCase().includes(t) ||
        String(r.email || "").toLowerCase().includes(t) ||
        String(r.telefono || "").toLowerCase().includes(t);

      const regionOk = !rg || String(r.region || "").toLowerCase() === rg;
      const rubroOk = !rb || String(r.rubro || "").toLowerCase() === rb;
      const tipoEmpresaOk = !te || String(r.tipoEmpresa || "").toLowerCase() === te;

      return textoOk && regionOk && rubroOk && tipoEmpresaOk;
    });
  }, [items, qTexto, qRegion, qRubro, qTipoEmpresa]);

  const limpiarFiltros = () => {
    setQTexto("");
    setQRegion("");
    setQRubro("");
    setQTipoEmpresa("");
  };

  return (
    <div className="registrados-page">
      <div className="registrados-header">
        <div>
          <h2>Registrados</h2>
          <div className="registrados-sub">Listado y administración</div>
        </div>

        <button className="btn-primary" onClick={() => navigate("/admin/registrados/nuevo")}>
          <FaPlus /> Nuevo Registro
        </button>
      </div>

      {/* filtros */}
      <div className="filters-card">
        <div className="filters-grid">
          <div className="filter-item">
            <label>Buscar</label>
            <input
              value={qTexto}
              onChange={(e) => setQTexto(e.target.value)}
              placeholder="Nombre, RUT, email o teléfono…"
            />
          </div>

          <div className="filter-item">
            <label>Región</label>
            <select value={qRegion} onChange={(e) => setQRegion(e.target.value)}>
              <option value="">Todas</option>
              {REGIONES_CHILE.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Rubro</label>
            <select value={qRubro} onChange={(e) => setQRubro(e.target.value)}>
              <option value="">Todos</option>
              {RUBROS_REGISTRO.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Tipo de empresa</label>
            <select value={qTipoEmpresa} onChange={(e) => setQTipoEmpresa(e.target.value)}>
              <option value="">Todos</option>
              {TIPOS_EMPRESA.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-actions">
            <button className="btn-action" type="button" onClick={limpiarFiltros}>
              <FaBroom /> Limpiar
            </button>

            <button className="btn-action icon-only" type="button" onClick={load} title="Refrescar">
              <FaSyncAlt />
            </button>
          </div>
        </div>

        <div className="filters-info">
          Mostrando <strong>{filtrados.length}</strong> de <strong>{items.length}</strong>
        </div>
      </div>

      {loading && <div className="loader">Cargando registrados…</div>}
      {error && <div className="error-box">{error}</div>}

      {!loading && items.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🧾</div>
          <h3>No hay registrados</h3>
          <p>Creá el primer registro para empezar.</p>
          <button className="btn-primary" onClick={() => navigate("/admin/registrados/nuevo")}>
            <FaPlus /> Crear registro
          </button>
        </div>
      )}

      {!loading && items.length > 0 && filtrados.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔎</div>
          <h3>No hay resultados</h3>
          <p>Probá cambiando los filtros.</p>
          <button className="btn-secondary" onClick={limpiarFiltros}>
            Limpiar filtros
          </button>
        </div>
      )}

      {/* DESKTOP tabla */}
      {filtrados.length > 0 && (
        <div className="registrados-table-wrapper">
          <table className="registrados-table">
            <thead>
              <tr>
                <th className="col-nombre">Nombre</th>
                <th className="col-rut">RUT</th>
                <th className="col-region">Región</th>
                <th className="col-rubro">Rubro</th>
                <th className="col-acciones">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filtrados.map((r) => (
                <tr key={r.id}>
                  <td className="col-nombre">
                    <div className="cell-title">{r.nombres} {r.apellidos}</div>
                    <div className="cell-sub">
                      {r.email ? `✉️ ${r.email}` : ""} {r.telefono ? `• 📞 ${r.telefono}` : ""}
                    </div>
                  </td>

                  <td className="col-rut">{r.rut || "—"}</td>
                  <td className="col-region">{r.region || "—"}</td>
                  <td className="col-rubro">{r.rubro || "—"}</td>

                  <td className="col-acciones">
                    <div className="actions-row">
                      <button
                        className="btn-icon view"
                        title="Ver"
                        onClick={() => navigate(`/admin/registrados/${r.id}/ver`)}
                      >
                        <FaEye />
                      </button>

                      <button
                        className="btn-icon edit"
                        title="Editar"
                        onClick={() => navigate(`/admin/registrados/${r.id}`)}
                      >
                        <FaEdit />
                      </button>

                      <button
                        className="btn-icon danger"
                        title="Eliminar"
                        onClick={() => eliminar(r.id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* MOBILE cards */}
          <div className="registrados-cards">
            {filtrados.map((r) => (
              <div key={r.id} className="registrado-card">
                <div className="card-top">
                  <div>
                    <h4 className="card-title">{r.nombres} {r.apellidos}</h4>
                    <div className="card-sub">{r.region || ""}</div>
                  </div>
                  <div className="card-chip">{r.rubro || "—"}</div>
                </div>

                <div className="card-kv">
                  <span>RUT</span>
                  <strong>{r.rut || "—"}</strong>
                </div>

                <div className="card-kv">
                  <span>Empresa</span>
                  <strong>{r.tipoEmpresa || "—"}</strong>
                </div>

                <div className="card-actions">
                  <button className="btn-mini view" onClick={() => navigate(`/admin/registrados/${r.id}/ver`)}>
                    <FaEye /> Ver
                  </button>
                  <button className="btn-mini edit" onClick={() => navigate(`/admin/registrados/${r.id}`)}>
                    <FaEdit /> Editar
                  </button>
                  <button className="btn-mini danger" onClick={() => eliminar(r.id)}>
                    <FaTrash /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
