export const mockProfileDelta = {
  skillMap: {
    overallScore: 64,
    calculation: {
      value: 68,
      description:
        "Finds forcing lines when the target is obvious, but candidate moves become narrow after the first branch.",
      confidence: 72,
      evidenceCount: 31,
    },
    positionalUnderstanding: {
      value: 62,
      description:
        "Understands good squares and pawn breaks, but sometimes accepts passive pieces to avoid short-term tension.",
      confidence: 66,
      evidenceCount: 24,
    },
    openings: {
      value: 57,
      description:
        "Repertoire is playable, yet common move-order deviations lead to unfamiliar middlegames and long early thinks.",
      confidence: 71,
      evidenceCount: 29,
    },
    tacticalThemes: {
      value: 73,
      description:
        "Strong pattern memory for pins, forks, and back-rank pressure, with missed shots when defensive resources exist.",
      confidence: 78,
      evidenceCount: 36,
    },
    endgames: {
      value: 48,
      description:
        "Conversion drops in rook endings, pawn races, and simplified positions where patient king activity matters.",
      confidence: 64,
      evidenceCount: 18,
    },
    middlegame: {
      value: 66,
      description:
        "Creates active plans in sharp structures, but advantage handling can become too tactical too soon.",
      confidence: 70,
      evidenceCount: 27,
    },
    timeManagement: {
      value: 42,
      description:
        "The biggest leak: too much clock is spent in stable openings, forcing rushed move selection near move 30.",
      confidence: 82,
      evidenceCount: 39,
    },
    psychologicalResilience: {
      value: 55,
      description:
        "Recovery after a mistake is possible, but the next five moves often show a higher risk appetite than the position needs.",
      confidence: 61,
      evidenceCount: 21,
    },
  },

  playingStyle: {
    primaryStyle: "Dynamic Attacker",
    secondaryStyles: ["Practical Defender", "Structure-Based Planner"],
    styleScores: {
      attacking: 78,
      tactical: 74,
      positional: 61,
      defensive: 58,
      technical: 46,
      riskTaking: 81,
      simplification: 44,
    },
    description:
      "You are most comfortable when pieces are active and the initiative is visible. The profile becomes less stable when the best move is a quiet improvement, a simplification, or a slow endgame plan.",
  },

  recurringMistakes: [
    {
      category: "Time management",
      name: "Poor clock management",
      description:
        "Long thinks in familiar positions create time-pressure tactics later, especially when the position becomes concrete.",
      frequency: "14 of 42 games",
      severity: "Critical",
      phases: ["opening", "middlegame", "endgame"],
      examples: [
        "Spent 7 minutes on move 9 in a known Caro-Kann structure, then missed a fork on move 31.",
        "Reached a winning rook ending with 48 seconds and chose checks instead of activating the king.",
      ],
      status: "Active leak",
      confidence: 86,
    },
    {
      category: "Tactical vision",
      name: "Missed tactical shots",
      description:
        "Forcing checks and captures are sometimes skipped after a positional plan has already been chosen.",
      frequency: "11 of 42 games",
      severity: "High",
      phases: ["middlegame"],
      examples: [
        "Missed Bxh7+ after the defender was overloaded on the kingside.",
        "Ignored a zwischenzug that won a pinned knight because the quiet recapture looked automatic.",
      ],
      status: "Improving",
      confidence: 78,
    },
    {
      category: "Endgame technique",
      name: "Weak endgame conversion",
      description:
        "Winning endings are often kept complicated instead of being converted through king activity, pawn breaks, and active rook placement.",
      frequency: "8 of 23 convertible endings",
      severity: "High",
      phases: ["endgame"],
      examples: [
        "Converted an extra pawn into a drawn rook ending by checking from the short side.",
        "Delayed opposition in a pawn race and allowed the defending king back into the square.",
      ],
      status: "Needs targeted drilling",
      confidence: 69,
    },
    {
      category: "Advantage handling",
      name: "Overcomplicating winning positions",
      description:
        "When ahead, you often keep attacking instead of removing counterplay, which lets opponents create practical chances.",
      frequency: "7 of 22 wins or winning positions",
      severity: "Medium",
      phases: ["middlegame", "endgame"],
      examples: [
        "Rejected a clean queen trade while up a rook and allowed perpetual-check threats.",
        "Pushed the h-pawn for mate instead of consolidating an extra exchange.",
      ],
      status: "Watchlist",
      confidence: 73,
    },
    {
      category: "Opening preparation",
      name: "Opening preparation gaps",
      description:
        "You know the first moves of the repertoire, but not enough plans after sidelines, transpositions, and early pawn tension.",
      frequency: "12 of 42 games",
      severity: "Medium",
      phases: ["opening", "middlegame"],
      examples: [
        "Left preparation on move 6 against the Caro-Kann Advance and spent too long finding the ...c5 break.",
        "Reached a passive London structure after delaying c4 and never challenged the center.",
      ],
      status: "Active study item",
      confidence: 75,
    },
  ],

  strengths: [
    {
      name: "Initiative in open positions",
      description:
        "You quickly coordinate pieces toward the king when files open and the opponent lacks development.",
      evidenceCount: 17,
      examples: [
        "Converted a lead in development into a forced attack before Black could castle.",
        "Found a rook lift that turned a queenside space edge into kingside pressure.",
      ],
      confidence: 76,
    },
    {
      name: "Tactical motif memory",
      description:
        "Pins, loose back-rank pieces, and overloaded defenders are spotted reliably when the clock is healthy.",
      evidenceCount: 22,
      examples: [
        "Found a deflection tactic against a defender of mate.",
        "Used a back-rank weakness to win material after forcing a rook trade.",
      ],
      confidence: 81,
    },
    {
      name: "Practical defense after reset",
      description:
        "When you pause and reassess, you can find stubborn defensive resources instead of collapsing immediately.",
      evidenceCount: 9,
      examples: [
        "Held a worse queen ending by finding checks from the long side.",
        "Forced a fortress setup after losing an exchange from the opening.",
      ],
      confidence: 58,
    },
  ],

  openingRepertoire: {
    asWhite: [
      {
        ECO: "D02",
        name: "London System",
        moves: "1. d4 d5 2. Bf4 Nf6 3. e3",
        games: 9,
        scorePercent: 61,
        commonMistakes: [
          "Delaying c4 until Black solves the light-square pressure.",
          "Spending too long choosing between c3 and c4.",
        ],
        recommendedStudy:
          "Review model games where White plays c4 before Nf3 and keeps the bishop outside the pawn chain.",
        lastSeenAt: "2026-05-01",
      },
      {
        ECO: "C42",
        name: "Petrov Defense as White",
        moves: "1. e4 e5 2. Nf3 Nf6",
        games: 5,
        scorePercent: 42,
        commonMistakes: [
          "Trading into equal endgames without a time edge.",
          "Missing early pressure on e5 after Black sidesteps main theory.",
        ],
        recommendedStudy:
          "Prepare the 5. Nc3 line and two plans against early ...Bb4 deviations.",
        lastSeenAt: "2026-04-24",
      },
    ],
    asBlack: {
      againstE4: [
        {
          ECO: "B12",
          name: "Caro-Kann Advance",
          moves: "1. e4 c6 2. d4 d5 3. e5",
          games: 8,
          scorePercent: 47,
          commonMistakes: [
            "Delaying ...c5 and accepting a cramped structure.",
            "Burning clock on familiar move orders instead of following the prepared break.",
          ],
          recommendedStudy:
            "Drill the ...c5 break timing and review three model games with ...Bf5 and ...e6.",
          lastSeenAt: "2026-04-30",
        },
        {
          ECO: "C50",
          name: "Italian Game",
          moves: "1. e4 e5 2. Nf3 Nc6 3. Bc4",
          games: 6,
          scorePercent: 58,
          commonMistakes: [
            "Allowing d4 with tempo after slow queenside development.",
            "Overdefending e5 instead of challenging the center.",
          ],
          recommendedStudy:
            "Build a two-branch plan for quiet d3 systems and fast c3/d4 systems.",
          lastSeenAt: "2026-04-21",
        },
      ],
      againstD4: [
        {
          ECO: "E61",
          name: "King's Indian Defense",
          moves: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7",
          games: 7,
          scorePercent: 57,
          commonMistakes: [
            "Launching ...f5 before completing queenside development.",
            "Missing the right moment for ...e5 when White delays Nf3.",
          ],
          recommendedStudy:
            "Study model games with ...e5 and piece regrouping before committing to kingside play.",
          lastSeenAt: "2026-04-27",
        },
      ],
      againstOther: [
        {
          ECO: "A10",
          name: "English Opening setup",
          moves: "1. c4 Nf6 2. Nc3 e6",
          games: 3,
          scorePercent: 50,
          commonMistakes: [
            "Treating transpositions like autopilot instead of checking c4 and d4 tension.",
          ],
          recommendedStudy:
            "Create one plan against Botvinnik setups and one plan against early g3.",
          lastSeenAt: "2026-04-18",
        },
      ],
    },
  },

  chessStats: {
    totalGamesAnalyzed: 42,
    results: { wins: 22, draws: 6, losses: 14 },
    mistakeDistribution: { inaccuracies: 88, mistakes: 41, blunders: 19 },
    byPhase: {
      opening: {
        accuracy: 79,
        mistakeShare: 21,
        keyIssue: "Preparation gaps cause long thinks before move 12.",
      },
      middlegame: {
        accuracy: 72,
        mistakeShare: 43,
        keyIssue: "Missed tactics and unnecessary complications appear together.",
      },
      endgame: {
        accuracy: 63,
        mistakeShare: 36,
        keyIssue: "Conversion and clock pressure combine in rook endings.",
      },
    },
    byColor: {
      white: {
        games: 21,
        scorePercent: 57,
        averageAccuracy: 76,
        mainLeak: "London structures become passive when c4 is delayed.",
      },
      black: {
        games: 21,
        scorePercent: 50,
        averageAccuracy: 72,
        mainLeak: "Caro-Kann Advance positions consume too much clock.",
      },
    },
    averageAccuracy: 74,
    conversion: {
      winningPositionsConverted: 64,
      wonEndgamesConverted: 52,
      note: "Clear material advantages are usually kept, but technical endings still leak half-points.",
    },
    resilience: {
      recoveryAfterMistake: 54,
      comebackScorePercent: 36,
      note: "Accuracy drops for several moves after a blunder unless you deliberately reset.",
    },
  },

  improvementHistory: [
    {
      periodLabel: "Last 7 games",
      summary:
        "Tactical scan improved, but clock usage stayed volatile in Caro-Kann and rook-ending positions.",
      improvedAreas: ["forcing-move awareness", "early kingside initiative"],
      worsenedAreas: ["endgame conversion under 2 minutes"],
      resolvedMistakes: ["automatic recaptures in simple exchanges"],
      newProblems: ["overpressing drawn rook endings"],
      analyzedGamesCount: 7,
    },
    {
      periodLabel: "Previous 15 games",
      summary:
        "Opening familiarity improved as White, while Black defenses against e4 still created early clock pressure.",
      improvedAreas: ["London plans after ...c5", "defensive resource finding"],
      worsenedAreas: ["Caro-Kann Advance time usage"],
      resolvedMistakes: ["ignoring back-rank threats"],
      newProblems: ["late queen-trade avoidance when ahead"],
      analyzedGamesCount: 15,
    },
    {
      periodLabel: "March 2026 baseline",
      summary:
        "Profile showed strong attacking instincts with broad leaks in time management, simplification, and technical endings.",
      improvedAreas: ["piece activity in open files"],
      worsenedAreas: ["none flagged"],
      resolvedMistakes: ["none yet"],
      newProblems: ["missed pawn-break timing", "weak rook-endgame technique"],
      analyzedGamesCount: 20,
    },
  ],

  recommendations: {
    currentFocus: {
      title: "Decision rhythm under clock pressure",
      summary:
        "Use a fixed candidate-move routine so tactics, endgames, and openings stop collapsing when the clock gets low.",
      whyItMatters:
        "Time management is the weakest skill and it amplifies missed tactics, endgame conversion, and risky decisions when ahead.",
      linkedMistakes: [
        "Poor clock management",
        "Missed tactical shots",
        "Weak endgame conversion",
      ],
    },
    priorityAreas: [
      {
        title: "Clock discipline",
        reason:
          "Most critical mistakes cluster after long early thinks and under two minutes.",
        linkedWeakness: "timeManagement",
        expectedBenefit:
          "Fewer one-move blunders and cleaner decisions in equal positions.",
      },
      {
        title: "Rook and pawn endgames",
        reason:
          "Winning positions are not converted often enough after simplification.",
        linkedWeakness: "endgames",
        expectedBenefit:
          "More half-points saved and more winning endings finished without counterplay.",
      },
      {
        title: "Prepared opening plans",
        reason:
          "Opening gaps are costing clock before the middlegame starts.",
        linkedWeakness: "openings",
        expectedBenefit:
          "Reach familiar structures faster with clearer plans after sidelines.",
      },
    ],
    studyPlan: [
      {
        title: "Model-game review",
        cadence: "3 sessions per week",
        steps: [
          "Pick one repertoire structure from the opening section.",
          "Review two model games without engine assistance.",
          "Write the pawn break, ideal piece setup, and common trade you want.",
        ],
      },
      {
        title: "Critical-position journal",
        cadence: "After every rapid game",
        steps: [
          "Mark the first moment you spent more than 90 seconds.",
          "Write your candidate moves before checking the engine.",
          "Save one repeatable rule for the next game.",
        ],
      },
    ],
    trainingRoutine: [
      {
        label: "Warmup",
        duration: "10 min",
        steps: ["5 forcing-move puzzles", "Name checks, captures, threats before moving"],
      },
      {
        label: "Main work",
        duration: "30 min",
        steps: ["Rook ending drill", "One clock-managed rapid review"],
      },
      {
        label: "Cooldown",
        duration: "5 min",
        steps: ["Write one practical rule", "Choose tomorrow's first drill"],
      },
    ],
  },

  growthBlockers: [
    {
      title: "Time pressure decisions",
      severity: "Critical",
      whatHappens:
        "You spend premium time in stable positions, then enter tactical or technical moments with almost no clock buffer.",
      howToImprove:
        "Use a three-step clock routine: classify the position, list forcing moves, then cap calculation unless the position is critical.",
      exercises: [
        "Play 3 rapid games and write the move number where you first drop below 5 minutes.",
        "Solve 10 tactics with a 45-second limit per puzzle.",
        "Review one loss and mark every move that used more than 90 seconds.",
      ],
      estimatedImpactLabel: "+80 to +120 rating points over 8 weeks",
    },
    {
      title: "Weak endgame conversion",
      severity: "High",
      whatHappens:
        "Winning endgames become practical races because active king placement, rook activity, and pawn-break timing are delayed.",
      howToImprove:
        "Drill technical positions with a conversion checklist: activate king, improve rook, restrict counterplay, then calculate pawn breaks.",
      exercises: [
        "5 rook activity drills from winning positions.",
        "10 king-and-pawn opposition studies.",
        "Annotate 3 master games where one side converts an extra pawn.",
      ],
      estimatedImpactLabel: "+50 to +90 rating points",
    },
    {
      title: "Opening preparation gaps",
      severity: "Medium",
      whatHappens:
        "You leave familiar structures early, spend time rebuilding the plan, and reach the middlegame without a clear pawn break.",
      howToImprove:
        "Study plans instead of memorizing more moves. For each line, define the pawn break, worst minor piece, and trade target.",
      exercises: [
        "Create 3 flashcards for Caro-Kann Advance plans.",
        "Review 2 London model games with early c4.",
        "Add one anti-line plan against the Petrov.",
      ],
      estimatedImpactLabel: "+30 to +60 rating points",
    },
    {
      title: "Overcomplicating winning positions",
      severity: "Medium",
      whatHappens:
        "A winning position becomes messy because you search for a knockout instead of removing counterplay.",
      howToImprove:
        "Before attacking, ask what the opponent's only active idea is, then prefer trades and consolidation if tactics are not forced.",
      exercises: [
        "Review 5 winning positions and choose the simplest conversion move.",
        "Solve 8 advantage-conversion puzzles without engine hints.",
        "Write one no-counterplay rule before each rapid session.",
      ],
      estimatedImpactLabel: "+40 to +70 rating points",
    },
  ],

  trainingPlan: {
    durationWeeks: 6,
    weeklyBlocks: [
      {
        weekLabel: "Week 1",
        theme: "Clock discipline",
        objective: "Build a repeatable decision rhythm before move 30.",
        tasks: ["Clock journal after each rapid game", "45-second tactics", "Opening plan flashcards"],
        successMetric: "No game reaches move 25 with less than 3 minutes unless the position was critical.",
      },
      {
        weekLabel: "Week 2",
        theme: "Forcing-move scan",
        objective: "Make checks, captures, and threats automatic before quiet moves.",
        tasks: ["Mixed tactical sets", "Defensive-resource puzzles", "Missed-shot annotations"],
        successMetric: "Every reviewed critical position has at least three candidate moves listed.",
      },
      {
        weekLabel: "Week 3-4",
        theme: "Endgame conversion",
        objective: "Convert simple advantages without creating counterplay.",
        tasks: ["Rook activity drills", "King-and-pawn studies", "Master-game conversion review"],
        successMetric: "Winning endgames are reviewed with a king, rook, pawn-break checklist.",
      },
      {
        weekLabel: "Week 5-6",
        theme: "Opening plans into middlegames",
        objective: "Enter familiar structures with enough time and a known pawn break.",
        tasks: ["London c4 model games", "Caro-Kann Advance ...c5 drills", "Petrov anti-line review"],
        successMetric: "Prepared lines include a plan through move 12 plus one common sideline.",
      },
    ],
    dailyTasks: [
      {
        label: "Forcing-move warmup",
        duration: "10 min",
        frequency: "daily",
        details: "Solve tactics by saying checks, captures, threats before choosing a move.",
      },
      {
        label: "Clock review",
        duration: "10 min",
        frequency: "after each rapid game",
        details: "Mark the first long think and decide whether it was actually critical.",
      },
      {
        label: "Endgame drill",
        duration: "15 min",
        frequency: "4x per week",
        details: "Practice one rook or pawn ending and write the conversion rule.",
      },
    ],
    todayPrescription: {
      task: "Review 3 recent losses where the first major error happened under time pressure.",
      duration: "45 min",
      difficulty: "Medium",
      reason:
        "This directly targets the current focus and the highest-severity growth blocker.",
      checklist: [
        "Find the first move where you spent more than 90 seconds.",
        "Mark the critical position before the blunder.",
        "List checks, captures, and threats you missed.",
        "Write the simpler move that preserved the advantage or held equality.",
        "Create one clock rule for the next rapid game.",
      ],
    },
  },

  profileConfidence: {
    overall: 68,
    basedOnGames: 42,
    confidenceByArea: {
      calculation: 72,
      positionalUnderstanding: 66,
      openings: 71,
      tacticalThemes: 78,
      endgames: 64,
      middlegame: 70,
      timeManagement: 82,
      psychologicalResilience: 61,
    },
    warning:
      "This profile is still preliminary. The plan may change after more rapid and classical games are analyzed.",
  },

  decisionPatterns: {
    riskProfile: "High initiative, high variance when ahead",
    commonBehaviors: [
      "Prefers active piece moves over simplification even when up material.",
      "Calculates deeply in stable positions, then rushes concrete defensive moves later.",
      "Trusts attacking momentum more than technical conversion.",
      "Resets well only when a deliberate pause is built into the move routine.",
    ],
    description:
      "Your decision profile is ambitious and resourceful, but it needs a stronger practical filter. The best gains should come from knowing when a position demands calculation and when it asks for consolidation.",
  },
};

export default mockProfileDelta;
