const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export async function obtenerGremiosPublicos(params?: {
  buscar?: string;
  page?: number;
  limit?: number;
  rubro?: string;
  region?: string;
}) {
  const query = new URLSearchParams();

  if (params?.buscar) query.append("buscar", params.buscar);
  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));
  if (params?.rubro) query.append("rubro", params.rubro);
  if (params?.region) query.append("region", params.region);

  const res = await fetch(`${API_URL}/api/public/gremios?${query.toString()}`);

  if (!res.ok) throw new Error("Error al obtener gremios");

  return res.json();
}

export async function obtenerGremioPublico(id: string | number) {
  const res = await fetch(`${API_URL}/api/public/gremios/${id}`);

  if (!res.ok) throw new Error("Error al obtener gremio");

  return res.json();
}

export async function registrarGremioPublico(formData: FormData) {
  const res = await fetch(`${API_URL}/api/public/registro-gremio`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Error al registrar gremio");
  }

  return res.json();
}

export async function obtenerGremiosPorRubro() {
  const res = await fetch(`${API_URL}/api/public/gremios-por-rubro`);

  if (!res.ok) throw new Error("Error al obtener gremios por rubro");

  return res.json();
}

export async function obtenerGremiosPorRegion() {
  const res = await fetch(`${API_URL}/api/public/gremios-por-region`);

  if (!res.ok) throw new Error("Error al obtener gremios por región");

  return res.json();
}