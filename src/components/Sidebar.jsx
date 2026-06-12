import { useEffect, useMemo, useState } from "react";
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

const iconByLabel = Object.fromEntries(navigationItems.map((item) => [item.label, item.icon]));

const extraIcons = {
  Academy: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v16H7.5A2.5 2.5 0 0 0 5 21V5.5Zm0 0A2.5 2.5 0 0 1 7.5 8H19" />
  ),
  "Master Replay": (
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 4h8l-1 4h2.5L12 20 13 11h-3L8 4Z" />
  ),
  "Personal Replay": (
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 5.5h10M7 9h10M8 13h5m-7 7 2.5-4.5H17A2 2 0 0 0 19 13.5v-9A2 2 0 0 0 17 2.5H7A2 2 0 0 0 5 4.5v9A2 2 0 0 0 7 15.5h1.5L6 20Z" />
  ),
  "Pattern Forge": (
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18h12M8 18l1-6 3-7 3 7 1 6M9 12h6M5 21h14" />
  ),
};

export const practiceExperienceLabels = {
  academy: "Academy",
  "master-replay": "Master Replay",
  "personal-replay": "Personal Replay",
  "pattern-forge": "Pattern Forge",
};

export const journeyNavigation = [
  {
    type: "item",
    label: "Home",
    translationKey: "nav.home",
    target: "Home",
    icon: iconByLabel.Home,
  },
  {
    type: "item",
    label: "Games",
    translationKey: "nav.games",
    target: "Games",
    icon: iconByLabel.Games,
  },
  {
    type: "item",
    label: "Openings",
    translationKey: "nav.openings",
    target: "Openings",
    icon: iconByLabel.Openings,
  },
  {
    type: "group",
    id: "insights",
    label: "Insights",
    translationKey: "nav.insights",
    collapsible: true,
    icon: iconByLabel.Analysis,
    children: [
      {
        label: "Analysis",
        translationKey: "nav.analysis",
        target: "Analysis",
        icon: iconByLabel.Analysis,
      },
      {
        label: "AI Coach",
        translationKey: "nav.aiCoach",
        target: "AI Coach",
        icon: iconByLabel["AI Coach"],
      },
    ],
  },
  {
    type: "group",
    id: "training",
    label: "Training",
    translationKey: "nav.training",
    collapsible: true,
    icon: iconByLabel.Practice,
    children: [
      {
        label: "Academy",
        translationKey: "nav.academy",
        target: "Practice",
        practiceExperience: "academy",
        icon: extraIcons.Academy,
      },
      {
        label: "Master Replay",
        translationKey: "nav.masterReplay",
        target: "Practice",
        practiceExperience: "master-replay",
        icon: extraIcons["Master Replay"],
      },
      {
        label: "Personal Replay",
        translationKey: "nav.personalReplay",
        target: "Practice",
        practiceExperience: "personal-replay",
        icon: extraIcons["Personal Replay"],
      },
      {
        label: "Pattern Forge",
        translationKey: "nav.patternForge",
        target: "Practice",
        practiceExperience: "pattern-forge",
        icon: extraIcons["Pattern Forge"],
      },
    ],
  },
  {
    type: "item",
    label: "Calendar",
    translationKey: "nav.calendar",
    target: "Calendar",
    icon: iconByLabel.Calendar,
  },
];

export const mainNavigationItems = journeyNavigation.flatMap((entry) => {
  if (entry.type === "item") return [entry];
  return entry.children || [];
});

export function getNavigationLabelForState(activeItem, activePracticeExperience = "") {
  if (activeItem === "Practice" && activePracticeExperience) {
    return practiceExperienceLabels[activePracticeExperience] || "Practice";
  }
  return activeItem;
}

export function isNavigationChildActive(child, activeItem, activePracticeExperience = "") {
  if (child.target === "Practice") {
    return activeItem === "Practice" && child.practiceExperience === activePracticeExperience;
  }
  return activeItem === child.target || activeItem === child.label;
}

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

export function SidebarIcon({ children, className = "" }) {
  return <Icon>{children}</Icon>;
}

