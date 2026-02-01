import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Eye,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { Partenaire } from "@/types/partenaire";
import { resolveImageUrl } from "@/utils/image";

interface Props {
  partenaire: Partenaire;
  isSuperAdmin: boolean;
  index: number; // ✅ Ajout de l'index pour les animations
  onToggle: () => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function SortablePartenaireRow({
  partenaire,
  isSuperAdmin,
  index,
  onToggle,
  onView,
  onEdit,
  onDelete,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: partenaire.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`bg-white transition-all ${
        isDragging
          ? "shadow-2xl ring-2 ring-[#00A4E0] rounded-lg z-50"
          : "hover:bg-gray-50"
      }`}
    >
      {/* Drag Handle */}
      {isSuperAdmin && (
        <td
          {...attributes}
          {...listeners}
          className="px-4 py-5 cursor-grab active:cursor-grabbing"
        >
          <div className="flex items-center justify-center">
            <GripVertical
              size={18}
              className="text-[#A6A6A6] hover:text-[#00A4E0] transition-colors"
            />
          </div>
        </td>
      )}

      {/* Logo */}
      <td className="px-6 py-5">
        <div
          style={{
            animation: `slideIn 0.5s ease-out ${index * 0.1}s both`
          }}
        >
          <div className="relative group w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-200 hover:border-[#00A4E0] transition-all shadow-md hover:shadow-xl hover:scale-105 duration-300 bg-white flex items-center justify-center">
            <img
              src={resolveImageUrl(partenaire.logoUrl)}
              alt={partenaire.name}
              className="max-w-full max-h-full object-contain p-2"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const parent = e.currentTarget.parentElement;
                if (parent && !parent.querySelector('.fallback-icon')) {
                  const icon = document.createElement('div');
                  icon.className = 'fallback-icon text-gray-400';
                  icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
                  parent.appendChild(icon);
                }
              }}
            />
          </div>
        </div>
      </td>

      {/* Nom */}
      <td className="px-6 py-5">
        <div
          style={{
            animation: `slideIn 0.5s ease-out ${index * 0.1 + 0.1}s both`
          }}
        >
          <p className="font-bold text-gray-900 text-base hover:text-[#00A4E0] transition-colors">
            {partenaire.name}
          </p>
        </div>
      </td>

      {/* Statut */}
      <td className="px-6 py-5 text-center">
        <div
          style={{
            animation: `slideIn 0.5s ease-out ${index * 0.1 + 0.2}s both`
          }}
        >
          <button
            onClick={onToggle}
            disabled={!isSuperAdmin}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm shadow-sm transition-all ${
              isSuperAdmin ? "hover:scale-105 active:scale-95 cursor-pointer" : "cursor-not-allowed"
            } ${
              partenaire.enabled
                ? "bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 text-green-700 hover:shadow-lg"
                : "bg-gray-50 border-2 border-gray-200 text-[#A6A6A6] hover:shadow-md"
            }`}
          >
            {partenaire.enabled ? (
              <>
                <CheckCircle size={16} /> Actif
              </>
            ) : (
              <>
                <XCircle size={16} /> Inactif
              </>
            )}
          </button>
        </div>
      </td>

      {/* Actions */}
      <td className="px-6 py-5 text-right">
        <div
          className="inline-flex items-center gap-2"
          style={{
            animation: `slideIn 0.5s ease-out ${index * 0.1 + 0.3}s both`
          }}
        >
          <button
            type="button"
            onClick={onView}
            className="group relative p-2.5 rounded-xl border-2 border-[#cfe3ff] bg-[#cfe3ff]/30 text-[#00A4E0] hover:bg-[#cfe3ff]/60 hover:scale-110 active:scale-95 transition-all shadow-sm hover:shadow-lg"
            title="Voir"
          >
            <Eye size={16} />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Voir
            </span>
          </button>

          {isSuperAdmin && (
            <>
              <button
                type="button"
                onClick={onEdit}
                className="group relative p-2.5 rounded-xl border-2 border-purple-200 bg-purple-50 text-purple-600 hover:bg-purple-100 hover:scale-110 active:scale-95 transition-all shadow-sm hover:shadow-lg"
                title="Modifier"
              >
                <Pencil size={16} />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Modifier
                </span>
              </button>

              <button
                type="button"
                onClick={onDelete}
                className="group relative p-2.5 rounded-xl border-2 border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:scale-110 active:scale-95 transition-all shadow-sm hover:shadow-lg"
                title="Supprimer"
              >
                <Trash2 size={16} />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Supprimer
                </span>
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
