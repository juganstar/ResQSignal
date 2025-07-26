import { useState } from "react";
import axios from "../utils/axiosDefaults";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

export default function ResendVerificationPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleResend = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/users/resend-verification/", { email });
      toast.success(t("verify.resentSuccess"));
      setTimeout(() => navigate("/login"), 2000); // redirect after 2s
    } catch (err) {
      toast.error(t("verify.resentFail"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-2xl p-8">
          <h1 className="text-2xl font-bold text-white mb-4">
            {t("verify.resendTitle")}
          </h1>
          <p className="text-gray-300 mb-6">
            {t("verify.resendDescription")}
          </p>

          <form onSubmit={handleResend}>
            <input
              type="email"
              placeholder={t("form.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 mb-4 rounded-lg bg-gray-800 text-white border border-gray-600"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold"
            >
              {loading ? t("verify.sending") : t("verify.resendLink")}
            </button>
          </form>

          <div className="mt-4 text-sm text-gray-400 text-center">
            <Link to="/login" className="underline text-blue-400 hover:text-blue-500">
              {t("auth.backToLogin")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
