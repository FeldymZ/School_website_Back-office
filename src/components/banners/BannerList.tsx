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
  Pencil,
  Trash2,
  Eye,
  GripVertical,
  Image as ImageIcon,
  Video,
  Sparkles,
} from "lucide-react";

import { Banner } from "@/types/banner";
import { BannerService } from "@/services/bannerService";
import { resolveImageUrl } from "@/utils/image";
import BannerCreateModal from "./BannerCreateModal";
import BannerEditModal from "./BannerEditModal";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import BannerSortableRow from "./BannerSortableRow";
import BannerPreviewModal from "./BannerPreviewModal";

/* ================= STATE ================= */
interface State {
  data: Banner[];
  loading: boolean;
}

/* ================= COMPONENT ================= */
const BannerList = () => {
  const [state, setState] = useState<State>({
    data: [],
    loading: true,
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [editBanner, setEditBanner] = useState<Banner | null>(null);
  const [deleteBanner, setDeleteBanner] = useState<Banner | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [preview, setPreview] = useState<Banner | null>(null);

  /* ================= LOAD ================= */
  const load = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const data = await BannerService.getAll();
      setState({ data, loading: false });
    } catch (error) {
      console.error("❌ Erreur chargement banners:", error);
      setState({ data: [], loading: false });
    }
  };

  /* ================= USEEFFECT WITH CLEANUP ================= */
  useEffect(() => {
    let cancelled = false;

    const loadBanners = async () => {
      try {
        const data = await BannerService.getAll();
        if (!cancelled) {
          setState({ data, loading: false });
        }
      } catch (error) {
        console.error("❌ Erreur chargement banners:", error);
        if (!cancelled) {
          setState({ data: [], loading: false });
        }
      }
    };

    loadBanners();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ================= DRAG ================= */
  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = state.data.findIndex(b => b.id === active.id);
    const newIndex = state.data.findIndex(b => b.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(state.data, oldIndex, newIndex);
    setState(prev => ({ ...prev, data: reordered }));

    try {
      await BannerService.reorder(
        reordered.map((b, i) => ({
          id: b.id,
          displayOrder: i + 1,
        }))
      );
    } catch (error) {
      console.error("❌ Erreur réorganisation:", error);
      load();
    }
  };

  /* ================= DELETE ================= */
  const confirmDelete = async () => {
    if (!deleteBanner) return;

    try {
      setDeleteLoading(true);
      await BannerService.delete(deleteBanner.id);
      setDeleteBanner(null);
      load();
    } catch (error) {
      console.error("❌ Erreur suppression:", error);
      alert("Erreur lors de la suppression");
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDelete = () => {
    if (!deleteLoading) {
      setDeleteBanner(null);
    }
  };

  /* ================= LOADING STATE ================= */
  if (state.loading) {
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
              <span className="text-lg font-semibold">Chargement des banners...</span>
            </div>
            <p className="text-sm text-[#A6A6A6] mt-3">Veuillez patienter un instant</p>
          </div>
        </div>
      </div>
    );
  }

  /* ================= RENDER ================= */
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
              Banners
              <Sparkles size={18} className="text-[#00A4E0] animate-pulse" />
            </h1>
            <p className="text-sm text-gray-500">
              {state.data.length} banner{state.data.length > 1 ? 's' : ''} au total
            </p>
          </div>
        </div>

        <button
          onClick={() => setCreateOpen(true)}
          className="group relative px-6 py-3 rounded-xl font-semibold text-white overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0077A8] to-[#00A4E0] opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative flex items-center gap-2">
            <Plus size={20} />
            Nouveau Banner
          </span>
        </button>
      </div>

      {/* Empty State */}
      {state.data.length === 0 ? (
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
              Aucun banner
              <Sparkles size={20} className="text-[#00A4E0] animate-pulse" />
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Commencez par créer votre premier banner pour afficher des informations importantes
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
              items={state.data.map(b => b.id)}
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
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                            <ImageIcon size={14} className="text-purple-600" />
                          </div>
                          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Média
                          </span>
                        </div>
                      </th>
                      <th className="px-6 py-5 text-left">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-lg">
                            <Sparkles size={14} className="text-white" />
                          </div>
                          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Titre
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
                    {state.data.map((banner, index) => (
                      <BannerSortableRow key={banner.id} banner={banner}>
                        {/* Media */}
                        <td className="px-6 py-5">
                          <div
                            style={{
                              animation: `slideIn 0.5s ease-out ${index * 0.1}s both`
                            }}
                          >
                            <div
                              onClick={() => setPreview(banner)}
                              className="relative group w-28 h-16 rounded-xl overflow-hidden cursor-pointer border-2 border-gray-200 hover:border-[#00A4E0] transition-all shadow-md hover:shadow-xl hover:scale-105 duration-300"
                            >
                              <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl opacity-0 group-hover:opacity-20 blur-sm transition-all duration-300" />

                              {banner.mediaType === "IMAGE" ? (
                                <img
                                  src={resolveImageUrl(banner.mediaUrl)}
                                  alt={banner.title}
                                  className="relative w-full h-full object-cover"
                                  onError={(e) => {
                                    console.error("❌ Erreur chargement média:", banner.mediaUrl);
                                    e.currentTarget.src = "/placeholder.png";
                                  }}
                                />
                              ) : (
                                <div className="relative flex items-center justify-center h-full bg-gradient-to-br from-gray-900 to-gray-800">
                                  <Video className="text-white" size={24} />
                                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-red-500 rounded text-[10px] font-bold text-white">
                                    VIDEO
                                  </div>
                                </div>
                              )}

                              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        </td>

                        {/* Title */}
                        <td className="px-6 py-5">
                          <div
                            style={{
                              animation: `slideIn 0.5s ease-out ${index * 0.1 + 0.1}s both`
                            }}
                          >
                            <p className="font-bold text-gray-900 text-base hover:text-[#00A4E0] transition-colors cursor-pointer">
                              {banner.title}
                            </p>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-5 text-center">
                          <div
                            style={{
                              animation: `slideIn 0.5s ease-out ${index * 0.1 + 0.2}s both`
                            }}
                          >
                            <span
                              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm shadow-sm ${
                                banner.status === "ACTIVE"
                                  ? "bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 text-green-700"
                                  : banner.status === "PROGRAMMED"
                                  ? "bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 text-blue-700"
                                  : banner.status === "EXPIRED"
                                  ? "bg-gray-50 border-2 border-gray-200 text-[#A6A6A6]"
                                  : "bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 text-red-700"
                              }`}
                            >
                              {banner.status}
                            </span>
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
                              onClick={() => setPreview(banner)}
                              className="group relative p-2.5 rounded-xl border-2 border-[#cfe3ff] bg-[#cfe3ff]/30 text-[#00A4E0] hover:bg-[#cfe3ff]/60 hover:scale-110 active:scale-95 transition-all shadow-sm hover:shadow-lg"
                              title="Prévisualiser"
                            >
                              <Eye size={16} />
                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                Prévisualiser
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setEditBanner(banner)}
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
                              onClick={() => setDeleteBanner(banner)}
                              className="group relative p-2.5 rounded-xl border-2 border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:scale-110 active:scale-95 transition-all shadow-sm hover:shadow-lg"
                              title="Supprimer"
                            >
                              <Trash2 size={16} />
                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                Supprimer
                              </span>
                            </button>
                          </div>
                        </td>
                      </BannerSortableRow>
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
      )}

      {/* MODALS */}
      {createOpen && (
        <BannerCreateModal
          onClose={() => setCreateOpen(false)}
          onCreated={load}
        />
      )}

      {editBanner && (
        <BannerEditModal
          banner={editBanner}
          onClose={() => setEditBanner(null)}
          onUpdated={load}
        />
      )}

      <ConfirmDeleteModal
        open={!!deleteBanner}
        title="Supprimer le banner"
        message={`Voulez-vous vraiment supprimer le banner "${deleteBanner?.title}" ? Cette action est définitive.`}
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {preview && (
        <BannerPreviewModal
          banner={preview}
          onClose={() => setPreview(null)}
        />
      )}

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
};

export default BannerList;
