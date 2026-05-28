import { useMemo, useState } from "react";
import { useLanguage } from "../../../contexts/LanguageContext.jsx";
import {
  getCollectionCount,
  getMomentsForCollection,
  getMomentsForWeakness,
  getTimelineGroups,
  localizeItem,
  personalReplayCollections,
  personalReplayMoments,
  personalWeaknessGroups,
  replayProgress,
} from "../../../data/mockPersonalReplay.js";
import MomentPreviewPanel from "./MomentPreviewPanel.jsx";
import PersonalMomentCard from "./PersonalMomentCard.jsx";
import PersonalReplayHero from "./PersonalReplayHero.jsx";
import PersonalReplayTabs from "./PersonalReplayTabs.jsx";
import ReplayProgressCard from "./ReplayProgressCard.jsx";
import ReplaySession from "./ReplaySession.jsx";
import TodayReplayCard from "./TodayReplayCard.jsx";
import WeaknessGroupCard from "./WeaknessGroupCard.jsx";

function SectionHeading({ title, description, eyebrow }) {
  return (
    <div>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-300">{eyebrow}</p>
      ) : null}
      <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
      {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{description}</p> : null}
    </div>
  );
}

function MomentGrid({ moments, onSelect }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {moments.map((moment) => (
        <PersonalMomentCard key={moment.id} moment={moment} onSelect={onSelect} />
      ))}
    </div>
  );
}

function CategoryCard({ collection, selected, onSelect }) {
  const { language, t } = useLanguage();
  const count = getCollectionCount(collection);

  return (
    <button
      type="button"
      onClick={() => onSelect(collection)}
      className={[
        "group rounded-[24px] border p-5 text-left transition-all duration-300",
        selected
          ? "border-purple-300/50 bg-purple-500/[0.10]"
          : "border-white/10 bg-white/[0.04] hover:-translate-y-0.5 hover:border-purple-300/35 hover:bg-purple-500/[0.055]",
      ].join(" ")}
    >
      <div className={["h-24 rounded-2xl border border-white/10 bg-gradient-to-br", collection.gradient].join(" ")} />
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-white">{localizeItem(collection, "title", language)}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">{localizeItem(collection, "description", language)}</p>
        </div>
        <span className="rounded-full border border-purple-300/25 bg-purple-300/10 px-3 py-1 text-xs text-purple-100">
          {count}
        </span>
      </div>
      {collection.recommended ? (
        <span className="mt-4 inline-flex rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-100">
          {t("personalReplay.recommended")}
        </span>
      ) : null}
      <span className="mt-5 inline-flex rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-200 transition group-hover:border-purple-300/40 group-hover:text-white">
        {t("personalReplay.openCategory")}
      </span>
    </button>
  );
}

