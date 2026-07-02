export const API_CONFIG = {
  BASE_URL: "https://api-test.esiitech-gabon.com",

  AUTH: {
    LOGIN: "/api/auth/login",
  },

  ME: "/api/me", // 🆕

  MENU_PERMISSIONS: "/api/menu-permissions", // 🆕

  ADMIN: {
    CREATE: "/api/admin/user/create", // 🆕 (déjà utilisé par ton AdminController, à vérifier dans ton userService actuel)
    USERS: "/api/admin/users", // 🆕 base pour /:id/menu-access, /:id/password, etc.
  },

  FORMATIONS: {
    ALL:      "/api/public/formations/initiale",
    BY_LEVEL: (level: string) =>
      `/api/public/formations/initiale/level/${level}`,
  },

  PREINSCRIPTIONS: {
    ALL:        "/api/admin/preinscriptions",
    EN_ATTENTE: "/api/admin/preinscriptions/statut/EN_ATTENTE",
    PDF:        (id: number) => `/api/admin/preinscriptions/${id}/pdf`,
  },

  ACTUALITES:       "/api/public/actualites",
  PARTENAIRES:      "/api/public/partenaires",
  CONTACT_MESSAGES: "/api/admin/contact/messages",

  AGENDA: {
    UPCOMING: "/api/public/agenda/upcoming",
    PAST:     "/api/public/agenda/past",
  },

  KEY_FIGURES: "/api/public/key-figures",
};