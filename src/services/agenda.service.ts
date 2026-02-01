import api from "./api";

/* ============================
   TYPES ADMIN
============================ */

export interface AgendaEvent {
  id: number;
  title: string;
  description?: string;
  eventDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  enabled: boolean;
}

export interface AgendaCalendarEvent {
  id: number;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  enabled: boolean;
  multiDay: boolean;
}

export interface AgendaCalendarDayAdmin {
  date: string;
  events: AgendaCalendarEvent[];
}

export interface AgendaCalendarResponseAdmin {
  year: number;
  month: number;
  days: AgendaCalendarDayAdmin[];
}

/* ============================
   SERVICE ADMIN
============================ */

export const AgendaService = {
  /* ============================
     📋 LISTE COMPLÈTE (actifs + désactivés)
     ============================ */
  getAll(): Promise<AgendaEvent[]> {
    return api
      .get("/api/admin/agenda")
      .then(res => res.data);
  },

  /* ============================
     ➕ CRÉATION
     ============================ */
  create(data: FormData): Promise<AgendaEvent> {
    return api
      .post("/api/admin/agenda", data)
      .then(res => res.data);
  },

  /* ============================
     ✏️ MISE À JOUR (dont enabled)
     ============================ */
  update(
    id: number,
    data: Partial<AgendaEvent>
  ): Promise<AgendaEvent> {
    return api
      .put(`/api/admin/agenda/${id}`, data)
      .then(res => res.data);
  },

  /* ============================
     🗑️ SUPPRESSION
     ============================ */
  delete(id: number): Promise<void> {
    return api
      .delete(`/api/admin/agenda/${id}`)
      .then(() => undefined);
  },

  /* ============================
     📅 CALENDRIER ADMIN
     ============================ */
  getCalendar(
    year: number,
    month: number
  ): Promise<AgendaCalendarResponseAdmin> {
    return api
      .get("/api/admin/agenda/calendar", {
        params: { year, month },
      })
      .then(res => res.data);
  },

  /* ============================
     🔄 ACTIVER / DÉSACTIVER RAPIDE
     ============================ */
  toggleEnabled(
    id: number,
    enabled: boolean
  ): Promise<AgendaEvent> {
    return api
      .put(`/api/admin/agenda/${id}`, { enabled })
      .then(res => res.data);
  },
};
