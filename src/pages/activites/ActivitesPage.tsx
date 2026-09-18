import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Eye,
  Image as ImageIcon,
  Pencil,
  Grid3x3,
  Sparkles,
} from "lucide-react";

import { ActiviteService } from "@/services/activite.service";
import { Activite } from "@/types/activite";
import { getUserFromToken } from "@/utils/auth";
import { UserRole } from "@/types/user";

/* ===== MODALS ===== */
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import ActiviteCreateModal from "@/components/activites/ActiviteCreateModal";
import ActiviteEditModal from "@/components/activites/ActiviteEditModal";
import ActiviteDetailsModal from "@/components/activites/ActiviteDetailsModal";
import ActiviteGalleryModal from "@/components/activites/ActiviteGalleryModal";

const ActivitesPage = () => {
  /* ================= STATE ================= */
  const [activites, setActivites] = useState<Activite[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [openGallery, setOpenGallery] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const user = getUserFromToken();
  const isSuperAdmin = user?.role === UserRole.SUPERADMIN;

  /* ================= FETCH ================= */
  const load = async () => {
    try {
      setLoading(true);
      const data = await ActiviteService.getAll();
      setActivites(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!selectedId) return;

    try {
      setDeleting(true);
      await ActiviteService.delete(selectedId);
      setOpenDelete(false);
      setSelectedId(null);
      load();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression");
    } finally {
      setDeleting(false);
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-10 sm:p-20 text-center">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-full blur-3xl opacity-10 animate-pulse" />
          <div className="relative z-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Grid3x3 className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-bounce" />
              </div>
            </div>
            <div className="inline-flex items-center gap-3 text-[#00A4E0]">
              <div className="w-6 h-6 border-3 border-[#00A4E0] border-t-transparent rounded-full animate-spin" />
              <span className="text-base sm:text-lg font-semibold">Chargement des activités...</span>
            </div>
            <p className="text-sm text-[#A6A6A6] mt-3">Veuillez patienter un instant</p>
          </div>
        </div>
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-cyan-50/30 p-4 sm:p-6 space-y-6 sm:space-y-8">
      {/* Header avec effet de glassmorphism */}
      <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-5 sm:p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0]/5 via-[#0088CC]/5 to-[#0077A8]/5" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDBBNEUwIiBzdHJva2Utb3BhY2l0eT0iMC4wMyIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Icône avec effet de glow */}
            <div className="relative group flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity animate-pulse" />
              <div className="relative w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                <Grid3x3 className="w-7 h-7 sm:w-10 sm:h-10 text-white" />
              </div>
            </div>

            {/* Titre et description */}
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-4xl font-black text-gray-900 flex items-center gap-2 sm:gap-3">
                Activités
                <Sparkles className="w-5 h-5 sm:w-7 sm:h-7 text-[#00A4E0] animate-pulse flex-shrink-0" />
              </h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 font-medium">
                Gérez toutes vos activités étudiantes en toute simplicité
              </p>
            </div>
          </div>

          {/* Bouton de création avec effet premium */}
          <button
            onClick={() => setOpenCreate(true)}
            className="group relative w-full lg:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-bold text-white text-base sm:text-lg
                       bg-gradient-to-r from-[#00A4E0] via-[#0088CC] to-[#0077A8]
                       hover:from-[#0088CC] hover:via-[#0077A8] hover:to-[#006699]
                       shadow-2xl shadow-[#00A4E0]/40 hover:shadow-[#00A4E0]/60
                       hover:scale-105 active:scale-95
                       transition-all duration-500
                       overflow-hidden
                       flex items-center justify-center gap-3"
          >
            {/* Effet shine animé */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />

            {/* Glow pulsant */}
            <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300 rounded-2xl" />

            {/* Icône avec animation */}
            <div className="relative w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 group-hover:rotate-90 transition-all duration-300 flex-shrink-0">
              <Plus className="w-4 h-4" />
            </div>

            <span className="relative">Nouvelle activité</span>
          </button>
        </div>
      </div>

      {/* Liste des activités */}
      <div className="animate-in slide-up duration-700">
        {activites.length === 0 ? (
          <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-10 sm:p-20">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-blue-50/30 opacity-50" />
            <div className="relative text-center space-y-5 sm:space-y-6">
              <div className="inline-flex w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl items-center justify-center shadow-lg">
                <Grid3x3 className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl sm:text-3xl font-black text-gray-900 mb-2 sm:mb-3">
                  Aucune activité disponible
                </h3>
                <p className="text-gray-600 text-sm sm:text-lg">
                  Commencez par créer votre première activité
                </p>
              </div>
              <button
                onClick={() => setOpenCreate(true)}
                className="inline-flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl
                           bg-gradient-to-r from-[#00A4E0] to-[#0077A8] text-white font-bold text-base sm:text-lg
                           hover:shadow-2xl hover:shadow-blue-500/50
                           hover:scale-105 active:scale-95 transition-all duration-300"
              >
                <Plus size={20} />
                Créer une activité
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ===== TABLEAU — DESKTOP (lg et plus) ===== */}
            <div className="hidden lg:block relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left font-black text-gray-900 text-lg">
                        Titre
                      </th>
                      <th className="px-6 py-4 text-left font-black text-gray-900 text-lg">
                        Médias
                      </th>
                      <th className="px-6 py-4 text-right font-black text-gray-900 text-lg">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {activites.map((a) => (
                      <tr
                        key={a.id}
                        className="hover:bg-blue-50/50 transition-all duration-300"
                      >
                        {/* TITRE */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="relative group">
                              <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl blur-lg opacity-0 group-hover:opacity-40 transition-opacity" />
                              <div className="relative w-12 h-12 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg">
                                {a.titre.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <span className="font-bold text-gray-900 text-lg">
                              {a.titre}
                            </span>
                          </div>
                        </td>

                        {/* MEDIAS */}
                        <td className="px-6 py-5">
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-xl font-bold text-sm border border-purple-200 shadow-sm">
                            <ImageIcon size={16} />
                            Galerie
                          </div>
                        </td>

                        {/* ACTIONS */}
                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-2">
                            {/* DETAILS */}
                            <button
                              title="Voir"
                              onClick={() => {
                                setSelectedId(a.id);
                                setOpenDetails(true);
                              }}
                              className="p-3 rounded-xl bg-blue-50 text-blue-600
                                         hover:bg-blue-100 hover:scale-110 transition-all duration-200
                                         border border-blue-200 shadow-sm"
                            >
                              <Eye size={18} />
                            </button>

                            {/* EDIT */}
                            <button
                              title="Modifier"
                              onClick={() => {
                                setSelectedId(a.id);
                                setOpenEdit(true);
                              }}
                              className="p-3 rounded-xl bg-green-50 text-green-600
                                         hover:bg-green-100 hover:scale-110 transition-all duration-200
                                         border border-green-200 shadow-sm"
                            >
                              <Pencil size={18} />
                            </button>

                            {/* GALLERY */}
                            <button
                              title="Galerie"
                              onClick={() => {
                                setSelectedId(a.id);
                                setOpenGallery(true);
                              }}
                              className="p-3 rounded-xl bg-purple-50 text-purple-600
                                         hover:bg-purple-100 hover:scale-110 transition-all duration-200
                                         border border-purple-200 shadow-sm"
                            >
                              <ImageIcon size={18} />
                            </button>

                            {/* DELETE */}
                            {isSuperAdmin && (
                              <button
                                title="Supprimer"
                                onClick={() => {
                                  setSelectedId(a.id);
                                  setOpenDelete(true);
                                }}
                                className="p-3 rounded-xl bg-red-50 text-red-600
                                           hover:bg-red-100 hover:scale-110 transition-all duration-200
                                           border border-red-200 shadow-sm"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer avec compteur */}
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50/30 border-t-2 border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#00A4E0] rounded-full animate-pulse" />
                  <p className="text-sm text-gray-700 font-bold">
                    Total : <span className="text-[#00A4E0] text-lg">{activites.length}</span> activité{activites.length > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* ===== CARTES — MOBILE/TABLETTE (moins de lg) ===== */}
            <div className="lg:hidden space-y-3">
              {activites.map((a) => (
                <div
                  key={a.id}
                  className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl blur-lg opacity-30" />
                      <div className="relative w-11 h-11 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl flex items-center justify-center text-white font-black text-base shadow-lg">
                        {a.titre.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-gray-900 text-sm sm:text-base truncate">{a.titre}</p>
                      <div className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-lg font-semibold text-xs border border-purple-200">
                        <ImageIcon size={12} />
                        Galerie
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button
                      title="Voir"
                      onClick={() => { setSelectedId(a.id); setOpenDetails(true); }}
                      className="p-2.5 rounded-xl bg-blue-50 text-blue-600
                                 active:bg-blue-100 transition-all duration-200
                                 border border-blue-200"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      title="Modifier"
                      onClick={() => { setSelectedId(a.id); setOpenEdit(true); }}
                      className="p-2.5 rounded-xl bg-green-50 text-green-600
                                 active:bg-green-100 transition-all duration-200
                                 border border-green-200"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      title="Galerie"
                      onClick={() => { setSelectedId(a.id); setOpenGallery(true); }}
                      className="p-2.5 rounded-xl bg-purple-50 text-purple-600
                                 active:bg-purple-100 transition-all duration-200
                                 border border-purple-200"
                    >
                      <ImageIcon size={16} />
                    </button>
                    {isSuperAdmin && (
                      <button
                        title="Supprimer"
                        onClick={() => { setSelectedId(a.id); setOpenDelete(true); }}
                        className="p-2.5 rounded-xl bg-red-50 text-red-600
                                   active:bg-red-100 transition-all duration-200
                                   border border-red-200"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Footer avec compteur */}
              <div className="px-4 py-3 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#00A4E0] rounded-full animate-pulse flex-shrink-0" />
                  <p className="text-sm text-gray-700 font-bold">
                    Total : <span className="text-[#00A4E0]">{activites.length}</span> activité{activites.length > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ================= MODALS ================= */}

      <ActiviteCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSuccess={load}
      />

      <ActiviteDetailsModal
        open={openDetails}
        activiteId={selectedId}
        onClose={() => {
          setOpenDetails(false);
          setSelectedId(null);
        }}
      />

      <ActiviteEditModal
        open={openEdit}
        activiteId={selectedId}
        onClose={() => {
          setOpenEdit(false);
          setSelectedId(null);
        }}
        onSuccess={load}
      />

      <ActiviteGalleryModal
        open={openGallery}
        activiteId={selectedId}
        onClose={() => {
          setOpenGallery(false);
          setSelectedId(null);
        }}
      />

      <ConfirmDeleteModal
        open={openDelete}
        title="Supprimer l'activité"
        message="Cette action est définitive. Voulez-vous vraiment supprimer cette activité ?"
        loading={deleting}
        canConfirm={isSuperAdmin}
        onCancel={() => {
          setOpenDelete(false);
          setSelectedId(null);
        }}
        onConfirm={handleDelete}
      />

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
};

export default ActivitesPage;