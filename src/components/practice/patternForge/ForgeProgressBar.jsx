export default function ForgeProgressBar({ value, className = "" }) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <div className={["h-2 overflow-hidden rounded-full bg-slate-950/70", className].join(" ")}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-rose-300 via-purple-300 to-cyan-200 shadow-[0_0_18px_rgba(244,114,182,0.45)] transition-all duration-500"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}
