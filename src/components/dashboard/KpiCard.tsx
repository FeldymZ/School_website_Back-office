import type { ReactNode } from "react";

interface Props {
  title: string;
  value: number;
  icon?: ReactNode;
  onClick?: () => void;
  gradient?: string;
  badge?: number;
  badgeLabel?: string;
  subtitle?: string;
}

const KpiCard = ({
  title,
  value,
  icon,
  onClick,
  gradient = "from-blue-500 to-blue-600",
  badge,
  badgeLabel,
  subtitle,
}: Props) => {
  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

      <div className={`relative bg-gradient-to-br ${gradient} p-6`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

        <div className="relative flex items-start justify-between">
          <div className="flex-1">
            <p className="text-white/90 text-sm font-medium mb-1">{title}</p>
            <p className="text-white text-5xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300 origin-left">
              {value}
            </p>
            {subtitle && (
              <p className="text-white/70 text-xs">{subtitle}</p>
            )}
          </div>

          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
            <div className="text-white">
              {icon}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-gradient-to-br from-gray-50 to-white">
        <div className="flex items-center justify-between">
          {badge !== undefined && badgeLabel && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-600 font-medium">{badgeLabel}</span>
              <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                {badge}
              </span>
            </div>
          )}

          {onClick && !badge && (
            <span className="text-sm text-gray-500 group-hover:text-blue-600 transition-colors font-medium">
              Voir détails →
            </span>
          )}
        </div>
      </div>

      {onClick && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
      )}
    </div>
  );
};

export default KpiCard;
