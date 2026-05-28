import { useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext.jsx";

type Mode = "login" | "register";

export default function LoginPage() {
  const { login, register, loading } = useAuth();
  const { language, setLanguage, supportedLanguages, t } = useLanguage();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const title = useMemo(
    () => (mode === "login" ? t("auth.loginTitle") : t("auth.registerTitle")),
    [mode, t]
  );
  const submitLabel = mode === "login" ? t("auth.loginSubmit") : t("auth.registerSubmit");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      if (mode === "login") {
        await login({ email: email.trim(), password });
      } else {
        await register({ name: name.trim(), email: email.trim(), password });
      }

      window.history.pushState({}, "", "/");
      window.dispatchEvent(new PopStateEvent("popstate"));
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : t("auth.unexpectedError");
      if (message.toLowerCase().includes("401") || message.toLowerCase().includes("invál")) {
        setError(t("auth.invalidCredentials"));
        return;
      }
      setError(message);
    }
  };

  return (
    <section className="astro-page-bg relative flex min-h-screen items-center justify-center overflow-hidden p-4 text-white sm:p-6">
      <div className="pointer-events-none absolute left-[8%] top-[8%] h-48 w-48 rounded-full border border-purple-300/10 shadow-[0_0_80px_rgba(168,85,247,0.16)] [transform:rotate(-18deg)_scaleY(0.48)]" />
      <div className="pointer-events-none absolute bottom-[10%] right-[8%] h-64 w-64 rounded-full border border-cyan-300/10 shadow-[0_0_90px_rgba(34,211,238,0.11)] [transform:rotate(24deg)_scaleY(0.42)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-300/50 to-transparent" />

      <label className="absolute right-5 top-5 z-20 grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        {t("language.label")}
        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          className="rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm font-semibold normal-case tracking-normal text-slate-200 outline-none transition focus:border-purple-400/70 focus:ring-4 focus:ring-purple-500/10"
        >
          {supportedLanguages.map((item) => (
            <option key={item.code} value={item.code}>
              {item.shortLabel}
            </option>
          ))}
        </select>
      </label>

      <div className="astro-card relative z-10 grid w-full max-w-6xl overflow-hidden rounded-[32px] lg:grid-cols-[1.05fr_0.95fr]">
        <aside className="relative hidden min-h-[680px] overflow-hidden border-r border-purple-500/20 bg-[linear-gradient(145deg,rgba(88,28,135,0.26),rgba(15,23,42,0.44),rgba(2,6,23,0.72))] p-8 lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_22%,rgba(216,180,254,0.16),transparent_30%),radial-gradient(circle_at_78%_70%,rgba(34,211,238,0.10),transparent_32%)]" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <div className="flex items-center gap-4">
                <img src="/astrochess-logo.png" alt="astroChess" className="h-20 w-20 object-contain" />
                <div>
                  <p className="bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-sm font-semibold uppercase tracking-[0.22em] text-transparent">
                    astroChess
                  </p>
                  <p className="mt-1 text-sm text-slate-400">{t("auth.brandTagline")}</p>
                </div>
              </div>

              <h2 className="astro-gradient-title mt-12 max-w-lg text-5xl font-semibold leading-tight tracking-tight">
                {t("auth.heroTitle")}
              </h2>
              <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
                {t("auth.heroDescription")}
              </p>
            </div>

            <div className="grid gap-5">
              <div className="grid grid-cols-8 overflow-hidden rounded-[24px] border border-purple-500/20 bg-slate-950/50 p-3 shadow-[0_24px_80px_rgba(0,0,0,0.28),0_0_34px_rgba(168,85,247,0.10)]">
                {Array.from({ length: 64 }).map((_, index) => {
                  const dark = (Math.floor(index / 8) + index) % 2 === 1;
                  const active = [18, 27, 36, 45].includes(index);
                  return (
                    <span
                      key={index}
                      className={[
                        "aspect-square rounded-md border border-white/5",
                        active
                          ? "bg-purple-300/70 shadow-[0_0_18px_rgba(216,180,254,0.55)]"
                          : dark
                            ? "bg-purple-950/70"
                            : "bg-white/[0.08]",
                      ].join(" ")}
                    />
                  );
                })}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {["auth.feature.analysis", "auth.feature.coach", "auth.feature.practice"].map((key) => (
                  <div key={key} className="rounded-2xl border border-purple-500/20 bg-slate-950/35 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-purple-200">
                      {t(key)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-h-[640px] items-center justify-center p-5 sm:p-8">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-4 lg:hidden">
              <img src="/astrochess-logo.png" alt="astroChess" className="h-16 w-16 object-contain" />
              <div>
                <p className="bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-sm font-semibold uppercase tracking-[0.2em] text-transparent">
                  astroChess
                </p>
                <p className="text-sm text-slate-400">{t("auth.brandTagline")}</p>
              </div>
            </div>

            <div className="rounded-[28px] border border-purple-500/20 bg-slate-950/45 p-5 shadow-2xl shadow-black/20 sm:p-6">
              <div className="grid grid-cols-2 gap-2 rounded-2xl border border-purple-500/20 bg-white/[0.04] p-1">
                {(["login", "register"] as Mode[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setError("");
                      setMode(item);
                    }}
                    className={[
                      "rounded-xl px-4 py-2.5 text-sm font-semibold transition",
                      mode === item
                        ? "bg-gradient-to-r from-purple-300 to-cyan-200 text-slate-950 shadow-[0_10px_30px_rgba(216,180,254,0.22)]"
                        : "text-slate-400 hover:text-white",
                    ].join(" ")}
                  >
                    {item === "login" ? t("auth.loginTitle") : t("auth.registerTitle")}
                  </button>
                ))}
              </div>

              <div className="mt-7">
                <p className="astro-eyebrow">
                  {mode === "login" ? t("auth.loginEyebrow") : t("auth.registerEyebrow")}
                </p>
                <h1 className="astro-gradient-title mt-3 text-3xl font-semibold tracking-tight">{title}</h1>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {mode === "login" ? t("auth.loginSubtitle") : t("auth.registerSubtitle")}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {mode === "register" && (
                  <label className="grid gap-2 text-sm">
                    <span className="text-slate-300">{t("auth.name")}</span>
                    <input
                      name="name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      required
                      disabled={loading}
                      placeholder={t("auth.namePlaceholder")}
                      className="pointer-events-auto rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white placeholder:text-slate-600 outline-none transition focus:border-purple-300/60 focus:ring-4 focus:ring-purple-500/10 disabled:opacity-60"
                    />
                  </label>
                )}

                <label className="grid gap-2 text-sm">
                  <span className="text-slate-300">{t("auth.email")}</span>
                  <input
                    name="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    disabled={loading}
                    placeholder={t("auth.emailPlaceholder")}
                    className="pointer-events-auto rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white placeholder:text-slate-600 outline-none transition focus:border-purple-300/60 focus:ring-4 focus:ring-purple-500/10 disabled:opacity-60"
                  />
                </label>

                <label className="grid gap-2 text-sm">
                  <span className="text-slate-300">{t("auth.password")}</span>
                  <input
                    name="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={6}
                    disabled={loading}
                    placeholder={t("auth.passwordPlaceholder")}
                    className="pointer-events-auto rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white placeholder:text-slate-600 outline-none transition focus:border-purple-300/60 focus:ring-4 focus:ring-purple-500/10 disabled:opacity-60"
                  />
                </label>

                {error && (
                  <p className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="astro-button-primary w-full rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? t("auth.loading") : submitLabel}
                </button>
              </form>

              <button
                type="button"
                onClick={() => {
                  setError("");
                  setMode((prev) => (prev === "login" ? "register" : "login"));
                }}
                className="mt-4 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-purple-300/45 hover:text-white"
              >
                {mode === "login" ? t("auth.switchToRegister") : t("auth.switchToLogin")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
