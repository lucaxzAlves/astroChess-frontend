import { useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext.jsx";

type Mode = "login" | "register";

export default function LoginPage() {
  const { login, register, loading } = useAuth();
  const { t } = useLanguage();
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
    <section className="astro-page-bg relative flex min-h-screen items-start justify-center overflow-x-hidden px-4 pb-8 pt-24 text-white sm:px-6 lg:items-center lg:py-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-300/50 to-transparent" />

      <div className="relative z-10 w-full max-w-md">
        <div className="flex min-h-0 items-center justify-center">
          <div className="w-full max-w-md">
            <div className="mb-6 flex items-center justify-center gap-4">
              <img src="/astrochess-logo.png" alt="astroChess" className="h-16 w-16 object-contain" />
              <div>
                <p className="bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-sm font-semibold uppercase tracking-[0.2em] text-transparent">
                  astroChess
                </p>
                <p className="text-sm text-slate-400">{t("auth.brandTagline")}</p>
              </div>
            </div>

            <div className="rounded-[24px] border border-purple-500/20 bg-slate-950/45 p-5 shadow-2xl shadow-black/20 sm:rounded-[28px] sm:p-6">
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
