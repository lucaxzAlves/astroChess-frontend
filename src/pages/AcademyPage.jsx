import { useEffect, useMemo, useState } from "react";
import LearningPathCard from "../components/academy/LearningPathCard.jsx";
import LessonView from "../components/academy/LessonView.jsx";
import PathTimeline from "../components/academy/PathTimeline.jsx";
import { useLanguage } from "../contexts/LanguageContext.jsx";
import { getPathLessonList, learningPaths } from "../data/mockAcademy.js";
import { academyAdminApi } from "../services/academyAdminApi.js";
import { getUserFriendlyError } from "../utils/userFriendlyErrors.js";

function getId(item) {
  return item?._id || item?.id || "";
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function weeksToDuration(weeks) {
  const value = Number(weeks);
  if (!Number.isFinite(value) || value <= 0) return "";
  return `${value} ${value === 1 ? "week" : "weeks"}`;
}

function formatLabel(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizeApiLesson(lesson, module, path) {
  const id = getId(lesson);
  const coreIdea = lesson.coreIdea || {};
  const conceptPosition = lesson.conceptPosition || {};
  const gmModelGame = lesson.gmModelGame || {};
  const targetedPractice = lesson.targetedPractice || {};

  return {
    ...lesson,
    id,
    moduleId: getId(module),
    moduleTitle: module?.title || "",
    pathId: getId(path),
    theme: lesson.theme || asArray(lesson.keyConcepts)[0] || lesson.lessonType || "",
    textContent: {
      intro: coreIdea.summary || "",
      keyConcepts: asArray(lesson.keyConcepts),
      sections: asArray(coreIdea.sections).map((section) => ({
        title: section.title || section.heading || "",
        body: section.body || "",
      })),
    },
    conceptBoard: conceptPosition.fen
      ? {
          title: conceptPosition.title,
          description: conceptPosition.description,
          initialFen: conceptPosition.fen,
          orientation: conceptPosition.orientation || "white",
          mainLine: asArray(conceptPosition.moves).map((move, index) => ({
            ...move,
            ply: move.ply || index + 1,
          })),
          variations: asArray(conceptPosition.variations).map((variation, index) => ({
            id: variation.id || variation.name || `variation-${index + 1}`,
            label: variation.label || variation.name || `Variation ${index + 1}`,
            description: variation.description || variation.explanation || "",
            startFen: variation.startFen || conceptPosition.fen,
            moves: asArray(variation.moves).map((move, moveIndex) =>
              typeof move === "string"
                ? {
                    ply: moveIndex + 1,
                    san: move,
                    comment: variation.explanation || "",
                    highlightSquares: [],
                    arrows: [],
                  }
                : move,
            ),
          })),
          explanationBlocks: asArray(conceptPosition.explanationBlocks),
        }
      : null,
    additionalResources: asArray(lesson.studyShelf),
    modelGame: gmModelGame?.white || gmModelGame?.black
      ? {
          white: gmModelGame.white,
          black: gmModelGame.black,
          event: gmModelGame.event,
          year: gmModelGame.year,
          result: gmModelGame.result,
          pgn: gmModelGame.pgn,
          theme: gmModelGame.title || gmModelGame.theme || "Model game",
          commentary: gmModelGame.explanation || gmModelGame.commentary || "",
          guessTheMoveMoments: asArray(gmModelGame.moments).map((moment) => ({
            moveNumber: moment.moveNumber,
            sideToMove: moment.sideToMove || "",
            prompt: moment.question || moment.description || "",
            bestMove: moment.bestMove || moment.answer || "",
            idea: moment.answer || moment.description || "",
          })),
        }
      : null,
    puzzles: asArray(targetedPractice.customPuzzles).map((puzzle, index) => ({
      id: puzzle.id || `${id}-puzzle-${index + 1}`,
      fen: puzzle.fen,
      theme: asArray(puzzle.themes)[0] || "",
      difficulty: formatLabel(puzzle.difficulty || "easy"),
      solution: asArray(puzzle.moves || puzzle.solution),
      explanation: puzzle.explanation || "",
    })),
  };
}

function normalizeApiModule(module, path) {
  return {
    ...module,
    id: getId(module),
    pathId: getId(path),
    lessons: asArray(module.lessons).map((lesson) => normalizeApiLesson(lesson, module, path)),
  };
}

function normalizeApiPath(path, modules = null) {
  const id = getId(path);
  const normalizedModules = modules ? asArray(modules).map((module) => normalizeApiModule(module, path)) : [];

  return {
    ...path,
    id,
    level: formatLabel(path.level),
    theme: formatLabel(path.category),
    estimatedDuration: weeksToDuration(path.durationWeeks) || path.estimatedDuration || "",
    progress: path.progress || 0,
    modules: normalizedModules,
    moduleCount: path.moduleCount ?? normalizedModules.length,
    lessonCount: path.lessonCount,
    source: "api",
  };
}

function mergeAcademyPaths(apiPaths) {
  const normalizedMocks = learningPaths.map((path) => ({ ...path, source: "mock" }));
  const apiIds = new Set(apiPaths.map((path) => path.id));
  return [
    ...apiPaths,
    ...normalizedMocks.filter((path) => !apiIds.has(path.id)),
  ];
}

function HeaderStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function AcademyHeader({ onBackToPractice, stats }) {
  const { t } = useLanguage();

  const openAdmin = () => {
    window.history.pushState({}, "", "/academy-admin");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.94),rgba(12,14,22,0.98))] p-6 shadow-[0_18px_48px_rgba(0,0,0,0.24)] sm:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.10),transparent_35%)]" />
      <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <button
            type="button"
            onClick={onBackToPractice}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-purple-300/35 hover:text-white"
          >
            {t("academy.backToPractice")}
          </button>
          <button
            type="button"
            onClick={openAdmin}
            className="ml-3 rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2 text-xs font-semibold text-slate-500 transition hover:border-purple-300/30 hover:text-purple-100"
          >
            {t("academy.adminAccess")}
          </button>
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-violet-200/80">
            {t("academy.structuredLearning")}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {t("academy.title")}
          </h1>
          <p className="mt-4 max-h-32 overflow-y-auto pr-2 text-sm leading-7 text-slate-300 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.35)_transparent] sm:text-base">
            {t("academy.subtitle")}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
          <HeaderStat label={t("academy.paths")} value={stats.paths} />
          <HeaderStat label={t("academy.modules")} value={stats.modules} />
          <HeaderStat label={t("academy.lessons")} value={stats.lessons} />
        </div>
      </div>
    </div>
  );
}

