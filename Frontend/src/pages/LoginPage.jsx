import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "../utils/axiosDefaults";
import { useTranslation } from "react-i18next";
import { translateErrorMessage } from "../utils/translateErrors";

export default function LoginPage() {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
     setError("");
    setLoading(true);

     try {
      await login(username, password);  // ⬅️ no formatting here anymore
      navigate("/", { replace: true });
    } catch (err) {
       console.error("🔐 Login error:", err);
      let errorMessage = t("errors.invalidCredentials");
       const errorData = err.response?.data || err.message;

       if (typeof errorData === "string") {
         errorMessage = errorData;
       } else if (errorData?.detail) {
         errorMessage = errorData.detail;
       } else if (Array.isArray(errorData?.non_field_errors)) {
         errorMessage = errorData.non_field_errors[0];
       }

       setError(translateErrorMessage("login", errorMessage, t));
    } finally {
       setLoading(false);
    }
  };


  return (
    <div className="min-h-[calc(100vh-96px)] flex items-center justify-center px-4 text-white">
      <div className="w-full max-w-md">
        <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">{t("login.title")}</h1>
            <p className="text-sm text-gray-400 mt-2">{t("login.subtitle")}</p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-800/40 border border-red-500 text-red-300 rounded-md text-sm whitespace-pre-line">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm text-gray-300 mb-1" htmlFor="username">
                {t("login.username")}
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1" htmlFor="password">
                {t("login.password")}
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
                disabled={loading}
              />
              <div className="text-right text-sm mt-1">
                <Link
                  to="/reset-password/"
                  className="text-purple-400 hover:text-purple-300 underline"
                >
                  {t("login.forgotPassword")}
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md shadow transition ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <span className="inline-flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {t("login.processing")}
                </span>
              ) : (
                t("login.submit")
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            {t("login.noAccount")} {" "}
            <Link to="/register" className="text-purple-400 hover:text-purple-300 underline">
              {t("login.signup")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
