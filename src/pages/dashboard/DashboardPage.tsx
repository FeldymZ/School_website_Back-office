import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Users,
  Calendar,
  Newspaper,
  Mail,
  Clock,
  CheckCircle,
  ArrowUpRight,
  Activity,
  Sparkles,
  Award,
  BookOpen,
  AlertCircle,
  Grid3x3, // ✅ AJOUT pour l'icône activités
} from "lucide-react";

import { DashboardService } from "../../services/dashboard.service";
import DashboardCharts from "../../components/dashboard/DashboardCharts";
import KpiCard from "../../components/dashboard/KpiCard";
import LoadingDashboard from "../../components/dashboard/LoadingDashboard";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [stats, setStats] = useState({
    formations: 0,
    licences: 0,
    masters: 0,
    preinscriptions: 0,
    preinscriptionsAttente: 0,
    actualites: 0,
    activites: 0, // ✅ AJOUT
    partenaires: 0,
    messages: 0,
    eventsUpcoming: 0,
    eventsPast: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          formations,
          licences,
          masters,
          preinscriptions,
          enAttente,
          actualites,
          activites, // ✅ AJOUT
          partenaires,
          messages,
          upcoming,
          past,
        ] = await Promise.all([
          DashboardService.getFormationsCount(),
          DashboardService.getFormationsLicenceCount(),
          DashboardService.getFormationsMasterCount(),
          DashboardService.getPreinscriptionsTotal(),
          DashboardService.getPreinscriptionsEnAttente(),
          DashboardService.getActualitesCount(),
          DashboardService.getActivitesCount(), // ✅ AJOUT
          DashboardService.getPartenairesCount(),
          DashboardService.getMessagesCount(),
          DashboardService.getEvenementsAVenir(),
          DashboardService.getEvenementsPasses(),
        ]);

        setStats({
          formations,
          licences,
          masters,
          preinscriptions,
          preinscriptionsAttente: enAttente,
          actualites,
          activites, // ✅ AJOUT
          partenaires,
          messages,
          eventsUpcoming: upcoming,
          eventsPast: past,
        });
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <LoadingDashboard />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full mb-6 shadow-lg">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            Erreur de chargement
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Une erreur est survenue lors du chargement des statistiques. Veuillez réessayer.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const chartData = [
    { name: "Formations", value: stats.formations, color: "#00A4E0" },
    { name: "Préinscriptions", value: stats.preinscriptions, color: "#8B5CF6" },
    { name: "Actualités", value: stats.actualites, color: "#10B981" },
    { name: "Activités", value: stats.activites, color: "#F59E0B" }, // ✅ AJOUT
    { name: "Messages", value: stats.messages, color: "#EF4444" },
  ];

  const pieData = [
    { name: "À venir", value: stats.eventsUpcoming },
    { name: "Passés", value: stats.eventsPast },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-4">
      <div className="max-w-[1600px] mx-auto space-y-5">
        {/* Header avec effet glassmorphism */}
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="text-white" size={24} />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Tableau de bord
                </h1>
              </div>
              <p className="text-gray-600 text-lg ml-15">
                Bienvenue sur votre plateforme de gestion ESIITECH GABON
              </p>
            </div>
            <div className="hidden lg:flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-4 py-2 bg-white/50 backdrop-blur rounded-lg border border-gray-200">
                <Clock size={18} className="text-blue-500" />
                <div className="text-sm">
                  <p className="text-gray-500">Dernière mise à jour</p>
                  <p className="font-semibold text-gray-700">À l'instant</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KPIs principaux - Données API uniquement */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard
            title="Formations"
            value={stats.formations}
            icon={<GraduationCap size={24} />}
            onClick={() => navigate("/formations")}
            gradient="from-blue-500 via-blue-600 to-indigo-600"
            subtitle="Total formations actives"
          />

          <KpiCard
            title="Préinscriptions"
            value={stats.preinscriptions}
            icon={<Users size={24} />}
            onClick={() => navigate("/preinscriptions")}
            gradient="from-purple-500 via-purple-600 to-pink-600"
            badge={stats.preinscriptionsAttente}
            badgeLabel="En attente"
            subtitle="Inscriptions totales"
          />

          <KpiCard
            title="Messages"
            value={stats.messages}
            icon={<Mail size={24} />}
            onClick={() => navigate("/messages")}
            gradient="from-green-500 via-green-600 to-emerald-600"
            subtitle="Messages reçus"
          />

          <KpiCard
            title="Événements"
            value={stats.eventsUpcoming}
            icon={<Calendar size={24} />}
            onClick={() => navigate("/agenda")}
            gradient="from-orange-500 via-orange-600 to-red-600"
            subtitle="Événements à venir"
          />
        </div>

        {/* Section graphiques et statistiques */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Graphiques principaux */}
          <div className="lg:col-span-2">
            <DashboardCharts data={chartData} pieData={pieData} />
          </div>

          {/* Statistiques rapides - Données API uniquement */}
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <Activity size={22} className="mr-2 text-blue-500" />
                Statistiques
              </h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                Live
              </span>
            </div>

            <div className="space-y-3">
              {/* Licences */}
              <div className="group relative overflow-hidden p-4 bg-gradient-to-br from-cyan-50 to-cyan-100/50 rounded-xl hover:shadow-md transition-all duration-300 cursor-pointer">
                <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-colors"></div>
                <div className="relative flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                    <BookOpen size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 font-medium">Formations LICENCE</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.licences}</p>
                  </div>
                  <ArrowUpRight size={18} className="text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Masters */}
              <div className="group relative overflow-hidden p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl hover:shadow-md transition-all duration-300 cursor-pointer">
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors"></div>
                <div className="relative flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Award size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 font-medium">Formations MASTER</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.masters}</p>
                  </div>
                  <ArrowUpRight size={18} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Validées */}
              <div className="group relative overflow-hidden p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl hover:shadow-md transition-all duration-300 cursor-pointer">
                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors"></div>
                <div className="relative flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <CheckCircle size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 font-medium">Préinscriptions Validées</p>
                    <p className="text-3xl font-bold text-gray-800">
                      {stats.preinscriptions - stats.preinscriptionsAttente}
                    </p>
                  </div>
                  <ArrowUpRight size={18} className="text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Actualités */}
              <div className="group relative overflow-hidden p-4 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl hover:shadow-md transition-all duration-300 cursor-pointer">
                <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-colors"></div>
                <div className="relative flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Newspaper size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 font-medium">Actualités</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.actualites}</p>
                  </div>
                  <ArrowUpRight size={18} className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* ✅ NOUVELLE CARD - Activités */}
              <div
                className="group relative overflow-hidden p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl hover:shadow-md transition-all duration-300 cursor-pointer"
                onClick={() => navigate("/activites")}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-colors"></div>
                <div className="relative flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Grid3x3 size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 font-medium">Activités</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.activites}</p>
                  </div>
                  <ArrowUpRight size={18} className="text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Partenaires */}
              <div className="group relative overflow-hidden p-4 bg-gradient-to-br from-rose-50 to-rose-100/50 rounded-xl hover:shadow-md transition-all duration-300 cursor-pointer">
                <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-colors"></div>
                <div className="relative flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Users size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 font-medium">Partenaires</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.partenaires}</p>
                  </div>
                  <ArrowUpRight size={18} className="text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl shadow-2xl p-8 text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-2">Actions rapides</h3>
            <p className="text-blue-200 mb-6">Accès direct aux fonctionnalités</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => navigate("/formations/new")}
                className="group relative overflow-hidden bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <GraduationCap size={28} className="mx-auto mb-3" />
                <span className="text-sm font-semibold block">Nouvelle formation</span>
              </button>

              <button
                onClick={() => navigate("/preinscriptions")}
                className="group relative overflow-hidden bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Users size={28} className="mx-auto mb-3" />
                <span className="text-sm font-semibold block">Préinscriptions</span>
              </button>

              <button
                onClick={() => navigate("/actualites/new")}
                className="group relative overflow-hidden bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Newspaper size={28} className="mx-auto mb-3" />
                <span className="text-sm font-semibold block">Publier actualité</span>
              </button>

              <button
                onClick={() => navigate("/messages")}
                className="group relative overflow-hidden bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Mail size={28} className="mx-auto mb-3" />
                <span className="text-sm font-semibold block">Voir messages</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
