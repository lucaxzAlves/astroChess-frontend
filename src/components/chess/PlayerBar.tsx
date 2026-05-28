type Props = {
  name: string;
  color: "white" | "black";
  rating: number;
};

export default function PlayerBar({ name, color, rating }: Props) {
  return (
    <div className="flex w-full max-w-[720px] min-w-0 items-center justify-between rounded-xl border border-violet-400/20 bg-[#0a1224] px-4 py-3 shadow-[0_10px_26px_rgba(0,0,0,0.35)] md:min-w-[420px]">
      <div>
        <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
          {color === "white" ? "Brancas" : "Pretas"}
        </p>
        <p className="text-sm font-semibold text-slate-100">{name}</p>
      </div>
      <p className="rounded-md border border-violet-400/20 bg-violet-500/15 px-2.5 py-1 text-sm text-violet-100">
        {rating}
      </p>
    </div>
  );
}
