import { useLanguage } from "../../contexts/LanguageContext.jsx";

const difficultyStyles = {
  Easy: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
  Medium: "border-amber-300/25 bg-amber-300/10 text-amber-100",
  Hard: "border-rose-300/25 bg-rose-300/10 text-rose-100",
};

export default function PuzzlePreviewCard({ puzzle }) {
  const { t } = useLanguage();

  return (
    <article className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 transition hover:border-violet-300/25 hover:bg-violet-400/[0.04]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full border border-violet-200/20 bg-violet-200/[0.07] px-3 py-1 text-xs font-medium text-violet-100">
          {puzzle.theme}
        </span>
        <span
          className={[
            "rounded-full border px-3 py-1 text-xs font-medium",
            difficultyStyles[puzzle.difficulty] || "border-white/10 bg-white/[0.04] text-slate-300",
          ].join(" ")}
        >
          {puzzle.difficulty}
        </span>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-[#080a0e] p-3">
        <div className="grid aspect-square grid-cols-4 overflow-hidden rounded-xl border border-white/10">
          {Array.from({ length: 16 }).map((_, index) => (
            <span
              key={index}
              className={index % 2 === Math.floor(index / 4) % 2 ? "bg-violet-200/60" : "bg-slate-800/80"}
            />
          ))}
        </div>
      </div>

      <p className="mt-4 max-h-16 overflow-y-auto break-all pr-2 font-mono text-[11px] leading-5 text-slate-500 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.35)_transparent]">
        {puzzle.fen}
      </p>
      <p className="mt-3 max-h-32 overflow-y-auto pr-2 text-sm leading-6 text-slate-400 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.35)_transparent]">
        {puzzle.explanation}
      </p>

      <button
        type="button"
        className="mt-4 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-violet-300/30 hover:text-white"
      >
        {t("academy.solvePuzzle")}
      </button>
    </article>
  );
}
