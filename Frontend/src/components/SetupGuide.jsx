// src/components/SetupGuide.jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Info, ChevronDown, ChevronUp } from "lucide-react";

export default function SetupGuide() {
  const { t } = useTranslation();
  const [showGuide, setShowGuide] = useState(true);

  return (
    <div className="mb-8">
      <div
        onClick={() => setShowGuide(!showGuide)}
        className="flex items-center justify-between bg-gray-800/60 px-4 py-3 rounded-md cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <Info size={20} />
          <span className="font-semibold text-white">{t("setup.guide_title")}</span>
        </div>
        {showGuide ? <ChevronUp className="text-white" /> : <ChevronDown className="text-white" />}
      </div>

      {showGuide && (
        <div className="bg-gray-900 px-6 py-5 border border-gray-700 rounded-b-md text-sm text-gray-300">
          <ol className="list-decimal pl-5 space-y-4 leading-relaxed">
            <li>{t("setup.step1")}</li>
            <li>{t("setup.step2")}</li>
            <li>{t("setup.step3")}</li>
            <li>{t("setup.step4")}</li>
            <li>{t("setup.step5")}</li>
            <li>{t("setup.step6")}</li>
          </ol>
        </div>
      )}
    </div>
  );
}
