// BannerMessagePreview.tsx
import { Info, Sparkles, Lightbulb } from "lucide-react";
import type { BannerMessage } from "@/types/bannerMessage";

export default function BannerMessagePreview({
  message,
}: {
  message: BannerMessage | null;
}) {
  if (!message) {
    return (
      <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-white p-8">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-200/30 to-transparent rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-gray-200/30 to-transparent rounded-full blur-2xl" />

        <div className="relative flex flex-col items-center justify-center space-y-3 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <Sparkles size={28} className="text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-600 mb-1">
              Aucun message actif
            </p>
            <p className="text-xs text-gray-500">
              Le message actif apparaîtra ici tel qu'il sera affiché aux visiteurs
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-r from-[#00A4E0] to-[#0077A8] animate-in fade-in zoom-in-95 duration-500">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

      {/* Content */}
      <div className="relative px-6 py-5 lg:px-8 lg:py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Icon */}
          <div className="relative group">
            <div className="absolute inset-0 bg-white rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
            <div className="relative w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/30">
              <Lightbulb size={24} className="text-white" />
            </div>
          </div>

          {/* Message content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Label */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white/80 uppercase tracking-wider">
                Did you know?
              </span>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
                <div className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse delay-75" />
                <div className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse delay-150" />
              </div>
            </div>

            {/* Title and content */}
            <div className="text-white">
              <span className="font-bold text-base lg:text-lg">
                {message.title || "Le saviez-vous ?"}
              </span>
              <span className="font-medium text-sm lg:text-base opacity-95">
                {" : "}
                {message.content}
              </span>
            </div>

            {/* Preview label */}
            <div className="flex items-center gap-2 pt-1">
              <div className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Info size={12} />
                  Aperçu public
                </span>
              </div>
            </div>
          </div>

          {/* Decorative element */}
          <div className="hidden lg:flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
            <Sparkles size={20} className="text-white animate-pulse" />
          </div>
        </div>
      </div>

      {/* Bottom shine effect */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

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

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .animate-in {
          animation-fill-mode: both;
        }

        .fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .zoom-in-95 {
          animation: zoom-in-95 0.5s ease-out;
        }

        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }

        .delay-75 {
          animation-delay: 75ms;
        }

        .delay-150 {
          animation-delay: 150ms;
        }
      `}</style>
    </div>
  );
}
