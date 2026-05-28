export const masterReplayTrainingModes = [
  {
    id: "full_guess_the_move",
    title: "Full Guess the Move",
    description:
      "Try to guess many moves throughout the game and compare your thinking with the master.",
    bestFor: "Deep study sessions",
    estimatedLength: "25-40 min",
  },
  {
    id: "critical_moments",
    title: "Critical Moments Only",
    description:
      "Train only the decisive positions. Faster, sharper, and ideal for daily practice.",
    bestFor: "Daily decision drills",
    estimatedLength: "8-14 min",
  },
  {
    id: "plan_guessing",
    title: "Plan Guessing",
    description:
      "Before choosing a move, identify the correct plan: attack, consolidate, exchange, defend, or improve a piece.",
    bestFor: "Strategic thinking",
    estimatedLength: "12-18 min",
  },
  {
    id: "turning_point",
    title: "Find the Turning Point",
    description:
      "Discover where the game changed and why one side lost control.",
    bestFor: "Game review instincts",
    estimatedLength: "10-16 min",
  },
  {
    id: "compare_with_master",
    title: "Compare with Master",
    description:
      "Choose your move, then compare it with the master's decision and explanation.",
    bestFor: "Practical move choice",
    estimatedLength: "15-22 min",
  },
];

export const playerCollections = [
  {
    id: "Kasparov",
    name: "Kasparov",
    styleSummary: "Initiative, preparation, pressure",
    mainThemes: ["king attack", "calculation", "opening model games"],
    gradient: "from-red-400/24 via-purple-500/18 to-amber-300/12",
  },
  {
    id: "Karpov",
    name: "Karpov",
    styleSummary: "Restriction, prophylaxis, positional squeeze",
    mainThemes: ["positional domination", "weak squares", "conversion"],
    gradient: "from-violet-400/24 via-purple-500/18 to-cyan-300/12",
  },
  {
    id: "Tal",
    name: "Tal",
    styleSummary: "Chaos, sacrifice, tactical intuition",
    mainThemes: ["king attack", "calculation", "brilliancy"],
    gradient: "from-fuchsia-400/24 via-purple-500/18 to-rose-300/12",
  },
  {
    id: "Fischer",
    name: "Fischer",
    styleSummary: "Clarity, precision, universal strength",
    mainThemes: ["opening model games", "conversion", "calculation"],
    gradient: "from-sky-300/24 via-purple-500/18 to-emerald-300/12",
  },
  {
    id: "Carlsen",
    name: "Carlsen",
    styleSummary: "Practical pressure, endgames, grind",
    mainThemes: ["practical pressure", "endgame conversion", "defense"],
    gradient: "from-indigo-300/24 via-purple-500/18 to-teal-300/12",
  },
  {
    id: "Capablanca",
    name: "Capablanca",
    styleSummary: "Simplicity, conversion, endgame elegance",
    mainThemes: ["endgame conversion", "simplicity", "technique"],
    gradient: "from-amber-300/24 via-purple-500/18 to-stone-200/12",
  },
];

export const themeCollections = [
  {
    id: "king-attack",
    title: "King Attack",
    description:
      "Sacrifices, open lines, attacking coordination, and king-safety punishments.",
    matchThemes: ["king attack", "attacking intuition", "sacrifice"],
    difficultyRange: "Intermediate - Advanced",
    gradient: "from-rose-400/26 via-purple-500/18 to-orange-300/12",
  },
  {
    id: "defense-resistance",
    title: "Defense & Resistance",
    description:
      "Hold worse positions, create counterplay, and find practical defensive resources.",
    matchThemes: ["defense", "resistance", "counterplay"],
    difficultyRange: "Intermediate - Advanced",
    gradient: "from-cyan-300/24 via-purple-500/18 to-blue-400/12",
  },
  {
    id: "conversion",
    title: "Conversion of Advantage",
    description:
      "Turn pressure, material edges, and positional dominance into full points.",
    matchThemes: ["conversion", "endgame conversion", "practical pressure"],
    difficultyRange: "Beginner - Advanced",
    gradient: "from-emerald-300/24 via-purple-500/18 to-lime-300/12",
  },
  {
    id: "positional-strategy",
    title: "Positional Strategy",
    description:
      "Restriction, weak squares, prophylaxis, piece quality, and long-term pressure.",
    matchThemes: ["positional", "weak squares", "piece restriction"],
    difficultyRange: "Intermediate - Advanced",
    gradient: "from-violet-300/26 via-purple-500/18 to-fuchsia-300/12",
  },
  {
    id: "calculation-tactics",
    title: "Calculation & Tactics",
    description:
      "Forcing lines, tactical intuition, candidate moves, and concrete accuracy.",
    matchThemes: ["calculation", "tactics", "attacking intuition"],
    difficultyRange: "Intermediate - Master",
    gradient: "from-purple-300/26 via-indigo-400/18 to-sky-300/12",
  },
  {
    id: "endgame-technique",
    title: "Endgame Technique",
    description:
      "Rook endings, king activity, technical conversion, and simplified positions.",
    matchThemes: ["endgame conversion", "technique", "rook endings"],
    difficultyRange: "Beginner - Advanced",
    gradient: "from-amber-200/24 via-purple-500/18 to-cyan-300/12",
  },
  {
    id: "opening-model-games",
    title: "Opening Model Games",
    description:
      "Learn plans and structures from complete games instead of memorized lines.",
    matchThemes: ["opening model games", "preparation", "structure"],
    difficultyRange: "Beginner - Advanced",
    gradient: "from-slate-200/18 via-purple-500/18 to-violet-300/12",
  },
];

