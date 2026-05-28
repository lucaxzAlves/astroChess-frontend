export const personalReplayMoments = [
  {
    id: "moment-001",
    gameId: "chesscom-game-123",
    source: "chess.com",
    opponent: "TacticalRook82",
    playerColor: "white",
    result: "loss",
    date: "2026-04-29",
    timeControl: "rapid",
    moveNumber: 35,
    ply: 69,
    fen: "6k1/5ppp/4r3/8/3R4/6P1/5P1P/6K1 w - - 0 35",
    playedMove: "Kh1",
    bestMove: "Kf2",
    classification: "blunder",
    category: "blunder_replay",
    phase: "endgame",
    theme: "King safety",
    severity: "critical",
    difficulty: "advanced",
    evalBefore: 3.5,
    evalAfter: "#-1",
    tags: ["king safety", "mate threat", "endgame"],
    prompt: "White is winning, but Black has threats. What should White play?",
    explanation:
      "Kh1 walks into a mating net. Kf2 keeps the king active and avoids the rook invasion.",
    lesson:
      "Before making a quiet king move, always check forcing moves: checks, captures, threats.",
    candidateMoves: ["Kh1", "Kf2", "Rf3", "Nf4"],
    solutionLine: ["Kf2", "Raa8", "Rd1", "Ra5"],
    status: "new",
    attempts: 0,
    lastAttemptResult: null,
    aiCoachPick: true,
    completed: false,
    translations: {
      "pt-BR": {
        theme: "Segurança do rei",
        prompt: "As brancas estão ganhas, mas as pretas têm ameaças. O que as brancas devem jogar?",
        explanation:
          "Kh1 entra em uma rede de mate. Kf2 mantém o rei ativo e evita a invasão da torre.",
        lesson:
          "Antes de fazer um lance calmo de rei, sempre cheque lances forçados: xeques, capturas e ameaças.",
      },
    },
  },
  {
    id: "moment-002",
    gameId: "chesscom-game-124",
    source: "chess.com",
    opponent: "EndgameFox",
    playerColor: "black",
    result: "draw",
    date: "2026-05-02",
    timeControl: "blitz",
    moveNumber: 42,
    ply: 84,
    fen: "8/5k2/8/4P3/3K4/8/8/8 b - - 0 42",
    playedMove: "Ke6",
    bestMove: "Ke7",
    classification: "mistake",
    category: "endgame_decisions",
    phase: "endgame",
    theme: "Opposition",
    severity: "high",
    difficulty: "intermediate",
    evalBefore: 0,
    evalAfter: 2.1,
    tags: ["opposition", "king activity", "endgame"],
    prompt: "Black can hold the pawn ending. Which king move keeps the opposition?",
    explanation: "Ke7 keeps the king in front of the pawn. Ke6 loses the opposition.",
    lesson: "In pawn endings, identify key squares before moving the king.",
    candidateMoves: ["Ke6", "Ke7", "Kg6", "Kf8"],
    solutionLine: ["Ke7", "Kd5", "Kd7", "e6+"],
    status: "needs_review",
    attempts: 2,
    lastAttemptResult: "failed_recently",
    aiCoachPick: false,
    completed: true,
    bestReplayResult: "Needs review",
    lastTrainedAt: "2026-05-12",
    translations: {
      "pt-BR": {
        theme: "Oposição",
        prompt: "As pretas conseguem segurar o final de peões. Qual lance de rei mantém a oposição?",
        explanation: "Ke7 mantém o rei na frente do peão. Ke6 perde a oposição.",
        lesson: "Em finais de peão, identifique as casas-chave antes de mover o rei.",
        bestReplayResult: "Precisa revisar",
      },
    },
  },
  {
    id: "moment-003",
    gameId: "chesscom-game-125",
    source: "chess.com",
    opponent: "SharpKnight",
    playerColor: "white",
    result: "win",
    date: "2026-05-05",
    timeControl: "rapid",
    moveNumber: 22,
    ply: 43,
    fen: "r2q1rk1/pp2bppp/2n1bn2/3p4/2PP4/2N1PN2/PP2BPPP/R1BQ1RK1 w - - 0 22",
    playedMove: "Rc1",
    bestMove: "cxd5",
    classification: "missed chance",
    category: "missed_chances",
    phase: "middlegame",
    theme: "Central break",
    severity: "medium",
    difficulty: "intermediate",
    evalBefore: 1.8,
    evalAfter: 0.4,
    tags: ["central break", "initiative", "missed tactic"],
    prompt: "White can seize the initiative immediately. What is the forcing break?",
    explanation: "cxd5 opens the c-file and exposes Black's coordination before they consolidate.",
    lesson: "When the opponent is underdeveloped, look for central breaks before slow improvement.",
    candidateMoves: ["Rc1", "cxd5", "Qb3", "a3"],
    solutionLine: ["cxd5", "Nxd5", "Nxd5", "Bxd5"],
    status: "new",
    attempts: 0,
    lastAttemptResult: null,
    aiCoachPick: true,
    completed: false,
    translations: {
      "pt-BR": {
        theme: "Ruptura central",
        prompt: "As brancas podem tomar a iniciativa imediatamente. Qual é a ruptura forçada?",
        explanation: "cxd5 abre a coluna c e expõe a coordenação das pretas antes que consolidem.",
        lesson: "Quando o adversário está subdesenvolvido, procure rupturas centrais antes de melhoras lentas.",
      },
    },
  },
  {
    id: "moment-004",
    gameId: "chesscom-game-126",
    source: "chess.com",
    opponent: "ClockCrusher",
    playerColor: "black",
    result: "loss",
    date: "2026-05-07",
    timeControl: "blitz",
    moveNumber: 18,
    ply: 36,
    fen: "r1bq1rk1/ppp2ppp/2n2n2/3p4/3P4/2N1PN2/PPQ2PPP/R1B2RK1 b - - 0 18",
    playedMove: "Re8",
    bestMove: "Nb4",
    classification: "inaccuracy",
    category: "opening_mistakes",
    phase: "opening",
    theme: "Repeated opening pattern",
    severity: "low",
    difficulty: "beginner",
    evalBefore: -0.2,
    evalAfter: 0.7,
    tags: ["opening", "tempo", "piece activity"],
    prompt: "Black keeps repeating a passive setup. Which move challenges White's coordination?",
    explanation: "Nb4 gains tempo and asks White to solve concrete development problems.",
    lesson: "Do not autopilot quiet rook moves when a piece can improve with tempo.",
    candidateMoves: ["Re8", "Nb4", "Bg4", "a6"],
    solutionLine: ["Nb4", "Qe2", "c6", "a3"],
    status: "mastered",
    attempts: 3,
    lastAttemptResult: "solved",
    aiCoachPick: false,
    completed: true,
    bestReplayResult: "Mastered",
    lastTrainedAt: "2026-05-14",
    translations: {
      "pt-BR": {
        theme: "Padrão de abertura repetido",
        prompt: "As pretas estão repetindo um setup passivo. Qual lance desafia a coordenação branca?",
        explanation: "Nb4 ganha tempo e obriga as brancas a resolver problemas concretos de desenvolvimento.",
        lesson: "Não jogue lances calmos de torre no automático quando uma peça pode melhorar com tempo.",
        bestReplayResult: "Dominado",
      },
    },
  },
  {
    id: "moment-005",
    gameId: "chesscom-game-127",
    source: "chess.com",
    opponent: "PassedPawn99",
    playerColor: "white",
    result: "draw",
    date: "2026-05-09",
    timeControl: "rapid",
    moveNumber: 31,
    ply: 61,
    fen: "8/5pk1/6p1/3Pp3/4P3/5K2/6PP/8 w - - 0 31",
    playedMove: "Ke3",
    bestMove: "d6",
    classification: "best move missed",
    category: "conversion_training",
    phase: "endgame",
    theme: "Passed pawn conversion",
    severity: "high",
    difficulty: "advanced",
    evalBefore: 2.7,
    evalAfter: 0.2,
    tags: ["conversion", "passed pawn", "king activity"],
    prompt: "White has a dangerous passer. How should the advantage be converted?",
    explanation: "d6 fixes Black's king and creates a decisive tempo before the king can blockade.",
    lesson: "When a passer is ready, calculate forcing pawn pushes before improving the king.",
    candidateMoves: ["Ke3", "d6", "g4", "h4"],
    solutionLine: ["d6", "Kf6", "Kd5", "Ke6"],
    status: "new",
    attempts: 0,
    lastAttemptResult: null,
    aiCoachPick: true,
    completed: false,
    translations: {
      "pt-BR": {
        theme: "Conversão de peão passado",
        prompt: "As brancas têm um peão passado perigoso. Como converter a vantagem?",
        explanation: "d6 fixa o rei preto e cria um tempo decisivo antes do bloqueio.",
        lesson: "Quando um passado está pronto, calcule avanços forçados antes de melhorar o rei.",
      },
    },
  },
  {
    id: "moment-006",
    gameId: "chesscom-game-128",
    source: "chess.com",
    opponent: "AttackWave",
    playerColor: "black",
    result: "win",
    date: "2026-05-10",
    timeControl: "bullet",
    moveNumber: 27,
    ply: 54,
    fen: "6k1/5ppp/8/8/2Q5/8/5PPP/6K1 b - - 0 27",
    playedMove: "Qd1+",
    bestMove: "Qe1+",
    classification: "mistake",
    category: "defensive_saves",
    phase: "middlegame",
    theme: "Perpetual check resource",
    severity: "medium",
    difficulty: "intermediate",
    evalBefore: -1.8,
    evalAfter: 0,
    tags: ["defense", "perpetual", "time pressure"],
    prompt: "Black is worse but has a drawing resource. Which check keeps the queen active?",
    explanation: "Qe1+ keeps checking distance and avoids queen trades that lose the ending.",
    lesson: "When worse, search for active defensive resources before passive defense.",
    candidateMoves: ["Qd1+", "Qe1+", "Qb1+", "Qf6"],
    solutionLine: ["Qe1+", "Qf1", "Qe3+", "Kh1"],
    status: "new",
    attempts: 0,
    lastAttemptResult: null,
    aiCoachPick: false,
    completed: false,
    translations: {
      "pt-BR": {
        theme: "Recurso de xeque perpétuo",
        prompt: "As pretas estão piores, mas têm recurso de empate. Qual xeque mantém a dama ativa?",
        explanation: "Qe1+ mantém distância de xeques e evita trocas de damas que perderiam o final.",
        lesson: "Quando estiver pior, procure recursos defensivos ativos antes de defender passivamente.",
      },
    },
  },
];

