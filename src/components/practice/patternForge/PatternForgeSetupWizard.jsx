import { useMemo } from "react";
import { useLanguage } from "../../../contexts/LanguageContext.jsx";
import {
  buildRounds,
  compressionPresets,
  createCycleDraft,
  formatThemeLabel,
  forgeDifficultyOptions,
  forgePresets,
  forgePuzzleCounts,
  forgeRepetitionRules,
  forgeRoundCounts,
  getManualThemes,
  getThemeTitle,
  getTotalCommitmentDays,
  localizeForgeItem,
} from "../../../data/mockPatternForge.js";
import ForgeOptionCard from "./ForgeOptionCard.jsx";
import ForgeProgressBar from "./ForgeProgressBar.jsx";

const totalSteps = 6;

function formatReasonConfidence(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue <= 0) return null;
  return Math.round(numericValue <= 1 ? numericValue * 100 : numericValue);
}

function formatThemeReasonSource(sourceField = "", language = "pt-BR") {
  const normalized = String(sourceField || "").toLowerCase();
  const isPt = String(language || "").toLowerCase().startsWith("pt");

  if (normalized.includes("skillmap")) return isPt ? "Mapa de habilidades" : "Skill map";
  if (normalized.includes("recurringmistakes")) return isPt ? "Erros recorrentes" : "Recurring mistakes";
  if (normalized.includes("openingrepertoire")) return isPt ? "Repertório de aberturas" : "Opening repertoire";
  if (normalized.includes("recommendations") || normalized.includes("goals") || normalized.includes("decisionpatterns")) {
    return isPt ? "Plano do coach" : "Coach plan";
  }

  return isPt ? "Perfil do jogador" : "Player profile";
}

function formatThemeReasonText(reason, language = "pt-BR") {
  const rawReason = String(reason?.reason || "").trim();
  const themeLabel = getThemeTitle(reason?.theme, language);
  const isPt = String(language || "").toLowerCase().startsWith("pt");
  const lowerReason = rawReason.toLowerCase();

  if (!rawReason) {
    return isPt
      ? `${themeLabel} foi escolhido a partir dos sinais do seu perfil.`
      : `${themeLabel} was selected from signals in your profile.`;
  }

  if (lowerReason.includes("low tactical pattern score")) {
    return isPt ? "Padrões táticos precisam de reforço." : "Tactical patterns need reinforcement.";
  }
  if (lowerReason.includes("low calculation score")) {
    return isPt ? "Cálculo aparece como prioridade de treino." : "Calculation appears as a training priority.";
  }
  if (lowerReason.includes("endgame score")) {
    return isPt ? "Finais pedem treino técnico adicional." : "Endgames need additional technical practice.";
  }
  if (lowerReason.includes("opening score")) {
    return isPt ? "O repertório de aberturas precisa de revisão." : "The opening repertoire needs review.";
  }
  if (lowerReason.includes("time management score")) {
    return isPt ? "Há sinais de dificuldade sob pressão de tempo." : "There are signs of difficulty under time pressure.";
  }
  if (lowerReason.includes("low resilience score")) {
    return isPt ? "Recursos defensivos sob pressão merecem atenção." : "Defensive resources under pressure need attention.";
  }

  return rawReason.length > 120 ? `${rawReason.slice(0, 117).trim()}...` : rawReason;
}

function StepHeader({ step, title, description }) {
  const { t } = useLanguage();
  const progress = ((step + 1) / totalSteps) * 100;

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-200">
          {t("patternForge.stepCount", undefined, { current: step + 1, total: totalSteps })}
        </p>
        <span className="rounded-full border border-white/10 bg-slate-950/45 px-3 py-1 text-xs text-slate-300">
          {Math.round(progress)}%
        </span>
      </div>
      <ForgeProgressBar value={progress} className="mt-3" />
      <h2 className="mt-6 text-3xl font-semibold text-white">{title}</h2>
      {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{description}</p> : null}
    </div>
  );
}

