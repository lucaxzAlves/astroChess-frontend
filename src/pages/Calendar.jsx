import { useEffect, useMemo, useState } from "react";
import { getTournamentFilters, getTournaments, refreshTournaments } from "../services/tournamentsApi";
import { useLanguage } from "../contexts/LanguageContext.jsx";
import { getUserFriendlyError } from "../utils/userFriendlyErrors";

const fallbackTournamentFilters = {
  regions: ["All regions", "SP", "RJ", "MG", "PR", "RS", "SC", "BA", "GO", "DF", "Online"],
  timeControls: ["All", "Classical", "Rapid", "Blitz", "Bullet"],
  recommendations: ["All", "Best", "Highly recommended", "Good", "Low priority"],
};

const MAX_TOURNAMENTS_PER_DAY = 3;

const trainingDays = [
  { day: 1, status: "Concluído", type: "Cálculo", duration: "35 min", difficulty: "Médio", reason: "Aquecimento de reconhecimento tático." },
  { day: 2, status: "Concluído", type: "Finais", duration: "40 min", difficulty: "Difícil", reason: "A técnica de finais precisa de repetição direcionada." },
  { day: 3, status: "Perdido", type: "Revisão de abertura", duration: "25 min", difficulty: "Fácil", reason: "Corrigir lacunas comuns de ordem de lances." },
  { day: 4, status: "Concluído", type: "Análise de partidas", duration: "45 min", difficulty: "Médio", reason: "Revisar erros recentes de conversão." },
  { day: 5, status: "Descanso", type: "Descanso", duration: "0 min", difficulty: "Fácil", reason: "Dia de recuperação planejado." },
  { day: 6, status: "Concluído", type: "Disciplina no blitz", duration: "30 min", difficulty: "Médio", reason: "Praticar decisões mais rápidas com lances candidatos." },
  { day: 7, status: "Concluído", type: "Cálculo", duration: "30 min", difficulty: "Médio", reason: "Manter a visão tática consistente." },
  { day: 8, status: "Concluído", type: "Finais", duration: "45 min", difficulty: "Difícil", reason: "Finais de torre continuam sendo prioridade." },
  { day: 9, status: "Perdido", type: "Revisão de abertura", duration: "25 min", difficulty: "Fácil", reason: "Falhas de preparação levam a meios-jogos difíceis." },
  { day: 10, status: "Concluído", type: "Análise de partidas", duration: "50 min", difficulty: "Médio", reason: "Encontrar erros recorrentes de decisão." },
  { day: 11, status: "Concluído", type: "Disciplina no blitz", duration: "30 min", difficulty: "Médio", reason: "Gestão do tempo é uma estatística fraca." },
  { day: 12, status: "Descanso", type: "Descanso", duration: "0 min", difficulty: "Fácil", reason: "Recuperação antes de um bloco mais pesado." },
  { day: 13, status: "Concluído", type: "Finais", duration: "40 min", difficulty: "Difícil", reason: "Finais foram recomendados porque a análise mostrou baixa performance nessa fase." },
  { day: 14, status: "Concluído", type: "Cálculo", duration: "35 min", difficulty: "Médio", reason: "Melhorar a confiança em linhas forçadas." },
  { day: 15, status: "Concluído", type: "Revisão de abertura", duration: "30 min", difficulty: "Fácil", reason: "Melhorar a clareza nos 10 primeiros lances." },
  { day: 16, status: "Perdido", type: "Análise de partidas", duration: "45 min", difficulty: "Médio", reason: "Revisar derrotas recentes em busca de padrões." },
  { day: 17, status: "Concluído", type: "Disciplina no blitz", duration: "30 min", difficulty: "Médio", reason: "Reduzir erros sob pressão do relógio." },
  { day: 18, status: "Concluído", type: "Finais", duration: "45 min", difficulty: "Difícil", reason: "Converter finais de torre ganhos com mais limpeza." },
  { day: 19, status: "Recomendado", type: "Cálculo", duration: "35 min", difficulty: "Médio", reason: "Hoje é um bom dia para manutenção tática." },
  { day: 20, status: "Descanso", type: "Descanso", duration: "0 min", difficulty: "Fácil", reason: "Evitar desgaste e consolidar o trabalho." },
  { day: 21, status: "Recomendado", type: "Revisão de abertura", duration: "30 min", difficulty: "Fácil", reason: "Revisão de abertura é uma das suas áreas de foco." },
  { day: 22, status: "Recomendado", type: "Análise de partidas", duration: "45 min", difficulty: "Médio", reason: "Analisar partidas antes do próximo bloco de torneios." },
  { day: 23, status: "Recomendado", type: "Disciplina no blitz", duration: "30 min", difficulty: "Médio", reason: "Gestão do tempo precisa de prática repetida." },
  { day: 24, status: "Recomendado", type: "Finais", duration: "45 min", difficulty: "Difícil", reason: "Finais continuam sendo uma fraqueza de alto impacto." },
  { day: 25, status: "Descanso", type: "Descanso", duration: "0 min", difficulty: "Fácil", reason: "Dia de recuperação." },
  { day: 26, status: "Recomendado", type: "Cálculo", duration: "35 min", difficulty: "Médio", reason: "Preparar a visão tática antes das partidas de torneio." },
  { day: 27, status: "Recomendado", type: "Revisão de abertura", duration: "30 min", difficulty: "Fácil", reason: "Atualizar estruturas comuns." },
  { day: 28, status: "Recomendado", type: "Análise de partidas", duration: "45 min", difficulty: "Médio", reason: "Transformar erros recentes em sinais de treino." },
  { day: 29, status: "Recomendado", type: "Disciplina no blitz", duration: "30 min", difficulty: "Médio", reason: "Praticar o uso intencional do tempo." },
  { day: 30, status: "Recomendado", type: "Finais", duration: "45 min", difficulty: "Difícil", reason: "Fechar o mês com um bloco técnico." },
];

