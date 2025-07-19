import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axiosDefaults";
import SetupGuide from "../components/SetupGuide";
import ContactForm from "../components/ContactForm";
import ContactList from "../components/ContactList";
import EmergencyButtons from "../components/EmergencyButtons";
import AccountActions from "../components/AccountActions";

export default function SetupPage() {
  const { isAuthenticated, user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userToken, setUserToken] = useState('');
  const [error, setError] = useState('');

  const hasPremium = user?.profile?.has_premium ?? false;

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }
    setUserToken(user.token || user.profile?.token || "");
    setLoading(false);
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated) fetchContacts();
  }, [isAuthenticated]);

  const fetchContacts = async () => {
    try {
      const response = await axios.get('/api/emergency/contacts/');
      setContacts(Array.isArray(response.data) ? response.data : []);
    } catch {
      setError(t('setup.error_fetch'));
    }
  };

  return (
    <div className="min-h-[calc(100vh-96px)] py-12 px-4 max-w-2xl mx-auto text-white">
      <h2 className="text-3xl font-bold text-center mb-8">{t('setup.title')}</h2>
      <SetupGuide />
      <ContactForm
        contacts={contacts}
        setContacts={setContacts}
        setError={setError}
        hasPremium={hasPremium} // ✅ Pass premium status
      />
      {error && <div className="mt-2 text-red-500 text-sm font-medium">{error}</div>}
      <ContactList contacts={contacts} setContacts={setContacts} />
      <EmergencyButtons userToken={userToken} hasPremium={hasPremium} /> {/* Optional */}
      <AccountActions logout={logout} navigate={navigate} />
    </div>
  );
}
