/**
 * URL de base de l'API backend
 * 👉 doit pointer vers le domaine qui sert /files/**
 */
const API_BASE_URL = "https://api-test.esiitech-gabon.com";

/**
 * Construit une URL média valide depuis le backend
 *
 * Cas gérés :
 * - URL absolue (https://...)
 * - chemin relatif (/files/...)
 * - valeur null / undefined
 *
 * Utilisation :
 *   <img src={resolveMediaUrl(banner.mediaUrl)} />
 *   <video src={resolveMediaUrl(banner.mediaUrl)} />
 */
export const resolveMediaUrl = (
  path?: string | null
): string => {
  if (!path || path.trim() === "") {
    // Image fallback locale (optionnelle)
    return "/placeholder.png";
  }

  // URL déjà absolue → on la retourne telle quelle
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Sécurité : éviter les doubles slashes
  if (path.startsWith("/")) {
    return `${API_BASE_URL}${path}`;
  }

  // Cas rare : chemin sans slash initial
  return `${API_BASE_URL}/${path}`;
};
