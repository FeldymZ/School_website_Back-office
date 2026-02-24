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
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
} from "lucide-react";

import {
  FormationContinue,
  PageResponse,
} from "@/types/formation-continue";

import { resolveImageUrl } from "@/utils/image";

import FormationContinueCreateModal from "@/components/formations-continues/FormationContinueCreateModal";
import FormationContinueEditModal from "@/components/formations-continues/FormationContinueEditModal";
import FormationContinueDetailsModal from "@/components/formations-continues/FormationContinueDetailsModal";
import { FormationContinueService } from "@/services/FormationContinueService";

/* ============================
   MODAL TYPE
   ============================ */

type ModalState =
  | { type: "create" }
  | { type: "edit"; id: number }
  | { type: "details"; id: number }
  | null;

const FormationsContinuesPage = () => {
  const [formations, setFormations] = useState<FormationContinue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const [modal, setModal] = useState<ModalState>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  /* ============================
     FETCH
     ============================ */

  const loadFormations = async () => {
    try {
      setLoading(true);
      setError(null);

      const data: PageResponse<FormationContinue> =
        await FormationContinueService.getAll(page, 10);

      setFormations(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les formations continues");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFormations();
  }, [page]);

  /* ============================
     TOGGLE ENABLED
     ============================ */

  const handleToggle = async (id: number) => {
    await FormationContinueService.toggle(id);
    loadFormations();
  };

  /* ============================
     DELETE
     ============================ */

  const handleDelete = async () => {
    if (!deleteId) return;
    await FormationContinueService.delete(deleteId);
    setDeleteId(null);
    loadFormations();
  };

  /* ============================
     FILTER LOCAL
     ============================ */

  const filteredFormations = formations.filter((f) =>
    f.titre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ============================
     LOADING
     ============================ */

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
        <div className="h-40 bg-gray-200 rounded-2xl animate-pulse" />
      </div>
    );
  }

  /* ============================
     ERROR
     ============================ */

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center space-y-4">
          <AlertCircle className="mx-auto text-red-500" size={40} />
          <p className="text-gray-700">{error}</p>
          <button
            onClick={loadFormations}
            className="px-6 py-3 bg-gradient-to-r from-[#00A4E0] to-[#0077A8] text-white rounded-xl"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6 space-y-8">

      {/* ================= HEADER ================= */}

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl flex items-center justify-center shadow-lg">
              <GraduationCap className="text-white w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Formations Continues
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <Sparkles size={14} className="text-[#00A4E0]" />
                {formations.length} formation
                {formations.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <button
            onClick={() => setModal({ type: "create" })}
            className="px-6 py-3 bg-gradient-to-r from-[#00A4E0] to-[#0077A8]
                       text-white rounded-xl flex items-center gap-2
                       hover:scale-105 transition-all shadow-lg"
          >
            <Plus size={18} />
            Nouvelle formation
          </button>
        </div>
      </div>

      {/* ================= SEARCH + VIEW ================= */}

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200
                         focus:ring-2 focus:ring-[#00A4E0]"
            />
          </div>

          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg ${
                viewMode === "list"
                  ? "bg-white text-[#00A4E0] shadow-sm"
                  : "text-gray-600"
              }`}
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg ${
                viewMode === "grid"
                  ? "bg-white text-[#00A4E0] shadow-sm"
                  : "text-gray-600"
              }`}
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* ================= LIST VIEW ================= */}

      {viewMode === "list" && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <table className="w-full">
            <tbody>
              {filteredFormations.map((f) => (
                <tr key={f.id} className="border-t hover:bg-blue-50/40 transition">
                  <td className="px-6 py-4 flex items-center gap-4">
                    <img
                      src={f.coverUrl ? resolveImageUrl(f.coverUrl) : "/placeholder.jpg"}
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{f.titre}</p>
                      {f.pdfUrl && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <FileText size={14} />
                          PDF disponible
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleToggle(f.id)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                        f.enabled
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {f.enabled ? (
                        <>
                          <CheckCircle size={14} />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle size={14} />
                          Inactive
                        </>
                      )}
                    </button>
                  </td>

                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => setModal({ type: "details", id: f.id })}
                      className="p-2 hover:bg-blue-50 rounded-lg"
                    >
                      <Eye size={18} />
                    </button>

                    <button
                      onClick={() => setModal({ type: "edit", id: f.id })}
                      className="p-2 hover:bg-green-50 rounded-lg"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      onClick={() => setDeleteId(f.id)}
                      className="p-2 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= PAGINATION ================= */}

      {totalPages > 1 && (
        <div className="flex justify-center gap-3">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setPage(index)}
              className={`px-4 py-2 rounded-lg ${
                page === index
                  ? "bg-[#00A4E0] text-white"
                  : "bg-white border"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}

      {/* ================= DELETE CONFIRM ================= */}

      {deleteId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-8 rounded-2xl shadow-xl space-y-4">
            <p>Confirmer la suppression ?</p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 border rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODALS ================= */}

      <FormationContinueCreateModal
        open={modal?.type === "create"}
        onClose={() => setModal(null)}
        onSuccess={loadFormations}
      />

      <FormationContinueEditModal
        formationId={modal?.type === "edit" ? modal.id : null}
        open={modal?.type === "edit"}
        onClose={() => setModal(null)}
        onSuccess={loadFormations}
      />

      <FormationContinueDetailsModal
        formationId={modal?.type === "details" ? modal.id : null}
        open={modal?.type === "details"}
        onClose={() => setModal(null)}
      />
    </div>
  );
};

export default FormationsContinuesPage;
