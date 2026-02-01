import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import { getUserFromToken } from "./utils/auth";

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  /* ================= LOADING VISUEL ================= */
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingPage />;
  }

  const user = getUserFromToken();

  return (
    <LayoutProvider>
      <BrowserRouter>
        {/* 🔔 TOAST GLOBAL */}
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

        <Routes>
          {/* ================= LOGIN ================= */}
          <Route
            path="/login"
            element={
              user ? <Navigate to="/dashboard" replace /> : <LoginPage />
            }
          />

          {/* ============== ZONE AUTHENTIFIÉE ============== */}
          <Route
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* ===== Dashboard ===== */}
            <Route index element={<DashboardPage />} />
            <Route path="dashboard" element={<DashboardPage />} />

            {/* ===== Modules ===== */}
            <Route path="formations" element={<FormationsPage />} />
            <Route path="agenda" element={<AgendaPage />} />
            <Route path="actualites" element={<ActualitesPage />} />
            <Route path="banners" element={<BannerList />} />
            <Route path="commentaires" element={<CommentairesPage />} />
            <Route path="partenaires" element={<PartenairesPage />} />

            {/* ================= CONTACT ================= */}
            <Route path="contact" element={<ContactListPage />} />
            <Route
              path="contact/unreplied"
              element={<ContactUnrepliedPage />}
            />
            <Route
              path="contact/:id"
              element={<ContactDetailsPage />}
            />

            {/* 🔁 Alias UX */}
            <Route
              path="messages"
              element={<Navigate to="/contact" replace />}
            />

            {/* ================= STATISTIQUES ================= */}
            <Route
              path="statistiques"
              element={<KeyFiguresPage />}
            />

            {/* ============== SUPERADMIN ONLY ============== */}
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
          <Route
            path="*"
            element={
              <Navigate
                to={user ? "/dashboard" : "/login"}
                replace
              />
            }
          />
        </Routes>
      </BrowserRouter>
    </LayoutProvider>
  );
};

export default App;
