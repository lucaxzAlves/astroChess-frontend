const TECHNICAL_PATTERNS = [
  /Cast to ObjectId/i,
  /Validation failed/i,
  /Path `?[\w.]+`?/i,
  /E11000/i,
  /Mongo/i,
  /Mongoose/i,
  /SyntaxError/i,
  /Unexpected token/i,
  /JSON/i,
  /Cannot read properties/i,
  /undefined/i,
  /null/i,
  /localhost:\d+/i,
  /http:\/\/localhost/i,
  /stack/i,
  /at\s+\w+/i,
  /config\.[\w.]+/i,
  /must be (an|a|valid|non-empty|positive)/i,
  /is required/i,
  /parameter is required/i,
];

const MESSAGE_RULES = [
  {
    pattern: /unauthorized|not authorized|token|jwt|sign in/i,
    message: "Sua sessão expirou. Entre novamente para continuar.",
  },
  {
    pattern: /forbidden|permission/i,
    message: "Você não tem permissão para fazer essa ação.",
  },
  {
    pattern: /already analyzed|already been analyzed|duplicate games/i,
    message: "Algumas partidas já foram analisadas. Atualize a seleção e tente novamente.",
  },
  {
    pattern: /active Pattern Forge cycle already exists/i,
    message: "Você já tem um ciclo ativo do Pattern Forge.",
  },
  {
    pattern: /No puzzles found|No puzzles matched/i,
    message: "Nenhum puzzle foi encontrado com esses filtros. Tente temas mais amplos.",
  },
  {
    pattern: /not found/i,
    message: "Não encontramos esse conteúdo. Atualize a página e tente novamente.",
  },
  {
    pattern: /network|failed to fetch|connect|backend|api is running|cors/i,
    message: "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
  },
  {
    pattern: /PGN/i,
    message: "Não foi possível ler essa partida. Tente outra partida ou importe o PGN novamente.",
  },
  {
    pattern: /validation|invalid|missing|required|must be|ObjectId|Cast/i,
    message: "Algumas informações estão incompletas ou inválidas. Revise os dados e tente novamente.",
  },
];

function normalizeErrorInput(error) {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message || "";
  if (typeof error === "object") {
    return error.message || error.error || error.details || "";
  }
  return String(error);
}

export function getUserFriendlyError(error, fallback = "Algo deu errado. Tente novamente em instantes.") {
  const rawMessage = normalizeErrorInput(error).trim();

  if (!rawMessage) return fallback;

  const mapped = MESSAGE_RULES.find((rule) => rule.pattern.test(rawMessage));
  if (mapped) return mapped.message;

  if (TECHNICAL_PATTERNS.some((pattern) => pattern.test(rawMessage))) {
    return fallback;
  }

  if (rawMessage.length > 180) {
    return fallback;
  }

  return rawMessage;
}

export function getAdminFriendlyError(error, fallback = "Não foi possível concluir a ação.") {
  return getUserFriendlyError(error, fallback);
}
