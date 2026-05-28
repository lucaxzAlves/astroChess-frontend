const typeStyles = {
  book: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
  video: "border-sky-300/25 bg-sky-300/10 text-sky-100",
  course: "border-violet-200/20 bg-violet-200/[0.07] text-violet-100",
  article: "border-amber-300/25 bg-amber-300/10 text-amber-100",
};

export default function ResourceCard({ resource }) {
  const type = resource.type || "resource";

  return (
    <article className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 transition hover:border-violet-300/25 hover:bg-violet-400/[0.04]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span
          className={[
            "rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
            typeStyles[type] || "border-white/10 bg-white/[0.04] text-slate-300",
          ].join(" ")}
        >
          {type}
        </span>
        <span className="text-xs text-slate-500">{resource.author}</span>
      </div>

      <h4 className="mt-3 break-words text-base font-semibold text-white">{resource.title}</h4>
      <p className="mt-2 max-h-32 overflow-y-auto break-words pr-2 text-sm leading-6 text-slate-400 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.35)_transparent]">
        {resource.description}
      </p>
      <div className="mt-4 max-h-20 overflow-y-auto break-all rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-500 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.35)_transparent]">
        {resource.url}
      </div>
    </article>
  );
}
