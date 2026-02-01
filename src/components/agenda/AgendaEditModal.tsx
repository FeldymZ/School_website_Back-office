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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8] opacity-10" />
          <div className="relative flex items-center justify-between px-8 py-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl flex items-center justify-center shadow-lg">
                  <Calendar className="text-white" size={26} />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  Modifier l'événement
                  <Sparkles size={18} className="text-[#00A4E0] animate-pulse" />
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Mettez à jour toutes les informations de l'événement
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-8 space-y-6">
          {/* Titre */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Calendar size={16} className="text-[#00A4E0]" />
              Titre de l'événement
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Journée portes ouvertes"
              className="w-full border border-gray-200 rounded-xl px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
                         transition-all hover:border-gray-300"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FileText size={16} className="text-[#00A4E0]" />
              Description
            </label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400 pointer-events-none" />
              <textarea
                rows={4}
                placeholder="Décrivez l'événement en détail..."
                className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3
                           focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
                           transition-all hover:border-gray-300 resize-none"
                value={form.description ?? ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Calendar size={16} className="text-[#00A4E0]" />
                Date de début
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3
                             focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
                             transition-all hover:border-gray-300"
                  value={form.eventDate ?? ""}
                  onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Calendar size={16} className="text-[#00A4E0]" />
                Date de fin
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3
                             focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
                             transition-all hover:border-gray-300"
                  value={form.endDate ?? ""}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Heures */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Clock size={16} className="text-[#00A4E0]" />
                Heure de début
              </label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="time"
                  className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3
                             focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
                             transition-all hover:border-gray-300"
                  value={form.startTime ?? ""}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Clock size={16} className="text-[#00A4E0]" />
                Heure de fin
              </label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="time"
                  className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3
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
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <MapPin size={16} className="text-[#00A4E0]" />
              Lieu
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Ex: Campus principal, Salle A101"
                className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3
                           focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
                           transition-all hover:border-gray-300"
                value={form.location ?? ""}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
          </div>

          {/* Actif */}
          <div className="relative overflow-hidden rounded-xl border-2 border-[#cfe3ff] bg-gradient-to-r from-[#cfe3ff]/20 to-transparent p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all ${
                  form.enabled
                    ? "bg-gradient-to-br from-[#00A4E0] to-[#0077A8]"
                    : "bg-gradient-to-br from-[#A6A6A6] to-gray-500"
                }`}>
                  {form.enabled ? (
                    <Eye size={20} className="text-white" />
                  ) : (
                    <EyeOff size={20} className="text-white" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Statut de l'événement</p>
                  <p className="text-sm text-gray-500">
                    {form.enabled
                      ? "L'événement est visible publiquement"
                      : "L'événement est masqué du public"}
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={form.enabled ?? true}
                  onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#00A4E0]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#00A4E0] peer-checked:to-[#0077A8] shadow-inner"></div>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-100">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-200 font-medium text-gray-700
                         hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              Annuler
            </button>

            <button
              onClick={submit}
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-xl font-medium text-white
                         bg-gradient-to-r from-[#00A4E0] to-[#0077A8]
                         hover:shadow-lg hover:scale-105 active:scale-95
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                         transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Enregistrer les modifications
                </>
              )}
            </button>
          </div>
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