export default function Sidebar({
  activeItem,
  activePracticeExperience = "",
  onActiveItemChange,
  chessComAvatar = "",
  collapsed = false,
  collapsible = false,
  onToggleCollapsed,
}) {
  const { user, isAuthenticated, logout } = useAuth();
  const { language, setLanguage, supportedLanguages, t } = useLanguage();
  const activeGroupIds = useMemo(
    () =>
      journeyNavigation
        .filter((entry) =>
          entry.type === "group" &&
          ((entry.id === "training" && activeItem === "Practice") ||
            entry.children?.some((child) => isNavigationChildActive(child, activeItem, activePracticeExperience)))
        )
        .map((entry) => entry.id),
    [activeItem, activePracticeExperience]
  );
  const [expandedGroups, setExpandedGroups] = useState(() => ({
    insights: true,
    training: true,
  }));

  useEffect(() => {
    if (!activeGroupIds.length) return;
    setExpandedGroups((current) => {
      const next = { ...current };
      activeGroupIds.forEach((id) => {
        next[id] = true;
      });
      return next;
    });
  }, [activeGroupIds]);

  const navigate = (item) => {
    onActiveItemChange(item.target || item.label, {
      practiceExperience: item.practiceExperience || "",
    });
  };

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
    <aside
      className={[
        "fixed left-0 top-0 z-40 hidden h-screen shrink-0 flex-col overflow-y-auto overflow-x-hidden border-r border-purple-500/20 bg-[linear-gradient(180deg,#070711,#0d0b18_48%,#060610)] py-4 text-slate-300 shadow-xl shadow-black/30 transition-[width,padding] duration-300 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex",
        collapsed ? "w-20 px-2" : "w-72 px-3",
      ].join(" ")}
    >
      <div
        className={[
          "relative z-10 mb-6 flex items-center gap-3 px-2",
          collapsed ? "justify-center" : "",
        ].join(" ")}
      >
        <img
          src={brandLogoSrc}
          alt="astroChess logo"
          className={collapsed ? "h-12 w-12 shrink-0 object-contain" : "h-14 w-14 shrink-0 object-contain"}
        />

        <div className={collapsed ? "sr-only" : "min-w-0"}>
          <p className="bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-base font-semibold uppercase tracking-[0.18em] text-transparent">
            astroChess
          </p>
          <p className="text-xs text-slate-500">{t("sidebar.tagline")}</p>
        </div>

        {collapsible ? (
          <button
            type="button"
            onClick={onToggleCollapsed}
            className={[
              "grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-purple-300/20 bg-white/[0.04] text-slate-300 transition hover:border-purple-300/45 hover:text-white",
              collapsed ? "absolute -right-4 top-2" : "ml-auto",
            ].join(" ")}
            aria-label={collapsed ? "Expandir navegação" : "Recolher navegação"}
          >
            <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d={collapsed ? "m9 6 6 6-6 6" : "m15 6-6 6 6 6"} />
            </svg>
          </button>
        ) : null}
      </div>

      <nav className="relative z-10 flex flex-1 flex-col gap-2">
        {collapsed ? mainNavigationItems.map((item) => {
          const isActive = isNavigationChildActive(item, activeItem, activePracticeExperience);

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => navigate(item)}
              className={[
                "group relative flex w-full items-center justify-center rounded-lg border border-transparent px-2 py-3 text-sm font-medium transition-all duration-200",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080a0e]",
                isActive
                  ? "border-purple-400/40 bg-[linear-gradient(135deg,rgba(124,58,237,0.20),rgba(34,211,238,0.06))] text-purple-100 shadow-inner shadow-purple-950/20"
                  : "text-slate-400 hover:border-purple-500/20 hover:bg-purple-500/10 hover:text-purple-200",
              ].join(" ")}
              aria-current={isActive ? "page" : undefined}
              aria-label={t(item.translationKey, item.label)}
              title={t(item.translationKey, item.label)}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-purple-400 shadow-[0_0_12px_rgba(192,132,252,0.8)]" />
              )}
              <span
                className={[
                  "grid h-8 w-8 shrink-0 place-items-center rounded-md transition-colors duration-200",
                  isActive ? "bg-purple-500/15 text-cyan-100" : "bg-white/[0.03] text-slate-500 group-hover:text-purple-300",
                ].join(" ")}
              >
                <Icon>{item.icon}</Icon>
              </span>
              <span className="sr-only">{t(item.translationKey, item.label)}</span>
              <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg border border-purple-300/20 bg-[#090914] px-3 py-2 text-xs font-semibold text-slate-100 opacity-0 shadow-xl shadow-black/30 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                {t(item.translationKey, item.label)}
              </span>
            </button>
          );
        }) : journeyNavigation.map((entry) => {
          if (entry.type === "item") {
            const isActive = activeItem === entry.target;

            return (
              <button
                key={entry.label}
                type="button"
                onClick={() => navigate(entry)}
                className={[
                  "group relative flex w-full items-center rounded-lg border border-transparent text-sm font-medium transition-all duration-200",
                  collapsed ? "justify-center px-2 py-3" : "gap-3 px-3 py-2.5",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080a0e]",
                  isActive
                    ? "border-purple-400/40 bg-[linear-gradient(135deg,rgba(124,58,237,0.20),rgba(34,211,238,0.06))] text-purple-100 shadow-inner shadow-purple-950/20"
                    : "text-slate-400 hover:border-purple-500/20 hover:bg-purple-500/10 hover:text-purple-200",
                ].join(" ")}
                aria-current={isActive ? "page" : undefined}
                aria-label={t(entry.translationKey, entry.label)}
                title={collapsed ? t(entry.translationKey, entry.label) : undefined}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-purple-400 shadow-[0_0_12px_rgba(192,132,252,0.8)]" />
                )}
                <span
                  className={[
                    "grid h-8 w-8 shrink-0 place-items-center rounded-md transition-colors duration-200",
                    isActive ? "bg-purple-500/15 text-cyan-100" : "bg-white/[0.03] text-slate-500 group-hover:text-purple-300",
                  ].join(" ")}
                >
                  <Icon>{entry.icon}</Icon>
                </span>
                <span className={collapsed ? "sr-only" : "flex-1 text-left"}>{t(entry.translationKey, entry.label)}</span>
                {isActive && !collapsed ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-400 shadow-[0_0_12px_rgba(192,132,252,0.8)]" />
                ) : null}
                {collapsed ? (
                  <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 rounded-lg border border-purple-300/20 bg-[#090914] px-3 py-2 text-xs font-semibold text-slate-100 opacity-0 shadow-xl shadow-black/30 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                    {t(entry.translationKey, entry.label)}
                  </span>
                ) : null}
              </button>
            );
          }

          const isGroupActive =
            (entry.id === "training" && activeItem === "Practice") ||
            entry.children?.some((child) =>
              isNavigationChildActive(child, activeItem, activePracticeExperience)
            );
          const isExpanded = collapsed || !entry.collapsible || expandedGroups[entry.id] || isGroupActive;

          return (
            <div key={entry.id} className="grid gap-1">
              <button
                type="button"
                onClick={() => {
                  if (collapsed) return;
                  if (!entry.collapsible && entry.children?.length === 1) {
                    navigate(entry.children[0]);
                    return;
                  }
                  setExpandedGroups((current) => ({ ...current, [entry.id]: !current[entry.id] }));
                }}
                className={[
                  "group relative flex w-full items-center rounded-lg border text-sm font-semibold transition-all duration-200",
                  collapsed ? "justify-center px-2 py-3" : "gap-3 px-3 py-2.5",
                  isGroupActive
                    ? "border-purple-400/30 bg-purple-500/10 text-purple-100"
                    : "border-white/[0.04] bg-white/[0.025] text-slate-500 hover:border-purple-500/20 hover:bg-purple-500/10 hover:text-purple-200",
                ].join(" ")}
                aria-expanded={isExpanded}
                aria-label={t(entry.translationKey, entry.label)}
                title={collapsed ? t(entry.translationKey, entry.label) : undefined}
              >
                {isGroupActive && (
                  <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.75)]" />
                )}
                <span
                  className={[
                    "grid h-8 w-8 shrink-0 place-items-center rounded-md transition-colors duration-200",
                    isGroupActive ? "bg-purple-500/15 text-cyan-100" : "bg-white/[0.03] text-slate-500 group-hover:text-purple-300",
                  ].join(" ")}
                >
                  <Icon>{entry.icon}</Icon>
                </span>
                <span className={collapsed ? "sr-only" : "flex-1 text-left"}>{t(entry.translationKey, entry.label)}</span>
                {!collapsed ? (
                  <svg
                    aria-hidden="true"
                    className={["h-4 w-4 shrink-0 transition-transform duration-200", isExpanded ? "rotate-180" : ""].join(" ")}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
                  </svg>
                ) : (
                  <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 rounded-lg border border-purple-300/20 bg-[#090914] px-3 py-2 text-xs font-semibold text-slate-100 opacity-0 shadow-xl shadow-black/30 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                    {t(entry.translationKey, entry.label)}
                  </span>
                )}
              </button>

              <div
                className={[
                  "grid overflow-hidden transition-[grid-template-rows,opacity] duration-300",
                  isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                ].join(" ")}
              >
                <div className={["min-h-0 grid gap-1", collapsed ? "pt-1" : "border-l border-purple-300/12 py-1 pl-4 ml-4"].join(" ")}>
                  {entry.children?.map((child) => {
                    const isActive = isNavigationChildActive(child, activeItem, activePracticeExperience);

                    return (
                      <button
                        key={child.label}
                        type="button"
                        onClick={() => navigate(child)}
                        className={[
                          "group relative flex w-full items-center rounded-lg border border-transparent text-sm transition-all duration-200",
                          collapsed ? "justify-center px-2 py-2.5" : "gap-2.5 px-3 py-2",
                          isActive
                            ? "bg-[linear-gradient(135deg,rgba(124,58,237,0.18),rgba(34,211,238,0.06))] text-cyan-50"
                            : "text-slate-500 hover:bg-white/[0.04] hover:text-purple-200",
                        ].join(" ")}
                        aria-current={isActive ? "page" : undefined}
                        aria-label={t(child.translationKey, child.label)}
                        title={collapsed ? t(child.translationKey, child.label) : undefined}
                      >
                        <span
                          className={[
                            "grid shrink-0 place-items-center rounded-md transition-colors",
                            collapsed ? "h-8 w-8" : "h-7 w-7",
                            isActive ? "bg-cyan-300/10 text-cyan-100" : "bg-white/[0.025] text-slate-600 group-hover:text-purple-300",
                          ].join(" ")}
                        >
                          <Icon>{child.icon}</Icon>
                        </span>
                        <span className={collapsed ? "sr-only" : "flex-1 text-left text-[13px]"}>{t(child.translationKey, child.label)}</span>
                        {isActive && !collapsed ? <span className="h-1.5 w-1.5 rounded-full bg-cyan-200" /> : null}
                        {collapsed ? (
                          <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg border border-purple-300/20 bg-[#090914] px-3 py-2 text-xs font-semibold text-slate-100 opacity-0 shadow-xl shadow-black/30 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                            {t(child.translationKey, child.label)}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      <div className={collapsed ? "hidden" : "relative z-10 mt-4 rounded-xl border border-purple-500/20 bg-white/[0.04] p-2.5"}>
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
        <div className={collapsed ? "relative z-10 mt-4 grid place-items-center" : "relative z-10 mt-4 rounded-xl border border-purple-500/20 bg-white/[0.04] p-2.5"}>
          {collapsed ? (
            chessComAvatar ? (
              <img
                src={chessComAvatar}
                alt=""
                className="h-10 w-10 rounded-full border border-purple-300/30 object-cover shadow-[0_0_18px_rgba(168,85,247,0.18)]"
                title={userName}
              />
            ) : (
              <div
                className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-purple-300 to-fuchsia-400 text-sm font-bold text-slate-950"
                title={userName}
              >
                {userInitial}
              </div>
            )
          ) : (
            <>
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
            </>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={handleGoToLogin}
          className={[
            "group relative z-10 mt-4 flex w-full items-center justify-center rounded-xl border border-purple-500/40 bg-purple-500/15 p-2.5 text-sm font-semibold text-purple-200 transition-all duration-200 hover:border-purple-400 hover:bg-purple-500/30 hover:text-white",
            collapsed ? "h-11" : "",
          ].join(" ")}
          aria-label={t("sidebar.login")}
          title={collapsed ? t("sidebar.login") : undefined}
        >
          {collapsed ? (
            <Icon>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h4.5A1.5 1.5 0 0 1 21 4.5v15a1.5 1.5 0 0 1-1.5 1.5H15M10 17l5-5-5-5M15 12H3" />
            </Icon>
          ) : (
            t("sidebar.login")
          )}
        </button>
      )}
    </aside>
  );
}
