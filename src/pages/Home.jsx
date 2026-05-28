import { useEffect, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext.jsx";
import { formatUnixDate, getCountryDisplay } from "../services/chessComApi.js";

const trainingFocus = [
  {
    titleKey: "home.focus.calculation.title",
    title: "Calculation",
    descriptionKey: "home.focus.calculation.description",
    description: "Sharpen forcing lines and reduce tactical oversights.",
  },
  {
    titleKey: "home.focus.endgames.title",
    title: "Endgames",
    descriptionKey: "home.focus.endgames.description",
    description: "Review rook endings and conversion technique.",
  },
  {
    titleKey: "home.focus.openings.title",
    title: "Opening review",
    descriptionKey: "home.focus.openings.description",
    description: "Patch early middlegame plans in your main repertoire.",
  },
];

const quickActions = [
  { key: "home.quickAnalyze", label: "Analyze games" },
  { key: "home.quickCoach", label: "Open AI Coach" },
  { key: "home.quickCalendar", label: "View calendar" },
];

function DashboardCard({ children, className = "" }) {
  return (
    <div
      className={`astro-card transition-all duration-200 ${className}`}
    >
      {children}
    </div>
  );
}

function UsernameField({
  username,
  onUsernameChange,
  onConnect,
  isConnecting,
  connectError,
  connectSuccess,
  buttonLabel,
}) {
  const { t } = useLanguage();

  return (
    <div className="mt-6 space-y-3">
      <label className="block text-sm font-medium text-slate-300" htmlFor="username">
        {t("home.chessUsername")}
      </label>
      <input
        id="username"
        type="text"
        value={username}
        onChange={(event) => onUsernameChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") onConnect(username);
        }}
        placeholder={t("home.usernamePlaceholder")}
        className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition duration-200 placeholder:text-slate-600 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/10"
      />
      {connectError && (
        <p className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {connectError}
        </p>
      )}
      {connectSuccess && !connectError ? (
        <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {connectSuccess}
        </p>
      ) : null}
      <button
        type="button"
        onClick={() => onConnect(username)}
        disabled={isConnecting}
        className="w-full rounded-xl bg-purple-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-950/30 transition duration-200 hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f16]"
      >
        {isConnecting ? t("home.savingUsername") : buttonLabel}
      </button>
    </div>
  );
}

function OnboardingCard({
  username,
  onUsernameChange,
  onConnect,
  isConnecting,
  connectError,
  connectSuccess,
}) {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <DashboardCard className="w-full max-w-md p-6">
        <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-300">
          <svg
            aria-hidden="true"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 21h8M9 17h6l1-8h-2.5L12 4 10.5 9H8l1 8Z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold text-white">
          {t("home.connectTitle")}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          {t("home.connectDescription")}
        </p>

        <UsernameField
          username={username}
          onUsernameChange={onUsernameChange}
          onConnect={onConnect}
          isConnecting={isConnecting}
          connectError={connectError}
          connectSuccess={connectSuccess}
          buttonLabel={t("home.saveAndConnect")}
        />
      </DashboardCard>
    </div>
  );
}