function PathOverview({ path, onBackToPaths, onSelectLesson, selectedLessonId }) {
  const { t } = useLanguage();
  const pathTitle = t(`academy.path.${path.id}.title`, path.title);
  const pathDescription = t(`academy.path.${path.id}.description`, path.description);
  const pathLevel = t(`academy.path.${path.id}.level`, path.level);
  const pathTheme = t(`academy.path.${path.id}.theme`, path.theme);
  const pathDuration = t(`academy.path.${path.id}.duration`, path.estimatedDuration);

  return (
    <div className="grid gap-6">
      <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <button
              type="button"
              onClick={onBackToPaths}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-purple-300/35 hover:text-white"
            >
              {t("academy.backToPaths")}
            </button>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-violet-200/80">
              {pathTheme} · {pathLevel}
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-white">{pathTitle}</h2>
            <p className="mt-3 max-h-36 max-w-4xl overflow-y-auto pr-2 text-sm leading-7 text-slate-400 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.35)_transparent]">
              {pathDescription}
            </p>
          </div>
          <div className="grid min-w-full gap-3 sm:min-w-[360px] sm:grid-cols-3 lg:grid-cols-1">
            <HeaderStat label={t("academy.duration")} value={pathDuration} />
            <HeaderStat label={t("academy.modules")} value={path.modules?.length || 0} />
            <HeaderStat label={t("academy.progress")} value={`${path.progress || 0}%`} />
          </div>
        </div>
      </div>

      <PathTimeline
        path={path}
        selectedLessonId={selectedLessonId}
        onSelectLesson={onSelectLesson}
      />
    </div>
  );
}

