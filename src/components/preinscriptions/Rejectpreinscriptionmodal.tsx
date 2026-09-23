import { useEffect, useState } from "react";
import { XCircle, AlertCircle } from "lucide-react";

/* Doit rester aligné avec RejetPreinscriptionRequest côté API */
export const MOTIF_MIN = 10;
export const MOTIF_MAX = 1000;

type Props = {
  open: boolean;
  loading: boolean;
  candidatLabel?: string;
  serverError?: string | null;
  onConfirm: (motif: string) => void;
  onCancel: () => void;
};

/**
 * Le formulaire n'est monté que lorsque la modale est ouverte :
 * son état (motif, touched) repart donc de zéro à chaque ouverture,
 * sans avoir besoin d'un useEffect qui appelle setState.
 */
const RejectPreinscriptionModal = (props: Props) => {
  if (!props.open) return null;
  return <RejectForm {...props} />;
};

const RejectForm = ({
  loading,
  candidatLabel,
  serverError,
  onConfirm,
  onCancel,
}: Props) => {
  const [motif, setMotif] = useState("");
  const [touched, setTouched] = useState(false);

  /* Fermeture avec Échap (abonnement à un événement externe : usage correct d'un effet) */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [loading, onCancel]);

  const trimmed = motif.trim();
  const tooShort = trimmed.length < MOTIF_MIN;
  const tooLong = trimmed.length > MOTIF_MAX;
  const invalid = tooShort || tooLong;

  const validationError = !touched
    ? null
    : trimmed.length === 0
      ? "Le motif du rejet est obligatoire."
      : tooShort
        ? `Le motif doit contenir au moins ${MOTIF_MIN} caractères.`
        : tooLong
          ? `Le motif ne peut pas dépasser ${MOTIF_MAX} caractères.`
          : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (invalid || loading) return;
    onConfirm(trimmed);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => !loading && onCancel()}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 space-y-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reject-title"
      >
        {/* En-tête */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <XCircle size={26} className="text-red-600" />
          </div>
          <div className="min-w-0">
            <h2 id="reject-title" className="text-lg font-bold text-gray-900">
              Rejeter la demande
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {candidatLabel
                ? <>Préinscription de <span className="font-semibold text-gray-700">{candidatLabel}</span>.</>
                : "Cette action est définitive."}
              {" "}Indiquez la raison du rejet.
            </p>
          </div>
        </div>

        {/* Motif */}
        <div className="space-y-1.5">
          <label htmlFor="motif-rejet" className="text-sm font-semibold text-gray-700">
            Motif du rejet <span className="text-red-500">*</span>
          </label>
          <textarea
            id="motif-rejet"
            autoFocus
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            onBlur={() => setTouched(true)}
            rows={5}
            maxLength={MOTIF_MAX + 50}
            disabled={loading}
            placeholder="Ex. : Le diplôme présenté ne correspond pas au niveau demandé."
            className={`w-full px-4 py-3 rounded-xl border text-sm resize-y bg-white
              focus:outline-none focus:ring-2 focus:border-transparent transition-all
              disabled:bg-gray-50 disabled:text-gray-500
              ${validationError
                ? "border-red-300 focus:ring-red-400"
                : "border-gray-200 focus:ring-[#00A4E0]"}`}
          />
          <div className="flex items-start justify-between gap-3 text-xs">
            <span className="text-red-600 min-h-[1rem]">{validationError}</span>
            <span className={`flex-shrink-0 tabular-nums ${tooLong ? "text-red-600 font-semibold" : "text-gray-400"}`}>
              {trimmed.length} / {MOTIF_MAX}
            </span>
          </div>
        </div>

        {/* Erreur renvoyée par l'API */}
        {serverError && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 bg-white
                       hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading || (touched && invalid)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                       bg-red-600 hover:bg-red-700 text-white transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && (
              <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            Rejeter
          </button>
        </div>
      </form>
    </div>
  );
};

export default RejectPreinscriptionModal;