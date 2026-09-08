import { X, Calendar, User } from "lucide-react";
import { Commentaire } from "@/types/commentaire";
import { resolveImageUrl } from "@/utils/image";
interface Props {
  commentaire: Commentaire;
  onClose: () => void;
}

export default function CommentaireViewModal({
  commentaire,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in max-h-[85vh] flex flex-col">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-[#00A4E0] to-[#0080b3] p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">
              Détail du commentaire
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="text-white" size={18} />
            </button>
          </div>
          <p className="text-white/80 text-xs mt-1">
            Aperçu complet du témoignage client
          </p>
        </div>

        {/* CONTENT */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* AUTHOR */}
          <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-[#cfe3ff] to-white rounded-xl border border-[#00A4E0]/20">
            <div className="relative shrink-0">
              <img
                src={resolveImageUrl(commentaire.authorImageUrl)}
                alt={commentaire.authorName}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "/placeholder.png";
                }}
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-[#00A4E0] to-[#0080b3] rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                <User size={9} className="text-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-gray-900 mb-0.5 truncate">
                {commentaire.authorName}
              </h3>
              <div className="flex items-center gap-1.5 text-[#A6A6A6]">
                <Calendar size={12} />
                <span className="text-xs font-medium">
                  {commentaire.displayDate}
                </span>
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 bg-gradient-to-b from-[#00A4E0] to-[#0080b3] rounded-full" />
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                Témoignage
              </h4>
            </div>

            <div className="bg-white border border-[#cfe3ff] rounded-xl p-4 shadow-inner max-h-[30vh] overflow-y-auto">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">
                {commentaire.content}
              </p>
            </div>
          </div>

          {/* METADATA */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-white p-3 rounded-lg border border-blue-200">
              <p className="text-[10px] font-semibold text-[#A6A6A6] uppercase tracking-wide mb-0.5">
                Ordre d'affichage
              </p>
              <p className="text-lg font-bold text-[#00A4E0]">
                #{commentaire.displayOrder ?? "N/A"}
              </p>
            </div>

            <div
              className={`p-3 rounded-lg border ${
                commentaire.enabled
                  ? "bg-gradient-to-br from-green-50 to-white border-green-200"
                  : "bg-gradient-to-br from-gray-50 to-white border-gray-200"
              }`}
            >
              <p className="text-[10px] font-semibold text-[#A6A6A6] uppercase tracking-wide mb-0.5">
                Statut
              </p>
              <p
                className={`text-sm font-bold ${
                  commentaire.enabled
                    ? "text-green-600"
                    : "text-[#A6A6A6]"
                }`}
              >
                {commentaire.enabled ? "✓ Actif" : "✗ Inactif"}
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-gray-50 px-5 py-3 flex justify-end border-t">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#00A4E0] to-[#0080b3] text-white font-semibold text-sm shadow-md hover:shadow-lg transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}