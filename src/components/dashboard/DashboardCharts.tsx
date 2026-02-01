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
} from "recharts";

interface Props {
  data: { name: string; value: number; color: string }[];
  pieData?: { name: string; value: number }[];
}

const COLORS = ["#00A4E0", "#A6A6A6"];

const DashboardCharts = ({ data, pieData }: Props) => {
  return (
    <div className="space-y-6">
      {/* Graphique en barres principal */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-1">
            Vue d'ensemble
          </h3>
          <p className="text-sm text-gray-600">
            Statistiques principales de la plateforme
          </p>
        </div>

        {/* Container avec hauteur fixe */}
        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#6B7280", fontSize: 12 }}
                axisLine={{ stroke: "#E5E7EB" }}
              />
              <YAxis
                tick={{ fill: "#6B7280", fontSize: 12 }}
                axisLine={{ stroke: "#E5E7EB" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                }}
                cursor={{ fill: "rgba(0, 164, 224, 0.1)" }}
              />
              <Bar
                dataKey="value"
                radius={[12, 12, 0, 0]}
                animationDuration={1500}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Graphique circulaire */}
      {pieData && pieData.length > 0 && (
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
          <h4 className="text-lg font-bold text-gray-800 mb-4">
            Répartition des événements
          </h4>

          {/* Container avec hauteur fixe */}
          <div style={{ width: '100%', height: 256 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={1500}
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardCharts;
