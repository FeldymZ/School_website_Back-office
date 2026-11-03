import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  UserCheck, Plus, Pencil, Trash2, CheckCircle2, Loader2, AlertCircle, Stamp, PenLine,
  RefreshCw, ImageOff, Upload, ArrowLeft, Sparkles, User, Briefcase, Star, StarOff,
} from "lucide-react";

import { DevisEmetteurService, type EmetteurPayload } from "@/services/devisEmetteur.service";
import { fileUrl, initiales } from "@/utils/devis";
import type { DevisEmetteur } from "@/types/devis";
import ConfirmActionModal from "@/components/common/ConfirmActionModal";
import DevisModal, { ErrorBox, ModalBody, ModalFooter, btnCancel, btnPrimary, inputClass, labelClass } from "@/components/common/Devismodal";

/* =========================================================
   Aperçu d'image (fichier local ou URL serveur)
========================================================= */
const ImagePreview = ({ file, url, label }: { file?: File | null; url?: string | null; label: string }) => {
  /* Fichier local choisi → URL temporaire ; l'effet sert uniquement à la libérer */
  const objectUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  /* Valeur calculée pendant le rendu : pas de state, donc pas de setState dans un effet */
  const src = objectUrl ?? (url ? fileUrl(url) : null);

  return (
    <div className="h-24 rounded-xl bg-white border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden p-2">
      {src ? (
        <img src={src} alt={label} className="max-h-full max-w-full object-contain" />
      ) : (
        <span className="flex flex-col items-center gap-1 text-xs text-gray-300">
          <ImageOff size={18} /> Pas de {label.toLowerCase()}
        </span>
      )}
    </div>
  );
};

/* =========================================================
   Formulaire création / modification
========================================================= */
/**
 * Le parent affiche ce formulaire seulement quand il est ouvert,
 * avec une key différente par validateur : l'état est initialisé
 * directement depuis les props, sans useEffect.
 */
interface FormProps {
  emetteur: DevisEmetteur | null; // null = création
  onClose: () => void;
  onSaved: () => void;
}

