export const defaultForgeConfig = {
  cyclePreset: "balanced",
  puzzleSetSize: 100,
  roundCount: 4,
  compressionPreset: "balanced",
  roundDays: [14, 7, 4, 2],
  automaticThemesEnabled: true,
  manualThemes: [],
  themes: [],
  difficulty: "adaptive",
  repeatMissedPuzzles: true,
  repeatSlowSolves: true,
  includePersonalWeaknesses: true,
  prioritizeWeaknesses: true,
  includeMixedReview: true,
  endWithMistakeReview: true,
};

export const forgePresets = [
  {
    id: "light",
    defaults: {
      ...defaultForgeConfig,
      cyclePreset: "light",
      compressionPreset: "light",
      roundCount: 3,
      roundDays: [21, 14, 7],
    },
    translations: {
      "pt-BR": {
        title: "Ciclo Leve",
        description: "Mais dias por round para construir reconhecimento sem pressa.",
        meta: "100 puzzles · 3 rounds · 21/14/7 dias",
      },
      en: {
        title: "Light Cycle",
        description: "More days per round to build recognition without rushing.",
        meta: "100 puzzles · 3 rounds · 21/14/7 days",
      },
    },
  },
  {
    id: "balanced",
    recommended: true,
    defaults: defaultForgeConfig,
    translations: {
      "pt-BR": {
        title: "Ciclo Equilibrado",
        description: "Compressao progressiva para evoluir com consistencia sem esgotar.",
        meta: "100 puzzles · 4 rounds · 14/7/4/2 dias",
      },
      en: {
        title: "Balanced Cycle",
        description: "Progressive compression for consistent improvement without burnout.",
        meta: "100 puzzles · 4 rounds · 14/7/4/2 days",
      },
    },
  },
  {
    id: "intense",
    defaults: {
      ...defaultForgeConfig,
      cyclePreset: "intense",
      compressionPreset: "intense",
      roundDays: [7, 4, 2, 1],
    },
    translations: {
      "pt-BR": {
        title: "Ciclo Intenso",
        description: "Compressao agressiva para quem quer alta pressao de reconhecimento.",
        meta: "100 puzzles · 4 rounds · 7/4/2/1 dias",
      },
      en: {
        title: "Intense Cycle",
        description: "Aggressive compression for high recognition pressure.",
        meta: "100 puzzles · 4 rounds · 7/4/2/1 days",
      },
    },
  },
  {
    id: "deep_set",
    defaults: {
      ...defaultForgeConfig,
      cyclePreset: "deep_set",
      puzzleSetSize: 200,
      difficulty: "challenging",
    },
    translations: {
      "pt-BR": {
        title: "Pattern Set Profundo",
        description: "Conjunto maior para jogadores que querem volume e calculo serio.",
        meta: "200 puzzles · 4 rounds · dificuldade desafiadora",
      },
      en: {
        title: "Deep Pattern Set",
        description: "A larger set for players who want volume and serious calculation.",
        meta: "200 puzzles · 4 rounds · challenging difficulty",
      },
    },
  },
  {
    id: "weakness_repair",
    defaults: {
      ...defaultForgeConfig,
      cyclePreset: "weakness_repair",
      puzzleSetSize: 100,
      manualThemes: [],
      themes: [],
      includePersonalWeaknesses: true,
      prioritizeWeaknesses: true,
    },
    translations: {
      "pt-BR": {
        title: "Reparo de Fraquezas",
        description: "Foco maior em padroes extraidos das suas fraquezas recorrentes.",
        meta: "100 puzzles · fraquezas priorizadas · erros retornam",
      },
      en: {
        title: "Weakness Repair",
        description: "Focus mostly on patterns extracted from your recurring weaknesses.",
        meta: "100 puzzles · weaknesses prioritized · mistakes return",
      },
    },
  },
  {
    id: "custom",
    defaults: {
      ...defaultForgeConfig,
      cyclePreset: "custom",
    },
    translations: {
      "pt-BR": {
        title: "Ciclo Personalizado",
        description: "Monte manualmente o tamanho do set e o cronograma de compressao.",
        meta: "Controle do Pattern Set e dos rounds",
      },
      en: {
        title: "Custom Cycle",
        description: "Manually build the set size and compression schedule.",
        meta: "Control the Pattern Set and rounds",
      },
    },
  },
];

