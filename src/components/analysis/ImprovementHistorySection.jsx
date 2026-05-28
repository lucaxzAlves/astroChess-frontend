import { Badge, Card, EmptyState, SectionHeading } from "../profileDelta/ProfileDeltaUi.jsx";

function TagList({ label, items = [], tone = "slate" }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.length ? (
          items.map((item) => (
            <Badge key={item} tone={tone}>
              {item}
            </Badge>
          ))
        ) : (
          <span className="text-sm text-slate-500">None flagged</span>
        )}
      </div>
    </div>
  );
}

export default function ImprovementHistorySection({ improvementHistory = [] }) {
  return (
    <section>
      <SectionHeading
        eyebrow="Trend line"
        title="Improvement History"
        description="How the profile has moved over recent analysis windows, including resolved leaks and new problems."
      />

      {improvementHistory.length ? (
        <div className="grid gap-5">
          {improvementHistory.map((period) => (
            <Card key={period?.periodLabel} className="p-5">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                <div>
                  <p className="text-sm font-medium text-purple-300">{period?.periodLabel}</p>
                  <h3 className="mt-1 text-xl font-semibold text-white">{period?.summary}</h3>
                </div>
                <Badge tone="slate">{period?.analyzedGamesCount ?? 0} games</Badge>
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                <TagList label="Improved areas" items={period?.improvedAreas} tone="emerald" />
                <TagList label="Worsened areas" items={period?.worsenedAreas} tone="rose" />
                <TagList label="Resolved mistakes" items={period?.resolvedMistakes} tone="purple" />
                <TagList label="New problems" items={period?.newProblems} tone="yellow" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState label="Improvement history will appear after multiple analysis windows exist." />
      )}
    </section>
  );
}