export const historicalCollections = [
  {
    id: "legendary-games",
    title: "Legendary Games",
    description:
      "Games that became part of chess culture because the ideas still feel alive.",
    sampleGameIds: ["tal-larsen-1965", "kasparov-topalov-1999"],
    tone: "mythic",
  },
  {
    id: "world-championship-classics",
    title: "World Championship Classics",
    description:
      "High-stakes games where preparation, nerves, and technique all mattered.",
    sampleGameIds: ["fischer-spassky-1972", "karpov-kasparov-1984"],
    tone: "classical",
  },
  {
    id: "brilliancy-games",
    title: "Brilliancy Games",
    description:
      "Creative masterpieces where calculation and imagination overwhelmed resistance.",
    sampleGameIds: ["tal-larsen-1965", "kasparov-topalov-1999"],
    tone: "fire",
  },
  {
    id: "comebacks-escapes",
    title: "Comebacks & Escapes",
    description:
      "Resourceful saves, defensive miracles, and games that refused to end quietly.",
    sampleGameIds: ["carlsen-aronian-2012"],
    tone: "resistance",
  },
  {
    id: "miniatures",
    title: "Miniatures",
    description:
      "Short, sharp lessons where opening mistakes quickly become tactical punishment.",
    sampleGameIds: ["fischer-byrne-1956"],
    tone: "sharp",
  },
];

