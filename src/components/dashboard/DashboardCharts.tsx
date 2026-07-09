import { useEffect, useId, useMemo, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts"

/* ================= TYPES ================= */
interface BarDatum {
  name: string
  value: number
  color: string
}

interface PieDatum {
  name: string
  value: number
  color?: string
}

interface Props {
  data: BarDatum[]
  pieData?: PieDatum[]
  pieTitle?: string
}

const FALLBACK_COLORS = ["#00A4E0", "#A6A6A6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444"]

/* ================= CUSTOM TOOLTIPS ================= */
interface BarTooltipProps {
  active?: boolean
  payload?: { value: number; fill: string }[]
  label?: string
}

const CustomBarTooltip = ({ active, payload, label }: BarTooltipProps) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-black" style={{ color: payload[0].fill }}>
        {payload[0].value.toLocaleString()}
      </p>
    </div>
  )
}

interface PieTooltipProps {
  active?: boolean
  payload?: { name: string; value: number; payload: { fill: string } }[]
}

const CustomPieTooltip = ({ active, payload }: PieTooltipProps) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{payload[0].name}</p>
      <p className="text-2xl font-black" style={{ color: payload[0].payload.fill }}>
        {payload[0].value.toLocaleString()}
      </p>
    </div>
  )
}

/* ================= CARD WRAPPER ================= */
interface ChartCardProps {
  icon: React.ReactNode
  iconGradient: string
  title: string
  subtitle: string
  children: React.ReactNode
}

const ChartCard = ({ icon, iconGradient, title, subtitle, children }: ChartCardProps) => (
  <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8">
    <div className="flex items-center gap-4 mb-8">
      <div className="relative">
        <div className={`absolute inset-0 bg-gradient-to-br ${iconGradient} rounded-xl blur-md opacity-40`} />
        <div className={`relative w-11 h-11 bg-gradient-to-br ${iconGradient} rounded-xl flex items-center justify-center shadow-md`}>
          {icon}
        </div>
      </div>
      <div>
        <h3 className="text-xl font-black text-gray-900">{title}</h3>
        <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>
      </div>
    </div>
    {children}
  </div>
)

/* ================= LEGEND GRID ================= */
interface LegendEntry {
  name: string
  value: number
  color: string
}

interface LegendGridProps {
  entries: LegendEntry[]
  singleRow?: boolean
}

const LegendGrid = ({ entries, singleRow = false }: LegendGridProps) => {
  if (singleRow) {
    // Une seule ligne, toujours : largeur égale entre les cartes,
    // contenu centré à l'intérieur de chaque carte,
    // défilement horizontal en dernier recours sur très petit écran.
    return (
      <div className="flex gap-3 mt-6 pt-5 border-t border-gray-50 overflow-x-auto">
        {entries.map((entry, index) => (
          <div
            key={`${entry.name}-${index}`}
            className="flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-xl border border-gray-100 bg-gray-50/60
                       hover:shadow-sm transition-shadow flex-1 min-w-[140px]"
          >
            <div className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: entry.color }} />
            <div className="min-w-0 text-center">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider truncate">{entry.name}</p>
              <p className="text-base font-black text-gray-900 leading-tight">{entry.value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 mt-4 pt-5 border-t border-gray-50">
      {entries.map((entry, index) => (
        <div
          key={`${entry.name}-${index}`}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-gray-100 bg-gray-50/60"
        >
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
          <div className="min-w-0">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider truncate">{entry.name}</p>
            <p className="text-base font-black text-gray-900 leading-tight">{entry.value.toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ================= EMPTY STATE ================= */
const EmptyState = ({ label }: { label: string }) => (
  <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-2">
    <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
    <p className="text-sm font-semibold">{label}</p>
  </div>
)

/* ================= COMPONENT ================= */
const DashboardCharts = ({ data, pieData, pieTitle }: Props) => {
  // Laisse le layout se stabiliser avant de monter les ResponsiveContainer
  // -> évite le faux positif "width(-1) height(-1)" au premier rendu.
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(id)
  }, [])

  // Préfixe unique par instance -> évite les collisions d'ID de <linearGradient>
  // si ce composant est monté plusieurs fois sur la même page.
  const uid = useId().replace(/[:]/g, "")

  const hasBarData = data.length > 0
  const hasPieData = Boolean(pieData && pieData.length > 0)

  const resolvedPieData = useMemo(
    () =>
      (pieData ?? []).map((entry, index) => ({
        ...entry,
        color: entry.color ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length],
      })),
    [pieData]
  )

  return (
    <div className="space-y-6">

      {/* ===== BAR CHART ===== */}
      <ChartCard
        iconGradient="from-[#00A4E0] to-[#0077A8]"
        title="Vue d'ensemble"
        subtitle="Statistiques principales de la plateforme"
        icon={
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        }
      >
        <div className="w-full h-[320px]" aria-label="Graphique en barres des statistiques principales">
          {!hasBarData ? (
            <EmptyState label="Aucune donnée à afficher" />
          ) : (
            ready && (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={1}>
                <BarChart data={data} barCategoryGap="35%">
                  <defs>
                    {data.map((entry, index) => (
                      <linearGradient key={index} id={`grad-${uid}-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                        <stop offset="100%" stopColor={entry.color} stopOpacity={0.55} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#9CA3AF", fontSize: 12, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#9CA3AF", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={32}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "#f8fafc", radius: 8 }} />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]} maxBarSize={60} animationDuration={1200}>
                    {data.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#grad-${uid}-${index})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )
          )}
        </div>

        {hasBarData && <LegendGrid entries={data} singleRow />}
      </ChartCard>

      {/* ===== PIE CHART ===== */}
      {hasPieData && (
        <ChartCard
          iconGradient="from-[#F59E0B] to-[#D97706]"
          title={pieTitle || "Répartition"}
          subtitle="Distribution par catégorie"
          icon={
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          }
        >
          <div className="w-full h-[260px]" aria-label={`Graphique circulaire : ${pieTitle || "répartition"}`}>
            {ready && (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={1}>
                <PieChart>
                  <defs>
                    {resolvedPieData.map((entry, index) => (
                      <linearGradient key={index} id={`pieGrad-${uid}-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                        <stop offset="100%" stopColor={entry.color} stopOpacity={0.7} />
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={resolvedPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                    animationDuration={1200}
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={{ stroke: "#e5e7eb", strokeWidth: 1 }}
                  >
                    {resolvedPieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`url(#pieGrad-${uid}-${index})`}
                        stroke="white"
                        strokeWidth={3}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={9}
                    formatter={(value) => (
                      <span style={{ color: "#374151", fontSize: 12, fontWeight: 700 }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <LegendGrid entries={resolvedPieData} />
        </ChartCard>
      )}
    </div>
  )
}

export default DashboardCharts