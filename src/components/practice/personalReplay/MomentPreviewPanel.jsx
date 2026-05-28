import { useLanguage } from "../../../contexts/LanguageContext.jsx";
import { localizeItem } from "../../../data/mockPersonalReplay.js";

export default function MomentPreviewPanel({ moment, onClose, onStart }) {
  const { language, t } = useLanguage();

  if (!moment) {
    return (
      <aside className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-300">
          {t("personalReplay.preview")}
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">{t("personalReplay.selectMoment")}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          {t("personalReplay.selectMomentDescription")}
        </p>
      </aside>
    );
  }

  return (
    <aside className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.055),rgba(88,28,135,0.08),rgba(15,23,42,0.35))] p-5 shadow-xl shadow-black/10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-300">
            {t("personalReplay.preview")}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            {localizeItem(moment, "theme", language)}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {moment.opponent} · {moment.date} · {t("personalReplay.moveNumber", undefined, { move: moment.moveNumber })}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-300 transition hover:border-purple-300/35 hover:text-white"
        >
          {t("personalReplay.close")}
        </button>
      </div>

      <p className="mt-5 text-sm leading-6 text-slate-300">
        {localizeItem(moment, "prompt", language)}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {[
          [t("personalReplay.playedMove"), moment.playedMove],
          [t("personalReplay.bestMove"), moment.bestMove],
          [t("personalReplay.classificationLabel"), t(`personalReplay.classification.${moment.classification}`, moment.classification)],
          [t("personalReplay.phaseLabel"), t(`personalReplay.phase.${moment.phase}`, moment.phase)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-slate-950/45 p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
            <p className="mt-1 font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {moment.tags.map((tag) => (
          <span key={tag} className="rounded-full border border-purple-300/20 bg-purple-300/10 px-3 py-1 text-xs text-purple-100">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          {t("personalReplay.candidateMoves")}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {moment.candidateMoves.map((move) => (
            <span key={move} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-sm text-slate-200">
              {move}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-cyan-200/20 bg-cyan-200/8 p-4">
        <p className="text-sm leading-6 text-cyan-50/90">
          {localizeItem(moment, "explanation", language)}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onStart(moment)}
        className="mt-6 w-full rounded-2xl bg-purple-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(88,28,135,0.45)] transition hover:bg-purple-400"
      >
        {t("personalReplay.startReplay")}
      </button>
    </aside>
  );
}
