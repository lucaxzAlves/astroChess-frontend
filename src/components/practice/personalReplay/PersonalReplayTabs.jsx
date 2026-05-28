import { useLanguage } from "../../../contexts/LanguageContext.jsx";

const tabs = [
  { id: "recommended", key: "personalReplay.tab.recommended" },
  { id: "categories", key: "personalReplay.tab.categories" },
  { id: "timeline", key: "personalReplay.tab.timeline" },
  { id: "weaknesses", key: "personalReplay.tab.weaknesses" },
  { id: "completed", key: "personalReplay.tab.completed" },
];

export default function PersonalReplayTabs({ activeTab, onTabChange }) {
  const { t } = useLanguage();

  return (
    <div className="flex gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.04] p-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={[
            "whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition",
            activeTab === tab.id
              ? "bg-purple-300 text-slate-950 shadow-[0_0_24px_rgba(216,180,254,0.22)]"
              : "text-slate-400 hover:bg-purple-500/10 hover:text-purple-100",
          ].join(" ")}
        >
          {t(tab.key)}
        </button>
      ))}
    </div>
  );
}
