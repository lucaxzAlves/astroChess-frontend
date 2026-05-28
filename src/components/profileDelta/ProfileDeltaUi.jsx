export function clampScore(value) {
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return 0;
  return Math.min(100, Math.max(0, numericValue));
}

export function formatPercent(value, fallback = "N/A") {
  if (value === 0) return "0%";
  if (!value) return fallback;
  return `${value}%`;
}

export function formatNumber(value, fallback = "N/A") {
  if (value === 0) return "0";
  if (!value) return fallback;
  return Number(value).toLocaleString();
}

export function humanizeKey(value = "") {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (letter) => letter.toUpperCase())
    .replace("E4", "e4")
    .replace("D4", "d4");
}

export function formatDate(value) {
  if (!value) return "Ainda não visto";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function Card({ children, className = "" }) {
  return (
    <div
      className={`astro-card transition-all duration-200 ${className}`}
    >
      {children}
    </div>
  );
}

export function ProgressBar({ value = 0, className = "", tone = "purple" }) {
  const toneClass =
    tone === "rose"
      ? "from-rose-500 to-orange-300 shadow-[0_0_18px_rgba(251,113,133,0.35)]"
      : tone === "yellow"
        ? "from-yellow-300 to-orange-300 shadow-[0_0_18px_rgba(250,204,21,0.25)]"
      : tone === "emerald"
        ? "from-emerald-400 to-cyan-300 shadow-[0_0_18px_rgba(52,211,153,0.35)]"
        : "from-purple-500 to-fuchsia-400 shadow-[0_0_18px_rgba(168,85,247,0.45)]";

  return (
    <div className={`h-2 overflow-hidden rounded-full bg-slate-950/80 ${className}`}>
      <div
        className={`h-full rounded-full bg-gradient-to-r ${toneClass}`}
        style={{ width: `${clampScore(value)}%` }}
      />
    </div>
  );
}

export function Badge({ children, tone = "purple", className = "" }) {
  const toneClass =
    tone === "rose"
      ? "border-rose-500/30 bg-rose-500/10 text-rose-200"
      : tone === "yellow"
        ? "border-yellow-400/30 bg-yellow-400/10 text-yellow-200"
        : tone === "emerald"
          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
          : tone === "slate"
            ? "border-white/10 bg-white/[0.06] text-slate-300"
            : "border-purple-500/30 bg-purple-500/10 text-purple-200";

  return (
    <span className={`w-fit rounded-full border px-3 py-1 text-xs font-medium ${toneClass} ${className}`}>
      {children}
    </span>
  );
}

export function EmptyState({ label = "Ainda não há dados de perfil." }) {
  return (
    <div className="rounded-xl border border-dashed border-white/10 bg-slate-950/35 p-5 text-sm text-slate-500">
      {label}
    </div>
  );
}

export function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-end">
      <div>
        {eyebrow ? (
          <p className="astro-eyebrow">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="astro-gradient-title mt-2 text-2xl font-semibold">{title}</h2>
        {description ? (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function severityTone(severity = "") {
  const normalizedSeverity = severity.toLowerCase();
  if (normalizedSeverity.includes("critical") || normalizedSeverity.includes("high")) return "rose";
  if (normalizedSeverity.includes("medium")) return "yellow";
  if (normalizedSeverity.includes("low")) return "emerald";
  return "purple";
}
