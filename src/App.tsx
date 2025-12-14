import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/admin/LoginPage";
import GremiosPage from "./pages/admin/GremiosPage";
import NuevoGremioPage from "./pages/admin/NuevoGremioPage";  // Importa la página de nuevo gremio
import GremioDetallePage from "./pages/admin/GremioDetallePage";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./components/admin/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ADMIN LOGIN */}
        <Route path="/admin/login" element={<LoginPage />} />

        {/* ADMIN PROTEGIDO */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/gremios" replace />} />
          <Route path="gremios" element={<GremiosPage />} />
          <Route path="gremios/nuevo" element={<NuevoGremioPage />} /> {/* Ruta para Nuevo Gremio */}
          <Route path="gremios/:id" element={<NuevoGremioPage />} /> {/* Ruta para Editar Gremio */}

          <Route path="gremios/:id/ver" element={<GremioDetallePage />} />

          {/* más rutas de admin como 'integrantes' */}
        </Route>

        {/* Redirección a login si no está logueado */}
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