const trainingSummary = [
  { label: "Sequência atual", value: "6 dias" },
  { label: "Dias treinados", value: "18/30" },
  { label: "Horas de treino", value: "24h" },
  { label: "Taxa de conclusão", value: "72%" },
];

const weaknessFocus = ["Gestão do tempo", "Finais", "Revisão de abertura"];

function Card({ children, className = "" }) {
  return (
    <div
      className={`astro-card transition-all duration-200 ${className}`}
    >
      {children}
    </div>
  );
}

function SelectFilter({ label, value, onChange, options }) {
  return (
    <label className="grid gap-2 text-sm text-slate-400">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl border border-white/10 bg-slate-950/80 px-3 py-3 text-sm text-slate-200 outline-none transition duration-200 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/10"
      >
        {options.map((option) => (
          <option key={option}>{formatFilterOption(option)}</option>
        ))}
      </select>
    </label>
  );
}

function formatFilterOption(option) {
  const map = {
    "All regions": "Todas as regiões",
    All: "Todos",
    Classical: "Clássico",
    Rapid: "Rápido",
    Blitz: "Blitz",
    Bullet: "Bullet",
    Best: "Melhor opção",
    "Highly recommended": "Muito recomendado",
    Good: "Bom",
    "Low priority": "Baixa prioridade",
  };

  return map[option] || option;
}

function formatRecommendation(level) {
  return formatFilterOption(level || "Good");
}

function formatTournamentStatus(status) {
  const value = String(status || "unknown").toLowerCase();
  const map = {
    not_started: "Não iniciado",
    playing: "Em andamento",
    ongoing: "Em andamento",
    finished: "Finalizado",
    canceled: "Cancelado",
    cancelled: "Cancelado",
    unknown: "Desconhecido",
  };

  return map[value] || status || "Desconhecido";
}

function recommendationClasses(level) {
  const styles = {
    Best: "border-purple-400/30 bg-slate-950/55 text-purple-100 shadow-[inset_2px_0_0_rgba(168,85,247,0.55)]",
    "Highly recommended": "border-emerald-400/25 bg-slate-950/55 text-emerald-100 shadow-[inset_2px_0_0_rgba(52,211,153,0.45)]",
    Good: "border-sky-400/22 bg-slate-950/55 text-sky-100 shadow-[inset_2px_0_0_rgba(56,189,248,0.42)]",
    "Low priority": "border-slate-500/20 bg-slate-950/50 text-slate-300 shadow-[inset_2px_0_0_rgba(148,163,184,0.32)]",
  };

  return styles[level] || styles.Good;
}

function statusClasses(status) {
  const styles = {
    Concluído: "border-purple-500/35 bg-purple-500/15 text-purple-100",
    Recomendado: "border-emerald-400/50 bg-emerald-500/10 text-emerald-200 shadow-[0_0_18px_rgba(52,211,153,0.2)]",
    Perdido: "border-rose-500/30 bg-rose-500/10 text-rose-200",
    Descanso: "border-slate-500/20 bg-slate-500/10 text-slate-400",
  };

  return styles[status];
}

function monthDays() {
  return Array.from({ length: 30 }, (_, index) => index + 1);
}

function normalizeTimeControl(value) {
  const map = {
    rapid: "Rápido",
    blitz: "Blitz",
    classical: "Clássico",
    bullet: "Bullet",
    mixed: "Misto",
    unknown: "Desconhecido",
  };

  if (!value) return "N/A";
  const lower = String(value).toLowerCase();
  return map[lower] || String(value);
}

function recommendationFromSeed(seed) {
  const levels = [
    { level: "Highly recommended", score: 86 },
    { level: "Good", score: 74 },
    { level: "Low priority", score: 58 },
  ];

  if (seed % 7 === 0) {
    return {
      recommendationLevel: "Best",
      recommendationScore: 93,
      reasons: [
        "Boa oportunidade de rating",
        "Campo forte, mas jogável",
        "Combina com seus objetivos atuais de treino",
      ],
      notes: "Excelente encaixe para seu ciclo atual de evolução.",
    };
  }

  const pick = levels[seed % levels.length];
  const reasonsMap = {
    "Highly recommended": ["Alto valor de treino", "Boa estrutura de torneio"],
    Good: ["Campo jogável", "Volume útil de prática"],
    "Low priority": ["Impacto atual menor", "Há opções melhores neste mês"],
  };

  return {
    recommendationLevel: pick.level,
    recommendationScore: pick.score,
    reasons: reasonsMap[pick.level],
    notes: "Recomendação provisória enquanto a pontuação completa não está disponível.",
  };
}

function parseTournamentDate(dateLike) {
  if (!dateLike) return null;
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function isSameDay(dateA, dateB) {
  if (!dateA || !dateB) return false;
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

function isSameMonth(dateA, dateB) {
  if (!dateA || !dateB) return false;
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth()
  );
}

function formatTournamentDate(dateLike) {
  const date = dateLike instanceof Date ? dateLike : parseTournamentDate(dateLike);
  if (!date) return "Data indisponível";
  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatDateForApi(date) {
  return date.toISOString().slice(0, 10);
}

function formatMonthLabel(dateLike) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(dateLike);
}

function buildCalendarDays(currentMonth) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];

  for (let i = 0; i < firstWeekday; i += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }

  const trailing = (7 - (cells.length % 7)) % 7;
  for (let i = 0; i < trailing; i += 1) {
    cells.push(null);
  }

  return cells;
}

