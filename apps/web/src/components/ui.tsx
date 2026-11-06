import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type InputHTMLAttributes,
} from "react";
import { Link } from "react-router-dom";
import type { Property } from "@mekan/contracts";
import { useI18n } from "../i18n";
import { ApiError } from "../api";
const symbols: Record<string, string> = {
  dashboard: "▦",
  properties: "⌂",
  clients: "♧",
  deals: "▣",
  viewings: "▤",
  team: "◎",
  audit: "≡",
  settings: "⚙",
};
export function Icon({ name }: { name: string }) {
  return (
    <span className="nav-symbol" aria-hidden="true">
      {symbols[name] || "◇"}
    </span>
  );
}
export function Pill({ value }: { value: string }) {
  const { t } = useI18n();
  return <span className={"pill " + value}>{t(value)}</span>;
}
export function ErrorMessage({ error }: { error: unknown }) {
  const { t } = useI18n();
  if (!error) return null;
  return (
    <div className="form-error" role="alert">
      {t(error instanceof ApiError ? error.code : "serverError")}
      {error instanceof ApiError && error.requestId && (
        <small className="request-id">
          {t("requestId")}: {error.requestId}
        </small>
      )}
    </div>
  );
}
export function Loading() {
  const { t } = useI18n();
  return (
    <p role="status" className="quiet-empty">
      {t("loading")}
    </p>
  );
}
export function Empty({ filtered = false }: { filtered?: boolean }) {
  const { t } = useI18n();
  return (
    <div className="empty">
      <Icon name="properties" />
      <h3>{t(filtered ? "noResults" : "empty")}</h3>
      <p>{t(filtered ? "noResultsHint" : "emptyHint")}</p>
    </div>
  );
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null),
    id = useId(),
    { t } = useI18n();
  useEffect(() => {
    const node = ref.current;
    node?.showModal();
    return () => node?.close();
  }, []);
  return (
    <dialog ref={ref} aria-labelledby={id} onCancel={onClose}>
      <div className="modal-heading">
        <h2 id={id}>{title}</h2>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label={t("close")}
        >
          ×
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function Field({
  label,
  hint,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: boolean;
}) {
  const id = useId(),
    { t } = useI18n();
  return (
    <label className="field" htmlFor={id}>
      <span>
        {label}
        {props.required && " *"}
      </span>
      <input
        id={id}
        {...props}
        aria-invalid={error || undefined}
        aria-describedby={hint || error ? id + "-hint" : undefined}
      />
      {(hint || error) && (
        <small id={id + "-hint"}>{error ? t("fieldInvalid") : hint}</small>
      )}
    </label>
  );
}
export function Select({
  label,
  name,
  value,
  onChange,
  options,
}: {
  label: string;
  name?: string;
  value: string;
  onChange: (s: string) => void;
  options: [string, string][];
}) {
  return (
    <label className="field">
      <span>{label} *</span>
      <select
        required
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
export function Pagination({
  page,
  pages,
  total,
  onPage,
}: {
  page: number;
  pages: number;
  total: number;
  onPage: (page: number) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="pagination">
      <span>
        {t("recordCount")}: {total} · {t("page")} {page} / {Math.max(1, pages)}
      </span>
      <div>
        <button
          className="button small"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          {t("previous")}
        </button>
        <button
          className="button small"
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
        >
          {t("next")}
        </button>
      </div>
    </div>
  );
}
export function useFormats() {
  const { t, locale } = useI18n();
  return {
    money: (n: number, c: string) =>
      new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(n) +
      " " +
      c,
    date: (s: string) =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(s)),
    price: (
      p: Pick<Property, "price" | "currency" | "dealType" | "rentPeriod">,
    ) =>
      new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(
        p.price,
      ) +
      " " +
      p.currency +
      (p.dealType === "rent"
        ? t(p.rentPeriod === "day" ? "perDay" : "perMonth")
        : ""),
  };
}
export function PropertyCard({
  property: p,
  onOpen,
}: {
  property: Property;
  onOpen?: (id: number) => void;
}) {
  const { t } = useI18n(),
    { price } = useFormats();
  const title = onOpen ? (
    <button className="text-button" onClick={() => onOpen(p.id)}>
      {p.title}
    </button>
  ) : (
    <Link to={"/properties?record=" + p.id}>{p.title}</Link>
  );
  return (
    <article className="property-card">
      <div className="property-image">
        <img
          src={
            "/img/" +
            (p.type === "house"
              ? "house"
              : p.type === "apartment"
                ? "apartment"
                : "interior") +
            ".jpg"
          }
          alt=""
          loading="lazy"
        />
        <div className="image-tags">
          <Pill value={p.status} />
          <Pill value={p.dealType} />
        </div>
        <span className="image-caption">{t("illustrative")}</span>
      </div>
      <div className="property-body">
        <div className="eyebrow">
          MK-{String(p.id).padStart(4, "0")} · {t(p.type)}
        </div>
        <h3>{title}</h3>
        <p className="address">
          {p.district} · {p.address}
        </p>
        <div className="property-facts">
          <span>
            {p.area} {t("sqm")}
          </span>
          <span>
            {t("rooms")}: {p.rooms}
          </span>
        </div>
        <div className="property-price">
          <strong>{price(p)}</strong>
        </div>
      </div>
    </article>
  );
}