export const masterReplayGames = [
  {
    id: "karpov-unzicker-1974",
    title: "Karpov vs Unzicker",
    white: "Anatoly Karpov",
    black: "Wolfgang Unzicker",
    year: 1974,
    event: "Nice Olympiad",
    result: "1-0",
    pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Be2 e5",
    difficulty: "advanced",
    categories: ["positional", "conversion", "model-game"],
    themes: ["weak squares", "piece restriction", "conversion", "positional"],
    playerCollection: "Karpov",
    historicalTag: "Classic positional game",
    historicalCollectionIds: ["legendary-games"],
    estimatedTime: "18 min",
    progress: 62,
    recommended: true,
    recommendationBadges: ["Recommended", "Good for conversion", "AI Coach pick"],
    whyRecommended:
      "A model for improving pieces before increasing pressure, ideal for players who rush conversions.",
    description:
      "Karpov slowly restricts Black's pieces, improves every unit, and converts without allowing counterplay.",
    recommendedMode: "plan_guessing",
    trainingModes: ["critical_moments", "full_guess_the_move", "plan_guessing"],
    keyMoments: [
      {
        ply: 24,
        questionType: "plan",
        prompt: "What should White improve before increasing pressure?",
        correctMove: "Nd2",
        explanation: "White improves the knight before increasing pressure.",
      },
      {
        ply: 39,
        questionType: "move",
        prompt: "How should White convert the bind into a concrete advantage?",
        correctMove: "c5",
        explanation: "The pawn break fixes weaknesses and makes Black's pieces passive.",
      },
    ],
  },
  {
    id: "capablanca-tartakower-1924",
    title: "Capablanca vs Tartakower",
    white: "Jose Raul Capablanca",
    black: "Savielly Tartakower",
    year: 1924,
    event: "New York",
    result: "1-0",
    pgn: "1. d4 Nf6 2. Nf3 e6 3. c4 b6 4. g3 Bb7 5. Bg2 Be7",
    difficulty: "intermediate",
    categories: ["endgame", "conversion", "model-game"],
    themes: ["endgame conversion", "technique", "conversion"],
    playerCollection: "Capablanca",
    historicalTag: "Endgame elegance",
    historicalCollectionIds: ["legendary-games"],
    estimatedTime: "16 min",
    progress: 0,
    recommended: true,
    recommendationBadges: ["Recommended", "Good for conversion"],
    whyRecommended:
      "A clear lesson in king activity, active rook play, and simple conversion decisions.",
    description:
      "Capablanca makes the endgame look effortless by improving activity before collecting material.",
    recommendedMode: "critical_moments",
    trainingModes: ["critical_moments", "compare_with_master", "plan_guessing"],
    keyMoments: [
      {
        ply: 58,
        questionType: "plan",
        prompt: "Which king route best supports the passed pawn?",
        correctMove: "Kf3",
        explanation: "Centralization prepares the pawn advance without giving counterplay.",
      },
    ],
  },
  {
    id: "kasparov-topalov-1999",
    title: "Kasparov vs Topalov",
    white: "Garry Kasparov",
    black: "Veselin Topalov",
    year: 1999,
    event: "Wijk aan Zee",
    result: "1-0",
    pgn: "1. e4 d6 2. d4 Nf6 3. Nc3 g6 4. Be3 Bg7 5. Qd2 c6",
    difficulty: "master",
    categories: ["calculation", "brilliancy", "attack"],
    themes: ["calculation", "king attack", "attacking intuition", "sacrifice"],
    playerCollection: "Kasparov",
    historicalTag: "Modern brilliancy",
    historicalCollectionIds: ["legendary-games", "brilliancy-games"],
    estimatedTime: "30 min",
    progress: 0,
    recommended: true,
    recommendationBadges: ["AI Coach pick", "Calculation lab"],
    whyRecommended:
      "A demanding game for training candidate moves, forcing branches, and courage in attack.",
    description:
      "Kasparov creates one of the most famous attacking games ever, full of forcing decisions.",
    recommendedMode: "full_guess_the_move",
    trainingModes: ["full_guess_the_move", "critical_moments", "compare_with_master"],
    keyMoments: [
      {
        ply: 47,
        questionType: "move",
        prompt: "Which spectacular move keeps the attack alive?",
        correctMove: "Rxd4",
        explanation: "Material becomes secondary because Black's king cannot stabilize.",
      },
    ],
  },
  {
    id: "tal-larsen-1965",
    title: "Tal vs Larsen",
    white: "Mikhail Tal",
    black: "Bent Larsen",
    year: 1965,
    event: "Candidates Tournament",
    result: "1-0",
    pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 g6",
    difficulty: "advanced",
    categories: ["attack", "sacrifice", "calculation"],
    themes: ["king attack", "attacking intuition", "calculation", "sacrifice"],
    playerCollection: "Tal",
    historicalTag: "Tactical storm",
    historicalCollectionIds: ["legendary-games", "brilliancy-games"],
    estimatedTime: "22 min",
    progress: 0,
    recommended: true,
    recommendationBadges: ["Recommended", "Attack training"],
    whyRecommended:
      "A vivid way to train attacking intuition without ignoring concrete calculation.",
    description:
      "Tal keeps the initiative alive with forcing questions and practical attacking pressure.",
    recommendedMode: "critical_moments",
    trainingModes: ["critical_moments", "full_guess_the_move", "turning_point"],
    keyMoments: [
      {
        ply: 28,
        questionType: "move",
        prompt: "How should White increase the attack before Black consolidates?",
        correctMove: "Bh6",
        explanation: "Removing the defender makes the dark squares around the king fragile.",
      },
    ],
  },
  {
    id: "fischer-spassky-1972",
    title: "Fischer vs Spassky",
    white: "Bobby Fischer",
    black: "Boris Spassky",
    year: 1972,
    event: "World Championship",
    result: "1-0",
    pgn: "1. c4 e6 2. Nf3 d5 3. d4 Nf6 4. Nc3 Be7 5. Bg5 O-O",
    difficulty: "advanced",
    categories: ["world-championship", "strategy", "conversion"],
    themes: ["opening model games", "conversion", "precision"],
    playerCollection: "Fischer",
    historicalTag: "World Championship classic",
    historicalCollectionIds: ["world-championship-classics"],
    estimatedTime: "24 min",
    progress: 0,
    recommended: false,
    recommendationBadges: ["World Championship", "Opening model"],
    whyRecommended:
      "Excellent for studying clean opening plans that flow into a playable middlegame.",
    description:
      "Fischer shows how opening clarity, piece placement, and pressure work together.",
    recommendedMode: "compare_with_master",
    trainingModes: ["compare_with_master", "plan_guessing", "critical_moments"],
    keyMoments: [
      {
        ply: 20,
        questionType: "plan",
        prompt: "Which structure gives White the cleanest long-term pressure?",
        correctMove: "cxd5",
        explanation: "The exchange clarifies the center and gives White an easier plan.",
      },
    ],
  },
  {
    id: "carlsen-aronian-2012",
    title: "Carlsen vs Aronian",
    white: "Magnus Carlsen",
    black: "Levon Aronian",
    year: 2012,
    event: "Wijk aan Zee",
    result: "1-0",
    pgn: "1. d4 Nf6 2. c4 e6 3. Nf3 d5 4. g3 Bb4+ 5. Bd2 Be7",
    difficulty: "advanced",
    categories: ["practical", "endgame", "pressure"],
    themes: ["practical pressure", "endgame conversion", "defense"],
    playerCollection: "Carlsen",
    historicalTag: "Modern squeeze",
    historicalCollectionIds: ["comebacks-escapes"],
    estimatedTime: "20 min",
    progress: 18,
    recommended: true,
    recommendationBadges: ["AI Coach pick", "Practical pressure"],
    whyRecommended:
      "Great for players who need to learn pressure without forcing tactics too early.",
    description:
      "Carlsen turns a playable position into a long test of patience, accuracy, and defense.",
    recommendedMode: "plan_guessing",
    trainingModes: ["plan_guessing", "critical_moments", "turning_point"],
    keyMoments: [
      {
        ply: 34,
        questionType: "plan",
        prompt: "Which improvement keeps Black tied down without allowing counterplay?",
        correctMove: "Rc1",
        explanation: "Improve the worst piece and keep pressure on Black's passive setup.",
      },
    ],
  },
  {
    id: "fischer-byrne-1956",
    title: "Fischer vs Byrne",
    white: "Bobby Fischer",
    black: "Donald Byrne",
    year: 1956,
    event: "Rosenwald Trophy",
    result: "0-1",
    pgn: "1. Nf3 Nf6 2. c4 g6 3. Nc3 Bg7 4. d4 O-O 5. Bf4 d5",
    difficulty: "intermediate",
    categories: ["miniature", "tactics", "brilliancy"],
    themes: ["calculation", "tactics", "opening model games"],
    playerCollection: "Fischer",
    historicalTag: "Game of the Century",
    historicalCollectionIds: ["miniatures", "brilliancy-games"],
    estimatedTime: "14 min",
    progress: 0,
    recommended: false,
    recommendationBadges: ["Miniature", "Tactics"],
    whyRecommended:
      "A compact tactical lesson about development, coordination, and punishment.",
    description:
      "A young Fischer creates a memorable tactical masterpiece from opening imbalances.",
    recommendedMode: "turning_point",
    trainingModes: ["turning_point", "critical_moments", "compare_with_master"],
    keyMoments: [
      {
        ply: 22,
        questionType: "move",
        prompt: "What tactical resource changes the entire game?",
        correctMove: "Be6",
        explanation: "The move prepares a queen sacrifice and exposes White's coordination problems.",
      },
    ],
  },
  {
    id: "karpov-kasparov-1984",
    title: "Karpov vs Kasparov",
    white: "Anatoly Karpov",
    black: "Garry Kasparov",
    year: 1984,
    event: "World Championship",
    result: "1-0",
    pgn: "1. d4 Nf6 2. c4 e6 3. Nf3 b6 4. a3 Bb7 5. Nc3 d5",
    difficulty: "advanced",
    categories: ["world-championship", "positional", "restriction"],
    themes: ["positional", "weak squares", "piece restriction", "defense"],
    playerCollection: "Karpov",
    historicalTag: "World Championship squeeze",
    historicalCollectionIds: ["world-championship-classics"],
    estimatedTime: "26 min",
    progress: 0,
    recommended: false,
    recommendationBadges: ["World Championship", "Positional"],
    whyRecommended:
      "A patient study of restriction and the cost of passive defense.",
    description:
      "A tense championship game where small restrictions grow into a strategic bind.",
    recommendedMode: "plan_guessing",
    trainingModes: ["plan_guessing", "critical_moments", "full_guess_the_move"],
    keyMoments: [
      {
        ply: 31,
        questionType: "plan",
        prompt: "Where should White redirect the knight to increase restriction?",
        correctMove: "Nd2",
        explanation: "The knight heads toward a stronger square and supports long-term pressure.",
      },
    ],
  },
];

export function getGamesForTheme(theme) {
  if (!theme) return masterReplayGames;
  return masterReplayGames.filter((game) =>
    game.themes.some((item) => theme.matchThemes.includes(item))
  );
}

export function getGamesForHistoricalCollection(collection) {
  if (!collection) return masterReplayGames;
  return masterReplayGames.filter((game) =>
    game.historicalCollectionIds.includes(collection.id)
  );
}

export default masterReplayGames;
