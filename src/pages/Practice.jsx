import { useMemo, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext.jsx";
import MasterReplayPage from "../components/practice/masterReplay/MasterReplayPage.jsx";
import PatternForgePage from "../components/practice/patternForge/PatternForgePage.jsx";
import AcademyPage from "./AcademyPage.jsx";

const trainingModes = [
  {
    id: "academy",
    icon: "book",
    gradient: "from-violet-500/35 via-purple-500/18 to-sky-400/12",
    visualTone: "border-violet-300/25 bg-violet-300/10 text-violet-100",
    accentText: "text-violet-300",
    accentBadge: "border-violet-300/30 bg-violet-300/10 text-violet-100",
    accentDot: "bg-violet-300 shadow-[0_0_18px_rgba(196,181,253,0.9)]",
    selectedCard: "border-violet-300/50 bg-violet-500/[0.09] shadow-[0_0_34px_rgba(139,92,246,0.20)]",
    hoverCard: "hover:border-violet-400/35 hover:bg-violet-500/[0.065] hover:shadow-[0_24px_70px_rgba(109,40,217,0.20)]",
    selectedButton: "border-violet-300/40 bg-violet-300 text-slate-950",
    idleButton: "group-hover:border-violet-300/40 group-hover:text-white",
    futureFeatureCount: 4,
  },
  {
    id: "master-replay",
    icon: "crown",
    gradient: "from-amber-300/26 via-purple-500/18 to-fuchsia-400/14",
    visualTone: "border-amber-200/25 bg-amber-200/10 text-amber-100",
    accentText: "text-amber-200",
    accentBadge: "border-amber-200/30 bg-amber-200/10 text-amber-100",
    accentDot: "bg-amber-200 shadow-[0_0_18px_rgba(253,230,138,0.9)]",
    selectedCard: "border-amber-200/50 bg-amber-300/[0.08] shadow-[0_0_34px_rgba(245,158,11,0.18)]",
    hoverCard: "hover:border-amber-200/35 hover:bg-amber-300/[0.055] hover:shadow-[0_24px_70px_rgba(180,83,9,0.18)]",
    selectedButton: "border-amber-200/40 bg-amber-200 text-slate-950",
    idleButton: "group-hover:border-amber-200/40 group-hover:text-amber-50",
    futureFeatureCount: 4,
  },
  {
    id: "personal-replay",
    icon: "search",
    locked: true,
    gradient: "from-cyan-300/24 via-purple-500/16 to-emerald-300/12",
    visualTone: "border-cyan-200/25 bg-cyan-200/10 text-cyan-100",
    accentText: "text-cyan-200",
    accentBadge: "border-cyan-200/30 bg-cyan-200/10 text-cyan-100",
    accentDot: "bg-cyan-200 shadow-[0_0_18px_rgba(165,243,252,0.85)]",
    selectedCard: "border-cyan-200/50 bg-cyan-300/[0.08] shadow-[0_0_34px_rgba(34,211,238,0.16)]",
    hoverCard: "hover:border-cyan-200/35 hover:bg-cyan-300/[0.055] hover:shadow-[0_24px_70px_rgba(8,145,178,0.18)]",
    selectedButton: "border-cyan-200/40 bg-cyan-200 text-slate-950",
    idleButton: "group-hover:border-cyan-200/40 group-hover:text-cyan-50",
    futureFeatureCount: 4,
  },
  {
    id: "pattern-forge",
    icon: "forge",
    gradient: "from-rose-400/24 via-purple-500/18 to-indigo-400/16",
    visualTone: "border-rose-200/25 bg-rose-200/10 text-rose-100",
    accentText: "text-rose-200",
    accentBadge: "border-rose-200/30 bg-rose-200/10 text-rose-100",
    accentDot: "bg-rose-300 shadow-[0_0_18px_rgba(253,164,175,0.9)]",
    selectedCard: "border-rose-300/50 bg-rose-400/[0.08] shadow-[0_0_34px_rgba(244,63,94,0.18)]",
    hoverCard: "hover:border-rose-300/35 hover:bg-rose-400/[0.055] hover:shadow-[0_24px_70px_rgba(190,18,60,0.18)]",
    selectedButton: "border-rose-300/40 bg-rose-300 text-slate-950",
    idleButton: "group-hover:border-rose-300/40 group-hover:text-rose-50",
    futureFeatureCount: 4,
  },
];

function getTrainingModeText(t, mode, field) {
  return t(`practice.trainingMode.${mode.id}.${field}`);
}

function ModeIcon({ icon }) {
  const common = {
    className: "h-7 w-7",
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  if (icon === "crown") {
    return (
      <svg {...common}>
        <path d="m4.5 8 4.2 3.7L12 5l3.3 6.7L19.5 8l-1.3 9.5H5.8L4.5 8Z" />
        <path d="M6.5 20h11" />
      </svg>
    );
  }

  if (icon === "search") {
    return (
      <svg {...common}>
        <path d="M10.8 17.1a6.3 6.3 0 1 0 0-12.6 6.3 6.3 0 0 0 0 12.6Z" />
        <path d="m15.4 15.4 4.1 4.1" />
        <path d="M8.5 10.8h4.6" />
        <path d="M10.8 8.5v4.6" />
      </svg>
    );
  }

  if (icon === "forge") {
    return (
      <svg {...common}>
        <path d="M4.5 18.5h15" />
        <path d="M7 18.5l1.4-4.2h7.2l1.4 4.2" />
        <path d="M9 14.3h6l-1-3H10l-1 3Z" />
        <path d="M14.8 4.5 19 8.7" />
        <path d="m17.8 7.5-4.9 4.9" />
        <path d="m12 6.4 2.1-2.1 1.8 1.8-2.1 2.1" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M5.5 5.5A2.5 2.5 0 0 1 8 3h10.5v15H8a2.5 2.5 0 0 0-2.5 2.5v-15Z" />
      <path d="M5.5 20.5A2.5 2.5 0 0 1 8 18h10.5" />
      <path d="M9 7h5.5" />
      <path d="M9 10h4" />
    </svg>
  );
}

function VisualStage({ mode }) {
  return (
    <div
      className={[
        "relative h-44 overflow-hidden rounded-[22px] border border-white/10 bg-gradient-to-br",
        mode.gradient,
      ].join(" ")}
    >
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(45deg,rgba(255,255,255,0.14)_25%,transparent_25%),linear-gradient(-45deg,rgba(255,255,255,0.12)_25%,transparent_25%),linear-gradient(45deg,transparent_75%,rgba(255,255,255,0.08)_75%),linear-gradient(-45deg,transparent_75%,rgba(255,255,255,0.08)_75%)] [background-position:0_0,0_18px,18px_-18px,-18px_0] [background-size:36px_36px]" />
      <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/15 blur-2xl" />
      <div className="absolute bottom-4 left-4 flex items-end gap-3">
        <div
          className={[
            "grid h-16 w-16 place-items-center rounded-2xl border shadow-[0_18px_42px_rgba(0,0,0,0.28)]",
            mode.visualTone,
          ].join(" ")}
        >
          <ModeIcon icon={mode.icon} />
        </div>
        <div className="mb-1 grid grid-cols-3 gap-1.5">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <span
              key={item}
              className={[
                "h-5 w-5 rounded border border-white/10",
                item % 2 === 0 ? "bg-white/18" : "bg-slate-950/40",
              ].join(" ")}
            />
          ))}
        </div>
      </div>
      <div
        className={[
          "absolute rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
          mode.id === "personal-replay" ? "bottom-3 right-3" : "bottom-4 right-4",
          mode.accentBadge,
        ].join(" ")}
      >
        {mode.id.replace("-", " ")}
      </div>
    </div>
  );
}