export const compressionPresets = [
  {
    id: "light",
    roundDays: [21, 14, 7],
    translations: {
      "pt-BR": {
        title: "Leve",
        description: "Mais espacado, ideal para rotina tranquila.",
      },
      en: {
        title: "Light",
        description: "More spaced out, ideal for a calmer routine.",
      },
    },
  },
  {
    id: "balanced",
    recommended: true,
    roundDays: [14, 7, 4, 2],
    translations: {
      "pt-BR": {
        title: "Equilibrado",
        description: "Boa progressao de reconhecimento sem queimar energia.",
      },
      en: {
        title: "Balanced",
        description: "Good recognition progression without burning out.",
      },
    },
  },
  {
    id: "intense",
    roundDays: [7, 4, 2, 1],
    translations: {
      "pt-BR": {
        title: "Intenso",
        description: "Compressao rapida para treino pesado e curto.",
      },
      en: {
        title: "Intense",
        description: "Fast compression for heavy, short-cycle training.",
      },
    },
  },
  {
    id: "custom",
    roundDays: [14, 7, 4, 2],
    translations: {
      "pt-BR": {
        title: "Personalizado",
        description: "Ajuste manualmente os dias de cada round.",
      },
      en: {
        title: "Custom",
        description: "Manually adjust the days in each round.",
      },
    },
  },
];

export const forgeThemes = [
  {
    id: "tactics",
    recommended: true,
    translations: {
      "pt-BR": {
        title: "Tatica",
        description: "Para cravadas, garfos, ataques descobertos, sacrificios e lances forcados.",
        hint: "Reconhecimento rapido",
      },
      en: {
        title: "Tactics",
        description: "For pins, forks, discovered attacks, sacrifices, and forcing moves.",
        hint: "Fast recognition",
      },
    },
  },
  {
    id: "calculation",
    recommended: true,
    translations: {
      "pt-BR": {
        title: "Calculo",
        description: "Para linhas forcadas, lances candidatos e precisao de ordem de lances.",
        hint: "Variantes e revisao",
      },
      en: {
        title: "Calculation",
        description: "For forcing lines, candidate moves, and move-order precision.",
        hint: "Lines and checking",
      },
    },
  },
  {
    id: "king_safety",
    recommended: true,
    translations: {
      "pt-BR": {
        title: "Seguranca do Rei",
        description: "Para ameacas de mate, reis expostos e consciencia defensiva.",
        hint: "Forcing moves first",
      },
      en: {
        title: "King Safety",
        description: "For mate threats, exposed kings, and defensive awareness.",
        hint: "Forcing moves first",
      },
    },
  },
  {
    id: "endgames",
    translations: {
      "pt-BR": {
        title: "Finais",
        description: "Tecnica, atividade do rei, finais de torre e conversao limpa.",
        hint: "Tecnica",
      },
      en: {
        title: "Endgames",
        description: "Technique, king activity, rook endings, and clean conversion.",
        hint: "Technique",
      },
    },
  },
  {
    id: "openings",
    translations: {
      "pt-BR": {
        title: "Aberturas",
        description: "Planos iniciais, estruturas tipicas e punicoes de imprecisoes.",
        hint: "Planos",
      },
      en: {
        title: "Openings",
        description: "Early plans, typical structures, and punishment of inaccuracies.",
        hint: "Plans",
      },
    },
  },
  {
    id: "positional_decisions",
    translations: {
      "pt-BR": {
        title: "Decisoes Posicionais",
        description: "Melhoria de pecas, casas fracas, trocas e planos de longo prazo.",
        hint: "Estrategia",
      },
      en: {
        title: "Positional Decisions",
        description: "Piece improvement, weak squares, exchanges, and long-term plans.",
        hint: "Strategy",
      },
    },
  },
  {
    id: "defensive_resources",
    translations: {
      "pt-BR": {
        title: "Recursos Defensivos",
        description: "Contra-jogo, simplificacao, defesa ativa e salvamentos praticos.",
        hint: "Resistencia",
      },
      en: {
        title: "Defensive Resources",
        description: "Counterplay, simplification, active defense, and practical saves.",
        hint: "Resistance",
      },
    },
  },
  {
    id: "conversion",
    translations: {
      "pt-BR": {
        title: "Conversao",
        description: "Transforme vantagem em vitoria com precisao e paciencia.",
        hint: "Finalizacao",
      },
      en: {
        title: "Conversion",
        description: "Turn advantages into wins with precision and patience.",
        hint: "Finishing",
      },
    },
  },
  {
    id: "time_pressure",
    translations: {
      "pt-BR": {
        title: "Pressao no Tempo",
        description: "Decisoes rapidas, prioridades e padroes sob relogio baixo.",
        hint: "Velocidade",
      },
      en: {
        title: "Time Pressure",
        description: "Fast decisions, priorities, and patterns under a low clock.",
        hint: "Speed",
      },
    },
  },
  {
    id: "candidate_moves",
    translations: {
      "pt-BR": {
        title: "Lances Candidatos",
        description: "Crie listas melhores antes de mergulhar em variantes.",
        hint: "Metodo",
      },
      en: {
        title: "Candidate Moves",
        description: "Build better move lists before diving into variations.",
        hint: "Method",
      },
    },
  },
  {
    id: "pawn_breaks",
    translations: {
      "pt-BR": {
        title: "Rupturas de Peoes",
        description: "Reconheca quando mudar a estrutura e abrir linhas.",
        hint: "Estrutura",
      },
      en: {
        title: "Pawn Breaks",
        description: "Recognize when to change the structure and open lines.",
        hint: "Structure",
      },
    },
  },
];

