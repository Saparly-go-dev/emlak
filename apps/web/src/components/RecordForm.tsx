import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  schemas,
  statuses,
  propertyTypes,
  type Entity,
  type CRMRecord,
  type Page,
  type Property,
  type Client,
} from "@mekan/contracts";
import { api, ApiError, queryString } from "../api";
import { useI18n } from "../i18n";
import { Field, Select, ErrorMessage, Loading, Pagination } from "./ui";
export const addKeys = {
  properties: "addProperty",
  clients: "addClient",
  deals: "addDeal",
  viewings: "addViewing",
};
const editable = {
  properties: [
    "title",
    "address",
    "district",
    "type",
    "dealType",
    "currency",
    "rentPeriod",
    "rooms",
    "price",
    "area",
    "owner",
    "phone",
    "status",
    "notes",
  ],
  clients: [
    "name",
    "phone",
    "email",
    "type",
    "dealType",
    "currency",
    "rentPeriod",
    "district",
    "rooms",
    "budgetMax",
    "minArea",
    "status",
    "notes",
  ],
  deals: ["propertyId", "clientId", "amount", "stage", "notes"],
  viewings: ["propertyId", "clientId", "startsAt", "status", "notes"],
} as const;
function initialValues(
  entity: Entity,
  row?: CRMRecord,
): Record<string, string | number> {
  const result: Record<string, string | number> = {
    type: "apartment",
    dealType: "sale",
    currency: "TMT",
    rentPeriod: "month",
    rooms: entity === "clients" ? 0 : 2,
    status: statuses[entity][0],
    stage: "new",
    minArea: 0,
    notes: "",
  };
  if (row)
    for (const key of editable[entity])
      result[key] =
        (row as unknown as Record<string, string | number>)[key] ?? "";
  if (entity === "viewings") {
    const time = new Date(
      row && "startsAt" in row ? row.startsAt : Date.now() + 3600000,
    );
    result.startsAt = new Date(
      time.getTime() - time.getTimezoneOffset() * 60000,
    )
      .toISOString()
      .slice(0, 16);
  }
  return result;
}
export function AsyncLink({
  entity,
  value,
  onChange,
}: {
  entity: "properties" | "clients";
  value: number;
  onChange: (id: number) => void;
}) {
  const { t } = useI18n(),
    [q, setQ] = useState(""),
    [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ["crm", "options", entity, q, page],
    queryFn: ({ signal }) =>
      api<Page<Property | Client>>(
        "/" + entity + "?" + queryString({ q, page, pageSize: 20 }),
        { signal },
      ),
  });
  const selected = useQuery({
    queryKey: ["crm", "selected", entity, value],
    queryFn: ({ signal }) =>
      api<Property | Client>("/" + entity + "/" + value, { signal }),
    enabled: !!value,
  });
  const items = query.data?.items || [],
    options =
      selected.data && !items.some((i) => i.id === value)
        ? [selected.data, ...items]
        : items;
  return (
    <fieldset className="linked-field">
      <legend>{t(entity === "properties" ? "property" : "client")} *</legend>
      <input
        type="search"
        aria-label={t("search") + " " + t(entity)}
        value={q}
        placeholder={t("search")}
        onChange={(e) => {
          setQ(e.target.value);
          setPage(1);
        }}
      />
      <Select
        label={t(entity === "properties" ? "property" : "client")}
        value={String(value || "")}
        onChange={(s) => onChange(Number(s))}
        options={[
          ["", t("choose")],
          ...options.map(
            (item) =>
              [String(item.id), "title" in item ? item.title : item.name] as [
                string,
                string,
              ],
          ),
        ]}
      />
      <ErrorMessage error={query.error || selected.error} />
      {query.isPending && <span role="status">{t("loading")}</span>}
      {query.data && query.data.pages > 1 && (
        <Pagination {...query.data} onPage={setPage} />
      )}
    </fieldset>
  );
}
export function RecordForm({
  entity,
  row,
  onClose,
}: {
  entity: Entity;
  row?: CRMRecord;
  onClose: () => void;
}) {
  const { t } = useI18n(),
    cache = useQueryClient(),
    [values, setValues] = useState(() => initialValues(entity, row));
  // Keep the version captured when editing began, even if a background refetch
  // updates the record prop. Unsaved fields must never adopt a newer version.
  const [baseVersion] = useState(row?.version);
  const set = (key: string, value: string | number) =>
    setValues((current) => ({ ...current, [key]: value }));
  const mutation = useMutation({
    mutationFn: async () => {
      const input: Record<string, unknown> = {};
      for (const key of editable[entity]) input[key] = values[key] ?? "";
      if (entity === "viewings")
        input.startsAt = new Date(String(input.startsAt)).toISOString();
      const parsed = schemas[entity].safeParse(input);
      if (!parsed.success)
        throw new ApiError(
          "validation",
          400,
          undefined,
          z.flattenError(parsed.error as z.ZodError).fieldErrors as Record<
            string,
            string[]
          >,
        );
      return api("/" + entity + (row ? "/" + row.id : ""), {
        method: row ? "PUT" : "POST",
        body: { ...parsed.data, ...(row ? { version: baseVersion } : {}) },
      });
    },
    onSuccess: () => {
      onClose();
      cache.invalidateQueries({ queryKey: ["crm"] });
      cache.invalidateQueries({ queryKey: ["dashboard"] });
      cache.invalidateQueries({ queryKey: ["audit"] });
    },
  });
  const errorFields =
    mutation.error instanceof ApiError ? mutation.error.fields : {};
  const field = (
    key: string,
    options: {
      type?: string;
      required?: boolean;
      min?: number;
      max?: number;
      maxLength?: number;
      step?: number;
      hint?: string;
    } = {},
  ) => (
    <Field
      key={key}
      label={t(key)}
      name={key}
      type={options.type || "text"}
      value={values[key] ?? ""}
      required={options.required ?? true}
      min={options.min}
      max={options.max}
      step={options.step}
      maxLength={options.maxLength || 300}
      hint={options.hint ? t(options.hint) : undefined}
      error={!!errorFields?.[key]}
      onChange={(e) =>
        set(
          key,
          options.type === "number"
            ? e.target.value === ""
              ? ""
              : Number(e.target.value)
            : e.target.value,
        )
      }
    />
  );
  const select = (key: string, options: readonly string[]) => (
    <Select
      key={key}
      label={t(key)}
      value={String(values[key] || "")}
      onChange={(v) => set(key, v)}
      options={options.map((key) => [key, t(key)])}
    />
  );
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
    >
      <fieldset disabled={mutation.isPending} className="form-grid borderless">
        {entity === "properties" && (
          <>
            {field("title", { maxLength: 200 })}
            {field("address")}
          </>
        )}
        {entity === "clients" && (
          <>
            {field("name", { maxLength: 160 })}
            {field("phone", { type: "tel", maxLength: 40 })}
            {field("email", { type: "email", required: false, maxLength: 254 })}
          </>
        )}
        {(entity === "properties" || entity === "clients") && (
          <>
            {select("dealType", ["sale", "rent"])}
            {select("type", propertyTypes)}
            {select("currency", ["TMT", "USD"])}
            {values.dealType === "rent" &&
              select("rentPeriod", ["month", "day"])}
            {field("district", {
              maxLength: 120,
              required: entity === "properties",
              hint: entity === "clients" ? "anyDistrict" : undefined,
            })}
            {field("rooms", {
              type: "number",
              min: 0,
              max: 100,
              step: 1,
              hint: entity === "clients" ? "anyRooms" : undefined,
            })}
          </>
        )}
        {entity === "properties" && (
          <>
            {field("price", {
              type: "number",
              min: 0.01,
              max: 1e12,
              step: 0.01,
            })}
            {field("area", { type: "number", min: 0.01, max: 1e8, step: 0.01 })}
            {field("owner", { required: false, maxLength: 160 })}
            {field("phone", { type: "tel", required: false, maxLength: 40 })}
          </>
        )}
        {entity === "clients" && (
          <>
            {field("budgetMax", {
              type: "number",
              min: 0.01,
              max: 1e12,
              step: 0.01,
            })}
            {field("minArea", { type: "number", min: 0, max: 1e8, step: 0.01 })}
          </>
        )}
        {(entity === "deals" || entity === "viewings") && (
          <>
            <AsyncLink
              entity="properties"
              value={Number(values.propertyId) || 0}
              onChange={(id) => set("propertyId", id)}
            />
            <AsyncLink
              entity="clients"
              value={Number(values.clientId) || 0}
              onChange={(id) => set("clientId", id)}
            />
          </>
        )}
        {entity === "deals" &&
          field("amount", { type: "number", min: 0.01, max: 1e12, step: 0.01 })}
        {entity === "viewings" &&
          field("startsAt", { type: "datetime-local", hint: "localTime" })}
        {select(entity === "deals" ? "stage" : "status", statuses[entity])}
        <label className="field wide">
          <span>{t("notes")}</span>
          <textarea
            rows={3}
            maxLength={5000}
            value={values.notes || ""}
            onChange={(e) => set("notes", e.target.value)}
          />
        </label>
      </fieldset>
      <ErrorMessage error={mutation.error} />
      <div className="modal-actions">
        <button
          type="button"
          className="button"
          disabled={mutation.isPending}
          onClick={onClose}
        >
          {t("cancel")}
        </button>
        <button className="button primary" disabled={mutation.isPending}>
          {t(mutation.isPending ? "loading" : "save")}
        </button>
      </div>
    </form>
  );
}
