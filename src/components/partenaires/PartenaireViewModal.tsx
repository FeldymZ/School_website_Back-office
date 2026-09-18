import { useEffect } from "react";
import { X, ExternalLink } from "lucide-react";
import { Partenaire } from "@/types/partenaire";
import { resolveImageUrl } from "@/utils/image";

interface Props {
  partenaire: Partenaire;
  onClose: () => void;
}

export default function PartenaireViewModal({
  partenaire,
  onClose,
}: Props) {
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="view-partenaire-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden max-h-[85vh] flex flex-col">
        {/* Drag handle (mobile only, purely visual) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* HEADER */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b flex-shrink-0">
          <h2 id="view-partenaire-title" className="text-base sm:text-lg font-bold truncate">
            Détails du partenaire
          </h2>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors flex-shrink-0
                       min-w-[40px] min-h-[40px] flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4 sm:space-y-5">
          <div className="flex justify-center">
            <img
              src={resolveImageUrl(partenaire.logoUrl)}
              alt={partenaire.name}
              className="h-20 sm:h-24 object-contain border rounded-xl p-2 bg-gray-50"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.png";
              }}
            />
          </div>

          <div>
            <p className="text-xs sm:text-sm text-gray-500">Nom</p>
            <p className="font-semibold text-gray-900 text-sm sm:text-base">
              {partenaire.name}
            </p>
          </div>

          {partenaire.websiteUrl && (
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Site web</p>
              <a
                href={partenaire.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#00A4E0] font-semibold hover:underline text-sm sm:text-base break-all"
              >
                {partenaire.websiteUrl}
                <ExternalLink size={14} className="flex-shrink-0" />
              </a>
            </div>
          )}

          <div>
            <p className="text-xs sm:text-sm text-gray-500">Statut</p>
            <span
              className={`inline-flex px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                partenaire.enabled
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {partenaire.enabled ? "Actif" : "Inactif"}
            </span>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t flex justify-end flex-shrink-0 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:pb-4">
          <button
            onClick={onClose}
            className="w-full sm:w-auto min-h-[46px] px-4 py-2 border rounded-lg font-medium text-sm sm:text-base
                       hover:bg-gray-50 active:scale-[0.98] transition-all"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}