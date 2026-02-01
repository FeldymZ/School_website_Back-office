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
} from "lucide-react";
import { AgendaService } from "@/services/agenda.service";
import { useState } from "react";

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

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-6 border border-gray-200 animate-pulse"
          >
            <div className="flex justify-between items-center">
              <div className="space-y-3 flex-1">
                <div className="h-6 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
              </div>
              <div className="flex gap-2">
                <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                <div className="w-10 h-10 bg-gray-200 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const toggleEnabled = async (event: AgendaEvent) => {
    await AgendaService.update(event.id, {
      enabled: !event.enabled,
    });
    onRefresh();
  };

  const EventCard = ({
    event,
    index,
    isPast,
  }: {
    event: AgendaEvent;
    index: number;
    isPast?: boolean;
  }) => (
    <div
      key={event.id}
      className="group relative overflow-hidden bg-white rounded-2xl p-6 border border-gray-200
                 hover:shadow-xl hover:border-[#00A4E0] transition-all duration-300"
      style={{
        animation: `slideUp 0.4s ease-out ${index * 0.1}s both`
      }}
    >
      {/* Gradient Background on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#cfe3ff]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Event Info */}
        <div className="flex-1 space-y-3">
          {/* Title & Status */}
          <div className="flex items-start gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
              isPast || !event.enabled
                ? "bg-gradient-to-br from-[#A6A6A6] to-gray-500"
                : "bg-gradient-to-br from-[#00A4E0] to-[#0077A8]"
            }`}>
              <Calendar size={20} className="text-white" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`text-lg font-bold transition-colors ${
                  isPast || !event.enabled
                    ? "text-[#A6A6A6]"
                    : "text-gray-900 group-hover:text-[#00A4E0]"
                }`}>
                  {event.title}
                </h3>
                {!event.enabled && (
                  <span className="px-2 py-0.5 bg-[#A6A6A6]/10 text-[#A6A6A6] text-xs font-medium rounded-full">
                    Désactivé
                  </span>
                )}
                {isPast && event.enabled && (
                  <span className="px-2 py-0.5 bg-[#A6A6A6]/10 text-[#A6A6A6] text-xs font-medium rounded-full">
                    Passé
                  </span>
                )}
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} className={isPast ? "text-[#A6A6A6]" : "text-[#00A4E0]"} />
                  <span className="font-medium">{event.eventDate}</span>
                </span>

                {event.startTime && (
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className={isPast ? "text-[#A6A6A6]" : "text-[#00A4E0]"} />
                    {event.startTime}
                    {event.endTime && ` - ${event.endTime}`}
                  </span>
                )}

                {event.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} className={isPast ? "text-[#A6A6A6]" : "text-[#00A4E0]"} />
                    {event.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <p className={`text-sm line-clamp-2 pl-15 ${
              isPast || !event.enabled ? "text-[#A6A6A6]" : "text-gray-600"
            }`}>
              {event.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 md:flex-shrink-0">
          <button
            onClick={() => toggleEnabled(event)}
            title={event.enabled ? "Désactiver" : "Activer"}
            className={`p-3 rounded-xl border-2 transition-all hover:scale-110 active:scale-95 ${
              event.enabled
                ? "text-[#00A4E0] border-[#cfe3ff] bg-[#cfe3ff]/30 hover:bg-[#cfe3ff]/50"
                : "text-[#A6A6A6] border-gray-200 bg-gray-50 hover:bg-gray-100"
            }`}
          >
            {event.enabled ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>

          <button
            onClick={() => onEdit(event)}
            className="p-3 rounded-xl border-2 border-[#cfe3ff] bg-[#cfe3ff]/30 text-[#00A4E0]
                       hover:bg-[#cfe3ff]/50 hover:scale-110 active:scale-95 transition-all"
            title="Modifier"
          >
            <Pencil size={18} />
          </button>

          <button
            onClick={() => onDelete(event)}
            className="p-3 rounded-xl border-2 border-red-200 bg-red-50 text-red-600
                       hover:bg-red-100 hover:scale-110 active:scale-95 transition-all"
            title="Supprimer"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Section Événements à venir */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl flex items-center justify-center shadow-lg">
              <CalendarCheck size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Événements à venir
              </h3>
              <p className="text-sm text-gray-500">
                {upcomingEvents.length} événement{upcomingEvents.length > 1 ? 's' : ''} programmé{upcomingEvents.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <span className="px-4 py-2 bg-[#cfe3ff] text-[#00A4E0] rounded-full text-sm font-semibold">
            {upcomingEvents.length}
          </span>
        </div>

        {upcomingEvents.length === 0 ? (
          <div className="bg-gradient-to-br from-[#cfe3ff] to-white rounded-2xl p-8 text-center border-2 border-[#00A4E0]/20">
            <CalendarCheck className="w-12 h-12 text-[#00A4E0] mx-auto mb-3" />
            <p className="text-[#00A4E0] font-medium">Aucun événement à venir</p>
            <p className="text-sm text-gray-600 mt-1">Planifiez votre prochain événement</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <EventCard key={event.id} event={event} index={index} isPast={false} />
            ))}
          </div>
        )}
      </div>

      {/* Section Événements passés */}
      {pastEvents.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#A6A6A6] to-gray-500 rounded-xl flex items-center justify-center shadow-lg">
                <CalendarX size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Événements passés
                </h3>
                <p className="text-sm text-gray-500">
                  {pastEvents.length} événement{pastEvents.length > 1 ? 's' : ''} terminé{pastEvents.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-4 py-2 bg-gray-100 text-[#A6A6A6] rounded-full text-sm font-semibold">
                {pastEvents.length}
              </span>
              <button
                onClick={() => setShowPastEvents(!showPastEvents)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={showPastEvents ? "Masquer" : "Afficher"}
              >
                {showPastEvents ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {showPastEvents && (
            <div className="space-y-4">
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
