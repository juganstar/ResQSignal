import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function PrivacyPolicyPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-96px)] py-12 px-4 max-w-2xl mx-auto text-white">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-white">
          {t("privacy.title")}
        </h1>

        <p className="text-gray-300">{t("privacy.intro")}</p>

        <h2 className="text-lg font-semibold text-white">
          {t("privacy.data_collection_title")}
        </h2>
        <p className="text-gray-300">{t("privacy.data_collection_text")}</p>

        <h2 className="text-lg font-semibold text-white">
          {t("privacy.data_usage_title")}</h2>
        <p className="text-gray-300">{t("privacy.data_usage_text")}</p>

        <h2 className="text-lg font-semibold text-white">
          {t("privacy.third_parties_title")}</h2>
        <p className="text-gray-300">{t("privacy.third_parties_text")}</p>

        <h2 className="text-lg font-semibold text-white">
          {t("privacy.security_title")}</h2>
        <p className="text-gray-300">{t("privacy.security_text")}</p>

        <h2 className="text-lg font-semibold text-white">
          {t("privacy.user_rights_title")}</h2>
        <p className="text-gray-300">{t("privacy.user_rights_text")}</p>

        <p className="text-gray-500 text-sm italic pt-4">
          {t("privacy.last_updated")}
        </p>

        <button
          onClick={() => navigate("/")}
          className="mt-6 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-all duration-200"
        >
          {t("privacy.back")}
        </button>
      </div>
    </div>
  );
}