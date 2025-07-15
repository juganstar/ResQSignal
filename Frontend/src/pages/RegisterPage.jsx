import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../utils/axiosDefaults";
import { useTranslation } from "react-i18next";
import { translateErrorMessage } from "../utils/translateErrors";

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password1: "",
    password2: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);



  const [passwordChecks, setPasswordChecks] = useState({
    minLength: false,
    hasNumber: false,
    notCommon: false,
    notSimilar: true, // skipped similarity
  });

  const handleChange = (e) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  useEffect(() => {
    const pwd = formData.password1;
    setPasswordChecks({
      minLength: pwd.length >= 8,
      hasNumber: !/^\d+$/.test(pwd), // not just numbers
      notCommon:
        !["password", "12345678", "qwerty", "11111111", "00000000", "abcdef", "admin"].includes(pwd.toLowerCase()) &&
        !/^(\d)\1{5,}$/.test(pwd),
      notSimilar: true, // could implement later
    });
  }, [formData.password1]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await axios.post("/api/users/registration/", {
        username: formData.username?.toLowerCase(),
        email: formData.email || undefined,
        password1: formData.password1,
        password2: formData.password2,
      });

      setSuccess(true);
      setTimeout(() => navigate("/verify-email"), 1500);
    } catch (err) {
      console.error("Registration error:", err);
      setLoading(false);

      let errorMessage = t("register.error.generic") || "Erro inesperado.";
      const data = err?.response?.data;

      if (data) {
        if (typeof data === "string") {
          errorMessage = translateErrorMessage(data, t) || errorMessage;
        } else if (typeof data === "object") {
          const messages = Object.entries(data).flatMap(([field, errors]) => {
            return Array.isArray(errors)
              ? errors.map((msg) => translateErrorMessage(field, msg, t))
              : [translateErrorMessage(field, errors, t)];
          });
          errorMessage = messages.join("\n");
        }
      }

      setError(errorMessage);
    }
  };

  const allValid = Object.values(passwordChecks).every(Boolean);

  return (
    <div className="flex-grow flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">{t("register.title")}</h1>
            <p className="text-sm text-gray-400 mt-2">{t("register.subtitle")}</p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-800/40 border border-red-500 text-red-300 rounded-md text-sm whitespace-pre-line">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            <InputField id="username" label={t("register.username")} value={formData.username} onChange={handleChange} disabled={loading} />
            <InputField id="email" label={t("register.email")} type="email" value={formData.email} onChange={handleChange} disabled={loading} />

            <div>
              <label htmlFor="password1" className="block text-sm text-gray-300 mb-1">
                {t("register.password1")}
              </label>
              <input
                id="password1"
                type="password"
                value={formData.password1}
                onChange={handleChange}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={loading}
              />

              {passwordFocused && formData.password1.length > 0 && (
                <ul className="mt-2 text-sm text-gray-300 space-y-1">
                  <PasswordRequirement ok={passwordChecks.minLength}>{t("errors.passwordTooShort")}</PasswordRequirement>
                  <PasswordRequirement ok={passwordChecks.hasNumber}>{t("errors.passwordAllDigits")}</PasswordRequirement>
                  <PasswordRequirement ok={passwordChecks.notCommon}>{t("errors.passwordTooCommon")}</PasswordRequirement>
                </ul>
              )}
            </div>

            <InputField id="password2" label={t("register.password2")} type="password" value={formData.password2} onChange={handleChange} disabled={loading} />

            <div className="flex items-start gap-2 mt-4">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1"
              />
              <label htmlFor="terms" className="text-sm text-gray-300">
                {t("register.accept")}{" "}
                <a href="/legal" target="_blank" rel="noreferrer" className="text-purple-400 hover:underline">
                  {t("register.terms")}
                </a>{" "}
                {t("register.and")}{" "}
                <a href="/privacy" target="_blank" rel="noreferrer" className="text-purple-400 hover:underline">
                  {t("register.privacy")}
                </a>
              </label>
            </div>

            <button
              type="submit"
              disabled={!acceptedTerms || loading || !allValid}
              className={`w-full py-2 px-4 bg-purple-600 text-white font-semibold rounded-md shadow transition ${
                (!acceptedTerms || loading || !allValid)
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-purple-700"
              }`}
            >
              {loading ? t("register.processing") : t("register.submit")}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            {t("register.haveAccount")}{" "}
            <Link to="/login" className="text-purple-400 hover:text-purple-300 underline">
              {t("register.loginLink")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputField({ id, label, value, onChange, disabled, type = "text" }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm text-gray-300 mb-1">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        disabled={disabled}
      />
    </div>
  );
}

function PasswordRequirement({ ok, children }) {
  return (
    <li className={ok ? "text-green-400" : "text-red-400"}>
      {ok ? "✔" : "✘"} {children}
    </li>
  );
}
