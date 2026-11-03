/* =========================================================
   Fenêtre du module devis — même design que vos fenêtres
   (CreateAdminModal, EditAdminModal, ChangePasswordModal…) :
   fond flouté, en-tête teinté avec icône lumineuse, poignée
   et "glisser vers le bas" sur mobile, Échap, focus piégé.
========================================================= */
import { useEffect, useRef, useState } from "react";
import type { ElementType, ReactNode } from "react";
import { X, Sparkles } from "lucide-react";

/* ---------- Classes reprises de vos formulaires ---------- */
export const inputClass =
  "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm sm:text-base " +
  "focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent " +
  "transition-all hover:border-gray-300 disabled:bg-gray-50";

export const labelClass = "flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700";

export const btnPrimary =
  "min-h-[48px] px-6 py-3 rounded-xl font-semibold text-white text-sm sm:text-base " +
  "bg-gradient-to-r from-[#00A4E0] to-[#0077A8] hover:shadow-lg sm:hover:scale-105 active:scale-[0.98] " +
  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 " +
  "transition-all duration-200 flex items-center justify-center gap-2";

export const btnCancel =
  "min-h-[48px] px-6 py-3 rounded-xl border-2 border-gray-200 font-medium text-gray-700 text-sm sm:text-base " +
  "hover:bg-gray-100 hover:border-gray-300 active:scale-[0.98] transition-all " +
  "disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";

export const ErrorBox = ({ message }: { message: string | null }) =>
  message ? (
    <div className="p-3.5 sm:p-4 bg-red-50 border-2 border-red-200 rounded-xl">
      <p className="text-xs sm:text-sm text-red-700 font-medium">{message}</p>
    </div>
  ) : null;

/* Petit bloc avec en-tête gris (comme les sections d'accès de UserTable) */
export const Bloc = ({ titre, icon: Icon, droite, children }: {
  titre: string; icon?: ElementType; droite?: ReactNode; children: ReactNode;
}) => (
  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
    <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-gray-100 bg-gray-50/60">
      <span className="flex items-center gap-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
        {Icon && <Icon size={13} className="text-[#00A4E0]" />} {titre}
      </span>
      {droite}
    </div>
    <div className="p-4">{children}</div>
  </div>
);

const CLOSE_DRAG_THRESHOLD = 120;

interface Props {
  titre: string;
  sousTitre?: ReactNode;
  icon: ElementType;
  busy?: boolean;              // true = fermeture bloquée (action en cours)
  onClose: () => void;
  largeur?: string;            // ex. "sm:max-w-4xl"
  zIndex?: string;             // ex. "z-[60]" pour une fenêtre par-dessus une autre
  enTete?: ReactNode;          // contenu affiché à droite du titre (badge…)
  children: (fermer: () => void) => ReactNode;
}

