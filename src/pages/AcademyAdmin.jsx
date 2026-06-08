import { useEffect, useMemo, useState } from "react";
import LessonView from "../components/academy/LessonView.jsx";
import ReviewBoard from "../components/review/ReviewBoard.js";
import { useLanguage } from "../contexts/LanguageContext.jsx";
import { academyAdminApi } from "../services/academyAdminApi.js";
import "../styles/gameReview.css";

const emptyFen = "8/8/8/8/8/8/8/8 w - - 0 1";
const pathLevels = [
  ["beginner", "Beginner"],
  ["beginner_to_intermediate", "Beginner to Intermediate"],
  ["intermediate", "Intermediate"],
  ["advanced", "Advanced"],
];
const pathCategories = [
  ["calculation", "Calculation"],
  ["tactics", "Tactics"],
  ["strategy", "Strategy"],
  ["endgame", "Endgame"],
  ["opening", "Opening"],
  ["defense", "Defense"],
  ["attack", "Attack"],
];
const lessonTypes = [
  ["concept", "Concept"],
  ["model_game", "Model game"],
  ["practice", "Practice"],
  ["mixed", "Mixed"],
];
const puzzleDifficulties = [
  ["easy", "Easy"],
  ["medium", "Medium"],
  ["hard", "Hard"],
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

function normalizeDifficulty(value) {
  const normalized = String(value || "").toLowerCase();
  if (["easy", "medium", "hard"].includes(normalized)) return normalized;
  return "easy";
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

const createEmptyPath = () => ({
  title: "",
  slug: "",
  subtitle: "",
  description: "",
  level: "beginner_to_intermediate",
  category: "calculation",
  durationWeeks: 4,
  order: 1,
  status: "draft",
  tags: [],
  cover: {
    type: "icon",
    icon: "",
    imageUrl: "",
  },
});

const createEmptyModule = (pathId = "") => ({
  pathId,
  title: "",
  slug: "",
  subtitle: "",
  description: "",
  label: "",
  order: 1,
  estimatedLessons: "",
  estimatedMinutes: "",
  status: "draft",
  unlockRule: {
    type: "always",
    requiredModuleId: "",
  },
});

const createEmptyMove = () => ({
  ply: 1,
  san: "",
  uci: "",
  fenAfter: "",
  comment: "",
  highlightSquares: [],
  arrows: [],
});

const createEmptyLesson = (moduleId = "", pathId = "") => ({
  moduleId,
  pathId,
  title: "",
  slug: "",
  subtitle: "",
  description: "",
  theme: "",
  order: 1,
  status: "draft",
  lessonType: "mixed",
  estimatedMinutes: "",
  tags: [],
  coreIdea: {
    title: "",
    intro: "",
    keyConcepts: [],
    sections: [],
  },
  conceptPosition: {
    title: "",
    description: "",
    initialFen: "",
    orientation: "white",
    moves: [],
    variations: [],
    explanationBlocks: [],
  },
  studyShelf: [],
  gmModelGame: {
    title: "",
    white: "",
    black: "",
    event: "",
    year: "",
    result: "",
    pgn: "",
    criticalFen: "",
    criticalMoveNumber: "",
    orientation: "white",
    theme: "",
    commentary: "",
    moments: [],
  },
  targetedPractice: {
    description: "",
    puzzleRefs: [],
    filters: {
      themes: [],
      minRating: "",
      maxRating: "",
      count: "",
    },
    customPuzzles: [],
  },
});

function normalizeLessonForForm(lesson, moduleId = "", pathId = "") {
  const coreIdea = lesson?.coreIdea || lesson?.textContent || {};
  const conceptPosition = lesson?.conceptPosition || lesson?.conceptBoard || {};
  const gmModelGame = lesson?.gmModelGame || lesson?.modelGame || {};
  const targetedPractice = lesson?.targetedPractice || {};
  const generatedFilters = targetedPractice.generatedFilters || targetedPractice.filters || {};

  return {
    ...createEmptyLesson(moduleId, pathId),
    ...lesson,
    moduleId: lesson?.moduleId || moduleId,
    pathId: lesson?.pathId || pathId,
    coreIdea: {
      title: coreIdea.title || "",
      intro: coreIdea.summary || coreIdea.intro || "",
      keyConcepts: asArray(lesson?.keyConcepts || coreIdea.keyConcepts),
      sections: asArray(coreIdea.sections).map((section) => ({
        title: section.title || section.heading || "",
        body: section.body || "",
      })),
    },
    conceptPosition: {
      ...createEmptyLesson().conceptPosition,
      ...conceptPosition,
      initialFen: conceptPosition.initialFen || conceptPosition.fen || "",
      moves: asArray(conceptPosition.moves || conceptPosition.mainLine),
      variations: asArray(conceptPosition.variations).map((variation) => ({
        id: variation.id || variation.name || "",
        label: variation.label || variation.name || "",
        description: variation.description || variation.explanation || "",
        startFen: variation.startFen || conceptPosition.fen || conceptPosition.initialFen || "",
        moves: asArray(variation.moves).map((move, index) =>
          typeof move === "string"
            ? { ...createEmptyMove(), ply: index + 1, san: move }
            : move,
        ),
      })),
      explanationBlocks: asArray(conceptPosition.explanationBlocks),
    },
    studyShelf: asArray(lesson?.studyShelf || lesson?.additionalResources),
    gmModelGame: {
      ...createEmptyLesson().gmModelGame,
      ...gmModelGame,
      commentary: gmModelGame.explanation || gmModelGame.commentary || "",
      moments: asArray(gmModelGame.moments || gmModelGame.guessTheMoveMoments).map((moment) => ({
        ...moment,
        prompt: moment.prompt || moment.question || moment.description || "",
        idea: moment.idea || moment.answer || "",
      })),
    },
    targetedPractice: {
      description: targetedPractice.description || "",
      puzzleRefs: asArray(targetedPractice.puzzleRefs),
      filters: {
        themes: asArray(generatedFilters.themes),
        minRating: generatedFilters.minRating || "",
        maxRating: generatedFilters.maxRating || "",
        count: generatedFilters.count || "",
      },
      customPuzzles: asArray(targetedPractice.customPuzzles || lesson?.puzzles).map((puzzle) => ({
        ...puzzle,
        solution: asArray(puzzle.solution || puzzle.moves),
        theme: puzzle.theme || asArray(puzzle.themes)[0] || "",
        difficulty: normalizeDifficulty(puzzle.difficulty),
      })),
    },
  };
}

function normalizePathForForm(path) {
  return {
    ...createEmptyPath(),
    ...path,
    durationWeeks: path?.durationWeeks ?? path?.estimatedDuration ?? 4,
    cover: {
      ...createEmptyPath().cover,
      ...(path?.cover || {}),
    },
  };
}

function normalizeModuleForForm(module, pathId = "") {
  return {
    ...createEmptyModule(pathId),
    ...module,
    pathId: module?.pathId || pathId,
    estimatedLessons: module?.estimatedLessons ?? "",
    estimatedMinutes: module?.estimatedMinutes ?? "",
    unlockRule: {
      ...createEmptyModule().unlockRule,
      ...(module?.unlockRule || {}),
      requiredModuleId: module?.unlockRule?.requiredModuleId || "",
    },
  };
}

function fieldClass() {
  return "w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-purple-300/60 focus:ring-4 focus:ring-purple-500/10";
}

function labelClass() {
  return "grid gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500";
}

function TextInput({ label, value, onChange, placeholder = "", type = "text" }) {
  return (
    <label className={labelClass()}>
      {label}
      <input
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={fieldClass()}
      />
    </label>
  );
}

function TextArea({ label, value, onChange, rows = 4, placeholder = "" }) {
  return (
    <label className={labelClass()}>
      {label}
      <textarea
        value={value ?? ""}
        placeholder={placeholder}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className={`${fieldClass()} resize-y leading-6`}
      />
    </label>
  );
}

function SelectInput({ label, value, onChange, options }) {
  return (
    <label className={labelClass()}>
      {label}
      <select value={value || ""} onChange={(event) => onChange(event.target.value)} className={fieldClass()}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function numberOrUndefined(value) {
  const number = Number(value);
  return Number.isFinite(number) && String(value).trim() !== "" ? number : undefined;
}

function buildPathPayload(form) {
  return compact({
    title: form.title,
    slug: form.slug || slugify(form.title),
    subtitle: form.subtitle,
    description: form.description,
    level: form.level,
    category: form.category,
    tags: form.tags,
    durationWeeks: numberOrUndefined(form.durationWeeks),
    status: form.status,
    order: Number(form.order) || 0,
    cover:
      form.cover?.type && (form.cover.icon || form.cover.imageUrl)
        ? {
            type: form.cover.type,
            icon: form.cover.icon,
            imageUrl: form.cover.imageUrl,
          }
        : undefined,
  });
}

function buildModulePayload(form, selectedPathId) {
  return compact({
    pathId: form.pathId || selectedPathId,
    title: form.title,
    slug: form.slug || slugify(form.title),
    subtitle: form.subtitle,
    description: form.description,
    label: form.label,
    order: Number(form.order) || 0,
    estimatedLessons: numberOrUndefined(form.estimatedLessons),
    estimatedMinutes: numberOrUndefined(form.estimatedMinutes),
    status: form.status,
    unlockRule:
      form.unlockRule?.type && form.unlockRule.type !== "always"
        ? {
            type: form.unlockRule.type,
            requiredModuleId: form.unlockRule.requiredModuleId,
          }
        : form.unlockRule?.type
          ? { type: form.unlockRule.type }
          : undefined,
  });
}

function buildLessonPayload(form, selectedModuleId, selectedPathId) {
  const keyConcepts = asArray(form.coreIdea.keyConcepts);

  return compact({
    pathId: form.pathId || selectedPathId,
    moduleId: form.moduleId || selectedModuleId,
    title: form.title,
    slug: form.slug || slugify(form.title),
    subtitle: form.subtitle,
    description: form.description,
    order: Number(form.order) || 0,
    status: form.status,
    lessonType: form.lessonType,
    estimatedMinutes: numberOrUndefined(form.estimatedMinutes),
    tags: form.tags,
    keyConcepts,
    coreIdea: {
      title: form.coreIdea.title,
      summary: form.coreIdea.intro,
      sections: asArray(form.coreIdea.sections).map((section) => ({
        heading: section.heading || section.title,
        body: section.body,
      })),
    },
    conceptPosition: form.conceptPosition.initialFen
      ? {
          title: form.conceptPosition.title,
          description: form.conceptPosition.description,
          fen: form.conceptPosition.initialFen,
          orientation: form.conceptPosition.orientation || "white",
          initialPly: numberOrUndefined(form.conceptPosition.initialPly),
          moves: asArray(form.conceptPosition.moves).map((move) => ({
            san: move.san,
            uci: move.uci,
            fenAfter: move.fenAfter,
            comment: move.comment,
            highlightSquares: move.highlightSquares,
            arrows: move.arrows,
          })),
          variations: asArray(form.conceptPosition.variations).map((variation) => ({
            name: variation.name || variation.label || variation.id,
            moves: asArray(variation.moves).map((move) =>
              typeof move === "string" ? move : move.san || move.uci || "",
            ),
            explanation: variation.explanation || variation.description,
          })),
        }
      : undefined,
    studyShelf: asArray(form.studyShelf),
    gmModelGame: form.gmModelGame.white && form.gmModelGame.black
      ? {
          title:
            form.gmModelGame.title ||
            [form.gmModelGame.white, form.gmModelGame.black].filter(Boolean).join(" vs "),
          white: form.gmModelGame.white,
          black: form.gmModelGame.black,
          event: form.gmModelGame.event,
          year: numberOrUndefined(form.gmModelGame.year),
          result: form.gmModelGame.result,
          pgn: form.gmModelGame.pgn,
          startFen: form.gmModelGame.startFen,
          criticalFen: form.gmModelGame.criticalFen,
          criticalMoveNumber: numberOrUndefined(form.gmModelGame.criticalMoveNumber),
          orientation: form.gmModelGame.orientation,
          explanation: form.gmModelGame.commentary,
          moments: asArray(form.gmModelGame.moments).map((moment) => ({
            moveNumber: numberOrUndefined(moment.moveNumber),
            ply: numberOrUndefined(moment.ply),
            fen: moment.fen,
            title: moment.title || `Move ${moment.moveNumber || ""}`.trim(),
            description: moment.description || moment.prompt,
            question: moment.question || moment.prompt,
            answer: moment.answer || moment.idea,
            candidateMoves: moment.candidateMoves,
            bestMove: moment.bestMove,
          })),
        }
      : undefined,
    targetedPractice: {
      description: form.targetedPractice.description,
      puzzleRefs: form.targetedPractice.puzzleRefs,
      generatedFilters: {
        themes: form.targetedPractice.filters.themes,
        minRating: numberOrUndefined(form.targetedPractice.filters.minRating),
        maxRating: numberOrUndefined(form.targetedPractice.filters.maxRating),
        count: numberOrUndefined(form.targetedPractice.filters.count),
      },
      customPuzzles: asArray(form.targetedPractice.customPuzzles).map((puzzle) => ({
        title: puzzle.title,
        fen: puzzle.fen,
        moves: asArray(puzzle.solution || puzzle.moves),
        themes: asArray(puzzle.themes?.length ? puzzle.themes : splitList(puzzle.theme)),
        difficulty: normalizeDifficulty(puzzle.difficulty),
        explanation: puzzle.explanation,
      })),
    },
  });
}

function ListInput({ label, value, onChange, placeholder = "One item per line" }) {
  return (
    <TextArea
      label={label}
      value={listToText(value)}
      placeholder={placeholder}
      rows={3}
      onChange={(next) => onChange(splitList(next))}
    />
  );
}

function ArrayEditor({ title, items, emptyItem, onChange, renderItem }) {
  const list = asArray(items);

  const updateItem = (index, patch) => {
    onChange(list.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  };

  const removeItem = (index) => {
    onChange(list.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">{title}</h4>
        <button
          type="button"
          onClick={() => onChange([...list, emptyItem()])}
          className="rounded-lg border border-purple-300/25 bg-purple-300/10 px-3 py-2 text-xs font-semibold text-purple-100 transition hover:border-purple-300/50"
        >
          Adicionar
        </button>
      </div>

      <div className="mt-4 grid gap-4">
        {list.length ? (
          list.map((item, index) => (
            <div key={index} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  #{index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="rounded-lg border border-rose-300/25 bg-rose-300/10 px-3 py-1.5 text-xs font-semibold text-rose-100 transition hover:border-rose-300/50"
                >
                  Remover
                </button>
              </div>
              {renderItem(item, (patch) => updateItem(index, patch), index)}
            </div>
          ))
        ) : (
          <p className="rounded-xl border border-white/10 bg-slate-950/35 p-3 text-sm text-slate-500">
            Nenhum item ainda.
          </p>
        )}
      </div>
    </section>
  );
}

function EntityList({ title, items, selectedId, onSelect, onCreate, onEdit, onDelete, emptyLabel }) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">{title}</h3>
        <button
          type="button"
          onClick={onCreate}
          className="rounded-lg bg-purple-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-purple-400"
        >
          Novo
        </button>
      </div>
      <div className="mt-4 grid gap-2">
        {items.length ? (
          items.map((item) => {
            const id = getId(item);
            return (
              <div
                key={id}
                className={[
                  "rounded-2xl border p-3 transition",
                  selectedId === id
                    ? "border-purple-300/50 bg-purple-400/10"
                    : "border-white/10 bg-slate-950/35 hover:border-purple-300/25",
                ].join(" ")}
              >
                <button type="button" onClick={() => onSelect(item)} className="w-full text-left">
                  <p className="truncate text-sm font-semibold text-white">{item.title || item.name || "Sem título"}</p>
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {item.theme || item.level || item.status || id}
                  </p>
                </button>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(item)}
                    className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item)}
                    className="rounded-lg border border-rose-300/20 bg-rose-300/10 px-2.5 py-1.5 text-xs font-semibold text-rose-100"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="rounded-xl border border-white/10 bg-slate-950/35 p-3 text-sm text-slate-500">
            {emptyLabel}
          </p>
        )}
      </div>
    </section>
  );
}

function MoveFields({ item, onChange }) {
  return (
    <div className="grid gap-3">
      <div className="grid gap-3 md:grid-cols-4">
        <TextInput label="Ply" type="number" value={item.ply} onChange={(value) => onChange({ ply: Number(value) || 1 })} />
        <TextInput label="SAN" value={item.san} onChange={(value) => onChange({ san: value })} />
        <TextInput label="UCI" value={item.uci} onChange={(value) => onChange({ uci: value })} />
        <ListInput label="Highlights" value={item.highlightSquares} onChange={(value) => onChange({ highlightSquares: value })} />
      </div>
      <TextArea label="FEN após" value={item.fenAfter} onChange={(value) => onChange({ fenAfter: value })} rows={2} />
      <TextArea label="Comentário" value={item.comment} onChange={(value) => onChange({ comment: value })} rows={2} />
      <ArrayEditor
        title="Setas"
        items={item.arrows}
        emptyItem={() => ({ from: "", to: "", color: "purple" })}
        onChange={(arrows) => onChange({ arrows })}
        renderItem={(arrow, updateArrow) => (
          <div className="grid gap-3 md:grid-cols-3">
            <TextInput label="De" value={arrow.from} onChange={(value) => updateArrow({ from: value })} />
            <TextInput label="Para" value={arrow.to} onChange={(value) => updateArrow({ to: value })} />
            <TextInput label="Cor" value={arrow.color} onChange={(value) => updateArrow({ color: value })} />
          </div>
        )}
      />
    </div>
  );
}

function PathForm({ value, onChange, onSave, saving, editing }) {
  return (
    <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); onSave(); }}>
      <div className="grid gap-4 md:grid-cols-2">
        <TextInput label="Título" value={value.title} onChange={(title) => onChange({ ...value, title })} />
        <TextInput label="Slug" value={value.slug} placeholder={slugify(value.title)} onChange={(slug) => onChange({ ...value, slug })} />
        <TextInput label="Subtítulo" value={value.subtitle} onChange={(subtitle) => onChange({ ...value, subtitle })} />
        <SelectInput label="Nível" value={value.level} onChange={(level) => onChange({ ...value, level })} options={pathLevels.map(([value, label]) => ({ value, label }))} />
        <SelectInput label="Categoria" value={value.category} onChange={(category) => onChange({ ...value, category })} options={pathCategories.map(([value, label]) => ({ value, label }))} />
        <TextInput label="Duração em semanas" type="number" value={value.durationWeeks} onChange={(durationWeeks) => onChange({ ...value, durationWeeks })} />
        <TextInput label="Ordem" type="number" value={value.order} onChange={(order) => onChange({ ...value, order: Number(order) || 1 })} />
        <SelectInput label="Status" value={value.status} onChange={(status) => onChange({ ...value, status })} options={[{ value: "draft", label: "Rascunho" }, { value: "published", label: "Publicado" }, { value: "archived", label: "Arquivado" }]} />
      </div>
      <TextArea label="Descrição" value={value.description} onChange={(description) => onChange({ ...value, description })} />
      <ListInput label="Tags" value={value.tags} onChange={(tags) => onChange({ ...value, tags })} />
      <div className="grid gap-4 md:grid-cols-3">
        <SelectInput label="Cover type" value={value.cover?.type} onChange={(type) => onChange({ ...value, cover: { ...value.cover, type } })} options={[{ value: "icon", label: "Icon" }, { value: "image", label: "Image" }, { value: "board_preview", label: "Board preview" }]} />
        <TextInput label="Cover icon" value={value.cover?.icon} onChange={(icon) => onChange({ ...value, cover: { ...value.cover, icon } })} />
        <TextInput label="Cover image URL" value={value.cover?.imageUrl} onChange={(imageUrl) => onChange({ ...value, cover: { ...value.cover, imageUrl } })} />
      </div>
      <button type="submit" disabled={saving} className="w-fit rounded-xl bg-purple-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-400 disabled:opacity-60">
        {saving ? "Salvando..." : editing ? "Atualizar trilha" : "Criar trilha"}
      </button>
    </form>
  );
}

function ModuleForm({ value, onChange, onSave, saving, editing, paths = [] }) {
  const pathOptions = [
    { value: "", label: "Selecione uma trilha" },
    ...paths.map((path) => ({
      value: getId(path),
      label: path.title || path.slug || getId(path),
    })),
  ];

  return (
    <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); onSave(); }}>
      <div className="grid gap-4 md:grid-cols-2">
        <SelectInput
          label="Trilha da Academy"
          value={value.pathId}
          onChange={(pathId) => onChange({ ...value, pathId })}
          options={pathOptions}
        />
        <TextInput label="Título" value={value.title} onChange={(title) => onChange({ ...value, title })} />
        <TextInput label="Slug" value={value.slug} placeholder={slugify(value.title)} onChange={(slug) => onChange({ ...value, slug })} />
        <TextInput label="Subtítulo" value={value.subtitle} onChange={(subtitle) => onChange({ ...value, subtitle })} />
        <TextInput label="Rótulo" value={value.label} onChange={(label) => onChange({ ...value, label })} />
        <TextInput label="Ordem" type="number" value={value.order} onChange={(order) => onChange({ ...value, order: Number(order) || 1 })} />
        <TextInput label="Aulas estimadas" type="number" value={value.estimatedLessons} onChange={(estimatedLessons) => onChange({ ...value, estimatedLessons })} />
        <TextInput label="Minutos estimados" type="number" value={value.estimatedMinutes} onChange={(estimatedMinutes) => onChange({ ...value, estimatedMinutes })} />
        <SelectInput label="Status" value={value.status} onChange={(status) => onChange({ ...value, status })} options={[{ value: "draft", label: "Rascunho" }, { value: "published", label: "Publicado" }, { value: "archived", label: "Arquivado" }]} />
      </div>
      <TextArea label="Descrição" value={value.description} onChange={(description) => onChange({ ...value, description })} />
      <div className="grid gap-4 md:grid-cols-2">
        <SelectInput label="Unlock type" value={value.unlockRule?.type} onChange={(type) => onChange({ ...value, unlockRule: { ...value.unlockRule, type } })} options={[{ value: "always", label: "Always" }, { value: "previous_module_completed", label: "Previous module completed" }, { value: "manual", label: "Manual" }]} />
        <TextInput label="Required module ID" value={value.unlockRule?.requiredModuleId} onChange={(requiredModuleId) => onChange({ ...value, unlockRule: { ...value.unlockRule, requiredModuleId } })} />
      </div>
      <button type="submit" disabled={saving} className="w-fit rounded-xl bg-purple-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-400 disabled:opacity-60">
        {saving ? "Salvando..." : editing ? "Atualizar módulo" : "Criar módulo"}
      </button>
    </form>
  );
}

