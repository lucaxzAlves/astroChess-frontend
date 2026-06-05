import { useLanguage } from "../../contexts/LanguageContext.jsx";
import AcademyConceptBoard from "./AcademyConceptBoard.jsx";
import AcademyPracticeBoard from "./AcademyPracticeBoard.jsx";
import ModelGameCard from "./ModelGameCard.jsx";
import ResourceCard from "./ResourceCard.jsx";

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
    <div className="grid gap-6">
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
  );
}