const EmetteurFormModal = ({ emetteur, onClose, onSaved }: FormProps) => {
  const [nom, setNom] = useState(emetteur?.nom ?? "");
  const [fonction, setFonction] = useState(emetteur?.fonction ?? "");
  const [signature, setSignature] = useState<File | null>(null);
  const [cachet, setCachet] = useState<File | null>(null);
  const [supprimerCachet, setSupprimerCachet] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const creation = emetteur === null;

  const choisirImage = (f: File | undefined, setter: (f: File | null) => void) => {
    if (!f) return;
    if (!["image/png", "image/jpeg"].includes(f.type)) {
      setError("Seules les images PNG ou JPG sont acceptées.");
      return;
    }
    setError(null);
    setter(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !fonction.trim()) return setError("Le nom et la fonction sont obligatoires.");
    if (creation && !signature) return setError("La signature est obligatoire.");

    const payload: EmetteurPayload = { nom, fonction, signature, cachet, supprimerCachet };

    try {
      setSaving(true);
      setError(null);
      if (emetteur === null) await DevisEmetteurService.create(payload);
      else await DevisEmetteurService.update(emetteur.id, payload);
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
    <DevisModal
      titre={creation ? "Nouveau validateur" : "Modifier le validateur"}
      sousTitre="Nom, fonction, signature et cachet apposés sur les devis"
      icon={UserCheck}
      busy={saving}
      onClose={onClose}
      largeur="sm:max-w-2xl"
    >
      {(fermer) => (
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <ModalBody>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelClass}><User size={14} className="text-[#00A4E0] flex-shrink-0" /> Nom complet <span className="text-red-500">*</span></label>
                <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="MBA NZUE Kevin Michel" className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className={labelClass}><Briefcase size={14} className="text-[#00A4E0] flex-shrink-0" /> Fonction <span className="text-red-500">*</span></label>
                <input value={fonction} onChange={(e) => setFonction(e.target.value)} placeholder="Directeur des enseignements" className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Signature */}
              <div className="space-y-2">
                <label className={labelClass}>
                  <PenLine size={14} className="text-[#00A4E0] flex-shrink-0" /> Signature {creation && <span className="text-red-500">*</span>}
                </label>
                <ImagePreview file={signature} url={emetteur?.signatureUrl} label="Signature" />
                <label className={boutonImage}>
                  <Upload size={15} />
                  {signature ? "Changer l'image" : creation ? "Choisir une image" : "Remplacer la signature"}
                  <input type="file" accept="image/png,image/jpeg" className="hidden"
                    onChange={(e) => choisirImage(e.target.files?.[0], setSignature)} />
                </label>
              </div>

              {/* Cachet */}
              <div className="space-y-2">
                <label className={labelClass}>
                  <Stamp size={14} className="text-[#00A4E0] flex-shrink-0" /> Cachet
                  <span className="text-gray-400 font-normal text-[11px] sm:text-xs">— optionnel</span>
                </label>
                <ImagePreview file={cachet} url={supprimerCachet ? null : emetteur?.cachetUrl} label="Cachet" />
                <div className="flex flex-wrap items-center gap-3">
                  <label className={boutonImage}>
                    <Upload size={15} />
                    {cachet || emetteur?.cachetUrl ? "Remplacer le cachet" : "Ajouter un cachet"}
                    <input type="file" accept="image/png,image/jpeg" className="hidden"
                      onChange={(e) => {
                        choisirImage(e.target.files?.[0], setCachet);
                        setSupprimerCachet(false);
                      }} />
                  </label>
                  {!creation && emetteur?.cachetUrl && !cachet && (
                    <label className="inline-flex items-center gap-1.5 text-xs text-red-500 font-medium cursor-pointer">
                      <input type="checkbox" checked={supprimerCachet} onChange={(e) => setSupprimerCachet(e.target.checked)} className="accent-red-500" />
                      Retirer le cachet
                    </label>
                  )}
                </div>
              </div>
            </div>

            <p className="text-[11px] sm:text-xs text-[#A6A6A6]">
              Conseil : utilisez des images PNG à fond transparent. Le cachet est apposé par-dessus la signature sur le devis.
            </p>

            <ErrorBox message={error} />
          </ModalBody>

          <ModalFooter>
            <button type="button" onClick={fermer} disabled={saving} className={`${btnCancel} flex-1`}>Annuler</button>
            <button type="submit" disabled={saving} className={`${btnPrimary} flex-1`}>
              {saving ? <><Loader2 size={18} className="animate-spin" /> Enregistrement...</> : <><CheckCircle2 size={18} /> Enregistrer</>}
            </button>
          </ModalFooter>
        </form>
      )}
    </DevisModal>
  );
};

/* Message de confirmation adapté au validateur à supprimer */
const messageSuppression = (e: DevisEmetteur | null) => {
  if (!e) return "";
  const parties = [`Supprimer définitivement ${e.nom} ?`];
  if (e.actif) parties.push("C'est le validateur par défaut : il faudra choisir le validateur à chaque devis.");
  if (e.nbDevis > 0) {
    parties.push(`Les ${e.nbDevis} devis déjà validés gardent son nom, sa signature et son cachet.`);
  }
  return parties.join(" ");
};

