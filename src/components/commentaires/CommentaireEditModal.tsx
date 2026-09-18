import { useEffect, useRef, useState } from "react";
import { X, Save } from "lucide-react";
import toast from "react-hot-toast";

import { Commentaire } from "@/types/commentaire";
import { CommentaireService } from "@/services/commentaireService";

interface Props {
  commentaire: Commentaire;
  onClose: () => void;
  onUpdated: () => void;
}

const CLOSE_DRAG_THRESHOLD = 120;

export default function CommentaireEditModal({
  commentaire,
  onClose,
  onUpdated,
}: Props) {
  /* ================= FORM STATE ================= */
  const [authorName, setAuthorName] = useState(commentaire.authorName);
  const [content, setContent] = useState(commentaire.content);
  const [displayDate, setDisplayDate] = useState(commentaire.displayDate);

  const [displayOrder, setDisplayOrder] = useState<number | undefined>(undefined);
  const [enabled, setEnabled] = useState<boolean | undefined>(undefined);

  const [loading, setLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const sheetRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const dragStartY = useRef<number | null>(null);
  const [dragY, setDragY] = useState(0);
  const isDragging = useRef(false);

  const handleClose = () => {
    if (loading) return;
    setIsClosing(true);
    window.setTimeout(onClose, 200);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    try {
      setLoading(true);

      await CommentaireService.update(commentaire.id, {
        authorName,
        content,
        displayDate,
        displayOrder,
        enabled,
      });

      toast.success("Commentaire modifié");
      onUpdated();
      onClose();
    } catch {
      toast.error("Erreur lors de la modification du commentaire");
    } finally {
      setLoading(false);
    }
  };

  // Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // Lock body scroll while open
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // Focus trap
  useEffect(() => {
    closeBtnRef.current?.focus();
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !sheetRef.current) return;
      const focusables = sheetRef.current.querySelectorAll<HTMLElement>(
        'button, a[href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleTab);
    return () => window.removeEventListener("keydown", handleTab);
  }, []);

  // Swipe-down-to-dismiss
  const onTouchStart = (e: React.TouchEvent) => {
    if (loading) return;
    dragStartY.current = e.touches[0].clientY;
    isDragging.current = true;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || dragStartY.current === null) return;
    const delta = e.touches[0].clientY - dragStartY.current;
    if (delta > 0) setDragY(delta);
  };
  const onTouchEnd = () => {
    isDragging.current = false;
    dragStartY.current = null;
    if (dragY > CLOSE_DRAG_THRESHOLD) {
      handleClose();
    } else {
      setDragY(0);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4
                  transition-opacity duration-200 ${isClosing ? "opacity-0" : "opacity-100"}`}
      role="presentation"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-commentaire-title"
        style={{
          transform: dragY ? `translateY(${dragY}px)` : undefined,
          transition: isDragging.current ? "none" : "transform 0.25s cubic-bezier(0.32,0.72,0,1)",
        }}
        className={`relative bg-white w-full sm:max-w-2xl
                   h-[92vh] sm:h-auto sm:max-h-[90vh]
                   overflow-y-auto overscroll-contain
                   rounded-t-2xl sm:rounded-3xl
                   shadow-2xl flex flex-col
                   ${isClosing ? "animate-out-down sm:animate-out-fade" : "animate-in-up sm:animate-in-zoom"}`}
      >
        {/* Drag handle (mobile only) */}
        <div
          className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0 cursor-grab active:cursor-grabbing touch-none"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="w-10 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* HEADER */}
        <div
          className="bg-gradient-to-r from-[#00A4E0] to-[#0080b3] p-4 sm:p-6 flex-shrink-0 touch-none sm:touch-auto"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="flex justify-between items-center gap-3">
            <h2 id="edit-commentaire-title" className="text-base sm:text-2xl font-bold text-white truncate">
              Modifier le commentaire
            </h2>
            <button
              ref={closeBtnRef}
              onClick={handleClose}
              disabled={loading}
              aria-label="Fermer"
              className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0
                         min-w-[40px] min-h-[40px] flex items-center justify-center
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="text-white w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
          <p className="text-white/80 text-xs sm:text-sm mt-1.5 sm:mt-2 hidden sm:block">
            Éditez les informations du témoignage
          </p>
        </div>

        {/* FORM (scrollable) */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Nom de l'auteur */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
              Nom de l'auteur
            </label>
            <input
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base
                         focus:outline-none focus:border-[#00A4E0] focus:ring-4 focus:ring-[#cfe3ff] transition-all"
            />
          </div>

          {/* Contenu */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
              Contenu du témoignage
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="w-full border-2 border-gray-200 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base
                         focus:outline-none focus:border-[#00A4E0] focus:ring-4 focus:ring-[#cfe3ff] transition-all resize-none"
            />
            <p className="text-[11px] sm:text-xs text-[#A6A6A6] mt-1">
              {content.length} caractères
            </p>
          </div>

          {/* Date affichée */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
              Date affichée
            </label>
            <input
              value={displayDate}
              onChange={(e) => setDisplayDate(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base
                         focus:outline-none focus:border-[#00A4E0] focus:ring-4 focus:ring-[#cfe3ff] transition-all"
            />
          </div>

          {/* Ordre d'affichage */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
              Ordre d'affichage
              <span className="text-[#A6A6A6] font-normal ml-2">(optionnel)</span>
            </label>
            <input
              type="number"
              inputMode="numeric"
              placeholder="Laisser vide pour ne pas modifier"
              onChange={(e) =>
                setDisplayOrder(
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              className="w-full border-2 border-gray-200 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base
                         focus:outline-none focus:border-[#00A4E0] focus:ring-4 focus:ring-[#cfe3ff] transition-all"
            />
          </div>

          {/* Statut */}
          <button
            type="button"
            onClick={() => setEnabled(!(enabled ?? commentaire.enabled))}
            className="w-full text-left bg-gradient-to-br from-[#cfe3ff] to-white p-4 sm:p-5 rounded-2xl border-2 border-[#00A4E0]/20"
          >
            <div className="flex items-center gap-3">
              <span
                role="switch"
                aria-checked={enabled ?? commentaire.enabled}
                className="relative inline-flex items-center flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200"
                style={{
                  background: (enabled ?? commentaire.enabled) ? "#00A4E0" : "#D1D5DB",
                }}
              >
                <span
                  className={`absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 shadow-md transition-transform duration-200 ${
                    (enabled ?? commentaire.enabled) ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </span>
              <div className="min-w-0">
                <span className="font-semibold text-gray-900 text-sm sm:text-base">
                  Activer le commentaire
                </span>
                <p className="text-[11px] sm:text-xs text-[#A6A6A6]">
                  Modifier le statut de visibilité
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* FOOTER */}
        <div
          className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3
                     bg-gray-50 px-4 sm:px-6 py-4
                     border-t border-gray-200
                     flex-shrink-0
                     pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:pb-4
                     sticky bottom-0"
        >
          <button
            onClick={handleClose}
            disabled={loading}
            className="min-h-[48px] px-6 py-3 rounded-xl border-2 border-gray-300 font-semibold text-gray-700 text-sm sm:text-base
                       hover:bg-gray-100 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="min-h-[48px] flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#00A4E0] to-[#0080b3] text-white font-semibold text-sm sm:text-base
                       shadow-lg hover:shadow-xl sm:hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200
                       disabled:opacity-50 disabled:transform-none"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span>Enregistrer</span>
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes in-up {
          from { opacity: 0; transform: translateY(100%); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes out-down {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(60px); }
        }
        @keyframes in-zoom {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes out-fade {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0; transform: scale(0.97); }
        }
        .animate-in-up { animation: in-up 0.28s cubic-bezier(0.32,0.72,0,1) both; }
        .animate-out-down { animation: out-down 0.2s cubic-bezier(0.32,0.72,0,1) both; }
        .animate-in-zoom { animation: in-zoom 0.2s ease-out both; }
        .animate-out-fade { animation: out-fade 0.18s ease-in both; }
      `}</style>
    </div>
  );
}