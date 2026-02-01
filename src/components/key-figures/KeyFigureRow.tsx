import { CheckCircle, XCircle, Pencil, Trash2 } from "lucide-react";
import type { KeyFigure } from "@/types/keyFigure";

interface Props {
  item: KeyFigure;
  index: number;
  onEdit: (k: KeyFigure) => void;
  onDelete: (k: KeyFigure) => void;
}

export default function KeyFigureRow({ item, index, onEdit, onDelete }: Props) {
  return (
    <tr className="bg-white transition-all hover:bg-gray-50">
      {/* Ordre */}
      <td className="px-6 py-5">
        <div
          style={{
            animation: `slideIn 0.5s ease-out ${index * 0.1}s both`
          }}
        >
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#cfe3ff] to-white border-2 border-[#00A4E0]/20 font-bold text-[#00A4E0] shadow-sm">
            {item.displayOrder}
          </span>
        </div>
      </td>

      {/* Label */}
      <td className="px-6 py-5">
        <div
          style={{
            animation: `slideIn 0.5s ease-out ${index * 0.1 + 0.1}s both`
          }}
        >
          <p className="font-bold text-gray-900 text-base">{item.label}</p>
        </div>
      </td>

      {/* Valeur */}
      <td className="px-6 py-5">
        <div
          style={{
            animation: `slideIn 0.5s ease-out ${index * 0.1 + 0.2}s both`
          }}
        >
          <span className="inline-flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 text-purple-700 font-bold text-lg shadow-sm">
            {item.value}
          </span>
        </div>
      </td>

      {/* Statut */}
      <td className="px-6 py-5 text-center">
        <div
          style={{
            animation: `slideIn 0.5s ease-out ${index * 0.1 + 0.3}s both`
          }}
        >
          <span
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm shadow-sm ${
              item.enabled
                ? "bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 text-green-700"
                : "bg-gray-50 border-2 border-gray-200 text-[#A6A6A6]"
            }`}
          >
            {item.enabled ? (
              <>
                <CheckCircle size={16} /> Actif
              </>
            ) : (
              <>
                <XCircle size={16} /> Inactif
              </>
            )}
          </span>
        </div>
      </td>

      {/* Actions */}
      <td className="px-6 py-5 text-center">
        <div
          className="inline-flex items-center gap-2"
          style={{
            animation: `slideIn 0.5s ease-out ${index * 0.1 + 0.4}s both`
          }}
        >
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="group relative p-2.5 rounded-xl border-2 border-purple-200 bg-purple-50 text-purple-600 hover:bg-purple-100 hover:scale-110 active:scale-95 transition-all shadow-sm hover:shadow-lg"
          >
            <Pencil size={16} />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Modifier
            </span>
          </button>

          <button
            type="button"
            onClick={() => onDelete(item)}
            className="group relative p-2.5 rounded-xl border-2 border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:scale-110 active:scale-95 transition-all shadow-sm hover:shadow-lg"
          >
            <Trash2 size={16} />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Supprimer
            </span>
          </button>
        </div>
      </td>
    </tr>
  );
}
