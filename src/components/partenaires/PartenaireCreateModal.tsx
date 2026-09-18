import { useEffect, useRef, useState } from "react";
import { X, Upload, Loader, Sparkles, Image as ImageIcon, Link2 } from "lucide-react";
import toast from "react-hot-toast";
import { PartenaireService } from "@/services/partenaireService";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

const CLOSE_DRAG_THRESHOLD = 120;
const MAX_LOGO_MB = 5;

export default function PartenaireCreateModal({ onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [enabled, setEnabled] = useState(true);
  const [logo, setLogo] = useState<File | null>(null);

  const [preview, setPreview] = useState<string | null>(null);
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

  const handleSubmit = async () => {
    if (!name || !logo) {
      toast.error("Le nom et le logo sont obligatoires");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("websiteUrl", websiteUrl);
    formData.append("displayOrder", String(displayOrder));
    formData.append("enabled", String(enabled));
    formData.append("logo", logo);

    try {
      setLoading(true);
      await PartenaireService.create(formData);
      toast.success("Partenaire créé avec succès");
      onCreated();
      onClose();
    } catch (error) {
      console.error("❌ Erreur création partenaire:", error);
      toast.error("Erreur lors de la création du partenaire");
    } finally {
      setLoading(false);
    }
  };

  const onFileChange = (file: File | null) => {
    if (file && file.size > MAX_LOGO_MB * 1024 * 1024) {
      toast.error(`Le logo dépasse ${MAX_LOGO_MB} Mo`);
      return;
    }
    if (file) {
      setLogo(file);
      setPreview(URL.createObjectURL(file));
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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-partenaire-title"
        style={{
          transform: dragY ? `translateY(${dragY}px)` : undefined,
          transition: isDragging.current ? "none" : "transform 0.25s cubic-bezier(0.32,0.72,0,1)",
        }}
        className={`relative bg-white w-full sm:max-w-2xl
                   h-[92vh] sm:h-auto sm:max-h-[90vh]
                   overflow-y-auto overscroll-contain
                   rounded-t-2xl sm:rounded-2xl
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

        {/* Header */}
        <div
          className="relative overflow-hidden flex-shrink-0 touch-none sm:touch-auto"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8] opacity-10" />
          <div className="relative flex items-center justify-between gap-3 px-4 sm:px-8 py-3.5 sm:py-6 border-b border-gray-100">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="relative group flex-shrink-0 hidden sm:block">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl flex items-center justify-center shadow-lg">
                  <ImageIcon className="text-white" size={26} />
                </div>
              </div>
              <div className="min-w-0">
                <h2
                  id="create-partenaire-title"
                  className="text-base sm:text-2xl font-bold text-gray-900 flex items-center gap-1.5 sm:gap-2 truncate"
                >
                  Nouveau Partenaire
                  <Sparkles size={16} className="text-[#00A4E0] animate-pulse flex-shrink-0 hidden sm:block" />
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 truncate">
                  Ajoutez un nouveau partenaire
                </p>
              </div>
            </div>

            <button
              ref={closeBtnRef}
              onClick={handleClose}
              disabled={loading}
              aria-label="Fermer"
              className="p-2.5 -mr-1 hover:bg-gray-100 active:bg-gray-200 rounded-full transition-colors flex-shrink-0
                         min-w-[44px] min-h-[44px] flex items-center justify-center
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content (scrollable) */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="p-4 sm:p-8 space-y-5 sm:space-y-6">
            {/* Nom */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700">
                <Sparkles size={14} className="text-[#00A4E0] flex-shrink-0" />
                Nom du partenaire
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Microsoft"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm sm:text-base
                           focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
                           transition-all hover:border-gray-300"
              />
            </div>

            {/* Site web */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700">
                <Link2 size={14} className="text-[#00A4E0] flex-shrink-0" />
                Site web
              </label>
              <input
                type="url"
                inputMode="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm sm:text-base
                           focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
                           transition-all hover:border-gray-300"
              />
            </div>

            {/* Ordre d'affichage */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700">
                <Sparkles size={14} className="text-[#00A4E0] flex-shrink-0" />
                Ordre d'affichage
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm sm:text-base
                           focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
                           transition-all hover:border-gray-300"
              />
            </div>

            {/* Logo */}
            <div className="space-y-2.5 sm:space-y-3">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700">
                <ImageIcon size={14} className="text-[#00A4E0] flex-shrink-0" />
                Logo du partenaire
                <span className="text-red-500">*</span>
              </label>

              {preview ? (
                <div className="relative group overflow-hidden rounded-xl border-2 border-[#00A4E0] shadow-lg">
                  <div className="flex items-center justify-center bg-gradient-to-br from-[#cfe3ff]/20 to-white p-6 sm:p-8">
                    <img
                      src={preview}
                      alt="Aperçu"
                      className="max-h-24 sm:max-h-32 object-contain"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setLogo(null);
                      setPreview(null);
                    }}
                    className="absolute top-2 sm:top-3 right-2 sm:right-3 p-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 active:scale-95 transition-all shadow-lg
                               min-w-[40px] min-h-[40px] flex items-center justify-center"
                    aria-label="Retirer le logo"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <label className="group relative block cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onFileChange(e.target.files?.[0] || null)}
                    className="sr-only"
                  />
                  <div className="relative overflow-hidden border-2 border-dashed border-[#00A4E0]/30 rounded-xl p-6 sm:p-12 text-center bg-gradient-to-br from-[#cfe3ff]/20 to-transparent hover:border-[#00A4E0] hover:bg-[#cfe3ff]/30 active:bg-[#cfe3ff]/40 transition-all">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg sm:group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      </div>
                      <p className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                        Appuyez pour sélectionner un logo
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                        Ou glissez-déposez votre fichier ici
                      </p>
                      <p className="text-[11px] sm:text-xs text-[#A6A6A6] mt-2">
                        PNG, JPG, SVG jusqu'à {MAX_LOGO_MB}MB
                      </p>
                    </div>
                  </div>
                </label>
              )}
            </div>

            {/* Statut */}
            <button
              type="button"
              onClick={() => setEnabled(!enabled)}
              className="w-full text-left relative overflow-hidden rounded-xl border-2 border-[#00A4E0]/20 bg-gradient-to-br from-[#cfe3ff]/20 to-white p-3.5 sm:p-4"
            >
              <div className="flex items-center gap-3">
                <span
                  role="switch"
                  aria-checked={enabled}
                  className="relative inline-flex items-center flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200"
                  style={{
                    background: enabled
                      ? "linear-gradient(to right, #00A4E0, #0077A8)"
                      : "#E5E7EB",
                  }}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 shadow-md transition-transform duration-200 ${
                      enabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </span>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-gray-900 flex items-center gap-2 text-sm sm:text-base">
                    <Sparkles size={13} className="text-[#00A4E0] flex-shrink-0" />
                    Activer le partenaire
                  </span>
                  <p className="text-[11px] sm:text-xs text-[#A6A6A6]">
                    Le partenaire sera visible sur le site
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3
                     px-4 sm:px-8 py-4 sm:py-6
                     border-t border-gray-100 bg-white/95 backdrop-blur-sm
                     flex-shrink-0
                     pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:pb-6
                     sticky bottom-0"
        >
          <button
            onClick={handleClose}
            disabled={loading}
            className="flex-1 min-h-[48px] px-6 py-3 rounded-xl border-2 border-gray-200 font-medium text-gray-700 text-sm sm:text-base
                       hover:bg-gray-100 hover:border-gray-300 active:scale-[0.98] transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annuler
          </button>

          <button
            onClick={handleSubmit}
            disabled={!name || !logo || loading}
            className="flex-1 min-h-[48px] px-6 py-3 rounded-xl font-medium text-white text-sm sm:text-base
                       bg-gradient-to-r from-[#00A4E0] to-[#0077A8]
                       hover:shadow-lg sm:hover:scale-105 active:scale-[0.98]
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                       transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Création en cours...
              </>
            ) : (
              <>
                <Upload size={18} />
                Créer le partenaire
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