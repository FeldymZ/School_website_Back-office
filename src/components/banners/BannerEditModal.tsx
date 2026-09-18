import { useEffect, useRef, useState } from "react";
import { Banner, BannerUpdatePayload } from "@/types/banner";
import { BannerService } from "@/services/bannerService";
import { X, AlertCircle } from "lucide-react";

/* ================= PROPS ================= */

interface Props {
  banner: Banner;
  onClose: () => void;
  onUpdated: () => void;
}

const CLOSE_DRAG_THRESHOLD = 120;

/* ================= COMPONENT ================= */

const BannerEditModal = ({ banner, onClose, onUpdated }: Props) => {
  /* ================= STATE ================= */

  const [title, setTitle] = useState(banner.title);
  const [subtitle, setSubtitle] = useState(banner.subtitle ?? "");
  const [subtitleAlt, setSubtitleAlt] = useState(banner.subtitleAlt ?? "");

  const [displayOrder, setDisplayOrder] = useState(banner.displayOrder);
  const [enabled, setEnabled] = useState(banner.enabled);

  const [startAt, setStartAt] = useState<string>(
    banner.startAt ? banner.startAt.slice(0, 16) : ""
  );
  const [endAt, setEndAt] = useState<string>(
    banner.endAt ? banner.endAt.slice(0, 16) : ""
  );

  const [buttonLabel, setButtonLabel] = useState(
    banner.buttonLabel ?? ""
  );
  const [buttonUrl, setButtonUrl] = useState(
    banner.buttonUrl ?? ""
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const submit = async () => {
    setError(null);
    setLoading(true);

    const payload: BannerUpdatePayload = {
      title,
      subtitle: subtitle || null,
      subtitleAlt: subtitleAlt || null,
      displayOrder,
      enabled,
      startAt: startAt ? new Date(startAt).toISOString() : null,
      endAt: endAt ? new Date(endAt).toISOString() : null,
      buttonLabel: buttonUrl ? buttonLabel || "En savoir plus" : null,
      buttonUrl: buttonUrl || null,
    };

    try {
      await BannerService.update(banner.id, payload);
      onUpdated();
      onClose();
    } catch (e) {
      console.error(e);
      setError("Erreur lors de la mise à jour du banner");
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

  // Swipe-down-to-dismiss (mobile only, via the drag handle / header)
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

  /* ================= RENDER ================= */

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
        aria-labelledby="edit-banner-title"
        style={{
          transform: dragY ? `translateY(${dragY}px)` : undefined,
          transition: isDragging.current ? "none" : "transform 0.25s cubic-bezier(0.32,0.72,0,1)",
        }}
        className={`relative bg-white w-full sm:max-w-2xl
                   h-[92vh] sm:h-auto sm:max-h-[90vh]
                   overflow-y-auto overscroll-contain
                   rounded-t-2xl sm:rounded-xl
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
          className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 sm:py-4 border-b flex-shrink-0 touch-none sm:touch-auto"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <h2 id="edit-banner-title" className="text-base sm:text-lg font-bold truncate">
            Modifier le banner
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            aria-label="Fermer"
            className="p-2 -mr-1 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors flex-shrink-0
                       min-w-[40px] min-h-[40px] flex items-center justify-center
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENT (scrollable) */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4 sm:space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2 text-sm">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* TITLE */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold mb-1.5">
              Titre
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm sm:text-base
                         focus:outline-none focus:ring-2 focus:ring-[#00A4E0]/30 focus:border-[#00A4E0] transition-all"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          {/* SUBTITLES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold mb-1.5">
                Sous-titre
              </label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm sm:text-base
                           focus:outline-none focus:ring-2 focus:ring-[#00A4E0]/30 focus:border-[#00A4E0] transition-all"
                value={subtitle}
                onChange={e => setSubtitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold mb-1.5">
                Sous-titre alternatif
              </label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm sm:text-base
                           focus:outline-none focus:ring-2 focus:ring-[#00A4E0]/30 focus:border-[#00A4E0] transition-all"
                value={subtitleAlt}
                onChange={e => setSubtitleAlt(e.target.value)}
              />
            </div>
          </div>

          {/* ORDER + ENABLE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold mb-1.5">
                Ordre d'affichage
              </label>
              <input
                type="number"
                inputMode="numeric"
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm sm:text-base
                           focus:outline-none focus:ring-2 focus:ring-[#00A4E0]/30 focus:border-[#00A4E0] transition-all"
                value={displayOrder}
                onChange={e =>
                  setDisplayOrder(Number(e.target.value))
                }
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => setEnabled(!enabled)}
                className="w-full flex items-center justify-between gap-3 border border-gray-300 rounded-lg px-3.5 py-2.5
                           hover:bg-gray-50 active:bg-gray-100 transition-colors min-h-[44px]"
              >
                <span className="text-sm font-semibold text-gray-800">Banner actif</span>
                <span
                  role="switch"
                  aria-checked={enabled}
                  className="relative inline-flex items-center flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200"
                  style={{ background: enabled ? "#00A4E0" : "#D1D5DB" }}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 shadow transition-transform duration-200 ${
                      enabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </span>
              </button>
            </div>
          </div>

          {/* DATES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold mb-1.5">
                Début
              </label>
              <input
                type="datetime-local"
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm sm:text-base
                           focus:outline-none focus:ring-2 focus:ring-[#00A4E0]/30 focus:border-[#00A4E0] transition-all"
                value={startAt}
                onChange={e => setStartAt(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold mb-1.5">
                Fin
              </label>
              <input
                type="datetime-local"
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm sm:text-base
                           focus:outline-none focus:ring-2 focus:ring-[#00A4E0]/30 focus:border-[#00A4E0] transition-all"
                value={endAt}
                onChange={e => setEndAt(e.target.value)}
              />
            </div>
          </div>

          {/* BUTTON */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold mb-1.5">
                Texte du bouton
              </label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm sm:text-base
                           focus:outline-none focus:ring-2 focus:ring-[#00A4E0]/30 focus:border-[#00A4E0] transition-all"
                value={buttonLabel}
                onChange={e => setButtonLabel(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold mb-1.5">
                URL du bouton
              </label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm sm:text-base
                           focus:outline-none focus:ring-2 focus:ring-[#00A4E0]/30 focus:border-[#00A4E0] transition-all"
                value={buttonUrl}
                onChange={e => setButtonUrl(e.target.value)}
                placeholder="/formations ou https://..."
              />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div
          className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3
                     px-4 sm:px-6 py-4
                     border-t bg-white/95 backdrop-blur-sm
                     flex-shrink-0
                     pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:pb-4
                     sticky bottom-0"
        >
          <button
            onClick={handleClose}
            disabled={loading}
            className="min-h-[46px] px-4 py-2 border border-gray-300 rounded-lg font-medium text-sm sm:text-base
                       hover:bg-gray-50 active:scale-[0.98] transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annuler
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className="min-h-[46px] px-6 py-2 bg-[#00A4E0] text-white rounded-lg font-semibold text-sm sm:text-base
                       hover:bg-[#0090c5] active:scale-[0.98] transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
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
};

export default BannerEditModal;