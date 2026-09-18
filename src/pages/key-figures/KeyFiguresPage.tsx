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
    <div className="p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-lg flex-shrink-0">
            <Hash className="text-white" size={20} />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              Chiffres Clés
              <Sparkles size={16} className="text-[#00A4E0] animate-pulse hidden xs:block" />
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              {data.length} chiffre{data.length > 1 ? 's' : ''} clé{data.length > 1 ? 's' : ''} au total
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setSelected(null);
            setOpenForm(true);
          }}
          className="group relative px-5 sm:px-6 py-3 rounded-xl font-semibold text-white overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300
                     min-h-[48px] w-full sm:w-auto"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0077A8] to-[#00A4E0] opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative flex items-center justify-center gap-2">
            <Plus size={20} />
            Nouveau Chiffre
          </span>
        </button>
      </div>

      {/* Reorder Instructions */}
      {!loading && data.length > 0 && (
        <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 p-3 sm:p-4 bg-gradient-to-r from-[#cfe3ff]/20 to-white border-2 border-[#00A4E0]/20 rounded-xl">
          <Sparkles size={15} className="text-[#00A4E0] flex-shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-xs sm:text-sm text-gray-700">
            Utilisez les flèches <ArrowUp size={13} className="inline" /> <ArrowDown size={13} className="inline" /> pour réorganiser l'ordre d'affichage
          </p>
        </div>
      )}

      {/* Table (desktop) / cartes (mobile), avec boutons de réorganisation */}
      <KeyFigureTable
        data={data}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onMove={move}
      />

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
    </div>
  );
}