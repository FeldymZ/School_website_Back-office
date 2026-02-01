import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import {
  Plus,
  Sparkles,
  Image as ImageIcon,
  GripVertical,
  CheckCircle,
} from "lucide-react";

import { Partenaire } from "@/types/partenaire";
import { PartenaireService } from "@/services/partenaireService";
import { getUserFromToken } from "@/utils/auth";
import { UserRole } from "@/types/user";

import PartenaireCreateModal from "@/components/partenaires/PartenaireCreateModal";
import PartenaireEditModal from "@/components/partenaires/PartenaireEditModal";
import PartenaireViewModal from "@/components/partenaires/PartenaireViewModal";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import SortablePartenaireRow from "@/components/partenaires/SortablePartenaireRow";

/* ================= TOAST ================= */
function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-6 right-6 bg-gradient-to-r from-[#00A4E0] to-[#0077A8] text-white px-6 py-3 rounded-xl shadow-2xl z-50 animate-in slide-in-from-bottom-5 duration-300">
      <p className="font-medium flex items-center gap-2">
        <CheckCircle size={18} />
        {message}
      </p>
    </div>
  );
}

export default function PartenairesPage() {
  const [partenaires, setPartenaires] = useState<Partenaire[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [viewTarget, setViewTarget] = useState<Partenaire | null>(null);
  const [editTarget, setEditTarget] = useState<Partenaire | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Partenaire | null>(null);

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const user = getUserFromToken();
  const isSuperAdmin = user?.role === UserRole.SUPERADMIN;

  /* ================= FETCH ================= */
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const data = await PartenaireService.getAll();
        if (mounted) setPartenaires(data);
      } catch (error) {
        console.error("❌ Erreur chargement partenaires:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const reload = async () => {
    try {
      const data = await PartenaireService.getAll();
      setPartenaires(data);
    } catch (error) {
      console.error("❌ Erreur rechargement:", error);
    }
  };

  /* ================= HELPERS ================= */
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const toggleEnabled = async (p: Partenaire) => {
    if (!isSuperAdmin) return;

    try {
      await PartenaireService.update(p.id, { enabled: !p.enabled });
      showToast(p.enabled ? "Partenaire désactivé" : "Partenaire activé");
      reload();
    } catch (error) {
      console.error("❌ Erreur toggle:", error);
      showToast("Erreur lors de la modification");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !isSuperAdmin) return;

    try {
      setDeleteLoading(true);
      await PartenaireService.delete(deleteTarget.id);
      showToast("Partenaire supprimé avec succès");
      reload();
    } catch (error) {
      console.error("❌ Erreur suppression:", error);
      showToast("Erreur lors de la suppression");
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  /* ================= DRAG & DROP ================= */
  const onDragEnd = async (event: DragEndEvent) => {
  if (!isSuperAdmin) return;

  const { active, over } = event;
  if (!over || active.id === over.id) return;

  const oldIndex = partenaires.findIndex(p => p.id === active.id);
  const newIndex = partenaires.findIndex(p => p.id === over.id);
  if (oldIndex === -1 || newIndex === -1) return;

  const reordered = arrayMove(partenaires, oldIndex, newIndex);
  setPartenaires(reordered);

  try {
    await PartenaireService.reorder(
      reordered.map(p => p.id) // ✅ FIX ICI
    );
  } catch (error) {
    console.error("❌ Erreur réorganisation:", error);
    reload();
  }
};


  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-20 text-center">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-full blur-3xl opacity-10 animate-pulse" />
          <div className="relative z-10">
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon className="w-10 h-10 text-white animate-bounce" />
              </div>
            </div>
            <div className="inline-flex items-center gap-3 text-[#00A4E0]">
              <div className="w-6 h-6 border-3 border-[#00A4E0] border-t-transparent rounded-full animate-spin" />
              <span className="text-lg font-semibold">Chargement des partenaires...</span>
            </div>
            <p className="text-sm text-[#A6A6A6] mt-3">Veuillez patienter un instant</p>
          </div>
        </div>
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-lg">
            <ImageIcon className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Partenaires
              <Sparkles size={18} className="text-[#00A4E0] animate-pulse" />
            </h1>
            <p className="text-sm text-gray-500">
              {partenaires.length} partenaire{partenaires.length > 1 ? 's' : ''} au total
            </p>
          </div>
        </div>

        {isSuperAdmin && (
          <button
            onClick={() => setShowCreate(true)}
            className="group relative px-6 py-3 rounded-xl font-semibold text-white overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0077A8] to-[#00A4E0] opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative flex items-center gap-2">
              <Plus size={20} />
              Nouveau Partenaire
            </span>
          </button>
        )}
      </div>

      {/* Empty State */}
      {partenaires.length === 0 ? (
        <div className="relative overflow-hidden bg-gradient-to-br from-[#cfe3ff] via-white to-[#cfe3ff]/30 rounded-2xl p-20 text-center border-2 border-[#00A4E0]/20 shadow-xl">
          <div className="absolute top-10 right-10 w-40 h-40 bg-[#00A4E0]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-[#0077A8]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

          <div className="relative z-10">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-3xl blur-2xl opacity-30 animate-pulse" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-3xl flex items-center justify-center shadow-2xl">
                <ImageIcon className="w-12 h-12 text-white" />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-2">
              Aucun partenaire
              <Sparkles size={20} className="text-[#00A4E0] animate-pulse" />
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Commencez par ajouter votre premier partenaire
            </p>
          </div>
        </div>
      ) : (
        /* Table */
        <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#cfe3ff] to-transparent rounded-full blur-3xl opacity-40" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#00A4E0]/10 to-transparent rounded-full blur-3xl opacity-30" />

          <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext
              items={partenaires.map(p => p.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="relative z-10 overflow-x-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-gradient-to-r from-gray-50/90 via-[#cfe3ff]/10 to-gray-50/90 backdrop-blur-sm border-b-2 border-[#00A4E0]/20">
                    <tr>
                      {isSuperAdmin && (
                        <th className="px-4 py-5 w-12">
                          <div className="flex items-center justify-center">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#cfe3ff] to-transparent flex items-center justify-center">
                              <GripVertical size={16} className="text-[#00A4E0]" />
                            </div>
                          </div>
                        </th>
                      )}
                      <th className="px-6 py-5 text-left">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                            <ImageIcon size={14} className="text-purple-600" />
                          </div>
                          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Logo
                          </span>
                        </div>
                      </th>
                      <th className="px-6 py-5 text-left">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-lg">
                            <Sparkles size={14} className="text-white" />
                          </div>
                          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Nom
                          </span>
                        </div>
                      </th>
                      <th className="px-6 py-5 text-center">
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Statut
                        </span>
                      </th>
                      <th className="px-6 py-5 text-right">
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Actions
                        </span>
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {partenaires.map((partenaire, index) => (
                      <SortablePartenaireRow
                        key={partenaire.id}
                        partenaire={partenaire}
                        isSuperAdmin={isSuperAdmin}
                        index={index}
                        onToggle={() => toggleEnabled(partenaire)}
                        onView={() => setViewTarget(partenaire)}
                        onEdit={() => setEditTarget(partenaire)}
                        onDelete={() => setDeleteTarget(partenaire)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </SortableContext>
          </DndContext>

          {/* Footer Info */}
          <div className="relative z-10 bg-gradient-to-r from-gray-50/80 to-[#cfe3ff]/20 border-t border-gray-200 px-8 py-4">
            <div className="flex items-center justify-between text-sm text-[#A6A6A6]">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-[#00A4E0]" />
                <span>
                  {isSuperAdmin
                    ? "Glissez les lignes pour réorganiser l'ordre d'affichage"
                    : "Gestion des partenaires"}
                </span>
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
      {showCreate && isSuperAdmin && (
        <PartenaireCreateModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            reload();
            showToast("Partenaire créé");
          }}
        />
      )}

      {viewTarget && (
        <PartenaireViewModal
          partenaire={viewTarget}
          onClose={() => setViewTarget(null)}
        />
      )}

      {editTarget && isSuperAdmin && (
        <PartenaireEditModal
          partenaire={editTarget}
          onClose={() => setEditTarget(null)}
          onUpdated={() => {
            reload();
            showToast("Partenaire modifié");
          }}
        />
      )}

      <ConfirmDeleteModal
        open={!!deleteTarget}
        title="Supprimer le partenaire"
        message={`Voulez-vous vraiment supprimer "${deleteTarget?.name}" ? Cette action est définitive.`}
        loading={deleteLoading}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      {toast && <Toast message={toast} />}

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




