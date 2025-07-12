import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  useLocation,
  Link,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";

import logo from "./assets/logo.png";

import HomePage from "./pages/HomePage";
import SetupPage from "./pages/SetupPage";
import LegalPage from "./pages/LegalPage";
import PricingPage from "./pages/PricingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import EmailConfirmedPage from "./pages/EmailConfirmedPage";
import ResetRequestPage from "./pages/ResetRequestPage";
import ResetConfirmPage from "./pages/ResetConfirmPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";

function App() {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const switchLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* HEADER */}
      <header className="z-50 sticky top-0 backdrop-blur bg-black/70 border-b border-gray-800 shadow-sm transition-shadow duration-300">
        <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <Link to="/" className="flex items-center">
              <img
                src={logo}
                alt="ResQSignal"
                className="h-10 sm:h-12 w-auto object-contain"
              />
            </Link>

            {/* Language Toggle (mobile) */}
            <div className="flex gap-2 sm:hidden">
              <button
                onClick={() => switchLanguage("pt")}
                className={`px-2 py-1 rounded text-sm ${
                  i18n.language === "pt" ? "bg-purple-600" : "bg-gray-800"
                }`}
              >
                🇵🇹
              </button>
              <button
                onClick={() => switchLanguage("en")}
                className={`px-2 py-1 rounded text-sm ${
                  i18n.language === "en" ? "bg-purple-600" : "bg-gray-800"
                }`}
              >
                🇬🇧
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-wrap justify-center gap-4 text-sm sm:text-base items-center w-full sm:w-auto">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive
                  ? "text-purple-400 font-semibold"
                  : "text-white hover:text-purple-300"
              }
            >
              {t("nav.home")}
            </NavLink>
            <NavLink
              to="/setup"
              className={({ isActive }) =>
                isActive
                  ? "text-purple-400 font-semibold"
                  : "text-white hover:text-purple-300"
              }
            >
              {t("nav.setup")}
            </NavLink>
            <NavLink
              to="/pricing"
              className={({ isActive }) =>
                isActive
                  ? "text-purple-400 font-semibold"
                  : "text-white hover:text-purple-300"
              }
            >
              {t("nav.pricing")}
            </NavLink>
            <NavLink
              to="/legal"
              className={({ isActive }) =>
                isActive
                  ? "text-purple-400 font-semibold"
                  : "text-white hover:text-purple-300"
              }
            >
              {t("nav.terms")}
            </NavLink>
            <NavLink
              to="/privacy"
              className={({ isActive }) =>
                isActive
                  ? "text-purple-400 font-semibold"
                  : "text-white hover:text-purple-300"
              }
            >
              {t("nav.privacy")}
            </NavLink>
          </nav>

          {/* Language Toggle (desktop) */}
          <div className="hidden sm:flex gap-2">
            <button
              onClick={() => switchLanguage("pt")}
              className={`px-2 py-1 rounded text-sm ${
                i18n.language === "pt" ? "bg-purple-600" : "bg-gray-800"
              }`}
            >
              🇵🇹
            </button>
            <button
              onClick={() => switchLanguage("en")}
              className={`px-2 py-1 rounded text-sm ${
                i18n.language === "en" ? "bg-purple-600" : "bg-gray-800"
              }`}
            >
              🇬🇧
            </button>
          </div>
        </div>
      </header>

      {/* ROUTES with animation */}
      <main className="flex-grow p-6 bg-gradient-to-b from-black via-gray-900 to-[#4a1d96]">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Routes location={location}>
              <Route path="/" element={<HomePage />} />
              <Route path="/setup" element={<SetupPage />} />
              <Route path="/legal" element={<LegalPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/email-confirmed" element={<EmailConfirmedPage />} />
              <Route path="/reset-password/" element={<ResetRequestPage />} />
              <Route
                path="/reset-password-confirm/:uid/:token"
                element={<ResetConfirmPage />}
              />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function AnimatedAppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
