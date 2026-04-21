import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  GraduationCap,
  Users,
  Calendar,
  Newspaper,
  Mail,
  Clock,
  ArrowUpRight,
  Activity,
  Sparkles,
  Award,
  BookOpen,
  AlertCircle,
  Grid3x3,
  RotateCcw,
} from "lucide-react"

import { DashboardService } from "../../services/dashboard.service"
import DashboardCharts from "../../components/dashboard/DashboardCharts"
import KpiCard from "../../components/dashboard/KpiCard"
import LoadingDashboard from "../../components/dashboard/LoadingDashboard"

import { FormationService } from "@/services/formation.service"
import { FormationContinueService } from "@/services/FormationContinueService"

/* ================= STAT ROW ================= */
interface StatRowProps {
  icon: React.ElementType
  label: string
  value: number
  from: string
  to: string
  textColor: string
  onClick?: () => void
}

const StatRow = ({ icon: Icon, label, value, from, to, textColor, onClick }: StatRowProps) => (
  <div
    onClick={onClick}
    className={`group relative overflow-hidden p-4 rounded-2xl border border-white/60
                bg-gradient-to-br ${from} ${to}
                hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5
                ${onClick ? "cursor-pointer" : ""}`}
  >
    <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full blur-2xl
                    group-hover:scale-150 transition-transform duration-500" />
    <div className="relative flex items-center gap-3">
      <div className={`w-11 h-11 bg-white/70 backdrop-blur rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 ${textColor}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 font-semibold truncate">{label}</p>
        <p className="text-2xl font-black text-gray-900 leading-none mt-0.5">{value}</p>
      </div>
      <ArrowUpRight
        size={16}
        className={`${textColor} opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0`}
      />
    </div>
  </div>
)

/* ================= COMPONENT ================= */
const DashboardPage = () => {

  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const [stats, setStats] = useState({
    formationsInitiales: 0,
    formationsContinues: 0,
    licences: 0,
    masters: 0,
    actualites: 0,
    activites: 0,
    partenaires: 0,
    messages: 0,
    eventsUpcoming: 0,
    eventsPast: 0,
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          formationsInitiales,
          formationsContinuesPage,
          licences,
          masters,
          actualites,
          activites,
          partenaires,
          messages,
          upcoming,
          past,
        ] = await Promise.all([
          FormationService.getAll(),
          FormationContinueService.getAll(0, 1),
          DashboardService.getFormationsLicenceCount(),
          DashboardService.getFormationsMasterCount(),
          DashboardService.getActualitesCount(),
          DashboardService.getActivitesCount(),
          DashboardService.getPartenairesCount(),
          DashboardService.getMessagesCount(),
          DashboardService.getEvenementsAVenir(),
          DashboardService.getEvenementsPasses(),
        ])

        setStats({
          formationsInitiales: formationsInitiales.length,
          formationsContinues: formationsContinuesPage.totalElements,
          licences,
          masters,
          actualites,
          activites,
          partenaires,
          messages,
          eventsUpcoming: upcoming,
          eventsPast: past,
        })
      } catch (e) {
        console.error(e)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) return <LoadingDashboard />

  /* ================= ERROR ================= */
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-3xl shadow-2xl border border-red-100 p-12 text-center max-w-md w-full">
          <div className="relative inline-flex mb-6">
            <div className="absolute inset-0 bg-red-400 rounded-full blur-xl opacity-20" />
            <div className="relative w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center border border-red-100">
              <AlertCircle className="text-red-500" size={28} />
            </div>
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-500 text-sm mb-6">
            Une erreur est survenue lors du chargement des statistiques.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                       bg-gradient-to-r from-[#00A4E0] to-[#0077A8] text-white font-semibold text-sm
                       hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <RotateCcw size={15} />
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  /* ================= CHART DATA ================= */
  const chartData = [
    { name: "Initiales",  value: stats.formationsInitiales,  color: "#3B82F6" },
    { name: "Continues",  value: stats.formationsContinues,  color: "#10B981" },
    { name: "Actualités", value: stats.actualites,           color: "#F59E0B" },
    { name: "Activités",  value: stats.activites,            color: "#8B5CF6" },
    { name: "Messages",   value: stats.messages,             color: "#EF4444" },
  ]

  const pieData = [
    { name: "Initiales", value: stats.formationsInitiales },
    { name: "Continues", value: stats.formationsContinues },
  ]

  /* ================= STAT ROWS ================= */
  const statRows: StatRowProps[] = [
    {
      icon: BookOpen,
      label: "Formations LICENCE",
      value: stats.licences,
      from: "from-cyan-50",
      to: "to-cyan-100/60",
      textColor: "text-cyan-600",
    },
    {
      icon: Award,
      label: "Formations MASTER",
      value: stats.masters,
      from: "from-blue-50",
      to: "to-blue-100/60",
      textColor: "text-blue-600",
    },
    {
      icon: Newspaper,
      label: "Actualités",
      value: stats.actualites,
      from: "from-green-50",
      to: "to-green-100/60",
      textColor: "text-green-600",
    },
    {
      icon: Grid3x3,
      label: "Activités",
      value: stats.activites,
      from: "from-amber-50",
      to: "to-amber-100/60",
      textColor: "text-amber-600",
      onClick: () => navigate("/activites"),
    },
    {
      icon: Users,
      label: "Partenaires",
      value: stats.partenaires,
      from: "from-rose-50",
      to: "to-rose-100/60",
      textColor: "text-rose-500",
    },
    {
      icon: Calendar,
      label: "Événements passés",
      value: stats.eventsPast,
      from: "from-gray-50",
      to: "to-gray-100/60",
      textColor: "text-gray-500",
    },
  ]

  /* ================= QUICK ACTIONS ================= */
  const quickActions = [
    { icon: GraduationCap, label: "Formations initiales",  path: "/formations" },
    { icon: BookOpen,      label: "Formations continues",  path: "/formations-continues" },
    { icon: Newspaper,     label: "Publier actualité",     path: "/actualites" },
    { icon: Mail,          label: "Voir messages",         path: "/messages" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">

        {/* ===== HEADER ===== */}
        <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white p-8">
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-[#00A4E0]/10 to-indigo-400/10 rounded-full blur-3xl pointer-events-none" />
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)", backgroundSize: "24px 24px" }}
          />
          <div className="relative flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-indigo-600 rounded-2xl blur-xl opacity-40" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-[#00A4E0] to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Tableau de bord
                </h1>
                <p className="text-gray-500 text-sm mt-1 flex items-center gap-1.5">
                  <span className="relative flex">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-50" />
                    <span className="relative w-2 h-2 rounded-full bg-green-400" />
                  </span>
                  Plateforme de gestion ESIITECH GABON
                </p>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-2 px-4 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <Clock size={15} className="text-[#00A4E0]" />
              <div className="text-xs">
                <p className="text-gray-400 font-medium">Dernière mise à jour</p>
                <p className="font-black text-gray-700">À l'instant</p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== KPI CARDS ===== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <KpiCard
            title="Formations initiales"
            value={stats.formationsInitiales}
            icon={<GraduationCap size={24} />}
            onClick={() => navigate("/formations")}
            gradient="from-[#00A4E0] via-[#0090C8] to-[#0077A8]"
            subtitle={`${stats.licences} Licences · ${stats.masters} Masters`}
          />
          <KpiCard
            title="Formations continues"
            value={stats.formationsContinues}
            icon={<BookOpen size={24} />}
            onClick={() => navigate("/formations-continues")}
            gradient="from-emerald-500 via-green-500 to-teal-600"
            subtitle="Catalogue en ligne"
          />
          <KpiCard
            title="Messages"
            value={stats.messages}
            icon={<Mail size={24} />}
            onClick={() => navigate("/messages")}
            gradient="from-violet-500 via-purple-500 to-indigo-600"
            subtitle="Messages reçus"
          />
          <KpiCard
            title="Événements"
            value={stats.eventsUpcoming}
            icon={<Calendar size={24} />}
            onClick={() => navigate("/agenda")}
            gradient="from-orange-500 via-orange-600 to-red-600"
            subtitle="À venir"
          />
        </div>

        {/* ===== CHARTS + STATS ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* CHARTS */}
          <div className="lg:col-span-2">
            <DashboardCharts
              data={chartData}
              pieData={pieData}
              pieTitle="Formations : Initiales vs Continues"
            />
          </div>

          {/* STAT ROWS */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl blur-md opacity-40" />
                  <div className="relative w-9 h-9 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl flex items-center justify-center shadow-md">
                    <Activity className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h3 className="text-base font-black text-gray-900">Statistiques</h3>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Live
              </span>
            </div>

            <div className="space-y-2.5">
              {statRows.map((row, index) => (
                <div
                  key={index}
                  style={{ animation: `fadeIn 0.3s ease-out ${index * 0.05}s both` }}
                >
                  <StatRow {...row} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== QUICK ACTIONS ===== */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#00A4E0] via-[#0088C8] to-indigo-700 rounded-3xl shadow-2xl p-8 text-white">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }}
          />

          <div className="relative z-10">
            <div className="mb-6">
              <h3 className="text-2xl font-black">Actions rapides</h3>
              <p className="text-white/60 text-sm mt-1">Accès direct aux fonctionnalités principales</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => navigate(action.path)}
                  className="group relative overflow-hidden bg-white/10 hover:bg-white/20 backdrop-blur-sm
                             rounded-2xl p-5 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl
                             border border-white/10 hover:border-white/25 text-left"
                  style={{ animation: `fadeIn 0.3s ease-out ${index * 0.08}s both` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <action.icon size={26} className="mb-3 opacity-90" />
                  <span className="text-sm font-bold block leading-tight">{action.label}</span>
                  <ArrowUpRight
                    size={14}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-60 transition-opacity"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default DashboardPage