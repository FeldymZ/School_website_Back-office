import { useEffect, useState } from "react";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  GraduationCap,
  Search,
  LayoutGrid,
  List,
  Clock,
  Image as ImageIcon,
  FileText,
  AlertCircle,
  Sparkles,
  Filter,
  BookOpen,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { FormationService } from "@/services/formation.service";
import { Formation, FormationLevel } from "@/types/formation";
import { getUserFromToken } from "@/utils/auth";
import { UserRole } from "@/types/user";
import { resolveImageUrl } from "@/utils/image";

import FormationCreateModal from "@/components/formations/FormationCreateModal";
import FormationDetailsModal from "@/components/formations/FormationDetailsModal";
import FormationEditModal from "@/components/formations/FormationEditModal";
import FormationGalleryModal from "@/components/formations/FormationGalleryManager";
import FormationPdfModal from "@/components/formations/FormationPdfModal";
import FormationCoverModal from "@/components/formations/FormationCoverModal";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";

/* ============================
   LEVEL UI CONFIG
   ============================ */
interface LevelConfigType {
  label: string;
  bg: string;
  text: string;
  lightBg: string;
  gradient: string;
}

const LEVEL_CONFIG: Record<FormationLevel, LevelConfigType> = {
  LICENCE: {
    label: "Licence",
    bg: "bg-blue-100",
    text: "text-blue-700",
    lightBg: "bg-blue-50",
    gradient: "from-blue-500 to-indigo-600",
  },
  MASTER: {
    label: "Master",
    bg: "bg-purple-100",
    text: "text-purple-700",
    lightBg: "bg-purple-50",
    gradient: "from-purple-500 to-pink-600",
  },
};

