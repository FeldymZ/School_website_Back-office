import { X, Sparkles } from "lucide-react";
import { Banner } from "@/types/banner";
import { resolveImageUrl } from "@/utils/image";
interface Props {
  banner: Banner;
  onClose: () => void;
}

const BannerPreviewModal = ({ banner, onClose }: Props) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-6xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-6">
          <div className="flex items-center gap-3 bg-black/50 backdrop-blur-md rounded-xl px-4 py-2">
            <Sparkles size={18} className="text-white animate-pulse" />
            <h2 className="text-white font-bold text-lg">{banner.title}</h2>
          </div>

          <button
            onClick={onClose}
            className="p-3 bg-black/50 hover:bg-black/70 backdrop-blur-md text-white rounded-xl transition-all hover:scale-110 active:scale-95 shadow-lg"
            title="Fermer"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="relative bg-black/20 backdrop-blur-sm rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl">
          {banner.mediaType === "IMAGE" ? (
            <img
              src={resolveImageUrl(banner.mediaUrl)}
              alt={banner.title}
              className="w-full max-h-[85vh] object-contain"
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
              className="w-full max-h-[85vh]"
              onError={() => {
                console.error("❌ Erreur chargement vidéo:", banner.mediaUrl);
              }}
            />
          )}
        </div>

        {/* Footer Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="bg-black/50 backdrop-blur-md rounded-xl px-4 py-3 text-white text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="font-medium">
                {banner.mediaType === "IMAGE" ? "Image" : "Vidéo"}
              </span>
            </div>
            <span className="text-white/70">
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