function TimelineView({ groups, onSelectMoment }) {
  const { t } = useLanguage();

  return (
    <div className="grid gap-5">
      {groups.map((group) => (
        <section key={group.id} className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{group.date}</p>
              <h3 className="mt-1 text-xl font-semibold text-white">
                vs {group.opponent} · {t(`personalReplay.result.${group.result}`, group.result)}
              </h3>
              <p className="mt-1 text-sm text-slate-400">{group.timeControl}</p>
            </div>
            <span className="rounded-full border border-white/10 bg-slate-950/45 px-3 py-1 text-xs text-slate-300">
              {t("personalReplay.extractedMoments", undefined, { count: group.moments.length })}
            </span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {group.moments.map((moment) => (
              <PersonalMomentCard key={moment.id} moment={moment} onSelect={onSelectMoment} compact />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function WhyMomentsCard() {
  const { t } = useLanguage();

  return (
    <section className="rounded-[28px] border border-cyan-200/20 bg-cyan-200/8 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
        {t("personalReplay.whyTitle")}
      </p>
      <p className="mt-3 text-sm leading-6 text-cyan-50/90">{t("personalReplay.whyText")}</p>
      <div className="mt-4 grid gap-2">
        {[
          "personalReplay.analysisLink",
          "personalReplay.coachLink",
          "personalReplay.gamesLink",
        ].map((key) => (
          <div key={key} className="rounded-xl border border-white/10 bg-slate-950/35 px-3 py-2 text-sm text-slate-200">
            {t(key)}
          </div>
        ))}
      </div>
      <button type="button" className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-200">
        {t("personalReplay.openCoachPlan")}
      </button>
    </section>
  );
}

export default function PersonalReplayPage({ onBackToPractice }) {
  const { language, t } = useLanguage();
  const [activePersonalReplayTab, setActivePersonalReplayTab] = useState("recommended");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedWeakness, setSelectedWeakness] = useState(null);
  const [selectedMoment, setSelectedMoment] = useState(null);
  const [replayMoment, setReplayMoment] = useState(null);
  const [replayAttempts, setReplayAttempts] = useState([]);

  const todaysMoment = personalReplayMoments.find((moment) => moment.severity === "critical");
  const highestImpact = personalReplayMoments.filter((moment) => ["critical", "high"].includes(moment.severity));
  const recentMistakes = [...personalReplayMoments].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
  const coachPicks = personalReplayMoments.filter((moment) => moment.aiCoachPick);
  const selectedCategoryMoments = useMemo(() => getMomentsForCollection(selectedCategory), [selectedCategory]);
  const selectedWeaknessMoments = useMemo(() => getMomentsForWeakness(selectedWeakness), [selectedWeakness]);
  const completedMoments = personalReplayMoments.filter((moment) => moment.completed);

  if (replayMoment) {
    return (
      <ReplaySession
        moment={replayMoment}
        attemptNumber={replayAttempts.filter((attempt) => attempt.momentId === replayMoment.id).length + 1}
        onSubmitAttempt={(draft) => {
          setReplayAttempts((current) => [...current, draft]);
          console.log("personalReplayAttemptDraft", draft);
        }}
        onExit={() => setReplayMoment(null)}
      />
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <PersonalReplayHero onBackToPractice={onBackToPractice} moments={personalReplayMoments} />
      <TodayReplayCard moment={todaysMoment} onStart={setReplayMoment} />
      <ReplayProgressCard progress={replayProgress} />
      <PersonalReplayTabs activeTab={activePersonalReplayTab} onTabChange={setActivePersonalReplayTab} />

      <div className="grid items-start gap-6 xl:grid-cols-[1fr_390px]">
        <div className="grid gap-6">
          {activePersonalReplayTab === "recommended" ? (
            <>
              <SectionHeading title={t("personalReplay.highestImpact")} description={t("personalReplay.highestImpactDescription")} />
              <MomentGrid moments={highestImpact} onSelect={setSelectedMoment} />
              <SectionHeading title={t("personalReplay.recentMistakes")} />
              <MomentGrid moments={recentMistakes} onSelect={setSelectedMoment} />
              <SectionHeading title={t("personalReplay.aiCoachPicks")} />
              <MomentGrid moments={coachPicks} onSelect={setSelectedMoment} />
            </>
          ) : null}

          {activePersonalReplayTab === "categories" ? (
            <>
              <SectionHeading title={t("personalReplay.categoriesTitle")} description={t("personalReplay.categoriesDescription")} />
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {personalReplayCollections.map((collection) => (
                  <CategoryCard key={collection.id} collection={collection} selected={selectedCategory?.id === collection.id} onSelect={setSelectedCategory} />
                ))}
              </div>
              {selectedCategory ? (
                <SectionHeading
                  eyebrow={localizeItem(selectedCategory, "title", language)}
                  title={t("personalReplay.selectedCategoryMoments")}
                  description={localizeItem(selectedCategory, "description", language)}
                />
              ) : null}
              <MomentGrid moments={selectedCategoryMoments} onSelect={setSelectedMoment} />
            </>
          ) : null}

          {activePersonalReplayTab === "timeline" ? (
            <>
              <SectionHeading title={t("personalReplay.timelineTitle")} description={t("personalReplay.timelineDescription")} />
              <TimelineView groups={getTimelineGroups()} onSelectMoment={setSelectedMoment} />
            </>
          ) : null}

          {activePersonalReplayTab === "weaknesses" ? (
            <>
              <SectionHeading title={t("personalReplay.weaknessesTitle")} description={t("personalReplay.weaknessesDescription")} />
              <div className="grid gap-5 md:grid-cols-2">
                {personalWeaknessGroups.map((weakness) => (
                  <WeaknessGroupCard key={weakness.id} weakness={weakness} selected={selectedWeakness?.id === weakness.id} onSelect={setSelectedWeakness} />
                ))}
              </div>
              {selectedWeakness ? (
                <SectionHeading
                  eyebrow={localizeItem(selectedWeakness, "name", language)}
                  title={t("personalReplay.selectedWeaknessMoments")}
                  description={localizeItem(selectedWeakness, "recommendedAction", language)}
                />
              ) : null}
              <MomentGrid moments={selectedWeaknessMoments} onSelect={setSelectedMoment} />
            </>
          ) : null}

          {activePersonalReplayTab === "completed" ? (
            <>
              <SectionHeading title={t("personalReplay.completedTitle")} description={t("personalReplay.completedDescription")} />
              {completedMoments.length ? (
                <MomentGrid moments={completedMoments} onSelect={setSelectedMoment} />
              ) : (
                <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8 text-center text-sm text-slate-400">
                  {t("personalReplay.completedEmpty")}
                </div>
              )}
            </>
          ) : null}
        </div>

        <div className="grid gap-6 xl:sticky xl:top-8">
          <MomentPreviewPanel
            moment={selectedMoment}
            onClose={() => setSelectedMoment(null)}
            onStart={setReplayMoment}
          />
          <WhyMomentsCard />
        </div>
      </div>
    </section>
  );
}
