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
  UserCircle,
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
    <div className="fixed bottom-6 right-6 bg-gradient-to-r from-[#00A4E0] to-[#0077A8] text-white px-6 py-3 rounded-xl shadow-2xl z-50 animate-in slide-in-from-bottom-5 duration-300">
      <p className="font-medium flex items-center gap-2">
        <CheckCircle size={18} />
        {message}
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
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-20 text-center">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-full blur-3xl opacity-10 animate-pulse" />
          <div className="relative z-10">
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <MessageSquare className="w-10 h-10 text-white animate-bounce" />
              </div>
            </div>
            <div className="inline-flex items-center gap-3 text-[#00A4E0]">
              <div className="w-6 h-6 border-3 border-[#00A4E0] border-t-transparent rounded-full animate-spin" />
              <span className="text-lg font-semibold">Chargement des commentaires...</span>
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
            <MessageSquare className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Commentaires
              <Sparkles size={18} className="text-[#00A4E0] animate-pulse" />
            </h1>
            <p className="text-sm text-gray-500">
              {items.length} commentaire{items.length > 1 ? 's' : ''} au total
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="group relative px-6 py-3 rounded-xl font-semibold text-white overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0077A8] to-[#00A4E0] opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative flex items-center gap-2">
            <Plus size={20} />
            Nouveau Commentaire
          </span>
        </button>
      </div>

      {/* Empty State */}
      {items.length === 0 ? (
        <div className="relative overflow-hidden bg-gradient-to-br from-[#cfe3ff] via-white to-[#cfe3ff]/30 rounded-2xl p-20 text-center border-2 border-[#00A4E0]/20 shadow-xl">
          <div className="absolute top-10 right-10 w-40 h-40 bg-[#00A4E0]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-[#0077A8]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

          <div className="relative z-10">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-3xl blur-2xl opacity-30 animate-pulse" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-3xl flex items-center justify-center shadow-2xl">
                <MessageSquare className="w-12 h-12 text-white" />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-2">
              Aucun commentaire
              <Sparkles size={20} className="text-[#00A4E0] animate-pulse" />
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Commencez par créer votre premier témoignage client
            </p>
          </div>
        </div>
      ) : (
        /* Table */
        <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#cfe3ff] to-transparent rounded-full blur-3xl opacity-40" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#00A4E0]/10 to-transparent rounded-full blur-3xl opacity-30" />

          <div className="relative z-10 overflow-x-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-gradient-to-r from-gray-50/90 via-[#cfe3ff]/10 to-gray-50/90 backdrop-blur-sm border-b-2 border-[#00A4E0]/20">
                <tr>
                  <th className="px-6 py-5 text-left">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                        <UserCircle size={14} className="text-purple-600" />
                      </div>
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Auteur
                      </span>
                    </div>
                  </th>
                  <th className="px-6 py-5 text-left">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-lg">
                        <MessageSquare size={14} className="text-white" />
                      </div>
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Contenu
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
                {items.map((c, index) => (
                  <tr
                    key={c.id}
                    className="bg-white transition-all hover:bg-gray-50"
                  >
                    {/* Auteur */}
                    <td className="px-6 py-5">
                      <div
                        style={{
                          animation: `slideIn 0.5s ease-out ${index * 0.1}s both`
                        }}
                      >
                        <div className="flex items-center gap-3">
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
                          <span className="font-bold text-gray-900 hover:text-[#00A4E0] transition-colors">
                            {c.authorName}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Contenu */}
                    <td className="px-6 py-5">
                      <div
                        style={{
                          animation: `slideIn 0.5s ease-out ${index * 0.1 + 0.1}s both`
                        }}
                      >
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {c.content}
                        </p>
                      </div>
                    </td>

                    {/* Statut */}
                    <td className="px-6 py-5 text-center">
                      <div
                        style={{
                          animation: `slideIn 0.5s ease-out ${index * 0.1 + 0.2}s both`
                        }}
                      >
                        <button
                          onClick={() => toggleEnabled(c)}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm shadow-sm transition-all hover:scale-105 active:scale-95 ${
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
                          onClick={() => {
                            setSelected(c);
                            setShowView(true);
                          }}
                          className="group relative p-2.5 rounded-xl border-2 border-[#cfe3ff] bg-[#cfe3ff]/30 text-[#00A4E0] hover:bg-[#cfe3ff]/60 hover:scale-110 active:scale-95 transition-all shadow-sm hover:shadow-lg"
                          title="Voir"
                        >
                          <Eye size={16} />
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            Voir
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelected(c);
                            setShowEdit(true);
                          }}
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
                          onClick={() => confirmDelete(c.id)}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Info */}
          <div className="relative z-10 bg-gradient-to-r from-gray-50/80 to-[#cfe3ff]/20 border-t border-gray-200 px-8 py-4">
            <div className="flex items-center justify-between text-sm text-[#A6A6A6]">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-[#00A4E0]" />
                <span>Témoignages clients - Gestion des avis</span>
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
