import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/admin/LoginPage";
import GremiosPage from "./pages/admin/GremiosPage";
import NuevoGremioPage from "./pages/admin/NuevoGremioPage";
import GremioDetallePage from "./pages/admin/GremioDetallePage";
import AdminSeguridadPage from "./pages/admin/AdminSeguridadPage";

import RegistradoDetallePage from "./pages/admin/RegistradoDetallePage";
import NuevoRegistradoPage from "./pages/admin/NuevoRegistradoPage";
import RegistradosPage from "./pages/admin/RegistradosPage";

import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./components/admin/ProtectedRoute";

import HomePublicPage from "./pages/public/HomePublicPage";
import GremiosPublicPage from "./pages/public/GremiosPublicPage";
import GremioPublicDetallePage from "./pages/public/GremioPublicDetallePage";
import PublicLayout from "./layouts/PublicLayout";
import RubrosPublicPage from "./pages/public/RubrosPublicPage";
import RegionesPublicPage from "./pages/public/RegionesPublicPage";
import RegistroGremioPage from "./pages/public/RegistroGremioPage"; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLICO */}
        <Route element={<PublicLayout />}>
    <Route index element={<HomePublicPage />} />

    <Route path="/gremios" element={<GremiosPublicPage />} />
    <Route path="/gremios/:id" element={<GremioPublicDetallePage />} />

    <Route path="/rubros" element={<RubrosPublicPage />} />
    <Route path="/regiones" element={<RegionesPublicPage />} />

    <Route path="/registro-gremio" element={<RegistroGremioPage />} />
  </Route>

  {/* FORMULARIO PARA IFRAME */}
<Route
  path="/iframe/registro-gremio"
  element={<RegistroGremioPage modoIframe />}
/>

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
          <Route index element={<Navigate to="gremios" replace />} />

<Route path="gremios" element={<GremiosPage estadoInicial="aprobado" />} />

<Route
  path="gremios-pendientes"
  element={<GremiosPage estadoInicial="pendiente" />}
/>

<Route path="gremios/nuevo" element={<NuevoGremioPage />} />
<Route path="gremios/:id" element={<NuevoGremioPage />} />
<Route path="gremios/:id/ver" element={<GremioDetallePage />} />

          <Route path="registrados" element={<RegistradosPage />} />
          <Route path="registrados/nuevo" element={<NuevoRegistradoPage />} />
          <Route path="registrados/:id/ver" element={<RegistradoDetallePage />} />
          <Route path="registrados/:id/editar" element={<RegistradoDetallePage />} />

          <Route path="seguridad" element={<AdminSeguridadPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;