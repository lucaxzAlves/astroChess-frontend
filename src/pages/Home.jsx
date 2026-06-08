import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext.jsx";
import {
  formatUnixDate,
  getCountryDisplay,
  parseChessComGame,
} from "../services/chessComApi.js";

const solarNavigationItems = [
  {
    id: "games",
    label: "Games",
    planetName: "Game Archive",
    description: "Revise suas batalhas recentes e abra reviews rapidamente.",
    targetPage: "Games",
    color: "#a855f7",
    glow: "rgba(168,85,247,0.45)",
    orbitRadius: "220px",
    orbitAngle: "178deg",
    orbitCounterAngle: "-178deg",
    orbitCounterEndAngle: "-538deg",
    orbitDuration: "52s",
    orbitDelay: "-8s",
  },
  {
    id: "analysis",
    label: "Analysis",
    planetName: "Analysis Observatory",
    description: "Decodifique forças, fraquezas e bloqueadores de evolução.",
    targetPage: "Analysis",
    color: "#22d3ee",
    glow: "rgba(34,211,238,0.42)",
    orbitRadius: "160px",
    orbitAngle: "238deg",
    orbitCounterAngle: "-238deg",
    orbitCounterEndAngle: "-598deg",
    orbitDuration: "42s",
    orbitDelay: "-14s",
  },
  {
    id: "openings",
    label: "Openings",
    planetName: "Opening Observatory",
    description: "Explore seu repertório pessoal a partir das partidas analisadas.",
    targetPage: "Openings",
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.38)",
    orbitRadius: "198px",
    orbitAngle: "274deg",
    orbitCounterAngle: "-274deg",
    orbitCounterEndAngle: "-634deg",
    orbitDuration: "50s",
    orbitDelay: "-18s",
  },
  {
    id: "practice",
    label: "Practice",
    planetName: "Training Planet",
    description: "Treine com Academy, replays e ciclos de Pattern Forge.",
    targetPage: "Practice",
    color: "#7c3aed",
    glow: "rgba(124,58,237,0.45)",
    orbitRadius: "190px",
    orbitAngle: "334deg",
    orbitCounterAngle: "-334deg",
    orbitCounterEndAngle: "-694deg",
    orbitDuration: "48s",
    orbitDelay: "-20s",
  },
  {
    id: "coach",
    label: "AI Coach",
    planetName: "Coach Core",
    description: "Receba planos de treino personalizados pelo seu perfil.",
    targetPage: "AI Coach",
    color: "#ec4899",
    glow: "rgba(236,72,153,0.38)",
    orbitRadius: "240px",
    orbitAngle: "14deg",
    orbitCounterAngle: "-14deg",
    orbitCounterEndAngle: "-374deg",
    orbitDuration: "58s",
    orbitDelay: "-28s",
  },
  {
    id: "calendar",
    label: "Calendar",
    planetName: "Tournament Orbit",
    description: "Encontre eventos e torneios relevantes para competir.",
    targetPage: "Calendar",
    color: "#60a5fa",
    glow: "rgba(96,165,250,0.38)",
    orbitRadius: "250px",
    orbitAngle: "104deg",
    orbitCounterAngle: "-104deg",
    orbitCounterEndAngle: "-464deg",
    orbitDuration: "62s",
    orbitDelay: "-38s",
  },
];

const skillLabels = {
  calculation: "Cálculo",
  positionalUnderstanding: "Compreensão posicional",
  openings: "Aberturas",
  tacticalThemes: "Temas táticos",
  endgames: "Finais",
  middlegame: "Meio-jogo",
  timeManagement: "Gestão do tempo",
  psychologicalResilience: "Resiliência psicológica",
};

const missionCards = [
  {
    title: "Analisar jogos recentes",
    description: "Gere novas evidências para o Skill Matrix e para o AI Coach.",
    priority: "Alta",
    time: "10-20 min",
    targetPage: "AI Coach",
  },
  {
    title: "Continuar Pattern Forge",
    description: "Retome ciclos de repetição e fortaleça reconhecimento de padrões.",
    priority: "Treino",
    time: "15 min",
    targetPage: "Practice",
  },
  {
    title: "Revisar momentos críticos",
    description: "Abra seus jogos e transforme erros recentes em material de treino.",
    priority: "Foco",
    time: "12 min",
    targetPage: "Games",
  },
  {
    title: "Checar torneios",
    description: "Veja eventos próximos e planeje sua próxima missão competitiva.",
    priority: "Agenda",
    time: "3 min",
    targetPage: "Calendar",
  },
];

function DashboardCard({ children, className = "" }) {
  return <div className={`astro-card transition-all duration-200 ${className}`}>{children}</div>;
}

function profileInitial(username) {
  return username?.charAt(0)?.toUpperCase() || "?";
}

function clampScore(value) {
  return Math.max(0, Math.min(100, Number(value) || 0));
}

