import { useMemo, useState } from "react";
import { useLanguage } from "../../../contexts/LanguageContext.jsx";
import { mockForgeLeaderboards } from "../../../data/mockPatternForge.js";

const periodOptions = [
  { id: "daily", labelKey: "patternForge.leaderboardDaily", fallback: "Daily" },
  { id: "monthly", labelKey: "patternForge.leaderboardMonthly", fallback: "Monthly" },
  { id: "allTime", labelKey: "patternForge.leaderboardAllTime", fallback: "All Time" },
];

const achievementMap = {
  puzzle_grinder: { label: "Puzzle Grinder", short: "PG", tone: "from-rose-300 to-purple-300" },
  daily_streak: { label: "Daily Streak", short: "DS", tone: "from-cyan-200 to-emerald-200" },
  pattern_master: { label: "Pattern Master", short: "PM", tone: "from-purple-300 to-cyan-200" },
  forge_veteran: { label: "Forge Veteran", short: "FV", tone: "from-amber-200 to-rose-300" },
};

function formatNumber(value) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(Number(value) || 0);
}

function getInitials(username = "") {
  return String(username)
    .split(/[\s_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "PF";
}

function ForgeAvatar({ player, size = "md", rank }) {
  const sizeClass = {
    sm: "h-10 w-10 text-xs",
    md: "h-12 w-12 text-sm",
    lg: "h-20 w-20 text-xl",
  }[size] || "h-12 w-12 text-sm";

  return (
    <div className={["relative grid shrink-0 place-items-center rounded-full", sizeClass].join(" ")}>
      <div
        className={[
          "absolute inset-0 rounded-full blur-md",
          rank === 1 ? "bg-cyan-300/30" : rank === 2 ? "bg-purple-300/24" : "bg-rose-300/22",
        ].join(" ")}
      />
      {player?.avatar ? (
        <img
          src={player.avatar}
          alt=""
          className="relative z-10 h-full w-full rounded-full border border-white/20 object-cover"
        />
      ) : (
        <div className="relative z-10 grid h-full w-full place-items-center rounded-full border border-white/20 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.28),transparent_34%),linear-gradient(135deg,rgba(168,85,247,0.92),rgba(34,211,238,0.72))] font-black text-slate-950">
          {getInitials(player?.username)}
        </div>
      )}
    </div>
  );
}

function AchievementDots({ achievements = [] }) {
  if (!achievements.length) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {achievements.slice(0, 4).map((achievement) => {
        const item = achievementMap[achievement] || { label: achievement, short: "A", tone: "from-slate-300 to-slate-500" };
        return (
          <span
            key={achievement}
            title={item.label}
            className={[
              "grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br text-[9px] font-black text-slate-950 shadow-[0_0_14px_rgba(168,85,247,0.18)]",
              item.tone,
            ].join(" ")}
          >
            {item.short}
          </span>
        );
      })}
    </div>
  );
}

function PodiumCard({ player, place, onSelect }) {
  const placeStyle = {
    1: "order-1 md:order-2 md:mt-0 border-cyan-200/34 bg-cyan-300/[0.075]",
    2: "order-2 md:order-1 md:mt-12 border-purple-200/28 bg-purple-300/[0.06]",
    3: "order-3 md:order-3 md:mt-16 border-rose-200/26 bg-rose-300/[0.055]",
  }[place];

  return (
    <button
      type="button"
      onClick={() => onSelect(player)}
      className={[
        "group min-w-0 rounded-[28px] border p-5 text-center transition hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(0,0,0,0.34)]",
        placeStyle,
      ].join(" ")}
    >
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">#{place}</p>
      <div className="mt-3 flex justify-center">
        <ForgeAvatar player={player} size={place === 1 ? "lg" : "md"} rank={place} />
      </div>
      <h3 className="mt-4 truncate text-lg font-bold text-white">{player.username}</h3>
      <p className="mt-1 text-2xl font-black text-cyan-100">{formatNumber(player.puzzlesSolved)}</p>
      <p className="text-xs uppercase tracking-[0.14em] text-slate-500">puzzles</p>
      <div className="mt-4 flex justify-center">
        <AchievementDots achievements={player.achievements} />
      </div>
    </button>
  );
}

function PlayerPreviewModal({ player, onClose }) {
  const { t } = useLanguage();
  if (!player) return null;

  return (
    <div className="fixed inset-0 z-[95] grid place-items-center bg-black/70 px-4 backdrop-blur-md" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 cursor-default" onClick={onClose} aria-label={t("common.close", "Close")} />
      <section className="relative w-full max-w-md rounded-[30px] border border-purple-300/24 bg-[linear-gradient(145deg,rgba(15,23,42,0.98),rgba(10,10,18,0.98))] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.5)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-slate-400 transition hover:text-white"
          aria-label={t("common.close", "Close")}
        >
          ×
        </button>
        <div className="flex items-center gap-4">
          <ForgeAvatar player={player} size="lg" rank={player.rank} />
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">
              {t("patternForge.playerPreview", "Forge profile")}
            </p>
            <h2 className="mt-1 truncate text-2xl font-bold text-white">{player.username}</h2>
            <p className="mt-1 text-sm text-slate-400">#{player.rank}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            [t("patternForge.leaderboardDaily", "Daily"), player.dailyPuzzles],
            [t("patternForge.leaderboardMonthly", "Monthly"), player.monthlyPuzzles],
            [t("patternForge.leaderboardAllTime", "All Time"), player.allTimePuzzles],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-center">
              <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">{label}</p>
              <p className="mt-1 text-lg font-bold text-white">{formatNumber(value)}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-purple-300/16 bg-purple-300/[0.06] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-purple-100">
            {t("patternForge.achievements", "Achievements")}
          </p>
          <div className="mt-3">
            <AchievementDots achievements={player.achievements} />
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ForgeLeaderboard({
  leaderboards = mockForgeLeaderboards,
  currentUserId = mockForgeLeaderboards.currentUserId,
  loading = false,
}) {
  const { t } = useLanguage();
  const [activePeriod, setActivePeriod] = useState("daily");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const rankings = leaderboards?.[activePeriod] || [];
  const podium = rankings.slice(0, 3);
  const rankingList = rankings.slice(3);
  const currentUser = useMemo(
    () => rankings.find((player) => player.id === currentUserId),
    [currentUserId, rankings]
  );

  return (
    <section className="grid gap-5">
      <div className="rounded-[30px] border border-purple-300/18 bg-[radial-gradient(circle_at_20%_0%,rgba(168,85,247,0.18),transparent_32%),linear-gradient(145deg,rgba(15,23,42,0.86),rgba(9,9,18,0.96))] p-5 shadow-[0_26px_80px_rgba(0,0,0,0.28)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">
              {t("patternForge.forgeRankingsEyebrow", "Forge Rankings")}
            </p>
            <h2 className="mt-2 break-words text-3xl font-black text-white">
              {t("patternForge.forgeRankingsTitle", "Forge Rankings")}
            </h2>
            <p className="mt-2 max-w-2xl break-words text-sm leading-6 text-slate-400">
              {loading
                ? t("patternForge.refreshingRankings", "Refreshing the latest forge rankings...")
                : t("patternForge.forgeRankingsSubtitle", "The smiths who forged the most patterns.")}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-black/20 p-1">
            {periodOptions.map((option) => {
              const isActive = activePeriod === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setActivePeriod(option.id)}
                  className={[
                    "min-h-11 rounded-xl px-3 text-sm font-bold transition",
                    isActive
                      ? "bg-purple-300 text-slate-950 shadow-[0_0_22px_rgba(168,85,247,0.28)]"
                      : "text-slate-400 hover:bg-white/[0.05] hover:text-white",
                  ].join(" ")}
                >
                  {t(option.labelKey, option.fallback)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 md:items-start">
        {podium.map((player) => (
          <PodiumCard key={player.id} player={player} place={player.rank} onSelect={setSelectedPlayer} />
        ))}
      </div>

      {currentUser ? (
        <button
          type="button"
          onClick={() => setSelectedPlayer(currentUser)}
          className="sticky top-3 z-10 rounded-[24px] border border-cyan-300/28 bg-[linear-gradient(135deg,rgba(34,211,238,0.12),rgba(168,85,247,0.10),rgba(15,23,42,0.92))] p-4 text-left shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl"
        >
          <div className="flex items-center gap-4">
            <ForgeAvatar player={currentUser} size="sm" rank={currentUser.rank} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">
                {t("patternForge.yourPosition", "Your Position")}
              </p>
              <p className="mt-1 truncate text-base font-bold text-white">
                #{currentUser.rank} · {currentUser.username}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-black text-white">{formatNumber(currentUser.puzzlesSolved)}</p>
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">puzzles</p>
            </div>
          </div>
        </button>
      ) : null}

      <div className="max-h-[520px] overflow-y-auto rounded-[30px] border border-white/10 bg-white/[0.035] p-3 [scrollbar-color:rgba(168,85,247,0.45)_rgba(255,255,255,0.05)] [scrollbar-width:thin]">
        <div className="grid gap-2">
          {rankingList.map((player) => (
            <button
              key={player.id}
              type="button"
              onClick={() => setSelectedPlayer(player)}
              className="grid min-h-16 grid-cols-[42px_48px_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-transparent bg-slate-950/35 px-3 py-2 text-left transition hover:border-purple-300/22 hover:bg-purple-300/[0.055]"
            >
              <span className="text-sm font-black text-slate-400">#{player.rank}</span>
              <ForgeAvatar player={player} size="sm" rank={player.rank} />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">{player.username}</p>
                <AchievementDots achievements={player.achievements} />
              </div>
              <div className="text-right">
                <p className="text-base font-black text-cyan-100">{formatNumber(player.puzzlesSolved)}</p>
                <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">puzzles</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <PlayerPreviewModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
    </section>
  );
}
