import { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext.jsx";

function getLessonState(index, completedCount) {
  if (index < completedCount) return "completed";
  if (index === completedCount) return "current";
  return "locked";
}

function StateBadge({ state }) {
  const { t } = useLanguage();
  const styles = {
    completed: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
    current: "border-violet-300/25 bg-violet-300/[0.08] text-violet-100",
    locked: "border-white/10 bg-white/[0.04] text-slate-400",
  };

  return (
    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${styles[state]}`}>
      {t(`academy.${state}`)}
    </span>
  );
}

export default function PathTimeline({ path, selectedLessonId, onSelectLesson }) {
  const { t } = useLanguage();
  const [expandedModuleIds, setExpandedModuleIds] = useState([]);
  const lessons = (path.modules || []).flatMap((module) => module.lessons || []);
  const completedCount = Math.min(
    lessons.length - 1,
    Math.max(0, Math.floor(((path.progress || 0) / 100) * lessons.length))
  );
  let lessonIndex = -1;

  const toggleModule = (moduleId) => {
    setExpandedModuleIds((current) =>
      current.includes(moduleId)
        ? current.filter((id) => id !== moduleId)
        : [...current, moduleId],
    );
  };

  return (
    <div className="grid gap-5">
      {(path.modules || []).map((module) => {
        const moduleLessons = module.lessons || [];
        const moduleStartIndex = lessonIndex + 1;
        const expanded = expandedModuleIds.includes(module.id);
        const completedInModule = moduleLessons.filter((_, localIndex) =>
          getLessonState(moduleStartIndex + localIndex, completedCount) === "completed",
        ).length;
        const moduleProgress = moduleLessons.length
          ? Math.round((completedInModule / moduleLessons.length) * 100)
          : 0;
        const moduleDescription = t(
          `academy.module.${module.id}.description`,
          module.shortDescription || module.summary || module.description,
        );
        lessonIndex += moduleLessons.length;

        return (
          <section key={module.id} className="relative rounded-[28px] border border-white/10 bg-white/[0.035] p-5">
            {expanded ? (
              <div className="absolute bottom-6 left-8 top-28 w-px bg-gradient-to-b from-violet-300/28 via-white/10 to-transparent" />
            ) : null}
            <button
              type="button"
              onClick={() => toggleModule(module.id)}
              aria-expanded={expanded}
              className="group relative z-10 w-full cursor-pointer rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-violet-300/35 hover:bg-violet-400/[0.055] hover:shadow-[0_18px_44px_rgba(88,28,135,0.16)] focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300/70"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-200/80">
                    {t("academy.modules")} {module.order}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-white">
                    {t(`academy.module.${module.id}.title`, module.title)}
                  </h3>
                  <p
                    className="mt-2 max-w-3xl text-sm leading-6 text-slate-400"
                    style={
                      expanded
                        ? undefined
                        : {
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }
                    }
                  >
                    {moduleDescription}
                  </p>
                </div>
                <div className="flex min-w-[210px] items-start justify-between gap-3 lg:justify-end">
                  <div className="grid gap-2 text-sm">
                    <span className="rounded-full border border-white/10 bg-slate-950/45 px-3 py-1 text-xs font-medium text-slate-300">
                      {t("academy.lessonCount", undefined, { count: moduleLessons.length })}
                    </span>
                    <span className="rounded-full border border-purple-300/20 bg-purple-300/[0.08] px-3 py-1 text-xs font-medium text-purple-100">
                      {module.estimatedDuration || module.duration || "Duração a definir"}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 transition group-hover:text-purple-100">
                      {expanded ? "Recolher módulo" : "Expandir módulo"}
                    </span>
                  </div>
                  <span
                    aria-hidden="true"
                    className={[
                      "grid h-10 w-10 shrink-0 place-items-center rounded-full border border-purple-300/20 bg-purple-300/[0.08] text-lg text-purple-100 transition duration-200",
                      expanded ? "rotate-180" : "",
                    ].join(" ")}
                  >
                    ˅
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Progresso do módulo</span>
                  <span>{moduleProgress}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-300/70 to-cyan-200/70"
                    style={{ width: `${moduleProgress}%` }}
                  />
                </div>
              </div>
            </button>

            {expanded ? (
              <div className="relative z-10 mt-5 grid gap-3">
                {moduleLessons.map((lesson, localIndex) => {
                  const absoluteIndex = moduleStartIndex + localIndex;
                  const state = getLessonState(absoluteIndex, completedCount);
                  const isSelected = selectedLessonId === lesson.id;

                  return (
                    <button
                      key={lesson.id}
                      type="button"
                      onClick={() => onSelectLesson(lesson.id)}
                      className={[
                        "group ml-9 rounded-2xl border p-4 text-left transition-all duration-200",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f16]",
                        isSelected
                          ? "border-violet-300/35 bg-violet-400/[0.08]"
                          : "border-white/10 bg-slate-950/35 hover:border-violet-300/25 hover:bg-violet-400/[0.045]",
                      ].join(" ")}
                    >
                      <div className="relative">
                        <span
                          className={[
                            "absolute -left-[3.25rem] top-1 grid h-8 w-8 place-items-center rounded-full border text-xs font-semibold",
                            state === "completed"
                              ? "border-emerald-300/40 bg-emerald-300 text-slate-950"
                              : state === "current"
                                ? "border-violet-200/45 bg-violet-200/80 text-slate-950 shadow-[0_0_14px_rgba(167,139,250,0.24)]"
                                : "border-white/10 bg-slate-950 text-slate-500",
                          ].join(" ")}
                        >
                          {lesson.order}
                        </span>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                              {t(`academy.lesson.${lesson.id}.theme`, lesson.theme)}
                            </p>
                            <h4 className="mt-1 text-lg font-semibold text-white">
                              {t(`academy.lesson.${lesson.id}.title`, lesson.title)}
                            </h4>
                          </div>
                          <StateBadge state={state} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
