import { useEffect, useMemo, useState } from "react";
import Sidebar, { mainNavigationItems } from "../components/Sidebar.jsx";
import { useAuth } from "../contexts/AuthContext.js";
import { useLanguage } from "../contexts/LanguageContext.jsx";

const brandLogoSrc = "/astrochess-logo.png";

const bottomNavigationLabels = ["Home", "Games", "Analysis", "Openings", "AI Coach", "Calendar"];

const drawerNavigationGroups = [
  ["Home", "Games", "Analysis", "Openings", "AI Coach", "Practice", "Calendar"],
  ["Academy", "Master Replay", "Pattern Forge"],
];

const practiceExperienceLabels = {
  academy: "Academy",
  "master-replay": "Master Replay",
  "pattern-forge": "Pattern Forge",
};

const navigationLookup = new Map(mainNavigationItems.map((item) => [item.label, item]));

const extraDrawerItems = {
  Academy: {
    label: "Academy",
    target: "Practice",
    practiceExperience: "academy",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v16H7.5A2.5 2.5 0 0 0 5 21V5.5Zm0 0A2.5 2.5 0 0 1 7.5 8H19" />
    ),
  },
  "Master Replay": {
    label: "Master Replay",
    target: "Practice",
    practiceExperience: "master-replay",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 4h8l-1 4h2.5L12 20 13 11h-3L8 4Z" />
    ),
  },
  "Pattern Forge": {
    label: "Pattern Forge",
    target: "Practice",
    practiceExperience: "pattern-forge",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18h12M8 18l1-6 3-7 3 7 1 6M9 12h6M5 21h14" />
    ),
  },
  Profile: {
    label: "Profile",
    target: "Home",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 9a7 7 0 0 0-14 0" />
    ),
  },
  Settings: {
    label: "Settings",
    target: "Home",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.3 4.3 12 3l1.7 1.3 2.1-.2 1 1.9 1.9 1-.2 2.1L20 12l-1.5 1.9.2 2.1-1.9 1-1 1.9-2.1-.2L12 21l-1.7-1.3-2.1.2-1-1.9-1.9-1 .2-2.1L4 12l1.5-1.9-.2-2.1 1.9-1 1-1.9 2.1.2ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    ),
  },
};

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const media = window.matchMedia(query);
    const updateMatches = () => setMatches(media.matches);
    updateMatches();
    media.addEventListener("change", updateMatches);
    return () => media.removeEventListener("change", updateMatches);
  }, [query]);

  return matches;
}

function NavIcon({ children, className = "" }) {
  return (
    <svg
      aria-hidden="true"
      className={["h-5 w-5", className].join(" ")}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      {children}
    </svg>
  );
}

function getDrawerItem(label) {
  const sidebarItem = navigationLookup.get(label);
  if (sidebarItem) {
    return { ...sidebarItem, target: sidebarItem.label };
  }
  return extraDrawerItems[label] || { label, target: "Home", icon: null };
}

function getUserName(user, fallback = "User") {
  if (!user || typeof user !== "object") return fallback;
  return user.name || user.username || fallback;
}

function getUserEmail(user) {
  if (!user || typeof user !== "object") return "";
  return user.email || "";
}

function MobileHeader({ onOpenDrawer, chessComAvatar = "" }) {
  return (
    <header className="mobile-app-header md:hidden">
      <button
        type="button"
        onClick={onOpenDrawer}
        className="mobile-nav-icon-button"
        aria-label="Abrir menu"
      >
        <NavIcon>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
        </NavIcon>
      </button>

      <div className="flex min-w-0 items-center justify-center gap-2">
        <img src={brandLogoSrc} alt="" className="h-8 w-8 shrink-0 object-contain" />
        <span className="truncate bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-sm font-bold uppercase tracking-[0.18em] text-transparent">
          AstroChess
        </span>
      </div>

      <div className="grid h-11 w-11 place-items-center">
        {chessComAvatar ? (
          <img
            src={chessComAvatar}
            alt=""
            className="h-9 w-9 rounded-full border border-purple-300/30 object-cover"
          />
        ) : (
          <span className="h-2.5 w-2.5 rounded-full bg-cyan-200 shadow-[0_0_14px_rgba(34,211,238,0.8)]" />
        )}
      </div>
    </header>
  );
}

