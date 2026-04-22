import { useEffect, useState } from "react";
import { Settings, Sparkles, FileText, ShieldCheck } from "lucide-react";
import type { AdminAuditLog } from "@/types/audit";
import type { User } from "@/types/user";
import { AuditService } from "@/services/auditService";
import { UserService } from "@/services/userService";
import AuditTable from "@/components/configuration/AuditTable";
import AuditFilters from "@/components/configuration/AuditFilters";

const ConfigurationPage = () => {
  const [users, setUsers]               = useState<User[]>([]);
  const [logs, setLogs]                 = useState<AdminAuditLog[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dateStart, setDateStart]       = useState("");
  const [dateEnd, setDateEnd]           = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingLogs, setLoadingLogs]   = useState(false);
  const [hasSearched, setHasSearched]   = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await UserService.getAll();
        if (mounted) setUsers(data);
      } catch (err) {
        console.error("❌ Erreur chargement utilisateurs:", err);
      } finally {
        if (mounted) setLoadingUsers(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const fetchLogs = async () => {
    if (!selectedUser) return;
    try {
      setLoadingLogs(true);
      setHasSearched(true);

      let data: AdminAuditLog[];
      if (dateStart && dateEnd) {
        const all = await AuditService.byDate(dateStart, dateEnd);
        data = all.filter(l => l.actorEmail === selectedUser.email);
      } else {
        data = await AuditService.byAdmin(selectedUser.email);
      }
      setLogs(data);
    } catch (err) {
      console.error("❌ Erreur chargement logs:", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setLogs([]);
    setHasSearched(false);
  };

  const handleReset = () => {
    setSelectedUser(null);
    setLogs([]);
    setHasSearched(false);
    setDateStart("");
    setDateEnd("");
  };

  /* ── Loading utilisateurs ── */
  if (loadingUsers) {
    return (
      <div className="pt-2 px-3 sm:px-4">
        <div className="relative overflow-hidden bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/60 p-20 text-center"
          style={{ boxShadow: "0 8px 48px rgba(0,164,224,0.10)" }}>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#00A4E0]/10 to-[#cfe3ff]/20 rounded-full blur-3xl opacity-60 animate-pulse" />
          <div className="relative z-10">
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl animate-pulse blur-lg opacity-40" />
              <div className="relative w-full h-full bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl flex items-center justify-center shadow-2xl">
                <FileText className="w-10 h-10 text-white animate-bounce" />
              </div>
            </div>
            <div className="inline-flex items-center gap-3 text-[#00A4E0]">
              <div className="w-5 h-5 border-2 border-[#00A4E0]/40 border-t-[#00A4E0] rounded-full animate-spin" />
              <span className="text-lg font-bold">Chargement…</span>
            </div>
            <p className="text-sm text-gray-400 mt-3 font-medium">Veuillez patienter un instant</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    // ✅ pt-2 = espace minimal en haut
    // ✅ px-3 sm:px-4 = espace minimal à gauche/droite
    // ✅ pb-8 = respiration en bas
    <div className="pt-2 px-3 sm:px-4 pb-8 space-y-4">

      {/* ── Filters ── */}
      <AuditFilters
        users={users}
        loadingUsers={loadingUsers}
        selectedUser={selectedUser}
        onSelectUser={handleSelectUser}
        onClearUser={handleReset}
        dateStart={dateStart}
        dateEnd={dateEnd}
        onDateStartChange={setDateStart}
        onDateEndChange={setDateEnd}
        onSearch={fetchLogs}
        onReset={handleReset}
        loading={loadingLogs}
        hasSearched={hasSearched}
      />

      {/* ── Chargement logs ── */}
      {loadingLogs && (
        <div className="relative overflow-hidden bg-white/90 backdrop-blur-2xl rounded-3xl border border-white/60 p-16 text-center"
          style={{ boxShadow: "0 8px 48px rgba(0,164,224,0.08)" }}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#cfe3ff]/30 to-transparent rounded-full blur-3xl animate-pulse" />
          <div className="relative z-10 inline-flex items-center gap-3 text-[#00A4E0]">
            <div className="w-6 h-6 border-2 border-[#00A4E0]/30 border-t-[#00A4E0] rounded-full animate-spin" />
            <span className="text-base font-bold">Récupération des logs…</span>
          </div>
        </div>
      )}

      {/* ── État initial ── */}
      {!hasSearched && !loadingLogs && (
        <div className="relative overflow-hidden rounded-3xl border-2 border-[#00A4E0]/12 text-center"
          style={{
            background: "linear-gradient(135deg, #f0f8ff 0%, #ffffff 40%, #f8fcff 100%)",
            boxShadow: "0 4px 32px rgba(0,164,224,0.08)",
          }}>
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-gradient-to-br from-[#cfe3ff]/25 to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-gradient-to-tr from-[#00A4E0]/8 to-transparent rounded-full blur-3xl animate-pulse" />

          <div className="relative z-10 py-24 px-8">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-3xl blur-2xl opacity-25 animate-pulse scale-110" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-3xl flex items-center justify-center"
                style={{ boxShadow: "0 16px 48px rgba(0,164,224,0.30)" }}>
                <ShieldCheck className="w-12 h-12 text-white" />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-2">
              {selectedUser ? `Prêt pour ${selectedUser.email}` : "Journal d'audit"}
              <Sparkles size={20} className="text-[#00A4E0] animate-pulse" />
            </h3>
            <p className="text-gray-400 max-w-sm mx-auto text-sm leading-relaxed">
              {selectedUser
                ? "Cliquez sur « Afficher les logs » pour charger l'historique des actions"
                : "Sélectionnez un administrateur ci-dessus, puis cliquez sur « Afficher les logs »"}
            </p>
          </div>
        </div>
      )}

      {/* ── Table ── */}
      {hasSearched && !loadingLogs && (
        <AuditTable logs={logs} actorEmail={selectedUser?.email} />
      )}

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default ConfigurationPage;