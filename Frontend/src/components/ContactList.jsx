// src/components/ContactList.jsx
import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';
import axios from 'axios';

export default function ContactList({ contacts, setContacts }) {
  const { t } = useTranslation();

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/emergency/contacts/${id}/`);
      setContacts(contacts.filter((c) => c.id !== id));
    } catch {
      console.error('❌ Failed to delete contact');
    }
  };

  return (
    <>
      <h3 className="text-xl font-semibold mb-4">{t('setup.current_contacts')}</h3>
      {contacts.length > 0 ? (
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
    </>
  );
}
