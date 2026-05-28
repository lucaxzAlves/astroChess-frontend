import { useLanguage } from "../../../contexts/LanguageContext.jsx";
import { getMomentsForWeakness, localizeItem } from "../../../data/mockPersonalReplay.js";

export default function WeaknessGroupCard({ weakness, selected, onSelect }) {
  const { language, t } = useLanguage();
  const count = getMomentsForWeakness(weakness).length;

  return (
    <button
      type="button"
      onClick={() => onSelect(weakness)}
      className={[
        "group rounded-[24px] border p-5 text-left transition-all duration-300",
        selected
          ? "border-purple-300/50 bg-purple-500/[0.10]"
          : "border-white/10 bg-white/[0.04] hover:-translate-y-0.5 hover:border-purple-300/35 hover:bg-purple-500/[0.055]",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-white">{localizeItem(weakness, "name", language)}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">{localizeItem(weakness, "description", language)}</p>
        </div>
        <span className="rounded-full border border-purple-300/25 bg-purple-300/10 px-3 py-1 text-xs text-purple-100">
          {count}
        </span>
      </div>
      <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/45 p-3">
        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
          {t("personalReplay.trainingAction")}
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          {localizeItem(weakness, "recommendedAction", language)}
        </p>
      </div>
      <span className="mt-4 inline-flex rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-200 transition group-hover:border-purple-300/40 group-hover:text-white">
        {t("personalReplay.trainWeakness")}
      </span>
    </button>
  );
}
