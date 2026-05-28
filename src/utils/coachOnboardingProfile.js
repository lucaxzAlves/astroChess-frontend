function getHighestChessRating(profile) {
  const ratings = profile?.ratings?.chessCom || {};
  return Math.max(
    Number(ratings.rapid || 0),
    Number(ratings.blitz || 0),
    Number(ratings.bullet || 0),
    Number(ratings.daily || 0)
  );
}

function mapCoachStyleToFrontendTone(coachPreferences = {}) {
  const selectedStyle = coachPreferences?.selectedCoachStyle;
  const tone = coachPreferences?.tone;

  if (tone === "strict" || selectedStyle === "strict_coach") {
    return "direct_demanding";
  }

  if (selectedStyle === "calm_mentor" || tone === "encouraging") {
    return "calm_explanatory";
  }

  if (selectedStyle === "positional_strategist" || tone === "detailed") {
    return "strategic_deep";
  }

  if (selectedStyle === "aggressive_trainer") {
    return "motivational";
  }

  if (selectedStyle === "tactical_master" || tone === "short") {
    return "practical_objective";
  }

  return "practical_objective";
}

function mapPlayingStyleToFrontendStyle(style = "unknown") {
  const normalized = String(style || "unknown").toLowerCase();

  if (normalized === "aggressive" || normalized === "tactical") {
    return "tactical_aggressive";
  }

  if (normalized === "positional") {
    return "positional_strategic";
  }

  if (normalized === "solid" || normalized === "defensive") {
    return "solid_defensive";
  }

  if (normalized === "dynamic") {
    return "dynamic_practical";
  }

  return "unknown";
}

function mapWeaknessToFrontendWeakness(rawValue = "") {
  const value = String(rawValue || "").toLowerCase();

  if (value.includes("time")) return "time_pressure";
  if (value.includes("opening")) return "poor_openings";
  if (value.includes("endgame")) return "endgame_technique";
  if (value.includes("psychological") || value.includes("tilt")) return "psychological_tilt";
  if (value.includes("conversion") || value.includes("convert")) {
    return "converting_winning_positions";
  }
  if (value.includes("tactic") || value.includes("blunder") || value.includes("calculation")) {
    return "tactical_blunders";
  }

  return "tactical_blunders";
}

function mapEstimatedStrengthToCurrentLevel(level = "", highestRating = 0) {
  const normalized = String(level || "").toLowerCase();

  if (normalized === "beginner") return "beginner";
  if (normalized === "intermediate") return "intermediate";
  if (normalized === "advanced") return "advanced_club_player";
  if (normalized === "expert") return "competitive_player";
  if (normalized === "master_candidate") return "titled_or_near_titled";

  if (highestRating >= 2200) return "titled_or_near_titled";
  if (highestRating >= 1800) return "competitive_player";
  if (highestRating >= 1500) return "advanced_club_player";
  if (highestRating >= 1100) return "intermediate";

  return "beginner";
}

function buildPreferredTrainingTypes(profile) {
  const goal = profile?.mainGoal;
  const weakness = profile?.perceivedWeakness;
  const result = new Set(["annotated_games"]);

  if (goal === "improve_calculation" || weakness === "tactical_blunders") {
    result.add("calculation");
    result.add("puzzles");
  }

  if (goal === "improve_openings" || weakness === "poor_openings") {
    result.add("openings");
  }

  if (goal === "improve_endgames" || weakness === "endgame_technique") {
    result.add("endgames");
  }

  if (goal === "prepare_tournaments" || goal === "gain_rating") {
    result.add("strategy");
  }

  return [...result];
}

function mapFrontendToneToCoachPreferences(profile) {
  const toneMap = {
    direct_demanding: {
      selectedCoachStyle: "strict_coach",
      tone: "strict",
      explanationDepth: "advanced",
    },
    calm_explanatory: {
      selectedCoachStyle: "calm_mentor",
      tone: "encouraging",
      explanationDepth: "simple",
    },
    strategic_deep: {
      selectedCoachStyle: "positional_strategist",
      tone: "detailed",
      explanationDepth: "advanced",
    },
    practical_objective: {
      selectedCoachStyle: "tactical_master",
      tone: "short",
      explanationDepth: "intermediate",
    },
    motivational: {
      selectedCoachStyle: "aggressive_trainer",
      tone: "encouraging",
      explanationDepth: "intermediate",
    },
  };

  return toneMap[profile?.coachTone] || toneMap.practical_objective;
}

export function buildCoachOnboardingProfileFromPlayerProfile(profile) {
  if (!profile || typeof profile !== "object") return null;

  const highestRating = getHighestChessRating(profile);
  const focusAreas = Array.isArray(profile?.goals?.focusAreas) ? profile.goals.focusAreas : [];
  const fallbackWeakness =
    profile?.criticalPhaseWeakness?.description ||
    focusAreas[0] ||
    profile?.recurringMistakes?.[0]?.category ||
    "";
  const dailyTrainingMinutes =
    Number(profile?.trainingPreferences?.dailyTrainingMinutes || 0) || 30;

  const mainGoal = profile?.goals?.mainGoal;
  const coachTone = mapCoachStyleToFrontendTone(profile?.coachPreferences);

  if (!mainGoal && !profile?.coachPreferences && !profile?.trainingPreferences) {
    return null;
  }

  return {
    mainGoal: mainGoal || "gain_rating",
    currentLevel: mapEstimatedStrengthToCurrentLevel(
      profile?.ratings?.estimatedStrength?.level,
      highestRating
    ),
    perceivedPlayingStyle: mapPlayingStyleToFrontendStyle(profile?.playingStyle?.primaryStyle),
    perceivedWeakness: mapWeaknessToFrontendWeakness(fallbackWeakness),
    coachTone,
    dailyTrainingMinutes,
  };
}

export function mapCoachOnboardingToProfilePreferences(profile) {
  const coachPreferences = mapFrontendToneToCoachPreferences(profile);

  return {
    coachPreferences: {
      ...coachPreferences,
      preferredLanguage: "en",
    },
    goals: {
      mainGoal: profile?.mainGoal || "gain_rating",
      focusAreas: profile?.perceivedWeakness ? [profile.perceivedWeakness] : [],
      tournamentPreparation: {
        enabled: profile?.mainGoal === "prepare_tournaments",
      },
    },
    trainingPreferences: {
      dailyTrainingMinutes: Number(profile?.dailyTrainingMinutes) || 30,
      preferredTrainingTypes: buildPreferredTrainingTypes(profile),
    },
  };
}
