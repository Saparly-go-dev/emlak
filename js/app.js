import { t, language, setLanguage, languages, locale } from "./i18n.js";

const $ = (selector) => document.querySelector(selector);
const app = $("#app"),
  modal = $("#modal");
const state = {
  user: null,
  csrf: null,
  setupRequired: false,
  data: { properties: [], clients: [], deals: [], viewings: [] },
  users: [],
  query: "",
  filter: "",
  type: "",
  busy: false,
};
const paths = {
  home: '<path d="m3 10 9-7 9 7v10H3z"/><path d="M9 20v-7h6v7"/>',
  dashboard:
    '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="12" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 20h7"/>',
  properties:
    '<path d="M4 21V4h11v17M15 10h5v11M8 8h3M8 12h3M8 16h3M2 21h20"/>',
  clients:
    '<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6M18 15a5 5 0 0 1 3 5"/>',
  deals:
    '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V3h8v4M3 13h18M10 13v3h4v-3"/>',
  viewings:
    '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 11h18M7 15h3M14 15h3"/>',
  team: '<circle cx="12" cy="8" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/>',
  search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  pin: '<path d="M19 10c0 6-7 11-7 11S5 16 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
  sparkle: '<path d="m12 3 3 6 6 3-6 3-3 6-3-6-6-3 6-3Z"/>',
  logout: '<path d="M9 4H4v16h5M10 12h11m-5-5 5 5-5 5"/>',
  refresh: '<path d="M20 8a8 8 0 1 0 0 8M20 3v5h-5"/>',
};
const icon = (name) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.home}</svg>`;
const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const money = (value, currency) =>
  `${new Intl.NumberFormat(locale(), { maximumFractionDigits: 2 }).format(value)} ${currency}`;
const date = (value) =>
  new Intl.DateTimeFormat(locale(), {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
const price = (p) =>
  money(p.price, p.currency) +
  (p.dealType === "rent"
    ? t(p.rentPeriod === "day" ? "perDay" : "perMonth")
    : "");
const byId = (table, id) =>
  state.data[table].find((row) => row.id === Number(id));
const page = () =>
  ["dashboard", "properties", "clients", "deals", "viewings", "team"].includes(
    location.hash.slice(2),
  )
    ? location.hash.slice(2)
    : "dashboard";
const pill = (value) => `<span class="pill ${esc(value)}">${t(value)}</span>`;
const empty = (title = "empty", hint = "emptyHint") =>
  `<div class="empty">${icon("properties")}<h3>${t(title)}</h3><p>${t(hint)}</p></div>`;
const languageSelect = () =>
  `<label class="language"><span class="sr-only">${t("language")}</span><select id="language">${Object.entries(
    languages,
  )
    .map(
      ([code, name]) =>
        `<option value="${code}" ${code === language ? "selected" : ""}>${name}</option>`,
    )
    .join("")}</select></label>`;
const addKeys = {
  properties: "addProperty",
  clients: "addClient",
  deals: "addDeal",
  viewings: "addViewing",
  team: "addUser",
};
const statusOptions = {
  properties: ["available", "reserved", "closed"],
  clients: ["new", "contacted", "viewed", "negotiating", "won", "lost"],
  deals: ["new", "viewed", "negotiating", "documents", "won", "lost"],
  viewings: ["scheduled", "done", "cancelled"],
};
const propertyTypes = ["apartment", "house", "office", "commercial", "land"];
let toastTimer;
function toast(message, error = false) {
  const el = $("#toast");
  el.textContent = message;
  el.className = error ? "show error" : "show";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.className = ""), 5000);
}
async function api(path, options = {}) {
  let response;
  try {
    response = await fetch(`/api${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(state.csrf ? { "X-CSRF-Token": state.csrf } : {}),
        ...options.headers,
      },
      ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    });
  } catch {
    throw new Error("networkError");
  }
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("serverError");
  }
  if (!response.ok) {
    if (response.status === 401 && state.user) {
      state.user = null;
      state.csrf = null;
      modal.close();
      render();
    }
    throw new Error(data.error || "serverError");
  }
  return data;
}
async function refresh() {
  const data = await api("/data");
  const users = state.user.role === "admin" ? await api("/users") : [];
  state.data = data;
  state.users = users;
}
function renderAuth() {
  app.innerHTML = `<div class="auth-layout"><section class="auth-story"><a class="brand" href="#/">${icon("home")}<span>Mekan<span class="brand-dot">.</span></span></a><div><span class="eyebrow">MEKAN / CRM</span><h1>${t("welcome")}</h1><p>${t("appSubtitle")}</p><ul>${[1, 2, 3].map((n) => `<li><span>0${n}</span>${t(`authFeature${n}`)}</li>`).join("")}</ul></div><small>RU · EN · TK</small></section><section class="auth-panel"><div class="auth-language">${languageSelect()}</div><form id="auth-form"><span class="eyebrow">${t("workspace")}</span><h2>${t(state.setupRequired ? "setupTitle" : "loginTitle")}</h2><p class="muted">${t(state.setupRequired ? "setupHint" : "loginHint")}</p>${state.setupRequired ? input("name", "", { maxLength: 160, autocomplete: "name" }) : ""}${input("email", "", { type: "email", maxLength: 254, autocomplete: "username" })}${input("password", "", { type: "password", minLength: state.setupRequired ? 10 : 1, maxLength: 128, autocomplete: state.setupRequired ? "new-password" : "current-password", hint: state.setupRequired ? "passwordHint" : "" })}<p class="form-error" role="alert"></p><button class="button primary full" type="submit">${t(state.setupRequired ? "setup" : "login")}${icon("arrow")}</button></form></section></div>`;
}
function render() {
  setLanguage(language);
  document.title = `Mekan — ${t("appSubtitle")}`;
  app.setAttribute("aria-busy", "false");
  if (!state.user) return renderAuth();
  let current = page();
  if (current === "team" && state.user.role !== "admin") current = "dashboard";
  const nav = [
    "dashboard",
    "properties",
    "clients",
    "deals",
    "viewings",
    ...(state.user.role === "admin" ? ["team"] : []),
  ];
  app.innerHTML = `<div class="layout"><aside class="sidebar"><a class="brand" href="#/dashboard">${icon("home")}<span>Mekan<span class="brand-dot">.</span></span></a><div class="workspace-label">${t("workspace")}</div><nav aria-label="${t("workspace")}">${nav.map((key) => `<a href="#/${key}" ${current === key ? 'aria-current="page"' : ""}>${icon(key)}<span>${t(key)}</span>${["properties", "clients"].includes(key) ? `<small>${state.data[key].length}</small>` : ""}</a>`).join("")}</nav><div class="sidebar-bottom"><span class="connection-dot"></span>${t("connection")}</div></aside><div class="main-column"><header class="topbar"><span class="breadcrumb">Mekan <span>/</span> ${t(current)}</span><div class="topbar-actions">${languageSelect()}<div class="user-info"><span class="avatar">${esc(state.user.name.slice(0, 2).toUpperCase())}</span><div><strong>${esc(state.user.name)}</strong><small>${t(state.user.role)}</small></div></div><button class="icon-button" data-action="logout" aria-label="${t("logout")}" title="${t("logout")}">${icon("logout")}</button></div></header><main><div class="page-heading"><div><div class="eyebrow">MEKAN / ${t(current)}</div><h1>${t(current === "dashboard" ? "welcome" : current)}</h1><p>${t({ dashboard: "overviewHint", properties: "propertyHint", clients: "clientHint", deals: "dealHint", viewings: "viewingHint", team: "teamHint" }[current])}</p></div><div class="heading-actions"><button class="icon-button" data-action="refresh" aria-label="${t("refresh")}" title="${t("refresh")}">${icon("refresh")}</button><button class="button primary" data-action="add" data-table="${current === "dashboard" ? "properties" : current}">${icon("plus")}${t(addKeys[current] || "addProperty")}</button></div></div><div id="page-content">${current === "dashboard" ? dashboard() : collection(current)}</div></main><footer>Mekan · ${t("appSubtitle")}</footer></div></div>`;
}
function propertyCard(p) {
  return `<article class="property-card"><div class="property-image"><img src="/img/${p.type === "house" ? "house" : p.type === "apartment" ? "apartment" : "interior"}.jpg" alt="" loading="lazy"><div class="image-tags">${pill(p.status)}<span class="pill neutral">${t(p.dealType)}</span></div><span class="image-caption">${t("illustrative")}</span></div><div class="property-body"><span class="eyebrow">MK-${String(p.id).padStart(4, "0")} · ${t(p.type)}</span><h3><button class="text-button" data-action="detail" data-table="properties" data-id="${p.id}">${esc(p.title)}</button></h3><p class="address">${icon("pin")}${esc(p.district)} · ${esc(p.address)}</p><div class="property-facts"><span>${p.area} ${t("sqm")}</span><span>${t("rooms")}: ${p.rooms}</span></div><div class="property-price"><strong>${price(p)}</strong><button class="icon-button" data-action="detail" data-table="properties" data-id="${p.id}" aria-label="${t("details")}: ${esc(p.title)}">${icon("arrow")}</button></div></div></article>`;
}
function dashboard() {
  const { properties, clients, deals, viewings } = state.data;
  const upcoming = viewings
    .filter(
      (v) => v.status === "scheduled" && Date.parse(v.startsAt) >= Date.now(),
    )
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const stats = [
    [
      "activeProperties",
      properties.filter((p) => p.status === "available").length,
      "properties",
    ],
    [
      "activeClients",
      clients.filter((c) => !["won", "lost"].includes(c.status)).length,
      "clients",
    ],
    [
      "openDeals",
      deals.filter((d) => !["won", "lost"].includes(d.stage)).length,
      "deals",
    ],
    ["upcomingViewings", upcoming.length, "viewings"],
  ];
  const stages = statusOptions.deals.map((stage) => [
    stage,
    deals.filter((d) => d.stage === stage).length,
  ]);
  const totals = ["TMT", "USD"].map((currency) => [
    currency,
    deals
      .filter((d) => d.stage === "won" && d.currency === currency)
      .reduce((sum, d) => sum + d.amount, 0),
  ]);
  return `<div class="stats-grid">${stats.map(([label, value, route], index) => `<a class="stat-card" href="#/${route}"><span class="stat-top">${t(label)}<span class="stat-icon tone-${index}">${icon(route)}</span></span><strong>${value}</strong><span class="stat-link">${t("viewAll")}${icon("arrow")}</span></a>`).join("")}</div><div class="dashboard-middle"><section class="panel"><div class="section-heading"><h2>${t("pipeline")}</h2><a href="#/deals">${t("viewAll")} ↗</a></div><div class="pipeline">${stages.map(([stage, count]) => `<div class="pipeline-row"><span>${t(stage)}</span><progress value="${count}" max="${Math.max(1, deals.length)}" aria-label="${t(stage)}"></progress><b>${count}</b></div>`).join("")}</div></section><section class="panel"><div class="section-heading"><h2>${t("nextAppointments")}</h2><a href="#/viewings">${t("viewAll")} ↗</a></div>${
    upcoming.length
      ? upcoming
          .slice(0, 3)
          .map(
            (v) =>
              `<button class="appointment" data-action="detail" data-table="viewings" data-id="${v.id}"><span class="appointment-icon">${icon("viewings")}</span><span><strong>${esc(byId("properties", v.propertyId)?.title)}</strong><small>${esc(byId("clients", v.clientId)?.name)} · ${date(v.startsAt)}</small></span>${icon("arrow")}</button>`,
          )
          .join("")
      : `<p class="quiet-empty">${t("empty")}</p>`
  }</section></div><section class="volume-strip"><div><strong>${t("closedVolume")}</strong><small>${t("volumeHint")}</small></div><div class="volume-values">${totals.map(([currency, value]) => `<strong>${money(value, currency)}</strong>`).join("")}</div></section><div class="section-heading"><h2>${t("recentProperties")}</h2><a href="#/properties">${t("viewAll")} ↗</a></div>${properties.length ? `<div class="property-grid">${properties.slice(0, 3).map(propertyCard).join("")}</div>` : empty()}`;
}
function filterRows(table) {
  const source = table === "team" ? state.users : state.data[table];
  return source
    .filter((row) => {
      const property = row.propertyId
        ? byId("properties", row.propertyId)
        : null;
      const client = row.clientId ? byId("clients", row.clientId) : null;
      const haystack = [
        row.title,
        row.name,
        row.address,
        row.district,
        row.phone,
        row.email,
        property?.title,
        client?.name,
      ]
        .join(" ")
        .toLowerCase();
      return (
        haystack.includes(state.query.toLowerCase()) &&
        (!state.filter || (row.stage || row.status) === state.filter) &&
        (!state.type || row.dealType === state.type)
      );
    })
    .sort((a, b) =>
      table === "viewings" ? a.startsAt.localeCompare(b.startsAt) : 0,
    );
}
function collection(table) {
  return `<div class="toolbar"><label class="search-field">${icon("search")}<span class="sr-only">${t("search")}</span><input id="search" type="search" placeholder="${t("search")}" value="${esc(state.query)}"></label>${statusOptions[table] ? `<label><span class="sr-only">${t("status")}</span><select id="status-filter"><option value="">${t("allStatuses")}</option>${statusOptions[table].map((key) => `<option value="${key}" ${state.filter === key ? "selected" : ""}>${t(key)}</option>`).join("")}</select></label>` : ""}${["properties", "clients"].includes(table) ? `<label><span class="sr-only">${t("dealType")}</span><select id="type-filter"><option value="">${t("all")}</option>${["sale", "rent"].map((key) => `<option value="${key}" ${state.type === key ? "selected" : ""}>${t(key)}</option>`).join("")}</select></label>` : ""}</div>${table === "viewings" ? `<p class="muted">${t("localTime")}</p>` : ""}<div id="results">${results(table)}</div>`;
}
function results(table) {
  const rows = filterRows(table);
  const source = table === "team" ? state.users : state.data[table];
  if (!rows.length)
    return empty(
      source.length ? "noResults" : "empty",
      source.length ? "noResultsHint" : "emptyHint",
    );
  const count = `<p class="result-count">${t("recordCount")}: ${rows.length}</p>`;
  if (table === "properties")
    return `${count}<div class="property-grid">${rows.map(propertyCard).join("")}</div>`;
  const headers =
    table === "clients"
      ? ["name", "phone", "preferences", "budgetMax", "status"]
      : table === "team"
        ? ["name", "email", "role"]
        : table === "deals"
          ? ["property", "client", "amount", "stage"]
          : ["startsAt", "property", "client", "status"];
  return `${count}<div class="table-wrap"><table><thead><tr>${headers.map((key) => `<th scope="col">${t(key)}</th>`).join("")}${table !== "team" ? `<th scope="col"><span class="sr-only">${t("details")}</span></th>` : ""}</tr></thead><tbody>${rows
    .map((row) => {
      const cells =
        table === "clients"
          ? [
              `<div class="person"><span class="avatar">${esc(row.name.slice(0, 2).toUpperCase())}</span><strong>${esc(row.name)}</strong></div>`,
              esc(row.phone),
              `${t(row.dealType)} · ${t(row.type)}<small>${esc(row.district || t("all"))}</small>`,
              price({ ...row, price: row.budgetMax }),
              pill(row.status),
            ]
          : table === "team"
            ? [esc(row.name), esc(row.email), pill(row.role)]
            : table === "deals"
              ? [
                  esc(byId("properties", row.propertyId)?.title),
                  esc(byId("clients", row.clientId)?.name),
                  money(row.amount, row.currency),
                  pill(row.stage),
                ]
              : [
                  date(row.startsAt),
                  esc(byId("properties", row.propertyId)?.title),
                  esc(byId("clients", row.clientId)?.name),
                  pill(row.status),
                ];
      return `<tr>${cells.map((cell) => `<td>${cell}</td>`).join("")}${table !== "team" ? `<td><button class="button small" data-action="detail" data-table="${table}" data-id="${row.id}">${t("details")}</button></td>` : ""}</tr>`;
    })
    .join("")}</tbody></table></div>`;
}
function input(name, value = "", options = {}) {
  const {
    type = "text",
    label = name,
    required = true,
    hint = "",
    min,
    max,
    minLength,
    maxLength,
    autocomplete,
    step,
  } = options;
  return `<label class="field"><span>${t(label)}${required ? ' <b aria-hidden="true">*</b>' : ""}</span><input name="${name}" type="${type}" value="${esc(value)}" ${required ? "required" : ""} ${min !== undefined ? `min="${min}"` : ""} ${max !== undefined ? `max="${max}"` : ""} ${minLength ? `minlength="${minLength}"` : ""} ${maxLength ? `maxlength="${maxLength}"` : ""} ${autocomplete ? `autocomplete="${autocomplete}"` : ""} ${type === "number" ? `step="${step || "any"}"` : ""}>${hint ? `<small>${t(hint)}</small>` : ""}</label>`;
}
function select(name, value, options, label = name) {
  return `<label class="field"><span>${t(label)} <b aria-hidden="true">*</b></span><select name="${name}" required>${options
    .map((option) => {
      const [key, title] = Array.isArray(option) ? option : [option, t(option)];
      return `<option value="${esc(key)}" ${String(key) === String(value) ? "selected" : ""}>${esc(title)}</option>`;
    })
    .join("")}</select></label>`;
}
function notes(value = "") {
  return `<label class="field wide"><span>${t("notes")}</span><textarea name="notes" rows="3" maxlength="5000">${esc(value)}</textarea></label>`;
}
function openModal(title, content, actions = "") {
  modal.innerHTML = `<div class="modal-heading"><h2 id="modal-title">${esc(title)}</h2><button class="icon-button" data-action="close" aria-label="${t("close")}">×</button></div>${content}${actions ? `<div class="modal-actions">${actions}</div>` : ""}`;
  modal.setAttribute("aria-labelledby", "modal-title");
  if (!modal.open) modal.showModal();
}
function openForm(table, id) {
  const row = id ? byId(table, id) : {};
  if (
    ["deals", "viewings"].includes(table) &&
    (!state.data.properties.length || !state.data.clients.length)
  )
    return toast(t("needRecords"), true);
  let fields = "";
  if (table === "team") {
    fields =
      input("name", "", { maxLength: 160, autocomplete: "name" }) +
      input("email", "", {
        type: "email",
        maxLength: 254,
        autocomplete: "username",
      }) +
      input("password", "", {
        type: "password",
        minLength: 10,
        maxLength: 128,
        hint: "passwordHint",
        autocomplete: "new-password",
      }) +
      select("role", "agent", ["agent", "admin"]);
  } else if (["properties", "clients"].includes(table)) {
    fields +=
      table === "properties"
        ? input("title", row.title, { maxLength: 200 }) +
          input("address", row.address, { maxLength: 300 })
        : input("name", row.name, { maxLength: 160 }) +
          input("phone", row.phone, { type: "tel", maxLength: 40 }) +
          input("email", row.email, {
            type: "email",
            required: false,
            maxLength: 254,
          });
    fields +=
      select("dealType", row.dealType || "sale", ["sale", "rent"]) +
      select("type", row.type || "apartment", propertyTypes) +
      select("currency", row.currency || "TMT", [
        ["TMT", "TMT"],
        ["USD", "USD"],
      ]) +
      `<div id="rent-period-field" ${row.dealType === "rent" ? "" : "hidden"}>${select("rentPeriod", row.rentPeriod || "month", ["month", "day"])}</div>`;
    fields +=
      input("district", row.district, {
        required: table === "properties",
        maxLength: 120,
        hint: table === "clients" ? "anyDistrict" : "",
      }) +
      input("rooms", row.rooms ?? (table === "clients" ? 0 : 2), {
        type: "number",
        min: 0,
        max: 100,
        step: 1,
        hint: table === "clients" ? "anyRooms" : "",
      });
    if (table === "properties")
      fields +=
        input("price", row.price, { type: "number", min: 1, max: 1e12 }) +
        input("area", row.area, { type: "number", min: 1, max: 1e8 }) +
        input("owner", row.owner, { required: false, maxLength: 160 }) +
        input("phone", row.phone, {
          type: "tel",
          required: false,
          maxLength: 40,
        });
    else
      fields +=
        input("budgetMax", row.budgetMax, {
          type: "number",
          min: 1,
          max: 1e12,
        }) +
        input("minArea", row.minArea ?? 0, {
          type: "number",
          min: 0,
          max: 1e8,
        });
    fields +=
      select(
        "status",
        row.status || statusOptions[table][0],
        statusOptions[table],
      ) + notes(row.notes);
  } else {
    fields +=
      select(
        "propertyId",
        row.propertyId || state.data.properties[0].id,
        state.data.properties.map((p) => [p.id, `${p.title} · ${price(p)}`]),
        "property",
      ) +
      select(
        "clientId",
        row.clientId || state.data.clients[0].id,
        state.data.clients.map((c) => [c.id, c.name]),
        "client",
      );
    if (table === "deals")
      fields +=
        input("amount", row.amount, { type: "number", min: 1, max: 1e12 }) +
        select("stage", row.stage || "new", statusOptions.deals);
    else {
      const time = new Date(row.startsAt || Date.now() + 3600000);
      const local = new Date(time.getTime() - time.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      fields +=
        input("startsAt", local, {
          type: "datetime-local",
          hint: "localTime",
        }) +
        select("status", row.status || "scheduled", statusOptions.viewings);
    }
    fields += notes(row.notes);
  }
  openModal(
    t(id ? "edit" : addKeys[table]),
    `<form id="record-form" data-table="${table}" data-id="${id || ""}" data-version="${row.version || ""}"><div class="form-grid">${fields}</div><p class="form-error" role="alert"></p><div class="modal-actions"><button type="button" class="button" data-action="close">${t("cancel")}</button><button type="submit" class="button primary">${t("save")}</button></div></form>`,
  );
}
async function showDetail(table, id) {
  const row = byId(table, id);
  if (!row) return toast(t("notFound"), true);
  const keys =
    table === "properties"
      ? [
          "type",
          "dealType",
          "address",
          "district",
          "price",
          "area",
          "rooms",
          "owner",
          "phone",
          "status",
        ]
      : table === "clients"
        ? [
            "phone",
            "email",
            "type",
            "dealType",
            "district",
            "budgetMax",
            "minArea",
            "rooms",
            "status",
          ]
        : table === "deals"
          ? ["propertyId", "clientId", "amount", "stage"]
          : ["propertyId", "clientId", "startsAt", "status"];
  const valueFor = (key) => {
    if (key === "price" || key === "budgetMax")
      return price({ ...row, price: row[key] });
    if (key === "amount") return money(row.amount, row.currency);
    if (["type", "dealType", "status", "stage"].includes(key))
      return t(row[key]);
    if (key === "propertyId") return esc(byId("properties", row[key])?.title);
    if (key === "clientId") return esc(byId("clients", row[key])?.name);
    if (key === "startsAt") return date(row[key]);
    return esc(row[key] || "—");
  };
  openModal(
    row.title || row.name || `${t(table)} #${row.id}`,
    `<dl class="details-grid">${keys.map((key) => `<div><dt>${t(key === "propertyId" ? "property" : key === "clientId" ? "client" : key)}</dt><dd>${valueFor(key)}</dd></div>`).join("")}</dl>${row.notes ? `<div class="notes"><strong>${t("notes")}</strong><p>${esc(row.notes)}</p></div>` : ""}${table === "clients" ? `<section class="recommendations"><h3>${icon("sparkle")}${t("recommendations")}</h3><p class="muted">${t("matchingHint")}</p><div id="matches" data-client="${id}" aria-live="polite">${t("loading")}</div></section>` : ""}`,
    `<button class="button" data-action="edit" data-table="${table}" data-id="${id}">${t("edit")}</button>${state.user.role === "admin" ? `<button class="button danger" data-action="delete" data-table="${table}" data-id="${id}">${t("remove")}</button>` : ""}`,
  );
  if (table === "clients") {
    try {
      const matches = await api(`/clients/${id}/recommendations`);
      if ($("#matches")?.dataset.client !== String(id)) return;
      $("#matches").innerHTML = matches.length
        ? matches
            .map(
              (item) =>
                `<article class="match-card"><div class="match-top"><div><button class="text-button" data-action="detail" data-table="properties" data-id="${item.property.id}"><strong>${esc(item.property.title)}</strong></button><p>${price(item.property)}</p></div><span class="match-score" title="${t("match")}">${item.score}<small>/ 100</small></span></div><div class="criteria">${item.criteria.map((c) => `<span class="${c.matched ? "yes" : "partial"}" title="${t(c.matched ? "matched" : "partial")}">${c.matched ? "✓" : "·"} ${t(c.key)} <b>${c.value}/${c.weight}</b></span>`).join("")}</div></article>`,
            )
            .join("")
        : `<p>${t("noMatches")}</p>`;
    } catch (error) {
      if ($("#matches")?.dataset.client === String(id))
        $("#matches").textContent = t(error.message);
    }
  }
}
function confirmDelete(table, id) {
  const row = byId(table, id);
  openModal(
    t("deleteTitle"),
    `<p>${esc(row.title || row.name || `#${id}`)}</p><p class="muted">${t("deleteHint")}</p><p class="form-error" role="alert"></p>`,
    `<button class="button" data-action="close">${t("cancel")}</button><button class="button danger" data-action="confirm-delete" data-table="${table}" data-id="${id}" data-version="${row.version}">${t("remove")}</button>`,
  );
}
document.addEventListener("submit", async (event) => {
  const form = event.target;
  if (!["auth-form", "record-form"].includes(form.id)) return;
  event.preventDefault();
  if (state.busy) return;
  state.busy = true;
  const submit = form.querySelector('[type="submit"]');
  submit.disabled = true;
  const errorElement = form.querySelector(".form-error");
  errorElement.textContent = "";
  const data = Object.fromEntries(new FormData(form));
  let committed = false;
  try {
    if (form.id === "auth-form") {
      const result = await api(state.setupRequired ? "/setup" : "/login", {
        method: "POST",
        body: data,
      });
      Object.assign(state, result);
      state.setupRequired = false;
      await refresh();
      render();
    } else {
      const table = form.dataset.table,
        id = form.dataset.id;
      for (const field of [
        "rooms",
        "price",
        "area",
        "budgetMax",
        "minArea",
        "propertyId",
        "clientId",
        "amount",
      ])
        if (field in data) data[field] = Number(data[field]);
      if (data.startsAt) data.startsAt = new Date(data.startsAt).toISOString();
      if (id) data.version = Number(form.dataset.version);
      await api(`/${table === "team" ? "users" : table}${id ? `/${id}` : ""}`, {
        method: id ? "PUT" : "POST",
        body: data,
      });
      committed = true;
      modal.close();
      toast(t("saved"));
      await refresh();
      render();
    }
  } catch (error) {
    if (committed) toast(t(error.message), true);
    else errorElement.textContent = t(error.message);
  } finally {
    state.busy = false;
    submit.disabled = false;
  }
});
document.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-action]");
  if (!button || state.busy) return;
  const { action, table, id } = button.dataset;
  try {
    if (action === "close") modal.close();
    if (action === "add") openForm(table);
    if (action === "edit") openForm(table, Number(id));
    if (action === "detail") await showDetail(table, Number(id));
    if (action === "delete") confirmDelete(table, Number(id));
    if (action === "confirm-delete") {
      state.busy = true;
      button.disabled = true;
      await api(`/${table}/${id}`, {
        method: "DELETE",
        headers: { "If-Match": button.dataset.version },
      });
      modal.close();
      toast(t("deleted"));
      await refresh();
      render();
    }
    if (action === "logout") {
      state.busy = true;
      await api("/logout", { method: "POST" });
      state.user = null;
      state.csrf = null;
      state.data = { properties: [], clients: [], deals: [], viewings: [] };
      render();
    }
    if (action === "refresh") {
      state.busy = true;
      button.disabled = true;
      await refresh();
      render();
    }
    if (action === "retry") await boot();
  } catch (error) {
    const target = modal.open && modal.querySelector(".form-error");
    if (target) target.textContent = t(error.message);
    else toast(t(error.message), true);
  } finally {
    state.busy = false;
    button.disabled = false;
  }
});
document.addEventListener("change", (event) => {
  if (event.target.id === "language") {
    setLanguage(event.target.value);
    render();
  }
  if (event.target.id === "status-filter") {
    state.filter = event.target.value;
    $("#results").innerHTML = results(page());
  }
  if (event.target.id === "type-filter") {
    state.type = event.target.value;
    $("#results").innerHTML = results(page());
  }
  if (event.target.name === "dealType" && $("#rent-period-field"))
    $("#rent-period-field").hidden = event.target.value !== "rent";
});
document.addEventListener("input", (event) => {
  if (event.target.id === "search") {
    state.query = event.target.value;
    $("#results").innerHTML = results(page());
  }
});
window.addEventListener("hashchange", () => {
  state.query = "";
  state.filter = "";
  state.type = "";
  modal.close();
  render();
});
async function boot() {
  try {
    Object.assign(state, await api("/session"));
    if (state.user) await refresh();
    render();
  } catch (error) {
    app.setAttribute("aria-busy", "false");
    app.innerHTML = `<div class="boot"><h1>Mekan</h1><p>${t(error.message)}</p><button class="button" data-action="retry">${t("retry")}</button></div>`;
  }
}
await boot();
  