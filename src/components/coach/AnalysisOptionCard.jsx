export default function AnalysisOptionCard({
  title,
  description,
  selected = false,
  onClick,
  badge,
  icon,
  className = "",
  children,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f16]",
        selected
          ? "border-purple-400/60 bg-gradient-to-br from-purple-500/18 via-purple-500/10 to-white/[0.05] shadow-[0_0_28px_rgba(168,85,247,0.18)]"
          : "border-white/10 bg-white/[0.04] hover:border-purple-500/30 hover:bg-purple-500/[0.06]",
        className,
      ].join(" ")}
      aria-pressed={selected}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-40" />

      <div className="grid min-w-0 gap-3 sm:flex sm:items-start sm:justify-between sm:gap-4">
        <div className="flex min-w-0 items-start gap-3">
          {icon ? (
            <span
              className={[
                "grid h-10 w-10 shrink-0 place-items-center rounded-xl border text-sm transition-colors duration-200",
                selected
                  ? "border-purple-300/40 bg-purple-400/15 text-purple-100"
                  : "border-white/10 bg-slate-950/50 text-slate-300 group-hover:text-purple-200",
              ].join(" ")}
            >
              {icon}
            </span>
          ) : null}

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">{title}</p>
          </div>

          <span
            className={[
              "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[11px] font-semibold transition-all duration-200 sm:hidden",
              selected
                ? "border-purple-300/50 bg-purple-300 text-slate-950 shadow-[0_0_14px_rgba(216,180,254,0.45)]"
                : "border-white/15 bg-slate-950/60 text-slate-400",
            ].join(" ")}
          >
            {selected ? "✓" : ""}
          </span>
        </div>

        {description ? (
          <p className="min-w-0 text-sm leading-6 text-slate-400 sm:hidden">{description}</p>
        ) : null}

        {badge ? (
          <span className="w-fit max-w-full rounded-full border border-purple-400/30 bg-purple-500/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-purple-200 sm:hidden">
            {badge}
          </span>
        ) : null}

        <div className="hidden shrink-0 flex-col items-end gap-2 sm:flex">
          {badge ? (
            <span className="rounded-full border border-purple-400/30 bg-purple-500/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-purple-200">
              {badge}
            </span>
          ) : null}

          <span
            className={[
              "mt-0.5 grid h-6 w-6 place-items-center rounded-full border text-[11px] font-semibold transition-all duration-200",
              selected
                ? "border-purple-300/50 bg-purple-300 text-slate-950 shadow-[0_0_14px_rgba(216,180,254,0.45)]"
                : "border-white/15 bg-slate-950/60 text-slate-400",
            ].join(" ")}
          >
            {selected ? "✓" : ""}
          </span>
        </div>
      </div>

      {description ? (
        <p className="mt-2 hidden min-w-0 text-sm leading-6 text-slate-400 sm:block">{description}</p>
      ) : null}

      {children ? <div className="mt-4">{children}</div> : null}
    </button>
  );
}
