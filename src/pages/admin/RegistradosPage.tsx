import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RegistradosPage.css";

import { TIPOS_EMPRESA, RUBROS_REGISTRO } from "../../constants/gremios";
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
  comuna?: string | null;
  tipoEmpresa?: string | null;
  numeroTrabajadores?: string | null;
  rubro?: string | null;
  asesoriaSobre?: string | null;
  createdAt?: string;
};

type RegionAPI = { codigo: string; nombre: string; tipo?: string };

type ListaResponse = {
  rows: Registrado[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export default function RegistradosPage() {
  const navigate = useNavigate();

  const [items, setItems] = useState<Registrado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [regionesApi, setRegionesApi] = useState<RegionAPI[]>([]);
  const [loadingRegiones, setLoadingRegiones] = useState(false);

  // filtros (igual que antes)
  const [qTexto, setQTexto] = useState("");
  const [qRegion, setQRegion] = useState("");
  const [qRubro, setQRubro] = useState("");
  const [qTipoEmpresa, setQTipoEmpresa] = useState("");

  // paginación
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10); // si querés selector, lo armamos después
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const buildParams = () => {
    const params = new URLSearchParams();
    if (qTexto.trim()) params.set("q", qTexto.trim());
    if (qRegion) params.set("region", qRegion);
    if (qRubro) params.set("rubro", qRubro);
    if (qTipoEmpresa) params.set("tipoEmpresa", qTipoEmpresa);
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    return params;
  };

  const loadRegiones = async () => {
    setLoadingRegiones(true);
    try {
      const resp = await fetch(`${API_URL}/api/admin/registros/regiones`);
      const data = await resp.json().catch(() => null);
      if (!resp.ok) throw new Error(data?.message || "No pude cargar regiones");

      const regionesOk = Array.isArray(data)
        ? data.filter((x) => x?.tipo === "region" && x?.nombre)
        : [];

      regionesOk.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
      setRegionesApi(regionesOk);
    } catch (e) {
      console.error(e);
      setRegionesApi([]);
    } finally {
      setLoadingRegiones(false);
    }
  };

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const resp = await fetch(`${API_URL}/api/admin/registros?${buildParams().toString()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const data: ListaResponse = await resp.json();
      if (!resp.ok) throw new Error((data as any)?.message || "Error al cargar registrados");

      setItems(Array.isArray(data.rows) ? data.rows : []);
      setTotalCount(Number.isFinite(data.count) ? data.count : 0);
      setTotalPages(Number.isFinite(data.totalPages) ? data.totalPages : 1);
    } catch (e: any) {
      setError(e.message || "Error");
      setItems([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const eliminar = async (id: number) => {
    if (!window.confirm("¿Eliminar este registro?")) return;

    try {
      const resp = await fetch(`${API_URL}/api/admin/registros/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => null);
        throw new Error(data?.message || "No se pudo eliminar");
      }

      // si borraste el último de una página, podés quedar en página vacía
      // recargo y si hace falta retrocedo
      await load();
      if (items.length === 1 && page > 1) setPage((p) => p - 1);
    } catch (e: any) {
      setError(e.message || "Error al eliminar");
    }
  };

  const limpiarFiltros = () => {
    setQTexto("");
    setQRegion("");
    setQRubro("");
    setQTipoEmpresa("");
    setPage(1);
  };

  // cargar regiones una vez
  useEffect(() => {
    loadRegiones();
  }, []);

  // cuando cambian filtros, volvés a página 1
  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qTexto, qRegion, qRubro, qTipoEmpresa]);

  // cargar cada vez que cambian page o filtros
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, qTexto, qRegion, qRubro, qTipoEmpresa]);

  // Para no romper tu UI: "filtrados" ahora ES lo que trae el servidor (página actual)
  const filtrados = useMemo(() => items, [items]);

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
            <select
              value={qRegion}
              onChange={(e) => setQRegion(e.target.value)}
              disabled={loadingRegiones}
            >
              <option value="">{loadingRegiones ? "Cargando..." : "Todas"}</option>

              {regionesApi.map((r) => (
                <option key={r.codigo} value={r.nombre}>
                  {r.nombre}
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

            <button
              className="btn-action icon-only"
              type="button"
              onClick={() => load()}
              title="Refrescar"
            >
              <FaSyncAlt />
            </button>
          </div>
        </div>

        <div className="filters-info">
          Mostrando <strong>{filtrados.length}</strong> de <strong>{totalCount}</strong>
          {totalPages > 1 ? (
            <>
              {" "}
              • Página <strong>{page}</strong> de <strong>{totalPages}</strong>
            </>
          ) : null}
        </div>
      </div>

      {loading && <div className="loader">Cargando registrados…</div>}
      {error && <div className="error-box">{error}</div>}

      {!loading && totalCount === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🧾</div>
          <h3>No hay registrados</h3>
          <p>Creá el primer registro para empezar.</p>
          <button className="btn-primary" onClick={() => navigate("/admin/registrados/nuevo")}>
            <FaPlus /> Crear registro
          </button>
        </div>
      )}

      {!loading && totalCount > 0 && filtrados.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔎</div>
          <h3>No hay resultados</h3>
          <p>Probá cambiando los filtros.</p>
          <button className="btn-secondary" onClick={limpiarFiltros}>
            Limpiar filtros
          </button>
        </div>
      )}

      {/* DESKTOP tabla + MOBILE cards */}
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
                    <div className="cell-title">
                      {r.nombres} {r.apellidos}
                    </div>
                    <div className="cell-sub">
                      {r.email ? `✉️ ${r.email}` : ""}{" "}
                      {r.telefono ? `• 📞 ${r.telefono}` : ""}
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
                        onClick={() => navigate(`/admin/registrados/${r.id}/editar`)}
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

          <div className="registrados-cards">
            {filtrados.map((r) => (
              <div key={r.id} className="registrado-card">
                <div className="card-top">
                  <div>
                    <h4 className="card-title">
                      {r.nombres} {r.apellidos}
                    </h4>
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
                  <button
                    className="btn-mini view"
                    onClick={() => navigate(`/admin/registrados/${r.id}/ver`)}
                  >
                    <FaEye /> Ver
                  </button>
                  <button
                    className="btn-mini edit"
                    onClick={() => navigate(`/admin/registrados/${r.id}/editar`)}
                  >
                    <FaEdit /> Editar
                  </button>
                  <button className="btn-mini danger" onClick={() => eliminar(r.id)}>
                    <FaTrash /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Paginación (flechas) - no rompe tu estilo, usa btn-action */}
          {totalPages > 1 && (
            <div className="pager">
              <button
                className="btn-action"
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ← Anterior
              </button>

              <div className="pager-info">
                Página <strong>{page}</strong> de <strong>{totalPages}</strong>
              </div>

              <button
                className="btn-action"
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Siguiente →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