function MobileBottomNavigation({ activeItem, activePracticeExperience = "", onNavigate }) {
  const items = bottomNavigationLabels.map(getDrawerItem);
  const activeNavigationLabel =
    activeItem === "Practice" && activePracticeExperience
      ? practiceExperienceLabels[activePracticeExperience] || activeItem
      : activeItem;

  return (
    <nav className="mobile-bottom-nav md:hidden" aria-label="Navegação principal">
      {items.map((item) => {
        const isActive = activeNavigationLabel === item.label;

        return (
          <button
            key={item.label}
            type="button"
            onClick={() => onNavigate(item.target, item)}
            className={["mobile-bottom-nav-item", isActive ? "is-active" : ""].join(" ")}
            aria-current={isActive ? "page" : undefined}
            aria-label={item.label}
          >
            <span className="mobile-bottom-nav-icon">
              <NavIcon>{item.icon}</NavIcon>
            </span>
            <span className="mobile-bottom-nav-label">
              {item.label === "AI Coach" ? "Coach" : item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function MobileDrawer({
  open,
  onClose,
  activeItem,
  activePracticeExperience = "",
  onNavigate,
  chessComAvatar = "",
  connectedUsername = "",
  isConnectingChessCom = false,
  connectError = "",
  connectSuccess = "",
  onConnectChessCom,
  onLogout,
}) {
  const { user, isAuthenticated } = useAuth();
  const { language, setLanguage, supportedLanguages, t } = useLanguage();
  const [chessUsernameDraft, setChessUsernameDraft] = useState(connectedUsername || "");
  const activeNavigationLabel =
    activeItem === "Practice" && activePracticeExperience
      ? practiceExperienceLabels[activePracticeExperience] || activeItem
      : activeItem;
  const userName = getUserName(user, t("sidebar.userFallback", "User"));
  const userEmail = getUserEmail(user);

  useEffect(() => {
    setChessUsernameDraft(connectedUsername || "");
  }, [connectedUsername]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  return (
    <div className={["mobile-drawer-root md:hidden", open ? "is-open" : ""].join(" ")} aria-hidden={!open}>
      <button
        type="button"
        className="mobile-drawer-backdrop"
        onClick={onClose}
        aria-label="Fechar menu"
        tabIndex={open ? 0 : -1}
      />
      <aside className="mobile-drawer-panel" aria-label="Menu">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <img src={brandLogoSrc} alt="" className="h-11 w-11 shrink-0 object-contain" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold uppercase tracking-[0.18em] text-white">AstroChess</p>
              <p className="text-xs text-slate-500">Mobile command</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="mobile-nav-icon-button" aria-label="Fechar menu">
            <NavIcon>
              <path strokeLinecap="round" strokeLinejoin="round" d="m6 6 12 12M18 6 6 18" />
            </NavIcon>
          </button>
        </div>

        <details className="mobile-profile-drawer-card mt-5 rounded-2xl border border-purple-300/18 bg-white/[0.04] p-3">
          <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3">
            {chessComAvatar ? (
              <img src={chessComAvatar} alt="" className="h-10 w-10 rounded-full border border-purple-300/30 object-cover" />
            ) : (
              <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-purple-300 to-cyan-200 text-sm font-bold text-slate-950">
                {String(userName).charAt(0).toUpperCase() || "U"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">Profile</p>
              <p className="truncate text-xs text-slate-500">
                {connectedUsername ? `Chess.com: ${connectedUsername}` : userEmail || t("sidebar.online")}
              </p>
            </div>
            <span className="mobile-profile-drawer-chevron grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition">
              <NavIcon className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
              </NavIcon>
            </span>
          </summary>

          <div className="mt-4 grid gap-4 border-t border-purple-300/14 pt-4">
            <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              {t("language.label")}
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="min-h-12 rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm font-semibold normal-case tracking-normal text-slate-200 outline-none transition focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/10"
              >
                {supportedLanguages.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.shortLabel}
                  </option>
                ))}
              </select>
            </label>

            {isAuthenticated ? (
              <>
                <form
                  className="grid gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    onConnectChessCom?.(chessUsernameDraft);
                  }}
                >
                  <label className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    Chess.com
                  </label>
                  <input
                    value={chessUsernameDraft}
                    onChange={(event) => setChessUsernameDraft(event.target.value)}
                    placeholder="Chess.com username"
                    className="min-h-12 rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm font-semibold text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-300/55 focus:ring-4 focus:ring-cyan-400/10"
                  />
                  {connectError ? (
                    <p className="text-xs leading-5 text-rose-200">{connectError}</p>
                  ) : connectSuccess ? (
                    <p className="text-xs leading-5 text-emerald-200">{connectSuccess}</p>
                  ) : null}
                  <button
                    type="submit"
                    disabled={isConnectingChessCom}
                    className="min-h-12 rounded-2xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-3 text-sm font-bold text-cyan-100 transition hover:border-cyan-200/50 hover:bg-cyan-300/15 disabled:cursor-wait disabled:opacity-60"
                  >
                    {isConnectingChessCom ? "Atualizando..." : "Mudar nick Chess.com"}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={onLogout}
                  className="min-h-12 w-full rounded-2xl border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm font-bold text-rose-100 transition hover:border-rose-200/45 hover:bg-rose-300/15"
                >
                  {t("sidebar.logout")}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onLogout}
                className="min-h-12 rounded-2xl border border-purple-300/30 bg-purple-300/10 px-4 py-3 text-sm font-bold text-purple-100"
              >
                {t("sidebar.login")}
              </button>
            )}
          </div>
        </details>

        <div className="mt-6 grid gap-5">
          {drawerNavigationGroups.map((group, groupIndex) => (
            <div key={group.join("-")} className={groupIndex > 0 ? "border-t border-purple-300/14 pt-5" : ""}>
              <div className="grid gap-2">
                {group.map((label) => {
                  const item = getDrawerItem(label);
                  const isActive = activeNavigationLabel === item.label;

                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        onNavigate(item.target, item);
                        onClose();
                      }}
                      className={["mobile-drawer-link", isActive ? "is-active" : ""].join(" ")}
                    >
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.04] text-slate-400">
                        <NavIcon>{item.icon}</NavIcon>
                      </span>
                      <span className="flex-1 text-left">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

      </aside>
    </div>
  );
}

export default function MainLayout({
  activeItem,
  activePracticeExperience = "",
  onActiveItemChange,
  children,
  fullBleed = false,
  chessComAvatar = "",
  connectedUsername = "",
  isConnectingChessCom = false,
  connectError = "",
  connectSuccess = "",
  onConnectChessCom,
  onLogout,
}) {
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [tabletSidebarCollapsed, setTabletSidebarCollapsed] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const showMobileNavigation = isMobile || !fullBleed;

  useEffect(() => {
    if (!isMobile) {
      setMobileDrawerOpen(false);
    }
  }, [isMobile]);

  const sidebarCollapsed = isTablet && tabletSidebarCollapsed;
  const mainOffsetClass = useMemo(() => {
    if (fullBleed) return sidebarCollapsed ? "md:ml-20 lg:ml-72" : "md:ml-72";
    return sidebarCollapsed ? "md:ml-20 lg:ml-72" : "md:ml-72";
  }, [fullBleed, sidebarCollapsed]);
  const mainSpacingClass =
    fullBleed && !isMobile
      ? "min-h-screen overflow-hidden p-0"
      : fullBleed && isMobile
        ? "min-h-screen overflow-y-auto px-0 pb-24 pt-[76px]"
        : "overflow-y-auto px-4 pb-28 pt-20 sm:p-6 md:pb-6 md:pt-6 xl:p-8";
  const contentClass =
    fullBleed && !isMobile
      ? "astro-page-content min-h-screen"
      : fullBleed
        ? "astro-page-content"
        : "astro-page-content astro-page-transition";

  const handleMobileNavigate = (item, navigationItem = null) => {
    onActiveItemChange(item, {
      practiceExperience: navigationItem?.practiceExperience || "",
    });
    setMobileDrawerOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-[var(--astro-bg)] text-slate-100">
      {showMobileNavigation ? (
        <MobileHeader
          onOpenDrawer={() => setMobileDrawerOpen(true)}
          chessComAvatar={chessComAvatar}
        />
      ) : null}

      <Sidebar
        activeItem={activeItem}
        onActiveItemChange={onActiveItemChange}
        chessComAvatar={chessComAvatar}
        collapsed={sidebarCollapsed}
        collapsible={isTablet}
        onToggleCollapsed={() => setTabletSidebarCollapsed((current) => !current)}
      />

      <main
        className={[
          "astro-page-bg flex-1 transition-[margin] duration-300",
          mainOffsetClass,
          mainSpacingClass,
        ].join(" ")}
      >
        <div
          key={fullBleed ? "full-bleed-view" : activeItem}
          className={contentClass}
        >
          {children}
        </div>
      </main>

      {showMobileNavigation ? (
        <>
          <MobileBottomNavigation
            activeItem={activeItem}
            activePracticeExperience={activePracticeExperience}
            onNavigate={handleMobileNavigate}
          />
          <MobileDrawer
            open={mobileDrawerOpen}
            onClose={() => setMobileDrawerOpen(false)}
            activeItem={activeItem}
            activePracticeExperience={activePracticeExperience}
            onNavigate={handleMobileNavigate}
            connectedUsername={connectedUsername}
            isConnectingChessCom={isConnectingChessCom}
            connectError={connectError}
            connectSuccess={connectSuccess}
            onConnectChessCom={onConnectChessCom}
            onLogout={onLogout}
            chessComAvatar={chessComAvatar}
          />
        </>
      ) : null}
    </div>
  );
}
