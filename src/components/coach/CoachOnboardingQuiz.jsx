import { useMemo, useState } from "react";
import { ProgressBar } from "../profileDelta/ProfileDeltaUi.jsx";
import AnalysisOptionCard from "./AnalysisOptionCard.jsx";

const quizSteps = [
  {
    key: "mainGoal",
    eyebrow: "Etapa 1",
    title: "Qual é seu principal objetivo no xadrez agora?",
    description: "Vamos usar isso para definir o que seu coach prioriza primeiro.",
    options: [
      {
        value: "gain_rating",
        title: "Ganhar rating",
        description: "Focar nos hábitos que acumulam resultado mais rápido.",
        badge: "Recomendado",
        icon: "↗",
      },
      {
        value: "prepare_tournaments",
        title: "Preparar para torneios",
        description: "Direcionar o coach para preparação prática, forma e precisão competitiva.",
        icon: "♟",
      },
      {
        value: "improve_calculation",
        title: "Melhorar cálculo",
        description: "Treinar disciplina de lances candidatos e precisão em linhas forçadas.",
        icon: "⟡",
      },
      {
        value: "fix_blunders",
        title: "Corrigir capivaradas",
        description: "Mirar primeiro falhas táticas recorrentes e decisões impulsivas.",
        badge: "Recomendado",
        icon: "!",
      },
      {
        value: "improve_openings",
        title: "Melhorar aberturas",
        description: "Fortalecer confiança no repertório, ordem de lances e planos iniciais.",
        icon: "◴",
      },
      {
        value: "improve_endgames",
        title: "Melhorar finais",
        description: "Priorizar conversão técnica e precisão em posições simplificadas.",
        icon: "⌘",
      },
    ],
  },
  {
    key: "currentLevel",
    eyebrow: "Etapa 2",
    title: "O que melhor descreve seu nível atual?",
    description: "Isso ajusta o quão ambiciosas e exigentes serão as explicações do coach.",
    options: [
      { value: "beginner", title: "Iniciante", description: "Preciso de fundamentos, padrões e planos simples.", icon: "Ⅰ" },
      { value: "intermediate", title: "Intermediário", description: "Entendo o básico, mas ainda perco para erros recorrentes.", icon: "Ⅱ" },
      {
        value: "advanced_club_player",
        title: "Jogador de clube avançado",
        description: "Quero diagnóstico mais afiado e estrutura mais forte no treino.",
        icon: "Ⅲ",
      },
      {
        value: "competitive_player",
        title: "Jogador competitivo",
        description: "Jogo sério e quero feedback útil para torneios.",
        icon: "Ⅳ",
      },
      {
        value: "titled_or_near_titled",
        title: "Titulado / quase titulado",
        description: "Quero feedback conciso, com alto sinal e profundidade estratégica.",
        icon: "Ⅴ",
      },
    ],
  },
  {
    key: "perceivedPlayingStyle",
    eyebrow: "Etapa 3",
    title: "Como você costuma jogar?",
    description: "Isso ajuda o coach a explicar erros numa linguagem alinhada aos seus instintos.",
    options: [
      { value: "tactical_aggressive", title: "Tático e agressivo", description: "Gosto de iniciativa, ataques e jogo concreto.", icon: "⚔" },
      { value: "positional_strategic", title: "Posicional e estratégico", description: "Prefiro pressão de longo prazo, estrutura e planos.", icon: "◫" },
      { value: "solid_defensive", title: "Sólido e defensivo", description: "Valorizo segurança, solidez e redução de risco.", icon: "⛨" },
      { value: "dynamic_practical", title: "Dinâmico e prático", description: "Confio em decisões flexíveis e chances práticas.", icon: "⟲" },
      { value: "unknown", title: "Ainda não sei", description: "Deixe o coach inferir o estilo ao longo do tempo.", icon: "?" },
    ],
  },
  {
    key: "perceivedWeakness",
    eyebrow: "Etapa 4",
    title: "O que você sente que mais prejudica seus resultados?",
    description: "Vamos transformar isso na primeira lente recorrente de diagnóstico do coach.",
    options: [
      { value: "time_pressure", title: "Pressão do tempo", description: "Conheço ideias, mas o relógio costuma arruinar a execução.", icon: "⏱" },
      { value: "tactical_blunders", title: "Capivaradas táticas", description: "Táticas simples e recursos defensivos ainda escapam.", icon: "⚠" },
      { value: "poor_openings", title: "Aberturas fracas", description: "Saio da abertura com posições ruins ou muito tempo gasto.", icon: "◔" },
      { value: "endgame_technique", title: "Técnica de finais", description: "Tenho dificuldade para converter, defender ou escolher planos no fim.", icon: "♚" },
      { value: "psychological_tilt", title: "Tilt psicológico", description: "Um momento ruim muda a qualidade da fase seguinte.", icon: "☄" },
      {
        value: "converting_winning_positions",
        title: "Converter posições ganhas",
        description: "Frequentemente mantenho partidas complicadas em vez de consolidar a vitória.",
        icon: "◎",
      },
    ],
  },
  {
    key: "coachTone",
    eyebrow: "Etapa 5",
    title: "Que tipo de coach você prefere?",
    description: "Isso controla o tom das explicações, exercícios e orientações futuras da IA.",
    options: [
      { value: "direct_demanding", title: "Direto e exigente", description: "Direto ao ponto, sem suavizar demais.", icon: "▲" },
      { value: "calm_explanatory", title: "Calmo e explicativo", description: "Raciocínio claro, menor pressão e mais apoio.", icon: "☾" },
      { value: "strategic_deep", title: "Estratégico e profundo", description: "Explicações longas conectando planos e estruturas.", icon: "◇" },
      { value: "practical_objective", title: "Prático e objetivo", description: "Conselho acionável primeiro, teoria depois.", icon: "→" },
      { value: "motivational", title: "Motivacional", description: "Energia positiva, impulso e construção de confiança.", icon: "✦" },
    ],
  },
  {
    key: "dailyTrainingMinutes",
    eyebrow: "Etapa 6",
    title: "Quanto tempo você pode treinar por dia?",
    description: "O coach vai ajustar futuros planos de treino a esse ritmo.",
    options: [
      { value: 15, title: "15 minutos", description: "Micro-sessões, alto foco e sem atrito desperdiçado.", icon: "15" },
      { value: 30, title: "30 minutos", description: "Um bloco diário compacto e sustentável.", icon: "30" },
      { value: 45, title: "45 minutos", description: "Tempo suficiente para diagnóstico, exercícios e revisão.", icon: "45" },
      { value: 60, title: "60 minutos", description: "Profundidade equilibrada com espaço para um bloco sério.", icon: "60" },
      { value: 90, title: "90+ minutos", description: "Pronto para trabalho estruturado com ciclos mais profundos.", icon: "90" },
    ],
  },
];