export const forgeDifficultyOptions = [
  {
    id: "adaptive",
    recommended: true,
    translations: {
      "pt-BR": {
        title: "Adaptativa",
        description: "A dificuldade ajusta com base nos seus resultados durante o ciclo.",
      },
      en: {
        title: "Adaptive",
        description: "Difficulty adjusts based on your results during the cycle.",
      },
    },
  },
  {
    id: "comfortable",
    translations: {
      "pt-BR": {
        title: "Confortavel",
        description: "Posicoes mais solucionaveis para construir confianca de padrao.",
      },
      en: {
        title: "Comfortable",
        description: "Mostly solvable positions to build pattern confidence.",
      },
    },
  },
  {
    id: "challenging",
    translations: {
      "pt-BR": {
        title: "Desafiadora",
        description: "Puzzles mais duros que exigem calculo mais profundo.",
      },
      en: {
        title: "Challenging",
        description: "Harder puzzles that force deeper calculation.",
      },
    },
  },
  {
    id: "punishing",
    translations: {
      "pt-BR": {
        title: "Punitiva",
        description: "Dificuldade alta. Boa para avancados, brutal sem foco.",
      },
      en: {
        title: "Punishing",
        description: "High difficulty. Good for advanced players, brutal if unfocused.",
      },
    },
  },
];

export const forgePuzzleCounts = [50, 100, 200];
export const forgeRoundCounts = [3, 4, 5];

export const forgeRepetitionRules = [
  {
    id: "repeatMissedPuzzles",
    defaultValue: true,
    translations: {
      "pt-BR": {
        title: "Repetir puzzles errados",
        description: "Qualquer puzzle falho recebe prioridade dentro do round atual.",
      },
      en: {
        title: "Repeat missed puzzles",
        description: "Any failed puzzle gets priority inside the current round.",
      },
    },
  },
  {
    id: "repeatSlowSolves",
    defaultValue: true,
    translations: {
      "pt-BR": {
        title: "Repetir acertos lentos",
        description: "Respostas corretas mas lentas voltam para melhorar velocidade.",
      },
      en: {
        title: "Repeat slow solves",
        description: "Correct but slow answers return for speed improvement.",
      },
    },
  },
  {
    id: "prioritizeWeaknesses",
    defaultValue: true,
    translations: {
      "pt-BR": {
        title: "Priorizar fraquezas pessoais",
        description: "Da mais peso a temas encontrados no seu perfil de Analysis.",
      },
      en: {
        title: "Personal weakness priority",
        description: "Give more weight to themes found in your Analysis profile.",
      },
    },
  },
  {
    id: "includeMixedReview",
    defaultValue: true,
    translations: {
      "pt-BR": {
        title: "Revisao misturada",
        description: "Mistura erros antigos com puzzles novos para evitar memorizacao.",
      },
      en: {
        title: "Mixed review",
        description: "Mix old mistakes with new puzzles to avoid memorization.",
      },
    },
  },
  {
    id: "endWithMistakeReview",
    defaultValue: true,
    translations: {
      "pt-BR": {
        title: "Terminar revisando erros",
        description: "Finalize repetindo cada padrao falho mais uma vez.",
      },
      en: {
        title: "End cycle with mistake review",
        description: "Finish by replaying every failed pattern once more.",
      },
    },
  },
];

