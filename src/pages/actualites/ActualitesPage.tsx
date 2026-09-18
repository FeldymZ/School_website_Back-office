import { useState } from "react";
import { Plus, Newspaper, Sparkles, Search } from "lucide-react";
import ActualitesList from "@/components/actualites/ActualitesList";
import ActualiteCreateModal from "@/components/actualites/ActualiteCreateModal";

const ActualitePage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const handleCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#cfe3ff]/30 p-3 sm:p-6">
      <div className="max-w-[1600px] mx-auto space-y-4 sm:space-y-6">

        {/* Header */}
        <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-4 sm:p-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-full blur-3xl opacity-10" />

          <div className="relative z-10 space-y-4 sm:space-y-0 sm:flex sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="relative group flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity" />
                <div className="relative w-11 h-11 sm:w-16 sm:h-16 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl">
                  <Newspaper className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
                </div>
              </div>

              <div className="min-w-0">
                <h1 className="text-lg sm:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                  Actualités
                  <Sparkles size={18} className="text-[#00A4E0] animate-pulse flex-shrink-0" />
                </h1>
                <p className="text-xs sm:text-base text-gray-600 mt-0.5 sm:mt-1">
                  Gérez et publiez vos actualités
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="group relative w-full sm:w-auto flex-shrink-0 px-6 py-3 sm:py-4 rounded-xl font-semibold text-white text-sm sm:text-base overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8]" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0077A8] to-[#00A4E0] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center justify-center gap-2">
                <Plus size={18} />
                Nouvelle actualité
              </span>
            </button>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-3 sm:p-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une actualité..."
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl border border-gray-200
                         focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
                         transition-all bg-white/50 text-sm"
            />
          </div>
        </div>

        {/* Liste des actualités */}
        <ActualitesList key={refreshKey} />
      </div>

      {/* Modal de création */}
      {showCreateModal && (
        <ActualiteCreateModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
};

export default ActualitePage;