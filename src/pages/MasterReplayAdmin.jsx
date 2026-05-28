import { useEffect, useMemo, useState } from "react";
import ReviewBoard from "../components/review/ReviewBoard";
import { useLanguage } from "../contexts/LanguageContext.jsx";
import { masterReplayApi } from "../services/masterReplayApi.js";
import "../styles/gameReview.css";

const emptyFen = "8/8/8/8/8/8/8/8 w - - 0 1";
const statuses = ["draft", "published", "archived"];
const categories = ["attack", "defense", "calculation", "positional", "endgame", "opening", "tactics", "strategy"];
const difficulties = ["beginner", "intermediate", "advanced", "master"];
const orientations = ["white", "black"];
const sidesToGuess = ["white", "black", "both"];
const annotationTypes = [
  "idea",
  "critical",
  "mistake",
  "brilliant",
  "turning_point",
  "quiet_move",
  "defensive_resource",
  "model_move",
];
const momentTypes = [
  "opening_idea",
  "critical_position",
  "turning_point",
  "combination",
  "defensive_resource",
  "conversion",
  "endgame_technique",
];

function getId(item) {
  return item?._id || item?.id || "";
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function splitList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value || "")
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function listToText(value) {
  return asArray(value).join("\n");
}

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function compact(value) {
  if (Array.isArray(value)) {
    return value.map(compact).filter((item) => {
      if (item === null || item === undefined || item === "") return false;
      if (Array.isArray(item)) return item.length > 0;
      if (typeof item === "object") return Object.keys(item).length > 0;
      return true;
    });
  }

  if (value && typeof value === "object") {
    return Object.entries(value).reduce((next, [key, item]) => {
      const cleaned = compact(item);
      if (
        cleaned !== "" &&
        cleaned !== null &&
        cleaned !== undefined &&
        (!Array.isArray(cleaned) || cleaned.length > 0) &&
        (typeof cleaned !== "object" || Array.isArray(cleaned) || Object.keys(cleaned).length > 0)
      ) {
        next[key] = cleaned;
      }
      return next;
    }, {});
  }

  return value;
}

function createEmptyAnnotatedMove(ply = 1) {
  return {
    ply,
    moveNumber: Math.ceil(ply / 2),
    color: ply % 2 === 1 ? "white" : "black",
    san: "",
    uci: "",
    fenBefore: "",
    fenAfter: "",
    shortComment: "",
    comment: "",
    annotationType: "idea",
    highlightSquares: [],
    arrows: [],
    evalBefore: "",
    evalAfter: "",
    isGuessMove: false,
    question: {
      prompt: "",
      candidateMoves: [],
      correctMove: "",
      explanation: "",
      hints: [],
    },
  };
}

function createEmptyKeyMoment(order = 1) {
  const ply = Math.max(1, order);
  return {
    id: "",
    ply,
    moveNumber: Math.ceil(ply / 2),
    color: ply % 2 === 1 ? "white" : "black",
    title: "",
    description: "",
    type: "critical_position",
    fen: "",
    question: "",
    answer: "",
    lesson: "",
    order,
  };
}

function createEmptyGame() {
  return {
    title: "",
    slug: "",
    description: "",
    status: "draft",
    category: "positional",
    difficulty: "intermediate",
    tags: [],
    players: {
      white: "",
      black: "",
    },
    gameInfo: {
      event: "",
      site: "",
      date: "",
      round: "",
      result: "",
      eco: "",
      opening: "",
      year: "",
    },
    pgn: "",
    initialFen: "",
    orientation: "white",
    replayMode: {
      sideToGuess: "both",
      showEngineEval: false,
      showHints: true,
      allowRetry: true,
    },
    annotatedMoves: [],
    keyMoments: [],
    studySummary: {
      coreLesson: "",
      whatToLearn: [],
      typicalMistakes: [],
      modelIdeas: [],
    },
    order: 0,
  };
}

