import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Globe } from "lucide-react";

import { login } from "../../services/auth.service";
import { useUser } from "@/context/useUser";


const LoginPage = () => {
  const navigate = useNavigate();
  const { refresh } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      await refresh();
      navigate("/dashboard");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ?? "Identifiants invalides"
        );
      } else {
        setError("Erreur inattendue");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex min-h-[560px]">
          <div
            className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
            style={{ backgroundColor: "#00A4E0" }}
          >
            <div className="absolute inset-0">
              <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-10 right-10 w-80 h-80 bg-white/30 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center w-full px-16 text-white text-center">

              {/* ===== Globe tech avec anneaux orbitaux (desktop) ===== */}
              <div className="relative w-44 h-44 mb-8 flex items-center justify-center">
                {/* Anneau orbital externe */}
                <div
                  className="absolute inset-0 rounded-full border-2 border-dashed border-white/30"
                  style={{ animation: "spin-slow 12s linear infinite" }}
                />
                {/* Anneau orbital interne, sens inverse */}
                <div
                  className="absolute inset-4 rounded-full border border-white/20"
                  style={{ animation: "spin-slow-reverse 8s linear infinite" }}
                />

                {/* Points orbitaux (satellites) */}
                <div
                  className="absolute inset-0"
                  style={{ animation: "spin-slow 12s linear infinite" }}
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-lg shadow-white/50" />
                </div>
                <div
                  className="absolute inset-4"
                  style={{ animation: "spin-slow-reverse 8s linear infinite" }}
                >
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white/70" />
                </div>

                {/* Halo derrière le globe */}
                <div className="absolute inset-8 rounded-full bg-white/20 blur-xl" />

                {/* Globe central */}
                <div className="relative w-24 h-24 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-2xl ring-1 ring-white/30">
                  <Globe size={48} className="text-white drop-shadow-lg" strokeWidth={1.5} />
                </div>
              </div>

              <h1 className="text-5xl font-bold mb-5 leading-tight">
                Administration sécurisée
              </h1>
              <p className="text-xl opacity-90 max-w-md leading-relaxed">
                Accédez à votre espace d’administration ESIITECH en toute
                confiance.
              </p>
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8 sm:p-10 lg:p-14">
            <div className="w-full max-w-lg">

              {/* ===== Globe tech compact (mobile/tablette uniquement) ===== */}
              <div
                className="lg:hidden relative w-24 h-24 mx-auto mb-6 flex items-center justify-center"
              >
                <div
                  className="absolute inset-0 rounded-full border-2 border-dashed"
                  style={{ borderColor: "#00A4E0", opacity: 0.3, animation: "spin-slow 12s linear infinite" }}
                />
                <div
                  className="absolute inset-2 rounded-full border"
                  style={{ borderColor: "#00A4E0", opacity: 0.2, animation: "spin-slow-reverse 8s linear infinite" }}
                />
                <div
                  className="absolute inset-0"
                  style={{ animation: "spin-slow 12s linear infinite" }}
                >
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full shadow-lg"
                    style={{ backgroundColor: "#00A4E0" }}
                  />
                </div>
                <div className="absolute inset-4 rounded-full blur-lg" style={{ backgroundColor: "#00A4E0", opacity: 0.15 }} />
                <div
                  className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg ring-1"
                  style={{ backgroundColor: "#cfe3ff", ringColor: "#00A4E0" } as React.CSSProperties}
                >
                  <Globe size={26} style={{ color: "#00A4E0" }} strokeWidth={1.5} />
                </div>
              </div>

              <div className="flex justify-center mb-8 lg:mb-10">
                <img
                  src="https://api-test.esiitech-gabon.com/assets/logos/esiitech.png"
                  alt="ESIITECH"
                  className="h-12 sm:h-16 object-contain"
                />
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-7">
                

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 text-center">
                      {error}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-500">
                    Adresse email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 sm:px-5 py-3 sm:py-3.5 border-2 border-gray-200 rounded-lg text-sm sm:text-base focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-500">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 sm:px-5 py-3 sm:py-3.5 border-2 border-gray-200 rounded-lg text-sm sm:text-base focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white py-3 sm:py-3.5 rounded-lg font-semibold text-sm sm:text-base disabled:opacity-50"
                  style={{ backgroundColor: "#00A4E0" }}
                >
                  {loading ? "Connexion..." : "Se connecter"}
                </button>
              </form>

              <p className="text-center mt-8 lg:mt-10 text-xs text-gray-400">
                © 2026 ESIITECH GABON. Tous droits réservés.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-slow-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;