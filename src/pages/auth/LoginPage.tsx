import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ShieldCheck } from "lucide-react";

import { login } from "../../services/auth.service";

const LoginPage = () => {
  const navigate = useNavigate();

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
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex min-h-[420px]">
          <div
            className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
            style={{ backgroundColor: "#00A4E0" }}
          >
            <div className="absolute inset-0">
              <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-10 right-10 w-80 h-80 bg-white/30 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 text-white text-center">
              <ShieldCheck size={64} className="mb-6 opacity-90 animate-bounce" />
              <h1 className="text-4xl font-bold mb-4">
                Administration sécurisée
              </h1>
              <p className="text-lg opacity-90 max-w-sm">
                Accédez à votre espace d’administration ESIITECH en toute
                confiance.
              </p>
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8">
            <div className="w-full max-w-md">
              <div className="flex justify-center mb-8">
                <img
                  src="https://api-test.esiitech-gabon.com/assets/logos/esiitech.png"
                  alt="ESIITECH"
                  className="h-14 object-contain"
                />
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center">
                  <h2
                    className="text-3xl font-bold mb-2"
                    style={{ color: "#00A4E0" }}
                  >
                    Connexion
                  </h2>
                  <p className="text-sm" style={{ color: "#A6A6A6" }}>
                    Compte administrateur
                  </p>
                </div>

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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white py-3 rounded-lg font-semibold disabled:opacity-50"
                  style={{ backgroundColor: "#00A4E0" }}
                >
                  {loading ? "Connexion..." : "Se connecter"}
                </button>
              </form>

              <p className="text-center mt-8 text-xs text-gray-400">
                © 2026 ESIITECH GABON. Tous droits réservés.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