function buildProfile(answers) {
  return {
    mainGoal: answers.mainGoal,
    currentLevel: answers.currentLevel,
    perceivedPlayingStyle: answers.perceivedPlayingStyle,
    perceivedWeakness: answers.perceivedWeakness,
    coachTone: answers.coachTone,
    dailyTrainingMinutes: Number(answers.dailyTrainingMinutes) || 0,
  };
}

export default function CoachOnboardingQuiz({ onComplete }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const currentStep = quizSteps[stepIndex];
  const progressValue = useMemo(
    () => ((stepIndex + 1) / quizSteps.length) * 100,
    [stepIndex]
  );
  const hasSelection = answers[currentStep.key] !== undefined;

  const handleNext = () => {
    if (!hasSelection) return;

    if (stepIndex === quizSteps.length - 1) {
      onComplete(buildProfile(answers));
      return;
    }

    setStepIndex((current) => current + 1);
  };

  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden rounded-[32px] border border-white/10 bg-[#090b11] px-4 py-10 shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-12%] h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute right-[-4%] top-[18%] h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute bottom-[-12%] left-[24%] h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.12),transparent_40%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_35%)]" />
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.24em] text-purple-200">
            Configuração do AI Coach
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Vamos moldar o coach antes que ele molde seu xadrez.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            Seis escolhas guiadas definem sua lente de diagnóstico, tom de treino e o tipo de pressão de evolução que o coach deve aplicar.
          </p>
        </div>

        <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-purple-300">
                  {currentStep.eyebrow}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                  {currentStep.title}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                  {currentStep.description}
                </p>
              </div>

              <div className="min-w-[220px] rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-slate-500">
                  <span>Progresso</span>
                  <span>
                    {stepIndex + 1}/{quizSteps.length}
                  </span>
                </div>
                <ProgressBar value={progressValue} className="mt-3" />
                <p className="mt-3 text-xs leading-5 text-slate-500">
                  Suas respostas ajudam a moldar o perfil de coach usado no AstroChess.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {currentStep.options.map((option) => (
                <AnalysisOptionCard
                  key={`${currentStep.key}-${option.value}`}
                  title={option.title}
                  description={option.description}
                  selected={answers[currentStep.key] === option.value}
                  onClick={() =>
                    setAnswers((current) => ({
                      ...current,
                      [currentStep.key]: option.value,
                    }))
                  }
                  badge={option.badge}
                  icon={option.icon}
                />
              ))}
            </div>

            <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="h-2 w-2 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.9)]" />
                Suas respostas definirão a personalidade do coach e os padrões da análise.
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
                  disabled={stepIndex === 0}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-purple-400/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!hasSelection}
                  className="rounded-xl bg-purple-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-950/40 transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {stepIndex === quizSteps.length - 1 ? "Criar meu coach" : "Próxima etapa"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