const FormationsPage = () => {
  /* ============================
     STATE
     ============================ */
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [openCreate, setOpenCreate] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openGallery, setOpenGallery] = useState(false);
  const [openPdf, setOpenPdf] = useState(false);
  const [openCover, setOpenCover] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchQuery, setSearchQuery] = useState("");

  const user = getUserFromToken();
  const isSuperAdmin = user?.role === UserRole.SUPERADMIN;

  /* ============================
     FETCH
     ============================ */
  const loadFormations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await FormationService.getAll();
      setFormations(data);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les formations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFormations();
  }, []);

  /* ============================
     DELETE
     ============================ */
  const handleDelete = async () => {
    if (!selectedId) return;

    try {
      setDeleting(true);
      await FormationService.delete(selectedId);
      setOpenDelete(false);
      setSelectedId(null);
      loadFormations();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression");
    } finally {
      setDeleting(false);
    }
  };

  /* ============================
     FILTER
     ============================ */
  const filteredFormations = formations.filter((f) =>
    f.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ============================
     LOADING
     ============================ */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
        <div className="w-full space-y-8 animate-in fade-in duration-500">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl animate-pulse" />
              <div className="space-y-2">
                <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-12 w-48 bg-gray-200 rounded-xl animate-pulse" />
          </div>

          {/* Search Bar Skeleton */}
          <div className="bg-white/80 rounded-2xl p-6 border">
            <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
          </div>

          {/* Table Skeleton */}
          <div className="bg-white rounded-2xl border border-gray-100">
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-xl animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                  </div>
                  <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ============================
     ERROR
     ============================ */
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6 flex items-center justify-center">
        <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-3xl p-8 shadow-2xl border border-red-100 space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center animate-pulse">
                  <AlertCircle className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -inset-2 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl opacity-20 blur-xl" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-gray-900">
                Oups ! Une erreur est survenue
              </h3>
              <p className="text-gray-600">{error}</p>
            </div>
            <button
              onClick={loadFormations}
              className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white
                         rounded-xl font-medium hover:shadow-lg hover:scale-105
                         transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Sparkles size={18} />
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ============================
     MAIN
     ============================ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
      <div className="w-full space-y-8 animate-in fade-in duration-500">

        {/* ================= HEADER ================= */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8] rounded-3xl opacity-5 blur-3xl" />
          <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative w-16 h-16 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl flex items-center justify-center shadow-lg">
                    <GraduationCap className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Formations Initiales
                  </h1>
                  <p className="text-gray-600 mt-1 flex items-center gap-2">
                    <Sparkles size={14} className="text-[#00A4E0]" />
                    {formations.length} formation{formations.length > 1 ? 's' : ''} disponible{formations.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setOpenCreate(true)}
                className="group relative px-6 py-3 rounded-xl font-medium text-white overflow-hidden
                           hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8]" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0077A8] to-[#00A4E0] opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center gap-2">
                  <Plus size={20} />
                  Nouvelle formation
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ================= SEARCH & FILTERS ================= */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white shadow-lg">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#00A4E0] transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une formation par titre..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200
                           focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
                           transition-all bg-white/50"
              />
            </div>

            <div className="flex gap-3">
              <button
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200
                           hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                <Filter size={18} />
                <span className="hidden sm:inline">Filtres</span>
              </button>

              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "list"
                      ? "bg-white shadow-sm text-[#00A4E0]"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  title="Vue liste"
                >
                  <List size={18} />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "grid"
                      ? "bg-white shadow-sm text-[#00A4E0]"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  title="Vue grille"
                >
                  <LayoutGrid size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================= EMPTY STATE ================= */}
        {filteredFormations.length === 0 && (
          <div className="bg-white rounded-3xl p-16 text-center space-y-6 border border-gray-100 shadow-xl">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-gray-400" />
                </div>
                <div className="absolute -inset-2 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl opacity-20 blur-2xl" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-900">
                {searchQuery ? 'Aucun résultat trouvé' : 'Aucune formation disponible'}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {searchQuery
                  ? `Aucune formation ne correspond à "${searchQuery}"`
                  : 'Commencez par créer votre première formation pour la voir apparaître ici.'
                }
              </p>
            </div>
            {!searchQuery && (
              <button
                onClick={() => setOpenCreate(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                           bg-gradient-to-r from-[#00A4E0] to-[#0077A8] text-white
                           hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium"
              >
                <Plus size={20} />
                Créer ma première formation
              </button>
            )}
          </div>
        )}

        {/* ================= LIST VIEW ================= */}
        {viewMode === "list" && filteredFormations.length > 0 && (
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Formation
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Niveau
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Fichiers
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredFormations.map((f, index) => {
                    const cfg = LEVEL_CONFIG[f.level];
                    return (
                      <tr
                        key={f.id}
                        className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200"
                        style={{
                          animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`
                        }}
                      >
                        {/* Formation Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <img
                                src={resolveImageUrl(f.coverImageUrl)}
                                alt={f.title}
                                className="w-20 h-20 object-cover rounded-xl border-2 border-gray-100
                                           group-hover:border-[#00A4E0] transition-all duration-200 shadow-sm"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="space-y-1">
                              <h3 className="font-bold text-gray-900 group-hover:text-[#00A4E0] transition-colors">
                                {f.title}
                              </h3>
                              <p className="text-sm text-gray-500 flex items-center gap-2">
                                <Clock size={12} />
                                Formation initiale
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Level */}
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl
                                          ${cfg.lightBg} ${cfg.text} font-medium text-sm`}>
                            <GraduationCap size={16} />
                            {cfg.label}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          {f.enabled ? (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-sm font-medium">
                              <CheckCircle size={14} />
                              Active
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-sm font-medium">
                              <XCircle size={14} />
                              Inactive
                            </div>
                          )}
                        </td>

                        {/* Fichiers */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedId(f.id);
                                setOpenCover(true);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700
                                         hover:bg-blue-100 transition-all text-xs font-medium"
                              title="Couverture"
                            >
                              <ImageIcon size={14} />
                              Cover
                            </button>

                            <button
                              onClick={() => {
                                setSelectedId(f.id);
                                setOpenGallery(true);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700
                                         hover:bg-purple-100 transition-all text-xs font-medium"
                              title="Galerie"
                            >
                              <ImageIcon size={14} />
                              Galerie
                            </button>

                            <button
                              onClick={() => {
                                setSelectedId(f.id);
                                setOpenPdf(true);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 text-orange-700
                                         hover:bg-orange-100 transition-all text-xs font-medium"
                              title="PDF"
                            >
                              <FileText size={14} />
                              PDF
                            </button>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedId(f.id);
                                setOpenDetails(true);
                              }}
                              className="p-2.5 rounded-xl text-gray-600 hover:text-[#00A4E0]
                                         hover:bg-blue-50 transition-all duration-200 hover:scale-110 active:scale-95"
                              title="Voir les détails"
                            >
                              <Eye size={18} />
                            </button>

                            <button
                              onClick={() => {
                                setSelectedId(f.id);
                                setOpenEdit(true);
                              }}
                              className="p-2.5 rounded-xl text-gray-600 hover:text-green-600
                                         hover:bg-green-50 transition-all duration-200 hover:scale-110 active:scale-95"
                              title="Modifier"
                            >
                              <Pencil size={18} />
                            </button>

                            {isSuperAdmin && (
                              <button
                                onClick={() => {
                                  setSelectedId(f.id);
                                  setOpenDelete(true);
                                }}
                                className="p-2.5 rounded-xl text-gray-600 hover:text-red-600
                                           hover:bg-red-50 transition-all duration-200 hover:scale-110 active:scale-95"
                                title="Supprimer"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= GRID VIEW ================= */}
        {viewMode === "grid" && filteredFormations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filteredFormations.map((f, index) => {
              const cfg = LEVEL_CONFIG[f.level];
              return (
                <div
                  key={f.id}
                  className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100
                             hover:shadow-2xl hover:border-[#00A4E0] transition-all duration-300
                             hover:-translate-y-1"
                  style={{
                    animation: `slideUp 0.4s ease-out ${index * 0.1}s both`
                  }}
                >
                  {/* Image Container */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    <img
                      src={resolveImageUrl(f.coverImageUrl)}
                      alt={f.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Floating Badge */}
                    <div className="absolute top-4 right-4">
                      <div className={`px-3 py-1.5 rounded-full backdrop-blur-xl bg-white/90 border border-white/20
                                      ${cfg.text} font-medium text-xs flex items-center gap-1.5 shadow-lg`}>
                        <GraduationCap size={14} />
                        {cfg.label}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-4 left-4">
                      {f.enabled ? (
                        <div className="px-2 py-1 rounded-full backdrop-blur-xl bg-green-500/90 text-white text-xs font-medium flex items-center gap-1">
                          <CheckCircle size={12} />
                          Active
                        </div>
                      ) : (
                        <div className="px-2 py-1 rounded-full backdrop-blur-xl bg-gray-500/90 text-white text-xs font-medium flex items-center gap-1">
                          <XCircle size={12} />
                          Inactive
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#00A4E0] transition-colors line-clamp-2">
                        {f.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                        <Clock size={14} />
                        Formation initiale
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => {
                          setSelectedId(f.id);
                          setOpenDetails(true);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                                   bg-gradient-to-r from-[#00A4E0] to-[#0077A8] text-white
                                   hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 font-medium"
                      >
                        <Eye size={16} />
                        Voir les détails
                      </button>

                      <div className={`grid ${isSuperAdmin ? 'grid-cols-5' : 'grid-cols-4'} gap-2`}>
                        <button
                          onClick={() => {
                            setSelectedId(f.id);
                            setOpenEdit(true);
                          }}
                          className="p-2.5 rounded-xl border border-gray-200 text-gray-600
                                     hover:bg-green-50 hover:border-green-500 hover:text-green-600
                                     transition-all duration-200"
                          title="Modifier"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedId(f.id);
                            setOpenCover(true);
                          }}
                          className="p-2.5 rounded-xl border border-gray-200 text-gray-600
                                     hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600
                                     transition-all duration-200"
                          title="Couverture"
                        >
                          <ImageIcon size={16} />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedId(f.id);
                            setOpenGallery(true);
                          }}
                          className="p-2.5 rounded-xl border border-gray-200 text-gray-600
                                     hover:bg-purple-50 hover:border-purple-500 hover:text-purple-600
                                     transition-all duration-200"
                          title="Galerie"
                        >
                          <ImageIcon size={16} />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedId(f.id);
                            setOpenPdf(true);
                          }}
                          className="p-2.5 rounded-xl border border-gray-200 text-gray-600
                                     hover:bg-orange-50 hover:border-orange-500 hover:text-orange-600
                                     transition-all duration-200"
                          title="PDF"
                        >
                          <FileText size={16} />
                        </button>

                        {isSuperAdmin && (
                          <button
                            onClick={() => {
                              setSelectedId(f.id);
                              setOpenDelete(true);
                            }}
                            className="p-2.5 rounded-xl border border-gray-200 text-gray-600
                                       hover:bg-red-50 hover:border-red-500 hover:text-red-600
                                       transition-all duration-200"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br from-[#00A4E0]/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= MODALS ================= */}
      <FormationCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSuccess={loadFormations}
      />

      <FormationDetailsModal
        open={openDetails}
        formationId={selectedId}
        onClose={() => {
          setOpenDetails(false);
          setSelectedId(null);
        }}
      />

      <FormationEditModal
        open={openEdit}
        formationId={selectedId}
        onClose={() => {
          setOpenEdit(false);
          setSelectedId(null);
        }}
        onSuccess={loadFormations}
      />

      <FormationGalleryModal
        open={openGallery}
        formationId={selectedId}
        onClose={() => {
          setOpenGallery(false);
          setSelectedId(null);
        }}
      />

      <FormationPdfModal
        open={openPdf}
        formationId={selectedId}
        onClose={() => {
          setOpenPdf(false);
          setSelectedId(null);
        }}
      />

      <FormationCoverModal
        open={openCover}
        formationId={selectedId}
        onClose={() => {
          setOpenCover(false);
          setSelectedId(null);
          loadFormations();
        }}
      />

      <ConfirmDeleteModal
        open={openDelete}
        loading={deleting}
        title="Supprimer la formation"
        message="Cette action est définitive. Voulez-vous vraiment supprimer cette formation ?"
        canConfirm={isSuperAdmin}
        onCancel={() => {
          setOpenDelete(false);
          setSelectedId(null);
        }}
        onConfirm={handleDelete}
      />

      {/* Custom Animations */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default FormationsPage;