function normalizeMove(move, index) {
  const ply = Number(move?.ply) || index + 1;
  return {
    ...createEmptyAnnotatedMove(ply),
    ...move,
    ply,
    moveNumber: Number(move?.moveNumber) || Math.ceil(ply / 2),
    color: move?.color || (ply % 2 === 1 ? "white" : "black"),
    highlightSquares: asArray(move?.highlightSquares),
    arrows: asArray(move?.arrows),
    evalBefore: move?.evalBefore ?? "",
    evalAfter: move?.evalAfter ?? "",
    question: {
      ...createEmptyAnnotatedMove(ply).question,
      ...(move?.question || {}),
      candidateMoves: asArray(move?.question?.candidateMoves),
      hints: asArray(move?.question?.hints),
    },
  };
}

function normalizeMoment(moment, index) {
  const ply = Number(moment?.ply) || index + 1;
  return {
    ...createEmptyKeyMoment(index + 1),
    ...moment,
    ply,
    moveNumber: Number(moment?.moveNumber) || Math.ceil(ply / 2),
    color: moment?.color || (ply % 2 === 1 ? "white" : "black"),
    order: Number(moment?.order) || index + 1,
  };
}

function normalizeGameForForm(game) {
  return {
    ...createEmptyGame(),
    ...game,
    slug: game?.slug || slugify(game?.title),
    tags: asArray(game?.tags),
    players: {
      white: game?.players?.white || game?.white || "",
      black: game?.players?.black || game?.black || "",
    },
    gameInfo: {
      ...createEmptyGame().gameInfo,
      ...(game?.gameInfo || {}),
      year: game?.gameInfo?.year || "",
    },
    replayMode: {
      ...createEmptyGame().replayMode,
      ...(game?.replayMode || {}),
    },
    annotatedMoves: asArray(game?.annotatedMoves).map(normalizeMove),
    keyMoments: asArray(game?.keyMoments).map(normalizeMoment),
    studySummary: {
      ...createEmptyGame().studySummary,
      ...(game?.studySummary || {}),
      whatToLearn: asArray(game?.studySummary?.whatToLearn),
      typicalMistakes: asArray(game?.studySummary?.typicalMistakes),
      modelIdeas: asArray(game?.studySummary?.modelIdeas),
    },
  };
}

function buildGamePayload(form) {
  return compact({
    title: form.title,
    slug: form.slug || slugify(form.title),
    description: form.description,
    status: form.status,
    category: form.category,
    difficulty: form.difficulty,
    tags: splitList(form.tags),
    players: {
      white: form.players.white,
      black: form.players.black,
    },
    gameInfo: {
      ...form.gameInfo,
      year: form.gameInfo.year === "" ? undefined : Number(form.gameInfo.year),
    },
    pgn: form.pgn,
    initialFen: form.initialFen,
    orientation: form.orientation,
    replayMode: form.replayMode,
    annotatedMoves: asArray(form.annotatedMoves).map((move, index) => {
      const ply = Number(move.ply) || index + 1;
      return compact({
        ...move,
        ply,
        moveNumber: Number(move.moveNumber) || Math.ceil(ply / 2),
        color: move.color || (ply % 2 === 1 ? "white" : "black"),
        highlightSquares: splitList(move.highlightSquares),
        arrows: asArray(move.arrows),
        evalBefore: move.evalBefore === "" ? undefined : Number(move.evalBefore),
        evalAfter: move.evalAfter === "" ? undefined : Number(move.evalAfter),
        isGuessMove: move.isGuessMove === true,
        question: move.question?.prompt
          ? {
              ...move.question,
              candidateMoves: splitList(move.question.candidateMoves),
              hints: splitList(move.question.hints),
            }
          : undefined,
      });
    }),
    keyMoments: asArray(form.keyMoments).map((moment, index) => {
      const ply = Number(moment.ply) || index + 1;
      return compact({
        ...moment,
        ply,
        moveNumber: Number(moment.moveNumber) || Math.ceil(ply / 2),
        color: moment.color || (ply % 2 === 1 ? "white" : "black"),
        order: Number(moment.order) || index + 1,
      });
    }),
    studySummary: {
      coreLesson: form.studySummary.coreLesson,
      whatToLearn: splitList(form.studySummary.whatToLearn),
      typicalMistakes: splitList(form.studySummary.typicalMistakes),
      modelIdeas: splitList(form.studySummary.modelIdeas),
    },
    order: Number(form.order) || 0,
  });
}

