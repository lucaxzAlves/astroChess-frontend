function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toPercent(value, fallback = 0) {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return fallback;
  if (numeric <= 1) return Math.round(numeric * 100);
  return Math.round(numeric);
}

function toNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isNaN(numeric) ? fallback : numeric;
}

function titleize(value = "") {
  return String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function buildFrequencyLabel(frequency, totalGames) {
  if (!Number.isFinite(Number(frequency))) return "Frequency unknown";
  const hits = Number(frequency);

  if (Number.isFinite(Number(totalGames)) && Number(totalGames) > 0) {
    return `${hits} of ${totalGames} games`;
  }

  return `${hits} hits`;
}

function formatMistakeExample(example) {
  if (!isObject(example)) return String(example || "");

  const parts = [];
  if (Number.isFinite(Number(example.moveNumber))) {
    parts.push(`Move ${example.moveNumber}`);
  }
  if (example.playedMove) {
    parts.push(String(example.playedMove));
  }
  if (example.bestMove) {
    parts.push(`best: ${example.bestMove}`);
  }
  if (example.explanation) {
    parts.push(String(example.explanation));
  }

  return parts.filter(Boolean).join(" — ");
}

function formatStrengthExample(example) {
  if (!isObject(example)) return String(example || "");

  const parts = [];
  if (Number.isFinite(Number(example.moveNumber))) {
    parts.push(`Move ${example.moveNumber}`);
  }
  if (example.explanation) {
    parts.push(String(example.explanation));
  }

  return parts.filter(Boolean).join(" — ");
}

function mapSkillMap(rawSkillMap = {}) {
  const categories = isObject(rawSkillMap?.categories) ? rawSkillMap.categories : {};

  return {
    overallScore: toPercent(rawSkillMap?.overallScore?.value ?? rawSkillMap?.overallScore ?? 0),
    ...Object.fromEntries(
      Object.entries(categories).map(([key, value]) => [
        key,
        {
          value: toPercent(value?.value, 0),
          description: value?.description || "",
          confidence: toPercent(value?.confidence, 0),
          evidenceCount: toNumber(value?.evidenceCount, 0),
        },
      ])
    ),
  };
}

function mapPlayingStyle(rawPlayingStyle = {}) {
  return {
    primaryStyle: titleize(rawPlayingStyle?.primaryStyle || "unknown"),
    secondaryStyles: Array.isArray(rawPlayingStyle?.secondaryStyles)
      ? rawPlayingStyle.secondaryStyles.map((item) => titleize(item))
      : [],
    styleScores: {
      aggression: toPercent(rawPlayingStyle?.styleScores?.aggression, 0),
      tacticalSharpness: toPercent(rawPlayingStyle?.styleScores?.tacticalSharpness, 0),
      positionalUnderstanding: toPercent(rawPlayingStyle?.styleScores?.positionalUnderstanding, 0),
      riskTolerance: toPercent(rawPlayingStyle?.styleScores?.riskTolerance, 0),
      defensiveSkill: toPercent(rawPlayingStyle?.styleScores?.defensiveSkill, 0),
      endgameSkill: toPercent(rawPlayingStyle?.styleScores?.endgameSkill, 0),
      openingPreparation: toPercent(rawPlayingStyle?.styleScores?.openingPreparation, 0),
      conversionSkill: toPercent(rawPlayingStyle?.styleScores?.conversionSkill, 0),
      calculationSkill: toPercent(rawPlayingStyle?.styleScores?.calculationSkill, 0),
    },
    description:
      rawPlayingStyle?.description ||
      "Playing style will become more descriptive after enough games are analyzed.",
  };
}

function mapRecurringMistakes(rawMistakes = [], totalGames = 0) {
  return rawMistakes.map((mistake) => ({
    key: mistake?.key || `${mistake?.category || "unknown"}-${mistake?.name || "mistake"}`,
    category: titleize(mistake?.category || "unknown"),
    name: mistake?.name || "Unnamed mistake",
    description: mistake?.description || "No description available yet.",
    frequency: buildFrequencyLabel(mistake?.frequency, totalGames),
    frequencyValue: toNumber(mistake?.frequency, 0),
    severity: titleize(mistake?.severity || "unknown"),
    phases: Array.isArray(mistake?.phases) ? mistake.phases.map((phase) => titleize(phase)) : [],
    examples: Array.isArray(mistake?.examples) ? mistake.examples.map(formatMistakeExample) : [],
    status: titleize(mistake?.status || "active"),
    confidence: toPercent(mistake?.confidence, 0),
    raw: mistake,
  }));
}

function mapStrengths(rawStrengths = []) {
  return rawStrengths.map((strength) => ({
    key: strength?.key || strength?.name || "strength",
    name: strength?.name || "Unnamed strength",
    description: strength?.description || "No strength description available yet.",
    evidenceCount: toNumber(strength?.evidenceCount, 0),
    examples: Array.isArray(strength?.examples) ? strength.examples.map(formatStrengthExample) : [],
    confidence: toPercent(strength?.confidence, 0),
    raw: strength,
  }));
}

function mapOpeningProfile(opening) {
  return {
    ECO: opening?.eco || opening?.ECO || "",
    eco: opening?.eco || opening?.ECO || "",
    name: opening?.name || "Unnamed opening",
    moves: opening?.moves || "",
    games: toNumber(opening?.games, 0),
    scorePercent: toPercent(opening?.scorePercent, 0),
    commonMistakes: Array.isArray(opening?.commonMistakes)
      ? opening.commonMistakes
      : Array.isArray(opening?.recurringIssues)
        ? opening.recurringIssues
        : [],
    recommendedStudy: Array.isArray(opening?.recommendedStudy)
      ? opening.recommendedStudy.join(" • ")
      : opening?.recommendedStudy || "",
    lastSeenAt: opening?.lastSeenAt || null,
  };
}

function mapOpeningRepertoire(rawOpeningRepertoire = {}) {
  return {
    asWhite: Array.isArray(rawOpeningRepertoire?.asWhite)
      ? rawOpeningRepertoire.asWhite.map(mapOpeningProfile)
      : [],
    asBlack: {
      againstE4: Array.isArray(rawOpeningRepertoire?.asBlack?.againstE4)
        ? rawOpeningRepertoire.asBlack.againstE4.map(mapOpeningProfile)
        : [],
      againstD4: Array.isArray(rawOpeningRepertoire?.asBlack?.againstD4)
        ? rawOpeningRepertoire.asBlack.againstD4.map(mapOpeningProfile)
        : [],
      againstOther: Array.isArray(rawOpeningRepertoire?.asBlack?.againstOther)
        ? rawOpeningRepertoire.asBlack.againstOther.map(mapOpeningProfile)
        : [],
    },
  };
}

function mapChessStats(rawChessStats = {}) {
  const phaseSource = rawChessStats?.byPhase || {};
  const colorSource = rawChessStats?.byColor || {};
  const totalPhaseMistakes = Object.values(phaseSource).reduce(
    (sum, phase) =>
      sum +
      toNumber(phase?.inaccuracies, 0) +
      toNumber(phase?.mistakes, 0) +
      toNumber(phase?.blunders, 0),
    0
  );

  const conversionTotal =
    toNumber(rawChessStats?.conversion?.advantagesConverted, 0) +
    toNumber(rawChessStats?.conversion?.winningPositionsLost, 0) +
    toNumber(rawChessStats?.conversion?.winningPositionsDrawn, 0);

  const resilienceEvents =
    toNumber(rawChessStats?.resilience?.worsePositionsSaved, 0) +
    toNumber(rawChessStats?.resilience?.lostPositionsRecovered, 0);

  return {
    totalGamesAnalyzed: toNumber(rawChessStats?.totalGamesAnalyzed, 0),
    results: {
      wins: toNumber(rawChessStats?.results?.wins, 0),
      draws: toNumber(rawChessStats?.results?.draws, 0),
      losses: toNumber(rawChessStats?.results?.losses, 0),
    },
    averageAccuracy:
      rawChessStats?.averageAccuracy !== undefined
        ? toPercent(rawChessStats.averageAccuracy, 0)
        : null,
    mistakeDistribution: {
      inaccuracies: toNumber(rawChessStats?.mistakeDistribution?.inaccuracies, 0),
      mistakes: toNumber(rawChessStats?.mistakeDistribution?.mistakes, 0),
      blunders: toNumber(rawChessStats?.mistakeDistribution?.blunders, 0),
    },
    byPhase: Object.fromEntries(
      Object.entries(phaseSource).map(([phase, data]) => {
        const phaseMistakes =
          toNumber(data?.inaccuracies, 0) + toNumber(data?.mistakes, 0) + toNumber(data?.blunders, 0);

        return [
          phase,
          {
            games: toNumber(data?.games, 0),
            inaccuracies: toNumber(data?.inaccuracies, 0),
            mistakes: toNumber(data?.mistakes, 0),
            blunders: toNumber(data?.blunders, 0),
            accuracy:
              data?.accuracy !== undefined && data?.accuracy !== null
                ? toPercent(data?.accuracy, 0)
                : null,
            mistakeShare:
              totalPhaseMistakes > 0 ? Math.round((phaseMistakes / totalPhaseMistakes) * 100) : null,
            keyIssue: data?.description || "No phase description available yet.",
          },
        ];
      })
    ),
    byColor: Object.fromEntries(
      Object.entries(colorSource).map(([color, data]) => {
        const games = toNumber(data?.games, 0);
        const wins = toNumber(data?.wins, 0);

        return [
          color,
          {
            games,
            wins,
            draws: toNumber(data?.draws, 0),
            losses: toNumber(data?.losses, 0),
            scorePercent: games > 0 ? Math.round((wins / games) * 100) : null,
            averageAccuracy:
              data?.averageAccuracy !== undefined && data?.averageAccuracy !== null
                ? toPercent(data?.averageAccuracy, 0)
                : null,
            mainLeak: Array.isArray(data?.commonIssues)
              ? data.commonIssues[0] || "No common issue noted yet."
              : "No common issue noted yet.",
            commonIssues: Array.isArray(data?.commonIssues) ? data.commonIssues : [],
          },
        ];
      })
    ),
    conversion: {
      winningPositionsConverted:
        conversionTotal > 0
          ? Math.round((toNumber(rawChessStats?.conversion?.advantagesConverted, 0) / conversionTotal) * 100)
          : null,
      advantagesConverted: toNumber(rawChessStats?.conversion?.advantagesConverted, 0),
      winningPositionsLost: toNumber(rawChessStats?.conversion?.winningPositionsLost, 0),
      winningPositionsDrawn: toNumber(rawChessStats?.conversion?.winningPositionsDrawn, 0),
      note:
        conversionTotal > 0
          ? `${toNumber(rawChessStats?.conversion?.advantagesConverted, 0)} converted, ${toNumber(
              rawChessStats?.conversion?.winningPositionsLost,
              0
            )} lost, ${toNumber(rawChessStats?.conversion?.winningPositionsDrawn, 0)} drawn.`
          : "Conversion evidence will appear after enough analyzed advantages exist.",
    },
    resilience: {
      recoveryAfterMistake:
        rawChessStats?.totalGamesAnalyzed > 0
          ? Math.round((resilienceEvents / toNumber(rawChessStats?.totalGamesAnalyzed, 1)) * 100)
          : null,
      worsePositionsSaved: toNumber(rawChessStats?.resilience?.worsePositionsSaved, 0),
      lostPositionsRecovered: toNumber(rawChessStats?.resilience?.lostPositionsRecovered, 0),
      note:
        resilienceEvents > 0
          ? `${toNumber(rawChessStats?.resilience?.worsePositionsSaved, 0)} worse positions saved and ${toNumber(
              rawChessStats?.resilience?.lostPositionsRecovered,
              0
            )} lost positions recovered.`
          : "Resilience evidence will appear after enough recovery events exist.",
    },
  };
}

function mapImprovementHistory(rawEntries = []) {
  return rawEntries.map((entry, index) => ({
    periodLabel: entry?.periodLabel || `Update ${index + 1}`,
    summary: entry?.summary || "Profile update recorded.",
    improvedAreas: Array.isArray(entry?.improvedAreas)
      ? entry.improvedAreas.map((item) =>
          isObject(item)
            ? `${titleize(item.area || "Area")}${
                item.previousScore !== undefined && item.currentScore !== undefined
                  ? ` (${toPercent(item.previousScore)} → ${toPercent(item.currentScore)})`
                  : ""
              }`
            : String(item)
        )
      : [],
    worsenedAreas: Array.isArray(entry?.worsenedAreas)
      ? entry.worsenedAreas.map((item) =>
          isObject(item)
            ? `${titleize(item.area || "Area")}${
                item.previousScore !== undefined && item.currentScore !== undefined
                  ? ` (${toPercent(item.previousScore)} → ${toPercent(item.currentScore)})`
                  : ""
              }`
            : String(item)
        )
      : [],
    resolvedMistakes: Array.isArray(entry?.resolvedMistakes) ? entry.resolvedMistakes : [],
    newProblems: Array.isArray(entry?.newProblems) ? entry.newProblems : [],
    analyzedGamesCount: toNumber(entry?.analyzedGamesCount, 0),
  }));
}

function derivePriorityAreas(skillMap, recurringMistakes) {
  const skillEntries = Object.entries(skillMap || {})
    .filter(([key]) => key !== "overallScore")
    .map(([key, value]) => ({
      key,
      value: toNumber(value?.value, 0),
      description: value?.description || "",
    }))
    .sort((a, b) => a.value - b.value)
    .slice(0, 3);

  return skillEntries.map((skill, index) => {
    const linkedMistake = recurringMistakes[index] || recurringMistakes[0];

    return {
      title: titleize(skill.key),
      reason: linkedMistake?.description || skill.description || "This area needs more stability.",
      linkedWeakness: skill.key,
      expectedBenefit:
        linkedMistake?.name
          ? `Reduce the frequency of ${linkedMistake.name.toLowerCase()}.`
          : "Create more reliable practical decisions in this phase.",
    };
  });
}

function mapRecommendations(rawRecommendations = {}, skillMap = {}, recurringMistakes = [], strengths = []) {
  const currentFocusTitle =
    rawRecommendations?.currentFocus ||
    recurringMistakes?.[0]?.name ||
    strengths?.[0]?.name ||
    "Build a first evidence-backed focus";

  const currentFocus = {
    title: currentFocusTitle,
    summary:
      rawRecommendations?.trainingRoutine?.description ||
      recurringMistakes?.[0]?.description ||
      "The coach needs a deeper batch of analyzed games to sharpen this focus.",
    whyItMatters:
      recurringMistakes?.[0]?.description ||
      "This focus is selected from the weakest skill signals and recurring profile evidence.",
    linkedMistakes: recurringMistakes.slice(0, 3).map((mistake) => mistake.name),
  };

  const studyPlan = Array.isArray(rawRecommendations?.studyPlan)
    ? rawRecommendations.studyPlan.map((item) => ({
        title: item?.title || "Study block",
        cadence: titleize(item?.priority || item?.type || "study"),
        steps: [item?.reason, item?.url].filter(Boolean),
      }))
    : [];

  const trainingRoutine = Array.isArray(rawRecommendations?.trainingRoutine?.dailyTasks)
    ? rawRecommendations.trainingRoutine.dailyTasks.map((task) => ({
        label: task?.task || task?.theme || "Daily task",
        duration: task?.minutes ? `${task.minutes} min` : "Flexible",
        steps: [task?.theme].filter(Boolean),
      }))
    : [];

  return {
    currentFocus,
    priorityAreas: derivePriorityAreas(skillMap, recurringMistakes),
    studyPlan,
    trainingRoutine,
    raw: rawRecommendations,
  };
}

function deriveGrowthBlockers(recurringMistakes = [], recommendations = {}) {
  return recurringMistakes.slice(0, 4).map((mistake, index) => {
    const linkedStudyPlan = recommendations?.studyPlan?.[index] || recommendations?.studyPlan?.[0];
    const linkedRoutine = recommendations?.trainingRoutine?.[index] || recommendations?.trainingRoutine?.[0];

    return {
      title: mistake.name,
      severity: mistake.severity,
      whatHappens: mistake.description,
      howToImprove:
        linkedStudyPlan?.steps?.[0] ||
        linkedRoutine?.steps?.[0] ||
        "Use targeted annotated review and practical drills tied to this recurring pattern.",
      exercises:
        linkedStudyPlan?.steps?.length
          ? linkedStudyPlan.steps
          : linkedRoutine?.steps?.length
            ? linkedRoutine.steps
            : mistake.examples.slice(0, 3),
      estimatedImpactLabel: mistake.frequency,
    };
  });
}

function deriveTrainingPlan(recommendations = {}, recurringMistakes = []) {
  const rawRoutine = recommendations?.raw?.trainingRoutine || {};
  const durationWeeks = rawRoutine?.durationDays
    ? Math.max(1, Math.round(Number(rawRoutine.durationDays) / 7))
    : 0;

  const dailyTasks = Array.isArray(rawRoutine?.dailyTasks)
    ? rawRoutine.dailyTasks.map((task) => ({
        label: task?.task || task?.theme || "Daily task",
        duration: task?.minutes ? `${task.minutes} min` : "Flexible",
        frequency: "daily",
        details: task?.theme || rawRoutine?.description || "Coach-guided routine task.",
      }))
    : [];

  const weeklyBlocks = Array.isArray(recommendations?.studyPlan)
    ? recommendations.studyPlan.slice(0, 4).map((item, index) => ({
        weekLabel: `Block ${index + 1}`,
        theme: item?.title || `Study block ${index + 1}`,
        objective: item?.steps?.[0] || "Review the linked diagnostic theme.",
        tasks: item?.steps?.length ? item.steps : ["Review recent mistakes", "Annotate one training game"],
        successMetric: item?.cadence || "Complete the block consistently.",
      }))
    : [];

  const firstMistake = recurringMistakes[0];
  const firstTask = dailyTasks[0] || null;

  return {
    durationWeeks,
    weeklyBlocks,
    dailyTasks,
    todayPrescription: firstTask
      ? {
          task: firstTask.label,
          duration: firstTask.duration,
          difficulty: firstMistake?.severity || "Focused",
          reason:
            recommendations?.currentFocus?.summary ||
            firstMistake?.description ||
            "Derived from your latest coach routine.",
          checklist: [
            firstTask.details,
            recommendations?.currentFocus?.whyItMatters,
            firstMistake?.examples?.[0],
          ].filter(Boolean),
        }
      : null,
  };
}

function mapProfileConfidence(rawProfileConfidence = {}, totalGamesAnalyzed = 0) {
  return {
    overall: toPercent(rawProfileConfidence?.overall, 0),
    basedOnGames:
      rawProfileConfidence?.basedOnGames !== undefined
        ? toNumber(rawProfileConfidence.basedOnGames, totalGamesAnalyzed)
        : totalGamesAnalyzed,
    confidenceByArea: Object.fromEntries(
      Object.entries(rawProfileConfidence?.confidenceByArea || {}).map(([key, value]) => [
        key,
        toPercent(value, 0),
      ])
    ),
    warning: rawProfileConfidence?.warning || "",
  };
}

function mapDecisionPatterns(rawDecisionPatterns = {}) {
  return {
    riskProfile: titleize(rawDecisionPatterns?.riskProfile || "unknown"),
    commonBehaviors: Array.isArray(rawDecisionPatterns?.commonBehaviors)
      ? rawDecisionPatterns.commonBehaviors
      : [],
    description:
      rawDecisionPatterns?.description ||
      "Decision patterns will become more descriptive after enough analyzed evidence exists.",
  };
}

function countOpeningLines(openingRepertoire = {}) {
  const groups = [
    ...(openingRepertoire?.asWhite || []),
    ...(openingRepertoire?.asBlack?.againstE4 || []),
    ...(openingRepertoire?.asBlack?.againstD4 || []),
    ...(openingRepertoire?.asBlack?.againstOther || []),
  ];

  return groups.length;
}

export function hasMeaningfulPlayerProfile(profile) {
  if (!profile || typeof profile !== "object") return false;

  const totalGamesAnalyzed = toNumber(profile?.chessStats?.totalGamesAnalyzed, 0);
  const recurringMistakesCount = Array.isArray(profile?.recurringMistakes)
    ? profile.recurringMistakes.length
    : 0;
  const strengthsCount = Array.isArray(profile?.strengths) ? profile.strengths.length : 0;
  const openingCount = countOpeningLines(profile?.openingRepertoire);
  const overallSkill = toPercent(profile?.skillMap?.overallScore?.value ?? profile?.skillMap?.overallScore, 0);
  const studyPlanCount = Array.isArray(profile?.recommendations?.studyPlan)
    ? profile.recommendations.studyPlan.length
    : 0;

  return (
    totalGamesAnalyzed > 0 ||
    recurringMistakesCount > 0 ||
    strengthsCount > 0 ||
    openingCount > 0 ||
    overallSkill > 0 ||
    studyPlanCount > 0
  );
}

export function normalizePlayerProfileForUI(userProfile) {
  if (!userProfile || typeof userProfile !== "object") {
    return null;
  }

  const skillMap = mapSkillMap(userProfile?.skillMap || {});
  const chessStats = mapChessStats(userProfile?.chessStats || {});
  const recurringMistakes = mapRecurringMistakes(
    userProfile?.recurringMistakes || [],
    chessStats.totalGamesAnalyzed
  );
  const strengths = mapStrengths(userProfile?.strengths || []);
  const recommendations = mapRecommendations(
    userProfile?.recommendations || {},
    skillMap,
    recurringMistakes,
    strengths
  );
  const growthBlockers = deriveGrowthBlockers(recurringMistakes, recommendations);
  const trainingPlan = deriveTrainingPlan(recommendations, recurringMistakes);

  return {
    skillMap,
    playingStyle: mapPlayingStyle(userProfile?.playingStyle || {}),
    recurringMistakes,
    strengths,
    openingRepertoire: mapOpeningRepertoire(userProfile?.openingRepertoire || {}),
    chessStats,
    improvementHistory: mapImprovementHistory(userProfile?.improvementHistory || []),
    recommendations,
    growthBlockers,
    trainingPlan,
    profileConfidence: mapProfileConfidence(
      userProfile?.profileConfidence || {},
      chessStats.totalGamesAnalyzed
    ),
    decisionPatterns: mapDecisionPatterns(userProfile?.decisionPatterns || {}),
    meta: {
      hasMeaningfulProfile: hasMeaningfulPlayerProfile(userProfile),
      chessComUsername: userProfile?.identities?.chessCom?.username || "",
      totalGamesAnalyzed: chessStats.totalGamesAnalyzed,
      lastProfileUpdateAt: userProfile?.lastProfileUpdateAt || userProfile?.updatedAt || null,
      coachPreferences: userProfile?.coachPreferences || {},
      goals: userProfile?.goals || {},
      trainingPreferences: userProfile?.trainingPreferences || {},
      ratings: userProfile?.ratings || {},
    },
    rawProfile: userProfile,
  };
}
