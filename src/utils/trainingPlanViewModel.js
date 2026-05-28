const practiceModes = {
  academy: "Academy",
  masterReplay: "Master Replay",
  personalReplay: "Personal Replay",
  patternForge: "Pattern Forge",
};

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function titleize(value = "") {
  return String(value || "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function translateCommonLabel(value = "") {
  const labels = {
    Calculation: "Cálculo",
    "Calculation Instability": "Instabilidade no cálculo",
    "Endgame Conversion": "Conversão em finais",
    "Opening Plans": "Planos de abertura",
    "Opening plans": "Planos de abertura",
    "Opening Cleanup": "Limpeza de abertura",
    "Personal Replay": "Personal Replay",
    "Pattern Forge": "Pattern Forge",
    "Master Replay": "Master Replay",
    Academy: "Academy",
    Tactics: "Tática",
    Endgame: "Final",
    Openings: "Aberturas",
    Practice: "Treino",
    "Time Management": "Gestão do tempo",
    Endgames: "Finais",
    "Opening Review": "Revisão de abertura",
  };

  return labels[value] || value;
}

function numberOr(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function getSkillEntries(skillMap = {}) {
  return Object.entries(skillMap || {})
    .filter(([key]) => key !== "overallScore")
    .map(([key, value]) => ({
      key,
      title: translateCommonLabel(titleize(key)),
      score: numberOr(value?.value ?? value, 0),
      description: value?.description || "",
    }))
    .sort((left, right) => left.score - right.score);
}

function pickModeForText(text = "") {
  const normalized = String(text).toLowerCase();
  if (normalized.includes("opening") || normalized.includes("strategy") || normalized.includes("concept")) {
    return practiceModes.academy;
  }
  if (normalized.includes("model") || normalized.includes("plan") || normalized.includes("master")) {
    return practiceModes.masterReplay;
  }
  if (normalized.includes("repeat") || normalized.includes("tactic") || normalized.includes("pattern")) {
    return practiceModes.patternForge;
  }
  return practiceModes.personalReplay;
}

function buildFallbackPlan() {
  return {
    isFallback: true,
    sourceLabel: "Plano demo",
    growthBlockers: [
      {
        title: "Instabilidade no cálculo",
        severity: "high",
        whatHappens: "O coach precisa de um perfil real; por isso, esta prévia assume falhas táticas sob pressão.",
        estimatedImpactLabel: "Alto impacto",
      },
      {
        title: "Conversão em finais",
        severity: "medium",
        whatHappens: "Uma área comum de evolução exibida até que exista evidência de partidas analisadas.",
        estimatedImpactLabel: "Impacto médio",
      },
      {
        title: "Planos de abertura",
        severity: "medium",
        whatHappens: "O plano provisório mantém o estudo de aberturas prático e baseado em planos.",
        estimatedImpactLabel: "Estabiliza meios-jogos",
      },
    ],
    currentFocus: {
      title: "Criar uma base de treino com evidências",
      reason: "Ainda não há um playerProfile ativo. Analise partidas para gerar um diagnóstico personalizado.",
      linkedWeakness: "Configuração do perfil",
      expectedBenefit: "O coach substituirá este plano demo por prioridades vindas das suas próprias partidas.",
      confidence: 35,
      source: "Provisório",
    },
    phase: {
      name: "Fundação",
      description: "Criar a primeira base confiável de treino a partir de partidas analisadas.",
    },
    priorityAreas: [
      {
        rank: 1,
        title: "Base de cálculo",
        why: "Comece por lances forçados e higiene tática.",
        evidence: "Recomendação demo até existirem dados de perfil.",
        severity: "high",
        mode: practiceModes.patternForge,
      },
      {
        rank: 2,
        title: "Revisão dos próprios erros",
        why: "Transformar derrotas recentes em momentos reutilizáveis de treino.",
        evidence: "Aguardando partidas analisadas.",
        severity: "medium",
        mode: practiceModes.personalReplay,
      },
      {
        rank: 3,
        title: "Conceitos estruturados",
        why: "Usar aulas para reparar ideias por trás de erros repetidos.",
        evidence: "Aguardando skillMap.",
        severity: "medium",
        mode: practiceModes.academy,
      },
    ],
    planStatus: {
      status: "Demo ativo",
      duration: "4 semanas",
      currentWeek: "Semana 1",
      completion: 18,
      dailyMinutes: "30 min",
      nextReviewDate: "Após a primeira atualização do perfil",
    },
    weeklyRoadmap: [
      {
        id: "demo-week-1",
        weekLabel: "Semana 1-2",
        focus: "Base de cálculo",
        goal: "Reduzir falhas em lances forçados.",
        tasks: ["15 padrões táticos/dia", "Revisar 2 derrotas recentes", "Escrever uma regra de decisão"],
        expectedOutcome: "Lances candidatos mais limpos antes de se comprometer.",
        status: "current",
      },
      {
        id: "demo-week-3",
        weekLabel: "Semana 3",
        focus: "Personal Replay",
        goal: "Converter erros em exercícios repetíveis.",
        tasks: ["Rejogar 8 momentos críticos", "Marcar cada tipo de erro", "Repetir momentos falhados"],
        expectedOutcome: "Reconhecimento mais rápido dos seus sinais de perigo.",
        status: "upcoming",
      },
      {
        id: "demo-week-4",
        weekLabel: "Semana 4",
        focus: "Semana de revisão",
        goal: "Medir se os primeiros bloqueadores melhoraram.",
        tasks: ["Analisar novas partidas rápidas", "Comparar mudanças no perfil", "Atualizar prioridades do plano"],
        expectedOutcome: "Um segundo ciclo de treino mais forte.",
        status: "upcoming",
      },
    ],
    todayPrescription: {
      task: "Analise 10 partidas recentes para liberar um plano real do coach",
      duration: "20-30 min",
      difficulty: "Fundação",
      reason: "O AI Coach precisa de evidências antes de prescrever trabalho preciso.",
      linkedWeakness: "Falta de evidências no perfil",
      expectedGain: "Um playerProfile ativo com fraquezas e recomendações reais.",
      mode: practiceModes.personalReplay,
      checklist: [
        "Abrir a Análise e selecionar uma amostra limpa de partidas",
        "Evitar partidas duplicadas já analisadas",
        "Aguardar a atualização do perfil",
        "Voltar aqui e comparar o plano gerado",
      ],
    },
    trainingBlocks: [
      {
        id: "demo-calculation",
        title: "Reparo de cálculo",
        category: "Tática",
        targetWeakness: "Golpes táticos perdidos",
        duration: "25 min",
        frequency: "4x/week",
        difficulty: "Adaptativo",
        modes: [practiceModes.patternForge],
        description: "Repetir motivos táticos até o primeiro lance candidato ficar mais afiado.",
        evidence: "Bloco demo, substituído após a geração do perfil.",
      },
      {
        id: "demo-endgame",
        title: "Conversão em finais",
        category: "Final",
        targetWeakness: "Conversão técnica",
        duration: "30 min",
        frequency: "3x/week",
        difficulty: "Intermediário",
        modes: [practiceModes.academy, practiceModes.personalReplay],
        description: "Estude um conceito e depois rejogue suas próprias falhas de conversão.",
        evidence: "Bloco demo, aguardando chessStats e erros recorrentes.",
      },
      {
        id: "demo-opening",
        title: "Limpeza de abertura",
        category: "Aberturas",
        targetWeakness: "Lacunas de plano após o lance 8",
        duration: "20 min",
        frequency: "2x/week",
        difficulty: "Confortável",
        modes: [practiceModes.academy, practiceModes.masterReplay],
        description: "Aprenda planos modelo em vez de memorizar linhas desconectadas.",
        evidence: "Bloco demo, aguardando evidência de repertório.",
      },
    ],
    progress: {
      weeklyCompletion: 42,
      currentStreak: 3,
      tasksCompleted: 7,
      focusConsistency: 68,
      estimatedPlanProgress: 18,
      habitDays: ["completed", "completed", "missed", "completed", "rest", "completed", "pending"],
    },
    confidence: {
      overall: 35,
      basedOnGames: 0,
      warning: "Plano demo. Analise partidas para melhorar as recomendações.",
    },
  };
}

function getCurrentFocus(profile, skillEntries, blockers) {
  const recommendations = profile?.recommendations || {};
  const currentFocus = recommendations?.currentFocus || {};
  const weakestSkill = skillEntries[0];
  const topBlocker = blockers[0];

  return {
    title:
      currentFocus.title ||
      currentFocus.summary ||
      weakestSkill?.title ||
      topBlocker?.title ||
      "Estabilizar decisões práticas",
    reason:
      currentFocus.whyItMatters ||
      currentFocus.summary ||
      topBlocker?.whatHappens ||
      weakestSkill?.description ||
      "Selecionado a partir dos sinais mais fracos disponíveis no perfil.",
    linkedWeakness: topBlocker?.title || weakestSkill?.title || "Prioridade atual do perfil",
    expectedBenefit:
      recommendations?.priorityAreas?.[0]?.expectedBenefit ||
      topBlocker?.howToImprove ||
      "Menos erros repetidos em posições de alto impacto.",
    confidence: profile?.profileConfidence?.overall || 65,
    source: profile?.meta?.hasMeaningfulProfile ? "playerProfile ativo" : "Provisório",
  };
}

function buildPriorityAreas(profile, skillEntries, blockers) {
  const recommendationAreas = asArray(profile?.recommendations?.priorityAreas);
  const base = recommendationAreas.length
    ? recommendationAreas
    : skillEntries.slice(0, 3).map((skill, index) => ({
        title: skill.title,
        reason: skill.description,
        linkedWeakness: skill.key,
        expectedBenefit: "Elevar esta habilidade para uma faixa prática mais confiável.",
        severity: index === 0 ? "high" : "medium",
      }));

  return base.slice(0, 3).map((area, index) => {
    const blocker = blockers[index] || blockers[0];
    const title = area.title || blocker?.title || `Prioridade ${index + 1}`;
    const text = `${title} ${area.reason || ""} ${blocker?.whatHappens || ""}`;

    return {
      rank: index + 1,
      title,
      why: area.reason || blocker?.whatHappens || "Esta área está limitando sua evolução prática.",
      evidence:
        blocker?.estimatedImpactLabel ||
        blocker?.severity ||
        area.linkedWeakness ||
        "Ligado às recomendações do perfil.",
      severity: area.severity || blocker?.severity || (index === 0 ? "high" : "medium"),
      mode: pickModeForText(text),
    };
  });
}

function buildWeeklyRoadmap(profile, blockers) {
  const blocks = asArray(profile?.trainingPlan?.weeklyBlocks);
  const fallbackBlocker = blockers[0];

  if (!blocks.length) {
    return [
      {
        id: "week-1",
        weekLabel: "Semana 1-2",
        focus: fallbackBlocker?.title || "Reparar erros de maior impacto",
        goal: fallbackBlocker?.howToImprove || "Reduzir o principal erro recorrente.",
        tasks: asArray(fallbackBlocker?.exercises).length
          ? fallbackBlocker.exercises
          : ["Revisar 3 momentos críticos", "Treinar 20 puzzles focados", "Escrever uma regra prática"],
        expectedOutcome: "O principal bloqueador aparece menos nas novas partidas.",
        status: "current",
      },
      {
        id: "week-3",
        weekLabel: "Semana 3",
        focus: "Automação de padrões",
        goal: "Tornar o padrão reparado mais fácil de reconhecer.",
        tasks: ["Repetir padrões errados", "Rejogar posições falhadas", "Estudar uma partida modelo"],
        expectedOutcome: "Reconhecimento mais rápido e menos decisões apressadas.",
        status: "upcoming",
      },
      {
        id: "week-4",
        weekLabel: "Semana 4",
        focus: "Semana de revisão",
        goal: "Atualizar o perfil e as prioridades.",
        tasks: ["Analisar novas partidas", "Comparar mudanças de versão do perfil", "Escolher o próximo foco"],
        expectedOutcome: "Um próximo ciclo mais limpo.",
        status: "upcoming",
      },
    ];
  }

  return blocks.map((block, index) => ({
    id: block.id || block.weekLabel || `week-${index + 1}`,
    weekLabel: block.weekLabel || `Semana ${index + 1}`,
    focus: block.theme || block.focus || block.title || "Bloco de treino",
    goal: block.objective || block.goal || "Melhorar a prioridade de treino ligada ao perfil.",
    tasks: asArray(block.tasks).length ? block.tasks : ["Revisar erros", "Completar exercícios direcionados"],
    expectedOutcome: block.successMetric || block.expectedOutcome || "Decisões práticas mais estáveis.",
    status: index === 0 ? "current" : "upcoming",
  }));
}

function buildTodayPrescription(profile, currentFocus, priorityAreas) {
  const prescription = profile?.trainingPlan?.todayPrescription;
  if (prescription) {
    return {
      task: prescription.task,
      duration: prescription.duration || "Flexível",
      difficulty: prescription.difficulty || "Focado",
      reason: prescription.reason || currentFocus.reason,
      linkedWeakness: prescription.linkedWeakness || currentFocus.linkedWeakness,
      expectedGain: prescription.expectedGain || currentFocus.expectedBenefit,
      mode: prescription.mode || priorityAreas[0]?.mode || practiceModes.personalReplay,
      checklist: asArray(prescription.checklist).length
        ? prescription.checklist
        : ["Abrir as posições ligadas", "Escrever lances candidatos", "Comparar com a linha recomendada"],
    };
  }

  const firstArea = priorityAreas[0];
  return {
    task: `Treinar ${firstArea?.title || currentFocus.title}`,
    duration: "25 min",
    difficulty: firstArea?.severity || "Focado",
    reason: currentFocus.reason,
    linkedWeakness: currentFocus.linkedWeakness,
    expectedGain: currentFocus.expectedBenefit,
    mode: firstArea?.mode || practiceModes.personalReplay,
    checklist: [
      "Revisar lentamente a primeira posição crítica",
      "Escrever 2-3 lances candidatos antes de escolher",
      "Comparar seu raciocínio com a melhor linha",
      "Criar uma regra para a próxima partida",
    ],
  };
}

function buildTrainingBlocks(profile, blockers, skillEntries, priorityAreas) {
  const routineTasks = asArray(profile?.trainingPlan?.dailyTasks);
  const blockerBlocks = blockers.slice(0, 4).map((blocker, index) => {
    const title = blocker.title || priorityAreas[index]?.title || skillEntries[index]?.title || "Bloco de treino";
    return {
      id: `blocker-${index}`,
      title: translateCommonLabel(titleize(title)),
      category: translateCommonLabel(titleize(priorityAreas[index]?.title || skillEntries[index]?.key || "Treino")),
      targetWeakness: blocker.title || priorityAreas[index]?.title || "Fraqueza do perfil",
      duration: routineTasks[index]?.duration || "25 min",
      frequency: routineTasks[index]?.frequency || (index === 0 ? "4x/semana" : "3x/semana"),
      difficulty: blocker.severity || priorityAreas[index]?.severity || "Adaptativo",
      modes: [priorityAreas[index]?.mode || pickModeForText(`${title} ${blocker.whatHappens}`)],
      description: blocker.howToImprove || blocker.whatHappens || "Trabalhe esta fraqueza do perfil com treino focado.",
      evidence: blocker.estimatedImpactLabel || blocker.severity || "Ligado a erros recorrentes.",
    };
  });

  if (blockerBlocks.length) return blockerBlocks;

  return priorityAreas.map((area, index) => ({
    id: `priority-${index}`,
    title: `Reparo: ${area.title}`,
    category: area.title,
    targetWeakness: area.linkedWeakness || area.title,
    duration: "25 min",
    frequency: index === 0 ? "4x/semana" : "2x/semana",
    difficulty: area.severity,
    modes: [area.mode],
    description: area.why,
    evidence: area.evidence,
  }));
}

function buildPlanStatus(profile, roadmap) {
  const durationWeeks = profile?.trainingPlan?.durationWeeks || roadmap.length || 4;
  const dailyTaskMinutes = asArray(profile?.trainingPlan?.dailyTasks)
    .map((task) => Number(String(task?.duration || "").match(/\d+/)?.[0] || task?.minutes || 0))
    .filter(Boolean);
  const dailyMinutes = dailyTaskMinutes.length
    ? `${Math.max(...dailyTaskMinutes)} min`
    : profile?.meta?.trainingPreferences?.dailyMinutes
      ? `${profile.meta.trainingPreferences.dailyMinutes} min`
      : "25-35 min";

  return {
    status: "Plano ativo",
    duration: `${durationWeeks} semanas`,
    currentWeek: roadmap[0]?.weekLabel || "Semana 1",
    completion: Math.min(88, Math.max(12, Math.round(100 / Math.max(durationWeeks, 1)))),
    dailyMinutes,
    nextReviewDate: "Após a próxima atualização do perfil",
  };
}

function buildProgress(profile, planStatus) {
  const completion = planStatus.completion || 0;
  return {
    weeklyCompletion: Math.max(35, completion + 18),
    currentStreak: profile?.meta?.totalGamesAnalyzed ? 5 : 2,
    tasksCompleted: Math.max(3, Math.round(completion / 7)),
    focusConsistency: Math.max(45, Math.min(92, (profile?.profileConfidence?.overall || 70) - 5)),
    estimatedPlanProgress: completion,
    habitDays: ["completed", "completed", "rest", "completed", "completed", "missed", "pending"],
  };
}

export function buildTrainingPlanViewModel(profile) {
  if (!profile?.meta?.hasMeaningfulProfile) {
    return buildFallbackPlan();
  }

  const blockers = asArray(profile?.growthBlockers);
  const skillEntries = getSkillEntries(profile?.skillMap);
  const currentFocus = getCurrentFocus(profile, skillEntries, blockers);
  const priorityAreas = buildPriorityAreas(profile, skillEntries, blockers);
  const weeklyRoadmap = buildWeeklyRoadmap(profile, blockers);
  const todayPrescription = buildTodayPrescription(profile, currentFocus, priorityAreas);
  const trainingBlocks = buildTrainingBlocks(profile, blockers, skillEntries, priorityAreas);
  const planStatus = buildPlanStatus(profile, weeklyRoadmap);

  return {
    isFallback: false,
    sourceLabel: "playerProfile ativo",
    growthBlockers: blockers.slice(0, 3),
    currentFocus,
    phase: {
      name: blockers.length ? "Reparo" : "Fundação",
      description: blockers.length
        ? "Atacar os padrões recorrentes que estão limitando sua evolução de rating."
        : "Construir hábitos de treino estáveis enquanto o perfil reúne mais evidências.",
    },
    priorityAreas,
    planStatus,
    weeklyRoadmap,
    todayPrescription,
    trainingBlocks,
    progress: buildProgress(profile, planStatus),
    confidence: profile.profileConfidence || {
      overall: 0,
      basedOnGames: profile?.meta?.totalGamesAnalyzed || 0,
      warning: "",
    },
  };
}
