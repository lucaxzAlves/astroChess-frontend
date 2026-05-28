import { useLanguage } from "../../../contexts/LanguageContext.jsx";

export default function ReplayPlaceholder({ game, trainingMode, onExit }) {
  const { t } = useLanguage();

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(22,14,36,0.96),rgba(9,11,18,0.98))] p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-200">
              {t("masterReplay.replaySession")}
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-white">{game.title}</h1>
            <p className="mt-3 text-sm text-slate-400">
              {t("masterReplay.selectedMode")}:{" "}
              <span className="font-semibold text-purple-200">
                {t(`masterReplay.mode.${trainingMode}.title`, trainingMode)}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onExit}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-purple-300/35 hover:text-white"
          >
            {t("masterReplay.exitReplay")}
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.75fr]">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
          <div className="grid aspect-square max-h-[640px] place-items-center rounded-[24px] border border-dashed border-purple-300/25 bg-slate-950/65">
            <div className="text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-purple-300/25 bg-purple-300/10 text-purple-100">
                <svg
                  aria-hidden="true"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                >
                  <path d="M8.25 8.25h7.5v7.5h-7.5v-7.5Z" />
                  <path d="M4.5 4.5h15v15h-15v-15Z" />
                  <path d="M8.25 4.5v15M15.75 4.5v15M4.5 8.25h15M4.5 15.75h15" />
                </svg>
              </div>
              <h2 className="mt-5 text-2xl font-semibold text-white">
                {t("masterReplay.boardComingSoon")}
              </h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                {t("masterReplay.boardPlaceholderDescription")}
              </p>
            </div>
          </div>
        </div>

        <aside className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-300">
            {t("masterReplay.mockQuestion")}
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            {t("masterReplay.whatWouldYouPlay")}
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            {game.keyMoments?.[0]?.prompt || t("masterReplay.questionPlaceholder")}
          </p>
          <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/45 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
              {t("masterReplay.masterMoveHidden")}
            </p>
            <p className="mt-2 font-mono text-sm text-slate-300">...</p>
          </div>
          <div className="mt-5 grid gap-3">
            <button
              type="button"
              disabled
              className="rounded-xl bg-purple-500 px-4 py-3 text-sm font-semibold text-white opacity-50"
            >
              {t("masterReplay.revealMasterMove")}
            </button>
            <button
              type="button"
              disabled
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-300 opacity-50"
            >
              {t("masterReplay.nextMoment")}
            </button>
            <button
              type="button"
              onClick={onExit}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-purple-300/35 hover:text-white"
            >
              {t("masterReplay.exitReplay")}
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}
