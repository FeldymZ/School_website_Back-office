import { useEffect, useState } from "react";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  MessageSquare,
  Sparkles,
} from "lucide-react";

import { Commentaire } from "@/types/commentaire";
import { CommentaireService } from "@/services/commentaireService";
import { resolveImageUrl } from "@/utils/image";
import CommentaireCreateModal from "@/components/commentaires/CommentaireCreateModal";
import CommentaireEditModal from "@/components/commentaires/CommentaireEditModal";
import CommentaireViewModal from "@/components/commentaires/CommentaireViewModal";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";

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

export default function CommentairesPage() {
  const [items, setItems] = useState<Commentaire[]>([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState<Commentaire | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showView, setShowView] = useState(false);

  const [toast, setToast] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  /* ================= FETCH ================= */
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const data = await CommentaireService.getAll();
        if (mounted) setItems(data);
      } catch (error) {
        console.error("❌ Erreur chargement commentaires:", error);
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
      const data = await CommentaireService.getAll();
      setItems(data);
    } catch (error) {
      console.error("❌ Erreur rechargement:", error);
    }
  };

  /* ================= HELPERS ================= */
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const toggleEnabled = async (c: Commentaire) => {
    try {
      await CommentaireService.update(c.id, { enabled: !c.enabled });
      showToast(c.enabled ? "Commentaire désactivé" : "Commentaire activé");
      reload();
    } catch (error) {
      console.error("❌ Erreur toggle:", error);
      showToast("Erreur lors de la modification");
    }
  };

  const confirmDelete = (id: number) => {
    setDeleteId(id);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleteLoading(true);
      await CommentaireService.delete(deleteId);
      showToast("Commentaire supprimé avec succès");
      reload();
    } catch (error) {
      console.error("❌ Erreur suppression:", error);
      showToast("Erreur lors de la suppression");
    } finally {
      setDeleteLoading(false);
      setDeleteId(null);
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
                <MessageSquare className="w-7 h-7 sm:w-10 sm:h-10 text-white animate-bounce" />
              </div>
            </div>
            <div className="inline-flex items-center gap-2.5 sm:gap-3 text-[#00A4E0]">
              <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 sm:border-3 border-[#00A4E0] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm sm:text-lg font-semibold">Chargement des commentaires...</span>
            </div>
            <p className="text-xs sm:text-sm text-[#A6A6A6] mt-2.5 sm:mt-3">Veuillez patienter un instant</p>
          </div>
        </div>
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-cyan-50/30 p-3 sm:p-6 space-y-5 sm:space-y-8">
      {/* Header avec effet de glassmorphism */}
      <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/50 p-4 sm:p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0]/5 via-[#0088CC]/5 to-[#0077A8]/5" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDBBNEUwIiBzdHJva2Utb3BhY2l0eT0iMC4wMyIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            {/* Icône avec effet de glow */}
            <div className="relative group flex-shrink-0 hidden sm:block">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity animate-pulse" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                <MessageSquare className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Titre et description */}
            <div className="min-w-0">
              <h1 className="text-xl sm:text-4xl font-black text-gray-900 flex items-center gap-2 sm:gap-3">
                <span className="truncate">Commentaires</span>
                <Sparkles className="w-5 h-5 sm:w-7 sm:h-7 text-[#00A4E0] animate-pulse flex-shrink-0 hidden xs:block" />
              </h1>
              <p className="mt-1 sm:mt-2 text-xs sm:text-base text-gray-600 font-medium">
                {items.length} commentaire{items.length > 1 ? "s" : ""} au total — Gérez les témoignages clients
              </p>
            </div>
          </div>

          {/* Bouton de création avec effet premium */}
          <button
            onClick={() => setShowCreate(true)}
            className="group relative w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-white text-sm sm:text-lg
                       bg-gradient-to-r from-[#00A4E0] via-[#0088CC] to-[#0077A8]
                       hover:from-[#0088CC] hover:via-[#0077A8] hover:to-[#006699]
                       shadow-2xl shadow-[#00A4E0]/40 hover:shadow-[#00A4E0]/60
                       sm:hover:scale-105 active:scale-95
                       transition-all duration-500
                       overflow-hidden
                       flex items-center justify-center gap-2.5 sm:gap-3
                       min-h-[48px]"
          >
            {/* Effet shine animé */}
            <span className="hidden sm:block absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />

            {/* Icône avec animation */}
            <div className="relative w-5 h-5 sm:w-6 sm:h-6 bg-white/20 rounded-lg flex items-center justify-center sm:group-hover:scale-110 sm:group-hover:rotate-90 transition-all duration-300 flex-shrink-0">
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>

            <span className="relative">Nouveau Commentaire</span>
          </button>
        </div>
      </div>

      {/* Liste des commentaires */}
      <div className="animate-in slide-up duration-700">
        {items.length === 0 ? (
          <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/50 p-8 sm:p-20">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-blue-50/30 opacity-50" />
            <div className="relative text-center space-y-4 sm:space-y-6">
              <div className="inline-flex w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl sm:rounded-3xl items-center justify-center shadow-lg">
                <MessageSquare className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl sm:text-3xl font-black text-gray-900 mb-2 sm:mb-3">
                  Aucun commentaire
                </h3>
                <p className="text-gray-600 text-sm sm:text-lg px-4">
                  Commencez par créer votre premier témoignage client
                </p>
              </div>
              <button
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-2.5 sm:gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl
                           bg-gradient-to-r from-[#00A4E0] to-[#0077A8] text-white font-bold text-sm sm:text-lg
                           hover:shadow-2xl hover:shadow-blue-500/50
                           sm:hover:scale-105 active:scale-95 transition-all duration-300
                           min-h-[48px]"
              >
                <Plus size={20} />
                Créer un commentaire
              </button>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/50">
            {/* ===== TABLEAU — DESKTOP (lg et plus) ===== */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-black text-gray-900 text-lg">
                      Auteur
                    </th>
                    <th className="px-6 py-4 text-left font-black text-gray-900 text-lg">
                      Contenu
                    </th>
                    <th className="px-6 py-4 text-center font-black text-gray-900 text-lg">
                      Statut
                    </th>
                    <th className="px-6 py-4 text-right font-black text-gray-900 text-lg">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {items.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-blue-50/50 transition-all duration-300"
                    >
                      {/* AUTEUR */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="relative group w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 hover:border-[#00A4E0] transition-all shadow-md hover:shadow-xl hover:scale-110 duration-300">
                            <img
                              src={resolveImageUrl(c.authorImageUrl)}
                              alt={c.authorName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.png";
                              }}
                            />
                          </div>
                          <span className="font-bold text-gray-900 text-lg">
                            {c.authorName}
                          </span>
                        </div>
                      </td>

                      {/* CONTENU */}
                      <td className="px-6 py-5">
                        <p className="text-sm text-gray-600 line-clamp-2 max-w-md">
                          {c.content}
                        </p>
                      </td>

                      {/* STATUT */}
                      <td className="px-6 py-5 text-center">
                        <button
                          onClick={() => toggleEnabled(c)}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm shadow-sm transition-all hover:scale-105 active:scale-95 ${
                            c.enabled
                              ? "bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 text-green-700 hover:shadow-lg"
                              : "bg-gray-50 border-2 border-gray-200 text-[#A6A6A6] hover:shadow-md"
                          }`}
                        >
                          {c.enabled ? (
                            <>
                              <CheckCircle size={16} /> Actif
                            </>
                          ) : (
                            <>
                              <XCircle size={16} /> Inactif
                            </>
                          )}
                        </button>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          {/* VOIR */}
                          <button
                            title="Voir"
                            onClick={() => {
                              setSelected(c);
                              setShowView(true);
                            }}
                            className="p-3 rounded-xl bg-blue-50 text-blue-600
                                       hover:bg-blue-100 hover:scale-110 transition-all duration-200
                                       border border-blue-200 shadow-sm"
                          >
                            <Eye size={18} />
                          </button>

                          {/* MODIFIER */}
                          <button
                            title="Modifier"
                            onClick={() => {
                              setSelected(c);
                              setShowEdit(true);
                            }}
                            className="p-3 rounded-xl bg-green-50 text-green-600
                                       hover:bg-green-100 hover:scale-110 transition-all duration-200
                                       border border-green-200 shadow-sm"
                          >
                            <Pencil size={18} />
                          </button>

                          {/* SUPPRIMER */}
                          <button
                            title="Supprimer"
                            onClick={() => confirmDelete(c.id)}
                            className="p-3 rounded-xl bg-red-50 text-red-600
                                       hover:bg-red-100 hover:scale-110 transition-all duration-200
                                       border border-red-200 shadow-sm"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ===== CARTES — MOBILE/TABLETTE (moins de lg) ===== */}
            <div className="lg:hidden divide-y divide-gray-100">
              {items.map((c) => (
                <div key={c.id} className="p-3.5 sm:p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm flex-shrink-0">
                      <img
                        src={resolveImageUrl(c.authorImageUrl)}
                        alt={c.authorName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.png";
                        }}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-gray-900 text-sm sm:text-base truncate">
                          {c.authorName}
                        </p>
                        <button
                          onClick={() => toggleEnabled(c)}
                          className={`flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all active:scale-95 ${
                            c.enabled
                              ? "bg-green-50 border border-green-200 text-green-700"
                              : "bg-gray-50 border border-gray-200 text-[#A6A6A6]"
                          }`}
                        >
                          {c.enabled ? <CheckCircle size={12} /> : <XCircle size={12} />}
                          {c.enabled ? "Actif" : "Inactif"}
                        </button>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mt-1">
                        {c.content}
                      </p>
                    </div>
                  </div>

                  {/* Actions — toujours visibles */}
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-3">
                    <button
                      onClick={() => {
                        setSelected(c);
                        setShowView(true);
                      }}
                      aria-label="Voir"
                      className="min-h-[40px] flex items-center justify-center gap-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 active:bg-blue-100 active:scale-95 transition-all"
                    >
                      <Eye size={15} />
                      <span className="text-xs font-medium">Voir</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelected(c);
                        setShowEdit(true);
                      }}
                      aria-label="Modifier"
                      className="min-h-[40px] flex items-center justify-center gap-1.5 rounded-lg bg-green-50 text-green-600 border border-green-200 active:bg-green-100 active:scale-95 transition-all"
                    >
                      <Pencil size={15} />
                      <span className="text-xs font-medium">Modifier</span>
                    </button>

                    <button
                      onClick={() => confirmDelete(c.id)}
                      aria-label="Supprimer"
                      className="min-h-[40px] flex items-center justify-center gap-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 active:bg-red-100 active:scale-95 transition-all"
                    >
                      <Trash2 size={15} />
                      <span className="text-xs font-medium">Suppr.</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer avec compteur */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-gray-50 to-blue-50/30 border-t-2 border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#00A4E0] rounded-full animate-pulse flex-shrink-0" />
                <p className="text-xs sm:text-sm text-gray-700 font-bold">
                  Total : <span className="text-[#00A4E0] text-sm sm:text-lg">{items.length}</span> commentaire{items.length > 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      {showCreate && (
        <CommentaireCreateModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            reload();
            showToast("Commentaire créé");
          }}
        />
      )}

      {showEdit && selected && (
        <CommentaireEditModal
          commentaire={selected}
          onClose={() => setShowEdit(false)}
          onUpdated={() => {
            reload();
            showToast("Commentaire modifié");
          }}
        />
      )}

      {showView && selected && (
        <CommentaireViewModal
          commentaire={selected}
          onClose={() => setShowView(false)}
        />
      )}

      <ConfirmDeleteModal
        open={deleteId !== null}
        title="Supprimer le commentaire"
        message="Cette action est irréversible. Voulez-vous continuer ?"
        loading={deleteLoading}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />

      {toast && <Toast message={toast} />}

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-in {
          animation-fill-mode: both;
        }

        .slide-up {
          animation: slide-up 0.7s ease-out;
        }
      `}</style>
    </div>
  );
}