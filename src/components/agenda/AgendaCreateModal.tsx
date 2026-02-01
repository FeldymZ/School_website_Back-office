import { X, Calendar, MapPin, Clock, FileText, Sparkles } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8] opacity-10" />
          <div className="relative flex items-center justify-between px-8 py-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl flex items-center justify-center shadow-lg">
                <Calendar size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Nouvel événement
                </h2>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Sparkles size={12} className="text-[#00A4E0]" />
                  Ajoutez un événement à l'agenda
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
            <label className="block text-sm font-semibold text-gray-700">
              Titre de l'événement <span className="text-red-500">*</span>
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

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Date de début <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3
                             focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
                             transition-all hover:border-gray-300"
                  value={form.eventDate}
                  onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Date de fin
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3
                             focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
                             transition-all hover:border-gray-300"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Heures */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Heure de début
              </label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="time"
                  className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3
                             focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
                             transition-all hover:border-gray-300"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Heure de fin
              </label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="time"
                  className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3
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
            <label className="block text-sm font-semibold text-gray-700">
              Lieu
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Ex: Campus principal"
                className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3
                           focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
                           transition-all hover:border-gray-300"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Description
            </label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400 pointer-events-none" />
              <textarea
                placeholder="Décrivez l'événement..."
                rows={4}
                className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3
                           focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
                           transition-all hover:border-gray-300 resize-none"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
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
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Calendar size={18} />
                  Créer l'événement
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgendaCreateModal;