function TrainingModeCard({ mode, selected, onSelect, onOpen }) {
  const { t } = useLanguage();
  const isLocked = Boolean(mode.locked);
  const handleSelect = () => {
    onSelect();
  };
  const handleOpen = () => {
    if (isLocked) return;
    onOpen?.();
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleSelect();
        }
      }}
      aria-pressed={selected}
      aria-disabled={isLocked}
      className={[
        "cursor-pointer",
        "group flex h-full flex-col rounded-[28px] border p-4 text-left transition-all duration-300",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f16]",
        selected
          ? mode.selectedCard
          : `border-white/10 bg-white/[0.04] hover:-translate-y-1 ${mode.hoverCard}`,
      ].join(" ")}
    >
      <VisualStage mode={mode} />

      <div className="flex flex-1 flex-col px-1 pb-1 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className={["text-xs font-semibold uppercase tracking-[0.18em]", mode.accentText].join(" ")}>
                {getTrainingModeText(t, mode, "purpose")}
              </p>
              {isLocked ? (
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300">
                  {t("practice.soon")}
                </span>
              ) : null}
            </div>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              {getTrainingModeText(t, mode, "title")}
            </h2>
          </div>
          <span
            className={[
              "mt-1 h-2.5 w-2.5 shrink-0 rounded-full transition",
              selected
                ? mode.accentDot
                : "bg-white/20 group-hover:bg-white/60",
            ].join(" ")}
          />
        </div>

        <p className="mt-4 flex-1 text-sm leading-6 text-slate-400">
          {getTrainingModeText(t, mode, "description")}
        </p>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onSelect();
            handleOpen();
          }}
          disabled={isLocked}
          className={[
            "mt-5 inline-flex w-fit items-center rounded-xl border px-4 py-2 text-sm font-semibold transition",
            isLocked
              ? "cursor-not-allowed border-white/10 bg-slate-950/55 text-slate-500"
              : selected
              ? mode.selectedButton
              : `border-white/10 bg-slate-950/40 text-slate-200 ${mode.idleButton}`,
          ].join(" ")}
        >
          {isLocked ? t("practice.soon") : getTrainingModeText(t, mode, "cta")}
        </button>
      </div>
    </article>
  );
}