function ChoicePill({ label, selected, recommended, onClick }) {
  const { t } = useLanguage();

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-2xl border px-4 py-3 text-sm font-semibold transition",
        selected
          ? "border-rose-300 bg-rose-300 text-slate-950"
          : "border-white/10 bg-white/[0.04] text-slate-200 hover:border-rose-300/35",
      ].join(" ")}
    >
      {label}
      {recommended ? (
        <span className="ml-2 text-[10px] uppercase tracking-[0.12em] opacity-75">
          {t("patternForge.recommendedShort")}
        </span>
      ) : null}
    </button>
  );
}

function ToggleRow({ title, description, checked, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={[
        "flex items-center justify-between gap-5 rounded-2xl border p-4 text-left transition",
        checked
          ? "border-rose-300/45 bg-rose-300/[0.08]"
          : "border-white/10 bg-white/[0.04] hover:border-rose-300/30",
      ].join(" ")}
    >
      <span>
        <span className="block font-semibold text-white">{title}</span>
        <span className="mt-1 block text-sm leading-6 text-slate-400">{description}</span>
      </span>
      <span
        className={[
          "relative h-7 w-12 shrink-0 rounded-full border transition",
          checked ? "border-rose-300 bg-rose-300" : "border-white/15 bg-slate-950/70",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-1 h-5 w-5 rounded-full bg-white transition",
            checked ? "left-6" : "left-1",
          ].join(" ")}
        />
      </span>
    </button>
  );
}

function OverviewMetric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

