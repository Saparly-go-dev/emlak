import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import type { Dashboard as DashboardData } from "@mekan/contracts";
import { statuses } from "@mekan/contracts";
import { api } from "../api";
import { useI18n } from "../i18n";
import { Heading } from "../components/Layout";
import {
  Loading,
  ErrorMessage,
  Empty,
  PropertyCard,
  useFormats,
  Icon,
} from "../components/ui";
export function Dashboard() {
  const { t } = useI18n(),
    { money, date } = useFormats();
  const query = useQuery({
    queryKey: ["dashboard"],
    queryFn: ({ signal }) => api<DashboardData>("/dashboard", { signal }),
  });
  if (query.isPending) return <Loading />;
  if (query.error) return <ErrorMessage error={query.error} />;
  const data = query.data!;
  return (
    <>
      <Heading title="welcome" hint="overviewHint">
        <Link className="button primary" to="/properties?new=1">
          + {t("addProperty")}
        </Link>
      </Heading>
      <div className="stats-grid">
        {(["properties", "clients", "deals", "viewings"] as const).map(
          (key, i) => (
            <Link className="stat-card" to={"/" + key} key={key}>
              <span className="stat-top">
                {t(
                  [
                    "activeProperties",
                    "activeClients",
                    "openDeals",
                    "upcomingViewings",
                  ][i],
                )}
                <Icon name={key} />
              </span>
              <strong>{data.counts[key]}</strong>
              <span className="stat-link">{t("viewAll")} →</span>
            </Link>
          ),
        )}
      </div>
      <div className="dashboard-middle">
        <section className="panel">
          <div className="section-heading">
            <h2>{t("pipeline")}</h2>
            <Link to="/deals">{t("viewAll")} ↗</Link>
          </div>
          <div className="pipeline">
            {statuses.deals.map((stage) => {
              const count =
                data.stages.find((s) => s.stage === stage)?.count || 0;
              return (
                <div className="pipeline-row" key={stage}>
                  <span>{t(stage)}</span>
                  <progress
                    value={count}
                    max={Math.max(1, ...data.stages.map((s) => s.count))}
                    aria-label={t(stage)}
                  />
                  <b>{count}</b>
                </div>
              );
            })}
          </div>
        </section>
        <section className="panel">
          <div className="section-heading">
            <h2>{t("nextAppointments")}</h2>
            <Link to="/viewings">{t("viewAll")} ↗</Link>
          </div>
          {data.viewings.length ? (
            data.viewings.map((v) => (
              <Link
                className="appointment"
                key={v.id}
                to={"/viewings?record=" + v.id}
              >
                <span className="appointment-icon">
                  <Icon name="viewings" />
                </span>
                <span>
                  <strong>{v.propertyTitle}</strong>
                  <small>
                    {v.clientName} · {date(v.startsAt)}
                  </small>
                </span>
              </Link>
            ))
          ) : (
            <p className="quiet-empty">{t("empty")}</p>
          )}
        </section>
      </div>
      <section className="volume-strip">
        <div>
          <strong>{t("closedVolume")}</strong>
          <small>{t("volumeHint")}</small>
        </div>
        <div className="volume-values">
          {["TMT", "USD"].map((c) => (
            <strong key={c}>
              {money(data.volume.find((v) => v.currency === c)?.amount || 0, c)}
            </strong>
          ))}
        </div>
      </section>
      <div className="section-heading">
        <h2>{t("recentProperties")}</h2>
        <Link to="/properties">{t("viewAll")} ↗</Link>
      </div>
      {data.properties.length ? (
        <div className="property-grid">
          {data.properties.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      ) : (
        <Empty />
      )}
    </>
  );
}