function normalizeTournament(apiTournament, index) {
  const id = apiTournament?.id || apiTournament?._id || `tournament-${index}`;
  const seed = String(id)
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);

  const rec = recommendationFromSeed(seed + index);
  const rawStartDate =
    apiTournament?.startDate ||
    apiTournament?.startsAt ||
    apiTournament?.start_at ||
    apiTournament?.date ||
    null;
  const rawEndDate =
    apiTournament?.endDate ||
    apiTournament?.endsAt ||
    apiTournament?.end_at ||
    null;
  const parsedStartDate = parseTournamentDate(rawStartDate);
  const parsedEndDate = parseTournamentDate(rawEndDate);

  const locationObject =
    apiTournament?.location && typeof apiTournament.location === "object"
      ? apiTournament.location
      : {};
  const state = locationObject?.state || apiTournament?.state || apiTournament?.uf || "N/A";
  const city = locationObject?.city || apiTournament?.city || "N/A";
  const locationRaw =
    locationObject?.raw ||
    locationObject?.venue ||
    (typeof apiTournament?.location === "string" ? apiTournament.location : "");
  const dateConfidence = apiTournament?.dateConfidence || "unknown";
  const dateText = apiTournament?.dateText || apiTournament?.rawDateText || "";

  return {
    id,
    name: apiTournament?.title || apiTournament?.name || "Torneio sem título",
    title: apiTournament?.title || apiTournament?.name || "Torneio sem título",
    source: apiTournament?.source || "N/A",
    sourceUrl: apiTournament?.sourceUrl || apiTournament?.url || "",
    date: formatTournamentDate(parsedStartDate),
    startDate: rawStartDate,
    endDate: rawEndDate,
    parsedStartDate,
    parsedEndDate,
    dateText,
    dateConfidence,
    parseWarnings: Array.isArray(apiTournament?.parseWarnings) ? apiTournament.parseWarnings : [],
    city,
    state,
    location:
      locationRaw ||
      `${city !== "N/A" ? city : ""}${state !== "N/A" ? `, ${state}` : ""}`.trim() ||
      "N/A",
    timeControl: normalizeTimeControl(apiTournament?.timeControl),
    averageRating: apiTournament?.averageRating || "N/A",
    ratingCategory: apiTournament?.ratingCategory || "Aberto",
    ratingType: apiTournament?.ratingType || "N/A",
    organizer: apiTournament?.organizer || "N/A",
    arbiter: apiTournament?.arbiter || "N/A",
    federation: apiTournament?.federation || "N/A",
    playersCount: apiTournament?.playersCount ?? "N/A",
    rounds: apiTournament?.rounds ?? "N/A",
    system: apiTournament?.system || "N/A",
    entryFee: apiTournament?.entryFee || "N/A",
    status: apiTournament?.status || "unknown",
    detailsScraped: Boolean(apiTournament?.detailsScraped),
    cacheExpiresAt: apiTournament?.cacheExpiresAt || null,
    ...rec,
  };
}

function parseTournamentsResponse(payload) {
  if (Array.isArray(payload)) {
    return { items: payload, hasMore: false, total: payload.length, cache: null };
  }

  const items =
    payload?.data?.items ||
    payload?.items ||
    payload?.tournaments ||
    payload?.results ||
    [];

  const pagination = payload?.data?.pagination || payload?.pagination || {};
  const totalPages = Number(pagination?.totalPages || payload?.totalPages || payload?.pages || 0);
  const currentPage = Number(pagination?.page || payload?.page || 1);
  const currentLimit = Number(pagination?.limit || payload?.limit || items.length || 0);
  const total = Number(pagination?.total || payload?.total || payload?.count || items.length || 0);
  const hasMore =
    typeof payload?.hasMore === "boolean"
      ? payload.hasMore
      : totalPages > 0
        ? currentPage < totalPages
        : total > 0 && currentLimit > 0
          ? currentPage * currentLimit < total
          : false;

  return {
    items: Array.isArray(items) ? items : [],
    hasMore,
    total,
    cache: payload?.data?.cache || null,
  };
}

function parseMetaFilters(payload) {
  const states =
    payload?.states || payload?.ufs || payload?.regions || payload?.stateOptions || [];
  const timeControls =
    payload?.timeControls || payload?.time_controls || payload?.controls || [];

  return {
    states: Array.isArray(states) ? states.map(String) : [],
    timeControls: Array.isArray(timeControls)
      ? timeControls.map((value) => normalizeTimeControl(value))
      : [],
  };
}

function tournamentStatusClasses(status) {
  const value = String(status || "unknown").toLowerCase();
  if (value === "upcoming" || value === "not_started") {
    return "border-emerald-400/40 bg-emerald-500/15 text-emerald-200";
  }
  if (value === "finished") {
    return "border-slate-500/25 bg-slate-500/10 text-slate-300";
  }
  if (value === "playing" || value === "ongoing") {
    return "border-cyan-400/35 bg-cyan-500/10 text-cyan-200";
  }
  if (value === "canceled" || value === "cancelled") {
    return "border-rose-500/35 bg-rose-500/15 text-rose-200";
  }
  return "border-purple-500/25 bg-purple-500/10 text-purple-200";
}