export default function PatternForgeSetupWizard({
  forgeConfig,
  setForgeConfig,
  currentSetupStep,
  setCurrentSetupStep,
  onComplete,
  onBackToIntro,
  playerProfile,
  themeReasons = [],
  availableThemes = [],
  themesLoading = false,
  themesError = "",
  creating,
}) {
  const { language, t } = useLanguage();
  const selectedPreset = forgePresets.find((preset) => preset.id === forgeConfig.cyclePreset);
  const selectedDifficulty = forgeDifficultyOptions.find((option) => option.id === forgeConfig.difficulty);
  const selectedCompression = compressionPresets.find((preset) => preset.id === forgeConfig.compressionPreset);
  const rounds = useMemo(() => buildRounds(forgeConfig, language), [forgeConfig, language]);
  const cycleDraftPreview = useMemo(() => createCycleDraft(forgeConfig), [forgeConfig]);
  const manualThemes = getManualThemes(forgeConfig);
  const hasProfile = Boolean(playerProfile && Object.keys(playerProfile || {}).length);
  const detectedThemeReasons = themeReasons.filter((reason) => reason?.theme);
  const manualThemeOptions = useMemo(
    () =>
      availableThemes
        .map((theme) => {
          const id = typeof theme === "string" ? theme : theme?.id || theme?.theme || theme?.label;

          if (!id) return null;

          const count = typeof theme?.count === "number" ? theme.count : null;

          return {
            id,
            title: typeof theme === "string" ? formatThemeLabel(theme) : theme.label || formatThemeLabel(id),
            description: t("patternForge.databaseThemeDescription"),
            meta:
              count === null
                ? t("patternForge.databaseTheme")
                : t("patternForge.themePuzzleCount", undefined, { count }),
          };
        })
        .filter(Boolean),
    [availableThemes, t]
  );
  const totalDays = getTotalCommitmentDays(forgeConfig);

  const updateConfig = (patch) => setForgeConfig((current) => ({ ...current, ...patch }));

  const applyCompressionPreset = (preset) => {
    updateConfig({
      compressionPreset: preset.id,
      roundCount: preset.roundDays.length,
      roundDays: [...preset.roundDays],
    });
  };

  const updateRoundCount = (roundCount) => {
    setForgeConfig((current) => {
      const sourceDays = current.roundDays?.length ? current.roundDays : [14, 7, 4, 2];
      const roundDays = Array.from(
        { length: roundCount },
        (_, index) => sourceDays[index] ?? Math.max(1, sourceDays[sourceDays.length - 1] - 1)
      );
      return { ...current, roundCount, roundDays };
    });
  };

  const updateRoundDay = (index, value) => {
    setForgeConfig((current) => {
      const roundDays = [...current.roundDays];
      roundDays[index] = Math.max(1, Number(value) || 1);
      return { ...current, roundDays, compressionPreset: "custom" };
    });
  };

  const toggleTheme = (themeId) => {
    setForgeConfig((current) => {
      const currentThemes = getManualThemes(current);
      const themes = currentThemes.includes(themeId)
        ? currentThemes.filter((id) => id !== themeId)
        : [...currentThemes, themeId];

      return { ...current, manualThemes: themes, themes };
    });
  };

  const step = currentSetupStep;

  return (
    <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,rgba(18,12,32,0.96),rgba(9,12,18,0.98))] p-5 shadow-[0_28px_80px_rgba(0,0,0,0.28)] sm:p-7">
      {step === 0 ? (
        <div className="grid gap-6">
          <StepHeader
            step={step}
            title={t("patternForge.stepPresetTitle")}
            description={t("patternForge.stepPresetDescription")}
          />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {forgePresets.map((preset) => (
              <ForgeOptionCard
                key={preset.id}
                title={localizeForgeItem(preset, "title", language)}
                description={localizeForgeItem(preset, "description", language)}
                meta={localizeForgeItem(preset, "meta", language)}
                selected={forgeConfig.cyclePreset === preset.id}
                recommended={preset.recommended}
                onClick={() => setForgeConfig({ ...preset.defaults })}
              />
            ))}
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="grid gap-6">
          <StepHeader
            step={step}
            title={t("patternForge.stepPatternSetTitle")}
            description={t("patternForge.stepPatternSetDescription")}
          />
          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
              <h3 className="text-lg font-semibold text-white">{t("patternForge.patternSetSize")}</h3>
              <div className="mt-4 flex flex-wrap gap-3">
                {forgePuzzleCounts.map((count) => (
                  <ChoicePill
                    key={count}
                    label={t("patternForge.puzzles", undefined, { count })}
                    selected={forgeConfig.puzzleSetSize === count}
                    recommended={count === 100}
                    onClick={() => updateConfig({ puzzleSetSize: count })}
                  />
                ))}
              </div>
            </section>

            <section className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
              <h3 className="text-lg font-semibold text-white">{t("patternForge.repetitionRounds")}</h3>
              <div className="mt-4 flex flex-wrap gap-3">
                {forgeRoundCounts.map((count) => (
                  <ChoicePill
                    key={count}
                    label={t("patternForge.rounds", undefined, { count })}
                    selected={forgeConfig.roundCount === count}
                    recommended={count === 4}
                    onClick={() => updateRoundCount(count)}
                  />
                ))}
              </div>
            </section>
          </div>

          <section className="rounded-[24px] border border-rose-200/20 bg-rose-200/[0.07] p-5">
            <h3 className="text-xl font-semibold text-white">{t("patternForge.dailyTargets")}</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {rounds.map((round) => (
                <OverviewMetric
                  key={round.round}
                  label={t("patternForge.roundNumber", undefined, { round: round.round })}
                  value={t("patternForge.dailyTargetLine", undefined, {
                    days: round.targetDays,
                    count: round.dailyTarget,
                  })}
                />
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="grid gap-6">
          <StepHeader
            step={step}
            title={t("patternForge.stepCompressionTitle")}
            description={t("patternForge.stepCompressionDescription")}
          />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {compressionPresets.map((preset) => (
              <ForgeOptionCard
                key={preset.id}
                title={localizeForgeItem(preset, "title", language)}
                description={localizeForgeItem(preset, "description", language)}
                meta={preset.roundDays.map((days) => t("patternForge.days", undefined, { count: days })).join(" · ")}
                selected={forgeConfig.compressionPreset === preset.id}
                recommended={preset.recommended}
                onClick={() => applyCompressionPreset(preset)}
              />
            ))}
          </div>

          <section className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
            <h3 className="text-lg font-semibold text-white">{t("patternForge.editRoundDays")}</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {rounds.map((round, index) => (
                <label key={round.round} className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                  <span className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    {t("patternForge.roundNumber", undefined, { round: round.round })}
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={forgeConfig.roundDays[index]}
                    onChange={(event) => updateRoundDay(index, event.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm font-semibold text-white outline-none focus:border-rose-300/60"
                  />
                  <span className="mt-2 block text-xs text-slate-400">
                    {t("patternForge.dailyTarget", undefined, { count: round.dailyTarget })}
                  </span>
                </label>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="grid gap-6">
          <StepHeader
            step={step}
            title={t("patternForge.stepThemesTitle")}
            description={t("patternForge.stepThemesDescription")}
          />
          <button
            type="button"
            onClick={() => updateConfig({ automaticThemesEnabled: !forgeConfig.automaticThemesEnabled })}
            className={[
              "rounded-[28px] border p-5 text-left transition-all duration-300",
              forgeConfig.automaticThemesEnabled
                ? "border-purple-300/55 bg-purple-400/[0.10] shadow-[0_0_34px_rgba(168,85,247,0.18)]"
                : "border-white/10 bg-white/[0.04] hover:border-purple-300/35",
            ].join(" ")}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-purple-300/25 bg-purple-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-purple-100">
                    {t("patternForge.recommended")}
                  </span>
                  <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100">
                    {t("patternForge.aiCoachBadge")}
                  </span>
                </div>
                <h3 className="mt-4 text-2xl font-semibold text-white">
                  {t("patternForge.automaticThemesTitle")}
                </h3>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                  {t("patternForge.automaticThemesDescription")}
                </p>
              </div>
              <span
                className={[
                  "grid h-10 w-10 shrink-0 place-items-center rounded-2xl border text-lg font-bold",
                  forgeConfig.automaticThemesEnabled
                    ? "border-purple-300 bg-purple-300 text-slate-950"
                    : "border-white/15 bg-slate-950/50 text-slate-500",
                ].join(" ")}
              >
                {forgeConfig.automaticThemesEnabled ? "✓" : ""}
              </span>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/35 p-4">
              {hasProfile ? (
                <>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    {t("patternForge.detectedThemes")}
                  </p>
                  {detectedThemeReasons.length ? (
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      {detectedThemeReasons.slice(0, 4).map((reason) => {
                        const confidence = formatReasonConfidence(reason.confidence);

                        return (
                          <div key={`${reason.theme}-${reason.sourceField}`} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                            <p className="font-semibold text-white">{getThemeTitle(reason.theme, language)}</p>
                            <p className="mt-1 text-sm leading-5 text-slate-400">
                              {formatThemeReasonText(reason, language)}
                            </p>
                            <p className="mt-2 text-xs text-purple-200">
                              {formatThemeReasonSource(reason.sourceField, language)}
                              {confidence ? ` · ${confidence}%` : ""}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      {t("patternForge.profileThemesWillBeGenerated")}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm leading-6 text-slate-300">
                  {t("patternForge.noProfileThemes")}
                </p>
              )}
            </div>
          </button>

          <div>
            <h3 className="text-lg font-semibold text-white">{t("patternForge.additionalThemes")}</h3>
            <p className="mt-1 text-sm text-slate-400">{t("patternForge.additionalThemesDescription")}</p>
          </div>
          <div className="max-h-[32rem] overflow-y-auto overflow-x-hidden rounded-[28px] border border-white/10 bg-slate-950/30 p-3 pr-2 [scrollbar-width:thin] [scrollbar-color:rgba(251,113,133,0.45)_rgba(15,23,42,0.35)]">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {themesLoading ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm text-slate-300 md:col-span-2 xl:col-span-3">
                {t("patternForge.loadingThemes")}
              </div>
            ) : themesError ? (
              <div className="rounded-2xl border border-amber-300/25 bg-amber-300/10 p-5 text-sm text-amber-100 md:col-span-2 xl:col-span-3">
                {themesError || t("patternForge.themesLoadError")}
              </div>
            ) : manualThemeOptions.length ? (
              manualThemeOptions.map((theme) => (
                <ForgeOptionCard
                  key={theme.id}
                  title={theme.title}
                  description={theme.description}
                  meta={theme.meta}
                  selected={manualThemes.includes(theme.id)}
                  onClick={() => toggleTheme(theme.id)}
                />
              ))
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm text-slate-300 md:col-span-2 xl:col-span-3">
                {t("patternForge.noDatabaseThemes")}
              </div>
            )}
            </div>
          </div>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="grid gap-6">
          <StepHeader
            step={step}
            title={t("patternForge.stepRulesTitle")}
            description={t("patternForge.stepRulesDescription")}
          />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {forgeDifficultyOptions.map((option) => (
              <ForgeOptionCard
                key={option.id}
                title={localizeForgeItem(option, "title", language)}
                description={localizeForgeItem(option, "description", language)}
                selected={forgeConfig.difficulty === option.id}
                recommended={option.recommended}
                onClick={() => updateConfig({ difficulty: option.id })}
              />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {forgeRepetitionRules.map((rule) => (
              <ToggleRow
                key={rule.id}
                title={localizeForgeItem(rule, "title", language)}
                description={localizeForgeItem(rule, "description", language)}
                checked={Boolean(forgeConfig[rule.id])}
                onToggle={() => updateConfig({ [rule.id]: !forgeConfig[rule.id] })}
              />
            ))}
          </div>
        </div>
      ) : null}

      {step === 5 ? (
        <div className="grid gap-6">
          <StepHeader
            step={step}
            title={t("patternForge.stepOverviewTitle")}
            description={t("patternForge.stepOverviewDescription")}
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <OverviewMetric label={t("patternForge.patternSetSize")} value={cycleDraftPreview.patternSet.puzzleCount} />
            <OverviewMetric label={t("patternForge.repetitionRounds")} value={cycleDraftPreview.repetitionPlan.rounds.length} />
            <OverviewMetric label={t("patternForge.selectedDifficulty")} value={localizeForgeItem(selectedDifficulty, "title", language)} />
            <OverviewMetric label={t("patternForge.totalCommitment")} value={t("patternForge.days", undefined, { count: totalDays })} />
          </div>

          <section className="rounded-[24px] border border-rose-200/20 bg-rose-200/[0.07] p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white">{t("patternForge.compressionSchedule")}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {localizeForgeItem(selectedCompression, "description", language)}
                </p>
              </div>
              <span className="rounded-full border border-purple-300/25 bg-purple-300/10 px-3 py-1 text-xs font-semibold text-purple-100">
                {localizeForgeItem(selectedCompression, "title", language)}
              </span>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {rounds.map((round) => (
                <div key={round.round} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-rose-200">
                    {t("patternForge.roundNumber", undefined, { round: round.round })}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {t("patternForge.scheduleLine", undefined, {
                      days: round.targetDays,
                      count: round.dailyTarget,
                    })}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{round.goal}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
            <h3 className="text-xl font-semibold text-white">{t("patternForge.patternSet")}</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {manualThemes.map((themeId) => (
                <span
                  key={themeId}
                  className="rounded-full border border-purple-300/25 bg-purple-300/10 px-3 py-1 text-xs font-medium text-purple-100"
                >
                  {getThemeTitle(themeId, language)}
                </span>
              ))}
              {forgeConfig.automaticThemesEnabled ? (
                <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-100">
                  {t("patternForge.automaticThemesEnabled")}
                </span>
              ) : null}
            </div>
            <p className="mt-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm leading-6 text-slate-300">
              {t("patternForge.recommendedOverview")}
            </p>
          </section>
        </div>
      ) : null}

      <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={step === 0 ? onBackToIntro : () => setCurrentSetupStep((current) => Math.max(0, current - 1))}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-rose-300/35 hover:text-white"
        >
          {step === 0 ? t("patternForge.backToIntro") : t("patternForge.previous")}
        </button>
        <button
          type="button"
          onClick={
            step === totalSteps - 1
              ? onComplete
              : () => setCurrentSetupStep((current) => Math.min(totalSteps - 1, current + 1))
          }
          disabled={creating}
          className="rounded-xl bg-rose-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {creating
            ? t("patternForge.creatingCycle")
            : step === totalSteps - 1
              ? t("patternForge.startPatternForge")
              : t("patternForge.next")}
        </button>
      </div>
    </section>
  );
}