export const personalReplayCollections = [
  {
    id: "critical_moments",
    title: "Critical Moments",
    description: "Positions where the direction of the game changed.",
    category: "critical_moments",
    recommended: true,
    icon: "spark",
    gradient: "from-purple-400/28 via-fuchsia-400/16 to-rose-300/12",
    translations: {
      "pt-BR": {
        title: "Momentos Críticos",
        description: "Posições onde a direção da partida mudou.",
      },
    },
  },
  {
    id: "blunder_replay",
    title: "Blunder Replay",
    description: "Replay your worst mistakes and learn what you missed.",
    category: "blunder_replay",
    recommended: true,
    icon: "alert",
    gradient: "from-rose-500/28 via-purple-500/16 to-orange-300/12",
    translations: {
      "pt-BR": {
        title: "Replay de Blunders",
        description: "Reviva seus piores erros e aprenda o que passou despercebido.",
      },
    },
  },
  {
    id: "missed_chances",
    title: "Missed Chances",
    description: "Train positions where you had a strong opportunity but failed to find it.",
    category: "missed_chances",
    recommended: true,
    icon: "target",
    gradient: "from-amber-300/26 via-purple-500/16 to-cyan-300/12",
    translations: {
      "pt-BR": {
        title: "Chances Perdidas",
        description: "Treine posições onde havia uma grande oportunidade que você não encontrou.",
      },
    },
  },
  {
    id: "conversion_training",
    title: "Conversion Training",
    description: "Practice turning advantages into wins.",
    category: "conversion_training",
    recommended: true,
    icon: "flag",
    gradient: "from-emerald-300/24 via-purple-500/16 to-lime-300/12",
    translations: {
      "pt-BR": {
        title: "Treino de Conversão",
        description: "Pratique transformar vantagens em vitórias.",
      },
    },
  },
  {
    id: "defensive_saves",
    title: "Defensive Saves",
    description: "Find resources in worse positions.",
    category: "defensive_saves",
    recommended: false,
    icon: "shield",
    gradient: "from-sky-300/24 via-purple-500/16 to-blue-400/12",
    translations: {
      "pt-BR": {
        title: "Salvamentos Defensivos",
        description: "Encontre recursos em posições piores.",
      },
    },
  },
  {
    id: "opening_mistakes",
    title: "Opening Mistakes",
    description: "Review recurring early-game inaccuracies.",
    category: "opening_mistakes",
    recommended: false,
    icon: "book",
    gradient: "from-violet-300/24 via-purple-500/16 to-slate-200/10",
    translations: {
      "pt-BR": {
        title: "Erros de Abertura",
        description: "Revise imprecisões recorrentes no início da partida.",
      },
    },
  },
  {
    id: "endgame_decisions",
    title: "Endgame Decisions",
    description: "Train technical moments from simplified positions.",
    category: "endgame_decisions",
    recommended: false,
    icon: "king",
    gradient: "from-stone-200/20 via-purple-500/16 to-amber-300/12",
    translations: {
      "pt-BR": {
        title: "Decisões de Final",
        description: "Treine momentos técnicos em posições simplificadas.",
      },
    },
  },
];

