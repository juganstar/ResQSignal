// src/components/ContactForm.jsx
import { useState } from "react";
import axios from "../utils/axiosDefaults"; // ✅ use custom axios with JWT
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useTranslation } from "react-i18next";

function translateErrorMessage(msg, t) {
  if (typeof msg !== "string") return msg;

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

export default function ContactForm({ contacts, setContacts, setError }) {
  const { t } = useTranslation();
  const [newContact, setNewContact] = useState({
    name: "",
    phone_number: "",
    relationship: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    const nameRegex = /^[A-Za-zÀ-ÿ\s'-]{2,50}$/;

    if (!newContact.name.trim()) {
      errors.name = t("setup.required_name");
    } else if (!nameRegex.test(newContact.name.trim())) {
      errors.name = t("setup.invalid_name");
    }

    if (!newContact.phone_number) {
      errors.phone_number = t("setup.required_phone");
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddContact = async () => {
    try {
      if (!validateForm()) return;

      const formatted = {
        ...newContact,
        phone_number: newContact.phone_number.startsWith("+")
          ? newContact.phone_number
          : `+${newContact.phone_number}`,
      };

      const response = await axios.post("/api/emergency/contacts/", formatted);

      const created = response.data;

      if (created && created.id && created.phone_number) {
        setContacts([...contacts, created]);
        setNewContact({ name: "", phone_number: "", relationship: "" });
        setError("");
        setFormErrors({});
      } else {
        setError(t("setup.contact_creation_failed"));
      }
        } catch (err) {
          let message = t("setup.error_add");
          const formErrs = {};

          if (err.response) {
            const data = err.response.data;

            if (err.response.status === 403) {
              message = t("setup.must_be_logged_in");
            } else if (typeof data === "string") {
              message = translateErrorMessage(null, data, t);
            } else if (Array.isArray(data) && typeof data[0] === "string") {
              message = translateErrorMessage(null, data[0], t);
            } else if (typeof data === "object") {
              Object.entries(data).forEach(([field, messages]) => {
                const translated = Array.isArray(messages)
                  ? messages.map((msg) => translateErrorMessage(field, msg, t))
                  : [translateErrorMessage(field, messages, t)];
                formErrs[field] = translated;
              });

              // Optional: fallback to non-field errors if present
              if (formErrs["non_field_errors"]?.length) {
                message = formErrs["non_field_errors"][0];
              }
            }
          }

          setError(message);
          setFormErrors(formErrs);
        }


  return (
    <div className="space-y-4 mb-10">
      <input
        type="text"
        placeholder={t("setup.placeholder_name")}
        value={newContact.name}
        onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
      />
      {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}

      <PhoneInput
        country={"pt"}
        value={newContact.phone_number}
        onChange={(phone) => setNewContact({ ...newContact, phone_number: phone })}
        inputStyle={{
          backgroundColor: "#111827",
          color: "white",
          borderColor: "#4b5563",
          width: "100%",
          height: "44px",
          paddingLeft: "60px",
        }}
        buttonStyle={{
          backgroundColor: "#111827",
          borderColor: "#4b5563",
        }}
        dropdownStyle={{
          backgroundColor: "#111827",
          borderColor: "#4b5563",
          color: "white",
        }}
        inputProps={{ required: true }}
      />
      {formErrors.phone_number && (
        <p className="text-red-500 text-sm">{formErrors.phone_number}</p>
      )}

      <input
        type="text"
        placeholder={t("setup.placeholder_relationship")}
        value={newContact.relationship}
        onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
      />

      <button
        onClick={handleAddContact}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-md shadow transition-all"
      >
        {t("setup.add_button")}
      </button>
    </div>
  );
}
