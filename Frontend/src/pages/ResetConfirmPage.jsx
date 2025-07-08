import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../utils/axiosDefaults";
import { useTranslation } from "react-i18next";

export default function ResetConfirmPage() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!password1 || !password2) {
      setError(t("reset.empty_fields"));
      return;
    }

    if (password1 !== password2) {
      setError(t("reset.password_mismatch"));
      return;
    }

    console.log("Reset attempt", { uid, token, password1, password2 });

    try {
      await axios.post("/api/users/reset-password-confirm/", {
        uid,
        token,
        new_password1: password1,
        new_password2: password2,
      });

      setSuccess(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      const detail = err.response?.data?.detail;
      console.error("Reset error:", err.response?.data);

      if (detail === "Invalid or expired token.") {
        setError(
          i18n.language === "pt"
            ? "Link de redefinição inválido ou expirado."
            : "Invalid or expired reset link."
        );
      } else if (detail === "Invalid user.") {
        setError(
          i18n.language === "pt"
            ? "Utilizador inválido."
            : "Invalid user."
        );
      } else if (detail) {
        setError(detail);
      } else {
        setError(t("reset.confirm_error"));
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-96px)] flex items-center justify-center px-4 text-white">
      <div className="w-full max-w-md">
        <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-xl shadow-xl p-8">
          <h2 className="text-lg font-bold mb-6 text-center">
            {t("reset.set_password")}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              className="w-full px-4 py-2 bg-gray-800 text-white placeholder-gray-400 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder={t("reset.new_password")}
              value={password1}
              onChange={(e) => setPassword1(e.target.value)}
              required
            />
            <input
              type="password"
              className="w-full px-4 py-2 bg-gray-800 text-white placeholder-gray-400 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder={t("reset.repeat_password")}
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-md shadow transition"
            >
              {t("reset.confirm")}
            </button>
          </form>

          {success && (
            <p className="text-green-500 mt-4 text-center">
              {t("reset.success_redirect")}
            </p>
          )}

          {error && (
            <p className="text-red-500 mt-4 text-center">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
