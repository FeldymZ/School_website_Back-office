import { useState } from "react";
import { Filter, Mail, Calendar, RotateCcw, Search, Sparkles } from "lucide-react";

interface Props {
  onFilterByAdmin: (email: string) => void;
  onFilterByDate: (start: string, end: string) => void;
  onReset: () => void;
}

const AuditFilters = ({ onFilterByAdmin, onFilterByDate, onReset }: Props) => {
  const [email, setEmail] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  return (
    <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#cfe3ff] to-transparent rounded-full blur-3xl opacity-40" />

      <div className="relative z-10 p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative w-12 h-12 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl flex items-center justify-center shadow-lg">
              <Filter className="text-white" size={22} />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              Filtres
              <Sparkles size={16} className="text-[#00A4E0] animate-pulse" />
            </h3>
            <p className="text-sm text-gray-500">Affinez votre recherche</p>
          </div>
        </div>

        {/* Filtre par Admin */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Mail size={16} className="text-[#00A4E0]" />
            Filtrer par administrateur
          </label>
          <div className="flex gap-3">
            <input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
                         transition-all hover:border-gray-300"
            />
            <button
              onClick={() => onFilterByAdmin(email)}
              disabled={!email}
              className="px-6 py-3 rounded-xl font-semibold text-white
                         bg-gradient-to-r from-[#00A4E0] to-[#0077A8]
                         hover:shadow-lg hover:scale-105 active:scale-95
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                         transition-all duration-200 flex items-center gap-2"
            >
              <Search size={18} />
              Filtrer
            </button>
          </div>
        </div>

        {/* Filtre par Date */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Calendar size={16} className="text-[#00A4E0]" />
            Filtrer par période
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
                         transition-all hover:border-gray-300"
            />
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
                         transition-all hover:border-gray-300"
            />
            <button
              onClick={() => onFilterByDate(start, end)}
              disabled={!start || !end}
              className="px-6 py-3 rounded-xl font-semibold text-white
                         bg-gradient-to-r from-green-500 to-emerald-500
                         hover:shadow-lg hover:scale-105 active:scale-95
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                         transition-all duration-200 flex items-center gap-2"
            >
              <Calendar size={18} />
              Appliquer
            </button>
          </div>
        </div>

        {/* Reset Button */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={onReset}
            className="group inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#00A4E0] transition-colors"
          >
            <RotateCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
            Réinitialiser tous les filtres
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditFilters;
