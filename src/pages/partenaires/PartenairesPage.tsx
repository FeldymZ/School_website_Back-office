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
  XCircle,
  Eye,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

import { Partenaire } from "@/types/partenaire";
import { PartenaireService } from "@/services/partenaireService";
import { getUserFromToken } from "@/utils/auth";
import { UserRole } from "@/types/user";
import { resolveImageUrl } from "@/utils/image";

import PartenaireCreateModal from "@/components/partenaires/PartenaireCreateModal";
import PartenaireEditModal from "@/components/partenaires/PartenaireEditModal";
import PartenaireViewModal from "@/components/partenaires/PartenaireViewModal";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import SortablePartenaireRow from "@/components/partenaires/SortablePartenaireRow";

/* ================= TOAST ================= */
function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-auto
                     bg-gradient-to-r from-[#00A4E0] to-[#0077A8] text-white px-5 sm:px-6 py-3 rounded-xl shadow-2xl z-50
                     animate-in slide-in-from-bottom-5 duration-300">
      <p className="font-medium flex items-center gap-2 text-sm sm:text-base">
        <CheckCircle size={18} className="flex-shrink-0" />
        <span className="truncate">{message}</span>
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

  // Mobile reorder (up/down arrows — dnd-kit's drag doesn't behave well on touch here)
  const [reordering, setReordering] = useState<number | null>(null);

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

  /* ================= DRAG & DROP (desktop) ================= */
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
      await PartenaireService.reorder(reordered.map(p => p.id));
    } catch (error) {
      console.error("❌ Erreur réorganisation:", error);
      reload();
    }
  };

  /* ================= REORDER (mobile, boutons monter/descendre) ================= */
  const moveItem = async (index: number, direction: "up" | "down") => {
    if (!isSuperAdmin) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= partenaires.length) return;

    const reordered = arrayMove(partenaires, index, targetIndex);
    setPartenaires(reordered);
    setReordering(reordered[targetIndex].id);

    try {
      await PartenaireService.reorder(reordered.map(p => p.id));
    } catch (error) {
      console.error("❌ Erreur réorganisation:", error);
      showToast("Erreur lors de la réorganisation");
      reload();
    } finally {
      setReordering(null);
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="p-3 sm:p-6 lg:p-8">
        <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 sm:p-20 text-center">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-full blur-3xl opacity-10 animate-pulse" />
          <div className="relative z-10">
            <div className="w-14 h-14 sm:w-20 sm:h-20 mx-auto mb-5 sm:mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon className="w-7 h-7 sm:w-10 sm:h-10 text-white animate-bounce" />
              </div>
            </div>
            <div className="inline-flex items-center gap-2.5 sm:gap-3 text-[#00A4E0]">
              <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 sm:border-3 border-[#00A4E0] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm sm:text-lg font-semibold">Chargement des partenaires...</span>
            </div>
            <p className="text-xs sm:text-sm text-[#A6A6A6] mt-2.5 sm:mt-3">Veuillez patienter un instant</p>
          </div>
        </div>
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="p-3 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-lg flex-shrink-0">
            <ImageIcon className="text-white" size={20} />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              Partenaires
              <Sparkles size={16} className="text-[#00A4E0] animate-pulse hidden xs:block" />
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              {partenaires.length} partenaire{partenaires.length > 1 ? 's' : ''} au total
            </p>
          </div>
        </div>

        {isSuperAdmin && (
          <button
            onClick={() => setShowCreate(true)}
            className="group relative px-5 sm:px-6 py-3 rounded-xl font-semibold text-white overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300
                       min-h-[48px] w-full sm:w-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0077A8] to-[#00A4E0] opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative flex items-center justify-center gap-2">
              <Plus size={20} />
              Nouveau Partenaire
            </span>
          </button>
        )}
      </div>

      {/* Empty State */}
      {partenaires.length === 0 ? (
        <div className="relative overflow-hidden bg-gradient-to-br from-[#cfe3ff] via-white to-[#cfe3ff]/30 rounded-2xl p-8 sm:p-20 text-center border-2 border-[#00A4E0]/20 shadow-xl">
          <div className="absolute top-10 right-10 w-40 h-40 bg-[#00A4E0]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-[#0077A8]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

          <div className="relative z-10">
            <div className="relative inline-block mb-5 sm:mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-3xl blur-2xl opacity-30 animate-pulse" />
              <div className="relative w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-3xl flex items-center justify-center shadow-2xl">
                <ImageIcon className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
              </div>
            </div>

            <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 flex items-center justify-center gap-2">
              Aucun partenaire
              <Sparkles size={18} className="text-[#00A4E0] animate-pulse" />
            </h3>
            <p className="text-gray-600 mb-5 sm:mb-6 max-w-md mx-auto text-sm sm:text-base px-4">
              Commencez par ajouter votre premier partenaire
            </p>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#cfe3ff] to-transparent rounded-full blur-3xl opacity-40 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#00A4E0]/10 to-transparent rounded-full blur-3xl opacity-30 pointer-events-none" />

          {/* ===== TABLEAU + DRAG — DESKTOP (lg et plus) ===== */}
          <div className="hidden lg:block">
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
          </div>

          {/* ===== CARTES — MOBILE/TABLETTE (moins de lg) ===== */}
          <div className="lg:hidden relative z-10 divide-y divide-gray-100">
            {partenaires.map((partenaire, index) => {
              const isFirst = index === 0;
              const isLast = index === partenaires.length - 1;
              const isMoving = reordering === partenaire.id;

              return (
                <div
                  key={partenaire.id}
                  className={`p-3.5 sm:p-4 transition-opacity ${isMoving ? "opacity-50" : ""}`}
                  style={{ animation: `slideIn 0.4s ease-out ${Math.min(index, 8) * 0.05}s both` }}
                >
                  <div className="flex items-start gap-3">
                    {/* Flèches de réorganisation (superadmin uniquement) */}
                    {isSuperAdmin && (
                      <div className="flex flex-col gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => moveItem(index, "up")}
                          disabled={isFirst || reordering !== null}
                          aria-label="Monter"
                          className="w-9 h-9 flex items-center justify-center rounded-lg border-2 border-gray-200 text-[#00A4E0]
                                     active:bg-[#cfe3ff]/30 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          onClick={() => moveItem(index, "down")}
                          disabled={isLast || reordering !== null}
                          aria-label="Descendre"
                          className="w-9 h-9 flex items-center justify-center rounded-lg border-2 border-gray-200 text-[#00A4E0]
                                     active:bg-[#cfe3ff]/30 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          <ArrowDown size={16} />
                        </button>
                      </div>
                    )}

                    {/* Logo */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm bg-white flex items-center justify-center flex-shrink-0">
                      <img
                        src={resolveImageUrl(partenaire.logoUrl)}
                        alt={partenaire.name}
                        className="max-w-full max-h-full object-contain p-1.5"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.png";
                        }}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-gray-900 text-sm sm:text-base truncate">
                        {partenaire.name}
                      </p>
                      <button
                        onClick={() => toggleEnabled(partenaire)}
                        disabled={!isSuperAdmin}
                        className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-lg font-semibold text-[11px] transition-all active:scale-95 ${
                          isSuperAdmin ? "cursor-pointer" : "cursor-default"
                        } ${
                          partenaire.enabled
                            ? "bg-green-50 border border-green-200 text-green-700"
                            : "bg-gray-50 border border-gray-200 text-[#A6A6A6]"
                        }`}
                      >
                        {partenaire.enabled ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {partenaire.enabled ? "Actif" : "Inactif"}
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className={`grid gap-1.5 sm:gap-2 mt-3 ${isSuperAdmin ? "grid-cols-3" : "grid-cols-1"}`}>
                    <button
                      onClick={() => setViewTarget(partenaire)}
                      aria-label="Voir"
                      className="min-h-[40px] flex items-center justify-center gap-1.5 rounded-lg bg-[#cfe3ff]/30 text-[#00A4E0] border-2 border-[#cfe3ff] active:bg-[#cfe3ff]/60 active:scale-95 transition-all"
                    >
                      <Eye size={15} />
                      <span className="text-xs font-medium">Voir</span>
                    </button>

                    {isSuperAdmin && (
                      <>
                        <button
                          onClick={() => setEditTarget(partenaire)}
                          aria-label="Modifier"
                          className="min-h-[40px] flex items-center justify-center gap-1.5 rounded-lg bg-purple-50 text-purple-600 border-2 border-purple-200 active:bg-purple-100 active:scale-95 transition-all"
                        >
                          <Pencil size={15} />
                          <span className="text-xs font-medium">Modifier</span>
                        </button>
                        <button
                          onClick={() => setDeleteTarget(partenaire)}
                          aria-label="Supprimer"
                          className="min-h-[40px] flex items-center justify-center gap-1.5 rounded-lg bg-red-50 text-red-600 border-2 border-red-200 active:bg-red-100 active:scale-95 transition-all"
                        >
                          <Trash2 size={15} />
                          <span className="text-xs font-medium">Suppr.</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Info */}
          <div className="relative z-10 bg-gradient-to-r from-gray-50/80 to-[#cfe3ff]/20 border-t border-gray-200 px-4 sm:px-8 py-2.5 sm:py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 sm:gap-2 text-xs sm:text-sm text-[#A6A6A6]">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Sparkles size={13} className="text-[#00A4E0] flex-shrink-0" />
                <span className="hidden lg:inline">
                  {isSuperAdmin
                    ? "Glissez les lignes pour réorganiser l'ordre d'affichage"
                    : "Gestion des partenaires"}
                </span>
                <span className="lg:hidden">
                  {isSuperAdmin ? "Utilisez les flèches pour réorganiser" : "Gestion des partenaires"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
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