import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  statuses,
  type Entity,
  type Page,
  type CRMRecord,
  type Property,
} from "@mekan/contracts";
import { api, queryString } from "../api";
import { useI18n } from "../i18n";
import { Heading } from "../components/Layout";
import {
  ErrorMessage,
  Loading,
  Empty,
  Modal,
  Pill,
  PropertyCard,
  Pagination,
  useFormats,
} from "../components/ui";
import { RecordForm, addKeys } from "../components/RecordForm";
import { RecordDetail } from "../components/RecordDetail";
export function Collection({ entity }: { entity: Entity }) {
  const { t } = useI18n(),
    { price, money, date } = useFormats(),
    [params, setParams] = useSearchParams();
  const [q, setQ] = useState(""),
    [search, setSearch] = useState(""),
    [status, setStatus] = useState(""),
    [dealType, setDealType] = useState(""),
    [page, setPage] = useState(1),
    [edit, setEdit] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(q);
      setPage(1);
    }, 250);
    return () => clearTimeout(timeout);
  }, [q]);
  const query = useQuery({
    queryKey: ["crm", entity, { search, status, dealType, page }],
    queryFn: ({ signal }) =>
      api<Page<CRMRecord>>(
        "/" +
          entity +
          "?" +
          queryString({ q: search, status, dealType, page, pageSize: 12 }),
        { signal },
      ),
  });
  const id = Number(params.get("record")) || 0,
    isNew = params.has("new");
  const record = useQuery({
    queryKey: ["crm", entity, "record", id],
    queryFn: ({ signal }) =>
      api<CRMRecord>("/" + entity + "/" + id, { signal }),
    enabled: !!id,
  });
  const close = () => {
    setParams({});
    setEdit(false);
  };
  const rows = query.data?.items || [];
  const hint = {
    properties: "propertyHint",
    clients: "clientHint",
    deals: "dealHint",
    viewings: "viewingHint",
  }[entity];
  const headers =
    entity === "clients"
      ? ["name", "phone", "preferences", "budgetMax", "status"]
      : entity === "deals"
        ? ["property", "client", "amount", "stage"]
        : ["startsAt", "property", "client", "status"];
  const cells = (row: CRMRecord) => {
    if ("budgetMax" in row)
      return [
        row.name,
        row.phone,
        <>
          {t(row.dealType)} · {t(row.type)}
          <small>{row.district || t("all")}</small>
        </>,
        price({ ...row, price: row.budgetMax }),
        <Pill value={row.status} />,
      ];
    if ("amount" in row)
      return [
        row.propertyTitle,
        row.clientName,
        money(row.amount, row.currency),
        <Pill value={row.stage} />,
      ];
    if ("startsAt" in row)
      return [
        date(row.startsAt),
        row.propertyTitle,
        row.clientName,
        <Pill value={row.status} />,
      ];
    return [];
  };
  return (
    <>
      <Heading title={entity} hint={hint}>
        <button
          className="button primary"
          onClick={() => setParams({ new: "1" })}
        >
          + {t(addKeys[entity])}
        </button>
      </Heading>
      <div className="toolbar">
        <label className="search-field">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            aria-label={t("search")}
            placeholder={t("search")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
        <select
          aria-label={t("status")}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">{t("allStatuses")}</option>
          {statuses[entity].map((s) => (
            <option key={s} value={s}>
              {t(s)}
            </option>
          ))}
        </select>
        {["properties", "clients"].includes(entity) && (
          <select
            aria-label={t("dealType")}
            value={dealType}
            onChange={(e) => {
              setDealType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">{t("all")}</option>
            {["sale", "rent"].map((v) => (
              <option key={v} value={v}>
                {t(v)}
              </option>
            ))}
          </select>
        )}
      </div>
      {entity === "viewings" && <p className="muted">{t("localTime")}</p>}
      {query.isPending ? (
        <Loading />
      ) : query.error ? (
        <ErrorMessage error={query.error} />
      ) : rows.length ? (
        entity === "properties" ? (
          <div className="property-grid">
            {rows.map((row) => (
              <PropertyCard
                key={row.id}
                property={row as Property}
                onOpen={(id) => setParams({ record: String(id) })}
              />
            ))}
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {headers.map((h) => (
                    <th key={h} scope="col">
                      {t(h)}
                    </th>
                  ))}
                  <th>
                    <span className="sr-only">{t("details")}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    {cells(row).map((cell, index) => (
                      <td key={index}>{cell}</td>
                    ))}
                    <td>
                      <button
                        className="button small"
                        onClick={() => setParams({ record: String(row.id) })}
                      >
                        {t("details")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <Empty filtered={!!(search || status || dealType)} />
      )}
      {query.data && <Pagination {...query.data} onPage={setPage} />}
      {id || isNew ? (
        <Modal
          title={t(isNew ? addKeys[entity] : edit ? "edit" : "details")}
          onClose={close}
        >
          {isNew ? (
            <RecordForm entity={entity} onClose={close} />
          ) : record.isPending ? (
            <Loading />
          ) : record.error ? (
            <ErrorMessage error={record.error} />
          ) : (
            record.data &&
            (edit ? (
              <RecordForm entity={entity} row={record.data} onClose={close} />
            ) : (
              <>
                <h3>
                  {"title" in record.data
                    ? record.data.title
                    : "name" in record.data
                      ? record.data.name
                      : "#" + record.data.id}
                </h3>
                <RecordDetail
                  entity={entity}
                  row={record.data}
                  onEdit={() => setEdit(true)}
                  onClose={close}
                />
              </>
            ))
          )}
        </Modal>
      ) : null}
    </>
  );
}
