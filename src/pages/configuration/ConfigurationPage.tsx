import { useEffect, useState } from "react";
import { Settings, Sparkles, FileText } from "lucide-react";
import type { AdminAuditLog } from "@/types/audit";
import { AuditService } from "@/services/auditService";
import AuditTable from "@/components/configuration/AuditTable";
import AuditFilters from "@/components/configuration/AuditFilters";

const ConfigurationPage = () => {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const fetchAll = async () => {
      try {
        setLoading(true);
        const data = await AuditService.getAll();
        if (isMounted) {
          setLogs(data);
        }
      } catch (error) {
        console.error("❌ Erreur chargement audits:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAll();

    return () => {
      isMounted = false;
    };
  }, []);

  const reloadAll = async () => {
    try {
      setLoading(true);
      const data = await AuditService.getAll();
      setLogs(data);
    } catch (error) {
      console.error("❌ Erreur rechargement:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterByAdmin = async (email: string) => {
    try {
      setLoading(true);
      const data = await AuditService.byAdmin(email);
      setLogs(data);
    } catch (error) {
      console.error("❌ Erreur filtre admin:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterByDate = async (start: string, end: string) => {
    try {
      setLoading(true);
      const data = await AuditService.byDate(start, end);
      setLogs(data);
    } catch (error) {
      console.error("❌ Erreur filtre date:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-20 text-center">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-full blur-3xl opacity-10 animate-pulse" />
          <div className="relative z-10">
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <FileText className="w-10 h-10 text-white animate-bounce" />
              </div>
            </div>
            <div className="inline-flex items-center gap-3 text-[#00A4E0]">
              <div className="w-6 h-6 border-3 border-[#00A4E0] border-t-transparent rounded-full animate-spin" />
              <span className="text-lg font-semibold">Chargement des audits...</span>
            </div>
            <p className="text-sm text-[#A6A6A6] mt-3">Veuillez patienter un instant</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-lg">
          <Settings className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Configuration système
            <Sparkles size={18} className="text-[#00A4E0] animate-pulse" />
          </h1>
          <p className="text-sm text-gray-500">
            Journal des actions administrateur
          </p>
        </div>
      </div>

      {/* Filters */}
      <AuditFilters
        onFilterByAdmin={filterByAdmin}
        onFilterByDate={filterByDate}
        onReset={reloadAll}
      />

      {/* Table */}
      <AuditTable logs={logs} />

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

export default ConfigurationPage;
