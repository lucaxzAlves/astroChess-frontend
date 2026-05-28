import { useLanguage } from "../../contexts/LanguageContext.jsx";
import { Badge } from "../profileDelta/ProfileDeltaUi.jsx";

function formatDateRange(dateRange, t) {
  if (!dateRange) return t("analysisOverview.notDefined");

  const labels = {
    last_7_days: t("games.last7"),
    last_30_days: t("games.last30"),
    last_90_days: t("analysisWizard.last90Title"),
    all_available: t("analysisWizard.allAvailableTitle"),
    custom: t("analysisWizard.customDateTitle"),
  };

  if (dateRange.type !== "custom") {
    return labels[dateRange.type] || "Intervalo personalizado";
  }

  if (dateRange.from && dateRange.to) {
    return `${dateRange.from} até ${dateRange.to}`;
  }

  return t("analysisWizard.customDateTitle");
}

function humanizeList(values = [], dictionary = {}, t) {
  if (!Array.isArray(values) || values.length === 0) return t("analysisOverview.noneSelected");
  return values.map((value) => dictionary[value] || value).join(", ");
}

export default function AnalysisOverview({ draft, sample }) {
  const { t } = useLanguage();

  if (!draft) return null;

  const timeControlLabels = {
    bullet: "Bullet",
    blitz: "Blitz",
    rapid: "Rápido",
    daily: "Diário",
    classical: "Clássico",
  };
  const resultTypeLabels = {
    win: t("games.wins"),
    loss: t("games.losses"),
    draw: t("games.draws"),
  };

  const focusAreaLabels = {
    RecurringMistakes: "Erros recorrentes",
    SkillMap: "Mapa de habilidades",
    OpeningProfile: "Perfil de aberturas",
    EndgameProfile: "Perfil de finais",
    DecisionPatterns: "Padrões de decisão",
    PsychologicalProfile: "Perfil psicológico",
    TrainingPlan: "Plano de treino",
    TournamentPreparation: "Preparação para torneios",
  };
  const selectedFocusAreas = Object.entries(draft.analysisOptions || {})
    .filter(([, enabled]) => enabled)
    .map(([key]) => {
      const normalized = key
        .replace(/^include/, "")
        .trim();
      return focusAreaLabels[normalized] || normalized.replace(/([A-Z])/g, " $1").trim();
    });

  const isEstimated = sample?.isEstimated !== false;

  return (
    <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-purple-300">
              {t("analysisOverview.eyebrow")}
            </p>
            <h3 className="mt-2 text-xl font-semibold text-white">
              {t("analysisOverview.title")}
            </h3>
          </div>
          <Badge tone="slate">{t("analysisOverview.draftOnly")}</Badge>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
              {t("analysisOverview.source")}
            </p>
            <p className="mt-2 text-sm font-medium text-white">{draft.source}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
              {t("analysisOverview.username")}
            </p>
            <p className="mt-2 text-sm font-medium text-white">
              {draft.username || t("analysisOverview.notLinked")}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
              {t("analysisOverview.timeControls")}
            </p>
            <p className="mt-2 text-sm font-medium text-white">
              {humanizeList(draft.filters?.timeControls, timeControlLabels, t)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
              {t("analysisOverview.dateRange")}
            </p>
            <p className="mt-2 text-sm font-medium text-white">
              {formatDateRange(draft.filters?.dateRange, t)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
              {t("analysisOverview.results")}
            </p>
            <p className="mt-2 text-sm font-medium text-white">
              {humanizeList(draft.filters?.resultTypes, resultTypeLabels, t)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
              {t("analysisOverview.colorRated")}
            </p>
            <p className="mt-2 text-sm font-medium text-white">
              {draft.filters?.color || "both"} /{" "}
              {draft.filters?.ratedOnly
                ? t("analysisOverview.ratedOnly")
                : t("analysisOverview.ratedCasual")}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
              {t("analysisOverview.maximumGames")}
            </p>
            <p className="mt-2 text-sm font-medium text-white">{draft.filters?.maxGames}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
              {t("analysisOverview.estimatedTime")}
            </p>
            <p className="mt-2 text-sm font-medium text-white">
              {draft.estimated?.estimatedLabel}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/45 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
            {t("analysisOverview.focusAreas")}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedFocusAreas.map((area) => (
              <span
                key={area}
                className="rounded-full border border-purple-500/25 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-100"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-purple-300">
          {t("analysisOverview.sampleEyebrow")}
        </p>
        <h3 className="mt-2 text-xl font-semibold text-white">
          {t("analysisOverview.sampleTitle")}
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          {isEstimated
            ? sample?.note || t("analysisOverview.estimatedNote")
            : t("analysisOverview.computedNote")}
        </p>

        <div className="mt-5 space-y-3">
          <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
              {t("analysisOverview.availableGames")}
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {sample?.selectedGamesCount ?? draft.estimated?.selectedGamesCount}
            </p>
          </div>

          {sample?.excludedAlreadyAnalyzedGamesCount > 0 ? (
            <div className="rounded-2xl border border-yellow-400/25 bg-yellow-400/10 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-yellow-200">
                    {t("analysisOverview.hiddenDuplicates")}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-yellow-100/90">
                    {t("analysisOverview.duplicatesRemoved", undefined, {
                      count: sample.excludedAlreadyAnalyzedGamesCount,
                    })}
                  </p>
                </div>
                <Badge tone="yellow">{t("analysisOverview.blocked")}</Badge>
              </div>
            </div>
          ) : null}

          {(sample?.timeControlBreakdown || []).map((item) => (
            <div
              key={`tc-${item.label}`}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3"
            >
              <span className="text-sm text-slate-300">{item.label}</span>
              <span className="text-sm font-semibold text-white">
                {item.count} {t("analysisWizard.games")}
              </span>
            </div>
          ))}

          {(sample?.resultBreakdown || []).map((item) => (
            <div
              key={`result-${item.label}`}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3"
            >
              <span className="text-sm text-slate-300">{item.label}</span>
              <span className="text-sm font-semibold text-white">{item.count}</span>
            </div>
          ))}

          {(sample?.colorBreakdown || []).map((item) => (
            <div
              key={`color-${item.label}`}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3"
            >
              <span className="text-sm text-slate-300">{item.label}</span>
              <span className="text-sm font-semibold text-white">{item.count}</span>
            </div>
          ))}

          <div className="rounded-2xl border border-purple-500/20 bg-purple-500/8 p-4">
            <p className="text-sm text-slate-300">
              {t("analysisOverview.dateRange")}:{" "}
              <span className="font-semibold text-white">
                {formatDateRange(draft.filters?.dateRange, t)}
              </span>
            </p>
            <p className="mt-2 text-sm text-slate-300">
              {t("analysisOverview.ratedOnlyQuestion")}:{" "}
              <span className="font-semibold text-white">
                {draft.filters?.ratedOnly ? t("analysisOverview.yes") : t("analysisOverview.no")}
              </span>
            </p>
            {sample?.note ? (
              <p className="mt-2 text-sm text-slate-300">
                {t("analysisOverview.note")}:{" "}
                <span className="font-semibold text-white">{sample.note}</span>
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
