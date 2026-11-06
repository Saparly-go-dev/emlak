import { NavLink, Outlet, useLocation, Link } from "react-router-dom";
import { LanguageSelect, useI18n } from "../i18n";
import { useAuth } from "../auth";
import { Icon } from "./ui";
export function Layout() {
  const { t } = useI18n(),
    { user, logout } = useAuth(),
    path = useLocation().pathname.split("/")[1] || "dashboard";
  const nav = [
    "dashboard",
    "properties",
    "clients",
    "deals",
    "viewings",
    ...(user.role === "admin" ? ["team", "audit"] : []),
    "settings",
  ];
  return (
    <div className="layout">
      <aside className="sidebar">
        <Link className="brand" to="/dashboard">
          ⌂ Mekan<span className="brand-dot">.</span>
        </Link>
        <div className="workspace-label">{t("workspace")}</div>
        <nav aria-label={t("workspace")}>
          {nav.map((key) => (
            <NavLink key={key} to={"/" + key}>
              <Icon name={key} />
              <span>{t(key)}</span>
            </NavLink>
          ))}
        </nav>
        <a
          href="/docs"
          className="sidebar-bottom"
          target="_blank"
          rel="noreferrer"
        >
          {t("apiDocs")} ↗
        </a>
      </aside>
      <div className="main-column">
        <header className="topbar">
          <span className="breadcrumb">
            Mekan <span>/</span> {t(path)}
          </span>
          <div className="topbar-actions">
            <LanguageSelect />
            <div className="user-info">
              <span className="avatar">
                {user.name.slice(0, 2).toUpperCase()}
              </span>
              <div>
                <strong>{user.name}</strong>
                <small>{t(user.role)}</small>
              </div>
            </div>
            <button className="button small" onClick={logout}>
              {t("logout")}
            </button>
          </div>
        </header>
        <main>
          <Outlet />
        </main>
        <footer>Mekan · {t("appSubtitle")}</footer>
      </div>
    </div>
  );
}
export function Heading({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children?: React.ReactNode;
}) {
  const { t } = useI18n();
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">MEKAN / CRM</div>
        <h1>{t(title)}</h1>
        {hint && <p>{t(hint)}</p>}
      </div>
      <div className="heading-actions">{children}</div>
    </div>
  );
}
