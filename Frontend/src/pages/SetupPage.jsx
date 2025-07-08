import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useTranslation } from 'react-i18next';
import { useAuth } from "../context/AuthContext";
import { ShieldAlert, MapPin, Settings, Trash2, Info, ChevronDown, ChevronUp } from 'lucide-react';



function translateErrorMessage(msg, t) {
  if (typeof msg !== 'string') return msg;

  if (msg.startsWith("CONTACT_LIMIT_REACHED::")) {
    const parts = msg.split("::");
    const max = parts[1];
    const plan = parts[2];
    return t("setup.contact_limit", { max, plan });
  }

  if (msg.includes("international format")) return t("setup.invalid_phone_format");
  if (msg.includes("at least 9 digits")) return t("setup.phone_too_short");
  if (msg.includes("already in your contacts")) return t("setup.phone_already_exists");
  return msg;
}

export default function SetupPage() {
  const { logout, isAuthenticated, user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({
    name: '',
    phone_number: '',
    relationship: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [userToken, setUserToken] = useState('');
  const [showGuide, setShowGuide] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !user) {
        setLoading(false);
        return;
      }

      try {
        const token = user.token || user.profile?.token || "";
        setUserToken(token);
      } catch (err) {
        setError(t('setup.error_fetch'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchContacts();
    }
  }, [isAuthenticated]);

  const fetchContacts = async () => {
    try {
      const response = await axios.get('/api/emergency/contacts/');
      setContacts(Array.isArray(response.data) ? response.data : []);
    } catch {
      setError(t('setup.error_fetch'));
    }
  };

  const validateForm = () => {
    const errors = {};
    const nameRegex = /^[A-Za-zÀ-ÿ\s'-]{2,50}$/;

    if (!newContact.name.trim()) {
      errors.name = t('setup.required_name');
    } else if (!nameRegex.test(newContact.name.trim())) {
      errors.name = t('setup.invalid_name');
    }

    if (!newContact.phone_number) {
      errors.phone_number = t('setup.required_phone');
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddContact = async () => {
    console.log("🔹 Add Contact clicked"); // Always log

    try {
      if (!isAuthenticated || !user) {
        console.warn("🚫 Not authenticated");
        setError(t("setup.must_be_logged_in"));
        return;
      }

      if (!validateForm()) return;

      const formatted = {
        ...newContact,
        phone_number: newContact.phone_number.startsWith('+')
          ? newContact.phone_number
          : `+${newContact.phone_number}`,
      };

      const response = await axios.post('/api/emergency/contacts/', formatted, {
        headers: {
          'X-CSRFToken': getCSRFToken(),
          'Content-Type': 'application/json',
        },
      });

      setContacts((prev) => [...prev, response.data]);
      setNewContact({ name: '', phone_number: '', relationship: '' });
      setError('');
      setFormErrors({});
      console.log("✅ Contact added");
    } catch (err) {
      console.error("❌ Error adding contact:", err);

      let message = t('setup.error_add');
      const formErrs = {};

      if (err.response) {
        const data = err.response.data;

        if (err.response.status === 403) {
          message = t("setup.must_be_logged_in");
        } else if (typeof data === 'string' && data.startsWith('<')) {
          message = t('setup.error_server');
        } else if (typeof data === 'object') {
          Object.entries(data).forEach(([field, messages]) => {
            const translated = Array.isArray(messages)
              ? messages.map((msg) => translateErrorMessage(msg, t))
              : [translateErrorMessage(messages, t)];
            formErrs[field] = translated;
          });
        }
      }

      setError(message);
      setFormErrors(formErrs);
    }
  };


  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/emergency/contacts/${id}/`, {
        headers: { 'X-CSRFToken': getCSRFToken() },
      });
      setContacts(contacts.filter((c) => c.id !== id));
    } catch {
      setError(t('setup.error_delete'));
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm(t("setup.confirm_delete"))) return;

    try {
      await axios.delete("/api/users/delete-account/", {
        headers: { 'X-CSRFToken': getCSRFToken() },
      });

      logout();

      setTimeout(() => {
        navigate("/register");
      }, 150);

    } catch {
      setError(t("setup.error_delete_account"));
    }
  };

  return (
    <div className="min-h-[calc(100vh-96px)] py-12 px-4 max-w-2xl mx-auto text-white">
      <h2 className="text-3xl font-bold text-center mb-8">{t('setup.title')}</h2>

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

      {/* Form Inputs */}
      <div className="space-y-4 mb-10">
        <input
          type="text"
          placeholder={t('setup.placeholder_name')}
          value={newContact.name}
          onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
        />
        {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}

        <PhoneInput
          country={'pt'}
          value={newContact.phone_number}
          onChange={(phone) => setNewContact({ ...newContact, phone_number: phone })}
          inputStyle={{
            backgroundColor: '#111827',
            color: 'white',
            borderColor: '#4b5563',
            width: '100%',
            height: '44px',
            paddingLeft: '60px'
          }}
          buttonStyle={{
            backgroundColor: '#111827',
            borderColor: '#4b5563',
            color: 'black'
          }}
          dropdownStyle={{
            backgroundColor: '#111827',
            borderColor: '#4b5563',
            color: 'white'
          }}
          inputProps={{ required: true }}
        />
        {formErrors.phone_number && (
          <p className="text-red-500 text-sm">{formErrors.phone_number}</p>
        )}

        <input
          type="text"
          placeholder={t('setup.placeholder_relationship')}
          value={newContact.relationship}
          onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
        />

        <button
          onClick={handleAddContact}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-md shadow transition-all"
        >
          {t('setup.add_button')}
        </button>

        {error && (
          <div className="mt-2 text-red-500 text-sm font-medium">
            {error}
          </div>
        )}
      </div>

      {isAuthenticated && userToken && (
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 mb-8">
          <h3 className="text-xl font-semibold mb-4">Emergency Buttons</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href={`${import.meta.env.VITE_BACKEND_URL}/test/${userToken}/`}
              className="bg-yellow-600 hover:bg-yellow-700 text-black font-medium px-4 py-3 rounded-lg flex items-center justify-center gap-2"
            >
              <Settings size={18} /> Test Emergency
            </a>
            <a
              href={`${import.meta.env.VITE_BACKEND_URL}/public/${userToken}/`}
              className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-3 rounded-lg flex items-center justify-center gap-2"
            >
              <MapPin size={18} /> Real Emergency
            </a>
          </div>
        </div>
      )}


      {/* Existing Contacts */}
      <h3 className="text-xl font-semibold mb-4">{t('setup.current_contacts')}</h3>
      {loading ? (
        <p>{t('setup.loading')}</p>
      ) : contacts.length > 0 ? (
        contacts.map((contact) => (
          <div
            key={contact.id}
            className="border border-gray-700 p-4 mb-3 rounded-md flex justify-between items-start"
          >
            <div>
              <p className="font-medium">{contact.name}</p>
              <p className="text-sm text-gray-400">{contact.phone_number}</p>
              {contact.relationship && (
                <p className="text-sm text-gray-400">{contact.relationship}</p>
              )}
            </div>
            <button
              onClick={() => handleDelete(contact.id)}
              className="text-red-500 text-sm hover:underline"
            >
              {t('setup.remove')}
            </button>
          </div>
        ))
      ) : (
        <p>{t('setup.no_contacts')}</p>
      )}
        <div className="mt-10 text-center">
          {isAuthenticated && (
            <button
              onClick={handleDeleteAccount}
              className="text-sm text-red-500 hover:underline flex items-center justify-center gap-1"
            >
              <Trash2 size={16} /> {t("setup.delete_account")}
            </button>
          )}
        </div>    
    </div>
  );
}
