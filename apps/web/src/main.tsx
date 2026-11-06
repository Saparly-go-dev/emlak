import { Component, StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { entityNames } from "@mekan/contracts";
import { I18nProvider, useI18n } from "./i18n";
import { AuthProvider } from "./auth";
import { ApiError } from "./api";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Collection } from "./pages/Collection";
import { Team } from "./pages/Team";
import { Audit } from "./pages/Audit";
import { Settings } from "./pages/Settings";
import "./styles.css";
class ErrorBoundary extends Component<
  { children: ReactNode; message: string; retry: string },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="boot">
        <p role="alert">{this.props.message}</p>
        <button className="button" onClick={() => location.reload()}>
          {this.props.retry}
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
function App() {
  const { t } = useI18n();
  return (
    <ErrorBoundary message={t("serverError")} retry={t("retry")}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              {entityNames.map((entity) => (
                <Route
                  key={entity}
                  path={entity}
                  element={<Collection key={entity} entity={entity} />}
                />
              ))}
              <Route path="team" element={<Team />} />
              <Route path="audit" element={<Audit />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
const client = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: (count, error) =>
        !(
          error instanceof ApiError &&
          error.status >= 400 &&
          error.status < 500
        ) && count < 1,
    },
    mutations: { retry: false },
  },
});
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={client}>
      <I18nProvider>
        <App />
      </I18nProvider>
    </QueryClientProvider>
  </StrictMode>,
);