export const mockForgePuzzles = [
  {
    id: "forge-001",
    fen: "r3r1k1/pp3ppp/2p2n2/3q4/3P4/2N1BN2/PPQ2PPP/R3R1K1 w - - 0 18",
    sideToMove: "white",
    theme: "king_safety",
    difficulty: "intermediate",
    prompt: "Find the forcing move.",
    solution: ["Bxh7+"],
    candidateMoves: ["Bxh7+", "Nxd5", "Rac1", "Qb3"],
    explanation:
      "The bishop sacrifice pulls the king into a forcing line. The next wave uses Ng5 and checks before Black can consolidate.",
    tags: ["sacrifice", "king safety", "forcing move"],
    translations: {
      "pt-BR": {
        prompt: "Encontre o lance forçado.",
        explanation:
          "O sacrificio do bispo puxa o rei para uma linha forcada. A proxima onda usa Ng5 e xeques antes que as pretas consolidem.",
        tags: ["sacrificio", "seguranca do rei", "lance forcado"],
      },
    },
    source: "mock",
    status: "new",
  },
  {
    id: "forge-002",
    fen: "2r2rk1/pp2bppp/2n1pn2/q2p4/3P4/2PBPN2/PPQ2PPP/R1B2RK1 w - - 0 14",
    sideToMove: "white",
    theme: "candidate_moves",
    difficulty: "intermediate",
    prompt: "Choose the cleanest improving move.",
    solution: ["Re1"],
    candidateMoves: ["Re1", "Bxh7+", "Ne5", "a4"],
    explanation:
      "Re1 improves the worst piece and prepares central tension. The tempting tactics do not work yet because Black's king has enough defenders.",
    tags: ["improvement", "candidate moves", "central tension"],
    translations: {
      "pt-BR": {
        prompt: "Escolha o lance de melhoria mais limpo.",
        explanation:
          "Re1 melhora a pior peca e prepara tensao central. As taticas tentadoras ainda nao funcionam porque o rei preto tem defensores suficientes.",
        tags: ["melhoria", "lances candidatos", "tensao central"],
      },
    },
    source: "mock",
    status: "new",
  },
  {
    id: "forge-003",
    fen: "8/5pk1/4p1p1/3pP2p/2pP1P1P/2P3K1/8/8 w - - 0 42",
    sideToMove: "white",
    theme: "endgames",
    difficulty: "advanced",
    prompt: "Find the king route that keeps winning chances.",
    solution: ["Kf3"],
    candidateMoves: ["Kf3", "Kg4", "Kf2", "Kg2"],
    explanation:
      "Kf3 keeps opposition options and prepares the correct pawn break. Passive king moves let Black build a fortress.",
    tags: ["king activity", "opposition", "pawn break"],
    translations: {
      "pt-BR": {
        prompt: "Encontre a rota do rei que mantem chances de vitoria.",
        explanation:
          "Kf3 mantem opcoes de oposicao e prepara a ruptura correta de peao. Lances passivos de rei deixam as pretas criar uma fortaleza.",
        tags: ["atividade do rei", "oposicao", "ruptura de peao"],
      },
    },
    source: "mock",
    status: "new",
  },
  {
    id: "forge-004",
    fen: "r4rk1/pp2qppp/2n1bn2/3p4/3P4/2PBPN2/PPQ1NPPP/R1B2RK1 b - - 0 12",
    sideToMove: "black",
    theme: "defensive_resources",
    difficulty: "advanced",
    prompt: "White is ready to expand. Find Black's active resource.",
    solution: ["Bg4"],
    candidateMoves: ["Bg4", "Rac8", "h6", "Qd7"],
    explanation:
      "Bg4 trades an important defender and asks White to solve concrete problems before the initiative grows.",
    tags: ["defense", "counterplay", "piece activity"],
    translations: {
      "pt-BR": {
        prompt: "As brancas estao prontas para expandir. Encontre o recurso ativo das pretas.",
        explanation:
          "Bg4 troca um defensor importante e obriga as brancas a resolver problemas concretos antes que a iniciativa cresca.",
        tags: ["defesa", "contra-jogo", "atividade das pecas"],
      },
    },
    source: "mock",
    status: "new",
  },
  {
    id: "forge-005",
    fen: "3r2k1/pp3pp1/2p4p/3pP3/3P1P2/P1P3P1/1P4KP/3R4 w - - 0 31",
    sideToMove: "white",
    theme: "conversion",
    difficulty: "intermediate",
    prompt: "Convert without allowing counterplay.",
    solution: ["Kf3"],
    candidateMoves: ["Kf3", "Kf2", "b4", "h4"],
    explanation:
      "Kf3 centralizes first. Conversion improves the king before pushing pawns that may create counterplay.",
    tags: ["conversion", "king activity", "patience"],
    translations: {
      "pt-BR": {
        prompt: "Converta sem permitir contra-jogo.",
        explanation:
          "Kf3 centraliza primeiro. A conversao melhora o rei antes de empurrar peoes que podem criar contra-jogo.",
        tags: ["conversao", "atividade do rei", "paciencia"],
      },
    },
    source: "mock",
    status: "new",
  },
  {
    id: "forge-006",
    fen: "r1bq1rk1/pp2bppp/2n1pn2/2pp4/3P4/2PBPN2/PPQN1PPP/R1B2RK1 w - - 0 9",
    sideToMove: "white",
    theme: "openings",
    difficulty: "beginner",
    prompt: "Pick the move that completes development with a clear plan.",
    solution: ["Re1"],
    candidateMoves: ["Re1", "e4", "dxc5", "b3"],
    explanation:
      "Re1 is flexible and supports a future central break. Moving central pawns too soon gives Black easy targets.",
    tags: ["development", "opening plan", "flexibility"],
    translations: {
      "pt-BR": {
        prompt: "Escolha o lance que completa o desenvolvimento com um plano claro.",
        explanation:
          "Re1 e flexivel e apoia uma futura ruptura central. Mover peoes centrais cedo demais da alvos faceis para as pretas.",
        tags: ["desenvolvimento", "plano de abertura", "flexibilidade"],
      },
    },
    source: "mock",
    status: "new",
  },
];

