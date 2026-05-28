import { useLanguage } from "../../../contexts/LanguageContext.jsx";
import { localizeItem } from "../../../data/mockPersonalReplay.js";

const severityStyles = {
  critical: "border-rose-300/30 bg-rose-400/10 text-rose-100",
  high: "border-orange-300/30 bg-orange-400/10 text-orange-100",
  medium: "border-yellow-300/30 bg-yellow-400/10 text-yellow-100",
  low: "border-emerald-300/30 bg-emerald-400/10 text-emerald-100",
};

export default function PersonalMomentCard({ moment, onSelect, compact = false }) {
  const { language, t } = useLanguage();

  return (
    <button
      type="button"
      onClick={() => onSelect(moment)}
      className={[
        "group rounded-[24px] border border-white/10 bg-white/[0.04] p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-purple-300/35 hover:bg-purple-500/[0.055] hover:shadow-[0_18px_52px_rgba(88,28,135,0.18)]",
        compact ? "" : "h-full",
      ].join(" ")}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${severityStyles[moment.severity]}`}>
          {t(`personalReplay.severity.${moment.severity}`, moment.severity)}
        </span>
        <span className="rounded-full border border-purple-300/25 bg-purple-300/10 px-2.5 py-1 text-[11px] font-medium text-purple-100">
          {t(`personalReplay.classification.${moment.classification}`, moment.classification)}
        </span>
        {moment.aiCoachPick ? (
          <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2.5 py-1 text-[11px] font-medium text-cyan-100">
            {t("personalReplay.aiCoachPick")}
          </span>
        ) : null}
      </div>

      <h3 className="mt-4 text-lg font-semibold text-white">
        {localizeItem(moment, "theme", language)}
      </h3>
      <p className="mt-2 text-sm text-slate-400">
        {t("personalReplay.moveVs", undefined, {
          move: moment.moveNumber,
          opponent: moment.opponent,
        })}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        {moment.date} · {moment.timeControl} · {t(`personalReplay.result.${moment.result}`, moment.result)}
      </p>

      {!compact ? (
        <p className="mt-4 text-sm leading-6 text-slate-400">
          {localizeItem(moment, "prompt", language)}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full border border-white/10 bg-slate-950/45 px-2.5 py-1 text-[11px] text-slate-300">
          {t(`personalReplay.phase.${moment.phase}`, moment.phase)}
        </span>
        <span className="rounded-full border border-white/10 bg-slate-950/45 px-2.5 py-1 text-[11px] text-slate-300">
          {t(`personalReplay.difficulty.${moment.difficulty}`, moment.difficulty)}
        </span>
        <span className="rounded-full border border-white/10 bg-slate-950/45 px-2.5 py-1 text-[11px] text-slate-300">
          {t(`personalReplay.status.${moment.status}`, moment.status)}
        </span>
      </div>

      <span className="mt-5 inline-flex rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-200 transition group-hover:border-purple-300/40 group-hover:text-white">
        {t("personalReplay.replayMoment")}
      </span>
    </button>
  );
}
