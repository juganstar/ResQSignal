<header className="p-4 border-b border-gray-800 shadow-sm bg-black">
  <div className="flex items-center justify-between flex-wrap sm:flex-nowrap">
    {/* Left: Logo + Language toggle (mobile layout only) */}
    <div className="flex w-full sm:w-auto justify-between items-center">
      <h1 className="text-2xl font-bold text-white">LiveSignal</h1>
      <div className="flex gap-1 sm:hidden">
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

    {/* Nav Links */}
    <nav className="w-full sm:w-auto flex flex-wrap gap-4 mt-4 sm:mt-0 text-sm sm:text-base items-center">
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

      {/* Language toggle (desktop only) */}
      <div className="hidden sm:flex gap-2 ml-auto">
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
    </nav>
  </div>
</header>