export const mockCycleStats = {
  accuracy: 76,
  currentStreak: 5,
  mistakesQueued: 2,
  averageSolveTime: 38,
};

export const mockCyclePhases = [
  { id: "pattern_building", startRound: 1, label: { "pt-BR": "Construcao de Padroes", en: "Pattern Building" } },
  { id: "compression", startRound: 2, label: { "pt-BR": "Compressao", en: "Compression" } },
  { id: "final_forge", startRound: 4, label: { "pt-BR": "Forja Final", en: "Final Forge" } },
];

export function localizeForgeItem(item, field, language) {
  if (!item) return "";
  return item.translations?.[language]?.[field] ?? item.translations?.en?.[field] ?? item[field] ?? "";
}

export function getForgeLabel(item, language) {
  return item?.label?.[language] ?? item?.label?.en ?? item?.id ?? "";
}

export function formatThemeLabel(themeId) {
  return String(themeId || "")
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function getThemeTitle(themeId, language) {
  const theme = forgeThemes.find((entry) => entry.id === themeId);
  return localizeForgeItem(theme, "title", language) || formatThemeLabel(themeId);
}

export function getRoundGoals(language) {
  return [
    {
      "pt-BR": "Entender os padroes",
      en: "Understand the patterns",
    },
    {
      "pt-BR": "Reconhecer mais rapido",
      en: "Recognize faster",
    },
    {
      "pt-BR": "Comprimir o calculo",
      en: "Compress calculation",
    },
    {
      "pt-BR": "Reconhecimento automatico",
      en: "Automatic recognition",
    },
    {
      "pt-BR": "Teste de instinto",
      en: "Instinct test",
    },
  ].map((goal) => goal[language] ?? goal.en);
}

export function buildRounds(config, language = "en") {
  const goals = getRoundGoals(language);
  const days = config.roundDays?.length ? config.roundDays : defaultForgeConfig.roundDays;
  const roundCount = config.roundCount || days.length;

  return Array.from({ length: roundCount }, (_, index) => {
    const targetDays = Math.max(1, Number(days[index] ?? days[days.length - 1] ?? 1));

    return {
      round: index + 1,
      targetDays,
      dailyTarget: Math.ceil(config.puzzleSetSize / targetDays),
      goal: goals[index] ?? goals[goals.length - 1],
    };
  });
}

export function getManualThemes(config) {
  if (Array.isArray(config.manualThemes)) return config.manualThemes;
  return Array.isArray(config.themes) ? config.themes : [];
}

export function getTotalCommitmentDays(config) {
  return buildRounds(config).reduce((total, round) => total + round.targetDays, 0);
}

export function getCurrentRound(cycleDraft) {
  const currentRound = cycleDraft?.progress?.currentRound || cycleDraft?.repetitionPlan?.currentRound || 1;
  return (
    cycleDraft?.repetitionPlan?.rounds?.find((round) => round.round === currentRound) ||
    cycleDraft?.repetitionPlan?.rounds?.[0] ||
    { round: 1, targetDays: 14, dailyTarget: 8, goal: "Understand the patterns" }
  );
}

export function createCycleDraft(config, username = null) {
  const rounds = buildRounds(config, "en");
  const manualThemes = getManualThemes(config);

  return {
    userId: null,
    username,
    source: "pattern_forge",
    createdAt: new Date().toISOString(),
    patternSet: {
      puzzleCount: config.puzzleSetSize,
      themes: [...manualThemes],
      automaticThemesEnabled: config.automaticThemesEnabled !== false,
      automaticThemes: [],
      manualThemes: [...manualThemes],
      themeReasons: [],
      difficulty: config.difficulty,
      includePersonalWeaknesses: Boolean(config.includePersonalWeaknesses),
    },
    repetitionPlan: {
      rounds,
      compressionPreset: config.compressionPreset,
      currentRound: 1,
    },
    rules: {
      repeatMissedPuzzles: Boolean(config.repeatMissedPuzzles),
      repeatSlowSolves: Boolean(config.repeatSlowSolves),
      prioritizeWeaknesses: Boolean(config.prioritizeWeaknesses),
      includeMixedReview: Boolean(config.includeMixedReview),
      endRoundWithMistakeReview: Boolean(config.endWithMistakeReview),
    },
    progress: {
      status: "not_started",
      currentRound: 1,
      currentDayInRound: 3,
      completedToday: 3,
      completedPuzzlesInRound: 0,
      totalSolvedAcrossCycle: 0,
      streakDays: 0,
    },
  };
}

export function normalizeBackendDifficulty(difficulty) {
  const difficultyMap = {
    adaptive: "intermediate",
    comfortable: "beginner",
    challenging: "advanced",
    punishing: "expert",
    beginner: "beginner",
    intermediate: "intermediate",
    advanced: "advanced",
    expert: "expert",
  };

  return difficultyMap[difficulty] || "intermediate";
}

export function createCyclePayload(config, username) {
  return {
    username,
    config: {
      puzzleCount: config.puzzleSetSize,
      automaticThemesEnabled: config.automaticThemesEnabled !== false,
      manualThemes: getManualThemes(config),
      difficulty: normalizeBackendDifficulty(config.difficulty),
      compressionPreset: config.compressionPreset,
      rounds: buildRounds(config, "en"),
      rules: {
        repeatMissedPuzzles: Boolean(config.repeatMissedPuzzles),
        repeatSlowSolves: Boolean(config.repeatSlowSolves),
        prioritizeWeaknesses: Boolean(config.prioritizeWeaknesses),
        endRoundWithMistakeReview: Boolean(config.endWithMistakeReview),
      },
      includePersonalWeaknesses: config.includePersonalWeaknesses !== false,
    },
  };
}

export function getRoundPhase(roundNumber, totalRounds, language) {
  const phase =
    [...mockCyclePhases]
      .reverse()
      .find((entry) => roundNumber >= Math.min(entry.startRound, totalRounds)) || mockCyclePhases[0];

  return {
    id: phase.id,
    label: phase.label[language] ?? phase.label.en,
  };
}

export function getCyclePhase(index, total, language) {
  const ratio = total <= 1 ? 0 : index / total;
  const pseudoRound = ratio > 0.72 ? 4 : ratio > 0.35 ? 2 : 1;
  return getRoundPhase(pseudoRound, 4, language);
}
