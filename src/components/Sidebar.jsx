import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext.jsx";

const brandLogoSrc = "/astrochess-logo.png";

const navigationItems = [
  {
    label: "Home",
    translationKey: "nav.home",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m3 11 9-7 9 7M5 10.5V20h5v-5h4v5h5v-9.5"
      />
    ),
  },
  {
    label: "Games",
    translationKey: "nav.games",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 8.25h7.5v7.5h-7.5v-7.5ZM4.5 4.5h15v15h-15v-15ZM8.25 4.5v15M15.75 4.5v15M4.5 8.25h15M4.5 15.75h15"
      />
    ),
  },
  {
    label: "Openings",
    translationKey: "nav.openings",
    icon: (
      <>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 12h4m10 0h-4M9 12a3 3 0 0 1 3-3m3 3a3 3 0 0 0-3-3m0 0V5m0 4v10"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7 7.5 12 5l5 2.5M7 16.5 12 19l5-2.5"
        />
      </>
    ),
  },
  {
    label: "Analysis",
    translationKey: "nav.analysis",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 19V5m0 14h16M8 16v-5m4 5V8m4 8v-3"
      />
    ),
  },
  {
    label: "Practice",
    translationKey: "nav.practice",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 5v14m-7-7h14M7.5 7.5l9 9m0-9-9 9"
      />
    ),
  },
  {
    label: "AI Coach",
    translationKey: "nav.aiCoach",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3.5 13.7 8l4.8 1.7-4.8 1.7L12 16l-1.7-4.6-4.8-1.7L10.3 8 12 3.5ZM18 15l.8 2.1L21 18l-2.2.9L18 21l-.8-2.1L15 18l2.2-.9L18 15Z"
      />
    ),
  },
  {
    label: "Calendar",
    translationKey: "nav.calendar",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 3v3m10-3v3M4.5 8.5h15M6 5h12a1.5 1.5 0 0 1 1.5 1.5V19A1.5 1.5 0 0 1 18 20.5H6A1.5 1.5 0 0 1 4.5 19V6.5A1.5 1.5 0 0 1 6 5Z"
      />
    ),
  },
];

function Icon({ children }) {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      {children}
    </svg>
  );
}

function getUserName(user, fallback) {
  if (!user || typeof user !== "object") return fallback;
  return user.name || user.username || fallback;
}

function getUserEmail(user) {
  if (!user || typeof user !== "object") return "";
  return user.email || "";
}

export default function Sidebar({ activeItem, onActiveItemChange, chessComAvatar = "" }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { language, setLanguage, supportedLanguages, t } = useLanguage();

  const handleGoToLogin = () => {
    window.history.pushState({}, "", "/login");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const handleLogout = async () => {
    await logout();
    window.history.pushState({}, "", "/login");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const userName = getUserName(user, t("sidebar.userFallback"));
  const userEmail = getUserEmail(user);
  const userInitial = String(userName).charAt(0).toUpperCase() || "U";

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-72 shrink-0 flex-col overflow-y-auto overflow-x-hidden border-r border-purple-500/20 bg-[linear-gradient(180deg,#070711,#0d0b18_48%,#060610)] px-3 py-4 text-slate-300 shadow-xl shadow-black/30 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="relative z-10 mb-6 flex items-center gap-3 px-2">
        <img
          src={brandLogoSrc}
          alt="astroChess logo"
          className="h-14 w-14 shrink-0 object-contain"
        />

        <div className="min-w-0">
          <p className="bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-base font-semibold uppercase tracking-[0.18em] text-transparent">
            astroChess
          </p>
          <p className="text-xs text-slate-500">{t("sidebar.tagline")}</p>
        </div>
      </div>

      <nav className="relative z-10 flex flex-1 flex-col gap-1">
        {navigationItems.map((item) => {
          const isActive = activeItem === item.label;

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onActiveItemChange(item.label)}
              className={[
                "group relative flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-sm font-medium transition-all duration-200",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080a0e]",
                isActive
                  ? "border-purple-400/40 bg-[linear-gradient(135deg,rgba(124,58,237,0.20),rgba(34,211,238,0.06))] text-purple-100 shadow-inner shadow-purple-950/20"
                  : "text-slate-400 hover:border-purple-500/20 hover:bg-purple-500/10 hover:text-purple-200",
              ].join(" ")}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-purple-400 shadow-[0_0_12px_rgba(192,132,252,0.8)]" />
              )}
              {isActive && (
                <span className="absolute right-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-cyan-200" />
              )}

              <span
                className={[
                  "grid h-8 w-8 shrink-0 place-items-center rounded-md transition-colors duration-200",
                  isActive
                    ? "bg-purple-500/15 text-cyan-100"
                    : "bg-white/[0.03] text-slate-500 group-hover:text-purple-300",
                ].join(" ")}
              >
                <Icon>{item.icon}</Icon>
              </span>

              <span className="flex-1 text-left">{t(item.translationKey, item.label)}</span>

              {isActive && (
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400 shadow-[0_0_12px_rgba(192,132,252,0.8)]" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="relative z-10 mt-4 rounded-xl border border-purple-500/20 bg-white/[0.04] p-2.5">
        <label className="grid gap-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
          {t("language.label")}
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            className="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2 text-sm font-semibold normal-case tracking-normal text-slate-200 outline-none transition focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/10"
          >
            {supportedLanguages.map((item) => (
              <option key={item.code} value={item.code}>
                {item.shortLabel}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isAuthenticated ? (
        <div className="relative z-10 mt-4 rounded-xl border border-purple-500/20 bg-white/[0.04] p-2.5">
          <div className="flex items-center gap-3">
            {chessComAvatar ? (
              <img
                src={chessComAvatar}
                alt=""
                className="h-9 w-9 shrink-0 rounded-full border border-purple-300/30 object-cover shadow-[0_0_18px_rgba(168,85,247,0.18)]"
              />
            ) : (
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-purple-300 to-fuchsia-400 text-sm font-bold text-slate-950">
                {userInitial}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{userName}</p>
              <p className="truncate text-xs text-slate-500">
                {userEmail || t("sidebar.online")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-2.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-purple-400/60 hover:text-white"
          >
            {t("sidebar.logout")}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleGoToLogin}
          className="group relative z-10 mt-4 flex w-full items-center justify-center rounded-xl border border-purple-500/40 bg-purple-500/15 p-2.5 text-sm font-semibold text-purple-200 transition-all duration-200 hover:border-purple-400 hover:bg-purple-500/30 hover:text-white"
        >
          {t("sidebar.login")}
        </button>
      )}
    </aside>
  );
}
