import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function VerifyEmailPage() {
  const { t } = useTranslation();

  return (
    <div className="flex-grow flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-2xl p-8 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="text-green-500 w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            {t("verify.title")}
          </h1>
          <p className="text-gray-300 mb-6">
            {t("verify.subtitle")}
          </p>

          <Link
            to="/login"
            className="inline-block px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold shadow-md transition"
          >
            {t("verify.loginButton")}
          </Link>
        </div>
      </div>
    </div>
  );
}
