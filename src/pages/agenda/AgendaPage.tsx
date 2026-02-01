import { useCallback, useEffect, useState } from "react";
import { Plus, Calendar as CalendarIcon, Sparkles } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#cfe3ff] p-6">
      <div className="max-w-[1600px] mx-auto space-y-8">

        {/* ================= HEADER ================= */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8] rounded-3xl opacity-5 blur-3xl" />
          <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl flex items-center justify-center shadow-lg">
                  <CalendarIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Agenda des Événements
                  </h1>
                  <p className="text-gray-600 mt-1 flex items-center gap-2">
                    <Sparkles size={14} className="text-[#00A4E0]" />
                    {upcomingEvents.length} événement
                    {upcomingEvents.length > 1 ? "s" : ""} à venir
                  </p>
                </div>
              </div>

              {/* ⚠️ Filtre logique (sans changer le design) */}
              <div className="flex items-center gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value as StatusFilter
                    )
                  }
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm
                             focus:outline-none focus:ring-2 focus:ring-[#00A4E0]"
                >
                  <option value="all">Tous</option>
                  <option value="enabled">Actifs</option>
                  <option value="disabled">Désactivés</option>
                </select>

                <button
                  onClick={() => setCreateOpen(true)}
                  className="px-6 py-3 rounded-xl font-medium text-white
                             bg-gradient-to-r from-[#00A4E0] to-[#0077A8]
                             hover:scale-105 transition-all shadow-lg"
                >
                  <span className="flex items-center gap-2">
                    <Plus size={20} />
                    Nouvel événement
                  </span>
                </button>
              </div>
            </div>
          </div>
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
