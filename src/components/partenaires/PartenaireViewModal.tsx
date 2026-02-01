import { X, ExternalLink } from "lucide-react";
import { Partenaire } from "@/types/partenaire";
import { resolveImageUrl } from "@/utils/image";

/* ================= PROPS ================= */

interface Props {
  partenaire: Partenaire;
  onClose: () => void;
}

/* ================= COMPONENT ================= */

export default function PartenaireViewModal({
  partenaire,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold">Détails du partenaire</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-5">
          <div className="flex justify-center">
            <img
              src={resolveImageUrl(partenaire.logoUrl)}
              alt={partenaire.name}
              className="h-24 object-contain border rounded-xl p-2 bg-gray-50"
            />
          </div>

          <div>
            <p className="text-sm text-gray-500">Nom</p>
            <p className="font-semibold text-gray-900">
              {partenaire.name}
            </p>
          </div>

          {partenaire.websiteUrl && (
            <div>
              <p className="text-sm text-gray-500">Site web</p>
              <a
                href={partenaire.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#00A4E0] font-semibold hover:underline"
              >
                {partenaire.websiteUrl}
                <ExternalLink size={14} />
              </a>
            </div>
          )}

          <div>
            <p className="text-sm text-gray-500">Statut</p>
            <span
              className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
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
        <div className="px-6 py-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