function RatingCard({ label, current, best, games }) {
  const { t } = useLanguage();

  return (
    <DashboardCard className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-3 h-1.5 w-10 rounded-full bg-purple-400 shadow-[0_0_14px_rgba(192,132,252,0.7)]" />
          <p className="text-sm font-medium text-slate-300">{label}</p>
        </div>
        <span className="grid h-9 w-9 place-items-center rounded-lg border border-purple-500/25 bg-purple-500/10 text-xs font-semibold text-purple-300">
          {label.charAt(0)}
        </span>
      </div>

      <div className="mt-5">
        <p className="text-3xl font-semibold leading-none text-white">{current}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-slate-950/50 p-3">
            <p className="text-xs text-slate-500">{t("home.best")}</p>
            <p className="mt-1 font-medium text-purple-300">{best}</p>
          </div>
          <div className="rounded-lg bg-slate-950/50 p-3">
            <p className="text-xs text-slate-500">{t("home.games")}</p>
            <p className="mt-1 font-medium text-slate-200">{games}</p>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}

function profileInitial(username) {
  return username?.charAt(0)?.toUpperCase() || "?";
}

export default function Home({
  connectedUsername,
  playerProfile,
  parsedStats,
  isConnecting,
  connectError,
  connectSuccess,
  onConnect,
  initialUsername,
}) {
  const { t } = useLanguage();
  const [username, setUsername] = useState("");

  useEffect(() => {
    setUsername(initialUsername || "");
  }, [initialUsername]);

  if (!playerProfile) {
    return (
      <OnboardingCard
        username={username}
        onUsernameChange={setUsername}
        onConnect={onConnect}
        isConnecting={isConnecting}
        connectError={connectError}
        connectSuccess={connectSuccess}
      />
    );
  }

  const ratings = [
    { label: "Bullet", ...parsedStats?.ratings?.bullet },
    { label: "Blitz", ...parsedStats?.ratings?.blitz },
    { label: "Rapid", ...parsedStats?.ratings?.rapid },
    { label: "Daily", ...parsedStats?.ratings?.daily },
  ];
  const totals = parsedStats?.totals || {};
  const stats = [
    { label: t("home.totalGames"), value: totals.totalGames ?? t("common.na") },
    { label: t("home.wins"), value: totals.wins ?? t("common.na") },
    { label: t("home.losses"), value: totals.losses ?? t("common.na") },
    { label: t("home.draws"), value: totals.draws ?? t("common.na") },
    { label: t("home.winRate"), value: totals.winRate ?? t("common.na") },
  ];
  const getRatingGames = (record = {}) =>
    (record.win || 0) + (record.loss || 0) + (record.draw || 0) || t("common.na");

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/10 via-white/[0.04] to-transparent p-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-purple-300">{t("home.personalDashboard")}</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">
            {t("home.welcomeBack", undefined, {
              name: playerProfile.username || connectedUsername,
            })}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            {t("home.connectedDescription")}
          </p>
        </div>

        <div className="rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-300">
          {t("home.chessConnected")}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.35fr]">
        <DashboardCard className="p-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-white">{t("home.connectionTitle")}</h2>
                <p className="mt-1 text-xs text-slate-500">
                  {t("home.connectionDescription")}
                </p>
              </div>
              <span className="rounded-full border border-purple-500/25 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
                {t("home.savedToProfile")}
              </span>
            </div>

            <UsernameField
              username={username}
              onUsernameChange={setUsername}
              onConnect={onConnect}
              isConnecting={isConnecting}
              connectError={connectError}
              connectSuccess={connectSuccess}
              buttonLabel={t("home.updateUsername")}
            />
          </div>

          <div className="flex items-center gap-4">
            {playerProfile.avatar ? (
              <img
                src={playerProfile.avatar}
                alt={`${playerProfile.username} avatar`}
                className="h-16 w-16 shrink-0 rounded-2xl object-cover"
              />
            ) : (
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-purple-300 to-fuchsia-400 text-xl font-bold text-slate-950">
                {profileInitial(playerProfile.username)}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-xl font-semibold text-white">
                {playerProfile.username || t("common.na")}
              </p>
              <p className="mt-1 text-sm text-purple-300">
                {playerProfile.status || t("common.na")}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {[
              [t("home.country"), getCountryDisplay(playerProfile.country)],
              [t("home.joined"), formatUnixDate(playerProfile.joined)],
              [t("home.lastOnline"), formatUnixDate(playerProfile.last_online)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  {label}
                </p>
                <p className="mt-2 break-words text-sm font-medium text-slate-200">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">{t("home.ratings")}</h2>
              <p className="mt-1 text-sm text-slate-500">{t("home.ratingsDescription")}</p>
            </div>
            <span className="rounded-full border border-purple-500/25 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
              {t("home.liveStats")}
            </span>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {ratings.map((rating) => (
              <RatingCard
                key={rating.label}
                label={rating.label}
                current={rating.current ?? t("common.na")}
                best={rating.best ?? t("common.na")}
                games={getRatingGames(rating.record)}
              />
            ))}
          </div>
        </DashboardCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
        <DashboardCard className="p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-white">{t("home.statsOverview")}</h2>
            <span className="text-xs text-slate-500">{t("home.chessRecords")}</span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-5">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-xl bg-slate-950/50 p-4">
                <p className="text-xs text-slate-500">{stat.label}</p>
                <p className="mt-2 text-xl font-semibold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard className="p-6">
          <h2 className="text-lg font-semibold text-white">{t("home.quickActions")}</h2>
          <div className="mt-5 grid gap-3">
            {quickActions.map((action) => (
              <button
                key={action.key}
                type="button"
                className="rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-left text-sm font-medium text-slate-300 transition duration-200 hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-purple-300"
              >
                {t(action.key, action.label)}
              </button>
            ))}
          </div>
        </DashboardCard>
      </div>

      <DashboardCard className="p-6">
        <h2 className="text-lg font-semibold text-white">{t("home.trainingFocus")}</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {trainingFocus.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-white/10 bg-slate-950/40 p-4 transition duration-200 hover:border-purple-500/30 hover:bg-purple-500/10"
            >
              <p className="font-medium text-white">{t(item.titleKey, item.title)}</p>
              <p className="mt-1 text-sm leading-6 text-slate-400">
                {t(item.descriptionKey, item.description)}
              </p>
            </div>
          ))}
        </div>
      </DashboardCard>
    </section>
  );
}