export default function AcademyPage({ onBackToPractice }) {
  const { t } = useLanguage();
  const [selectedPathId, setSelectedPathId] = useState(null);
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [apiPaths, setApiPaths] = useState([]);
  const [fullApiPaths, setFullApiPaths] = useState({});
  const [loadingApiPaths, setLoadingApiPaths] = useState(false);
  const [academyApiError, setAcademyApiError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadApiPaths() {
      setLoadingApiPaths(true);
      setAcademyApiError("");
      try {
        const paths = await academyAdminApi.listPaths();
        if (!cancelled) {
          setApiPaths(paths.map((path) => normalizeApiPath(path)));
        }
      } catch (error) {
        if (!cancelled) {
          setAcademyApiError(getUserFriendlyError(error, "Não foi possível carregar os conteúdos da Academy."));
        }
      } finally {
        if (!cancelled) setLoadingApiPaths(false);
      }
    }

    loadApiPaths();

    return () => {
      cancelled = true;
    };
  }, []);

  const academyPaths = useMemo(() => mergeAcademyPaths(apiPaths), [apiPaths]);

  const selectedPath = useMemo(
    () => {
      if (!selectedPathId) return null;
      return fullApiPaths[selectedPathId] || academyPaths.find((path) => path.id === selectedPathId) || null;
    },
    [academyPaths, fullApiPaths, selectedPathId]
  );
  const lessons = useMemo(() => getPathLessonList(selectedPath), [selectedPath]);
  const selectedLessonIndex = lessons.findIndex((lesson) => lesson.id === selectedLessonId);
  const selectedLesson = selectedLessonIndex >= 0 ? lessons[selectedLessonIndex] : null;
  const previousLesson = selectedLessonIndex > 0 ? lessons[selectedLessonIndex - 1] : null;
  const nextLesson =
    selectedLessonIndex >= 0 && selectedLessonIndex < lessons.length - 1
      ? lessons[selectedLessonIndex + 1]
      : null;

  const stats = useMemo(
    () => ({
      paths: academyPaths.length,
      modules: academyPaths.reduce((sum, path) => sum + (path.modules?.length || path.moduleCount || 0), 0),
      lessons: academyPaths.reduce(
        (sum, path) =>
          sum +
          (path.modules || []).reduce(
            (moduleSum, module) => moduleSum + (module.lessons?.length || 0),
            0,
          ) +
          (!path.modules?.length && path.lessonCount ? path.lessonCount : 0),
        0,
      ),
    }),
    [academyPaths],
  );

  const handleOpenPath = async (pathId) => {
    setSelectedPathId(pathId);
    setSelectedLessonId(null);

    const path = academyPaths.find((item) => item.id === pathId);
    if (path?.source !== "api" || fullApiPaths[pathId]) return;

    try {
      const fullPath = await academyAdminApi.getFullPath(pathId);
      const normalized = normalizeApiPath(fullPath.path || path, fullPath.modules || []);
      setFullApiPaths((current) => ({ ...current, [pathId]: normalized }));
    } catch (error) {
      setAcademyApiError(getUserFriendlyError(error, "Não foi possível carregar essa trilha da Academy."));
    }
  };

  const handleBackToPaths = () => {
    setSelectedPathId(null);
    setSelectedLessonId(null);
  };

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <AcademyHeader onBackToPractice={onBackToPractice} stats={stats} />

      {loadingApiPaths ? (
        <p className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-400">
          {t("academy.loadingApiContent")}
        </p>
      ) : null}

      {academyApiError ? (
        <p className="rounded-2xl border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
          {academyApiError} {t("academy.mockFallbackNotice")}
        </p>
      ) : null}

      {!selectedPath ? (
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {academyPaths.map((path) => (
            <LearningPathCard
              key={path.id}
              path={path}
              onOpen={() => handleOpenPath(path.id)}
            />
          ))}
        </div>
      ) : selectedLesson ? (
        <LessonView
          lesson={selectedLesson}
          path={selectedPath}
          moduleTitle={selectedLesson.moduleTitle}
          previousLesson={previousLesson}
          nextLesson={nextLesson}
          onBackToPath={() => setSelectedLessonId(null)}
          onSelectLesson={setSelectedLessonId}
        />
      ) : (
        <PathOverview
          path={selectedPath}
          selectedLessonId={selectedLessonId}
          onBackToPaths={handleBackToPaths}
          onSelectLesson={setSelectedLessonId}
        />
      )}
    </section>
  );
}
