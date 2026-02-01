import { useState } from "react";
import ActualitesList from "@/components/actualites/ActualitesList";
import ActualiteCreateModal from "@/components/actualites/ActualiteCreateModal";

const ActualitesPage = () => {
  const [open, setOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          Actualités
        </h1>

        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00A4E0] to-[#0077A8] text-white font-medium shadow"
        >
          + Nouvelle actualité
        </button>
      </div>

      <ActualitesList key={refreshKey} />

      {open && (
        <ActualiteCreateModal
          onClose={() => setOpen(false)}
          onCreated={() => setRefreshKey(k => k + 1)}
        />
      )}
    </div>
  );
};

export default ActualitesPage;
