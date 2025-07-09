// src/components/AccountActions.jsx
import { Trash2 } from 'lucide-react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export default function AccountActions({ logout, navigate }) {
  const { t } = useTranslation();

  const handleDeleteAccount = async () => {
    if (!window.confirm(t("setup.confirm_delete"))) return;

    try {
      await axios.delete("/api/users/delete-account/");
      logout();
      setTimeout(() => navigate("/register"), 150);
    } catch {
      alert(t("setup.error_delete_account"));
    }
  };

  return (
    <div className="mt-10 text-center">
      <button
        onClick={handleDeleteAccount}
        className="text-sm text-red-500 hover:underline flex items-center justify-center gap-1"
      >
        <Trash2 size={16} /> {t("setup.delete_account")}
      </button>
    </div>
  );
}
