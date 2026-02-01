export const MAX_LOGO_SIZE = 1 * 1024 * 1024; // 1 MB

export function validateLogo(file: File): Promise<void> {
  if (!file.type.startsWith("image/")) {
    return Promise.reject("Le fichier doit être une image");
  }

  if (file.size > MAX_LOGO_SIZE) {
    return Promise.reject("Logo trop lourd (max 1 Mo)");
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const ratio = img.width / img.height;

      // Logo horizontal recommandé
      if (ratio < 1 || ratio > 4) {
        reject("Ratio invalide (entre 1:1 et 4:1 requis)");
      } else {
        resolve();
      }
    };

    img.onerror = () => reject("Image invalide");
  });
}
