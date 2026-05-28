import { useLanguage } from "../../../contexts/LanguageContext.jsx";

export default function ReplayProgressCard({ progress }) {
  const { t } = useLanguage();
  const stats = [
    ["personalReplay.trainedToday", progress.momentsTrainedToday],
    ["personalReplay.currentStreak", progress.currentStreak],
    ["personalReplay.replayAccuracy", `${progress.accuracy}%`],
    ["personalReplay.masteredMoments", progress.masteredMoments],
    ["personalReplay.needsReview", progress.needsReview],
  ];

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
      <h2 className="text-xl font-semibold text-white">{t("personalReplay.progressTitle")}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map(([key, value]) => (
          <div key={key} className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{t(key)}</p>
            <p className="mt-1 text-lg font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