function fieldClass(extra = "") {
  return [
    "w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-purple-300/60 focus:ring-2 focus:ring-purple-500/20",
    extra,
  ].join(" ");
}

function TextInput({ label, value, onChange, placeholder = "", type = "text" }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</span>
      <input
        type={type}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={fieldClass()}
      />
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder = "", rows = 4 }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</span>
      <textarea
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={fieldClass("resize-y leading-6")}
      />
    </label>
  );
}

function SelectInput({ label, value, onChange, options }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</span>
      <select value={value ?? ""} onChange={(event) => onChange(event.target.value)} className={fieldClass()}>
        {options.map((option) => {
          const value = Array.isArray(option) ? option[0] : option;
          const label = Array.isArray(option) ? option[1] : option;
          return (
            <option key={value} value={value}>
              {label}
            </option>
          );
        })}
      </select>
    </label>
  );
}

function CheckboxInput({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-slate-300">
      <input
        type="checkbox"
        checked={checked === true}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-purple-400"
      />
      {label}
    </label>
  );
}

function ArrayEditor({ title, items, onChange, emptyItem, renderItem }) {
  const list = asArray(items);

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <button
          type="button"
          onClick={() => onChange([...list, emptyItem(list.length)])}
          className="rounded-xl border border-purple-300/30 bg-purple-300/10 px-4 py-2 text-sm font-semibold text-purple-100 transition hover:bg-purple-300/20"
        >
          Adicionar item
        </button>
      </div>
      <div className="mt-4 grid gap-4">
        {list.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-slate-500">
            Nenhum item ainda.
          </p>
        ) : null}
        {list.map((item, index) => (
          <div key={index} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Item {index + 1}
              </span>
              <button
                type="button"
                onClick={() => onChange(list.filter((_, itemIndex) => itemIndex !== index))}
                className="rounded-xl border border-rose-300/20 bg-rose-300/10 px-3 py-2 text-xs font-semibold text-rose-100 transition hover:bg-rose-300/20"
              >
                Remover
              </button>
            </div>
            {renderItem(item, (nextItem) => {
              const next = [...list];
              next[index] = nextItem;
              onChange(next);
            }, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

function EntityList({ games, selectedGameId, onSelect, onDelete, loading }) {
  return (
    <aside className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">Partidas</h2>
        <span className="rounded-full border border-white/10 bg-slate-950/45 px-3 py-1 text-xs text-slate-400">
          {loading ? "Carregando" : `${games.length} no total`}
        </span>
      </div>
      <div className="mt-4 grid max-h-[72vh] gap-3 overflow-y-auto pr-1">
        {games.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-slate-500">
            Nenhuma partida do Master Replay encontrada.
          </p>
        ) : null}
        {games.map((game) => {
          const id = getId(game);
          const selected = selectedGameId === id;
          return (
            <div
              key={id}
              className={[
                "rounded-2xl border p-4 transition",
                selected
                  ? "border-purple-300/40 bg-purple-300/10"
                  : "border-white/10 bg-slate-950/35 hover:border-purple-300/25",
              ].join(" ")}
            >
              <button type="button" onClick={() => onSelect(game)} className="block w-full text-left">
                <p className="text-sm font-semibold text-white">{game.title}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {game.players?.white || "Brancas"} vs {game.players?.black || "Pretas"}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-slate-300">
                    {game.status}
                  </span>
                  <span className="rounded-full border border-purple-300/20 bg-purple-300/10 px-2.5 py-1 text-[11px] text-purple-100">
                    {game.category}
                  </span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => onDelete(id)}
                className="mt-3 rounded-xl border border-rose-300/20 bg-rose-300/10 px-3 py-2 text-xs font-semibold text-rose-100 transition hover:bg-rose-300/20"
              >
                Arquivar
              </button>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

function AdminPreview({ form }) {
  const previewFen =
    form.initialFen ||
    form.annotatedMoves.find((move) => move.fenBefore)?.fenBefore ||
    form.annotatedMoves.find((move) => move.fenAfter)?.fenAfter ||
    form.keyMoments.find((moment) => moment.fen)?.fen ||
    emptyFen;

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="rounded-[28px] border border-white/10 bg-slate-950/40 p-4">
        <ReviewBoard
          fen={previewFen}
          orientation={form.orientation || "white"}
          onMove={() => false}
          neutralHighlightedSquare={splitList(form.annotatedMoves[0]?.highlightSquares)[0] || null}
        />
      </div>
      <aside className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-300">
          Prévia
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">{form.title || "Partida sem título"}</h2>
        <p className="mt-2 text-sm text-slate-400">
          {form.players.white || "Brancas"} vs {form.players.black || "Pretas"}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {form.gameInfo.event || "Evento"} · {form.gameInfo.year || "Ano"} · {form.gameInfo.result || "Resultado"}
        </p>
        <p className="mt-4 text-sm leading-6 text-slate-300">{form.description}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {splitList(form.tags).map((tag) => (
            <span key={tag} className="rounded-full border border-purple-300/20 bg-purple-300/10 px-3 py-1 text-xs text-purple-100">
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-6 grid gap-3 text-sm text-slate-400">
          <p>{form.annotatedMoves.length} lances anotados</p>
          <p>{form.keyMoments.length} momentos-chave</p>
          <p>{form.studySummary.coreLesson || "Lição central ainda não escrita."}</p>
        </div>
      </aside>
    </div>
  );
}

function GameForm({ form, setForm, activeTab, setActiveTab, onSubmit, onNew, saving }) {
  const update = (path, value) => {
    setForm((current) => {
      const next = structuredClone(current);
      let cursor = next;
      path.slice(0, -1).forEach((key) => {
        cursor[key] = cursor[key] ?? {};
        cursor = cursor[key];
      });
      cursor[path[path.length - 1]] = value;
      return next;
    });
  };

  const tabs = [
    ["basic", "Informações básicas"],
    ["pgn", "PGN e Replay"],
    ["moves", "Lances anotados"],
    ["moments", "Momentos-chave"],
    ["summary", "Resumo de estudo"],
    ["preview", "Prévia"],
  ];

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.055),rgba(88,28,135,0.08),rgba(15,23,42,0.42))] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-300">Admin do Master Replay</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Editor de conteúdo</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Crie partidas modelo com PGN, anotações guiadas, perguntas de adivinhe-o-lance, momentos-chave e resumos de estudo.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onNew}
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-purple-300/35 hover:text-white"
            >
              Nova partida
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-purple-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(88,28,135,0.35)] transition hover:bg-purple-400 disabled:opacity-60"
            >
              {saving ? "Salvando..." : "Salvar partida"}
            </button>
          </div>
        </div>
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {tabs.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={[
                "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition",
                activeTab === id
                  ? "border-purple-300 bg-purple-300 text-slate-950"
                  : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-purple-300/35 hover:text-white",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[30px] border border-white/10 bg-white/[0.035] p-5">
        {activeTab === "basic" ? (
          <div className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <TextInput label="Título" value={form.title} onChange={(value) => {
                update(["title"], value);
                if (!form.slug) update(["slug"], slugify(value));
              }} />
              <TextInput label="Slug" value={form.slug} onChange={(value) => update(["slug"], slugify(value))} />
              <SelectInput label="Status" value={form.status} onChange={(value) => update(["status"], value)} options={statuses} />
              <SelectInput label="Categoria" value={form.category} onChange={(value) => update(["category"], value)} options={categories} />
              <SelectInput label="Dificuldade" value={form.difficulty} onChange={(value) => update(["difficulty"], value)} options={difficulties} />
              <TextInput label="Ordem" type="number" value={form.order} onChange={(value) => update(["order"], Number(value))} />
              <TextInput label="Jogador de brancas" value={form.players.white} onChange={(value) => update(["players", "white"], value)} />
              <TextInput label="Jogador de pretas" value={form.players.black} onChange={(value) => update(["players", "black"], value)} />
            </div>
            <TextArea label="Descrição" value={form.description} onChange={(value) => update(["description"], value)} rows={3} />
            <TextArea label="Tags" value={listToText(form.tags)} onChange={(value) => update(["tags"], splitList(value))} placeholder="one per line or comma separated" rows={3} />
            <div className="grid gap-4 md:grid-cols-3">
              <TextInput label="Evento" value={form.gameInfo.event} onChange={(value) => update(["gameInfo", "event"], value)} />
              <TextInput label="Site" value={form.gameInfo.site} onChange={(value) => update(["gameInfo", "site"], value)} />
              <TextInput label="Data" value={form.gameInfo.date} onChange={(value) => update(["gameInfo", "date"], value)} />
              <TextInput label="Rodada" value={form.gameInfo.round} onChange={(value) => update(["gameInfo", "round"], value)} />
              <TextInput label="Resultado" value={form.gameInfo.result} onChange={(value) => update(["gameInfo", "result"], value)} />
              <TextInput label="Ano" type="number" value={form.gameInfo.year} onChange={(value) => update(["gameInfo", "year"], value)} />
              <TextInput label="ECO" value={form.gameInfo.eco} onChange={(value) => update(["gameInfo", "eco"], value)} />
              <TextInput label="Abertura" value={form.gameInfo.opening} onChange={(value) => update(["gameInfo", "opening"], value)} />
            </div>
          </div>
        ) : null}

        {activeTab === "pgn" ? (
          <div className="grid gap-5">
            <TextArea label="PGN" value={form.pgn} onChange={(value) => update(["pgn"], value)} rows={10} />
            <TextInput label="Initial FEN (optional)" value={form.initialFen} onChange={(value) => update(["initialFen"], value)} />
            <div className="grid gap-4 md:grid-cols-2">
              <SelectInput label="Board orientation" value={form.orientation} onChange={(value) => update(["orientation"], value)} options={orientations} />
              <SelectInput label="Side to guess" value={form.replayMode.sideToGuess} onChange={(value) => update(["replayMode", "sideToGuess"], value)} options={sidesToGuess} />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <CheckboxInput label="Show engine eval" checked={form.replayMode.showEngineEval} onChange={(value) => update(["replayMode", "showEngineEval"], value)} />
              <CheckboxInput label="Show hints" checked={form.replayMode.showHints} onChange={(value) => update(["replayMode", "showHints"], value)} />
              <CheckboxInput label="Allow retry" checked={form.replayMode.allowRetry} onChange={(value) => update(["replayMode", "allowRetry"], value)} />
            </div>
          </div>
        ) : null}

        {activeTab === "moves" ? (
          <ArrayEditor
            title="Annotated moves"
            items={form.annotatedMoves}
            onChange={(value) => update(["annotatedMoves"], value)}
            emptyItem={(index) => createEmptyAnnotatedMove(index + 1)}
            renderItem={(move, setMove) => (
              <div className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-4">
                  <TextInput label="Ply" type="number" value={move.ply} onChange={(value) => {
                    const ply = Number(value) || 1;
                    setMove({ ...move, ply, moveNumber: Math.ceil(ply / 2), color: ply % 2 === 1 ? "white" : "black" });
                  }} />
                  <TextInput label="Move number" type="number" value={move.moveNumber} onChange={(value) => setMove({ ...move, moveNumber: Number(value) || 1 })} />
                  <SelectInput label="Color" value={move.color} onChange={(value) => setMove({ ...move, color: value })} options={orientations} />
                  <SelectInput label="Type" value={move.annotationType} onChange={(value) => setMove({ ...move, annotationType: value })} options={annotationTypes} />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <TextInput label="SAN" value={move.san} onChange={(value) => setMove({ ...move, san: value })} />
                  <TextInput label="UCI" value={move.uci} onChange={(value) => setMove({ ...move, uci: value })} />
                  <CheckboxInput label="Guess move" checked={move.isGuessMove} onChange={(value) => setMove({ ...move, isGuessMove: value })} />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <TextInput label="FEN before" value={move.fenBefore} onChange={(value) => setMove({ ...move, fenBefore: value })} />
                  <TextInput label="FEN after" value={move.fenAfter} onChange={(value) => setMove({ ...move, fenAfter: value })} />
                  <TextInput label="Eval before" value={move.evalBefore} onChange={(value) => setMove({ ...move, evalBefore: value })} />
                  <TextInput label="Eval after" value={move.evalAfter} onChange={(value) => setMove({ ...move, evalAfter: value })} />
                </div>
                <TextArea label="Short comment" value={move.shortComment} onChange={(value) => setMove({ ...move, shortComment: value })} rows={2} />
                <TextArea label="Comment" value={move.comment} onChange={(value) => setMove({ ...move, comment: value })} rows={3} />
                <TextArea label="Highlight squares" value={listToText(move.highlightSquares)} onChange={(value) => setMove({ ...move, highlightSquares: splitList(value) })} rows={2} />
                <div className="rounded-2xl border border-purple-300/15 bg-purple-300/[0.04] p-4">
                  <h4 className="text-sm font-semibold text-white">Guess-the-move question</h4>
                  <div className="mt-4 grid gap-4">
                    <TextArea label="Prompt" value={move.question?.prompt} onChange={(value) => setMove({ ...move, question: { ...(move.question || {}), prompt: value } })} rows={2} />
                    <TextArea label="Candidate moves" value={listToText(move.question?.candidateMoves)} onChange={(value) => setMove({ ...move, question: { ...(move.question || {}), candidateMoves: splitList(value) } })} rows={2} />
                    <TextInput label="Correct move" value={move.question?.correctMove} onChange={(value) => setMove({ ...move, question: { ...(move.question || {}), correctMove: value } })} />
                    <TextArea label="Explanation" value={move.question?.explanation} onChange={(value) => setMove({ ...move, question: { ...(move.question || {}), explanation: value } })} rows={3} />
                    <TextArea label="Hints" value={listToText(move.question?.hints)} onChange={(value) => setMove({ ...move, question: { ...(move.question || {}), hints: splitList(value) } })} rows={2} />
                  </div>
                </div>
              </div>
            )}
          />
        ) : null}

        {activeTab === "moments" ? (
          <ArrayEditor
            title="Key moments"
            items={form.keyMoments}
            onChange={(value) => update(["keyMoments"], value)}
            emptyItem={(index) => createEmptyKeyMoment(index + 1)}
            renderItem={(moment, setMoment) => (
              <div className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-4">
                  <TextInput label="Ply" type="number" value={moment.ply} onChange={(value) => {
                    const ply = Number(value) || 1;
                    setMoment({ ...moment, ply, moveNumber: Math.ceil(ply / 2), color: ply % 2 === 1 ? "white" : "black" });
                  }} />
                  <TextInput label="Move number" type="number" value={moment.moveNumber} onChange={(value) => setMoment({ ...moment, moveNumber: Number(value) || 1 })} />
                  <SelectInput label="Color" value={moment.color} onChange={(value) => setMoment({ ...moment, color: value })} options={orientations} />
                  <SelectInput label="Type" value={moment.type} onChange={(value) => setMoment({ ...moment, type: value })} options={momentTypes} />
                </div>
                <TextInput label="Moment id (optional)" value={moment.id} onChange={(value) => setMoment({ ...moment, id: value })} />
                <TextInput label="Title" value={moment.title} onChange={(value) => setMoment({ ...moment, title: value })} />
                <TextArea label="Description" value={moment.description} onChange={(value) => setMoment({ ...moment, description: value })} rows={3} />
                <TextInput label="FEN" value={moment.fen} onChange={(value) => setMoment({ ...moment, fen: value })} />
                <TextArea label="Question" value={moment.question} onChange={(value) => setMoment({ ...moment, question: value })} rows={2} />
                <TextArea label="Answer" value={moment.answer} onChange={(value) => setMoment({ ...moment, answer: value })} rows={2} />
                <TextArea label="Lesson" value={moment.lesson} onChange={(value) => setMoment({ ...moment, lesson: value })} rows={3} />
                <TextInput label="Order" type="number" value={moment.order} onChange={(value) => setMoment({ ...moment, order: Number(value) || 0 })} />
              </div>
            )}
          />
        ) : null}

        {activeTab === "summary" ? (
          <div className="grid gap-5">
            <TextArea label="Core lesson" value={form.studySummary.coreLesson} onChange={(value) => update(["studySummary", "coreLesson"], value)} rows={3} />
            <TextArea label="What to learn" value={listToText(form.studySummary.whatToLearn)} onChange={(value) => update(["studySummary", "whatToLearn"], splitList(value))} rows={4} />
            <TextArea label="Typical mistakes" value={listToText(form.studySummary.typicalMistakes)} onChange={(value) => update(["studySummary", "typicalMistakes"], splitList(value))} rows={4} />
            <TextArea label="Model ideas" value={listToText(form.studySummary.modelIdeas)} onChange={(value) => update(["studySummary", "modelIdeas"], splitList(value))} rows={4} />
          </div>
        ) : null}

        {activeTab === "preview" ? <AdminPreview form={form} /> : null}
      </div>
    </form>
  );
}

export default function MasterReplayAdmin() {
  const { t } = useLanguage();
  const [games, setGames] = useState([]);
  const [form, setForm] = useState(createEmptyGame());
  const [editingGameId, setEditingGameId] = useState("");
  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const sortedGames = useMemo(
    () => [...games].sort((left, right) => (left.order || 0) - (right.order || 0)),
    [games],
  );

  const loadGames = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await masterReplayApi.listGames({ status: "draft", limit: 100 });
      const published = await masterReplayApi.listGames({ status: "published", limit: 100 });
      const archived = await masterReplayApi.listGames({ status: "archived", limit: 100 });
      const merged = new Map();
      [...response.items, ...published.items, ...archived.items].forEach((game) => {
        merged.set(getId(game), game);
      });
      setGames([...merged.values()]);
    } catch (loadError) {
      setError(loadError.message || "Não foi possível carregar as partidas do Master Replay.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGames();
  }, []);

  const handleNew = () => {
    setEditingGameId("");
    setForm(createEmptyGame());
    setActiveTab("basic");
    setMessage("");
    setError("");
  };

  const handleSelectGame = async (game) => {
    const id = getId(game);
    setEditingGameId(id);
    setMessage("");
    setError("");
    try {
      const fullGame = await masterReplayApi.getGame(id);
      setForm(normalizeGameForForm(fullGame));
      setActiveTab("basic");
    } catch (selectError) {
      setError(selectError.message || "Não foi possível carregar esta partida.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = buildGamePayload(form);
      const saved = editingGameId
        ? await masterReplayApi.updateGame(editingGameId, payload)
        : await masterReplayApi.createGame(payload);
      const savedId = getId(saved);
      setEditingGameId(savedId);
      setForm(normalizeGameForForm(saved));
      setMessage(t("masterReplayAdmin.saved", "Partida do Master Replay salva."));
      await loadGames();
    } catch (saveError) {
      setError(saveError.message || "Não foi possível salvar esta partida do Master Replay.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (gameId) => {
    if (!gameId) return;
    const confirmed = window.confirm("Arquivar esta partida do Master Replay?");
    if (!confirmed) return;

    setError("");
    setMessage("");
    try {
      await masterReplayApi.deleteGame(gameId);
      if (editingGameId === gameId) handleNew();
      setMessage(t("masterReplayAdmin.archived", "Partida do Master Replay arquivada."));
      await loadGames();
    } catch (deleteError) {
      setError(deleteError.message || "Não foi possível arquivar esta partida.");
    }
  };

  return (
    <section className="mx-auto grid w-full max-w-7xl gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            window.history.pushState({}, "", "/practice");
            window.dispatchEvent(new PopStateEvent("popstate"));
          }}
          className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-purple-300/35 hover:text-white"
        >
          Voltar para Practice
        </button>
        <div className="flex flex-wrap gap-2">
          {message ? (
            <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm text-emerald-100">
              {message}
            </span>
          ) : null}
          {error ? (
            <span className="rounded-full border border-rose-300/20 bg-rose-300/10 px-4 py-2 text-sm text-rose-100">
              {error}
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <EntityList
          games={sortedGames}
          selectedGameId={editingGameId}
          onSelect={handleSelectGame}
          onDelete={handleDelete}
          loading={loading}
        />
        <GameForm
          form={form}
          setForm={setForm}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onSubmit={handleSubmit}
          onNew={handleNew}
          saving={saving}
        />
      </div>
    </section>
  );
}
