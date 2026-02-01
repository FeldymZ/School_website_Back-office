/**
 * URL de base de l'API backend
 * 👉 doit pointer vers le domaine qui sert /files/**
 */
const API_BASE_URL = "https://api-test.esiitech-gabon.com";

/**
 * Construit une URL d'image / média valide depuis le backend
 *
 * Cas gérés :
 * - URL absolue (https://...)
 * - chemin relatif (/files/...)
 * - chemin sans slash (files/...)
 * - valeur null / undefined
 *
 * Utilisation :
 *   <img src={resolveImageUrl(actualite.coverImageUrl)} />
 *   <img src={resolveImageUrl(banner.mediaUrl)} />
 *   <video src={resolveMediaUrl(banner.mediaUrl)} />
 */
export const resolveImageUrl = (path?: string | null): string => {
  // Vide / null
  if (!path || path.trim() === "") {
    console.warn("⚠️ URL d'image vide ou null");
    return "/placeholder.png";
  }

  // URL absolue
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Chemin relatif avec slash
  if (path.startsWith("/")) {
    return `${API_BASE_URL}${path}`;
  }

  // Chemin relatif sans slash
  return `${API_BASE_URL}/${path}`;
};

/**
 * Alias pour compatibilité (bannières, vidéos, etc.)
 */
export const resolveMediaUrl = resolveImageUrl;

/**
 * Vérifie si une URL correspond à une vidéo
 */
export const isVideoUrl = (url?: string | null): boolean => {
  if (!url) return false;

  const videoExtensions = [
    ".mp4",
    ".webm",
    ".ogg",
    ".mov",
    ".avi",
    ".mkv",
  ];

  const lowerUrl = url.toLowerCase();
  return videoExtensions.some(ext => lowerUrl.endsWith(ext));
};

/**
 * Vérifie si une URL correspond à une image
 */
export const isImageUrl = (url?: string | null): boolean => {
  if (!url) return false;

  const imageExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".svg",
    ".bmp",
  ];

  const lowerUrl = url.toLowerCase();
  return imageExtensions.some(ext => lowerUrl.endsWith(ext));
};
