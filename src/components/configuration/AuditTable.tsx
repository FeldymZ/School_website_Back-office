import { Shield, Activity, Target, Calendar, Sparkles, FileText } from "lucide-react";
import type { AdminAuditLog } from "@/types/audit";

interface Props {
  logs: AdminAuditLog[];
}

const AuditTable = ({ logs }: Props) => {
  if (logs.length === 0) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-[#cfe3ff] via-white to-[#cfe3ff]/30 rounded-2xl p-20 text-center border-2 border-[#00A4E0]/20 shadow-xl">
        <div className="absolute top-10 right-10 w-40 h-40 bg-[#00A4E0]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-[#0077A8]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative z-10">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-3xl blur-2xl opacity-30 animate-pulse" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-3xl flex items-center justify-center shadow-2xl">
              <FileText className="w-12 h-12 text-white" />
            </div>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-2">
            Aucun log d'audit
            <Sparkles size={20} className="text-[#00A4E0] animate-pulse" />
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Aucune activité n'a été enregistrée pour le moment
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#cfe3ff] to-transparent rounded-full blur-3xl opacity-40" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#00A4E0]/10 to-transparent rounded-full blur-3xl opacity-30" />

      <div className="relative z-10 overflow-x-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-gradient-to-r from-gray-50/90 via-[#cfe3ff]/10 to-gray-50/90 backdrop-blur-sm border-b-2 border-[#00A4E0]/20">
            <tr>
              <th className="px-6 py-5 text-left">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                    <Shield size={14} className="text-blue-600" />
                  </div>
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Administrateur
                  </span>
                </div>
              </th>
              <th className="px-6 py-5 text-left">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-lg">
                    <Activity size={14} className="text-white" />
                  </div>
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Action
                  </span>
                </div>
              </th>
              <th className="px-6 py-5 text-left">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                    <Target size={14} className="text-purple-600" />
                  </div>
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Cible
                  </span>
                </div>
              </th>
              <th className="px-6 py-5 text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center">
                    <Calendar size={14} className="text-orange-600" />
                  </div>
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Date
                  </span>
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {logs.map((log, index) => (
              <tr key={log.id} className="bg-white transition-all hover:bg-gray-50">
                {/* Administrateur */}
                <td className="px-6 py-5">
                  <div
                    style={{
                      animation: `slideIn 0.5s ease-out ${index * 0.1}s both`
                    }}
                  >
                    <p className="font-bold text-gray-900">{log.actorEmail}</p>
                  </div>
                </td>

                {/* Action */}
                <td className="px-6 py-5">
                  <div
                    style={{
                      animation: `slideIn 0.5s ease-out ${index * 0.1 + 0.1}s both`
                    }}
                  >
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#cfe3ff]/30 to-white border-2 border-[#00A4E0]/20 text-[#00A4E0] font-bold text-sm shadow-sm">
                      <Activity size={16} />
                      {log.action}
                    </span>
                  </div>
                </td>

                {/* Cible */}
                <td className="px-6 py-5">
                  <div
                    style={{
                      animation: `slideIn 0.5s ease-out ${index * 0.1 + 0.2}s both`
                    }}
                  >
                    <p className="text-gray-700 font-medium">{log.target}</p>
                  </div>
                </td>

                {/* Date */}
                <td className="px-6 py-5 text-right">
                  <div
                    style={{
                      animation: `slideIn 0.5s ease-out ${index * 0.1 + 0.3}s both`
                    }}
                  >
                    <p className="text-sm text-[#A6A6A6]">
                      {new Date(log.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="relative z-10 bg-gradient-to-r from-gray-50/80 to-[#cfe3ff]/20 border-t border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between text-sm text-[#A6A6A6]">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-[#00A4E0]" />
            <span>{logs.length} entrée{logs.length > 1 ? 's' : ''} d'audit</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Synchronisé</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditTable;
