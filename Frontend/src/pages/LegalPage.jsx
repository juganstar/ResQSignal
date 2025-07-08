import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function LegalPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-96px)] flex items-center justify-center px-6 py-12 text-white">
      <div className="max-w-3xl w-full bg-gray-900/80 p-10 rounded-lg border border-gray-700 shadow-md">
        <h1 className="text-3xl font-bold text-center mb-6">
          {t("legal.title")}
        </h1>

        <p className="text-yellow-400 font-medium text-center mb-6">
          {t("legal.warning")}
        </p>

        <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
          <p>{t("legal.disclaimer1")}</p>
          <p>{t("legal.disclaimer2")}</p>
          <p>{t("legal.disclaimer3")}</p>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/")}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md font-medium transition-all"
          >
            {t("legal.back")}
          </button>
        </div>
      </div>
    </div>
  );
}