function getSkillStatus(score) {
  if (score >= 80) return "Órbita estável";
  if (score >= 65) return "Em ascensão";
  if (score >= 50) return "Instável";
  return "Deriva crítica";
}

function getSkillEntries(skillMap = {}) {
  return Object.entries(skillMap)
    .filter(([key, value]) => key !== "overallScore" && value && typeof value === "object")
    .map(([key, value]) => ({
      key,
      label: skillLabels[key] || key.replace(/([A-Z])/g, " $1"),
      value: clampScore(value.value ?? value.score),
      description: value.description,
      confidence: value.confidence,
    }));
}

function getRatingGames(record = {}, fallback) {
  const total = (record.win || 0) + (record.loss || 0) + (record.draw || 0);
  return total || fallback;
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
    <div className="space-y-3">
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
      {connectError ? (
        <p className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {connectError}
        </p>
      ) : null}
      {connectSuccess && !connectError ? (
        <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {connectSuccess}
        </p>
      ) : null}
      <button
        type="button"
        onClick={() => onConnect(username)}
        disabled={isConnecting}
        className="astro-button-primary w-full rounded-xl px-4 py-3 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f16]"
      >
        {isConnecting ? t("home.savingUsername") : buttonLabel}
      </button>
    </div>
  );
}

function OnboardingCommandCenter({
  username,
  onUsernameChange,
  onConnect,
  isConnecting,
  connectError,
  connectSuccess,
}) {
  const { t } = useLanguage();

  return (
    <section className="mx-auto w-full max-w-6xl pt-0 sm:pt-2 lg:pt-8">
      <div className="relative overflow-hidden rounded-[28px] border border-purple-300/20 bg-[linear-gradient(145deg,rgba(15,15,28,0.96),rgba(8,10,18,0.98))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] sm:p-7 lg:p-9">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-purple-500/16 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative grid w-full gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)] lg:items-center xl:gap-10">
          <div className="max-w-xl text-left">
            <p className="astro-eyebrow">Astro Chess</p>
            <h1 className="mt-4 max-w-[32rem] text-3xl font-semibold leading-[1.08] text-white sm:text-4xl xl:text-5xl">
              Conecte sua conta Chess.com ao centro de comando
            </h1>
            <p className="mt-5 max-w-[32rem] text-sm leading-7 text-slate-300 sm:text-base">
              Navegue por jogos, análise, treino, AI Coach e torneios a partir do seu universo pessoal de xadrez.
            </p>

            <div className="mt-6 grid max-w-[32rem] gap-3 sm:grid-cols-3">
              {["Perfil real", "Dados vivos", "Treino personalizado"].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm font-medium text-slate-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="w-full max-w-md rounded-[26px] border border-purple-300/20 bg-slate-950/55 p-5 shadow-[0_20px_54px_rgba(0,0,0,0.24)] sm:p-6 lg:ml-auto">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-purple-300/25 bg-purple-300/[0.08] text-purple-100">
                ♛
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-semibold text-white">{t("home.connectTitle")}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">{t("home.connectDescription")}</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/45 p-4">
              <UsernameField
                username={username}
                onUsernameChange={onUsernameChange}
                onConnect={onConnect}
                isConnecting={isConnecting}
                connectError={connectError}
                connectSuccess={connectSuccess}
                buttonLabel={t("home.saveAndConnect")}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CosmicHero({ playerProfile, connectedUsername, ratings, onNavigate }) {
  const bestRating = ratings
    .map((rating) => Number(rating.current || 0))
    .filter(Boolean)
    .sort((a, b) => b - a)[0];

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-purple-300/22 bg-[linear-gradient(180deg,rgba(18,18,31,0.94),rgba(8,8,17,0.98))] p-6 shadow-[0_12px_28px_rgba(0,0,0,0.24)] sm:p-8">
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-purple-300/70 to-transparent" />
      <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="max-w-3xl">
          <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-purple-300/25 bg-slate-950/55 px-3 py-2 shadow-[0_0_24px_rgba(168,85,247,0.12)]">
            <span className="h-2 w-2 rounded-full bg-cyan-200 shadow-[0_0_14px_rgba(34,211,238,0.8)]" />
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-100">
              Astro Command Center
            </span>
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/[0.08] px-2.5 py-0.5 text-[11px] font-semibold text-cyan-100">
              Chess.com conectado
            </span>
          </div>
          <h1 className="mt-4 text-4xl font-semibold text-white sm:text-6xl">
            Bem-vindo de volta, {playerProfile.username || connectedUsername}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Navegue por jogos, treino, análise, torneios e seu plano de evolução a
            partir do seu universo pessoal de xadrez.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onNavigate?.("AI Coach")}
              className="astro-button-primary rounded-xl px-5 py-3 text-sm font-semibold transition"
            >
              Abrir AI Coach
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.("Practice")}
              className="astro-button-secondary rounded-xl px-5 py-3 text-sm font-semibold transition"
            >
              Ir para Practice
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <HeroSignal label="Rating principal" value={bestRating || "N/A"} />
          <HeroSignal label="País" value={getCountryDisplay(playerProfile.country)} />
          <HeroSignal label="Entrou em" value={formatUnixDate(playerProfile.joined)} />
        </div>
      </div>
    </section>
  );
}

