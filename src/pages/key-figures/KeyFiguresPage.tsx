import { useEffect, useState } from "react";
import { Plus, ArrowUp, ArrowDown, Sparkles, Hash } from "lucide-react";
import toast from "react-hot-toast";
import { KeyFigureService } from "@/services/keyFigureService";
import type { KeyFigure } from "@/types/keyFigure";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import KeyFigureFormModal from "@/components/key-figures/KeyFigureFormModal";
import KeyFigureTable from "@/components/key-figures/KeyFigureTable";
import { getUserFromToken } from "@/utils/auth";
import { UserRole } from "@/types/user";

export default function KeyFiguresPage() {
  const [data, setData] = useState<KeyFigure[]>([]);
  const [loading, setLoading] = useState(true);

  const [openForm, setOpenForm] = useState(false);
  const [selected, setSelected] = useState<KeyFigure | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<KeyFigure | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const user = getUserFromToken();
  const canDelete = user?.role === UserRole.SUPERADMIN;

  const load = async () => {
    setLoading(true);
    try {
      const res = await KeyFigureService.getAll();
      setData(res);
    } catch (error) {
      console.error("❌ Erreur chargement:", error);
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const move = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= data.length) return;

    const reordered = [...data];
    const current = reordered[index];
    const target = reordered[targetIndex];

    const temp = current.displayOrder;
    current.displayOrder = target.displayOrder;
    target.displayOrder = temp;

    reordered[index] = target;
    reordered[targetIndex] = current;

    setData(reordered);

    try {
      await KeyFigureService.reorder(
        reordered.map((k) => ({
          id: k.id,
          displayOrder: k.displayOrder,
        }))
      );
    } catch (error) {
      console.error("❌ Erreur réorganisation:", error);
      toast.error("Erreur de réorganisation");
      load();
    }
  };

  const handleEdit = (k: KeyFigure) => {
    setSelected(k);
    setOpenForm(true);
  };

  const handleDelete = (k: KeyFigure) => {
    setToDelete(k);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;

    setDeleteLoading(true);
    try {
      await KeyFigureService.delete(toDelete.id);
      toast.success("Chiffre clé supprimé");
      setDeleteOpen(false);
      setToDelete(null);
      load();
    } catch (error) {
      console.error("❌ Erreur suppression:", error);
      toast.error("Suppression impossible");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-lg">
            <Hash className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Chiffres Clés
              <Sparkles size={18} className="text-[#00A4E0] animate-pulse" />
            </h1>
            <p className="text-sm text-gray-500">
              {data.length} chiffre{data.length > 1 ? 's' : ''} clé{data.length > 1 ? 's' : ''} au total
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setSelected(null);
            setOpenForm(true);
          }}
          className="group relative px-6 py-3 rounded-xl font-semibold text-white overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0077A8] to-[#00A4E0] opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative flex items-center gap-2">
            <Plus size={20} />
            Nouveau Chiffre
          </span>
        </button>
      </div>

      {/* Reorder Instructions */}
      {!loading && data.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#cfe3ff]/20 to-white border-2 border-[#00A4E0]/20 rounded-xl">
          <Sparkles size={16} className="text-[#00A4E0]" />
          <p className="text-sm text-gray-700">
            Utilisez les flèches <ArrowUp size={14} className="inline" /> <ArrowDown size={14} className="inline" /> pour réorganiser l'ordre d'affichage
          </p>
        </div>
      )}

      {/* Table avec boutons de réorganisation */}
      {loading || data.length === 0 ? (
        <KeyFigureTable
          data={data}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#cfe3ff] to-transparent rounded-full blur-3xl opacity-40" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#00A4E0]/10 to-transparent rounded-full blur-3xl opacity-30" />

          <div className="relative z-10 overflow-x-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-gradient-to-r from-gray-50/90 via-[#cfe3ff]/10 to-gray-50/90 backdrop-blur-sm border-b-2 border-[#00A4E0]/20">
                <tr>
                  <th className="px-6 py-5 text-left">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Ordre
                    </span>
                  </th>
                  <th className="px-6 py-5 text-left">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Label
                    </span>
                  </th>
                  <th className="px-6 py-5 text-left">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Valeur
                    </span>
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
                  <tr key={k.id} className="bg-white transition-all hover:bg-gray-50">
                    {/* Ordre avec flèches */}
                    <td className="px-6 py-5">
                      <div
                        className="flex items-center gap-2"
                        style={{
                          animation: `slideIn 0.5s ease-out ${index * 0.1}s both`
                        }}
                      >
                        <button
                          onClick={() => move(index, "up")}
                          disabled={index === 0}
                          className="p-2 rounded-lg border-2 border-gray-200 hover:border-[#00A4E0] hover:bg-[#cfe3ff]/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          <ArrowUp size={16} className="text-[#00A4E0]" />
                        </button>
                        <button
                          onClick={() => move(index, "down")}
                          disabled={index === data.length - 1}
                          className="p-2 rounded-lg border-2 border-gray-200 hover:border-[#00A4E0] hover:bg-[#cfe3ff]/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          <ArrowDown size={16} className="text-[#00A4E0]" />
                        </button>
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#cfe3ff] to-white border-2 border-[#00A4E0]/20 font-bold text-[#00A4E0] shadow-sm">
                          {k.displayOrder}
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
                        <p className="font-bold text-gray-900 text-base">{k.label}</p>
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
                          {k.value}
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
                            k.enabled
                              ? "bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 text-green-700"
                              : "bg-gray-50 border-2 border-gray-200 text-[#A6A6A6]"
                          }`}
                        >
                          {k.enabled ? "Actif" : "Inactif"}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5 text-center">
                      <div
                        className="inline-flex gap-2"
                        style={{
                          animation: `slideIn 0.5s ease-out ${index * 0.1 + 0.4}s both`
                        }}
                      >
                        <button
                          onClick={() => handleEdit(k)}
                          className="px-4 py-2 rounded-xl border-2 border-purple-200 bg-purple-50 text-purple-600 hover:bg-purple-100 font-semibold transition-all hover:scale-105"
                        >
                          Éditer
                        </button>
                        <button
                          onClick={() => handleDelete(k)}
                          className="px-4 py-2 rounded-xl border-2 border-red-200 bg-red-50 text-red-600 hover:bg-red-100 font-semibold transition-all hover:scale-105"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="relative z-10 bg-gradient-to-r from-gray-50/80 to-[#cfe3ff]/20 border-t border-gray-200 px-8 py-4">
            <div className="flex items-center justify-between text-sm text-[#A6A6A6]">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-[#00A4E0]" />
                <span>Utilisez les flèches pour réorganiser</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Synchronisé</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      <KeyFigureFormModal
        open={openForm}
        initialData={selected}
        onClose={() => setOpenForm(false)}
        onSuccess={load}
      />

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Supprimer un chiffre clé"
        message={`Voulez-vous vraiment supprimer "${toDelete?.label}" ? Cette action est définitive.`}
        loading={deleteLoading}
        canConfirm={canDelete}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
      />

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
