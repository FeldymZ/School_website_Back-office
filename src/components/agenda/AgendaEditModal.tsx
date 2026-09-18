import {
  X,
  Save,
  Calendar,
  Loader,
  Clock,
  MapPin,
  FileText,
  Sparkles,
  Eye,
  EyeOff,
  CalendarDays,
  CalendarRange,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AgendaEvent } from "@/types/agenda";
import { AgendaService } from "@/services/agenda.service";

interface Props {
  event: AgendaEvent | null;
  onClose: () => void;
  onUpdated: () => void;
}

const AgendaEditModal = ({ event, onClose, onUpdated }: Props) => {
  const [form, setForm] = useState<AgendaEvent | null>(null);
  const [loading, setLoading] = useState(false);

  /* ============================
     🔁 Synchronisation event → form
     ============================ */
  useEffect(() => {
    if (event) {
      setForm({ ...event });
    }
  }, [event]);

  if (!event || !form) return null;

  /* ============================
     🚀 Submit
     ============================ */
  const submit = async () => {
    try {
      setLoading(true);

      await AgendaService.update(event.id, {
        title: form.title,
        description: form.description,
        eventDate: form.eventDate,
        endDate: form.endDate,
        startTime: form.startTime,
        endTime: form.endTime,
        location: form.location,
        enabled: form.enabled,
      });

      onUpdated();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-3xl rounded-2xl sm:rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="relative overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] via-[#0090C8] to-[#0077A8]" />
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 85% 30%, white 1px, transparent 1px)", backgroundSize: "20px 20px" }}
          />
          <div className="relative flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-white/30 rounded-2xl blur-md" />
                <div className="relative w-11 h-11 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg ring-1 ring-white/30">
                  <Calendar className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-2xl font-bold text-white truncate">
                  Modifier l'événement
                </h2>
                <p className="text-xs sm:text-sm text-white/80 mt-0.5 hidden sm:flex items-center gap-1.5">
                  <Sparkles size={12} className="flex-shrink-0" />
                  Mettez à jour toutes les informations de l'événement
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 flex-shrink-0"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-4 sm:p-8 space-y-5 sm:space-y-6 overflow-y-auto flex-1 bg-gradient-to-b from-gray-50/50 to-white">
          {/* Titre */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-800">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-sm flex-shrink-0">
                <Sparkles size={12} className="text-white" />
              </div>
              Titre de l'événement
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Journée portes ouvertes"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm sm:text-base
                         focus:outline-none focus:ring-4 focus:ring-[#00A4E0]/15 focus:border-[#00A4E0]
                         transition-all hover:border-gray-300 shadow-sm"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-800">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-sm flex-shrink-0">
                <FileText size={12} className="text-white" />
              </div>
              Description
            </label>
            <textarea
              rows={4}
              placeholder="Décrivez l'événement en détail..."
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm sm:text-base
                         focus:outline-none focus:ring-4 focus:ring-[#00A4E0]/15 focus:border-[#00A4E0]
                         transition-all hover:border-gray-300 resize-none shadow-sm"
              value={form.description ?? ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* Dates */}
          <div className="bg-white rounded-2xl border-2 border-gray-100 p-3 sm:p-4 space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4 shadow-sm">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-800">
                <CalendarDays size={14} className="text-[#00A4E0] flex-shrink-0" />
                Date de début
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-3 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
                             transition-all hover:border-gray-300"
                  value={form.eventDate ?? ""}
                  onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-800">
                <CalendarRange size={14} className="text-gray-400 flex-shrink-0" />
                Date de fin
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-3 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
                             transition-all hover:border-gray-300"
                  value={form.endDate ?? ""}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Heures */}
          <div className="bg-white rounded-2xl border-2 border-gray-100 p-3 sm:p-4 space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4 shadow-sm">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-800">
                <Clock size={14} className="text-[#00A4E0] flex-shrink-0" />
                Heure de début
              </label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="time"
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-3 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
                             transition-all hover:border-gray-300"
                  value={form.startTime ?? ""}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-800">
                <Clock size={14} className="text-gray-400 flex-shrink-0" />
                Heure de fin
              </label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="time"
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-3 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
                             transition-all hover:border-gray-300"
                  value={form.endTime ?? ""}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Lieu */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-800">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-sm flex-shrink-0">
                <MapPin size={12} className="text-white" />
              </div>
              Lieu
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Ex: Campus principal, Salle A101"
                className="w-full border-2 border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm sm:text-base
                           focus:outline-none focus:ring-4 focus:ring-[#00A4E0]/15 focus:border-[#00A4E0]
                           transition-all hover:border-gray-300 shadow-sm"
                value={form.location ?? ""}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
          </div>

          {/* Actif */}
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border-2 border-[#cfe3ff] bg-gradient-to-r from-[#cfe3ff]/20 to-transparent p-3 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg transition-all flex-shrink-0 ${
                  form.enabled
                    ? "bg-gradient-to-br from-[#00A4E0] to-[#0077A8]"
                    : "bg-gradient-to-br from-[#A6A6A6] to-gray-500"
                }`}>
                  {form.enabled ? (
                    <Eye size={16} className="text-white" />
                  ) : (
                    <EyeOff size={16} className="text-white" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">Statut de l'événement</p>
                  <p className="text-[11px] sm:text-sm text-gray-500">
                    {form.enabled
                      ? "Visible publiquement"
                      : "Masqué du public"}
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={form.enabled ?? true}
                  onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                />
                <div className="w-12 h-6 sm:w-14 sm:h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#00A4E0]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 sm:after:h-6 sm:after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#00A4E0] peer-checked:to-[#0077A8] shadow-inner"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Actions (sticky footer) */}
        <div className="flex flex-col sm:flex-row gap-3 px-4 sm:px-8 py-4 sm:py-6 border-t-2 border-gray-100 bg-white flex-shrink-0">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-200 font-medium text-gray-700 text-sm sm:text-base
                       hover:bg-gray-50 hover:border-gray-300 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed order-2 sm:order-1"
          >
            Annuler
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className="flex-1 px-6 py-3 rounded-xl font-medium text-white text-sm sm:text-base
                       bg-gradient-to-r from-[#00A4E0] to-[#0077A8]
                       hover:shadow-lg hover:scale-[1.02] active:scale-95
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                       transition-all duration-200 flex items-center justify-center gap-2 order-1 sm:order-2
                       shadow-md shadow-blue-200"
          >
            {loading ? (
              <>
                <Loader size={16} className="animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save size={16} />
                Enregistrer
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes zoom-in-95 {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-in {
          animation-fill-mode: both;
        }

        .fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .zoom-in-95 {
          animation: zoom-in-95 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AgendaEditModal;