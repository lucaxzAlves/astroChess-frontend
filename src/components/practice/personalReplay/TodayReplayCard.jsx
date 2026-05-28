import { useLanguage } from "../../../contexts/LanguageContext.jsx";
import { localizeItem } from "../../../data/mockPersonalReplay.js";

export default function TodayReplayCard({ moment, onStart }) {
  const { language, t } = useLanguage();

  if (!moment) return null;

  return (
    <section className="rounded-[28px] border border-cyan-200/20 bg-[linear-gradient(135deg,rgba(34,211,238,0.10),rgba(168,85,247,0.08),rgba(15,23,42,0.40))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
            {t("personalReplay.todaysReplay")}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            {localizeItem(moment, "theme", language)} -{" "}
            {t("personalReplay.moveNumber", undefined, { move: moment.moveNumber })} vs{" "}
            {moment.opponent}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
            {localizeItem(moment, "prompt", language)}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-rose-300/25 bg-rose-300/10 px-3 py-1 text-xs text-rose-100">
              {t(`personalReplay.severity.${moment.severity}`, moment.severity)}
            </span>
            <span className="rounded-full border border-white/10 bg-slate-950/45 px-3 py-1 text-xs text-slate-300">
              {t(`personalReplay.phase.${moment.phase}`, moment.phase)}
            </span>
            <span className="rounded-full border border-white/10 bg-slate-950/45 px-3 py-1 text-xs text-slate-300">
              {moment.date}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onStart(moment)}
          className="rounded-2xl bg-cyan-200 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100"
        >
          {t("personalReplay.startReplay")}
        </button>
      </div>
    </section>
  );
}
