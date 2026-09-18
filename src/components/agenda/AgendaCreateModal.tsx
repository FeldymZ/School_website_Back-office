import { X, Calendar, MapPin, Clock, FileText, Sparkles, CalendarDays, CalendarRange } from "lucide-react";
import { useState } from "react";
import { AgendaService } from "@/services/agenda.service";

interface AgendaForm {
  title: string;
  description: string;
  eventDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  enabled: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const AgendaCreateModal = ({ open, onClose, onCreated }: Props) => {
  const [form, setForm] = useState<AgendaForm>({
    title: "",
    description: "",
    eventDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    location: "",
    enabled: true,
  });
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const submit = async () => {
    try {
      setLoading(true);
      const data = new FormData();

      (Object.keys(form) as (keyof AgendaForm)[]).forEach((key) => {
        const value = form[key];
        if (value !== "") {
          data.append(key, String(value));
        }
      });

      await AgendaService.create(data);
      onCreated();
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
      <div className="relative bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 max-h-[95vh] flex flex-col overflow-hidden">
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
                  <Calendar size={22} className="text-white" />
                </div>
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-2xl font-bold text-white truncate">
                  Nouvel événement
                </h2>
                <p className="text-xs sm:text-sm text-white/80 flex items-center gap-1.5 mt-0.5">
                  <Sparkles size={12} className="flex-shrink-0" />
                  <span className="hidden sm:inline">Ajoutez un événement à l'agenda</span>
                  <span className="sm:hidden">À l'agenda</span>
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

          {/* Dates */}
          <div className="bg-white rounded-2xl border-2 border-gray-100 p-3 sm:p-4 space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-x-0 shadow-sm">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-800">
                <CalendarDays size={14} className="text-[#00A4E0] flex-shrink-0" />
                Date de début
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-3 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
                             transition-all hover:border-gray-300"
                  value={form.eventDate}
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
                  value={form.endDate}
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
                  value={form.startTime}
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
                  value={form.endTime}
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
                placeholder="Ex: Campus principal"
                className="w-full border-2 border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm sm:text-base
                           focus:outline-none focus:ring-4 focus:ring-[#00A4E0]/15 focus:border-[#00A4E0]
                           transition-all hover:border-gray-300 shadow-sm"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
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
              placeholder="Décrivez l'événement..."
              rows={4}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm sm:text-base
                         focus:outline-none focus:ring-4 focus:ring-[#00A4E0]/15 focus:border-[#00A4E0]
                         transition-all hover:border-gray-300 resize-none shadow-sm"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </div>

        {/* Actions (sticky footer) */}
        <div className="flex flex-col sm:flex-row gap-3 px-4 sm:px-8 py-4 sm:py-6 border-t-2 border-gray-100 bg-white flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-200 font-semibold text-gray-700 text-sm sm:text-base
                       hover:bg-gray-50 hover:border-gray-300 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed order-2 sm:order-1"
          >
            Annuler
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="flex-1 relative overflow-hidden px-6 py-3 rounded-xl font-semibold text-white text-sm sm:text-base
                       bg-gradient-to-r from-[#00A4E0] to-[#0077A8]
                       hover:shadow-lg hover:scale-[1.02] active:scale-95
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                       transition-all duration-200 flex items-center justify-center gap-2 order-1 sm:order-2
                       shadow-md shadow-blue-200"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Création...
              </>
            ) : (
              <>
                <Calendar size={16} />
                Créer l'événement
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgendaCreateModal;