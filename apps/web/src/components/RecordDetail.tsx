import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Entity, CRMRecord, Match, Property } from "@mekan/contracts";
import { api } from "../api";
import { useI18n } from "../i18n";
import { useAuth } from "../auth";
import { ErrorMessage, Loading, useFormats } from "./ui";
export function RecordDetail({
  entity,
  row,
  onEdit,
  onClose,
}: {
  entity: Entity;
  row: CRMRecord;
  onEdit: () => void;
  onClose: () => void;
}) {
  const { t } = useI18n(),
    { user } = useAuth(),
    { date, money, price } = useFormats(),
    cache = useQueryClient(),
    [confirm, setConfirm] = useState(false);
  const mutation = useMutation({
    mutationFn: () =>
      api("/" + entity + "/" + row.id, {
        method: "DELETE",
        version: row.version,
      }),
    onSuccess: () => {
      onClose();
      cache.invalidateQueries({ queryKey: ["crm"] });
      cache.invalidateQueries({ queryKey: ["dashboard"] });
      cache.invalidateQueries({ queryKey: ["audit"] });
    },
  });
  const linked = "propertyId" in row;
  const property = useQuery({
    queryKey: ["crm", "selected", "properties", linked ? row.propertyId : 0],
    queryFn: () =>
      api<Property>("/properties/" + (linked ? row.propertyId : 0)),
    enabled: linked,
  });
  const client = useQuery({
    queryKey: ["crm", "selected", "clients", linked ? row.clientId : 0],
    queryFn: () =>
      api<{ name: string }>("/clients/" + (linked ? row.clientId : 0)),
    enabled: linked,
  });
  const skip = [
    "id",
    "version",
    "createdBy",
    "title",
    "name",
    "notes",
    "rentPeriod",
    "currency",
    "propertyTitle",
    "clientName",
  ];
  const values = Object.entries(row).filter(([key]) => !skip.includes(key));
  const value = (key: string, v: unknown) => {
    if (["type", "dealType", "status", "stage"].includes(key))
      return t(String(v));
    if (["startsAt", "createdAt", "updatedAt"].includes(key))
      return date(String(v));
    if (
      ["price", "budgetMax"].includes(key) &&
      "currency" in row &&
      "dealType" in row
    )
      return price({
        price: Number(v),
        currency: row.currency,
        dealType: row.dealType,
        rentPeriod: row.rentPeriod,
      });
    if (key === "amount" && "currency" in row)
      return money(Number(v), row.currency);
    if (key === "propertyId") return property.data?.title || "#" + String(v);
    if (key === "clientId") return client.data?.name || "#" + String(v);
    return String(v ?? "") || "—";
  };
  return (
    <>
      <dl className="details-grid">
        {values.map(([key, v]) => (
          <div key={key}>
            <dt>
              {t(
                key === "propertyId"
                  ? "property"
                  : key === "clientId"
                    ? "client"
                    : key,
              )}
            </dt>
            <dd>{value(key, v)}</dd>
          </div>
        ))}
      </dl>
      <ErrorMessage error={property.error || client.error} />
      {row.notes && (
        <div className="notes">
          <strong>{t("notes")}</strong>
          <p>{row.notes}</p>
        </div>
      )}
      {entity === "clients" && <Recommendations id={row.id} />}
      <ErrorMessage error={mutation.error} />
      {confirm ? (
        <section className="delete-confirm">
          <h3>{t("deleteTitle")}</h3>
          <p>{t("deleteHint")}</p>
          <div className="modal-actions">
            <button
              className="button"
              disabled={mutation.isPending}
              onClick={() => setConfirm(false)}
            >
              {t("cancel")}
            </button>
            <button
              className="button danger"
              disabled={mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              {t("remove")}
            </button>
          </div>
        </section>
      ) : (
        <div className="modal-actions">
          <button className="button" onClick={onEdit}>
            {t("edit")}
          </button>
          {user.role === "admin" && (
            <button className="button danger" onClick={() => setConfirm(true)}>
              {t("remove")}
            </button>
          )}
        </div>
      )}
    </>
  );
}
function Recommendations({ id }: { id: number }) {
  const { t } = useI18n(),
    { price } = useFormats();
  const query = useQuery({
    queryKey: ["crm", "recommendations", id],
    queryFn: ({ signal }) =>
      api<Match[]>("/clients/" + id + "/recommendations", { signal }),
  });
  return (
    <section className="recommendations">
      <h3>◇ {t("recommendations")}</h3>
      <p className="muted">{t("matchingHint")}</p>
      {query.isPending ? (
        <Loading />
      ) : query.error ? (
        <ErrorMessage error={query.error} />
      ) : query.data?.length ? (
        query.data.map((m) => (
          <article className="match-card" key={m.property.id}>
            <div className="match-top">
              <div>
                <strong>{m.property.title}</strong>
                <p>{price(m.property)}</p>
              </div>
              <span className="match-score">
                {m.score}
                <small>/ 100</small>
              </span>
            </div>
            <div className="criteria">
              {m.criteria.map((c) => (
                <span key={c.key} className={c.matched ? "yes" : "partial"}>
                  {c.matched ? "✓" : "·"} {t(c.key)}{" "}
                  <b>
                    {c.value}/{c.weight}
                  </b>
                </span>
              ))}
            </div>
          </article>
        ))
      ) : (
        <p>{t("noMatches")}</p>
      )}
    </section>
  );
}