function DetailPanel({ mode }) {
  const { t } = useLanguage();

  return (
    <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.055),rgba(88,28,135,0.08),rgba(15,23,42,0.35))] p-5 shadow-xl shadow-black/10 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-purple-200">
              {t("practice.selectedMode")}
            </span>
            <span
              className={[
                "rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]",
                mode.accentBadge,
              ].join(" ")}
            >
              {getTrainingModeText(t, mode, "purpose")}
            </span>
          </div>

          <h2 className="mt-4 text-2xl font-semibold text-white">
            {getTrainingModeText(t, mode, "title")}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            {getTrainingModeText(t, mode, "description")}
          </p>
        </div>

        <div
          className={[
            "grid h-16 w-16 shrink-0 place-items-center rounded-2xl border",
            mode.visualTone,
          ].join(" ")}
        >
          <ModeIcon icon={mode.icon} />
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: mode.futureFeatureCount }).map((_, index) => (
          <div
            key={index}
            className={[
              "rounded-2xl border bg-slate-950/45 px-4 py-3 text-sm font-medium text-slate-200",
              mode.accentBadge,
            ].join(" ")}
          >
            {t(`practice.trainingMode.${mode.id}.feature.${index}`)}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Practice({ connectedUsername = "", playerProfile = null }) {
  const { t } = useLanguage();
  const [activeExperience, setActiveExperience] = useState("practice");
  const [selectedTrainingModeId, setSelectedTrainingModeId] = useState(trainingModes[0].id);
  const selectedTrainingMode = useMemo(
    () =>
      trainingModes.find((mode) => mode.id === selectedTrainingModeId) || trainingModes[0],
    [selectedTrainingModeId]
  );

  if (activeExperience === "academy") {
    return <AcademyPage onBackToPractice={() => setActiveExperience("practice")} />;
  }

  if (activeExperience === "master-replay") {
    return <MasterReplayPage onBackToPractice={() => setActiveExperience("practice")} />;
  }

  if (activeExperience === "pattern-forge") {
    return (
      <PatternForgePage
        connectedUsername={connectedUsername}
        playerProfile={playerProfile}
        onBackToPractice={() => setActiveExperience("practice")}
      />
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(18,12,32,0.94),rgba(12,14,22,0.98))] p-6 shadow-[0_28px_70px_rgba(0,0,0,0.32)] sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.20),transparent_35%)]" />
        <div className="relative z-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-300">
            {t("practice.dashboard")}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {t("practice.title")}
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
            {t("practice.subtitle")}
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-4">
        {trainingModes.map((mode) => (
          <TrainingModeCard
            key={mode.id}
            mode={mode}
            selected={selectedTrainingMode.id === mode.id}
            onSelect={() => setSelectedTrainingModeId(mode.id)}
            onOpen={
              mode.id === "academy"
                ? () => setActiveExperience("academy")
                : mode.id === "master-replay"
                  ? () => setActiveExperience("master-replay")
                  : mode.id === "personal-replay"
                    ? undefined
                    : mode.id === "pattern-forge"
                      ? () => setActiveExperience("pattern-forge")
                : undefined
            }
          />
        ))}
      </div>

      <DetailPanel mode={selectedTrainingMode} />
    </section>
  );
}
