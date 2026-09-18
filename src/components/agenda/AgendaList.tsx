import { AgendaEvent } from "@/types/agenda";
import {
  Calendar,
  MapPin,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Clock,
  CalendarCheck,
  CalendarX,
  ToggleLeft,
  ToggleRight,
  Loader2,
} from "lucide-react";
import { AgendaService } from "@/services/agenda.service";
import { useState } from "react";
import toast from "react-hot-toast";

interface Props {
  upcomingEvents: AgendaEvent[];
  pastEvents: AgendaEvent[];
  loading: boolean;
  onEdit: (e: AgendaEvent) => void;
  onDelete: (e: AgendaEvent) => void;
  onRefresh: () => void;
}

const AgendaList = ({
  upcomingEvents,
  pastEvents,
  loading,
  onEdit,
  onDelete,
  onRefresh,
}: Props) => {
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="space-y-3 sm:space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 animate-pulse"
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="space-y-3 flex-1">
                <div className="h-5 sm:h-6 bg-gray-200 rounded w-2/3 sm:w-1/3" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
              </div>
              <div className="flex gap-2">
                <div className="flex-1 sm:flex-initial sm:w-10 h-10 bg-gray-200 rounded-lg" />
                <div className="flex-1 sm:flex-initial sm:w-10 h-10 bg-gray-200 rounded-lg" />
                <div className="flex-1 sm:flex-initial sm:w-10 h-10 bg-gray-200 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const toggleEnabled = async (event: AgendaEvent) => {
    try {
      setTogglingId(event.id);
      await AgendaService.update(event.id, {
        enabled: !event.enabled,
      });
      toast.success(event.enabled ? "Événement désactivé" : "Événement activé");
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la modification du statut");
    } finally {
      setTogglingId(null);
    }
  };

  const EventCard = ({
    event,
    index,
    isPast,
  }: {
    event: AgendaEvent;
    index: number;
    isPast?: boolean;
  }) => {
    const isToggling = togglingId === event.id;

    return (
      <div
        key={event.id}
        className="group relative overflow-hidden bg-white rounded-2xl p-4 sm:p-6 border border-gray-200
                   hover:shadow-xl hover:border-[#00A4E0] transition-all duration-300"
        style={{
          animation: `slideUp 0.4s ease-out ${index * 0.1}s both`
        }}
      >
        {/* Gradient Background on hover (desktop only — avoids a stuck hover state on touch) */}
        <div className="hidden sm:block absolute inset-0 bg-gradient-to-r from-[#cfe3ff]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative flex flex-col gap-4">
          {/* Event Info */}
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-xl flex items-center justify-center shadow-lg ${
              isPast || !event.enabled
                ? "bg-gradient-to-br from-[#A6A6A6] to-gray-500"
                : "bg-gradient-to-br from-[#00A4E0] to-[#0077A8]"
            }`}>
              <Calendar size={18} className="text-white sm:hidden" />
              <Calendar size={20} className="text-white hidden sm:block" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className={`text-base sm:text-lg font-bold transition-colors break-words ${
                  isPast || !event.enabled
                    ? "text-[#A6A6A6]"
                    : "text-gray-900 sm:group-hover:text-[#00A4E0]"
                }`}>
                  {event.title}
                </h3>
                {!event.enabled && (
                  <span className="px-2 py-0.5 bg-[#A6A6A6]/10 text-[#A6A6A6] text-[11px] sm:text-xs font-medium rounded-full whitespace-nowrap">
                    Désactivé
                  </span>
                )}
                {isPast && event.enabled && (
                  <span className="px-2 py-0.5 bg-[#A6A6A6]/10 text-[#A6A6A6] text-[11px] sm:text-xs font-medium rounded-full whitespace-nowrap">
                    Passé
                  </span>
                )}
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 sm:gap-4 text-xs sm:text-sm text-gray-600">
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} className={isPast ? "text-[#A6A6A6]" : "text-[#00A4E0]"} />
                  <span className="font-medium">{event.eventDate}</span>
                </span>

                {event.startTime && (
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} className={isPast ? "text-[#A6A6A6]" : "text-[#00A4E0]"} />
                    {event.startTime}
                    {event.endTime && ` - ${event.endTime}`}
                  </span>
                )}

                {event.location && (
                  <span className="flex items-center gap-1.5 min-w-0">
                    <MapPin size={13} className={`flex-shrink-0 ${isPast ? "text-[#A6A6A6]" : "text-[#00A4E0]"}`} />
                    <span className="truncate">{event.location}</span>
                  </span>
                )}
              </div>

              {/* Description */}
              {event.description && (
                <p className={`text-xs sm:text-sm line-clamp-2 mt-2 ${
                  isPast || !event.enabled ? "text-[#A6A6A6]" : "text-gray-600"
                }`}>
                  {event.description}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-3 sm:pt-0 border-t border-gray-100 sm:border-t-0 sm:justify-end">
            <button
              onClick={() => toggleEnabled(event)}
              disabled={isToggling}
              title={event.enabled ? "Désactiver" : "Activer"}
              className={`flex-1 sm:flex-initial min-h-[44px] flex items-center justify-center gap-1.5 px-3 sm:p-3 rounded-xl border-2 transition-all sm:hover:scale-110 active:scale-95 disabled:opacity-60 disabled:hover:scale-100 ${
                event.enabled
                  ? "text-[#00A4E0] border-[#cfe3ff] bg-[#cfe3ff]/30 hover:bg-[#cfe3ff]/50"
                  : "text-[#A6A6A6] border-gray-200 bg-gray-50 hover:bg-gray-100"
              }`}
            >
              {isToggling ? (
                <Loader2 size={18} className="animate-spin" />
              ) : event.enabled ? (
                <ToggleRight size={18} />
              ) : (
                <ToggleLeft size={18} />
              )}
              <span className="text-xs font-medium sm:hidden">
                {event.enabled ? "Désactiver" : "Activer"}
              </span>
            </button>

            <button
              onClick={() => onEdit(event)}
              className="flex-1 sm:flex-initial min-h-[44px] flex items-center justify-center gap-1.5 px-3 sm:p-3 rounded-xl border-2 border-[#cfe3ff] bg-[#cfe3ff]/30 text-[#00A4E0]
                         hover:bg-[#cfe3ff]/50 sm:hover:scale-110 active:scale-95 transition-all"
              title="Modifier"
            >
              <Pencil size={18} />
              <span className="text-xs font-medium sm:hidden">Modifier</span>
            </button>

            <button
              onClick={() => onDelete(event)}
              className="flex-1 sm:flex-initial min-h-[44px] flex items-center justify-center gap-1.5 px-3 sm:p-3 rounded-xl border-2 border-red-200 bg-red-50 text-red-600
                         hover:bg-red-100 sm:hover:scale-110 active:scale-95 transition-all"
              title="Supprimer"
            >
              <Trash2 size={18} />
              <span className="text-xs font-medium sm:hidden">Supprimer</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Section Événements à venir */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl flex items-center justify-center shadow-lg">
              <CalendarCheck size={18} className="text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-lg font-bold text-gray-900 truncate">
                Événements à venir
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 truncate">
                {upcomingEvents.length} événement{upcomingEvents.length > 1 ? 's' : ''} programmé{upcomingEvents.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <span className="flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#cfe3ff] text-[#00A4E0] rounded-full text-xs sm:text-sm font-semibold">
            {upcomingEvents.length}
          </span>
        </div>

        {upcomingEvents.length === 0 ? (
          <div className="bg-gradient-to-br from-[#cfe3ff] to-white rounded-2xl p-6 sm:p-8 text-center border-2 border-[#00A4E0]/20">
            <CalendarCheck className="w-10 h-10 sm:w-12 sm:h-12 text-[#00A4E0] mx-auto mb-3" />
            <p className="text-[#00A4E0] font-medium text-sm sm:text-base">Aucun événement à venir</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Planifiez votre prochain événement</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {upcomingEvents.map((event, index) => (
              <EventCard key={event.id} event={event} index={index} isPast={false} />
            ))}
          </div>
        )}
      </div>

      {/* Section Événements passés */}
      {pastEvents.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 bg-gradient-to-br from-[#A6A6A6] to-gray-500 rounded-xl flex items-center justify-center shadow-lg">
                <CalendarX size={18} className="text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-lg font-bold text-gray-900 truncate">
                  Événements passés
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 truncate">
                  {pastEvents.length} événement{pastEvents.length > 1 ? 's' : ''} terminé{pastEvents.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 text-[#A6A6A6] rounded-full text-xs sm:text-sm font-semibold">
                {pastEvents.length}
              </span>
              <button
                onClick={() => setShowPastEvents(!showPastEvents)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors min-h-[40px]"
                title={showPastEvents ? "Masquer" : "Afficher"}
              >
                {showPastEvents ? <EyeOff size={15} /> : <Eye size={15} />}
                {showPastEvents ? "Masquer" : "Afficher"}
              </button>
            </div>
          </div>

          {showPastEvents && (
            <div className="space-y-3 sm:space-y-4">
              {pastEvents.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} isPast={true} />
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default AgendaList;