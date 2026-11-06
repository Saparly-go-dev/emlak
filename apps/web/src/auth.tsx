import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session, User } from "@mekan/contracts";
import { api } from "./api";
import { LanguageSelect, useI18n } from "./i18n";
import { ErrorMessage, Field, Loading } from "./components/ui";
const Context = createContext<{ user: User; logout: () => void }>({
  user: null!,
  logout: () => {},
});
export const useAuth = () => useContext(Context);
export function AuthProvider({ children }: { children: ReactNode }) {
  const client = useQueryClient(),
    { t } = useI18n();
  const session = useQuery({
    queryKey: ["session"],
    queryFn: ({ signal }) => api<Session>("/auth/session", { signal }),
    retry: false,
  });
  useEffect(() => {
    const handler = () => {
      client.clear();
      client.setQueryData(["session"], {
        user: null,
        csrf: null,
        setupRequired: false,
      });
    };
    window.addEventListener("session-expired", handler);
    return () => window.removeEventListener("session-expired", handler);
  }, [client]);
  const logout = useMutation({
    mutationFn: () => api("/auth/logout", { method: "POST" }),
    onSuccess: () => {
      client.clear();
      client.setQueryData(["session"], {
        user: null,
        csrf: null,
        setupRequired: false,
      });
    },
  });
  if (session.isPending) return <Loading />;
  if (session.error)
    return (
      <div className="boot">
        <ErrorMessage error={session.error} />
        <button className="button" onClick={() => session.refetch()}>
          {t("retry")}
        </button>
      </div>
    );
  if (!session.data?.user)
    return <AuthScreen setup={session.data?.setupRequired || false} />;
  return (
    <Context.Provider
      value={{ user: session.data.user, logout: () => logout.mutate() }}
    >
      {logout.error && <ErrorMessage error={logout.error} />}
      {children}
    </Context.Provider>
  );
}
function AuthScreen({ setup }: { setup: boolean }) {
  const { t } = useI18n(),
    client = useQueryClient();
  const mutation = useMutation({
    mutationFn: (body: Record<string, FormDataEntryValue>) =>
      api<Session>(setup ? "/auth/setup" : "/auth/login", {
        method: "POST",
        body,
      }),
    onSuccess: (data) => client.setQueryData(["session"], data),
  });
  return (
    <div className="auth-layout">
      <section className="auth-story">
        <a className="brand" href="/">
          ⌂ Mekan<span className="brand-dot">.</span>
        </a>
        <div>
          <span className="eyebrow">MEKAN / CRM</span>
          <h1>{t("welcome")}</h1>
          <p>{t("appSubtitle")}</p>
          <ul>
            {[1, 2, 3].map((n) => (
              <li key={n}>
                <span>0{n}</span>
                {t("authFeature" + n)}
              </li>
            ))}
          </ul>
        </div>
        <small>RU · EN · TK</small>
      </section>
      <section className="auth-panel">
        <div className="auth-language">
          <LanguageSelect />
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate(Object.fromEntries(new FormData(e.currentTarget)));
          }}
        >
          <span className="eyebrow">{t("workspace")}</span>
          <h2>{t(setup ? "setupTitle" : "loginTitle")}</h2>
          <p className="muted">{t(setup ? "setupHint" : "loginHint")}</p>
          {setup && (
            <Field
              label={t("name")}
              name="name"
              required
              maxLength={160}
              autoComplete="name"
            />
          )}
          <Field
            label={t("email")}
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="username"
          />
          <Field
            label={t("password")}
            name="password"
            type="password"
            required
            minLength={setup ? 10 : 1}
            maxLength={128}
            autoComplete={setup ? "new-password" : "current-password"}
          />
          <ErrorMessage error={mutation.error} />
          <button className="button primary full" disabled={mutation.isPending}>
            {t(mutation.isPending ? "loading" : setup ? "setup" : "login")} →
          </button>
        </form>
      </section>
    </div>
  );
}