export const personalWeaknessGroups = [
  {
    id: "king-safety",
    name: "King Safety",
    description: "Forcing threats around your king are being underestimated.",
    tags: ["king safety", "mate threat"],
    averageSeverity: "critical",
    recommendedAction: "Replay forcing checks before every quiet king move.",
    translations: {
      "pt-BR": {
        name: "Segurança do Rei",
        description: "Ameaças forçadas contra seu rei estão sendo subestimadas.",
        recommendedAction: "Revise xeques forçados antes de cada lance calmo de rei.",
      },
    },
  },
  {
    id: "endgame-technique",
    name: "Endgame Technique",
    description: "Key squares, opposition, and conversion timing need repetition.",
    tags: ["endgame", "opposition", "conversion", "passed pawn"],
    averageSeverity: "high",
    recommendedAction: "Train king activity and pawn-race decisions.",
    translations: {
      "pt-BR": {
        name: "Técnica de Finais",
        description: "Casas-chave, oposição e timing de conversão precisam de repetição.",
        recommendedAction: "Treine atividade do rei e decisões em corridas de peões.",
      },
    },
  },
  {
    id: "tactical-oversights",
    name: "Tactical Oversights",
    description: "Candidate moves are being skipped in critical middlegames.",
    tags: ["missed tactic", "central break", "initiative"],
    averageSeverity: "medium",
    recommendedAction: "Run checks, captures, threats before improving pieces.",
    translations: {
      "pt-BR": {
        name: "Descuidos Táticos",
        description: "Lances candidatos estão sendo ignorados em meio-jogos críticos.",
        recommendedAction: "Cheque xeques, capturas e ameaças antes de melhorar peças.",
      },
    },
  },
  {
    id: "defensive-awareness",
    name: "Defensive Awareness",
    description: "Active resources in worse positions need to become automatic.",
    tags: ["defense", "perpetual", "time pressure"],
    averageSeverity: "medium",
    recommendedAction: "Look for active checks and counterplay before passive defense.",
    translations: {
      "pt-BR": {
        name: "Consciência Defensiva",
        description: "Recursos ativos em posições piores precisam virar automático.",
        recommendedAction: "Procure xeques ativos e contra-jogo antes da defesa passiva.",
      },
    },
  },
  {
    id: "opening-preparation",
    name: "Opening Preparation",
    description: "Repeated early-game patterns are costing tempi and activity.",
    tags: ["opening", "tempo", "piece activity"],
    averageSeverity: "low",
    recommendedAction: "Replay model alternatives in your repeated structures.",
    translations: {
      "pt-BR": {
        name: "Preparação de Aberturas",
        description: "Padrões repetidos no início estão custando tempos e atividade.",
        recommendedAction: "Revise alternativas modelo nas suas estruturas repetidas.",
      },
    },
  },
];

