import Sidebar from "../components/Sidebar.jsx";

export default function MainLayout({
  activeItem,
  onActiveItemChange,
  children,
  fullBleed = false,
  chessComAvatar = "",
}) {
  return (
    <div className="flex min-h-screen bg-[var(--astro-bg)] text-slate-100">
      <Sidebar
        activeItem={activeItem}
        onActiveItemChange={onActiveItemChange}
        chessComAvatar={chessComAvatar}
      />

      <main
        className={[
          "astro-page-bg ml-72 flex-1",
          fullBleed
            ? "min-h-screen overflow-hidden p-0"
            : "overflow-y-auto p-4 sm:p-6 xl:p-8",
        ].join(" ")}
      >
        <div
          key={fullBleed ? "full-bleed-view" : activeItem}
          className={[
            fullBleed ? "astro-page-content min-h-screen" : "astro-page-content",
            fullBleed ? "" : "astro-page-transition",
          ].join(" ")}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
