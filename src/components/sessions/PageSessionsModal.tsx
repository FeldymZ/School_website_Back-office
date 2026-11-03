import { useEffect, useMemo, useState } from "react";
import { Globe, Type, AlignLeft, Tag, ImagePlus, Upload, Trash2, Loader2, CheckCircle2, Sparkles, Search,  } from "lucide-react";

import { PageSessionsFormationService } from "@/services/sessionFormation.service";
import { fileUrl } from "@/utils/devis";
import type { PageSessionsFormation } from "@/types/sessionFormation";
import DevisModal, { ErrorBox, ModalBody, ModalFooter, btnCancel, btnPrimary, inputClass, labelClass } from "@/components/common/Devismodal";


/* =========================================================
   Formulaire (monté une fois la page chargée : l'état part des props)
========================================================= */
const Formulaire = ({ page, fermer, onSaved }: {
  page: PageSessionsFormation; fermer: () => void; onSaved: () => void;
}) => {
  const [badge, setBadge] = useState(page.badge ?? "");
  const [titre, setTitre] = useState(page.titre ?? "");
  const [sousTitre, setSousTitre] = useState(page.sousTitre ?? "");
  const [image, setImage] = useState<File | null>(null);
  const [supprimerImage, setSupprimerImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* Aperçu de la nouvelle image (URL temporaire libérée par l'effet) */
  const objectUrl = useMemo(() => (image ? URL.createObjectURL(image) : null), [image]);
  useEffect(() => () => { if (objectUrl) URL.revokeObjectURL(objectUrl); }, [objectUrl]);

  const apercu = objectUrl ?? (!supprimerImage && page.image ? fileUrl(page.image) : null);

  const choisirImage = (f?: File) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) return setError("Le fichier doit être une image (JPG, PNG ou WEBP).");
    if (f.size > 5 * 1024 * 1024) return setError("Image trop volumineuse (5 Mo maximum).");
    setError(null);
    setImage(f);
    setSupprimerImage(false);
  };

  const enregistrer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre.trim()) return setError("Le titre est obligatoire.");
    try {
      setSaving(true);
      setError(null);
      await PageSessionsFormationService.modifier({ badge, titre, sousTitre, image, supprimerImage });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const boutonImage =
    "cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 " +
    "hover:bg-gray-50 active:bg-gray-100 hover:border-gray-300 transition-all text-sm font-semibold text-gray-700 min-h-[40px]";

  return (
    <form onSubmit={enregistrer} className="flex-1 flex flex-col min-h-0">
      <ModalBody>
        {/* ===== Aperçu en direct ===== */}
        <div className="space-y-2">
          <span className={labelClass}><Sparkles size={14} className="text-[#00A4E0] flex-shrink-0" /> Aperçu</span>
          <div className="relative overflow-hidden rounded-xl bg-gray-900 text-white">
            {apercu && (
              <>
                <img src={apercu} alt="" className="absolute inset-0 w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/10" />
              </>
            )}
            <div className="relative px-5 py-6 sm:px-7 sm:py-8">
              {badge.trim() && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-[11px] font-semibold">
                  <Sparkles size={11} /> {badge}
                </span>
              )}
              <p className="mt-2 text-xl sm:text-3xl font-black leading-tight break-words">{titre || "Titre de la page"}</p>
              {sousTitre.trim() && <p className="mt-1.5 text-xs sm:text-sm text-white/90 max-w-md break-words">{sousTitre}</p>}
              <div className="mt-4 w-full max-w-[220px] h-8 rounded-lg bg-white/95 flex items-center gap-2 px-3 text-[11px] text-gray-400">
                <Search size={12} /> Rechercher une formation
              </div>
            </div>
          </div>
        </div>

        {/* ===== Image ===== */}
        <div className="space-y-2">
          <span className={labelClass}>
            <ImagePlus size={14} className="text-[#00A4E0] flex-shrink-0" /> Image d'arrière-plan
            <span className="text-gray-400 font-normal text-[11px] sm:text-xs">— optionnelle</span>
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <label className={boutonImage}>
              <Upload size={15} />
              {apercu ? "Changer l'image" : "Choisir une image"}
              <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
                onChange={(e) => { choisirImage(e.target.files?.[0]); e.target.value = ""; }} />
            </label>
            {apercu && (
              <button type="button"
                onClick={() => { setImage(null); setSupprimerImage(!!page.image); }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600">
                <Trash2 size={13} /> Retirer l'image
              </button>
            )}
          </div>
          <p className="text-[11px] sm:text-xs text-[#A6A6A6]">
            Conseil : une photo horizontale (1920 × 600 px environ), 5 Mo maximum. Un léger voile sombre est ajouté pour que le texte reste lisible.
          </p>
        </div>

        {/* ===== Textes ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={labelClass}>
              <Tag size={14} className="text-[#00A4E0] flex-shrink-0" /> Petit texte au-dessus
              <span className="text-gray-400 font-normal text-[11px] sm:text-xs">— optionnel</span>
            </label>
            <input value={badge} onChange={(e) => setBadge(e.target.value)} maxLength={80} placeholder="Formations continues" className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className={labelClass}><Type size={14} className="text-[#00A4E0] flex-shrink-0" /> Titre <span className="text-red-500">*</span></label>
            <input value={titre} onChange={(e) => setTitre(e.target.value)} maxLength={150} placeholder="Sessions de formation" className={inputClass} />
          </div>
        </div>

        <div className="space-y-2">
          <label className={labelClass}>
            <AlignLeft size={14} className="text-[#00A4E0] flex-shrink-0" /> Texte de présentation
            <span className="text-gray-400 font-normal text-[11px] sm:text-xs">— {sousTitre.length}/500</span>
          </label>
          <textarea value={sousTitre} onChange={(e) => setSousTitre(e.target.value)} rows={3} maxLength={500}
            placeholder="Découvrez les prochaines sessions programmées et inscrivez-vous directement en ligne."
            className={`${inputClass} resize-none`} />
        </div>

        {page.dateModification && (
          <p className="text-[11px] sm:text-xs text-gray-400">
            Dernière modification le {new Date(page.dateModification).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}
            {page.modifiePar && <> par {page.modifiePar}</>}
          </p>
        )}

        <ErrorBox message={error} />
      </ModalBody>

      <ModalFooter>
        <button type="button" onClick={fermer} disabled={saving} className={`${btnCancel} flex-1`}>Annuler</button>
        <button type="submit" disabled={saving} className={`${btnPrimary} flex-1`}>
          {saving ? <><Loader2 size={18} className="animate-spin" /> Enregistrement...</> : <><CheckCircle2 size={18} /> Publier</>}
        </button>
      </ModalFooter>
    </form>
  );
};

/* =========================================================
   Fenêtre « Page du site »
========================================================= */
const PageSessionsModal = ({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) => {
  const [page, setPage] = useState<PageSessionsFormation | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let actif = true;
    PageSessionsFormationService.lire()
      .then((p) => { if (actif) setPage(p); })
      .catch((err) => { if (actif) setError(err instanceof Error ? err.message : "Erreur de chargement"); });
    return () => { actif = false; };
  }, []);

  return (
    <DevisModal
      titre="Page « Sessions de formation »"
      sousTitre="Image et textes de l'en-tête sur le site public"
      icon={Globe}
      onClose={onClose}
      largeur="sm:max-w-3xl"
      
    >
      {(fermer) =>
        page ? (
          <Formulaire page={page} fermer={fermer} onSaved={onSaved} />
        ) : (
          <ModalBody>
            {error ? (
              <ErrorBox message={error} />
            ) : (
              <div className="py-10 text-center text-[#00A4E0] inline-flex w-full items-center justify-center gap-3">
                <Loader2 size={20} className="animate-spin" /> <span className="font-semibold">Chargement...</span>
              </div>
            )}
          </ModalBody>
        )
      }
    </DevisModal>
  );
};

export default PageSessionsModal;