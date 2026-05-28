import { useMemo, useState } from "react";
import { Card, EmptyState, humanizeKey } from "../profileDelta/ProfileDeltaUi.jsx";

function getWeakestSkill(skillMap = {}) {
  return Object.entries(skillMap)
    .filter(([key, value]) => key !== "overallScore" && value && typeof value === "object")
    .map(([key, value]) => ({
      key,
      label: humanizeKey(key),
      value: value?.value ?? 0,
    }))
    .sort((a, b) => a.value - b.value)[0];
}

function buildInitialMessages(profileDelta) {
  const currentFocus = profileDelta?.recommendations?.currentFocus?.title ?? "seu foco atual";
  const topBlocker = profileDelta?.growthBlockers?.[0]?.title ?? "seu principal bloqueador";

  return [
    {
      role: "coach",
      text: `Revisei seu perfil. O tema imediato de treino é ${currentFocus}, porque ${topBlocker.toLowerCase()} está influenciando decisões demais.`,
    },
    {
      role: "user",
      text: "Devo estudar mais aberturas esta semana?",
    },
    {
      role: "coach",
      text: "Apenas nas linhas que economizam tempo e criam meios-jogos familiares. O trabalho de abertura deve apoiar o foco atual, não desviar dele.",
    },
  ];
}

export default function CoachChat({ profileDelta }) {
  const [messages, setMessages] = useState(() => buildInitialMessages(profileDelta));
  const [input, setInput] = useState("");
  const weakestSkill = useMemo(() => getWeakestSkill(profileDelta?.skillMap), [profileDelta]);
  const currentFocus = profileDelta?.recommendations?.currentFocus?.title ?? "o foco atual";
  const topBlocker = profileDelta?.growthBlockers?.[0]?.title ?? "o principal bloqueador";

  const sendMessage = () => {
    const cleanInput = input.trim();
    if (!cleanInput) return;

    setMessages((current) => [
      ...current,
      { role: "user", text: cleanInput },
      {
        role: "coach",
        text: `Eu conectaria isso a ${currentFocus}. Seu principal bloqueador é ${topBlocker}, e a área mais fraca é ${weakestSkill?.label ?? "ainda em medição"}${weakestSkill ? ` em ${weakestSkill.value}/100` : ""}. Como próximo passo, escolha uma posição, aplique a rotina do relógio e escreva os lances candidatos antes de adicionar teoria nova.`,
      },
    ]);
    setInput("");
  };

  if (!profileDelta) {
    return <EmptyState label="O chat do coach precisa de dados de perfil para personalizar respostas." />;
  }

  return (
    <Card className="flex min-h-[520px] flex-col p-6">
      <h2 className="text-2xl font-semibold text-white">Pergunte ao seu coach</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        Chat simulado por enquanto. As respostas usam o perfil atual, sem chamar uma API de IA real.
      </p>

      <div className="mt-5 flex-1 space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/40 p-4">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
              message.role === "coach"
                ? "border border-purple-500/20 bg-purple-500/10 text-purple-50"
                : "ml-auto bg-white/[0.08] text-slate-100"
            }`}
          >
            {message.text}
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-3">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") sendMessage();
          }}
          placeholder="Pergunte sobre seu treino..."
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/10"
        />
        <button
          type="button"
          onClick={sendMessage}
          className="rounded-xl bg-purple-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-400"
        >
          Enviar
        </button>
      </div>
    </Card>
  );
}
