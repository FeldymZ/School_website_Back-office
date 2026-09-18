import { Hash, Type, Sparkles, ArrowUp, ArrowDown, Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";
import type { KeyFigure } from "@/types/keyFigure";
import KeyFigureRow from "./KeyFigureRow";

interface Props {
  data: KeyFigure[];
  loading: boolean;
  onEdit: (k: KeyFigure) => void;
  onDelete: (k: KeyFigure) => void;
  onMove: (index: number, direction: "up" | "down") => void;
}

export default function KeyFigureTable({ data, loading, onEdit, onDelete, onMove }: Props) {
  if (loading) {
    return (
      <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 sm:p-20 text-center">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-full blur-3xl opacity-10 animate-pulse" />
        <div className="relative z-10">
          <div className="w-14 h-14 sm:w-20 sm:h-20 mx-auto mb-5 sm:mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Hash className="w-7 h-7 sm:w-10 sm:h-10 text-white animate-bounce" />
            </div>
          </div>
          <div className="inline-flex items-center gap-2.5 sm:gap-3 text-[#00A4E0]">
            <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 sm:border-3 border-[#00A4E0] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm sm:text-lg font-semibold">Chargement des chiffres clés...</span>
          </div>
          <p className="text-xs sm:text-sm text-[#A6A6A6] mt-2.5 sm:mt-3">Veuillez patienter un instant</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-[#cfe3ff] via-white to-[#cfe3ff]/30 rounded-2xl p-8 sm:p-20 text-center border-2 border-[#00A4E0]/20 shadow-xl">
        <div className="absolute top-10 right-10 w-40 h-40 bg-[#00A4E0]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-[#0077A8]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative z-10">
          <div className="relative inline-block mb-5 sm:mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-3xl blur-2xl opacity-30 animate-pulse" />
            <div className="relative w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-3xl flex items-center justify-center shadow-2xl">
              <Hash className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
            </div>
          </div>

          <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 flex items-center justify-center gap-2">
            Aucun chiffre clé
            <Sparkles size={18} className="text-[#00A4E0] animate-pulse" />
          </h3>
          <p className="text-gray-600 max-w-md mx-auto text-sm sm:text-base px-4">
            Commencez par ajouter votre premier chiffre clé
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#cfe3ff] to-transparent rounded-full blur-3xl opacity-40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#00A4E0]/10 to-transparent rounded-full blur-3xl opacity-30 pointer-events-none" />

      {/* ===== TABLEAU — DESKTOP (lg et plus) ===== */}
      <div className="hidden lg:block relative z-10 overflow-x-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-gradient-to-r from-gray-50/90 via-[#cfe3ff]/10 to-gray-50/90 backdrop-blur-sm border-b-2 border-[#00A4E0]/20">
            <tr>
              <th className="px-6 py-5 text-left">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                    <Hash size={14} className="text-blue-600" />
                  </div>
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Ordre
                  </span>
                </div>
              </th>
              <th className="px-6 py-5 text-left">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-lg">
                    <Type size={14} className="text-white" />
                  </div>
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Label
                  </span>
                </div>
              </th>
              <th className="px-6 py-5 text-left">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                    <Hash size={14} className="text-purple-600" />
                  </div>
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Valeur
                  </span>
                </div>
              </th>
              <th className="px-6 py-5 text-center">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Statut
                </span>
              </th>
              <th className="px-6 py-5 text-center">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Actions
                </span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {data.map((k, index) => (
              <KeyFigureRow
                key={k.id}
                item={k}
                index={index}
                isFirst={index === 0}
                isLast={index === data.length - 1}
                onEdit={onEdit}
                onDelete={onDelete}
                onMove={onMove}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== CARTES — MOBILE/TABLETTE (moins de lg) ===== */}
      <div className="lg:hidden relative z-10 divide-y divide-gray-100">
        {data.map((k, index) => {
          const isFirst = index === 0;
          const isLast = index === data.length - 1;

          return (
            <div
              key={k.id}
              className="p-3.5 sm:p-4"
              style={{ animation: `slideIn 0.4s ease-out ${Math.min(index, 8) * 0.05}s both` }}
            >
              <div className="flex items-start gap-3">
                {/* Flèches de réorganisation */}
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => onMove(index, "up")}
                    disabled={isFirst}
                    aria-label="Monter"
                    className="w-9 h-9 flex items-center justify-center rounded-lg border-2 border-gray-200 text-[#00A4E0]
                               active:bg-[#cfe3ff]/30 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    onClick={() => onMove(index, "down")}
                    disabled={isLast}
                    aria-label="Descendre"
                    className="w-9 h-9 flex items-center justify-center rounded-lg border-2 border-gray-200 text-[#00A4E0]
                               active:bg-[#cfe3ff]/30 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ArrowDown size={16} />
                  </button>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-sm sm:text-base truncate">{k.label}</p>
                      <span className="inline-flex items-center mt-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 text-purple-700 font-bold text-sm">
                        {k.value}
                      </span>
                    </div>
                    <span
                      className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-lg font-semibold text-[11px] ${
                        k.enabled
                          ? "bg-green-50 border border-green-200 text-green-700"
                          : "bg-gray-50 border border-gray-200 text-[#A6A6A6]"
                      }`}
                    >
                      {k.enabled ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {k.enabled ? "Actif" : "Inactif"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-3">
                <button
                  onClick={() => onEdit(k)}
                  aria-label="Modifier"
                  className="min-h-[40px] flex items-center justify-center gap-1.5 rounded-lg border-2 border-purple-200 bg-purple-50 text-purple-600 active:bg-purple-100 active:scale-95 transition-all"
                >
                  <Pencil size={15} />
                  <span className="text-xs font-medium">Modifier</span>
                </button>
                <button
                  onClick={() => onDelete(k)}
                  aria-label="Supprimer"
                  className="min-h-[40px] flex items-center justify-center gap-1.5 rounded-lg border-2 border-red-200 bg-red-50 text-red-600 active:bg-red-100 active:scale-95 transition-all"
                >
                  <Trash2 size={15} />
                  <span className="text-xs font-medium">Supprimer</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="relative z-10 bg-gradient-to-r from-gray-50/80 to-[#cfe3ff]/20 border-t border-gray-200 px-4 sm:px-8 py-2.5 sm:py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 sm:gap-2 text-xs sm:text-sm text-[#A6A6A6]">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Sparkles size={13} className="text-[#00A4E0] flex-shrink-0" />
            <span>{data.length} chiffre{data.length > 1 ? 's' : ''} clé{data.length > 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
            <span>Synchronisé</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}