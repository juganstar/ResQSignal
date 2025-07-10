import { useState } from "react";
import secureAxios from "../utils/axiosDefaults";
import { ShieldCheck, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";

const PricingPage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const startCheckout = async (plan) => {
    try {
      setLoading(true);
      const response = await secureAxios.post("/api/billing/checkout/", { plan });
      window.location.href = response.data.url;
    } catch (error) {
      console.error("Checkout failed:", error);
      alert(error.response?.data?.error || t("pricing.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-96px)] flex flex-col items-center justify-center py-12 px-4 text-white relative">
      {/* Decorative blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute bottom-20 right-[-100px] w-[300px] h-[300px] bg-purple-600 rounded-full opacity-20 blur-2xl animate-pulse"></div>
      </div>

      <div className="w-full text-center px-4">
        <h1 className="text-3xl font-bold mb-2 text-white">🪙 {t("pricing.title")}</h1>
        <p className="text-gray-300 text-sm mb-8">{t("pricing.subtitle")}</p>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={() => startCheckout("basic")}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition-all duration-200 disabled:opacity-50 shadow-md"
          >
            <ShieldCheck size={18} />
            {loading ? t("pricing.loading") : t("pricing.basic")}
          </button>

          <button
            onClick={() => startCheckout("premium")}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-purple-800 hover:bg-purple-900 px-6 py-3 rounded-lg transition-all duration-200 disabled:opacity-50 shadow-md"
          >
            <MapPin size={18} />
            {loading ? t("pricing.loading") : t("pricing.premium")}
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-1">
          <span className="text-purple-300">*</span> {t("pricing.messageCost")}
        </p>

        <div className="mt-10 text-center">
          <p className="text-purple-100 text-lg font-medium">{t("pricing.thankYou")}</p>
          <p className="text-gray-300 text-sm mt-1">{t("pricing.beSafe")}</p>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
