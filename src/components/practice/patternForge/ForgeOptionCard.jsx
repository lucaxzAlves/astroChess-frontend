import { useLanguage } from "../../../contexts/LanguageContext.jsx";

export default function ForgeOptionCard({
  title,
  description,
  meta,
  selected,
  recommended,
  onClick,
  children,
}) {
  const { t } = useLanguage();

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group h-full rounded-[24px] border p-5 text-left transition-all duration-300",
        selected
          ? "border-rose-300/55 bg-rose-400/[0.10] shadow-[0_0_32px_rgba(244,63,94,0.16)]"
          : "border-white/10 bg-white/[0.04] hover:-translate-y-0.5 hover:border-rose-300/35 hover:bg-rose-400/[0.055]",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {recommended ? (
          <span className="shrink-0 rounded-full border border-purple-300/25 bg-purple-300/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-purple-100">
            {t("patternForge.recommended")}
          </span>
        ) : null}
      </div>
      {description ? <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p> : null}
      {meta ? (
        <p className="mt-4 rounded-2xl border border-white/10 bg-slate-950/35 px-3 py-2 text-xs font-medium text-slate-300">
          {meta}
        </p>
      ) : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </button>
  );
}
