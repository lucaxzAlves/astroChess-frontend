import { useLanguage } from "../../contexts/LanguageContext.jsx";

function StatBadge({ children }) {
  return (
    <span className="rounded-full border border-white/10 bg-slate-950/55 px-3 py-1 text-xs font-medium text-slate-300">
      {children}
    </span>
  );
}

export default function LearningPathCard({ path, selected = false, onOpen }) {
  const { t } = useLanguage();
  const moduleCount = path.modules?.length || path.moduleCount || 0;
  const pathTitle = t(`academy.path.${path.id}.title`, path.title);
  const pathDescription = t(`academy.path.${path.id}.description`, path.description);
  const pathLevel = t(`academy.path.${path.id}.level`, path.level);
  const pathTheme = t(`academy.path.${path.id}.theme`, path.theme);
  const pathDuration = t(`academy.path.${path.id}.duration`, path.estimatedDuration);

  return (
    <button
      type="button"
      onClick={onOpen}
      className={[
        "group flex h-full flex-col rounded-[28px] border p-5 text-left transition-all duration-300",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f16]",
        selected
          ? "border-violet-300/35 bg-violet-400/[0.07] shadow-[0_0_26px_rgba(124,58,237,0.14)]"
          : "border-white/10 bg-white/[0.035] hover:-translate-y-1 hover:border-violet-300/25 hover:bg-violet-400/[0.045] hover:shadow-[0_18px_44px_rgba(0,0,0,0.24)]",
      ].join(" ")}
    >
      <div className="relative h-32 overflow-hidden rounded-[22px] border border-white/10 bg-gradient-to-br from-slate-900 via-violet-950/30 to-slate-950">
        <div className="absolute inset-0 opacity-15 [background-image:linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:32px_32px]" />
        <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-violet-300/12 blur-2xl transition duration-300 group-hover:bg-violet-300/18" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-end justify-between gap-3">
            <div className="grid h-14 w-14 place-items-center rounded-2xl border border-violet-200/20 bg-violet-200/8 text-violet-100 shadow-[0_12px_24px_rgba(0,0,0,0.22)]">
              <svg
                aria-hidden="true"
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              >
                <path d="M5.5 5.5A2.5 2.5 0 0 1 8 3h10.5v15H8a2.5 2.5 0 0 0-2.5 2.5v-15Z" />
                <path d="M9 7h5.5" />
                <path d="M9 10h4" />
                <path d="M5.5 20.5A2.5 2.5 0 0 1 8 18h10.5" />
              </svg>
            </div>
            <div className="grid flex-1 grid-cols-5 gap-1.5">
              {[0, 1, 2, 3, 4].map((item) => (
                <span
                  key={item}
                  className={[
                    "h-2 rounded-full",
                    item < Math.ceil((path.progress || 0) / 20)
                      ? "bg-violet-200/80"
                      : "bg-white/14",
                  ].join(" ")}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col pt-5">
        <div className="flex flex-wrap gap-2">
          <StatBadge>{pathLevel}</StatBadge>
          <StatBadge>{pathTheme}</StatBadge>
        </div>

        <h2 className="mt-4 text-2xl font-semibold text-white">{pathTitle}</h2>
        <p className="mt-3 max-h-32 flex-1 overflow-y-auto pr-2 text-sm leading-6 text-slate-400 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.35)_transparent]">
          {pathDescription}
        </p>

        <div className="mt-5 grid gap-3">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{t("academy.progress")}</span>
              <span>{path.progress || 0}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-950/70">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-300/80 to-cyan-200/70"
                style={{ width: `${Math.min(100, Math.max(0, path.progress || 0))}%` }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <StatBadge>{pathDuration}</StatBadge>
              <StatBadge>
                {t("academy.moduleCount", undefined, { count: moduleCount })}
              </StatBadge>
            </div>
            <span className="rounded-xl border border-violet-200/25 bg-violet-300/12 px-4 py-2 text-sm font-semibold text-violet-100 transition group-hover:border-violet-200/40 group-hover:bg-violet-300/18">
              {t("academy.openPath")}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
