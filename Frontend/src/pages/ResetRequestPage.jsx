import { useState } from "react";
import axios from "../utils/axiosDefaults";
import { useTranslation } from "react-i18next";

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const response = await axios.post("/api/users/reset-password/", { email });
      console.log("Password reset response:", response.data);
      setSuccess(true);
    } catch (err) {
      console.error("Password reset error:", err.response?.data || err.message);
      const message = err.response?.data?.detail || "reset.error";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-96px)] flex items-center justify-center px-4 text-white">
      <div className="w-full max-w-sm">
        <div className="bg-black/50 border border-gray-700 rounded-xl shadow-xl p-8">
          <h2 className="text-xl font-semibold mb-4">{t("reset.title")}</h2>

          {success ? (
            <p className="text-green-400 text-sm">{t("reset.success")}</p>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                required
              />
              <button
                type="submit"
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-md font-semibold"
                disabled={loading}
              >
                {loading ? t("reset.sending") : t("reset.send")}
              </button>
              {error && (
                <p className="text-sm text-red-500">{t(error) || error}</p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
