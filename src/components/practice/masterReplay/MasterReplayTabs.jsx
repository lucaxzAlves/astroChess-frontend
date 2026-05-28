import { useLanguage } from "../../../contexts/LanguageContext.jsx";

const replayTabs = [
  { id: "recommended", labelKey: "masterReplay.tab.recommended" },
  { id: "themes", labelKey: "masterReplay.tab.themes" },
  { id: "players", labelKey: "masterReplay.tab.players" },
  { id: "historical", labelKey: "masterReplay.tab.historical" },
  { id: "trainingModes", labelKey: "masterReplay.tab.trainingModes" },
];

export default function MasterReplayTabs({ activeTab, onTabChange }) {
  const { t } = useLanguage();

  return (
    <div className="flex gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/45 p-2">
      {replayTabs.map((tab) => {
        const active = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={[
              "whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition",
              active
                ? "border border-purple-300/45 bg-gradient-to-br from-purple-500/[0.22] to-cyan-300/[0.10] text-slate-50 shadow-[0_0_22px_rgba(168,85,247,0.14)]"
                : "border border-purple-300/[0.16] bg-white/[0.035] text-slate-300 hover:border-purple-300/30 hover:bg-purple-300/[0.08] hover:text-white",
            ].join(" ")}
          >
            {t(tab.labelKey)}
          </button>
        );
      })}
    </div>
  );
}
