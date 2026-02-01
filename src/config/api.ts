

export const API_CONFIG = {
  BASE_URL: "https://api-test.esiitech-gabon.com",

   AUTH: {
    LOGIN: "/api/auth/login",
  },

  FORMATIONS: {
    ALL: "/api/public/formations/initiale",
    BY_LEVEL: (level: string) =>
      `/api/public/formations/initiale/level/${level}`,
  },

  PREINSCRIPTIONS: {
    ALL: "/api/admin/preinscriptions",
    EN_ATTENTE: "/api/admin/preinscriptions/statut/EN_ATTENTE",
  },

  ACTUALITES: "/api/public/actualites",
  PARTENAIRES: "/api/public/partenaires",

  CONTACT_MESSAGES: "/api/admin/contact/messages",

  AGENDA: {
    UPCOMING: "/api/public/agenda/upcoming",
    PAST: "/api/public/agenda/past",
  },

  KEY_FIGURES: "/api/public/key-figures",
};
