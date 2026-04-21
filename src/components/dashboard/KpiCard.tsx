import type { ReactNode } from "react"

interface Props {
  title: string
  value: number
  icon?: ReactNode
  onClick?: () => void
  gradient?: string
  badge?: number
  badgeLabel?: string
  subtitle?: string
  formatValue?: (value: number) => string
}

const KpiCard = ({
  title,
  value,
  icon,
  onClick,
  gradient = "from-[#00A4E0] to-[#0077A8]",
  badge,
  badgeLabel,
  subtitle,
  formatValue,
}: Props) => {

  /* ================= FORMAT ================= */
  const safeValue = value ?? 0
  const displayValue = formatValue ? formatValue(safeValue) : safeValue.toLocaleString()

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden bg-white rounded-3xl shadow-lg border border-gray-100
                  transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5
                  ${onClick ? "cursor-pointer" : ""}`}
    >

      {/* ===== SHINE EFFECT ===== */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent
                      translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700
                      z-10 pointer-events-none" />

      {/* ===== HEADER ===== */}
      <div className={`relative bg-gradient-to-br ${gradient} p-6 overflow-hidden`}>

        {/* Blobs */}
        <div className="absolute -top-8 -right-8 w-36 h-36 bg-white/10 rounded-full blur-2xl
                        group-hover:scale-125 transition-transform duration-700" />
        <div className="absolute -bottom-10 -left-6 w-28 h-28 bg-black/10 rounded-full blur-2xl" />

        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "18px 18px" }}
        />

        <div className="relative flex items-start justify-between gap-4">

          {/* TEXT */}
          <div className="flex-1 min-w-0">
            <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.15em] mb-2">
              {title}
            </p>
            <p className="text-white font-black leading-none mb-2
                          text-4xl md:text-5xl
                          group-hover:scale-[1.06] transition-transform duration-300 origin-left
                          [text-shadow:0_2px_12px_rgba(0,0,0,0.15)]">
              {displayValue}
            </p>
            {subtitle && (
              <p className="text-white/55 text-xs font-semibold mt-1.5 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-white/50 inline-block" />
                {subtitle}
              </p>
            )}
          </div>

          {/* ICON */}
          {icon && (
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-white/30 rounded-2xl blur-lg opacity-60" />
              <div className="relative w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl
                              flex items-center justify-center shadow-xl ring-1 ring-white/25
                              group-hover:scale-110 group-hover:rotate-6 group-hover:bg-white/30
                              transition-all duration-300">
                <div className="text-white [&>svg]:w-6 [&>svg]:h-6 drop-shadow">
                  {icon}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <div className="px-5 py-3.5 bg-white flex items-center justify-between min-h-[52px]
                      border-t border-gray-50">

        {/* BADGE */}
        {badge !== undefined && badgeLabel && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-bold">{badgeLabel}</span>
            <span className="relative inline-flex">
              <span className="absolute inset-0 bg-orange-400 rounded-full blur opacity-40 animate-pulse" />
              <span className="relative bg-gradient-to-r from-orange-500 to-red-500 text-white
                               text-xs font-black px-2.5 py-1 rounded-full shadow-md">
                {badge}
              </span>
            </span>
          </div>
        )}

        {/* CTA */}
        {onClick && badge === undefined && (
          <span className="text-xs font-bold text-gray-300 group-hover:text-[#00A4E0]
                           transition-colors duration-200 flex items-center gap-1.5">
            Voir détails
            <svg
              className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200"
              fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        )}

        {/* DECORATIVE — no action, no badge */}
        {!onClick && badge === undefined && (
          <div className="flex items-center gap-1.5">
            <span className="relative flex">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-50" />
              <span className="relative w-2 h-2 rounded-full bg-green-400" />
            </span>
            <span className="text-xs text-gray-400 font-semibold">À jour</span>
          </div>
        )}
      </div>

      {/* ===== HOVER LINE ===== */}
      {onClick && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px]
                        bg-gradient-to-r from-transparent via-[#00A4E0] to-transparent
                        scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />
      )}

    </div>
  )
}

export default KpiCard