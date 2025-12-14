import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/admin/LoginPage";
import GremiosPage from "./pages/admin/GremiosPage";
import NuevoGremioPage from "./pages/admin/NuevoGremioPage";
import GremioDetallePage from "./pages/admin/GremioDetallePage";
import AdminSeguridadPage from "./pages/admin/AdminSeguridadPage";

import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./components/admin/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ADMIN LOGIN */}
        <Route path="/admin/login" element={<LoginPage />} />

        {/* ADMIN PROTEGIDO (Layout + Outlet) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* al entrar a /admin */}
          <Route index element={<Navigate to="gremios" replace />} />

          {/* gremios */}
          <Route path="gremios" element={<GremiosPage />} />
          <Route path="gremios/nuevo" element={<NuevoGremioPage />} />
          <Route path="gremios/:id" element={<NuevoGremioPage />} />
          <Route path="gremios/:id/ver" element={<GremioDetallePage />} />

          {/* seguridad */}
          <Route path="seguridad" element={<AdminSeguridadPage />} />

          {/* más rutas de admin como 'integrantes' */}
          {/* <Route path="integrantes" element={<IntegrantesPage />} /> */}
        </Route>

        {/* raíz y 404 */}
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
