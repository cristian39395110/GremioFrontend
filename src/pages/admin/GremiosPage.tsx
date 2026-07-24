import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./GremiosPage.css";

import { REGIONES, RUBROS } from "../../constants/gremios";

import {
  FaEye,
  FaEdit,
  FaTrash,
  FaSyncAlt,
  FaPlus,
  FaBroom,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001";

type Gremio = {
  id: number;
  nombre: string;
  rut?: string | null;
  rubro?: string | null;
  region?: string | null;
  estado?: string | null;
};

type RespuestaGremios = {
  ok: boolean;
  gremios: Gremio[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  message?: string;
};

export default function GremiosPage({
  estadoInicial = "",
}: {
  estadoInicial?: string;
}) {
  const navigate = useNavigate();

  const [gremios, setGremios] = useState<Gremio[]>([]);

  const [qNombre, setQNombre] = useState("");
  const [qRegion, setQRegion] = useState("");
  const [qRubro, setQRubro] = useState("");
  const [qEstado, setQEstado] = useState(estadoInicial);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGremios = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      params.set("page", String(page));
      params.set("limit", String(limit));

      if (qNombre.trim()) {
        params.set("buscar", qNombre.trim());
      }

      if (qRegion) {
        params.set("region", qRegion);
      }

      if (qRubro) {
        params.set("rubro", qRubro);
      }

      if (qEstado) {
        params.set("estado", qEstado);
      }

      const response = await fetch(
        `${API_URL}/api/admin/gremios?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data: RespuestaGremios = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Error al cargar gremios"
        );
      }

      setGremios(
        Array.isArray(data.gremios) ? data.gremios : []
      );

      setTotal(Number(data.total) || 0);
      setTotalPages(Number(data.totalPages) || 1);

      if (
        Number(data.page) > Number(data.totalPages) &&
        Number(data.totalPages) > 0
      ) {
        setPage(Number(data.totalPages));
      }
    } catch (err: any) {
      console.error("❌ Error loadGremios:", err);

      setGremios([]);
      setTotal(0);
      setTotalPages(1);
      setError(err.message || "Error al cargar gremios");
    } finally {
      setLoading(false);
    }
  };

  const eliminarGremio = async (id: number) => {
    if (!window.confirm("¿Eliminar este gremio?")) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/admin/gremios/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "token"
            )}`,
          },
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || "No se pudo eliminar"
        );
      }

      /*
       * Si borramos el único registro de una página que no es
       * la primera, retrocedemos una página.
       */
      if (gremios.length === 1 && page > 1) {
        setPage((paginaActual) => paginaActual - 1);
      } else {
        loadGremios();
      }
    } catch (err: any) {
      setError(err.message || "Error al eliminar");
    }
  };

  const limpiarFiltros = () => {
    setQNombre("");
    setQRegion("");
    setQRubro("");
    setQEstado(estadoInicial);
    setPage(1);
  };

  const paginaAnterior = () => {
    if (page <= 1 || loading) {
      return;
    }

    setPage((paginaActual) => paginaActual - 1);
  };

  const paginaSiguiente = () => {
    if (page >= totalPages || loading) {
      return;
    }

    setPage((paginaActual) => paginaActual + 1);
  };

  /*
   * Si cambia la sección entre todos y pendientes,
   * actualizamos el estado y volvemos a página 1.
   */
  useEffect(() => {
    setQEstado(estadoInicial);
    setPage(1);
  }, [estadoInicial]);

  /*
   * Al cambiar filtros volvemos a la página 1.
   */
  useEffect(() => {
    setPage(1);
  }, [qNombre, qRegion, qRubro, qEstado]);

  /*
   * Debounce de 400 ms:
   * evita hacer una consulta por cada tecla inmediatamente.
   */
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadGremios();
    }, 400);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [
    page,
    limit,
    qNombre,
    qRegion,
    qRubro,
    qEstado,
  ]);

  const primerRegistro =
    total === 0 ? 0 : (page - 1) * limit + 1;

  const ultimoRegistro = Math.min(page * limit, total);

  return (
    <div className="gremios-page">
      <div className="gremios-header">
        <div>
          <h2>
            {estadoInicial === "pendiente"
              ? "Gremios pendientes"
              : "Gremios"}
          </h2>

          <div className="gremios-sub">
            Listado y administración
          </div>
        </div>

        <button
          className="btn-primary"
          onClick={() =>
            navigate("/admin/gremios/nuevo")
          }
        >
          <FaPlus /> Nuevo Gremio
        </button>
      </div>

      <div className="filters-card">
        <div className="filters-grid">
          <div className="filter-item">
            <label>Nombre</label>

            <input
              value={qNombre}
              onChange={(e) =>
                setQNombre(e.target.value)
              }
              placeholder="Buscar por nombre…"
            />
          </div>

          <div className="filter-item">
            <label>Región</label>

            <select
              value={qRegion}
              onChange={(e) =>
                setQRegion(e.target.value)
              }
            >
              <option value="">Todas</option>

              {(REGIONES || []).map((region: string) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Rubro</label>

            <select
              value={qRubro}
              onChange={(e) =>
                setQRubro(e.target.value)
              }
            >
              <option value="">Todos</option>

              {(RUBROS || []).map((rubro: string) => (
                <option key={rubro} value={rubro}>
                  {rubro}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Estado</label>

            <select
              value={qEstado}
              onChange={(e) =>
                setQEstado(e.target.value)
              }
            >
              <option value="">Todos</option>
              <option value="pendiente">
                Pendientes
              </option>
              <option value="aprobado">
                Aprobados
              </option>
              <option value="rechazado">
                Rechazados
              </option>
            </select>
          </div>

          <div className="filter-actions">
            <button
              className="btn-action"
              type="button"
              onClick={limpiarFiltros}
            >
              <FaBroom /> Limpiar
            </button>

            <button
              className="btn-action icon-only"
              type="button"
              onClick={loadGremios}
              title="Refrescar"
              disabled={loading}
            >
              <FaSyncAlt />
            </button>
          </div>
        </div>

        <div className="filters-info">
          {total > 0 ? (
            <>
              Mostrando{" "}
              <strong>
                {primerRegistro}-{ultimoRegistro}
              </strong>{" "}
              de <strong>{total}</strong>
            </>
          ) : (
            <>
              Mostrando <strong>0</strong> resultados
            </>
          )}
        </div>
      </div>

      {loading && (
        <div className="loader">
          Cargando gremios…
        </div>
      )}

      {error && (
        <div className="error-box">{error}</div>
      )}

      {!loading && !error && gremios.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔎</div>

          <h3>No hay resultados</h3>

          <p>
            No se encontraron gremios con los filtros
            seleccionados.
          </p>

          <button
            className="btn-secondary"
            onClick={limpiarFiltros}
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {!loading && !error && gremios.length > 0 && (
        <>
          <div className="gremios-table-wrapper">
            <table className="gremios-table">
              <thead>
                <tr>
                  <th className="col-nombre">
                    Nombre
                  </th>

                  <th className="col-rut">RUT</th>

                  <th className="col-rubro">
                    Rubro
                  </th>

                  <th className="col-acciones">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {gremios.map((gremio) => (
                  <tr key={gremio.id}>
                    <td className="col-nombre">
                      <div className="cell-title">
                        {gremio.nombre}
                      </div>

                      <div className="cell-sub">
                        {gremio.region || ""}
                      </div>
                    </td>

                    <td className="col-rut">
                      {gremio.rut || "—"}
                    </td>

                    <td className="col-rubro">
                      {gremio.rubro || "—"}
                    </td>

                    <td className="col-acciones">
                      <div className="actions-row">
                        <button
                          className="btn-icon view"
                          title="Ver"
                          onClick={() =>
                            navigate(
                              `/admin/gremios/${gremio.id}/ver`
                            )
                          }
                        >
                          <FaEye />
                        </button>

                        <button
                          className="btn-icon edit"
                          title="Editar"
                          onClick={() =>
                            navigate(
                              `/admin/gremios/${gremio.id}`
                            )
                          }
                        >
                          <FaEdit />
                        </button>

                        <button
                          className="btn-icon danger"
                          title="Eliminar"
                          onClick={() =>
                            eliminarGremio(gremio.id)
                          }
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="gremios-cards">
              {gremios.map((gremio) => (
                <div
                  key={gremio.id}
                  className="gremio-card"
                >
                  <div className="card-top">
                    <div>
                      <h4 className="card-title">
                        {gremio.nombre}
                      </h4>

                      <div className="card-sub">
                        {gremio.region || ""}
                      </div>
                    </div>

                    <div className="card-chip">
                      {gremio.rubro || "Sin rubro"}
                    </div>
                  </div>

                  <div className="card-kv">
                    <span>RUT</span>

                    <strong>
                      {gremio.rut || "—"}
                    </strong>
                  </div>

                  <div className="card-actions">
                    <button
                      className="btn-mini view"
                      onClick={() =>
                        navigate(
                          `/admin/gremios/${gremio.id}/ver`
                        )
                      }
                    >
                      <FaEye /> Ver
                    </button>

                    <button
                      className="btn-mini edit"
                      onClick={() =>
                        navigate(
                          `/admin/gremios/${gremio.id}`
                        )
                      }
                    >
                      <FaEdit /> Editar
                    </button>

                    <button
                      className="btn-mini danger"
                      onClick={() =>
                        eliminarGremio(gremio.id)
                      }
                    >
                      <FaTrash /> Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pagination">
            <button
              type="button"
              className="pagination-button"
              onClick={paginaAnterior}
              disabled={page <= 1 || loading}
            >
              <FaChevronLeft /> Anterior
            </button>

            <div className="pagination-info">
              Página <strong>{page}</strong> de{" "}
              <strong>{totalPages}</strong>
            </div>

            <button
              type="button"
              className="pagination-button"
              onClick={paginaSiguiente}
              disabled={
                page >= totalPages || loading
              }
            >
              Siguiente <FaChevronRight />
            </button>
          </div>
        </>
      )}
    </div>
  );
}