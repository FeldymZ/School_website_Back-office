import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

/* ================= COMMON ================= */
import LoadingPage from "./components/common/LoadingPage";
import AdminLayout from "./layout/AdminLayout";

/* ================= AUTH ================= */
import LoginPage from "./pages/auth/LoginPage";
import ProtectedRoute from "./app/ProtectedRoute";
import RoleProtectedRoute from "./app/RoleProtectedRoute";

/* ================= CONTEXT ================= */
import { LayoutProvider } from "./context/LayoutProvider";

/* ================= PAGES ================= */
import DashboardPage from "./pages/dashboard/DashboardPage";
import FormationsPage from "./pages/formations/FormationsPage";
import AgendaPage from "./pages/agenda/AgendaPage";
import ActualitesPage from "./pages/actualites/ActualitesPage";
import CommentairesPage from "./pages/commentaires/CommentairesPage";
import PartenairesPage from "./pages/partenaires/PartenairesPage";
import UsersPage from "./pages/utilisateurs/UsersPage";
import ConfigurationPage from "./pages/configuration/ConfigurationPage";

/* ================= CONTACT ================= */
import ContactListPage from "./pages/contact/ContactListPage";
import ContactUnrepliedPage from "./pages/contact/ContactUnrepliedPage";
import ContactDetailsPage from "./pages/contact/ContactDetailsPage";

/* ================= STATISTIQUES ================= */
import KeyFiguresPage from "./pages/key-figures/KeyFiguresPage";

/* ================= BANNERS ================= */
import BannerList from "./components/banners/BannerList";

/* ================= UTILS ================= */
import { UserRole } from "./types/user";

/* ================= APP WRAPPER ================= */
const AppRoutes = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return (
      <LoadingPage
        onComplete={() => {
          setIsLoading(false);
          navigate("/login", { replace: true });
        }}
      />
    );
  }

  return (
    <Routes>
      {/* ================= LOGIN ================= */}
      <Route path="/login" element={<LoginPage />} />

      {/* ============== ZONE AUTHENTIFIÉE ============== */}
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />

        <Route path="formations" element={<FormationsPage />} />
        <Route path="agenda" element={<AgendaPage />} />
        <Route path="actualites" element={<ActualitesPage />} />
        <Route path="banners" element={<BannerList />} />
        <Route path="commentaires" element={<CommentairesPage />} />
        <Route path="partenaires" element={<PartenairesPage />} />

        <Route path="contact" element={<ContactListPage />} />
        <Route path="contact/unreplied" element={<ContactUnrepliedPage />} />
        <Route path="contact/:id" element={<ContactDetailsPage />} />

        <Route
          path="messages"
          element={<Navigate to="/contact" replace />}
        />

        <Route
          path="statistiques"
          element={<KeyFiguresPage />}
        />

        <Route
          path="utilisateurs"
          element={
            <RoleProtectedRoute allowedRoles={[UserRole.SUPERADMIN]}>
              <UsersPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="configuration"
          element={
            <RoleProtectedRoute allowedRoles={[UserRole.SUPERADMIN]}>
              <ConfigurationPage />
            </RoleProtectedRoute>
          }
        />
      </Route>

      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <LayoutProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <AppRoutes />
      </BrowserRouter>
    </LayoutProvider>
  );
};

export default App;