function HeroSignal({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function SolarSystemNavigation({ onNavigate }) {
  const [hoveredPlanet, setHoveredPlanet] = useState(solarNavigationItems[0]);
  const activePlanet = hoveredPlanet || solarNavigationItems[0];

  return (
    <DashboardCard className="overflow-hidden p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="astro-eyebrow">Astro Map</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Navigation System</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Cada planeta abre uma área principal da plataforma. Passe o mouse para
            inspecionar a órbita ou clique para navegar.
          </p>
        </div>
        <div className="rounded-full border border-purple-300/20 bg-purple-300/[0.08] px-3 py-1 text-xs font-semibold text-purple-100">
          Sistema ativo
        </div>
      </div>

      <div className="mt-6 hidden lg:block">
        <div className="astro-solar-stage">
          <div className="astro-solar-ring astro-solar-ring-one" />
          <div className="astro-solar-ring astro-solar-ring-two" />
          <div className="astro-solar-ring astro-solar-ring-three" />
          <button
            type="button"
            onClick={() => onNavigate?.("Home")}
            className="astro-central-star"
            aria-label="Home"
          >
            <span>Astro</span>
          </button>

          {solarNavigationItems.map((item) => (
            <span
              key={item.id}
              className="astro-planet-orbit"
              style={{
                "--planet-color": item.color,
                "--planet-glow": item.glow,
                "--orbit-radius": item.orbitRadius,
                "--orbit-angle": item.orbitAngle,
                "--orbit-counter-angle": item.orbitCounterAngle,
                "--orbit-counter-end-angle": item.orbitCounterEndAngle,
                "--orbit-duration": item.orbitDuration,
                "--orbit-delay": item.orbitDelay,
              }}
            >
              <button
                type="button"
                onClick={() => onNavigate?.(item.targetPage)}
                onMouseEnter={() => setHoveredPlanet(item)}
                onFocus={() => setHoveredPlanet(item)}
                className="astro-planet"
              >
                <span className="astro-planet-core" />
                <span className="astro-planet-label">{item.label}</span>
              </button>
            </span>
          ))}

          <div className="astro-planet-info">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/80">
              {activePlanet.label}
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-white">{activePlanet.planetName}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">{activePlanet.description}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 lg:hidden">
        {solarNavigationItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate?.(item.targetPage)}
            className="rounded-2xl border border-purple-300/18 bg-slate-950/45 p-4 text-left transition hover:border-purple-300/38"
          >
            <div className="flex items-center gap-3">
              <span
                className="h-5 w-5 rounded-full shadow-[0_0_18px_var(--planet-glow)]"
                style={{ background: item.color, "--planet-glow": item.glow }}
              />
              <div>
                <p className="font-semibold text-white">{item.planetName}</p>
                <p className="mt-1 text-sm leading-5 text-slate-400">{item.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </DashboardCard>
  );
}

function PlayerSignalCard({
  playerProfile,
  username,
  onUsernameChange,
  onConnect,
  isConnecting,
  connectError,
  connectSuccess,
}) {
  const { t } = useLanguage();

  return (
    <DashboardCard className="p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="astro-eyebrow">Player Signal</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Player Profile</h2>
        </div>
        <span className="rounded-full border border-emerald-300/25 bg-emerald-300/[0.08] px-3 py-1 text-xs font-semibold text-emerald-100">
          Online signal
        </span>
      </div>

      <div className="mt-6 flex items-center gap-4">
        {playerProfile.avatar ? (
          <img
            src={playerProfile.avatar}
            alt={`${playerProfile.username} avatar`}
            className="h-20 w-20 shrink-0 rounded-[24px] border border-white/10 object-cover"
          />
        ) : (
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-[24px] border border-purple-300/25 bg-gradient-to-br from-purple-300 to-fuchsia-400 text-2xl font-bold text-slate-950">
            {profileInitial(playerProfile.username)}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-2xl font-semibold text-white">
            {playerProfile.username || t("common.na")}
          </p>
          <p className="mt-1 text-sm text-purple-200">{playerProfile.status || t("common.na")}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          ["País", getCountryDisplay(playerProfile.country)],
          ["Criado em", formatUnixDate(playerProfile.joined)],
          ["Último acesso", formatUnixDate(playerProfile.last_online)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
            <p className="mt-2 break-words text-sm font-medium text-slate-200">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
        <p className="text-sm font-semibold text-white">Atualizar sinal Chess.com</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Troque o username conectado sem sair do centro de comando.
        </p>
        <div className="mt-4">
          <UsernameField
            username={username}
            onUsernameChange={onUsernameChange}
            onConnect={onConnect}
            isConnecting={isConnecting}
            connectError={connectError}
            connectSuccess={connectSuccess}
            buttonLabel="Atualizar conexão"
          />
        </div>
      </div>
    </DashboardCard>
  );
}

function RatingOrbitCard({ ratings }) {
  const { t } = useLanguage();

  return (
    <DashboardCard className="p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="astro-eyebrow">Rating Satellites</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Ratings</h2>
        </div>
        <span className="rounded-full border border-purple-300/20 bg-purple-300/[0.08] px-3 py-1 text-xs font-semibold text-purple-100">
          Live stats
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {ratings.map((rating) => (
          <div key={rating.label} className="rounded-[24px] border border-white/10 bg-slate-950/45 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">{rating.label}</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {rating.current ?? t("common.na")}
                </p>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-full border border-cyan-300/20 bg-cyan-300/[0.08] text-sm font-semibold text-cyan-100">
                {rating.label.charAt(0)}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-slate-950/55 p-3">
                <p className="text-xs text-slate-500">Melhor</p>
                <p className="mt-1 font-medium text-purple-200">{rating.best ?? t("common.na")}</p>
              </div>
              <div className="rounded-xl bg-slate-950/55 p-3">
                <p className="text-xs text-slate-500">Jogos</p>
                <p className="mt-1 font-medium text-slate-200">
                  {getRatingGames(rating.record, t("common.na"))}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}

function MobilePlayerHero({ playerProfile, connectedUsername, ratings }) {
  const bestRating = ratings
    .map((rating) => Number(rating.current || 0))
    .filter(Boolean)
    .sort((a, b) => b - a)[0];
  const displayName = playerProfile.name || playerProfile.username || connectedUsername;

  return (
    <DashboardCard className="overflow-hidden p-5">
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/60 to-transparent" />
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-[30px] bg-purple-400/20 blur-2xl" />
          {playerProfile.avatar ? (
            <img
              src={playerProfile.avatar}
              alt={`${playerProfile.username} avatar`}
              className="relative h-24 w-24 rounded-[30px] border border-purple-200/25 object-cover shadow-[0_18px_44px_rgba(0,0,0,0.38)]"
            />
          ) : (
            <div className="relative grid h-24 w-24 place-items-center rounded-[30px] border border-purple-200/25 bg-gradient-to-br from-purple-300 to-cyan-200 text-3xl font-bold text-slate-950 shadow-[0_18px_44px_rgba(0,0,0,0.38)]">
              {profileInitial(playerProfile.username)}
            </div>
          )}
        </div>

        <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-cyan-100">
          Player Signal
        </p>
        <h1 className="mt-2 max-w-full break-words text-3xl font-semibold leading-tight text-white">
          {playerProfile.username || connectedUsername}
        </h1>
        {displayName && displayName !== playerProfile.username ? (
          <p className="mt-1 text-sm text-slate-400">{displayName}</p>
        ) : null}

        <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
          <span className="rounded-full border border-purple-300/20 bg-purple-300/[0.08] px-3 py-1.5 font-semibold text-purple-100">
            {getCountryDisplay(playerProfile.country)}
          </span>
          <span className="rounded-full border border-cyan-300/20 bg-cyan-300/[0.08] px-3 py-1.5 font-semibold text-cyan-100">
            {playerProfile.status || "Chess.com"}
          </span>
        </div>

        <div className="mt-5 grid w-full grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
            <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Rating</p>
            <p className="mt-1 text-2xl font-semibold text-white">{bestRating || "N/A"}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
            <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Desde</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-white">{formatUnixDate(playerProfile.joined)}</p>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}

function MobileRatingsCarousel({ ratings }) {
  const { t } = useLanguage();
  const carouselRatings = [...ratings, ...ratings];

  return (
    <section className="min-w-0">
      <div className="mb-3 flex items-end justify-between gap-3 px-1">
        <div>
          <p className="astro-eyebrow">Ratings</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Satélites de força</h2>
        </div>
        <span className="text-xs font-medium text-slate-500">carrossel</span>
      </div>
      <div className="mobile-home-carousel mobile-home-auto-carousel overflow-x-auto pb-2">
        <div className="mobile-home-carousel-track flex w-max snap-x gap-3">
        {carouselRatings.map((rating, index) => (
          <article
            key={`${rating.label}-${index}`}
            className="w-[min(72vw,320px)] snap-start rounded-[24px] border border-purple-300/18 bg-[linear-gradient(180deg,rgba(18,18,31,0.92),rgba(8,8,17,0.98))] p-4 shadow-[0_12px_28px_rgba(0,0,0,0.22)]"
            aria-hidden={index >= ratings.length}
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-white">{rating.label}</p>
              <span className="grid h-9 w-9 place-items-center rounded-full border border-cyan-300/20 bg-cyan-300/[0.08] text-xs font-bold text-cyan-100">
                {rating.label.charAt(0)}
              </span>
            </div>
            <p className="mt-4 text-4xl font-semibold text-white">{rating.current ?? t("common.na")}</p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-slate-950/55 p-3">
                <p className="text-slate-500">Melhor</p>
                <p className="mt-1 font-semibold text-purple-100">{rating.best ?? t("common.na")}</p>
              </div>
              <div className="rounded-xl bg-slate-950/55 p-3">
                <p className="text-slate-500">Jogos</p>
                <p className="mt-1 font-semibold text-slate-100">{getRatingGames(rating.record, t("common.na"))}</p>
              </div>
            </div>
          </article>
        ))}
        </div>
      </div>
    </section>
  );
}

function MobileSkillMatrix({ analysisProfile, onNavigate }) {
  const skillEntries = getSkillEntries(analysisProfile?.skillMap);

  if (!skillEntries.length) {
    return (
      <DashboardCard className="p-5">
        <p className="astro-eyebrow">Skill Matrix</p>
        <h2 className="mt-2 text-xl font-semibold text-white">Skill Matrix bloqueado</h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Rode uma análise geral para liberar seu mapa de habilidades no mobile.
        </p>
        <button
          type="button"
          onClick={() => onNavigate?.("AI Coach")}
          className="astro-button-secondary mt-5 min-h-11 w-full rounded-xl px-4 py-3 text-sm font-semibold"
        >
          Criar meu perfil
        </button>
      </DashboardCard>
    );
  }

  const sortedSkills = [...skillEntries].sort((a, b) => b.value - a.value);
  const topStrengths = sortedSkills.slice(0, 2);
  const needsWork = sortedSkills.slice(-2).reverse();

  return (
    <DashboardCard className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="astro-eyebrow">Skill Matrix</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Diagnóstico rápido</h2>
        </div>
        <button
          type="button"
          onClick={() => onNavigate?.("Analysis")}
          className="rounded-full border border-purple-300/24 bg-purple-300/[0.08] px-3 py-2 text-xs font-semibold text-purple-100"
        >
          Abrir
        </button>
      </div>

      <div className="mt-5 grid gap-4">
        <SkillConstellationChart
          skills={skillEntries}
          overallScore={analysisProfile?.skillMap?.overallScore ?? Math.round(skillEntries.reduce((sum, skill) => sum + skill.value, 0) / skillEntries.length)}
          compact
        />

        <div className="grid gap-3">
          <MobileSkillGroup title="Top Strengths" skills={topStrengths} tone="cyan" />
          <MobileSkillGroup title="Needs Improvement" skills={needsWork} tone="purple" />
        </div>
      </div>
    </DashboardCard>
  );
}

function MobileSkillGroup({ title, skills, tone }) {
  const barClass = tone === "cyan" ? "from-cyan-200 to-purple-300" : "from-purple-300 to-pink-300";

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <div className="mt-3 grid gap-3">
        {skills.map((skill) => (
          <div key={skill.key}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="min-w-0 truncate text-slate-200">{skill.label}</span>
              <span className="font-semibold text-white">{skill.value}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div className={`h-full rounded-full bg-gradient-to-r ${barClass}`} style={{ width: `${skill.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MobileOrbitCarousel({ onNavigate }) {
  const carouselItems = [...solarNavigationItems, ...solarNavigationItems];

  return (
    <section className="min-w-0">
      <div className="mb-3 flex items-end justify-between gap-3 px-1">
        <div>
          <p className="astro-eyebrow">Astro Map</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Navegação rápida</h2>
        </div>
        <span className="text-xs font-medium text-slate-500">carrossel</span>
      </div>
      <div className="mobile-home-carousel mobile-home-auto-carousel overflow-x-auto pb-2">
        <div className="mobile-home-carousel-track flex w-max snap-x gap-3">
        {carouselItems.map((item, index) => (
          <button
            key={`${item.id}-${index}`}
            type="button"
            onClick={() => onNavigate?.(item.targetPage)}
            className="min-h-[150px] w-[min(68vw,300px)] snap-start rounded-[26px] border border-purple-300/18 bg-slate-950/48 p-4 text-left transition active:scale-[0.985]"
            aria-hidden={index >= solarNavigationItems.length}
            tabIndex={index >= solarNavigationItems.length ? -1 : 0}
          >
            <span
              className="relative grid h-14 w-14 place-items-center rounded-full border border-white/10 shadow-[0_0_22px_var(--planet-glow)]"
              style={{
                background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.48), ${item.color} 34%, rgba(7,7,17,0.88) 78%)`,
                "--planet-glow": item.glow,
              }}
            >
              <span className="absolute inset-2 rounded-full border border-white/20 opacity-50" />
            </span>
            <p className="mt-4 font-semibold text-white">{item.planetName}</p>
            <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-400">{item.description}</p>
          </button>
        ))}
        </div>
      </div>
    </section>
  );
}

function MobileQuickLaunch({ onNavigate }) {
  const actions = [
    { label: "Analyze Games", targetPage: "AI Coach" },
    { label: "Continue Training", targetPage: "Practice" },
    { label: "Open AI Coach", targetPage: "AI Coach" },
    { label: "Browse Academy", targetPage: "Practice" },
  ];

  return (
    <DashboardCard className="p-5">
      <p className="astro-eyebrow">Quick Launch</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => onNavigate?.(action.targetPage)}
            className="min-h-12 rounded-2xl border border-purple-300/20 bg-purple-300/[0.08] px-3 py-3 text-sm font-semibold text-purple-50 transition active:scale-[0.985]"
          >
            {action.label}
          </button>
        ))}
      </div>
    </DashboardCard>
  );
}

function SkillConstellationChart({ skills, overallScore, compact = false }) {
  const visibleSkills = skills.slice(0, 8);
  const center = 50;
  const maxRadius = compact ? 30 : 34;
  const labelRadius = compact ? 39 : 44;
  const points = visibleSkills.map((skill, index) => {
    const angle = -90 + (360 / visibleSkills.length) * index;
    const radians = (angle * Math.PI) / 180;
    const radius = 7 + (skill.value / 100) * maxRadius;
    const labelX = center + labelRadius * Math.cos(radians);
    const labelY = center + labelRadius * Math.sin(radians);

    return {
      ...skill,
      x: center + radius * Math.cos(radians),
      y: center + radius * Math.sin(radians),
      axisX: center + maxRadius * Math.cos(radians),
      axisY: center + maxRadius * Math.sin(radians),
      labelX,
      labelY,
    };
  });
  const polygonPoints = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <div className={`rounded-[28px] border border-purple-300/20 bg-slate-950/45 ${compact ? "p-2.5" : "p-4"}`}>
      <div className={`relative mx-auto aspect-square w-full ${compact ? "max-w-[320px]" : "max-w-[440px]"}`}>
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full overflow-visible"
          role="img"
          aria-label={`Skill Matrix com pontuação geral ${overallScore}`}
        >
          <defs>
            <radialGradient id="skillConstellationGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(34,211,238,0.28)" />
              <stop offset="60%" stopColor="rgba(168,85,247,0.12)" />
              <stop offset="100%" stopColor="rgba(168,85,247,0)" />
            </radialGradient>
            <linearGradient id="skillConstellationFill" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(34,211,238,0.34)" />
              <stop offset="55%" stopColor="rgba(168,85,247,0.28)" />
              <stop offset="100%" stopColor="rgba(236,72,153,0.16)" />
            </linearGradient>
          </defs>

          <circle cx="50" cy="50" r="43" fill="url(#skillConstellationGlow)" />
          {[12, 23, 34].map((radius) => (
            <circle
              key={radius}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="rgba(148,163,184,0.18)"
              strokeWidth="0.45"
            />
          ))}

          {points.map((point) => (
            <line
              key={`${point.key}-axis`}
              x1="50"
              y1="50"
              x2={point.axisX}
              y2={point.axisY}
              stroke="rgba(168,85,247,0.22)"
              strokeWidth="0.45"
            />
          ))}

          <polygon
            points={polygonPoints}
            fill="url(#skillConstellationFill)"
            stroke="rgba(34,211,238,0.78)"
            strokeWidth="0.9"
            strokeLinejoin="round"
          />

          {points.map((point) => (
            <g key={point.key}>
              <circle cx={point.x} cy={point.y} r="1.9" fill="#e9d5ff" />
              <circle
                cx={point.x}
                cy={point.y}
                r="3.8"
                fill="none"
                stroke="rgba(34,211,238,0.4)"
                strokeWidth="0.5"
              />
            </g>
          ))}
        </svg>

        <div className="pointer-events-none absolute inset-0">
          {points.map((point) => (
            <div
              key={`${point.key}-label`}
              className={`absolute -translate-x-1/2 -translate-y-1/2 text-center ${compact ? "w-16" : "w-24"}`}
              style={{ left: `${point.labelX}%`, top: `${point.labelY}%` }}
            >
              <p className={`${compact ? "text-[9px]" : "text-[11px]"} truncate font-semibold text-slate-200`}>{point.label}</p>
              <p className={`${compact ? "text-[9px]" : "text-[10px]"} text-purple-200`}>{point.value}</p>
            </div>
          ))}
        </div>

        <div className={`absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-purple-300/30 bg-[#070711]/90 text-center shadow-[0_0_26px_rgba(168,85,247,0.22)] ${compact ? "h-14 w-14" : "h-[4.5rem] w-[4.5rem]"}`}>
          <div>
            <p className={`${compact ? "text-[7px]" : "text-[8px]"} font-bold uppercase tracking-[0.14em] text-cyan-100`}>Score</p>
            <p className={`mt-0.5 font-semibold text-white ${compact ? "text-lg" : "text-2xl"}`}>{overallScore}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function HomeSkillMatrixPreview({ analysisProfile, onNavigate }) {
  const skillEntries = getSkillEntries(analysisProfile?.skillMap);
  const overallScore =
    analysisProfile?.skillMap?.overallScore ??
    Math.round(skillEntries.reduce((sum, skill) => sum + skill.value, 0) / (skillEntries.length || 1));

  if (!skillEntries.length) {
    return (
      <DashboardCard className="p-6">
        <p className="astro-eyebrow">Skill Matrix</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Skill Matrix bloqueado</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
          Rode uma análise geral no AI Coach para gerar seu perfil de xadrez e liberar
          o mapa compacto de habilidades na Home.
        </p>
        <button
          type="button"
          onClick={() => onNavigate?.("AI Coach")}
          className="astro-button-secondary mt-5 rounded-xl px-5 py-3 text-sm font-semibold transition"
        >
          Criar meu perfil
        </button>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard className="p-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="astro-eyebrow">Skill Matrix</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Preview diagnóstico</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Seu perfil atual mapeado a partir das partidas analisadas.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate?.("Analysis")}
          className="astro-button-secondary rounded-xl px-4 py-2.5 text-sm font-semibold transition"
        >
          Ver análise completa
        </button>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(360px,0.95fr)_1.05fr] xl:items-center">
        <SkillConstellationChart skills={skillEntries} overallScore={overallScore} />

        <div className="grid gap-3 md:grid-cols-2">
          {skillEntries.map((skill) => (
            <div key={skill.key} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-white">{skill.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{getSkillStatus(skill.value)}</p>
                </div>
                <span className="rounded-full border border-purple-300/20 bg-purple-300/[0.08] px-2.5 py-1 text-sm font-semibold text-purple-100">
                  {skill.value}
                </span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-300 to-cyan-200"
                  style={{ width: `${skill.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardCard>
  );
}

function MissionControl({ onNavigate, hasSkillProfile }) {
  const missions = hasSkillProfile
    ? missionCards
    : [
        {
          title: "Construir Skill Matrix",
          description: "Crie seu perfil de jogador antes de iniciar missões avançadas.",
          priority: "Primeiro passo",
          time: "10 min",
          targetPage: "AI Coach",
        },
        ...missionCards.slice(0, 3),
      ];

  return (
    <DashboardCard className="p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="astro-eyebrow">Mission Control</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Ações sugeridas</h2>
        </div>
        <span className="rounded-full border border-cyan-300/20 bg-cyan-300/[0.08] px-3 py-1 text-xs font-semibold text-cyan-100">
          Próximos passos
        </span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {missions.map((mission) => (
          <button
            key={mission.title}
            type="button"
            onClick={() => onNavigate?.(mission.targetPage)}
            className="rounded-[24px] border border-white/10 bg-slate-950/40 p-4 text-left transition hover:-translate-y-0.5 hover:border-purple-300/35 hover:bg-purple-300/[0.055]"
          >
            <span className="rounded-full border border-purple-300/20 bg-purple-300/[0.08] px-2.5 py-1 text-xs font-semibold text-purple-100">
              {mission.priority}
            </span>
            <h3 className="mt-4 font-semibold text-white">{mission.title}</h3>
            <p className="mt-2 min-h-16 text-sm leading-6 text-slate-400">{mission.description}</p>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>{mission.time}</span>
              <span>Abrir →</span>
            </div>
          </button>
        ))}
      </div>
    </DashboardCard>
  );
}

function RecentFlightLog({ recentGames, onNavigate, onReviewGame }) {
  return (
    <DashboardCard className="p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="astro-eyebrow">Recent Flight Log</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Atividade recente</h2>
        </div>
        <button
          type="button"
          onClick={() => onNavigate?.("Games")}
          className="astro-button-secondary rounded-xl px-4 py-2.5 text-sm font-semibold transition"
        >
          Abrir Games
        </button>
      </div>

      <div className="mt-6 grid gap-3">
        {recentGames.length ? (
          recentGames.map((game) => (
            <div
              key={game.id}
              className="grid gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4 lg:grid-cols-[1fr_auto] lg:items-center"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-white">vs {game.opponent}</span>
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                    game.result === "Win"
                      ? "border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-100"
                      : game.result === "Loss"
                        ? "border-rose-300/20 bg-rose-300/[0.08] text-rose-100"
                        : "border-slate-300/20 bg-slate-300/[0.08] text-slate-200"
                  }`}>
                    {game.result}
                  </span>
                  <span className="text-xs text-slate-500">{game.timeControl}</span>
                </div>
                <p className="mt-2 truncate text-sm text-slate-400" title={game.opening}>
                  {game.date} · {game.opening || "Abertura não detectada"}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  onReviewGame?.({
                    id: game.id,
                    pgn: game.pgn,
                    players: { white: game.whitePlayer, black: game.blackPlayer },
                    gameMeta: game,
                  })
                }
                className="rounded-xl border border-purple-300/25 bg-purple-300/[0.08] px-4 py-2 text-sm font-semibold text-purple-100 transition hover:border-purple-300/45 hover:bg-purple-300/[0.14]"
              >
                Review
              </button>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5 text-sm leading-6 text-slate-400">
            Nenhum jogo recente carregado nesta sessão. Abra Games para buscar partidas.
          </div>
        )}
      </div>
    </DashboardCard>
  );
}

function MobileHomeExperience({
  playerProfile,
  connectedUsername,
  ratings,
  analysisProfile,
  recentGames,
  onNavigate,
  onReviewGame,
  hasSkillProfile,
}) {
  return (
    <section className="mobile-home-shell mx-auto flex w-full max-w-[460px] flex-col gap-5 overflow-x-hidden px-1 pb-6">
      <MobilePlayerHero
        playerProfile={playerProfile}
        connectedUsername={connectedUsername}
        ratings={ratings}
      />

      <MobileRatingsCarousel ratings={ratings} />

      <MobileSkillMatrix analysisProfile={analysisProfile} onNavigate={onNavigate} />

      <MobileOrbitCarousel onNavigate={onNavigate} />

      <MobileQuickLaunch onNavigate={onNavigate} />

      <MissionControl onNavigate={onNavigate} hasSkillProfile={hasSkillProfile} />

      <RecentFlightLog
        recentGames={recentGames}
        onNavigate={onNavigate}
        onReviewGame={onReviewGame}
      />
    </section>
  );
}

export default function Home({
  connectedUsername,
  playerProfile,
  parsedStats,
  analysisProfile,
  playerGames = [],
  isConnecting,
  connectError,
  connectSuccess,
  onConnect,
  onNavigate,
  onReviewGame,
  initialUsername,
}) {
  const { t } = useLanguage();
  const [username, setUsername] = useState("");

  useEffect(() => {
    setUsername(initialUsername || "");
  }, [initialUsername]);

  const ratings = useMemo(
    () => [
      { label: "Bullet", ...(parsedStats?.ratings?.bullet || {}) },
      { label: "Blitz", ...(parsedStats?.ratings?.blitz || {}) },
      { label: "Rapid", ...(parsedStats?.ratings?.rapid || {}) },
      { label: "Daily", ...(parsedStats?.ratings?.daily || {}) },
    ],
    [parsedStats],
  );

  const recentGames = useMemo(() => {
    if (!connectedUsername) return [];
    return playerGames
      .slice(0, 5)
      .map((game) => parseChessComGame(game, connectedUsername));
  }, [connectedUsername, playerGames]);

  const hasSkillProfile = getSkillEntries(analysisProfile?.skillMap).length > 0;

  if (!playerProfile) {
    return (
      <OnboardingCommandCenter
        username={username}
        onUsernameChange={setUsername}
        onConnect={onConnect}
        isConnecting={isConnecting}
        connectError={connectError}
        connectSuccess={connectSuccess}
      />
    );
  }

  return (
    <>
      <div className="lg:hidden">
        <MobileHomeExperience
          playerProfile={playerProfile}
          connectedUsername={connectedUsername}
          ratings={ratings}
          analysisProfile={analysisProfile}
          recentGames={recentGames}
          onNavigate={onNavigate}
          onReviewGame={onReviewGame}
          hasSkillProfile={hasSkillProfile}
        />
      </div>

      <section className="mx-auto hidden w-full max-w-7xl flex-col gap-6 lg:flex">
        <CosmicHero
          playerProfile={playerProfile}
          connectedUsername={connectedUsername}
          ratings={ratings}
          onNavigate={onNavigate}
        />

        <SolarSystemNavigation onNavigate={onNavigate} />

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <PlayerSignalCard
            playerProfile={playerProfile}
            username={username}
            onUsernameChange={setUsername}
            onConnect={onConnect}
            isConnecting={isConnecting}
            connectError={connectError}
            connectSuccess={connectSuccess}
          />
          <RatingOrbitCard ratings={ratings} />
        </div>

        <HomeSkillMatrixPreview analysisProfile={analysisProfile} onNavigate={onNavigate} />

        <MissionControl onNavigate={onNavigate} hasSkillProfile={hasSkillProfile} />

        <RecentFlightLog
          recentGames={recentGames}
          onNavigate={onNavigate}
          onReviewGame={onReviewGame}
        />
      </section>
    </>
  );
}
