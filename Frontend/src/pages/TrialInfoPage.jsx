import axios from "../utils/axiosDefaults";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";

export default function TrialInfoPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleStartTrial = async () => {
    setLoading(true);
    try {
      const res = await axios.post("/api/create-checkout-session/", {
        plan: "basic",
      });
      window.location.href = res.data.url;
    } catch (err) {
      alert(err.response?.data?.error || t("trial.error"));
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-[calc(100vh-96px)] py-12 px-4 max-w-2xl mx-auto text-white">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">{t("trial.title")}</h1>

        <p className="text-gray-300">{t("trial.intro")}</p>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">{t("trial.section1_title")}</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>{t("trial.point1")}</li>
            <li>{t("trial.point2")}</li>
            <li>{t("trial.point3")}</li>
            <li>{t("trial.point4")}</li>
          </ul>

          <h2 className="text-lg font-semibold text-white">{t("trial.section2_title")}</h2>
          <p className="text-gray-300">{t("trial.payment_explanation")}</p>

          <h2 className="text-lg font-semibold text-white">{t("trial.section3_title")}</h2>
          <p className="text-gray-300">{t("trial.post_trial_info")}</p>
        </div>

        <button
          onClick={handleStartTrial}
          disabled={loading}
          className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-all duration-200 disabled:opacity-50"
        >
          {loading ? t("trial.loading") : t("trial.startButton")}
        </button>

        <button
          onClick={() => navigate("/")}
          className="block mt-2 text-sm text-purple-400 hover:underline"
        >
          {t("trial.back")}
        </button>
      </div>
    </div>
  );
}