function dateConfidenceClasses(confidence) {
  const value = String(confidence || "unknown").toLowerCase();

  if (value === "high") return "border-emerald-400/35 bg-emerald-500/10 text-emerald-200";
  if (value === "medium") return "border-sky-400/30 bg-sky-500/10 text-sky-200";
  if (value === "low") return "border-amber-400/35 bg-amber-500/10 text-amber-200";
  return "border-rose-400/25 bg-rose-500/10 text-rose-200";
}

function formatDateConfidence(confidence) {
  const value = String(confidence || "unknown").toLowerCase();

  if (value === "high") return "Data confirmada";
  if (value === "high") return "Data confirmada";
  if (value === "medium") return "Data provável";
  if (value === "low") return "Data inferida";
  return "Data não confirmada";
}

function getSyncMetrics(payload) {
  if (payload?.data?.pagination || payload?.data?.cache) {
    return {
      totalNormalized: payload?.data?.pagination?.total ?? payload?.data?.items?.length ?? 0,
      refreshed: payload?.data?.cache?.refreshed,
      usedCache: payload?.data?.cache?.usedCache,
      lastRefreshAt: payload?.data?.cache?.lastRefreshAt,
    };
  }

  return payload?.metrics || payload?.data?.metrics || payload || {};
}

function numberOrNull(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatManualUpdateTime(date) {
  if (!date) return "";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function buildSyncSummary(metrics, t) {
  const safeMetrics = metrics && typeof metrics === "object" ? metrics : {};
  const created = numberOrNull(safeMetrics.created);
  const updated = numberOrNull(safeMetrics.updated);
  const totalNormalized = numberOrNull(safeMetrics.totalNormalized ?? safeMetrics.total);

  if (created !== null || updated !== null) {
    if (t) {
      return t("calendar.createdUpdatedTournaments", "{created} criados, {updated} atualizados.", {
        created: created || 0,
        updated: updated || 0,
      });
    }

    return `${created || 0} criados, ${updated || 0} atualizados.`;
  }

  if (totalNormalized !== null) {
    if (t) {
      return t("calendar.tournamentsProcessed", "{count} torneios processados.", {
        count: totalNormalized,
      });
    }

    return `${totalNormalized} torneios processados.`;
  }

  return t
    ? t("calendar.updateSuccessMessage", "Banco de torneios atualizado com sucesso.")
    : "Banco de torneios atualizado com sucesso.";
}

function buildSyncSources(metrics) {
  const safeMetrics = metrics && typeof metrics === "object" ? metrics : {};
  const sources = [];
  const cbxFound = numberOrNull(safeMetrics.cbxFound);
  const chessResultsFound = numberOrNull(safeMetrics.chessResultsFound);

  if (cbxFound !== null) sources.push(`CBX: ${cbxFound}`);
  if (chessResultsFound !== null) sources.push(`Chess-Results: ${chessResultsFound}`);
  if (safeMetrics.refreshed === true) sources.push("Atualização sob demanda");
  if (safeMetrics.usedCache === true) sources.push("Cache");

  return sources.join(" · ");
}

function TournamentTab() {
  const { t } = useLanguage();
  const [region, setRegion] = useState("All regions");
  const [search, setSearch] = useState("");
  const [timeControl, setTimeControl] = useState("All");
  const [recommendation, setRecommendation] = useState("All");
  const [upcomingOnly, setUpcomingOnly] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(100);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const [filters, setFilters] = useState(fallbackTournamentFilters);
  const [tournaments, setTournaments] = useState([]);
  const [loadingTournaments, setLoadingTournaments] = useState(false);
  const [tournamentsError, setTournamentsError] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [tournamentTotal, setTournamentTotal] = useState(0);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [filterReloadKey, setFilterReloadKey] = useState(0);
  const [tournamentReloadKey, setTournamentReloadKey] = useState(0);
  const [refreshingTournaments, setRefreshingTournaments] = useState(false);
  const [refreshStatus, setRefreshStatus] = useState(null);
  const [refreshMessage, setRefreshMessage] = useState("");
  const [lastManualUpdate, setLastManualUpdate] = useState(null);
  const [lastRefreshMetrics, setLastRefreshMetrics] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadFilters() {
      try {
        const payload = await getTournamentFilters();
        if (!mounted) return;

        const parsed = parseMetaFilters(payload);

        setFilters({
          regions:
            parsed.states.length > 0
              ? ["All regions", ...parsed.states]
              : fallbackTournamentFilters.regions,
          timeControls:
            parsed.timeControls.length > 0
              ? ["All", ...parsed.timeControls]
              : fallbackTournamentFilters.timeControls,
          recommendations: fallbackTournamentFilters.recommendations,
        });
      } catch {
        if (!mounted) return;
        setFilters(fallbackTournamentFilters);
      }
    }

    loadFilters();

    return () => {
      mounted = false;
    };
  }, [filterReloadKey]);

  useEffect(() => {
    setPage(1);
  }, [region, search, timeControl, upcomingOnly]);

  const buildTournamentQuery = (extra = {}) => {
    return {
      page,
      limit,
      state: region === "All regions" ? undefined : region,
      timeControl: timeControl === "All" ? undefined : String(timeControl).toLowerCase(),
      search: search.trim() || undefined,
      ...extra,
    };
  };

  useEffect(() => {
    let mounted = true;

    async function loadTournaments() {
      setLoadingTournaments(true);
      setTournamentsError("");

      try {
        const payload = await getTournaments(buildTournamentQuery());

        if (!mounted) return;

        const parsed = parseTournamentsResponse(payload);
        const normalized = parsed.items.map(normalizeTournament);

        setTournaments(normalized);
        setHasMore(parsed.hasMore);
        setTournamentTotal(parsed.total);
        if (parsed.cache?.lastRefreshAt) {
          setLastManualUpdate(new Date(parsed.cache.lastRefreshAt));
        }

        if (normalized.length > 0) {
          setSelectedTournament((current) => {
            if (current && normalized.some((t) => t.id === current.id)) {
              return normalized.find((t) => t.id === current.id) || normalized[0];
            }
            return normalized[0];
          });
        } else {
          setSelectedTournament(null);
        }
      } catch (error) {
        if (!mounted) return;
        setTournaments([]);
        setSelectedTournament(null);
        setHasMore(false);
        setTournamentTotal(0);
        setTournamentsError(
          getUserFriendlyError(error, "Não foi possível carregar os torneios agora.")
        );
      } finally {
        if (mounted) setLoadingTournaments(false);
      }
    }

    loadTournaments();

    return () => {
      mounted = false;
    };
  }, [region, search, timeControl, upcomingOnly, page, limit, tournamentReloadKey]);

  const filteredTournaments = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return tournaments.filter((tournament) => {
      if (upcomingOnly) {
        const relevantDate = tournament.parsedEndDate || tournament.parsedStartDate;
        if (relevantDate && relevantDate < today) return false;
      }

      if (recommendation === "All") return true;
      return tournament.recommendationLevel === recommendation;
    });
  }, [tournaments, recommendation, upcomingOnly]);

  const monthTournaments = useMemo(() => {
    return filteredTournaments
      .filter((tournament) => isSameMonth(tournament.parsedStartDate, currentMonth))
      .sort((a, b) => {
        const aTs = a.parsedStartDate ? a.parsedStartDate.getTime() : Number.MAX_SAFE_INTEGER;
        const bTs = b.parsedStartDate ? b.parsedStartDate.getTime() : Number.MAX_SAFE_INTEGER;
        return aTs - bTs;
      });
  }, [filteredTournaments, currentMonth]);

  const outOfMonthTournaments = useMemo(() => {
    return filteredTournaments
      .filter((tournament) => {
        return tournament.parsedStartDate && !isSameMonth(tournament.parsedStartDate, currentMonth);
      })
      .sort((a, b) => {
        const aTs = a.parsedStartDate ? a.parsedStartDate.getTime() : Number.MAX_SAFE_INTEGER;
        const bTs = b.parsedStartDate ? b.parsedStartDate.getTime() : Number.MAX_SAFE_INTEGER;
        return aTs - bTs;
      });
  }, [filteredTournaments, currentMonth]);

  const bestTournament = useMemo(() => {
    const recommendationPool = monthTournaments.length > 0 ? monthTournaments : outOfMonthTournaments;
    if (recommendationPool.length === 0) return null;
    return [...recommendationPool].sort(
      (a, b) => b.recommendationScore - a.recommendationScore
    )[0];
  }, [monthTournaments, outOfMonthTournaments]);

  const tournamentsByDay = useMemo(() => {
    return monthTournaments.reduce((days, tournament) => {
      const day = tournament.parsedStartDate?.getDate?.();
      if (!day) return days;
      return { ...days, [day]: [...(days[day] || []), tournament] };
    }, {});
  }, [monthTournaments]);

  const unscheduledTournaments = useMemo(() => {
    return filteredTournaments.filter((tournament) => {
      return !tournament.parsedStartDate;
    });
  }, [filteredTournaments]);

  const calendarDays = useMemo(() => buildCalendarDays(currentMonth), [currentMonth]);
  const monthLabel = useMemo(() => formatMonthLabel(currentMonth), [currentMonth]);
  const goPrevMonth = () =>
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const goNextMonth = () =>
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  const goToday = () => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
  };
  const handleRefreshTournaments = async () => {
    setRefreshingTournaments(true);
    setRefreshStatus(null);
    setRefreshMessage("");

    try {
      const payload = await refreshTournaments(buildTournamentQuery({ forceRefresh: true }));
      const metrics = getSyncMetrics(payload);

      setLastRefreshMetrics(metrics);
      setLastManualUpdate(new Date());
      setRefreshStatus("success");
      setRefreshMessage(buildSyncSummary(metrics, t));
      setFilterReloadKey((key) => key + 1);
      setTournamentReloadKey((key) => key + 1);
    } catch (error) {
      setRefreshStatus("error");
      setRefreshMessage(
        getUserFriendlyError(
          error,
          t("calendar.updateError", "Não foi possível atualizar os torneios agora."),
        )
      );
    } finally {
      setRefreshingTournaments(false);
    }
  };
  const syncSources = buildSyncSources(lastRefreshMetrics);
  const refreshButtonLabel = refreshingTournaments
    ? t("calendar.updatingTournaments", "Atualizando busca...")
    : refreshStatus === "success"
      ? t("calendar.tournamentsUpdated", "Busca atualizada")
      : t("calendar.updateTournaments", "Atualizar busca");

  return (
    <div className="grid gap-6">
      <Card className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-purple-300">
              {t("calendar.tournamentDatabase", "Banco de torneios")}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-white">
              {t("calendar.syncLatestTournaments", "Buscar torneios recentes")}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              {t(
                "calendar.syncNote",
                "O AstroChess verifica o cache local primeiro. Se os dados estiverem antigos, atualiza apenas os torneios que combinam com seus filtros atuais."
              )}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:items-end">
            <button
              type="button"
              onClick={handleRefreshTournaments}
              disabled={refreshingTournaments}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-purple-500/40 bg-purple-500/10 px-4 py-2.5 text-sm font-semibold text-purple-100 transition duration-200 hover:border-purple-400/70 hover:bg-purple-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {refreshingTournaments && (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-purple-200/30 border-t-purple-100" />
              )}
              {refreshButtonLabel}
            </button>
            {lastManualUpdate && (
              <p className="text-xs text-slate-500">
                {t("calendar.lastManualUpdate", "Última atualização manual")}: {formatManualUpdateTime(lastManualUpdate)}
              </p>
            )}
          </div>
        </div>

        {(refreshingTournaments || refreshMessage) && (
          <div
            className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
              refreshStatus === "error"
                ? "border-rose-500/25 bg-rose-500/10 text-rose-200"
                : refreshStatus === "success"
                  ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-100"
                  : "border-purple-500/25 bg-purple-500/10 text-purple-100"
            }`}
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span>
                {refreshingTournaments
                  ? t("calendar.updatingDatabase", "Atualizando busca de torneios...")
                  : refreshMessage || t("calendar.updateSuccessMessage", "Banco de torneios atualizado com sucesso.")}
              </span>
              {refreshStatus === "success" && syncSources && (
                <span className="text-xs text-slate-400">
                  {t("calendar.sources", "Fontes")}: {syncSources}
                </span>
              )}
            </div>
          </div>
        )}
      </Card>

      <Card className="p-4">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]">
          <SelectFilter label="Região" value={region} onChange={setRegion} options={filters.regions} />
          <label className="grid gap-2 text-sm text-slate-400">
            Busca
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar torneios..."
              className="rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition duration-200 placeholder:text-slate-600 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/10"
            />
          </label>
          <SelectFilter label="Ritmo" value={timeControl} onChange={setTimeControl} options={filters.timeControls} />
          <SelectFilter label="Recomendação" value={recommendation} onChange={setRecommendation} options={filters.recommendations} />
          <label className="flex items-end gap-3 rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={upcomingOnly}
              onChange={(event) => setUpcomingOnly(event.target.checked)}
              className="h-4 w-4 accent-purple-500"
            />
            Apenas futuros
          </label>
        </div>
      </Card>

      <Card className="overflow-hidden border-purple-500/30 bg-gradient-to-br from-purple-500/15 via-white/[0.05] to-slate-950/60 p-6 shadow-2xl shadow-purple-950/20">
        {bestTournament ? (
          <>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-purple-300">
                  {monthTournaments.length > 0 ? "Melhor torneio do mês" : "Melhor torneio encontrado"}
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-white">{bestTournament.name}</h2>
                <p className="mt-2 text-sm text-slate-400">
                  {bestTournament.date} · {bestTournament.city}, {bestTournament.state} · {bestTournament.timeControl}
                </p>
              </div>
              <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 px-5 py-4 text-center">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Pontuação</p>
                <p className="mt-1 text-3xl font-semibold text-white">{bestTournament.recommendationScore}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              {[
                ["Recomendação", formatRecommendation(bestTournament.recommendationLevel)],
                ["Rating médio", bestTournament.averageRating],
                ["Categoria de rating", bestTournament.ratingCategory],
                ["Inscrição", bestTournament.entryFee],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-white/10 bg-slate-950/45 p-4">
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="mt-1 font-medium text-slate-100">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {bestTournament.reasons.map((reason) => (
                <span key={reason} className="rounded-full border border-purple-500/25 bg-purple-500/10 px-3 py-1.5 text-sm text-purple-200">
                  {reason}
                </span>
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-white/10 bg-slate-950/45 p-6 text-sm text-slate-300">
            Nenhum torneio disponível em {monthLabel} para recomendar agora.
          </div>
        )}
      </Card>

      {loadingTournaments && (
        <Card className="p-6 text-center text-sm text-slate-400">Carregando torneios...</Card>
      )}

      {tournamentsError && (
        <Card className="border-rose-500/25 bg-rose-500/10 p-6 text-sm text-rose-200">
          {tournamentsError}
        </Card>
      )}

      {!loadingTournaments && !tournamentsError && filteredTournaments.length === 0 && (
        <Card className="p-6 text-center text-sm text-slate-400">
          Nenhum torneio encontrado para estes filtros.
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{monthLabel}</h2>
            <p className="text-sm text-slate-500">
              {monthTournaments.length}
              {tournamentTotal > monthTournaments.length ? ` de ${tournamentTotal}` : ""} torneios
            </p>
          </div>
          <div className="mb-4 flex gap-2">
            <button
              type="button"
              onClick={goPrevMonth}
              className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-300"
            >
              Mês anterior
            </button>
            <button
              type="button"
              onClick={goToday}
              className="rounded-lg border border-purple-500/40 bg-purple-500/10 px-3 py-2 text-xs text-purple-200"
            >
              Hoje
            </button>
            <button
              type="button"
              onClick={goNextMonth}
              className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-300"
            >
              Próximo mês
            </button>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-7 gap-2 text-center text-xs text-slate-500">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                  <div key={day} className="py-2">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((dayDate, index) => {
                  const dayTournaments = (dayDate && tournamentsByDay[dayDate.getDate()]) || [];
                  const visibleDayTournaments = dayTournaments.slice(0, MAX_TOURNAMENTS_PER_DAY);
                  const hiddenDayCount = Math.max(0, dayTournaments.length - visibleDayTournaments.length);

                  return (
                    <div
                      key={`${dayDate ? dayDate.toISOString() : `empty-${index}`}`}
                      className="h-36 rounded-xl border border-white/10 bg-slate-950/35 p-2 text-left"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-slate-300">{dayDate ? dayDate.getDate() : ""}</p>
                        {dayTournaments.length > 0 && (
                          <span className="rounded-full border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-slate-400">
                            {dayTournaments.length}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 grid gap-1.5">
                        {visibleDayTournaments.map((tournament) => (
                          <button
                            key={tournament.id}
                            type="button"
                            onClick={() => setSelectedTournament(tournament)}
                            className={`truncate rounded-lg border px-2 py-1 text-left text-xs transition duration-200 hover:border-purple-400/35 hover:bg-purple-500/10 ${recommendationClasses(tournament.recommendationLevel)}`}
                            title={tournament.name}
                          >
                            {tournament.name}
                          </button>
                        ))}
                        {hiddenDayCount > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (dayTournaments[0]) setSelectedTournament(dayTournaments[0]);
                            }}
                            className="rounded-lg border border-white/10 bg-white/[0.025] px-2 py-1 text-left text-xs font-medium text-slate-400 transition hover:border-cyan-400/25 hover:bg-cyan-500/10 hover:text-cyan-100"
                          >
                            +{hiddenDayCount} mais na lista
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {unscheduledTournaments.length > 0 && (
            <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/35 p-4">
              <h3 className="text-sm font-semibold text-white">Torneios sem data confirmada</h3>
              <div className="mt-3 grid gap-2">
                {unscheduledTournaments.map((tournament) => (
                  <button
                    key={`unscheduled-${tournament.id}`}
                    type="button"
                    onClick={() => setSelectedTournament(tournament)}
                    className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-sm text-slate-200 transition hover:border-purple-500/40 hover:bg-purple-500/10"
                  >
                    {tournament.name} · {tournament.timeControl} · {tournament.state}
                  </button>
                ))}
              </div>
            </div>
          )}

          {monthTournaments.length === 0 && outOfMonthTournaments.length > 0 && (
            <div className="mt-5 rounded-xl border border-cyan-400/20 bg-cyan-500/5 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Torneios encontrados fora de {monthLabel}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    A busca encontrou torneios em outros meses. Use o botão "Ver mês" para navegar até a data do evento.
                  </p>
                </div>
                <span className="rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-100">
                  {outOfMonthTournaments.length} encontrados
                </span>
              </div>

              <div className="mt-3 grid max-h-72 gap-2 overflow-y-auto pr-1 [scrollbar-color:rgba(34,211,238,0.45)_rgba(15,23,42,0.35)] [scrollbar-width:thin]">
                {outOfMonthTournaments.map((tournament) => (
                  <div
                    key={`out-of-month-${tournament.id}`}
                    className="rounded-lg border border-white/10 bg-slate-950/45 px-3 py-2 text-sm text-slate-200 transition hover:border-cyan-400/35 hover:bg-cyan-500/10"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        onClick={() => setSelectedTournament(tournament)}
                        className="min-w-0 text-left"
                      >
                        <span className="block truncate font-medium">{tournament.name}</span>
                        <span className="mt-1 block text-xs text-slate-400">
                          {formatTournamentDate(tournament.parsedStartDate)} · {tournament.city}/{tournament.state} · {tournament.timeControl}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTournament(tournament);
                          if (tournament.parsedStartDate) {
                            setCurrentMonth(
                              new Date(
                                tournament.parsedStartDate.getFullYear(),
                                tournament.parsedStartDate.getMonth(),
                                1
                              )
                            );
                          }
                        }}
                        className="shrink-0 rounded-lg border border-cyan-400/25 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-500/15"
                      >
                        Ver mês
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {monthTournaments.length > 0 && (
            <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/35 p-4">
              <h3 className="text-sm font-semibold text-white">Torneios em {monthLabel}</h3>
              <div className="mt-3 grid gap-2">
                {monthTournaments.map((tournament) => (
                  <button
                    key={`month-list-${tournament.id}`}
                    type="button"
                    onClick={() => setSelectedTournament(tournament)}
                    className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-sm text-slate-200 transition hover:border-purple-500/40 hover:bg-purple-500/10"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium">{tournament.name}</span>
                      <div className="flex gap-2">
                        <span className={`rounded-full border px-2 py-0.5 text-xs ${recommendationClasses(tournament.recommendationLevel)}`}>
                          {formatRecommendation(tournament.recommendationLevel)}
                        </span>
                        <span className={`rounded-full border px-2 py-0.5 text-xs ${tournamentStatusClasses(tournament.status)}`}>
                          {formatTournamentStatus(tournament.status)}
                        </span>
                        <span className={`rounded-full border px-2 py-0.5 text-xs ${dateConfidenceClasses(tournament.dateConfidence)}`}>
                          {formatDateConfidence(tournament.dateConfidence)}
                        </span>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      {formatTournamentDate(tournament.parsedStartDate)} · {tournament.city}/{tournament.state} · {tournament.timeControl} · {tournament.ratingType} · {tournament.source}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-300 disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasMore}
              className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-300 disabled:opacity-40"
            >
              Próximo
            </button>
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-sm font-medium text-purple-300">Detalhes do torneio</p>
          {selectedTournament ? (
            <>
              <h2 className="mt-2 text-xl font-semibold text-white">{selectedTournament.name}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{selectedTournament.notes}</p>
              <div className="mt-5 grid gap-3 text-sm">
                {[
                  ["Fonte", selectedTournament.source],
                  ["Data de início", formatTournamentDate(selectedTournament.parsedStartDate)],
                  ["Data de fim", formatTournamentDate(selectedTournament.parsedEndDate)],
                  ["Confiança da data", formatDateConfidence(selectedTournament.dateConfidence)],
                  ["Texto original da data", selectedTournament.dateText || "N/A"],
                  ["Local", selectedTournament.location],
                  ["Estado", selectedTournament.state],
                  ["Cidade", selectedTournament.city],
                  ["Ritmo", selectedTournament.timeControl],
                  ["Tipo de rating", selectedTournament.ratingType],
                  ["Organizador", selectedTournament.organizer],
                  ["Árbitro", selectedTournament.arbiter],
                  ["Federação", selectedTournament.federation],
                  ["Jogadores", selectedTournament.playersCount],
                  ["Rodadas", selectedTournament.rounds],
                  ["Sistema", selectedTournament.system],
                  ["Status", formatTournamentStatus(selectedTournament.status)],
                  ["Detalhes extraídos", selectedTournament.detailsScraped ? "Sim" : "Não"],
                  ["Rating médio", selectedTournament.averageRating],
                  ["Categoria de rating", selectedTournament.ratingCategory],
                  ["Inscrição", selectedTournament.entryFee],
                  ["Nível", formatRecommendation(selectedTournament.recommendationLevel)],
                  ["Pontuação", selectedTournament.recommendationScore],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 rounded-xl bg-slate-950/45 px-4 py-3">
                    <span className="text-slate-500">{label}</span>
                    <span className="text-right font-medium text-slate-200">{value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 grid gap-2">
                {selectedTournament.reasons.map((reason) => (
                  <div key={reason} className="rounded-xl border border-purple-500/20 bg-purple-500/10 px-4 py-3 text-sm text-purple-100">
                    {reason}
                  </div>
                ))}
              </div>
              {selectedTournament.parseWarnings.length > 0 && (
                <div className="mt-5 rounded-xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                  <p className="font-semibold">Avisos sobre a data</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-amber-100/85">
                    {selectedTournament.parseWarnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button className="rounded-xl bg-purple-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-400" type="button">
                  Adicionar ao meu plano
                </button>
                {selectedTournament.sourceUrl ? (
                  <a
                    href={selectedTournament.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-sm font-semibold text-slate-200 transition hover:border-purple-500/40 hover:bg-purple-500/10"
                  >
                    Ver detalhes
                  </a>
                ) : (
                  <button className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-500" type="button" disabled>
                    Ver detalhes
                  </button>
                )}
              </div>
            </>
          ) : (
            <p className="mt-2 text-sm text-slate-400">Selecione um torneio para ver os detalhes.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
function TrainingTab() {
  const [selectedDay, setSelectedDay] = useState(trainingDays[18]);

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {trainingSummary.map((item) => (
          <Card key={item.label} className="p-5">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
            <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Plano de treino de abril</h2>
            <p className="text-sm text-slate-500">Mapa de consistência de 30 dias</p>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-7 gap-2 text-center text-xs text-slate-500">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                  <div key={day} className="py-2">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {trainingDays.map((day) => (
                  <button
                    key={day.day}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={`min-h-24 rounded-xl border p-2 text-left transition duration-200 hover:scale-[1.01] ${statusClasses(day.status)} ${
                      selectedDay.day === day.day ? "ring-2 ring-purple-400/70" : ""
                    }`}
                  >
                    <p className="text-sm font-semibold">{day.day}</p>
                    <p className="mt-2 truncate text-xs">{day.type}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-6">
          <Card className="p-6">
            <p className="text-sm font-medium text-purple-300">Dia selecionado</p>
            <h2 className="mt-2 text-xl font-semibold text-white">{selectedDay.day} de abril de 2026</h2>
            <div className="mt-5 grid gap-3 text-sm">
              {[
                ["Status", selectedDay.status],
                ["Treino", selectedDay.type],
                ["Duração", selectedDay.duration],
                ["Dificuldade", selectedDay.difficulty],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 rounded-xl bg-slate-950/45 px-4 py-3">
                  <span className="text-slate-500">{label}</span>
                  <span className="text-right font-medium text-slate-200">{value}</span>
                </div>
              ))}
            </div>
            <p className="mt-5 rounded-xl border border-purple-500/20 bg-purple-500/10 p-4 text-sm leading-6 text-purple-100">
              {selectedDay.reason}
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-white">Sequência de treino</h2>
            <div className="mt-5 flex gap-2">
              {trainingDays.slice(10, 24).map((day) => (
                <button
                  key={day.day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`h-8 w-8 rounded-lg border text-xs font-medium transition hover:scale-105 ${statusClasses(day.status)}`}
                >
                  {day.day}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-white">Treino baseado nas suas fraquezas</h2>
        <p className="mt-2 text-sm text-slate-400">
          O plano diário usa sinais da análise e prioriza as áreas com menor desempenho.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {weaknessFocus.map((focus) => (
            <div key={focus} className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-5">
              <p className="font-semibold text-white">{focus}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Agendado várias vezes neste mês para transformar uma fraqueza recorrente em hábito mensurável.
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default function Calendar() {
  const [activeTab, setActiveTab] = useState("Tournaments");

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/10 via-white/[0.04] to-transparent p-6">
        <p className="text-sm font-medium text-purple-300">Rotina de xadrez</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Calendário</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Encontre torneios, planeje seus treinos e mantenha sua rotina de xadrez viva.
        </p>

        <div className="mt-6 inline-flex gap-2 rounded-xl border border-white/10 bg-slate-950/60 p-1.5">
          {["Tournaments", "Training Plan"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition duration-200 ${
                activeTab === tab
                  ? "bg-purple-500 text-white shadow-lg shadow-purple-950/30"
                  : "text-slate-400 hover:bg-purple-500/10 hover:text-purple-300"
              }`}
            >
              {tab === "Tournaments" ? "Torneios" : "Plano de treino"}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "Tournaments" ? <TournamentTab /> : <TrainingTab />}
    </section>
  );
}