/* =========================================================
   Page
========================================================= */
const EmetteursDevisPage = () => {
  const [emetteurs, setEmetteurs] = useState<DevisEmetteur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DevisEmetteur | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DevisEmetteur | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const charger = async () => {
    try {
      setLoading(true);
      setError(null);
      setEmetteurs(await DevisEmetteurService.list());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  /* Chargement initial : setState dans les callbacks de la promesse (autorisé) */
  useEffect(() => {
    let actif = true;
    DevisEmetteurService.list()
      .then((list) => {
        if (actif) setEmetteurs(list);
      })
      .catch((err) => {
        if (actif) setError(err instanceof Error ? err.message : "Erreur de chargement");
      })
      .finally(() => {
        if (actif) setLoading(false);
      });
    return () => {
      actif = false;
    };
  }, []);

  const ouvrirForm = (e: DevisEmetteur | null) => {
    setEditing(e);
    setFormOpen(true);
  };

  const definirParDefaut = async (e: DevisEmetteur) => {
    try {
      setBusyId(e.id);
      await DevisEmetteurService.activer(e.id);
      await charger();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Action impossible (réservée au SUPERADMIN)");
    } finally {
      setBusyId(null);
    }
  };

  /* 🆕 Retirer le statut « par défaut » */
  const retirerParDefaut = async (e: DevisEmetteur) => {
    try {
      setBusyId(e.id);
      await DevisEmetteurService.retirerParDefaut(e.id);
      await charger();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Action impossible (réservée au SUPERADMIN)");
    } finally {
      setBusyId(null);
    }
  };

  const supprimer = async () => {
    if (!deleteTarget) return;
    try {
      setBusyId(deleteTarget.id);
      await DevisEmetteurService.remove(deleteTarget.id);
      setDeleteTarget(null);
      await charger();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Suppression impossible");
    } finally {
      setBusyId(null);
    }
  };

  const parDefaut = emetteurs.find((e) => e.actif);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-cyan-50/30 p-3 sm:p-6 lg:p-8 space-y-5 sm:space-y-8">
      {/* Header avec effet de glassmorphism */}
      <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/50 p-4 sm:p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0]/5 via-[#0088CC]/5 to-[#0077A8]/5" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            <div className="relative group flex-shrink-0 hidden sm:block">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity animate-pulse" />
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                <UserCheck className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
            </div>

            <div className="min-w-0 flex items-center gap-3 sm:block">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-lg flex-shrink-0 sm:hidden">
                <UserCheck className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <Link to="/demandes-devis" className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-[#00A4E0] transition-colors">
                  <ArrowLeft size={13} /> Demandes de devis
                </Link>
                <h1 className="text-lg sm:text-4xl font-black text-gray-900 flex items-center gap-2 sm:gap-3">
                  <span className="truncate">Validateurs des devis</span>
                  <Sparkles className="w-4 h-4 sm:w-7 sm:h-7 text-[#00A4E0] animate-pulse flex-shrink-0 hidden sm:block" />
                </h1>
                <p className="mt-0.5 sm:mt-2 text-xs sm:text-base text-gray-600 font-medium">
                  Nom, fonction, signature et cachet apposés sur les devis
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto">
            <button type="button" onClick={charger} title="Rafraîchir" aria-label="Rafraîchir"
              className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl sm:rounded-2xl border-2 border-gray-200 bg-white text-gray-600 hover:border-[#00A4E0] hover:text-[#00A4E0] transition-all">
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
            <button type="button" onClick={() => ouvrirForm(null)}
              className="group relative flex-1 lg:flex-none px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-white text-sm sm:text-lg
                         bg-gradient-to-r from-[#00A4E0] via-[#0088CC] to-[#0077A8]
                         hover:from-[#0088CC] hover:via-[#0077A8] hover:to-[#006699]
                         shadow-2xl shadow-[#00A4E0]/40 hover:shadow-[#00A4E0]/60
                         sm:hover:scale-105 active:scale-95 transition-all duration-500 overflow-hidden
                         flex items-center justify-center gap-2.5 sm:gap-3 min-h-[48px]">
              <span className="hidden sm:block absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              <div className="relative w-5 h-5 sm:w-6 sm:h-6 bg-white/20 rounded-lg flex items-center justify-center sm:group-hover:scale-110 sm:group-hover:rotate-90 transition-all duration-300 flex-shrink-0">
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <span className="relative">Nouveau validateur</span>
            </button>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="relative mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100 flex flex-wrap gap-2 sm:gap-3">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-50 border-2 border-gray-200 rounded-xl">
            <div className="w-2 h-2 bg-[#00A4E0] rounded-full flex-shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-gray-600">{emetteurs.length} validateur{emetteurs.length > 1 ? "s" : ""}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-green-700 truncate">
              Par défaut : {parDefaut ? parDefaut.nom : "aucun"}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3.5 sm:p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-2">
          <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
          <p className="text-xs sm:text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}

      {loading && emetteurs.length === 0 ? (
        <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 sm:p-16 text-center">
          <div className="inline-flex items-center gap-2.5 sm:gap-3 text-[#00A4E0]">
            <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-[#00A4E0] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm sm:text-lg font-semibold">Chargement des validateurs...</span>
          </div>
        </div>
      ) : emetteurs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-10 sm:p-16 text-center shadow-xl">
          <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
            <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300" />
          </div>
          <h3 className="text-sm sm:text-base font-semibold text-gray-700 mb-1">Aucun validateur</h3>
          <p className="text-xs sm:text-sm text-gray-400 px-4">Créez un validateur pour pouvoir valider des devis.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {emetteurs.map((e) => (
            <div key={e.id}
              className={`relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border-2 transition-all ${
                e.actif ? "border-green-300" : "border-white/50"
              }`}>
              {/* En-tête de carte */}
              <div className="px-4 sm:px-5 py-3.5 bg-gradient-to-r from-gray-50 to-blue-50/30 border-b-2 border-gray-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {initiales(e.nom)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-gray-900 truncate">{e.nom}</p>
                  <p className="text-xs text-gray-500 truncate">{e.fonction}</p>
                </div>
                {e.actif && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-[11px] font-semibold whitespace-nowrap">
                    <Star size={11} className="fill-current" /> Par défaut
                  </span>
                )}
              </div>

              {/* Signature + cachet */}
              <div className="p-4 sm:p-5 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1"><PenLine size={12} className="text-[#00A4E0]" /> Signature</p>
                  <ImagePreview url={e.signatureUrl} label="Signature" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1"><Stamp size={12} className="text-[#00A4E0]" /> Cachet</p>
                  <ImagePreview url={e.cachetUrl} label="Cachet" />
                </div>
              </div>

              {/* Pied */}
              <div className="flex items-center justify-between gap-2 px-4 sm:px-5 py-2.5 border-t border-gray-100">
                <span className="text-xs text-gray-400">{e.nbDevis} devis validé{e.nbDevis > 1 ? "s" : ""}</span>
                <div className="flex items-center gap-1">
                  {e.actif ? (
                    /* 🆕 Retirer le statut « par défaut » */
                    <button type="button" onClick={() => retirerParDefaut(e)} disabled={busyId === e.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-700 hover:bg-amber-50 transition-colors disabled:opacity-50">
                      {busyId === e.id ? <Loader2 size={13} className="animate-spin" /> : <StarOff size={13} />}
                      Retirer par défaut
                    </button>
                  ) : (
                    <button type="button" onClick={() => definirParDefaut(e)} disabled={busyId === e.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-green-700 hover:bg-green-50 transition-colors disabled:opacity-50">
                      {busyId === e.id ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                      Mettre par défaut
                    </button>
                  )}
                  <button type="button" onClick={() => ouvrirForm(e)} title="Modifier" aria-label="Modifier"
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#00A4E0] hover:bg-[#00A4E0]/8 transition-colors">
                    <Pencil size={15} />
                  </button>
                  <button type="button" onClick={() => setDeleteTarget(e)} disabled={busyId === e.id} aria-label="Supprimer"
                    title="Supprimer"
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:pointer-events-none">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulaire monté seulement quand il est ouvert (key = remise à zéro à chaque ouverture) */}
      {formOpen && (
        <EmetteurFormModal
          key={editing?.id ?? "nouveau"}
          emetteur={editing}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false);
            charger();
          }}
        />
      )}

      <ConfirmActionModal
        open={deleteTarget !== null}
        loading={deleteTarget !== null && busyId === deleteTarget.id}
        title="Supprimer le validateur"
        message={messageSuppression(deleteTarget)}
        confirmLabel="Supprimer"
        confirmClass="bg-red-600 hover:bg-red-700 text-white"
        icon={<Trash2 size={28} className="text-red-600" />}
        iconBg="bg-red-100"
        onConfirm={supprimer}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default EmetteursDevisPage;