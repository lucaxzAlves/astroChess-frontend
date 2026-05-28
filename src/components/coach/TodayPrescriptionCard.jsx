import { useState } from "react";
import { Badge, Card, EmptyState } from "../profileDelta/ProfileDeltaUi.jsx";

export default function TodayPrescriptionCard({ prescription }) {
  const [completed, setCompleted] = useState(false);

  if (!prescription) {
    return <EmptyState label="A prescrição de hoje aparecerá depois que um plano de treino for gerado." />;
  }

  return (
    <Card className="p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-medium text-purple-300">Prescrição de hoje</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{prescription?.task}</h2>
        </div>
        <Badge tone={completed ? "emerald" : "purple"}>
          {completed ? "Concluída" : prescription?.difficulty ?? "Pronta"}
        </Badge>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          ["Duração", prescription?.duration],
          ["Dificuldade", prescription?.difficulty],
          ["Motivo", prescription?.reason],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-slate-950/45 p-4">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-1 text-sm font-medium leading-6 text-slate-200">{value ?? "Pendente"}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-2">
        {(prescription?.checklist ?? []).map((item) => (
          <label
            key={item}
            className="flex items-start gap-3 rounded-xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm leading-6 text-slate-300"
          >
            <input type="checkbox" className="mt-1 h-4 w-4 accent-purple-500" />
            <span>{item}</span>
          </label>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setCompleted(true)}
        className="mt-5 w-full rounded-xl bg-purple-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-400 disabled:cursor-default disabled:bg-emerald-500"
        disabled={completed}
      >
        {completed ? "Marcada como concluída" : "Marcar como concluída"}
      </button>
    </Card>
  );
}
