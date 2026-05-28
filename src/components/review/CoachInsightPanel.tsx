type CoachSection = {
  title: string;
  text: string;
};

type DecisiveMoveSection = CoachSection & {
  move: string;
  bestAlternative: string;
  errorCategory: string;
};

type MissedChance = {
  move: string;
  theme: string;
  text: string;
};

type CoachAnalysis = {
  gameSummary: CoachSection;
  decisiveMove: DecisiveMoveSection;
  missedDecisiveChances: MissedChance[];
  loserPatterns: {
    title: string;
    patterns: string[];
    text: string;
  };
  centralLesson: CoachSection;
};

type CoachInsightPanelProps = {
  analysis: CoachAnalysis;
};

export default function CoachInsightPanel({ analysis }: CoachInsightPanelProps) {
  return (
    <div className="game-review-coach">
      <div className="game-review-coach-section">
        <h3 className="game-review-coach-title">{analysis.gameSummary.title}</h3>
        <p className="game-review-coach-text">{analysis.gameSummary.text}</p>
      </div>

      <div className="game-review-coach-section emphasis">
        <div className="game-review-coach-kicker">Decisive moment</div>
        <h3 className="game-review-coach-title">{analysis.decisiveMove.title}</h3>
        <div className="game-review-coach-move">{analysis.decisiveMove.move}</div>
        <p className="game-review-coach-text">{analysis.decisiveMove.text}</p>
        <div className="game-review-coach-meta">
          <span>Best alternative: {analysis.decisiveMove.bestAlternative}</span>
          <span>{analysis.decisiveMove.errorCategory}</span>
        </div>
      </div>

      <div className="game-review-coach-section">
        <h3 className="game-review-coach-title">
          Erros que poderiam ter decidido, mas nao foram aproveitados
        </h3>
        <div className="game-review-coach-list">
          {analysis.missedDecisiveChances.map((chance) => (
            <article key={`${chance.move}-${chance.theme}`} className="game-review-coach-item">
              <div className="game-review-coach-item-head">
                <span className="game-review-coach-move inline">{chance.move}</span>
                <span className="game-review-coach-theme">{chance.theme}</span>
              </div>
              <p className="game-review-coach-text">{chance.text}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="game-review-coach-section">
        <h3 className="game-review-coach-title">{analysis.loserPatterns.title}</h3>
        <div className="game-review-coach-patterns">
          {analysis.loserPatterns.patterns.map((pattern) => (
            <span key={pattern} className="game-review-coach-pattern">
              {pattern}
            </span>
          ))}
        </div>
        <p className="game-review-coach-text">{analysis.loserPatterns.text}</p>
      </div>

      <div className="game-review-coach-section">
        <h3 className="game-review-coach-title">{analysis.centralLesson.title}</h3>
        <p className="game-review-coach-text">{analysis.centralLesson.text}</p>
      </div>
    </div>
  );
}
