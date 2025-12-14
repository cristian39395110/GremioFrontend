import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./GremiosPage.css";
import { RUBROS } from "../../constants/gremios";

import { FaEye, FaEdit, FaTrash, FaSyncAlt, FaPlus, FaBroom } from "react-icons/fa";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";


export default function GremiosPage() {
  const navigate = useNavigate();

  const [gremios, setGremios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // filtros
  const [qNombre, setQNombre] = useState("");
  const [qRut, setQRut] = useState("");
  const [qRubro, setQRubro] = useState("");

  const loadGremios = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/admin/gremios`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Error al cargar gremios");
      setGremios(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const eliminarGremio = async (id: number) => {
    if (!window.confirm("¿Eliminar este gremio?")) return;

    try {
      const resp = await fetch(`${API_URL}/api/admin/gremios/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => null);
        throw new Error(data?.message || "No se pudo eliminar");
      }

      loadGremios();
    } catch (e: any) {
      setError(e.message || "Error al eliminar");
    }
  };

  useEffect(() => {
    loadGremios();
  }, []);

  // filtro en frontend (rápido)
  const gremiosFiltrados = useMemo(() => {
    const n = qNombre.trim().toLowerCase();
    const r = qRut.trim().toLowerCase();
    const rb = qRubro.trim().toLowerCase();

    return gremios.filter((g) => {
      const nombreOk = !n || String(g.nombre || "").toLowerCase().includes(n);
      const rutOk = !r || String(g.rut || "").toLowerCase().includes(r);
      const rubroOk = !rb || String(g.rubro || "").toLowerCase() === rb;
      return nombreOk && rutOk && rubroOk;
    });
  }, [gremios, qNombre, qRut, qRubro]);

  const limpiarFiltros = () => {
    setQNombre("");
    setQRut("");
    setQRubro("");
  };

  return (
    <div className="gremios-page">
      <div className="gremios-header">
        <div>
          <h2>Gremios</h2>
          <div className="gremios-sub">Listado y administración</div>
        </div>

        <button className="btn-primary" onClick={() => navigate("/admin/gremios/nuevo")}>
          <FaPlus /> Nuevo Gremio
        </button>
      </div>

      {/* filtros */}
      <div className="filters-card">
        <div className="filters-grid">
          <div className="filter-item">
            <label>Nombre</label>
            <input
              value={qNombre}
              onChange={(e) => setQNombre(e.target.value)}
              placeholder="Buscar por nombre…"
            />
          </div>

          <div className="filter-item">
            <label>RUT</label>
            <input
              value={qRut}
              onChange={(e) => setQRut(e.target.value)}
              placeholder="Buscar por RUT…"
            />
          </div>

          <div className="filter-item">
            <label>Rubro</label>
            <select value={qRubro} onChange={(e) => setQRubro(e.target.value)}>
              <option value="">Todos</option>
              {(RUBROS || []).map((r: string) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

<div className="filter-actions">
  <button className="btn-action" type="button" onClick={limpiarFiltros}>
    <FaBroom /> Limpiar
  </button>

  <button className="btn-action icon-only" type="button" onClick={loadGremios} title="Refrescar">
    <FaSyncAlt />
  </button>
</div>

        </div>

        <div className="filters-info">
          Mostrando <strong>{gremiosFiltrados.length}</strong> de{" "}
          <strong>{gremios.length}</strong>
        </div>
      </div>

      {loading && <div className="loader">Cargando gremios…</div>}
      {error && <div className="error-box">{error}</div>}

      {!loading && gremios.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🏛️</div>
          <h3>No hay gremios cargados</h3>
          <p>Comenzá creando el primer gremio del sistema.</p>
          <button className="btn-primary" onClick={() => navigate("/admin/gremios/nuevo")}>
            <FaPlus /> Crear Gremio
          </button>
        </div>
      )}

      {!loading && gremios.length > 0 && gremiosFiltrados.length === 0 && (
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
      {gremiosFiltrados.length > 0 && (
        <div className="gremios-table-wrapper">
          <table className="gremios-table">
            <thead>
              <tr>
                <th className="col-nombre">Nombre</th>
                <th className="col-rut">RUT</th>
                <th className="col-rubro">Rubro</th>
                <th className="col-acciones">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {gremiosFiltrados.map((g) => (
                <tr key={g.id}>
                  <td className="col-nombre">
                    <div className="cell-title">{g.nombre}</div>
                    <div className="cell-sub">{g.region || ""}</div>
                  </td>

                  <td className="col-rut">{g.rut}</td>
                  <td className="col-rubro">{g.rubro}</td>

                  <td className="col-acciones">
                    <div className="actions-row">
                      <button
                        className="btn-icon view"
                        title="Ver"
                        onClick={() => navigate(`/admin/gremios/${g.id}/ver`)}
                      >
                        <FaEye />
                      </button>

                      <button
                        className="btn-icon edit"
                        title="Editar"
                        onClick={() => navigate(`/admin/gremios/${g.id}`)}
                      >
                        <FaEdit />
                      </button>

                      <button
                        className="btn-icon danger"
                        title="Eliminar"
                        onClick={() => eliminarGremio(g.id)}
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
          <div className="gremios-cards">
            {gremiosFiltrados.map((g) => (
              <div key={g.id} className="gremio-card">
                <div className="card-top">
                  <div>
                    <h4 className="card-title">{g.nombre}</h4>
                    <div className="card-sub">{g.region || ""}</div>
                  </div>
                  <div className="card-chip">{g.rubro}</div>
                </div>

                <div className="card-kv">
                  <span>RUT</span>
                  <strong>{g.rut}</strong>
                </div>

                <div className="card-actions">
                  <button className="btn-mini view" onClick={() => navigate(`/admin/gremios/${g.id}/ver`)}>
                    <FaEye /> Ver
                  </button>
                  <button className="btn-mini edit" onClick={() => navigate(`/admin/gremios/${g.id}`)}>
                    <FaEdit /> Editar
                  </button>
                  <button className="btn-mini danger" onClick={() => eliminarGremio(g.id)}>
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