export const replayProgress = {
  momentsTrainedToday: 4,
  currentStreak: 6,
  accuracy: 68,
  masteredMoments: 12,
  needsReview: 7,
};

export function localizeItem(item, field, language) {
  return item?.translations?.[language]?.[field] || item?.[field] || "";
}

export function getCollectionCount(collection) {
  if (collection.category === "critical_moments") {
    return personalReplayMoments.filter((moment) =>
      ["critical", "high"].includes(moment.severity)
    ).length;
  }

  return personalReplayMoments.filter((moment) => moment.category === collection.category).length;
}

export function getMomentsForCollection(collection) {
  if (!collection) return personalReplayMoments;
  if (collection.category === "critical_moments") {
    return personalReplayMoments.filter((moment) =>
      ["critical", "high"].includes(moment.severity)
    );
  }
  return personalReplayMoments.filter((moment) => moment.category === collection.category);
}

export function getMomentsForWeakness(weakness) {
  if (!weakness) return personalReplayMoments;
  return personalReplayMoments.filter((moment) =>
    moment.tags.some((tag) => weakness.tags.includes(tag))
  );
}

export function getTimelineGroups(moments = personalReplayMoments) {
  return Object.values(
    moments.reduce((groups, moment) => {
      const key = `${moment.date}-${moment.gameId}`;
      if (!groups[key]) {
        groups[key] = {
          id: key,
          date: moment.date,
          opponent: moment.opponent,
          result: moment.result,
          timeControl: moment.timeControl,
          moments: [],
        };
      }
      groups[key].moments.push(moment);
      return groups;
    }, {})
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export default personalReplayMoments;
