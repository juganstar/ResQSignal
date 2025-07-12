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

// ... (keep all your existing imports)

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
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Left: Logo - Made this section flex-grow to push nav left */}
          <div className="flex items-center gap-2 flex-grow">
            <Link to="/" className="flex items-center">
              <span className="text-xl sm:text-2xl font-bold text-white">ResQSignal</span>
              <img
                src={logo}
                alt="ResQSignal icon"
                className="h-12 w-12 object-contain animate-pulse -ml-1"
              />
            </Link>
            
            {/* Moved nav inside this div and added ml-8 for spacing */}
            <nav className="hidden sm:flex gap-6 text-sm sm:text-base items-center ml-8">
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
          </div>

          {/* Right: Language buttons */}
          <div className="flex gap-2">
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

        {/* Mobile nav - unchanged */}
        <div className="flex sm:hidden justify-center gap-4 pb-3">
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
        </div>
      </header>

      {/* MAIN CONTENT - unchanged */}
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
              {/* ... (keep all your existing routes) */}
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