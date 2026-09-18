import { useEffect } from "react";
import { X, Sparkles } from "lucide-react";
import { Banner } from "@/types/banner";
import { resolveImageUrl } from "@/utils/image";

interface Props {
  banner: Banner;
  onClose: () => void;
}

const BannerPreviewModal = ({ banner, onClose }: Props) => {
  // Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Lock body scroll while open
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-label={`Aperçu du banner ${banner.title}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-6xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between gap-2 p-3 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 bg-black/50 backdrop-blur-md rounded-xl px-3 sm:px-4 py-2 min-w-0">
            <Sparkles size={16} className="text-white animate-pulse flex-shrink-0 hidden sm:block" />
            <h2 className="text-white font-bold text-sm sm:text-lg truncate">{banner.title}</h2>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 sm:p-3 bg-black/50 hover:bg-black/70 active:bg-black/80 backdrop-blur-md text-white rounded-xl transition-all sm:hover:scale-110 active:scale-95 shadow-lg flex-shrink-0
                       min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Fermer"
            title="Fermer"
          >
            <X size={22} />
          </button>
        </div>

        {/* Content */}
        <div className="relative bg-black/20 backdrop-blur-sm rounded-xl sm:rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl">
          {banner.mediaType === "IMAGE" ? (
            <img
              src={resolveImageUrl(banner.mediaUrl)}
              alt={banner.title}
              className="w-full max-h-[75vh] sm:max-h-[85vh] object-contain"
              onError={(e) => {
                console.error("❌ Erreur chargement preview:", banner.mediaUrl);
                e.currentTarget.src = "/placeholder.png";
              }}
            />
          ) : (
            <video
              src={resolveImageUrl(banner.mediaUrl)}
              controls
              autoPlay
              playsInline
              className="w-full max-h-[75vh] sm:max-h-[85vh]"
              onError={() => {
                console.error("❌ Erreur chargement vidéo:", banner.mediaUrl);
              }}
            />
          )}
        </div>

        {/* Footer Info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-6">
          <div className="bg-black/50 backdrop-blur-md rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white text-xs sm:text-sm flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
              <span className="font-medium">
                {banner.mediaType === "IMAGE" ? "Image" : "Vidéo"}
              </span>
            </div>
            <span className="text-white/70 truncate">
              Statut: <span className="font-semibold">{banner.status}</span>
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes zoom-in-95 {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-in {
          animation-fill-mode: both;
        }

        .fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .zoom-in-95 {
          animation: zoom-in-95 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default BannerPreviewModal;