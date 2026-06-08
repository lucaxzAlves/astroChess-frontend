import { useLanguage } from "../../contexts/LanguageContext.jsx";
import AcademyConceptBoard from "./AcademyConceptBoard.jsx";
import AcademyPracticeBoard from "./AcademyPracticeBoard.jsx";
import ModelGameCard from "./ModelGameCard.jsx";
import ResourceCard from "./ResourceCard.jsx";

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function SectionTitle({ eyebrow, title, description }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-200/80">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
      {description ? (
        <p className="mt-2 max-h-28 max-w-3xl overflow-y-auto pr-2 text-sm leading-6 text-slate-400 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.35)_transparent]">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function MobileLessonSectionTitle({ eyebrow, title, description }) {
  return (
    <div className="px-1">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-cyan-100/80">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-xl font-semibold text-white">{title}</h2>
      {description ? <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p> : null}
    </div>
  );
}

function MobileLessonHeader({
  lesson,
  path,
  moduleTitle,
  previousLesson,
  nextLesson,
  onBackToPath,
  onSelectLesson,
  t,
}) {
  const progress = lesson.progress || 0;
  const estimatedTime = lesson.estimatedTime || lesson.duration || lesson.estimatedDuration || "15 min";
  const difficulty = lesson.difficulty || lesson.level || path?.level || "Academy";

  return (
    <header className="rounded-[28px] border border-purple-300/20 bg-[radial-gradient(circle_at_88%_0%,rgba(168,85,247,0.16),transparent_34%),linear-gradient(145deg,rgba(18,18,31,0.96),rgba(8,8,17,0.98))] p-5">
      <button
        type="button"
        onClick={onBackToPath}
        className="min-h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-200"
      >
        {t("academy.backToPath")}
      </button>
      <p className="mt-5 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-cyan-100/80">
        {t(`academy.path.${path.id}.title`, path.title)}
      </p>
      <h1 className="mt-2 text-2xl font-semibold leading-tight text-white">
        {t(`academy.lesson.${lesson.id}.title`, lesson.title)}
      </h1>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        {t(`academy.module.${lesson.moduleId}.title`, moduleTitle)}
      </p>

      <div className="mt-5 grid grid-cols-1 gap-2 min-[380px]:grid-cols-3">
        {[
          ["Difficulty", difficulty],
          ["Time", estimatedTime],
          ["Progress", `${progress}%`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-slate-950/45 p-3">
            <p className="text-[9px] uppercase tracking-[0.16em] text-slate-500">{label}</p>
            <p className="mt-1 truncate text-xs font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          disabled={!previousLesson}
          onClick={() => previousLesson && onSelectLesson(previousLesson.id)}
          className="min-h-11 flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-slate-200 disabled:opacity-40"
        >
          {t("academy.previousLesson")}
        </button>
        <button
          type="button"
          disabled={!nextLesson}
          onClick={() => nextLesson && onSelectLesson(nextLesson.id)}
          className="min-h-11 flex-1 rounded-2xl border border-violet-200/25 bg-violet-300/12 px-3 py-2 text-sm font-semibold text-violet-100 disabled:opacity-40"
        >
          {t("academy.nextLesson")}
        </button>
      </div>
    </header>
  );
}

function MobileLessonNavigator({ items }) {
  return (
    <nav className="sticky top-[4.25rem] z-20 -mx-1 overflow-x-auto border-y border-purple-300/14 bg-[#070711]/92 px-1 py-2 backdrop-blur-xl [scrollbar-width:none] md:hidden">
      <div className="flex gap-2">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="min-h-10 shrink-0 rounded-full border border-purple-300/18 bg-slate-950/70 px-3 py-2 text-xs font-semibold text-slate-200"
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

function MobileCoreIdea({ content, t }) {
  return (
    <article id="academy-lesson-core" className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
      <MobileLessonSectionTitle
        eyebrow={t("academy.lessonText")}
        title={t("academy.coreIdea")}
        description={t("academy.coreIdeaDescription")}
      />
      <div className="mt-5 grid gap-5">
        {content.intro ? (
          <p className="text-[1.02rem] leading-8 text-slate-100">{content.intro}</p>
        ) : null}
        {asArray(content.sections).map((section) => (
          <section key={section.title} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <h3 className="text-lg font-semibold text-white">{section.title}</h3>
            <p className="mt-3 text-[0.95rem] leading-7 text-slate-300">{section.body}</p>
          </section>
        ))}
        {asArray(content.keyConcepts).length ? (
          <div className="flex flex-wrap gap-2">
            {content.keyConcepts.map((concept) => (
              <span
                key={concept}
                className="rounded-full border border-violet-200/20 bg-violet-200/[0.07] px-3 py-1.5 text-xs font-semibold text-violet-100"
              >
                {concept}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function MobileStudyShelf({ resources = [], t }) {
  return (
    <section id="academy-lesson-resources" className="grid gap-4">
      <MobileLessonSectionTitle
        eyebrow={t("academy.additionalResources")}
        title={t("academy.studyShelf")}
        description={t("academy.studyShelfDescription")}
      />
      {resources.length ? (
        <div className="academy-mobile-carousel overflow-x-auto pb-2">
          <div className="flex snap-x gap-3">
            {resources.map((resource) => (
              <div key={`${resource.type}-${resource.title}`} className="w-[min(74vw,310px)] shrink-0 snap-start">
                <ResourceCard resource={resource} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5 text-sm text-slate-400">
          Nenhum recurso cadastrado para esta aula ainda.
        </div>
      )}
    </section>
  );
}

function MobileModelGame({ modelGame, t }) {
  if (!modelGame) return null;
  return (
    <section id="academy-lesson-gm" className="grid gap-4">
      <MobileLessonSectionTitle eyebrow={t("academy.gmModelGame")} title={`${modelGame.white} vs ${modelGame.black}`} />
      <article className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-violet-200/20 bg-violet-200/[0.07] px-3 py-1 text-xs font-semibold text-violet-100">
            {modelGame.theme}
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-300">
            {modelGame.event}, {modelGame.year} · {modelGame.result}
          </span>
        </div>
        <p className="mt-4 text-sm leading-7 text-slate-300">{modelGame.commentary}</p>
        <details className="mt-4 rounded-2xl border border-white/10 bg-slate-950/45 p-4">
          <summary className="min-h-11 cursor-pointer text-sm font-semibold text-white">
            {t("academy.pgnPreview")}
          </summary>
          <p className="mt-3 max-h-40 overflow-y-auto break-words pr-2 font-mono text-xs leading-6 text-slate-400 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.35)_transparent]">
            {modelGame.pgn}
          </p>
        </details>
        <div className="mt-4 grid gap-3">
          {asArray(modelGame.guessTheMoveMoments).map((moment) => (
            <details
              key={`${moment.moveNumber}-${moment.bestMove}`}
              className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
            >
              <summary className="min-h-11 cursor-pointer text-sm font-semibold text-white">
                {t("academy.moveToMove", undefined, {
                  move: moment.moveNumber,
                  side: moment.sideToMove,
                })}
              </summary>
              <p className="mt-3 text-sm leading-6 text-slate-300">{moment.prompt}</p>
              <p className="mt-3 text-sm font-semibold text-emerald-100">{moment.bestMove}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">{moment.idea}</p>
            </details>
          ))}
        </div>
      </article>
    </section>
  );
}

function MobileLessonProgress({ lesson, content }) {
  const sections = [
    content.intro,
    asArray(content.sections).length,
    lesson.conceptBoard,
    asArray(lesson.additionalResources).length,
    lesson.modelGame,
    asArray(lesson.puzzles).length,
  ];
  const completed = sections.filter(Boolean).length;
  const total = sections.length;
  const progress = Math.round((completed / total) * 100);

  return (
    <section id="academy-lesson-progress" className="rounded-[28px] border border-purple-300/20 bg-purple-500/[0.06] p-5">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-cyan-100/80">Lesson Progress</p>
      <h2 className="mt-2 text-xl font-semibold text-white">{progress}% estruturado</h2>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-950/70">
        <div className="h-full rounded-full bg-gradient-to-r from-purple-400 to-cyan-300" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-3">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Sections</p>
          <p className="mt-1 text-lg font-semibold text-white">{completed}/{total}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-3">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Time left</p>
          <p className="mt-1 text-lg font-semibold text-white">{lesson.estimatedTime || "10 min"}</p>
        </div>
      </div>
    </section>
  );
}

function MobileLessonExperience(props) {
  const { lesson, path, moduleTitle, previousLesson, nextLesson, onBackToPath, onSelectLesson } = props;
  const { t } = useLanguage();
  const content = lesson.textContent || {};
  const navItems = [
    ["academy-lesson-core", "Core"],
    lesson.conceptBoard ? ["academy-lesson-board", "Board"] : null,
    asArray(lesson.additionalResources).length ? ["academy-lesson-resources", "Resources"] : null,
    lesson.modelGame ? ["academy-lesson-gm", "GM"] : null,
    ["academy-lesson-puzzles", "Puzzles"],
    ["academy-lesson-progress", "Progress"],
  ].filter(Boolean).map(([id, label]) => ({ id, label }));

  return (
    <div className="mx-auto grid w-full max-w-[460px] min-w-0 gap-5 pb-8 md:hidden">
      <MobileLessonHeader
        lesson={lesson}
        path={path}
        moduleTitle={moduleTitle}
        previousLesson={previousLesson}
        nextLesson={nextLesson}
        onBackToPath={onBackToPath}
        onSelectLesson={onSelectLesson}
        t={t}
      />
      <MobileLessonNavigator items={navItems} />
      <MobileCoreIdea content={content} t={t} />
      {lesson.conceptBoard ? <AcademyConceptBoard conceptBoard={lesson.conceptBoard} /> : null}
      <MobileStudyShelf resources={lesson.additionalResources || []} t={t} />
      <MobileModelGame modelGame={lesson.modelGame} t={t} />
      <section id="academy-lesson-puzzles" className="grid gap-4">
        <MobileLessonSectionTitle
          eyebrow={t("academy.relatedPuzzles")}
          title={t("academy.targetedPractice")}
          description={t("academy.targetedPracticeDescription")}
        />
        <AcademyPracticeBoard puzzles={lesson.puzzles || []} />
      </section>
      <MobileLessonProgress lesson={lesson} content={content} />
    </div>
  );
}

export default function LessonView({
  lesson,
  path,
  moduleTitle,
  previousLesson,
  nextLesson,
  onBackToPath,
  onSelectLesson,
}) {
  const { t } = useLanguage();
  const content = lesson.textContent || {};

  return (
    <>
    <MobileLessonExperience
      lesson={lesson}
      path={path}
      moduleTitle={moduleTitle}
      previousLesson={previousLesson}
      nextLesson={nextLesson}
      onBackToPath={onBackToPath}
      onSelectLesson={onSelectLesson}
    />
    <div className="hidden gap-6 md:grid">
      <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(49,46,129,0.12),rgba(255,255,255,0.035),rgba(15,23,42,0.36))] p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <button
              type="button"
              onClick={onBackToPath}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-purple-300/35 hover:text-white"
            >
              {t("academy.backToPath")}
            </button>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-violet-200/80">
              {t(`academy.path.${path.id}.title`, path.title)} ·{" "}
              {t(`academy.module.${lesson.moduleId}.title`, moduleTitle)}
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white">
              {t(`academy.lesson.${lesson.id}.title`, lesson.title)}
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              {t(`academy.lesson.${lesson.id}.theme`, lesson.theme)}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={!previousLesson}
              onClick={() => previousLesson && onSelectLesson(previousLesson.id)}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-purple-300/35 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("academy.previousLesson")}
            </button>
            <button
              type="button"
              disabled={!nextLesson}
              onClick={() => nextLesson && onSelectLesson(nextLesson.id)}
              className="rounded-xl border border-violet-200/25 bg-violet-300/12 px-4 py-2 text-sm font-semibold text-violet-100 transition hover:border-violet-200/40 hover:bg-violet-300/18 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("academy.nextLesson")}
            </button>
          </div>
        </div>
      </div>

      <article className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
        <SectionTitle
          eyebrow={t("academy.lessonText")}
          title={t("academy.coreIdea")}
          description={t("academy.coreIdeaDescription")}
        />

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.34fr]">
          <div className="max-h-[34rem] overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/40 p-5 pr-3 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.35)_transparent]">
            <p className="text-base leading-8 text-slate-200">{content.intro}</p>
            <div className="mt-6 grid gap-4">
              {(content.sections || []).map((section) => (
                <section key={section.title}>
                  <h3 className="text-lg font-semibold text-white">{section.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-400">{section.body}</p>
                </section>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-violet-200/15 bg-violet-200/[0.045] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-100/80">
              {t("academy.keyConcepts")}
            </p>
            <div className="mt-4 flex max-h-56 flex-wrap gap-2 overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.35)_transparent]">
              {(content.keyConcepts || []).map((concept) => (
                <span
                  key={concept}
                  className="rounded-full border border-violet-200/20 bg-violet-200/[0.07] px-3 py-1 text-xs font-medium text-violet-100"
                >
                  {concept}
                </span>
              ))}
            </div>
          </div>
        </div>
      </article>

      {lesson.conceptBoard ? (
        <AcademyConceptBoard conceptBoard={lesson.conceptBoard} />
      ) : null}

      <section className="grid gap-4">
        <SectionTitle
          eyebrow={t("academy.additionalResources")}
          title={t("academy.studyShelf")}
          description={t("academy.studyShelfDescription")}
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(lesson.additionalResources || []).map((resource) => (
            <ResourceCard key={`${resource.type}-${resource.title}`} resource={resource} />
          ))}
        </div>
      </section>

      <ModelGameCard modelGame={lesson.modelGame} />

      <section className="grid gap-4">
        <SectionTitle
          eyebrow={t("academy.relatedPuzzles")}
          title={t("academy.targetedPractice")}
          description={t("academy.targetedPracticeDescription")}
        />
        <AcademyPracticeBoard puzzles={lesson.puzzles || []} />
      </section>
    </div>
    </>
  );
}
