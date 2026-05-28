import { useLanguage } from "../../../contexts/LanguageContext.jsx";

function IntroIcon({ index }) {
  const paths = [
    <path key="0" d="M5 18h14M8 18l1.4-4.5h5.2L16 18M9.8 13.5h4.4l-.7-3H10.5l-.7 3ZM13.5 4.5l3 3M16 7l-4.2 4.2" />,
    <path key="1" d="M5 12a7 7 0 0 1 12-4.9M19 12a7 7 0 0 1-12 4.9M17 5v4h-4M7 19v-4h4" />,
    <path key="2" d="M4.5 16.5 9 12l3 3 7.5-7.5M15.5 7.5h4v4M5 20h14" />,
    <path key="3" d="M12 4.5v15M7 8.5h10M6 13h12M8.5 17.5h7M9 4.5h6" />,
  ];

  return (
    <svg
      aria-hidden="true"
      className="h-7 w-7"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      {paths[index]}
    </svg>
  );
}

export default function PatternForgeIntro({ onConfigure }) {
  const { t } = useLanguage();

  return (
    <section className="grid gap-6">
      <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,rgba(35,12,22,0.96),rgba(19,12,38,0.96),rgba(8,12,18,0.98))] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.35)] sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(244,63,94,0.24),transparent_34%),radial-gradient(circle_at_92%_12%,rgba(168,85,247,0.20),transparent_32%)]" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-center">
          <div>
            <button
              type="button"
              onClick={onConfigure}
              className="rounded-full border border-rose-200/20 bg-rose-200/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-100"
            >
              {t("patternForge.recognitionTraining")}
            </button>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              {t("patternForge.title")}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
              {t("patternForge.subtitle")}
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400">
              {t("patternForge.introExplanation")}
            </p>
            <button
              type="button"
              onClick={onConfigure}
              className="mt-6 rounded-2xl bg-rose-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-rose-200"
            >
              {t("patternForge.configureCycle")}
            </button>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-slate-950/35 p-5">
            <div className="grid grid-cols-6 gap-1.5 rounded-2xl border border-white/10 bg-slate-950/60 p-3">
              {Array.from({ length: 36 }).map((_, index) => (
                <span
                  key={index}
                  className={[
                    "aspect-square rounded-md border border-white/5",
                    index === 14 || index === 21
                      ? "bg-rose-300/70 shadow-[0_0_18px_rgba(253,164,175,0.55)]"
                      : index % 2 === 0
                        ? "bg-purple-300/12"
                        : "bg-white/[0.06]",
                  ].join(" ")}
                />
              ))}
            </div>
            <div className="mt-4 grid gap-2">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-2 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-rose-300 to-purple-300"
                    style={{ width: `${52 + item * 16}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <article
            key={index}
            className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-0.5 hover:border-rose-300/30 hover:bg-rose-400/[0.05]"
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-rose-200/20 bg-rose-200/10 text-rose-100">
              <IntroIcon index={index} />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-white">
              {t(`patternForge.method.${index}.title`)}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {t(`patternForge.method.${index}.description`)}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
