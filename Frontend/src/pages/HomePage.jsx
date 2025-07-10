import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogIn, LogOut, User, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import axios from "../utils/axiosDefaults";

export default function HomePage() {
  const { isAuthenticated, user, logout } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        {t("home.loading")}
      </div>
    );
  }

  return (
    <>
      <main className="min-h-[calc(100vh-96px)] flex items-center justify-center px-4 text-white">
        <div className="w-full max-w-2xl text-center space-y-10">
          {isAuthenticated ? (
            <>
              <h2 className="text-4xl md:text-5xl font-extrabold drop-shadow-xl leading-tight">
                {user?.username
                  ? t("home.welcomeBack", { username: user.username })
                  : t("home.loading")}
              </h2>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  to="/setup"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 transition-all duration-200 rounded-lg text-white text-sm font-semibold shadow-md"
                >
                  <Settings size={18} />
                  {t("home.manageContacts")}
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 transition-all duration-200 rounded-lg text-white text-sm font-semibold shadow-md"
                >
                  <LogOut size={18} />
                  {t("home.logout")}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center justify-center px-4">
                <h2 className="text-4xl md:text-5xl font-extrabold drop-shadow-xl leading-tight text-center">
                  Made for the ones we can't lose.
                  <br className="hidden sm:inline" />
                  Built for the moments we can't plan.
                </h2>
              </div>
              <p className="text-sm text-purple-200">
                One button. One message. One chance.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 transition-all duration-200 rounded-lg text-white text-sm font-semibold shadow-md"
                >
                  <LogIn size={18} />
                  {t("home.login")}
                </Link>
                <Link
                  to="/register"
                  className="flex items-center justify-center gap-2 px-6 py-3 border border-purple-400 hover:bg-purple-700 transition-all duration-200 text-purple-300 rounded-lg text-sm font-semibold shadow-md"
                >
                  <User size={18} />
                  {t("home.register")}
                </Link>
              </div>
            </>
          )}

          <ul className="text-sm text-purple-200 space-y-2 text-left mx-auto max-w-xs">
            <li>✅ {t("home.feature1")}</li>
            <li>📨 {t("home.feature2")}</li>
            <li>🔗 {t("home.feature3")}</li>
          </ul>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 py-6">
        <p>© {new Date().getFullYear()} LiveSignal. {t("footer.rights")}</p>
        <p>
          {t("footer.contact")}:{" "}
          <a href="mailto:livesignalapp@gmail.com" className="text-purple-400 underline">
            livesignalapp@gmail.com
          </a>
        </p>
      </footer>
    </>
  );
}