const DevisModal = ({ titre, sousTitre, icon: Icon, busy = false, onClose, largeur = "sm:max-w-lg", zIndex = "z-50", enTete, children }: Props) => {
  const [isClosing, setIsClosing] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStartY = useRef<number | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const fermer = () => {
    if (busy) return;
    setIsClosing(true);
    window.setTimeout(onClose, 200);
  };

  /* Vrai seulement pour la fenêtre du dessus (ex. "Valider" ouverte sur "Détail") */
  const estAuDessus = () => {
    const toutes = document.querySelectorAll("[data-devis-modal]");
    return toutes[toutes.length - 1] === sheetRef.current;
  };

  // Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || busy) return;
      const toutes = document.querySelectorAll("[data-devis-modal]");
      if (toutes[toutes.length - 1] !== sheetRef.current) return;
      setIsClosing(true);
      window.setTimeout(onClose, 200);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [busy, onClose]);

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
      const toutes = document.querySelectorAll("[data-devis-modal]");
      if (toutes[toutes.length - 1] !== sheetRef.current) return;
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
    if (busy || !estAuDessus()) return;
    dragStartY.current = e.touches[0].clientY;
    setDragging(true);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (dragStartY.current === null) return;
    const delta = e.touches[0].clientY - dragStartY.current;
    if (delta > 0) setDragY(delta);
  };
  const onTouchEnd = () => {
    setDragging(false);
    dragStartY.current = null;
    if (dragY > CLOSE_DRAG_THRESHOLD) fermer();
    else setDragY(0);
  };
  const touch = { onTouchStart, onTouchMove, onTouchEnd };

  return (
    <div
      className={`fixed inset-0 ${zIndex} flex items-end sm:items-center justify-center sm:p-4
                  transition-opacity duration-200 ${isClosing ? "opacity-0" : "opacity-100"}`}
      role="presentation"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={fermer} />

      <div
        ref={sheetRef}
        data-devis-modal
        role="dialog"
        aria-modal="true"
        style={{
          transform: dragY ? `translateY(${dragY}px)` : undefined,
          transition: dragging ? "none" : "transform 0.25s cubic-bezier(0.32,0.72,0,1)",
        }}
        className={`relative bg-white w-full ${largeur}
                   h-[92vh] sm:h-auto sm:max-h-[90vh]
                   rounded-t-2xl sm:rounded-2xl
                   shadow-2xl flex flex-col overflow-hidden
                   ${isClosing ? "dv-out-down sm:dv-out-fade" : "dv-in-up sm:dv-in-zoom"}`}
      >
        {/* Drag handle (mobile only) */}
        <div {...touch} className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0 cursor-grab active:cursor-grabbing touch-none">
          <div className="w-10 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div {...touch} className="relative overflow-hidden flex-shrink-0 touch-none sm:touch-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8] opacity-10" />
          <div className="relative flex items-center justify-between gap-3 px-4 sm:px-8 py-3.5 sm:py-6 border-b border-gray-100">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="relative group flex-shrink-0 hidden sm:block">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl flex items-center justify-center shadow-lg">
                  <Icon className="text-white" size={26} />
                </div>
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-2xl font-bold text-gray-900 flex items-center gap-1.5 sm:gap-2 truncate">
                  <span className="truncate">{titre}</span>
                  <Sparkles size={16} className="text-[#00A4E0] animate-pulse flex-shrink-0 hidden sm:block" />
                </h2>
                {sousTitre && <div className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 truncate">{sousTitre}</div>}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {enTete}
              <button
                ref={closeBtnRef}
                type="button"
                onClick={fermer}
                disabled={busy}
                aria-label="Fermer"
                className="p-2.5 -mr-1 hover:bg-gray-100 active:bg-gray-200 rounded-full transition-colors flex-shrink-0
                           min-w-[44px] min-h-[44px] flex items-center justify-center
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {children(fermer)}
      </div>

      <style>{`
        @keyframes dv-in-up { from { opacity: 0; transform: translateY(100%); } to { opacity: 1; transform: translateY(0); } }
        @keyframes dv-out-down { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(60px); } }
        @keyframes dv-in-zoom { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes dv-out-fade { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.97); } }
        .dv-in-up { animation: dv-in-up 0.28s cubic-bezier(0.32,0.72,0,1) both; }
        .dv-out-down { animation: dv-out-down 0.2s cubic-bezier(0.32,0.72,0,1) both; }
        @media (min-width: 640px) {
          .sm\\:dv-in-zoom { animation: dv-in-zoom 0.2s ease-out both; }
          .sm\\:dv-out-fade { animation: dv-out-fade 0.18s ease-in both; }
        }
      `}</style>
    </div>
  );
};

/* Corps défilant et pied de fenêtre */
export const ModalBody = ({ children }: { children: ReactNode }) => (
  <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-8 space-y-5 sm:space-y-6">{children}</div>
);

export const ModalFooter = ({ children }: { children: ReactNode }) => (
  <div className="flex-shrink-0 flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3 px-4 sm:px-8 py-4 border-t border-gray-100 bg-white
                  pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:pb-4">
    {children}
  </div>
);

export default DevisModal;