function LessonForm({
  value,
  onChange,
  onSave,
  saving,
  editing,
  selectedPath,
  selectedModule,
  modules = [],
}) {
  const [tab, setTab] = useState("basic");
  const tabs = [
    ["basic", "Informações básicas"],
    ["core", "Ideia central"],
    ["concept", "Tabuleiro conceitual"],
    ["shelf", "Prateleira de estudo"],
    ["gm", "Partida modelo GM"],
    ["practice", "Prática direcionada"],
    ["preview", "Prévia"],
  ];

  const set = (patch) => onChange({ ...value, ...patch });
  const setCore = (patch) => set({ coreIdea: { ...value.coreIdea, ...patch } });
  const setConcept = (patch) => set({ conceptPosition: { ...value.conceptPosition, ...patch } });
  const setGm = (patch) => set({ gmModelGame: { ...value.gmModelGame, ...patch } });
  const setPractice = (patch) => set({ targetedPractice: { ...value.targetedPractice, ...patch } });
  const moduleOptions = [
    { value: "", label: "Selecione um módulo" },
    ...modules.map((module) => ({
      value: getId(module),
      label: module.title || module.slug || getId(module),
    })),
  ];

  const updateModule = (moduleId) => {
    const module = modules.find((item) => getId(item) === moduleId);
    set({
      moduleId,
      pathId: module?.pathId || value.pathId,
    });
  };

  const previewLesson = useMemo(() => ({
    ...value,
    textContent: value.coreIdea,
    conceptBoard: {
      ...value.conceptPosition,
      mainLine: value.conceptPosition.moves,
    },
    additionalResources: value.studyShelf,
    modelGame: {
      ...value.gmModelGame,
      guessTheMoveMoments: value.gmModelGame.moments,
    },
    puzzles: value.targetedPractice.customPuzzles,
  }), [value]);

  return (
    <form className="grid gap-5" onSubmit={(event) => { event.preventDefault(); onSave(); }}>
      <div className="flex flex-wrap gap-2">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={[
              "rounded-xl border px-3 py-2 text-xs font-semibold transition",
              tab === id
                ? "border-purple-300/60 bg-purple-400/15 text-white"
                : "border-white/10 bg-white/[0.04] text-slate-400 hover:text-white",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "basic" ? (
        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <SelectInput
              label="Academy module"
              value={value.moduleId}
              onChange={updateModule}
              options={moduleOptions}
            />
            <TextInput label="Title" value={value.title} onChange={(title) => set({ title })} />
            <TextInput label="Slug" value={value.slug} placeholder={slugify(value.title)} onChange={(slug) => set({ slug })} />
            <TextInput label="Subtitle" value={value.subtitle} onChange={(subtitle) => set({ subtitle })} />
            <TextInput label="Theme" value={value.theme} onChange={(theme) => set({ theme })} />
            <TextInput label="Order" type="number" value={value.order} onChange={(order) => set({ order: Number(order) || 1 })} />
            <TextInput label="Estimated minutes" type="number" value={value.estimatedMinutes} onChange={(estimatedMinutes) => set({ estimatedMinutes })} />
            <SelectInput label="Lesson type" value={value.lessonType} onChange={(lessonType) => set({ lessonType })} options={lessonTypes.map(([value, label]) => ({ value, label }))} />
            <SelectInput label="Status" value={value.status} onChange={(status) => set({ status })} options={[{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }, { value: "archived", label: "Archived" }]} />
          </div>
          <TextArea label="Description" value={value.description} onChange={(description) => set({ description })} rows={3} />
          <ListInput label="Tags" value={value.tags} onChange={(tags) => set({ tags })} />
        </div>
      ) : null}

      {tab === "core" ? (
        <div className="grid gap-4">
          <TextInput label="Core idea title" value={value.coreIdea.title} onChange={(title) => setCore({ title })} />
          <TextArea label="Core idea summary" value={value.coreIdea.intro} onChange={(intro) => setCore({ intro })} rows={5} />
          <ListInput label="Key concepts" value={value.coreIdea.keyConcepts} onChange={(keyConcepts) => setCore({ keyConcepts })} />
          <ArrayEditor
            title="Core idea sections"
            items={value.coreIdea.sections}
            emptyItem={() => ({ title: "", body: "" })}
            onChange={(sections) => setCore({ sections })}
            renderItem={(section, updateSection) => (
              <div className="grid gap-3">
                <TextInput label="Title" value={section.title} onChange={(title) => updateSection({ title })} />
                <TextArea label="Body" value={section.body} onChange={(body) => updateSection({ body })} rows={3} />
              </div>
            )}
          />
        </div>
      ) : null}

      {tab === "concept" ? (
        <div className="grid gap-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="grid gap-4">
              <TextInput label="Title" value={value.conceptPosition.title} onChange={(title) => setConcept({ title })} />
              <TextArea label="Description" value={value.conceptPosition.description} onChange={(description) => setConcept({ description })} rows={3} />
              <TextArea label="Initial FEN" value={value.conceptPosition.initialFen} onChange={(initialFen) => setConcept({ initialFen })} rows={2} />
              <SelectInput label="Orientation" value={value.conceptPosition.orientation} onChange={(orientation) => setConcept({ orientation })} options={[{ value: "white", label: "White" }, { value: "black", label: "Black" }]} />
            </div>
            <ReviewBoard
              fen={value.conceptPosition.initialFen || emptyFen}
              orientation={value.conceptPosition.orientation === "black" ? "black" : "white"}
              onMove={() => false}
              neutralHighlightedSquare={value.conceptPosition.moves?.[0]?.highlightSquares?.[0] || null}
            />
          </div>
          <ArrayEditor title="Concept position moves" items={value.conceptPosition.moves} emptyItem={createEmptyMove} onChange={(moves) => setConcept({ moves })} renderItem={(move, updateMove) => <MoveFields item={move} onChange={updateMove} />} />
          <ArrayEditor
            title="Concept variations"
            items={value.conceptPosition.variations}
            emptyItem={() => ({ id: "", label: "", description: "", startFen: "", moves: [] })}
            onChange={(variations) => setConcept({ variations })}
            renderItem={(variation, updateVariation) => (
              <div className="grid gap-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <TextInput label="ID" value={variation.id} onChange={(id) => updateVariation({ id })} />
                  <TextInput label="Label" value={variation.label} onChange={(label) => updateVariation({ label })} />
                </div>
                <TextArea label="Description" value={variation.description} onChange={(description) => updateVariation({ description })} rows={2} />
                <TextArea label="Start FEN" value={variation.startFen} onChange={(startFen) => updateVariation({ startFen })} rows={2} />
                <ArrayEditor title="Variation moves" items={variation.moves} emptyItem={createEmptyMove} onChange={(moves) => updateVariation({ moves })} renderItem={(move, updateMove) => <MoveFields item={move} onChange={updateMove} />} />
              </div>
            )}
          />
          <ArrayEditor
            title="Explanation blocks"
            items={value.conceptPosition.explanationBlocks}
            emptyItem={() => ({ movePly: 0, title: "", text: "" })}
            onChange={(explanationBlocks) => setConcept({ explanationBlocks })}
            renderItem={(block, updateBlock) => (
              <div className="grid gap-3">
                <TextInput label="Move ply" type="number" value={block.movePly} onChange={(movePly) => updateBlock({ movePly: Number(movePly) || 0 })} />
                <TextInput label="Title" value={block.title} onChange={(title) => updateBlock({ title })} />
                <TextArea label="Text" value={block.text} onChange={(text) => updateBlock({ text })} rows={3} />
              </div>
            )}
          />
        </div>
      ) : null}

      {tab === "shelf" ? (
        <ArrayEditor
          title="Study shelf"
          items={value.studyShelf}
          emptyItem={() => ({ type: "article", title: "", author: "", url: "", description: "" })}
          onChange={(studyShelf) => set({ studyShelf })}
          renderItem={(resource, updateResource) => (
            <div className="grid gap-3 md:grid-cols-2">
              <SelectInput label="Type" value={resource.type} onChange={(type) => updateResource({ type })} options={["video", "book", "article", "course", "chapter"].map((type) => ({ value: type, label: type }))} />
              <TextInput label="Title" value={resource.title} onChange={(title) => updateResource({ title })} />
              <TextInput label="Author" value={resource.author} onChange={(author) => updateResource({ author })} />
              <TextInput label="URL" value={resource.url} onChange={(url) => updateResource({ url })} />
              <div className="md:col-span-2">
                <TextArea label="Description" value={resource.description} onChange={(description) => updateResource({ description })} rows={3} />
              </div>
            </div>
          )}
        />
      ) : null}

      {tab === "gm" ? (
        <div className="grid gap-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="grid gap-4 md:grid-cols-2">
              <TextInput label="Game title" value={value.gmModelGame.title} onChange={(title) => setGm({ title })} />
              <TextInput label="White" value={value.gmModelGame.white} onChange={(white) => setGm({ white })} />
              <TextInput label="Black" value={value.gmModelGame.black} onChange={(black) => setGm({ black })} />
              <TextInput label="Event" value={value.gmModelGame.event} onChange={(event) => setGm({ event })} />
              <TextInput label="Year" value={value.gmModelGame.year} onChange={(year) => setGm({ year })} />
              <TextInput label="Result" value={value.gmModelGame.result} onChange={(result) => setGm({ result })} />
              <TextInput label="Theme" value={value.gmModelGame.theme} onChange={(theme) => setGm({ theme })} />
              <TextInput label="Critical move number" type="number" value={value.gmModelGame.criticalMoveNumber} onChange={(criticalMoveNumber) => setGm({ criticalMoveNumber })} />
              <SelectInput label="Orientation" value={value.gmModelGame.orientation} onChange={(orientation) => setGm({ orientation })} options={[{ value: "white", label: "White" }, { value: "black", label: "Black" }]} />
              <div className="md:col-span-2">
                <TextArea label="Start FEN" value={value.gmModelGame.startFen} onChange={(startFen) => setGm({ startFen })} rows={2} />
                <TextArea label="Critical FEN" value={value.gmModelGame.criticalFen} onChange={(criticalFen) => setGm({ criticalFen })} rows={2} />
              </div>
            </div>
            <ReviewBoard
              fen={value.gmModelGame.criticalFen || emptyFen}
              orientation="white"
              onMove={() => false}
            />
          </div>
          <TextArea label="Commentary" value={value.gmModelGame.commentary} onChange={(commentary) => setGm({ commentary })} rows={3} />
          <TextArea label="PGN" value={value.gmModelGame.pgn} onChange={(pgn) => setGm({ pgn })} rows={6} />
            <ArrayEditor
            title="Guess-the-move moments"
            items={value.gmModelGame.moments}
            emptyItem={() => ({ moveNumber: 1, ply: "", title: "", description: "", question: "", answer: "", candidateMoves: [], bestMove: "", fen: "" })}
            onChange={(moments) => setGm({ moments })}
            renderItem={(moment, updateMoment) => (
              <div className="grid gap-3 md:grid-cols-2">
                <TextInput label="Move number" type="number" value={moment.moveNumber} onChange={(moveNumber) => updateMoment({ moveNumber: Number(moveNumber) || 1 })} />
                <TextInput label="Ply" type="number" value={moment.ply} onChange={(ply) => updateMoment({ ply })} />
                <TextInput label="Title" value={moment.title} onChange={(title) => updateMoment({ title })} />
                <TextInput label="Best move" value={moment.bestMove} onChange={(bestMove) => updateMoment({ bestMove })} />
                <TextInput label="FEN" value={moment.fen} onChange={(fen) => updateMoment({ fen })} />
                <ListInput label="Candidate moves" value={moment.candidateMoves} onChange={(candidateMoves) => updateMoment({ candidateMoves })} />
                <div className="md:col-span-2">
                  <TextArea label="Description" value={moment.description} onChange={(description) => updateMoment({ description })} rows={2} />
                  <TextArea label="Question" value={moment.question || moment.prompt} onChange={(question) => updateMoment({ question, prompt: question })} rows={2} />
                  <TextArea label="Answer" value={moment.answer || moment.idea} onChange={(answer) => updateMoment({ answer, idea: answer })} rows={2} />
                </div>
              </div>
            )}
          />
        </div>
      ) : null}

      {tab === "practice" ? (
        <div className="grid gap-4">
          <TextArea label="Practice description" value={value.targetedPractice.description} onChange={(description) => setPractice({ description })} rows={3} />
          <ListInput label="Puzzle refs" value={value.targetedPractice.puzzleRefs} onChange={(puzzleRefs) => setPractice({ puzzleRefs })} />
          <div className="grid gap-4 md:grid-cols-3">
            <ListInput label="Filter themes" value={value.targetedPractice.filters.themes} onChange={(themes) => setPractice({ filters: { ...value.targetedPractice.filters, themes } })} />
            <TextInput label="Min rating" type="number" value={value.targetedPractice.filters.minRating} onChange={(minRating) => setPractice({ filters: { ...value.targetedPractice.filters, minRating } })} />
            <TextInput label="Max rating" type="number" value={value.targetedPractice.filters.maxRating} onChange={(maxRating) => setPractice({ filters: { ...value.targetedPractice.filters, maxRating } })} />
            <TextInput label="Generated count" type="number" value={value.targetedPractice.filters.count} onChange={(count) => setPractice({ filters: { ...value.targetedPractice.filters, count } })} />
          </div>
          <ArrayEditor
            title="Custom puzzles"
            items={value.targetedPractice.customPuzzles}
            emptyItem={() => ({ title: "", fen: "", themes: [], difficulty: "easy", solution: [], explanation: "" })}
            onChange={(customPuzzles) => setPractice({ customPuzzles })}
            renderItem={(puzzle, updatePuzzle) => (
              <div className="grid gap-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <TextInput label="Title" value={puzzle.title} onChange={(title) => updatePuzzle({ title })} />
                  <ListInput label="Themes" value={puzzle.themes?.length ? puzzle.themes : splitList(puzzle.theme)} onChange={(themes) => updatePuzzle({ themes, theme: themes[0] || "" })} />
                  <SelectInput label="Difficulty" value={normalizeDifficulty(puzzle.difficulty)} onChange={(difficulty) => updatePuzzle({ difficulty })} options={puzzleDifficulties.map(([value, label]) => ({ value, label }))} />
                  <ListInput label="Moves / solution" value={puzzle.solution || puzzle.moves} onChange={(solution) => updatePuzzle({ solution, moves: solution })} />
                </div>
                <TextArea label="FEN" value={puzzle.fen} onChange={(fen) => updatePuzzle({ fen })} rows={2} />
                <TextArea label="Explanation" value={puzzle.explanation} onChange={(explanation) => updatePuzzle({ explanation })} rows={3} />
              </div>
            )}
          />
        </div>
      ) : null}

      {tab === "preview" ? (
        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
          <LessonView
            lesson={previewLesson}
            path={selectedPath || { id: "preview-path", title: "Preview Path" }}
            moduleTitle={selectedModule?.title || "Preview Module"}
            previousLesson={null}
            nextLesson={null}
            onBackToPath={() => {}}
            onSelectLesson={() => {}}
          />
        </div>
      ) : null}

      <button type="submit" disabled={saving} className="w-fit rounded-xl bg-purple-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-400 disabled:opacity-60">
        {saving ? "Saving..." : editing ? "Update lesson" : "Create lesson"}
      </button>
    </form>
  );
}

export default function AcademyAdmin() {
  const { t } = useLanguage();
  const [paths, setPaths] = useState([]);
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [pathForm, setPathForm] = useState(createEmptyPath());
  const [moduleForm, setModuleForm] = useState(createEmptyModule());
  const [lessonForm, setLessonForm] = useState(createEmptyLesson());
  const [editingPathId, setEditingPathId] = useState("");
  const [editingModuleId, setEditingModuleId] = useState("");
  const [editingLessonId, setEditingLessonId] = useState("");
  const [activeEditor, setActiveEditor] = useState("path");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const selectedPathId = getId(selectedPath);
  const selectedModuleId = getId(selectedModule);

  const loadPaths = async () => {
    setLoading(true);
    setError("");
    try {
      const nextPaths = await academyAdminApi.listPaths();
      setPaths(nextPaths);
      if (selectedPathId) {
        setSelectedPath(nextPaths.find((path) => getId(path) === selectedPathId) || null);
      }
    } catch (loadError) {
      setError(loadError.message || "Não foi possível carregar as trilhas da Academy.");
    } finally {
      setLoading(false);
    }
  };

  const loadModules = async (pathId) => {
    try {
      const nextModules = await academyAdminApi.listModules(pathId);
      setModules(nextModules);
    } catch (loadError) {
      setError(loadError.message || "Não foi possível carregar os módulos da Academy.");
    }
  };

  const loadLessons = async (moduleId, pathId) => {
    try {
      const nextLessons = await academyAdminApi.listLessons(moduleId, { pathId });
      setLessons(nextLessons);
    } catch (loadError) {
      setError(loadError.message || "Não foi possível carregar as aulas da Academy.");
    }
  };

  useEffect(() => {
    loadPaths();
    loadModules();
    loadLessons();
  }, []);

  const selectPath = async (path) => {
    setSelectedPath(path);
    setSelectedModule(null);
    setModuleForm(createEmptyModule(getId(path)));
    setLessonForm(createEmptyLesson("", getId(path)));
    await loadModules(getId(path));
    await loadLessons(null, getId(path));
  };

  const selectModule = async (module) => {
    setSelectedModule(module);
    const modulePathId = module.pathId || selectedPathId;
    if (modulePathId && selectedPathId !== modulePathId) {
      setSelectedPath(paths.find((path) => getId(path) === modulePathId) || selectedPath);
    }
    setLessonForm(createEmptyLesson(getId(module), modulePathId));
    await loadLessons(getId(module));
  };

  const handleSavePath = async () => {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const payload = buildPathPayload(pathForm);
      const saved = editingPathId
        ? await academyAdminApi.updatePath(editingPathId, payload)
        : await academyAdminApi.createPath(payload);
      setNotice("Trilha salva.");
      setEditingPathId(getId(saved));
      setPathForm(normalizePathForForm(saved));
      await loadPaths();
      await loadModules();
      await loadLessons();
    } catch (saveError) {
      setError(saveError.message || "Não foi possível salvar a trilha.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveModule = async () => {
    if (!selectedPathId && !moduleForm.pathId) {
      setError("Selecione uma trilha antes de salvar um módulo.");
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const payload = buildModulePayload(moduleForm, selectedPathId);
      const saved = editingModuleId
        ? await academyAdminApi.updateModule(editingModuleId, payload)
        : await academyAdminApi.createModule(payload);
      setNotice("Módulo salvo.");
      setEditingModuleId(getId(saved));
      setSelectedModule(saved);
      if (saved.pathId) {
        setSelectedPath(paths.find((path) => getId(path) === saved.pathId) || selectedPath);
      }
      setModuleForm(normalizeModuleForForm(saved, saved.pathId || selectedPathId));
      setLessonForm((current) => ({
        ...current,
        moduleId: getId(saved),
        pathId: saved.pathId || selectedPathId,
      }));
      await loadModules(selectedPathId || saved.pathId);
      await loadLessons(getId(saved));
    } catch (saveError) {
      setError(saveError.message || "Não foi possível salvar o módulo.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLesson = async () => {
    if (!selectedModuleId && !lessonForm.moduleId) {
      setError("Selecione um módulo antes de salvar uma aula.");
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const payload = buildLessonPayload(lessonForm, selectedModuleId, selectedPathId);
      const saved = editingLessonId
        ? await academyAdminApi.updateLesson(editingLessonId, payload)
        : await academyAdminApi.createLesson(payload);
      setNotice("Aula salva.");
      setEditingLessonId(getId(saved));
      setLessonForm(normalizeLessonForForm(saved, saved.moduleId || selectedModuleId, saved.pathId || selectedPathId));
      await loadLessons(saved.moduleId || selectedModuleId);
    } catch (saveError) {
      setError(saveError.message || "Não foi possível salvar a aula.");
    } finally {
      setSaving(false);
    }
  };

  const handleLoadFullPath = async () => {
    if (!selectedPathId) return;

    setLoading(true);
    setError("");
    setNotice("");
    try {
      const fullPath = await academyAdminApi.getFullPath(selectedPathId);
      setSelectedPath(fullPath.path || selectedPath);
      const nextModules = asArray(fullPath.modules);
      setModules(nextModules);

      if (selectedModuleId) {
        const nextSelectedModule =
          nextModules.find((module) => getId(module) === selectedModuleId) || null;
        setSelectedModule(nextSelectedModule);
        setLessons(asArray(nextSelectedModule?.lessons));
      }

      setNotice("Trilha completa carregada.");
    } catch (loadError) {
      setError(loadError.message || "Não foi possível carregar a trilha completa da Academy.");
    } finally {
      setLoading(false);
    }
  };

  const deleteEntity = async (type, item) => {
    const id = getId(item);
    if (!id || !window.confirm(`Excluir ${item.title || "este item"}?`)) return;
    setError("");
    setNotice("");
    try {
      if (type === "path") {
        await academyAdminApi.deletePath(id);
        if (selectedPathId === id) {
          setSelectedPath(null);
          setSelectedModule(null);
          setModules([]);
          setLessons([]);
        }
        await loadPaths();
      }
      if (type === "module") {
        await academyAdminApi.deleteModule(id);
        if (selectedModuleId === id) {
          setSelectedModule(null);
          setLessons([]);
        }
        await loadModules(selectedPathId);
      }
      if (type === "lesson") {
        await academyAdminApi.deleteLesson(id);
        await loadLessons(selectedModuleId);
      }
      setNotice("Excluído.");
    } catch (deleteError) {
      setError(deleteError.message || "Não foi possível excluir o item.");
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-[1800px] flex-col gap-6">
      <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,rgba(18,12,32,0.96),rgba(9,12,18,0.98))] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.28)]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-300">
          {t("academyAdmin.eyebrow", "Content operations")}
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-white">
          {t("academyAdmin.title", "Academy Admin")}
        </h1>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-400">
          {t("academyAdmin.subtitle", "Create paths, modules, and backend-ready lessons with concept boards, study shelves, GM games, and targeted practice.")}
        </p>
      </div>

      {error ? <p className="rounded-2xl border border-rose-300/25 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">{error}</p> : null}
      {notice ? <p className="rounded-2xl border border-emerald-300/25 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100">{notice}</p> : null}
      {loading ? <p className="text-sm text-slate-400">Carregando conteúdo da Academy...</p> : null}

      <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="grid content-start gap-4">
          <EntityList
            title="Trilhas"
            items={paths}
            selectedId={selectedPathId}
            onSelect={selectPath}
            onCreate={() => {
              setActiveEditor("path");
              setEditingPathId("");
              setPathForm(createEmptyPath());
            }}
            onEdit={(path) => {
              setActiveEditor("path");
              setEditingPathId(getId(path));
              setPathForm(normalizePathForForm(path));
            }}
            onDelete={(path) => deleteEntity("path", path)}
            emptyLabel="Nenhuma trilha ainda."
          />
          <EntityList
            title="Módulos"
            items={modules}
            selectedId={selectedModuleId}
            onSelect={selectModule}
            onCreate={() => {
              setActiveEditor("module");
              setEditingModuleId("");
              setModuleForm(createEmptyModule(selectedPathId));
            }}
            onEdit={(module) => {
              setActiveEditor("module");
              setEditingModuleId(getId(module));
              setModuleForm(normalizeModuleForForm(module, selectedPathId));
            }}
            onDelete={(module) => deleteEntity("module", module)}
            emptyLabel={selectedPathId ? "Nenhum módulo nesta trilha." : "Selecione uma trilha primeiro."}
          />
          <EntityList
            title="Aulas"
            items={lessons}
            selectedId={editingLessonId}
            onSelect={(lesson) => {
              setActiveEditor("lesson");
              setEditingLessonId(getId(lesson));
              setLessonForm(normalizeLessonForForm(lesson, selectedModuleId, selectedPathId));
            }}
            onCreate={() => {
              setActiveEditor("lesson");
              setEditingLessonId("");
              setLessonForm(createEmptyLesson(selectedModuleId, selectedPathId));
            }}
            onEdit={(lesson) => {
              setActiveEditor("lesson");
              setEditingLessonId(getId(lesson));
              setLessonForm(normalizeLessonForForm(lesson, selectedModuleId, selectedPathId));
            }}
            onDelete={(lesson) => deleteEntity("lesson", lesson)}
            emptyLabel={selectedModuleId ? "Nenhuma aula neste módulo." : "Selecione um módulo primeiro."}
          />
        </div>

        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-5">
          <div className="mb-5 flex flex-wrap gap-2">
            {["path", "module", "lesson"].map((editor) => (
              <button
                key={editor}
                type="button"
                onClick={() => setActiveEditor(editor)}
                className={[
                  "rounded-xl border px-4 py-2 text-sm font-semibold capitalize transition",
                  activeEditor === editor
                    ? "border-purple-300/60 bg-purple-400/15 text-white"
                    : "border-white/10 bg-white/[0.04] text-slate-400 hover:text-white",
                ].join(" ")}
              >
                {editor}
              </button>
            ))}
            <button
              type="button"
              disabled={!selectedPathId}
              onClick={handleLoadFullPath}
              className="rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Load full path
            </button>
          </div>

          {activeEditor === "path" ? (
            <PathForm value={pathForm} onChange={setPathForm} onSave={handleSavePath} saving={saving} editing={Boolean(editingPathId)} />
          ) : null}

          {activeEditor === "module" ? (
            <ModuleForm
              value={moduleForm}
              onChange={setModuleForm}
              onSave={handleSaveModule}
              saving={saving}
              editing={Boolean(editingModuleId)}
              paths={paths}
            />
          ) : null}

          {activeEditor === "lesson" ? (
            <LessonForm
              value={lessonForm}
              onChange={setLessonForm}
              onSave={handleSaveLesson}
              saving={saving}
              editing={Boolean(editingLessonId)}
              selectedPath={selectedPath}
              selectedModule={selectedModule}
              modules={modules}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
