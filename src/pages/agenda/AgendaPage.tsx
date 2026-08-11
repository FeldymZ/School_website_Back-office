import { useCallback, useEffect, useState } from "react";
import { Plus, Calendar as CalendarIcon, Sparkles, ChevronDown, RefreshCw, CalendarCheck, CalendarX, PowerOff } from "lucide-react";

import { AgendaEvent } from "@/types/agenda";
import AgendaList from "@/components/agenda/AgendaList";
import AgendaCreateModal from "@/components/agenda/AgendaCreateModal";
import AgendaEditModal from "@/components/agenda/AgendaEditModal";
import AgendaDeleteConfirm from "@/components/agenda/AgendaDeleteConfirm";

import { AgendaService } from "@/services/agenda.service";

/* =======================
   Filtre statut
======================= */
type StatusFilter = "all" | "enabled" | "disabled";

/* =======================
   Mini stat card
======================= */
function MiniStat({ label, value, icon: Icon, color }: {
  label: string; value: number; icon: any; color: string;
}) {
  return (
    <div className="flex items-center gap-3 bg-white/80 backdrop-blur-xl rounded-2xl border border-white shadow-md px-5 py-4">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm flex-shrink-0`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <p className="text-xl font-black text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

const AgendaPage = () => {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const [createOpen, setCreateOpen] = useState(false);
  const [editEvent, setEditEvent] =
    useState<AgendaEvent | null>(null);
  const [deleteEvent, setDeleteEvent] =
    useState<AgendaEvent | null>(null);

  /* =======================
     Charger TOUS les events
  ======================= */
  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await AgendaService.getAll();
      setEvents(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  /* =======================
     Filtrage logique
  ======================= */
  const today = new Date().toISOString().split("T")[0];

  const filteredEvents = events.filter((e) => {
    if (statusFilter === "enabled") return e.enabled;
    if (statusFilter === "disabled") return !e.enabled;
    return true;
  });

  const upcomingEvents = filteredEvents.filter(
    (e) => e.eventDate >= today
  );

  const pastEvents = filteredEvents.filter(
    (e) => e.eventDate < today
  );

  const disabledCount = events.filter((e) => !e.enabled).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#cfe3ff] p-4 sm:p-6">
      <div className="max-w-[1600px] mx-auto space-y-8">

        {/* ================= HEADER ================= */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8] rounded-3xl opacity-5 blur-3xl" />
          <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="relative group flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                    <CalendarIcon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                    Agenda des Événements
                    <Sparkles size={18} className="text-[#00A4E0] animate-pulse" />
                  </h1>
                  <p className="text-gray-600 mt-1 flex items-center gap-2 text-sm">
                    {events.length} événement{events.length > 1 ? "s" : ""} au total
                  </p>
                </div>
              </div>

              {/* Filtre + actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(
                        e.target.value as StatusFilter
                      )
                    }
                    className="w-full sm:w-auto pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm bg-white
                               focus:outline-none focus:ring-2 focus:ring-[#00A4E0]/30 focus:border-[#00A4E0]
                               appearance-none transition-all"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="enabled">Actifs</option>
                    <option value="disabled">Désactivés</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>

                <button
                  onClick={loadEvents}
                  disabled={loading}
                  className="group inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm
                             border border-gray-200 bg-white hover:border-[#00A4E0] hover:text-[#00A4E0]
                             hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm disabled:opacity-50"
                >
                  <RefreshCw size={15} className={`group-hover:rotate-180 transition-transform duration-500 ${loading ? "animate-spin" : ""}`} />
                  Rafraîchir
                </button>

                <button
                  onClick={() => setCreateOpen(true)}
                  className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-white
                             bg-gradient-to-r from-[#00A4E0] to-[#0077A8]
                             hover:scale-105 active:scale-95 transition-all shadow-lg overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <Plus size={20} className="relative z-10" />
                  <span className="relative z-10">Nouvel événement</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================= STATS RAPIDES ================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <MiniStat label="À venir" value={upcomingEvents.length} icon={CalendarCheck} color="from-[#00A4E0] to-[#0077A8]" />
          <MiniStat label="Passés" value={pastEvents.length} icon={CalendarX} color="from-gray-400 to-gray-500" />
          <MiniStat label="Désactivés" value={disabledCount} icon={PowerOff} color="from-amber-400 to-orange-500" />
        </div>

        {/* ================= LISTE ================= */}
        <AgendaList
          upcomingEvents={upcomingEvents}
          pastEvents={pastEvents}
          loading={loading}
          onEdit={setEditEvent}
          onDelete={setDeleteEvent}
          onRefresh={loadEvents}
        />

        {/* ================= MODALS ================= */}
        <AgendaCreateModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreated={loadEvents}
        />

        <AgendaEditModal
          event={editEvent}
          onClose={() => setEditEvent(null)}
          onUpdated={loadEvents}
        />

        <AgendaDeleteConfirm
          open={!!deleteEvent}
          onCancel={() => setDeleteEvent(null)}
          onConfirm={async () => {
            if (deleteEvent) {
              await AgendaService.delete(deleteEvent.id);
              setDeleteEvent(null);
              loadEvents();
            }
          }}
        />
      </div>
    </div>
  );
};

export default AgendaPage;