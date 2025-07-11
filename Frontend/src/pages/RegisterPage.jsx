import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../utils/axiosDefaults";
import { useTranslation } from "react-i18next";
import { translateErrorMessage } from "../utils/translateErrors";

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password1: "",
    password2: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await axios.post("/api/users/registration/", {
        username: typeof formData.username === "string" ? formData.username.toLowerCase() : "",
        email: formData.email || undefined,
        password1: formData.password1,
        password2: formData.password2
      });

      setSuccess(true);
      setTimeout(() => navigate("/verify-email"), 1500);
    } catch (err) {
      console.error("Registration error:", err);
      let errorMessage = t("register.error.generic");

      if (err.response?.data) {
        const responseErrors = err.response.data;
        errorMessage = Object.entries(responseErrors)
          .flatMap(([field, errors]) => {
            if (Array.isArray(errors)) {
              return errors.map((e) => translateErrorMessage(field, e, t));
            } else if (typeof errors === "string") {
              return [translateErrorMessage(field, errors, t)];
            } else {
              return [JSON.stringify(errors)];
            }
          })
          .join("\n");
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  if (success) {
    return (
      <div className="flex-grow flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-xl shadow-xl p-8 text-center">
            <div className="animate-pulse text-green-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              {t("register.successTitle")}
            </h1>
            <p className="text-gray-300">{t("register.successMessage")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">
              {t("register.title")}
            </h1>
            <p className="text-sm text-gray-400 mt-2">
              {t("register.subtitle")}
            </p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-800/40 border border-red-500 text-red-300 rounded-md text-sm whitespace-pre-line">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm text-gray-300 mb-1">
                {t("register.username")}
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm text-gray-300 mb-1">
                {t("register.email")}
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password1" className="block text-sm text-gray-300 mb-1">
                {t("register.password1")}
              </label>
              <input
                id="password1"
                type="password"
                autoComplete="new-password"
                value={formData.password1}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password2" className="block text-sm text-gray-300 mb-1">
                {t("register.password2")}
              </label>
              <input
                id="password2"
                type="password"
                autoComplete="new-password"
                value={formData.password2}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
                disabled={loading}
              />
            </div>

            <div className="flex items-start gap-2 mt-4">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1"
              />
              <label htmlFor="terms" className="text-sm text-gray-300">
                {t("register.accept")}{" "}
                <a href="/legal" target="_blank" rel="noreferrer" className="text-purple-400 hover:underline">
                  {t("register.terms")}
                </a>{" "}
                {t("register.and")}{" "}
                <a href="/privacy" target="_blank" rel="noreferrer" className="text-purple-400 hover:underline">
                  {t("register.privacy")}
                </a>
              </label>
            </div>

            <button
              type="submit"
              disabled={!acceptedTerms || loading}
              className={`w-full py-2 px-4 bg-purple-600 text-white font-semibold rounded-md shadow transition ${
                (!acceptedTerms || loading)
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-purple-700"
              }`}
            >
              {loading ? t("register.processing") : t("register.submit")}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            {t("register.haveAccount")}{" "}
            <Link to="/login" className="text-purple-400 hover:text-purple-300 underline">
              {t("register.loginLink")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
