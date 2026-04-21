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

interface Props {
  data: { name: string; value: number; color: string }[]
  pieData?: { name: string; value: number }[]
  pieTitle?: string
}

const COLORS = ["#00A4E0", "#A6A6A6", "#10B981", "#F59E0B"]

/* ================= CUSTOM TOOLTIPS ================= */
const CustomBarTooltip = ({ active, payload, label }: any) => {
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

const CustomPieTooltip = ({ active, payload }: any) => {
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

/* ================= COMPONENT ================= */
const DashboardCharts = ({ data, pieData, pieTitle }: Props) => {
  return (
    <div className="space-y-6">

      {/* ===== BAR CHART ===== */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl blur-md opacity-40" />
            <div className="relative w-11 h-11 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900">Vue d'ensemble</h3>
            <p className="text-sm text-gray-400 mt-0.5">Statistiques principales de la plateforme</p>
          </div>
        </div>

        <div className="w-full h-[320px]">
          <ResponsiveContainer>
            <BarChart data={data} barCategoryGap="35%">
              <defs>
                {data.map((entry, index) => (
                  <linearGradient key={index} id={`grad-${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={entry.color} stopOpacity={1} />
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
              />
              <Tooltip
                content={<CustomBarTooltip />}
                cursor={{ fill: "#f8fafc", radius: 8 }}
              />
              <Bar
                dataKey="value"
                radius={[10, 10, 0, 0]}
                maxBarSize={60}
                animationDuration={1200}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={`url(#grad-${index})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* LEGEND CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-gray-50">
          {data.map((entry, index) => (
            <div
              key={index}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-gray-100 bg-gray-50/60
                         hover:shadow-sm transition-shadow"
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                style={{ backgroundColor: entry.color }}
              />
              <div className="min-w-0">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider truncate">{entry.name}</p>
                <p className="text-base font-black text-gray-900 leading-tight">{entry.value.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== PIE CHART ===== */}
      {pieData && pieData.length > 0 && (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-xl blur-md opacity-40" />
              <div className="relative w-11 h-11 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900">{pieTitle || "Répartition"}</h3>
              <p className="text-sm text-gray-400 mt-0.5">Distribution par catégorie</p>
            </div>
          </div>

          <div className="w-full h-[260px]">
            <ResponsiveContainer>
              <PieChart>
                <defs>
                  {COLORS.map((color, index) => (
                    <linearGradient key={index} id={`pieGrad-${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor={color} stopOpacity={1} />
                      <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                  animationDuration={1200}
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  labelLine={{ stroke: "#e5e7eb", strokeWidth: 1 }}
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#pieGrad-${index})`}
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
          </div>

          {/* LEGEND CARDS */}
          <div className="grid grid-cols-2 gap-3 mt-4 pt-5 border-t border-gray-50">
            {pieData.map((entry, index) => (
              <div
                key={index}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-gray-100 bg-gray-50/60"
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider truncate">{entry.name}</p>
                  <p className="text-base font-black text-gray-900 leading-tight">{entry.value.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardCharts