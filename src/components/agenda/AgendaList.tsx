import { AgendaEvent } from "@/types/agenda";
import {
  MapPin,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Clock,
  CalendarCheck,
  CalendarX,
  Loader2,
} from "lucide-react";
import { AgendaService } from "@/services/agenda.service";
import { memo, useState } from "react";
import toast from "react-hot-toast";

interface Props {
  upcomingEvents: AgendaEvent[];
  pastEvents: AgendaEvent[];
  loading: boolean;
  onEdit: (e: AgendaEvent) => void;
  onDelete: (e: AgendaEvent) => void;
  onRefresh: () => void;
}

/* =======================
   Toggle switch (statut actif/inactif)
======================= */
function ToggleSwitch({
  checked,
  loading,
  onChange,
}: {
  checked: boolean;
  loading: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={checked ? "Désactiver l'événement" : "Activer l'événement"}
      onClick={onChange}
      disabled={loading}
      className={`relative flex-shrink-0 inline-flex items-center rounded-full transition-colors duration-200
                  w-11 h-6 min-w-[44px] disabled:opacity-60
                  ${checked ? "bg-gradient-to-r from-[#00A4E0] to-[#0077A8]" : "bg-gray-300"}`}
    >
      <span
        className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200
                    flex items-center justify-center
                    ${checked ? "translate-x-5" : "translate-x-0"}`}
      >
        {loading && <Loader2 size={11} className="animate-spin text-gray-400" />}
      </span>
    </button>
  );
}

/* =======================
   Badge date façon "page de calendrier"
======================= */
function DateBadge({ date, isPast }: { date: string; isPast?: boolean }) {
  const d = new Date(date);
  const day = d.toLocaleDateString("fr-FR", { day: "2-digit" });
  const month = d.toLocaleDateString("fr-FR", { month: "short" }).replace(".", "");

  return (
    <div
      className={`flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex flex-col items-center justify-center shadow-lg leading-none ${
        isPast
          ? "bg-gradient-to-br from-[#A6A6A6] to-gray-500"
          : "bg-gradient-to-br from-[#00A4E0] to-[#0077A8]"
      }`}
    >
      <span className="text-white text-sm sm:text-base font-black">{day}</span>
      <span className="text-white/85 text-[9px] sm:text-[10px] uppercase font-semibold tracking-wide">
        {month}
      </span>
    </div>
  );
}

/* =======================
   Carte événement (composant stable, extrait pour ne pas
   être re-créé — donc re-monté — à chaque rendu de la liste)
======================= */
interface EventCardProps {
  event: AgendaEvent;
  index: number;
  isPast?: boolean;
  isToggling: boolean;
  onToggleEnabled: (event: AgendaEvent) => void;
  onEdit: (event: AgendaEvent) => void;
  onDelete: (event: AgendaEvent) => void;
}

const EventCard = memo(function EventCard({
  event,
  index,
  isPast,
  isToggling,
  onToggleEnabled,
  onEdit,
  onDelete,
}: EventCardProps) {
  return (
    <div
      className="group relative overflow-hidden bg-white rounded-2xl p-4 sm:p-6 border border-gray-200
                 hover:shadow-xl hover:border-[#00A4E0] transition-all duration-300"
      style={{
        animation: `slideUp 0.4s ease-out ${Math.min(index, 8) * 0.06}s both`,
      }}
    >
      {/* Gradient Background on hover (desktop only — avoids a stuck hover state on touch) */}
      <div className="hidden sm:block absolute inset-0 bg-gradient-to-r from-[#cfe3ff]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="relative flex flex-col gap-4">
        {/* Event Info */}
        <div className="flex items-start gap-3">
          <DateBadge date={event.eventDate} isPast={isPast || !event.enabled} />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 mb-1 flex-wrap min-w-0">
                <h3
                  className={`text-base sm:text-lg font-bold transition-colors break-words ${
                    isPast || !event.enabled
                      ? "text-[#A6A6A6]"
                      : "text-gray-900 sm:group-hover:text-[#00A4E0]"
                  }`}
                >
                  {event.title}
                </h3>
                {isPast && event.enabled && (
                  <span className="px-2 py-0.5 bg-[#A6A6A6]/10 text-[#A6A6A6] text-[11px] sm:text-xs font-medium rounded-full whitespace-nowrap">
                    Passé
                  </span>
                )}
              </div>

              <ToggleSwitch
                checked={event.enabled}
                loading={isToggling}
                onChange={() => onToggleEnabled(event)}
              />
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs sm:text-sm text-gray-600">
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

              {!event.enabled && (
                <span className="text-[11px] sm:text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  Désactivé
                </span>
              )}
            </div>

            {/* Description */}
            {event.description && (
              <p
                className={`text-xs sm:text-sm line-clamp-2 mt-2 ${
                  isPast || !event.enabled ? "text-[#A6A6A6]" : "text-gray-600"
                }`}
              >
                {event.description}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 sm:pt-0 border-t border-gray-100 sm:border-t-0 sm:justify-end">
          <button
            onClick={() => onEdit(event)}
            className="flex-1 sm:flex-initial min-h-[44px] flex items-center justify-center gap-1.5 px-3 sm:p-3 rounded-xl border-2 border-[#cfe3ff] bg-[#cfe3ff]/30 text-[#00A4E0]
                       hover:bg-[#cfe3ff]/50 sm:hover:scale-110 active:scale-95 transition-all"
            title="Modifier"
          >
            <Pencil size={17} />
            <span className="text-sm font-medium sm:hidden">Modifier</span>
          </button>

          <button
            onClick={() => onDelete(event)}
            className="flex-1 sm:flex-initial min-h-[44px] flex items-center justify-center gap-1.5 px-3 sm:p-3 rounded-xl border-2 border-red-200 bg-red-50 text-red-600
                       hover:bg-red-100 sm:hover:scale-110 active:scale-95 transition-all"
            title="Supprimer"
          >
            <Trash2 size={17} />
            <span className="text-sm font-medium sm:hidden">Supprimer</span>
          </button>
        </div>
      </div>
    </div>
  );
});

/* =======================
   Liste principale
======================= */
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

  if (loading) {
    return (
      <div className="space-y-3 sm:space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 animate-pulse"
          >
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gray-200 rounded-xl flex-shrink-0" />
              <div className="space-y-3 flex-1">
                <div className="h-5 sm:h-6 bg-gray-200 rounded w-2/3 sm:w-1/3" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
            <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
              <div className="flex-1 h-10 bg-gray-100 rounded-xl" />
              <div className="flex-1 h-10 bg-gray-100 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

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
              <EventCard
                key={event.id}
                event={event}
                index={index}
                isPast={false}
                isToggling={togglingId === event.id}
                onToggleEnabled={toggleEnabled}
                onEdit={onEdit}
                onDelete={onDelete}
              />
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
            <div className="space-y-3 sm:space-y-4 animate-in-fade">
              {pastEvents.map((event, index) => (
                <EventCard
                  key={event.id}
                  event={event}
                  index={index}
                  isPast={true}
                  isToggling={togglingId === event.id}
                  onToggleEnabled={toggleEnabled}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
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
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-in-fade {
          animation: fadeIn 0.25s ease-out both;
        }
      `}</style>
    </div>
  );
};

export default AgendaList;