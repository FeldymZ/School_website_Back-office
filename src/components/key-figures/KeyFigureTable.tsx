import { Hash, Type, Sparkles } from "lucide-react";
import type { KeyFigure } from "@/types/keyFigure";
import KeyFigureRow from "./KeyFigureRow";

interface Props {
  data: KeyFigure[];
  loading: boolean;
  onEdit: (k: KeyFigure) => void;
  onDelete: (k: KeyFigure) => void;
}

export default function KeyFigureTable({ data, loading, onEdit, onDelete }: Props) {
  if (loading) {
    return (
      <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-20 text-center">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-full blur-3xl opacity-10 animate-pulse" />
        <div className="relative z-10">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Hash className="w-10 h-10 text-white animate-bounce" />
            </div>
          </div>
          <div className="inline-flex items-center gap-3 text-[#00A4E0]">
            <div className="w-6 h-6 border-3 border-[#00A4E0] border-t-transparent rounded-full animate-spin" />
            <span className="text-lg font-semibold">Chargement des chiffres clés...</span>
          </div>
          <p className="text-sm text-[#A6A6A6] mt-3">Veuillez patienter un instant</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-[#cfe3ff] via-white to-[#cfe3ff]/30 rounded-2xl p-20 text-center border-2 border-[#00A4E0]/20 shadow-xl">
        <div className="absolute top-10 right-10 w-40 h-40 bg-[#00A4E0]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-[#0077A8]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative z-10">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-3xl blur-2xl opacity-30 animate-pulse" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-3xl flex items-center justify-center shadow-2xl">
              <Hash className="w-12 h-12 text-white" />
            </div>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-2">
            Aucun chiffre clé
            <Sparkles size={20} className="text-[#00A4E0] animate-pulse" />
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Commencez par ajouter votre premier chiffre clé
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#cfe3ff] to-transparent rounded-full blur-3xl opacity-40" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#00A4E0]/10 to-transparent rounded-full blur-3xl opacity-30" />

      <div className="relative z-10 overflow-x-auto">
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
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="relative z-10 bg-gradient-to-r from-gray-50/80 to-[#cfe3ff]/20 border-t border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between text-sm text-[#A6A6A6]">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-[#00A4E0]" />
            <span>{data.length} chiffre{data.length > 1 ? 's' : ''} clé{data.length > 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Synchronisé</span>
          </div>
        </div>
      </div>
    </div>
  );
}
