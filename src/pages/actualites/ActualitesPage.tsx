import { useState } from "react";
import { Plus, Newspaper,  Sparkles } from "lucide-react";
import ActualitesList from "@/components/actualites/ActualitesList";
import ActualiteCreateModal from "@/components/actualites/ActualiteCreateModal";

const ActualitePage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#cfe3ff]/30 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-full blur-3xl opacity-10" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl flex items-center justify-center shadow-2xl">
                  <Newspaper className="w-8 h-8 text-white" />
                </div>
              </div>

              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  Actualités
                  <Sparkles size={24} className="text-[#00A4E0] animate-pulse" />
                </h1>
                <p className="text-gray-600 mt-1">
                  Gérez et publiez vos actualités
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="group relative px-6 py-4 rounded-xl font-semibold text-white overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8]" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0077A8] to-[#00A4E0] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center gap-2">
                <Plus size={20} />
                Nouvelle actualité
              </span>
            </button>
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
