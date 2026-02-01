/**
 * Nettoie le HTML généré par TipTap avant stockage
 *
 * Objectifs :
 * - Supprimer les paragraphes vides
 * - Supprimer <p><br></p>, <p><br /></p>
 * - Supprimer <p>&nbsp;</p>
 * - Supprimer les retours à la ligne inutiles
 * - Conserver le HTML sémantique valide
 *
 * ⚠️ Ne fait PAS de sanitization sécurité (DOMPurify à faire séparément)
 */
export function normalizeHtml(html: string): string {
  if (!html) return "";

  return html
    // <p><br></p> ou <p><br /></p>
    .replace(/<p><br\s*\/?><\/p>/gi, "")
    // <p>&nbsp;</p> ou espaces vides
    .replace(/<p>(&nbsp;|\s)*<\/p>/gi, "")
    // Retours à la ligne
    .replace(/\n/g, "")
    .trim();
}
