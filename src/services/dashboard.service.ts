import axios from "axios";
import { API_CONFIG } from "../config/api";
import { getToken } from "../utils/storage";

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
});

// Interceptor JWT (admin endpoints)
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const DashboardService = {
  getFormationsCount: async () => {
    const res = await api.get(API_CONFIG.FORMATIONS.ALL);
    return res.data.length;
  },

  getFormationsByLevel: async (level: string) => {
    const res = await api.get(
      API_CONFIG.FORMATIONS.BY_LEVEL(level)
    );
    return res.data.length;
  },

  getFormationsLicenceCount: async () => {
    return DashboardService.getFormationsByLevel(
      "LICENCE"
    );
  },

  getFormationsMasterCount: async () => {
    return DashboardService.getFormationsByLevel(
      "MASTER"
    );
  },

  getPreinscriptionsTotal: async () => {
    const res = await api.get(API_CONFIG.PREINSCRIPTIONS.ALL);
    return res.data.length;
  },

  getPreinscriptionsEnAttente: async () => {
    const res = await api.get(
      API_CONFIG.PREINSCRIPTIONS.EN_ATTENTE
    );
    return res.data.length;
  },

  getActualitesCount: async () => {
    const res = await api.get(API_CONFIG.ACTUALITES);
    return res.data.length;
  },

  /* ✅ NOUVEAU - Nombre d'activités */
  getActivitesCount: async () => {
    const res = await api.get("/api/admin/activites");
    return res.data.length;
  },

  getPartenairesCount: async () => {
    const res = await api.get(API_CONFIG.PARTENAIRES);
    return res.data.length;
  },

  getMessagesCount: async () => {
    const res = await api.get(API_CONFIG.CONTACT_MESSAGES);
    return res.data.length;
  },

  getEvenementsAVenir: async () => {
    const res = await api.get(API_CONFIG.AGENDA.UPCOMING);
    return res.data.length;
  },

  getEvenementsPasses: async () => {
    const res = await api.get(API_CONFIG.AGENDA.PAST);
    return res.data.length;
  },

  getKeyFigures: async () => {
    const res = await api.get(API_CONFIG.KEY_FIGURES);
    return res.data;
  },
};
