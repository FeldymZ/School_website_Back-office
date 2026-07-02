import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

import LoadingPage from "./components/common/LoadingPage";
import AdminLayout from "./layout/AdminLayout";

import LoginPage from "./pages/auth/LoginPage";
import ProtectedRoute from "./app/ProtectedRoute";
import MenuAccessProtectedRoute from "./app/MenuAccessProtectedRoute"; // 🆕

import { UserProvider } from "./context/UserContext"; // 🆕
import { LayoutProvider } from "./context/LayoutProvider";

import DashboardPage from "./pages/dashboard/DashboardPage";
import FormationsPage from "./pages/formations/FormationsPage";
import AgendaPage from "./pages/agenda/AgendaPage";
import ActualitesPage from "./pages/actualites/ActualitesPage";
import ActivitesPage from "./pages/activites/ActivitesPage";
import CommentairesPage from "./pages/commentaires/CommentairesPage";
import PartenairesPage from "./pages/partenaires/PartenairesPage";
import UsersPage from "./pages/utilisateurs/UsersPage";
import ConfigurationPage from "./pages/configuration/ConfigurationPage";

import ContactListPage from "./pages/contact/ContactListPage";
import ContactUnrepliedPage from "./pages/contact/ContactUnrepliedPage";
import ContactDetailsPage from "./pages/contact/ContactDetailsPage";

import KeyFiguresPage from "./pages/key-figures/KeyFiguresPage";

import BannerList from "./components/banners/BannerList";
import BannerMessagePage from "./pages/bannerMessage/BannerMessagePage";

import FormationsContinuesPage from "./pages/Formationscontinues/FormationsContinuesPage";
import DemandesDevisContinuesPage from "./pages/DemandesDevis/DemandesDevisContinuesPage";

import CategoriesPage from "./pages/categorie/CategoriesPage";
import SousCategoriesPage from "./pages/categorie/SousCategoriesPage";

import PreinscriptionsAdminPage from "./pages/admin/PreinscriptionsAdminPage";
import PreinscriptionConfigPage from "./pages/admin/PreinscriptionConfigPage";

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
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* ================= DASHBOARD — jamais restreint ================= */}
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />

        {/* ================= FORMATIONS INITIALES ================= */}
        <Route
          path="formations"
          element={
            <MenuAccessProtectedRoute permissionKey="FORMATIONS_FORMATIONS_INITIALES">
              <FormationsPage />
            </MenuAccessProtectedRoute>
          }
        />

        {/* ================= AGENDA ================= */}
        <Route
          path="agenda"
          element={
            <MenuAccessProtectedRoute permissionKey="COMMUNICATION_AGENDA">
              <AgendaPage />
            </MenuAccessProtectedRoute>
          }
        />

        {/* ================= FORMATIONS CONTINUES ================= */}
        <Route
          path="formations-continues"
          element={
            <MenuAccessProtectedRoute permissionKey="FORMATIONS_CONTINUES_FORMATIONS">
              <FormationsContinuesPage />
            </MenuAccessProtectedRoute>
          }
        />

        <Route
          path="categories"
          element={
            <MenuAccessProtectedRoute permissionKey="FORMATIONS_CONTINUES_CATEGORIES">
              <CategoriesPage />
            </MenuAccessProtectedRoute>
          }
        />

        <Route
          path="sous-categories"
          element={
            <MenuAccessProtectedRoute permissionKey="FORMATIONS_CONTINUES_SOUS_CATEGORIES">
              <SousCategoriesPage />
            </MenuAccessProtectedRoute>
          }
        />

        <Route
          path="demandes-devis"
          element={
            <MenuAccessProtectedRoute permissionKey="FORMATIONS_CONTINUES_DEVIS">
              <DemandesDevisContinuesPage />
            </MenuAccessProtectedRoute>
          }
        />

        {/* ================= PRÉINSCRIPTIONS ================= */}
        <Route
          path="preinscriptions"
          element={
            <MenuAccessProtectedRoute permissionKey="PREINSCRIPTIONS_DEMANDES">
              <PreinscriptionsAdminPage />
            </MenuAccessProtectedRoute>
          }
        />

        <Route
          path="preinscriptions/configuration"
          element={
            <MenuAccessProtectedRoute permissionKey="PREINSCRIPTIONS_PARAMETRES">
              <PreinscriptionConfigPage />
            </MenuAccessProtectedRoute>
          }
        />

        {/* ================= CONTENU ================= */}
        <Route
          path="actualites"
          element={
            <MenuAccessProtectedRoute permissionKey="COMMUNICATION_ACTUALITES">
              <ActualitesPage />
            </MenuAccessProtectedRoute>
          }
        />

        <Route
          path="activites"
          element={
            <MenuAccessProtectedRoute permissionKey="EDITORIAL_ACTIVITES">
              <ActivitesPage />
            </MenuAccessProtectedRoute>
          }
        />

        <Route
          path="banners"
          element={
            <MenuAccessProtectedRoute permissionKey="EDITORIAL_BANNERS">
              <BannerList />
            </MenuAccessProtectedRoute>
          }
        />

        <Route
          path="banner-messages"
          element={
            <MenuAccessProtectedRoute permissionKey="COMMUNICATION_BANNER_MESSAGES">
              <BannerMessagePage />
            </MenuAccessProtectedRoute>
          }
        />

        <Route
          path="commentaires"
          element={
            <MenuAccessProtectedRoute permissionKey="EDITORIAL_COMMENTAIRES">
              <CommentairesPage />
            </MenuAccessProtectedRoute>
          }
        />

        <Route
          path="partenaires"
          element={
            <MenuAccessProtectedRoute permissionKey="EDITORIAL_PARTENAIRES">
              <PartenairesPage />
            </MenuAccessProtectedRoute>
          }
        />

        {/* ================= CONTACT (= Messages) ================= */}
        <Route
          path="contact"
          element={
            <MenuAccessProtectedRoute permissionKey="COMMUNICATION_MESSAGES">
              <ContactListPage />
            </MenuAccessProtectedRoute>
          }
        />
        <Route
          path="contact/unreplied"
          element={
            <MenuAccessProtectedRoute permissionKey="COMMUNICATION_MESSAGES">
              <ContactUnrepliedPage />
            </MenuAccessProtectedRoute>
          }
        />
        <Route
          path="contact/:id"
          element={
            <MenuAccessProtectedRoute permissionKey="COMMUNICATION_MESSAGES">
              <ContactDetailsPage />
            </MenuAccessProtectedRoute>
          }
        />
        <Route path="messages" element={<Navigate to="/contact" replace />} />

        {/* ================= STATS ================= */}
        <Route
          path="statistiques"
          element={
            <MenuAccessProtectedRoute permissionKey="EDITORIAL_STATISTIQUES">
              <KeyFiguresPage />
            </MenuAccessProtectedRoute>
          }
        />

        {/* ================= ADMINISTRATION ================= */}
        <Route
          path="utilisateurs"
          element={
            <MenuAccessProtectedRoute permissionKey="ADMINISTRATION_UTILISATEURS">
              <UsersPage />
            </MenuAccessProtectedRoute>
          }
        />

        <Route
          path="configuration"
          element={
            <MenuAccessProtectedRoute permissionKey="ADMINISTRATION_AUDITS">
              <ConfigurationPage />
            </MenuAccessProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <UserProvider>
      <LayoutProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <AppRoutes />
        </BrowserRouter>
      </LayoutProvider>
    </UserProvider>
  );
};

export default App;