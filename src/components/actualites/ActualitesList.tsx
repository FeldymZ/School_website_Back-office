import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import {
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Image,
  Clock,
  GripVertical,
  Calendar,
  Sparkles,
  Newspaper,
} from "lucide-react";

import { Actualite } from "@/types/actualite";
import { ActualiteService } from "@/services/actualiteService";
import { getUserFromToken } from "@/utils/auth";
import { UserRole } from "@/types/user";
import { resolveImageUrl } from "@/utils/image"; // 🎯 IMPORT ICI

import ActualiteEditModal from "./ActualiteEditModal";
import ActualiteImagesModal from "./ActualiteImagesModal";
import ActualiteCoverModal from "./ActualiteCoverModal";
import ActualiteHistoryModal from "./ActualiteHistoryModal";
import ActualiteSortableRow from "./ActualiteSortableRow";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";

/* ================= TYPES ================= */
interface State {
  data: Actualite[];
  loading: boolean;
}

const ActualitesList = () => {
  /* ================= STATE ================= */
  const [state, setState] = useState<State>({
    data: [],
    loading: true,
  });

  const [editId, setEditId] = useState<number | null>(null);
  const [galleryId, setGalleryId] = useState<number | null>(null);
  const [coverId, setCoverId] = useState<number | null>(null);
  const [historyItem, setHistoryItem] = useState<{
    id: number;
    title: string;
  } | null>(null);

  /* ===== DELETE MODAL ===== */
  const [deleteTarget, setDeleteTarget] = useState<Actualite | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  /* ================= LOAD ================= */
  const load = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const data = await ActualiteService.getAll();

      // 🔍 DEBUG : Vérifier les URLs
      console.log("📸 Actualités chargées:", data);
      data.forEach(a => {
        console.log(`- ${a.title}:`, a.coverImageUrl, "→", resolveImageUrl(a.coverImageUrl));
      });

      setState({ data, loading: false });
    } catch (error) {
      console.error("Erreur lors du chargement des actualités:", error);
      setState({ data: [], loading: false });
    }
  };

  /* ================= EFFECT ================= */
  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const data = await ActualiteService.getAll();
        if (!cancelled) {
          setState({
            data,
            loading: false,
          });
        }
      } catch (error) {
        console.error("Erreur lors du chargement des actualités:", error);
        if (!cancelled) {
          setState({ data: [], loading: false });
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ================= DRAG ================= */
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = state.data.findIndex(a => a.id === active.id);
    const newIndex = state.data.findIndex(a => a.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(state.data, oldIndex, newIndex);
    setState(prev => ({ ...prev, data: newOrder }));

    try {
      await ActualiteService.reorder(newOrder.map(a => a.id));
    } catch (error) {
      console.error("Erreur lors de la réorganisation:", error);
      load();
    }
  };

  /* ================= DELETE ================= */
  const requestDelete = (actualite: Actualite) => {
    const user = getUserFromToken();

    if (!user || user.role !== UserRole.SUPERADMIN) {
      alert("Vous n'avez pas les droits pour supprimer une actualité.");
      return;
    }

    setDeleteTarget(actualite);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleteLoading(true);
      await ActualiteService.delete(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDelete = () => {
    if (!deleteLoading) {
      setDeleteTarget(null);
    }
  };

  /* ================= RENDER ================= */

  if (state.loading) {
    return (
      <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-20 text-center">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-full blur-3xl opacity-10 animate-pulse" />
        <div className="relative z-10">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Newspaper className="w-10 h-10 text-white animate-bounce" />
            </div>
          </div>
          <div className="inline-flex items-center gap-3 text-[#00A4E0]">
            <div className="w-6 h-6 border-3 border-[#00A4E0] border-t-transparent rounded-full animate-spin" />
            <span className="text-lg font-semibold">Chargement des actualités...</span>
          </div>
          <p className="text-sm text-[#A6A6A6] mt-3">Veuillez patienter un instant</p>
        </div>
      </div>
    );
  }

  if (state.data.length === 0) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-[#cfe3ff] via-white to-[#cfe3ff]/30 rounded-2xl p-20 text-center border-2 border-[#00A4E0]/20 shadow-xl">
        <div className="absolute top-10 right-10 w-40 h-40 bg-[#00A4E0]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-[#0077A8]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative z-10">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-3xl blur-2xl opacity-30 animate-pulse" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-3xl flex items-center justify-center shadow-2xl">
              <Newspaper className="w-12 h-12 text-white" />
            </div>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-2">
            Aucune actualité
            <Sparkles size={20} className="text-[#00A4E0] animate-pulse" />
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Commencez par créer votre première actualité pour partager vos informations avec votre communauté
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30">
        {/* Decorative Backgrounds */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#cfe3ff] to-transparent rounded-full blur-3xl opacity-40" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#00A4E0]/10 to-transparent rounded-full blur-3xl opacity-30" />

        {/* Stats Bar */}
        <div className="relative z-10 bg-gradient-to-r from-[#cfe3ff]/40 via-white/50 to-[#cfe3ff]/40 border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gradient-to-r from-[#00A4E0] to-[#0077A8] rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-gray-700">
                  {state.data.length} actualité{state.data.length > 1 ? 's' : ''} au total
                </span>
              </div>
              <div className="h-4 w-px bg-gray-300" />
              <div className="flex items-center gap-2">
                <Eye size={14} className="text-green-500" />
                <span className="text-sm text-gray-600">
                  {state.data.filter(a => a.publishedAt).length} publiée{state.data.filter(a => a.publishedAt).length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <EyeOff size={14} className="text-[#A6A6A6]" />
                <span className="text-sm text-gray-600">
                  {state.data.filter(a => !a.publishedAt).length} brouillon{state.data.filter(a => !a.publishedAt).length > 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <div className="text-xs text-[#A6A6A6] flex items-center gap-1">
              <GripVertical size={14} />
              Glissez pour réorganiser
            </div>
          </div>
        </div>

        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={state.data.map(a => a.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="relative z-10 overflow-x-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-gradient-to-r from-gray-50/90 via-[#cfe3ff]/10 to-gray-50/90 backdrop-blur-sm border-b-2 border-[#00A4E0]/20">
                  <tr>
                    <th className="px-4 py-5 w-12">
                      <div className="flex items-center justify-center">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#cfe3ff] to-transparent flex items-center justify-center">
                          <GripVertical size={16} className="text-[#00A4E0]" />
                        </div>
                      </div>
                    </th>
                    <th className="px-6 py-5 text-left">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-lg">
                          <Sparkles size={14} className="text-white" />
                        </div>
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Actualité
                        </span>
                      </div>
                    </th>
                    <th className="px-6 py-5 text-left">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                          <Eye size={14} className="text-green-600" />
                        </div>
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Statut
                        </span>
                      </div>
                    </th>
                    <th className="px-6 py-5 text-right">
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Actions
                      </span>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {state.data.map((a, index) => (
                    <ActualiteSortableRow key={a.id} actualite={a}>
                      <td className="px-6 py-5">
                        <div
                          className="flex items-center gap-4"
                          style={{
                            animation: `slideIn 0.5s ease-out ${index * 0.1}s both`
                          }}
                        >
                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl opacity-0 group-hover:opacity-20 blur-sm transition-all duration-300" />
                            <div className="absolute -inset-1 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl opacity-0 group-hover:opacity-100 blur transition-all duration-300" />

                            {/* 🎯 UTILISATION DE resolveImageUrl */}
                            <img
                              src={resolveImageUrl(a.coverImageUrl)}
                              alt={a.title}
                              className="relative w-24 h-16 rounded-xl object-cover border-2 border-gray-200 group-hover:border-[#00A4E0] transition-all shadow-md group-hover:shadow-xl group-hover:scale-105 duration-300"
                              onError={(e) => {
                                console.error(`❌ Erreur chargement image pour "${a.title}":`, a.coverImageUrl);
                                e.currentTarget.src = "/placeholder.png";
                              }}
                              onLoad={() => {
                                console.log(`✅ Image chargée pour "${a.title}"`);
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 truncate hover:text-[#00A4E0] transition-colors cursor-pointer text-base">
                              {a.title}
                            </p>
                            {a.publishedAt && (
                              <div className="flex items-center gap-2 mt-1.5">
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-[#cfe3ff]/30 to-transparent rounded-full">
                                  <Calendar size={12} className="text-[#00A4E0]" />
                                  <span className="text-xs text-[#A6A6A6] font-medium">
                                    {new Date(a.publishedAt).toLocaleDateString("fr-FR", {
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric"
                                    })}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div
                          style={{
                            animation: `slideIn 0.5s ease-out ${index * 0.1 + 0.1}s both`
                          }}
                        >
                          {a.publishedAt ? (
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 text-green-700 font-semibold text-sm shadow-sm hover:shadow-md transition-all">
                              <Eye size={14} />
                              Publié
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 border-2 border-gray-200 text-[#A6A6A6] font-semibold text-sm shadow-sm">
                              <EyeOff size={14} />
                              Brouillon
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-5 text-right">
                        <div
                          className="inline-flex items-center gap-2"
                          style={{
                            animation: `slideIn 0.5s ease-out ${index * 0.1 + 0.2}s both`
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => setEditId(a.id)}
                            className="group relative p-2.5 rounded-xl border-2 border-[#cfe3ff] bg-[#cfe3ff]/30 text-[#00A4E0] hover:bg-[#cfe3ff]/60 hover:scale-110 active:scale-95 transition-all shadow-sm hover:shadow-lg"
                            title="Modifier l'actualité"
                          >
                            <Pencil size={16} />
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                              Modifier
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setCoverId(a.id)}
                            className="group relative p-2.5 rounded-xl border-2 border-purple-200 bg-purple-50 text-purple-600 hover:bg-purple-100 hover:scale-110 active:scale-95 transition-all shadow-sm hover:shadow-lg"
                            title="Changer l'image de couverture"
                          >
                            <Image size={16} />
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                              Couverture
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setGalleryId(a.id)}
                            className="group relative p-2.5 rounded-xl border-2 border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-110 active:scale-95 transition-all shadow-sm hover:shadow-lg"
                            title="Gérer la galerie d'images"
                          >
                            <Image size={16} />
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                              Galerie
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setHistoryItem({ id: a.id, title: a.title })
                            }
                            className="group relative p-2.5 rounded-xl border-2 border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100 hover:scale-110 active:scale-95 transition-all shadow-sm hover:shadow-lg"
                            title="Voir l'historique"
                          >
                            <Clock size={16} />
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                              Historique
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => requestDelete(a)}
                            className="group relative p-2.5 rounded-xl border-2 border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:scale-110 active:scale-95 transition-all shadow-sm hover:shadow-lg"
                            title="Supprimer définitivement"
                          >
                            <Trash2 size={16} />
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                              Supprimer
                            </span>
                          </button>
                        </div>
                      </td>
                    </ActualiteSortableRow>
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
              <span>Glissez les lignes pour réorganiser l'ordre d'affichage</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Synchronisé</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODALS ================= */}
      {editId && (
        <ActualiteEditModal
          id={editId}
          onClose={() => setEditId(null)}
          onUpdated={load}
        />
      )}

      {galleryId && (
        <ActualiteImagesModal
          id={galleryId}
          onClose={() => setGalleryId(null)}
        />
      )}

      {coverId && (
        <ActualiteCoverModal
          id={coverId}
          onClose={() => setCoverId(null)}
          onUpdated={load}
        />
      )}

      {historyItem && (
        <ActualiteHistoryModal
          id={historyItem.id}
          title={historyItem.title}
          onClose={() => setHistoryItem(null)}
        />
      )}

      <ConfirmDeleteModal
        open={!!deleteTarget}
        title="Supprimer l'actualité"
        message={`Voulez-vous vraiment supprimer l'actualité « ${deleteTarget?.title} » ? Cette action est définitive.`}
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
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
    </>
  );
};

export default ActualitesList;
