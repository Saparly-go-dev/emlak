// ===== Mekan — Emläk dolandyryş ulgamy (demo) =====
(function () {
  "use strict";

  // ---------- Icons ----------
  const ICONS = {
    dashboard: '<path d="M3 20h18"/><rect x="5" y="11" width="3" height="7"/><rect x="10.5" y="7" width="3" height="11"/><rect x="16" y="4" width="3" height="14"/>',
    home: '<path d="M4 20V10l8-6 8 6v10"/><path d="M9.5 20v-6h5v6"/>',
    grid: '<rect x="4" y="4" width="6.5" height="6.5"/><rect x="13.5" y="4" width="6.5" height="6.5"/><rect x="4" y="13.5" width="6.5" height="6.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7"/><path d="M21.5 20c0-2.8-1.6-5.1-4-6"/>',
    heart: '<path d="M12 20s-7-4.4-9.2-9A5 5 0 0 1 12 6a5 5 0 0 1 9.2 5C19 15.6 12 20 12 20z"/>',
    deals: '<rect x="3" y="7" width="18" height="13" rx="1.5"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="1.5"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    pin: '<path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
    rooms: '<rect x="4" y="4" width="16" height="16"/><path d="M12 4v9M12 16v4M4 12h5"/>',
    area: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5 9-5z"/><path d="m3 13 9 5 9-5"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    list: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    chevL: '<path d="m15 18-6-6 6-6"/>',
    chevR: '<path d="m9 18 6-6-6-6"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15"/>',
    trend: '<path d="M4 18 18 4M9 4h9v9"/>',
    rent: '<rect x="4" y="5" width="16" height="15"/><path d="M4 10h16M4 15h16"/>',
    wallet: '<rect x="2" y="6" width="20" height="14" rx="1.5"/><path d="M2 10h20M16 15h2"/>',
  };
  const icon = (n, cls = "") => `<svg class="ico ${cls}" viewBox="0 0 24 24">${ICONS[n] || ""}</svg>`;

  // ---------- Helpers ----------
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = (n) => Number(n).toLocaleString("en-US").replace(/,/g, " ");
  const pad = (n) => String(n).padStart(2, "0");
  const code = (p) => "MK-" + String(p.id).padStart(3, "0");
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const initials = (name) => name.replace(/["“”]/g, "").split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  const MONTHS = ["ýanwar", "fewral", "mart", "aprel", "maý", "iýun", "iýul", "awgust", "sentýabr", "oktýabr", "noýabr", "dekabr"];
  const MONTHS_SHORT = ["Ýan", "Few", "Mar", "Apr", "Maý", "Iýn", "Iýl", "Awg", "Sen", "Okt", "Noý", "Dek"];
  const DAYS = ["Ýekşenbe", "Duşenbe", "Sişenbe", "Çarşenbe", "Penşenbe", "Anna", "Şenbe"];
  const DAYS_SHORT = ["Ýb", "Db", "Sb", "Çb", "Pb", "An", "Şb"];

  const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const dateFromOffset = (o) => { const d = today(); d.setDate(d.getDate() + o); return d; };
  const offsetFromDate = (d) => Math.round((d - today()) / 86400000);
  const isoFromOffset = (o) => { const d = dateFromOffset(o); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  const rel = (o) => (o === 0 ? "şu gün" : o === -1 ? "düýn" : o === 1 ? "ertir" : o < 0 ? `${-o} gün öň` : `${o} günden`);
  const longDate = (o) => { const d = dateFromOffset(o); return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${DAYS[d.getDay()].toLowerCase()}`; };

  const short = (n) => (n >= 1e6 ? (n / 1e6).toFixed(2).replace(/\.?0+$/, "") + " mln" : n >= 1000 ? Math.round(n / 1000) + " müň" : String(n));
  const period = (p) => (p.deal === "kerende" ? (p.district === "Awaza" ? " / gün" : " / aý") : "");
  const priceHtml = (p) => `${fmt(p.price)} <small>TMT${period(p)}</small>`;
  const priceText = (p) => `${fmt(p.price)} TMT${period(p)}`;
  const roleText = (c) => (c.interest.deal === "satlyk" ? "Satyn alyjy" : "Kireýine alyjy");
  const interestText = (i) => `${PROPERTY_TYPES[i.type]}${i.rooms ? `, ${i.rooms} otag` : ""}`;
  const city = (d) => (d.includes("etraby") ? "Aşgabat" : d.replace(" şäheri", ""));

  // ---------- Storage ----------
  const LS_KEY = "mekan-demo-v2";
  function seed() {
    return {
      properties: clone(SEED_PROPERTIES), clients: clone(SEED_CLIENTS), deals: clone(SEED_DEALS),
      viewings: clone(SEED_VIEWINGS), favs: [101, 103], nextId: 1000, seedDate: isoFromOffset(0),
    };
  }
  function load() {
    let data = null;
    try { const raw = localStorage.getItem(LS_KEY); if (raw) data = JSON.parse(raw); } catch (e) { /* ignore */ }
    if (!data || !data.properties) return seed();
    // Gün geçen bolsa, otnositel seneleri süýşür
    const [y, m, d] = data.seedDate.split("-").map(Number);
    const diff = offsetFromDate(new Date(y, m - 1, d));
    if (diff) {
      data.properties.forEach((p) => (p.created += diff));
      data.clients.forEach((c) => { c.created += diff; c.lastActivity += diff; c.notes.forEach((n) => (n.at += diff)); });
      data.viewings.forEach((v) => (v.day += diff));
      data.seedDate = isoFromOffset(0);
    }
    return data;
  }
  // Ýüklenen suratlaryň blob salgylary diňe şu sessiýada işleýär, şonuň üçin saklanmaýar
  function save() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(db, (k, v) => (k === "img" && String(v).startsWith("blob:") ? undefined : v))); } catch (e) { /* ignore */ }
  }
  const lsGet = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } };

  let db = load();
  const emptyFilter = () => ({ q: "", deal: "", type: "", rooms: "", district: "", status: "", sort: "new" });
  const ui = {
    pf: emptyFilter(),
    propView: lsGet("mekan-propview") || "grid",
    clientRole: "", clientStatus: "", clientQ: "", weekOffset: 0,
  };

  const P = (id) => db.properties.find((p) => p.id === +id);
  const C = (id) => db.clients.find((c) => c.id === +id);
  const A = (id) => AGENTS.find((a) => a.id === +id) || AGENTS[0];

  // ---------- Media ----------
  // Jaý we kwartira üçin bezeg suratlary, beýlekiler üçin SVG illýustrasiýa
  const PHOTOS = { jay: ["house.jpg", "interior.jpg", "apartment.jpg"], kwartira: ["apartment.jpg", "interior.jpg", "house.jpg"] };
  function photoList(p) {
    if (p.img) return [p.img];
    const base = PHOTOS[p.type];
    if (!base) return null;
    const list = p.type === "kwartira" && p.id % 2 ? [base[1], base[0], base[2]] : base;
    return list.map((f) => "img/" + f);
  }
  function media(p, v = 0) {
    const ph = photoList(p);
    if (ph && v < ph.length) return `<img src="${esc(ph[v])}" alt="${esc(PROPERTY_TYPES[p.type])} üçin bezeg suraty" loading="lazy"/>`;
    return scene(p, v);
  }
  const galleryCount = (p) => { const ph = photoList(p); return ph ? ph.length : 4; };

  let uid = 0;
  const SKIES = [["#e9e4d6", "#f5f3ea"], ["#f3d2bd", "#fbefe6"], ["#dfe3d6", "#f3f5ee"], ["#d9dccd", "#f1f2ea"]];
  const WALLS = ["#efe8da", "#e3e6dc", "#f3ece2", "#e6e9df", "#ece2d8"];
  const ACCENTS = ["#3a3a3a", "#272e28", "#b3794d", "#7c8a61", "#c5683f"];

  function tree(x, y, s = 1) {
    return `<rect x="${x - 2}" y="${y - 6}" width="4" height="${16 * s}" fill="#6f5a45"/><circle cx="${x}" cy="${y - 14 * s}" r="${14 * s}" fill="#8a9a70"/><circle cx="${x + 8 * s}" cy="${y - 8 * s}" r="${9 * s}" fill="#76875e"/>`;
  }
  function scene(p, v = 0) {
    const id = "sk" + ++uid;
    const sky = SKIES[(p.id + v) % SKIES.length];
    const wall = WALLS[(p.id * 3 + v) % WALLS.length];
    const ac = ACCENTS[(p.id + v * 2) % ACCENTS.length];
    const glass = "#8fa3a0";
    let b = "";
    if (p.type === "ofis") {
      b += `<rect x="55" y="95" width="70" height="120" fill="#c9cfc4"/><rect x="280" y="70" width="70" height="145" fill="#d3d8cd"/>`;
      b += `<rect x="140" y="24" width="120" height="191" fill="${glass}"/><rect x="140" y="24" width="120" height="191" fill="url(#${id}g)"/>`;
      for (let r = 0; r < 12; r++) b += `<rect x="140" y="${38 + r * 15}" width="120" height="1.5" fill="#ffffff55"/>`;
      for (let c = 1; c < 6; c++) b += `<rect x="${140 + c * 20}" y="24" width="1.5" height="191" fill="#ffffff40"/>`;
      b += `<rect x="186" y="192" width="28" height="23" fill="${ac}"/>` + tree(40, 212, .9) + tree(372, 212, 1);
    } else if (p.type === "sowda") {
      b += `<rect x="50" y="115" width="300" height="100" fill="${wall}"/><rect x="50" y="100" width="300" height="18" fill="#272e28"/>`;
      for (let i = 0; i < 10; i++) b += `<path d="M${50 + i * 30} 118 h30 l-4 18 h-22 z" fill="${i % 2 ? "#fffef8" : "#3a3a3a"}"/>`;
      b += `<rect x="70" y="148" width="110" height="67" fill="${glass}"/><rect x="220" y="148" width="110" height="67" fill="${glass}"/><rect x="186" y="150" width="28" height="65" fill="#4c5a52"/>`;
      b += `<rect x="70" y="148" width="110" height="67" fill="url(#${id}g)"/><rect x="220" y="148" width="110" height="67" fill="url(#${id}g)"/>`;
    } else if (p.type === "yer") {
      b += `<rect x="0" y="175" width="400" height="40" fill="#c6cdb0"/>`;
      for (let i = 0; i < 8; i++) b += `<path d="M0 ${180 + i * 5} H400" stroke="#b2bb97" stroke-width="1.5"/>`;
      b += `<rect x="90" y="170" width="220" height="45" fill="none" stroke="#fffef8" stroke-width="2" stroke-dasharray="8 6"/>`;
      b += `<rect x="285" y="128" width="4" height="50" fill="#6f5a45"/><rect x="262" y="120" width="50" height="26" rx="2" fill="#3a3a3a"/><rect x="270" y="130" width="34" height="3" fill="#fff"/><rect x="270" y="136" width="22" height="3" fill="#fff"/>`;
      b += tree(50, 190, 1.2) + tree(360, 195, .9);
    } else if (p.type === "jay") {
      b += `<rect x="112" y="122" width="176" height="93" fill="${wall}"/><polygon points="96,128 200,62 304,128" fill="#272e28"/>`;
      b += `<rect x="132" y="146" width="34" height="28" fill="${glass}"/><rect x="234" y="146" width="34" height="28" fill="${glass}"/>`;
      b += `<rect x="186" y="160" width="28" height="55" fill="#3a3a3a"/>` + tree(60, 205, 1.3) + tree(345, 208, 1.1);
    } else {
      b += `<rect x="122" y="46" width="156" height="169" fill="${wall}"/><rect x="117" y="38" width="166" height="10" fill="#272e28"/>`;
      for (let r = 0; r < 7; r++) for (let c = 0; c < 5; c++) b += `<rect x="${134 + c * 28}" y="${58 + r * 19}" width="17" height="12" fill="${(r + c) % 5 ? glass : "#f3c9a8"}"/>`;
      b += `<rect x="186" y="190" width="28" height="25" fill="#3a3a3a"/>` + tree(70, 210, 1) + tree(320, 212, 1.2);
    }
    return `<svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient>
      <linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".2"/></linearGradient></defs>
      <rect width="400" height="250" fill="url(#${id})"/>
      <circle cx="${330 - v * 60}" cy="52" r="20" fill="#fff8ee" opacity=".9"/>
      <path d="M0 165 L55 118 L105 148 L170 92 L238 142 L300 104 L360 135 L400 120 V250 H0Z" fill="#b9bfae" opacity=".5"/>
      ${b}
      <rect y="214" width="400" height="36" fill="#d6d8cc"/><rect y="214" width="400" height="4" fill="#a9b48f"/>
    </svg>`;
  }

  function mapSvg(p) {
    const x = 90 + ((p.id * 53) % 220), y = 50 + ((p.id * 31) % 80);
    return `<svg viewBox="0 0 400 175" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="400" height="175" fill="#ecebe1"/>
      <path d="M-10 150 C80 120 140 175 230 140 S360 110 410 130" stroke="#c9d5d3" stroke-width="14" fill="none"/>
      <ellipse cx="300" cy="45" rx="60" ry="30" fill="#d8dec8"/><ellipse cx="70" cy="60" rx="40" ry="22" fill="#d8dec8"/>
      ${[30, 80, 125].map((yy) => `<path d="M0 ${yy} H400" stroke="#fffef8" stroke-width="6"/>`).join("")}
      ${[60, 140, 220, 300, 370].map((xx) => `<path d="M${xx} 0 V175" stroke="#fffef8" stroke-width="6"/>`).join("")}
      <path d="M0 0 L400 175" stroke="#dfe6ef" stroke-width="9"/>
      <circle cx="${x}" cy="${y}" r="26" fill="#3a3a3a" opacity=".15"/>
      <path d="M${x} ${y + 4} c-10-12-14-18-14-24a14 14 0 0 1 28 0c0 6-4 12-14 24z" fill="#3a3a3a"/><circle cx="${x}" cy="${y - 20}" r="5" fill="#fff"/>
    </svg>`;
  }

  // ---------- Pills ----------
  const PROP_PILL = { isjen: "green", bron: "brown", satyldy: "gray" };
  const CLIENT_PILL = { taze: "orange", habarlasyldy: "gray", gorkezildi: "brown", gepleshik: "slate", yapyldy: "green" };
  const propPill = (s) => `<span class="pill ${PROP_PILL[s]}">${PROPERTY_STATUS[s]}</span>`;
  const clientPill = (s) => `<span class="pill ${CLIENT_PILL[s]}">${CLIENT_STATUS[s]}</span>`;
  const rolePill = (c) => `<span class="pill ${c.interest.deal === "satlyk" ? "green" : "brown"}">${roleText(c)}</span>`;
  const avatar = (name, cls = "") => `<span class="avatar ${cls}">${esc(initials(name))}</span>`;
  const viewPill = (v) => `<span class="pill ${v.status === "done" ? "gray" : "orange"}">${v.status === "done" ? "Bolup geçdi" : "Meýilleşdirilen"}</span>`;

  // ---------- Matching ----------
  function matchScore(c, p) {
    if (p.status === "satyldy") return 0;
    const i = c.interest;
    if (i.deal !== p.deal || i.type !== p.type) return 0;
    let s = 40;
    if (p.price >= c.budgetMin * 0.9 && p.price <= c.budgetMax * 1.1) s += 30;
    else if (p.price <= c.budgetMax * 1.25) s += 10;
    else return 0;
    if (i.district === p.district) s += 20;
    if (!i.rooms || i.rooms === p.rooms) s += 10;
    else if (Math.abs(i.rooms - p.rooms) === 1) s += 5;
    return s;
  }
  const scoreBadge = (s) => `<span class="score ${s < 75 ? "mid" : ""}">${s}%</span>`;

  // ---------- Shared blocks ----------
  const heading = (title, desc = "", actions = "") => `
    <div class="page-header">
      <div><h1>${title}</h1>${desc ? `<p>${desc}</p>` : ""}</div>
      ${actions ? `<div class="heading-actions">${actions}</div>` : ""}
    </div>`;

  const infoBoxes = (items) => `<section class="info-boxes">${items.map(([t, n, ic, color, note]) =>
    `<div class="info-box"><span class="info-icon ${color}">${icon(ic)}</span><div><small>${t}</small><b>${n}</b>${note ? `<em>${note}</em>` : ""}</div></div>`).join("")}</section>`;

  function statsStrip() {
    const sale = db.properties.filter((p) => p.deal === "satlyk").length;
    return infoBoxes([
      ["Jemi emläk", db.properties.length, "home", "blue"],
      ["Satlyk", sale, "trend", "green"],
      ["Kireýine", db.properties.length - sale, "rent", "orange"],
      ["Müşderiler", db.clients.length, "users", "purple"],
    ]);
  }

  function propCard(p) {
    const fav = db.favs.includes(p.id);
    const specs = p.type === "yer"
      ? `<span>Meýdany: <b>${p.area} m²</b></span><span><b>${(p.area / 100).toFixed(0)}</b> sotuk</span>`
      : `<span>Otag: <b>${p.rooms}</b></span><span>Meýdany: <b>${p.area} m²</b></span><span>Gat: <b>${p.floor}/${p.floors}</b></span>`;
    return `<article class="prop" data-go="#/emlak/${p.id}">
      <div class="prop-img">${media(p)}
        <div class="prop-badges"><span class="badge ${p.deal === "kerende" ? "rent" : ""}">${DEAL_TYPES[p.deal]}</span>${p.status !== "isjen" ? `<span class="badge status">${PROPERTY_STATUS[p.status]}</span>` : ""}</div>
        <button class="fav ${fav ? "on" : ""}" data-fav="${p.id}" aria-label="${fav ? "Saýlananlardan aýyr" : "Saýlananlara goş"}" aria-pressed="${fav}">${icon("heart")}</button>
      </div>
      <div class="prop-body">
        <div class="prop-price">${priceHtml(p)}</div>
        <div class="prop-title">${esc(p.title)}</div>
        <div class="prop-addr">${icon("pin")}${p.address.startsWith(city(p.district)) ? "" : esc(city(p.district)) + ", "}${esc(p.address)}</div>
        <div class="prop-specs">${specs}</div>
      </div>
    </article>`;
  }

  const miniProp = (p, extra = "") => `<a class="mini-prop" href="#/emlak/${p.id}"><div class="thumb">${media(p)}</div><div><strong>${esc(p.title)}</strong><small>${priceText(p)}</small></div>${extra}</a>`;

  // ---------- Views ----------
  const view = $("#view");

  // --- Emläkler (baş sahypa) we Saýlananlar
  function filteredProps(onlyFavs) {
    const f = ui.pf, q = f.q.trim().toLowerCase();
    const list = db.properties.filter((p) =>
      (!onlyFavs || db.favs.includes(p.id)) &&
      (!q || (p.title + " " + p.address + " " + p.district).toLowerCase().includes(q)) &&
      (!f.deal || p.deal === f.deal) && (!f.type || p.type === f.type) &&
      (!f.district || p.district === f.district) && (!f.status || p.status === f.status) &&
      (!f.rooms || (f.rooms === "4" ? p.rooms >= 4 : p.rooms === +f.rooms)));
    const sorts = { new: (a, b) => b.created - a.created, cheap: (a, b) => a.price - b.price, expensive: (a, b) => b.price - a.price, area: (a, b) => b.area - a.area, popular: (a, b) => b.views - a.views };
    return list.sort(sorts[f.sort]);
  }

  function viewProperties(onlyFavs = false) {
    const f = ui.pf;
    const opt = (obj, val, all) => `<option value="">${all}</option>` + Object.entries(obj).map(([k, v]) => `<option value="${esc(k)}" ${val === k ? "selected" : ""}>${esc(v)}</option>`).join("");
    const addBtn = `<button class="btn btn-primary" data-add="property">+ Täze emläk</button>`;
    view.innerHTML = `
      ${onlyFavs ? heading("Saýlanan emläkler", "Bellenen emläkleriň sanawy", addBtn) : heading("Emläkler", "Agentligiň satlyk we kireýine emläkleri", addBtn)}
      ${onlyFavs ? "" : statsStrip()}
      <div class="listing">
        <aside class="card filter-panel">
          <div class="card-head"><h3>Süzgüç</h3><button class="link-btn" id="pf-clear">Arassala</button></div>
          <div class="card-body">
            <div class="fgroup wide"><label for="pf-q">Gözleg</label><input class="input" id="pf-q" placeholder="Ady ýa-da salgysy" value="${esc(f.q)}"/></div>
            <div class="fgroup wide"><label>Ylalaşyk</label><div class="radio-row" id="deal-tabs">
              ${[["", "Ählisi"], ["satlyk", "Satlyk"], ["kerende", "Kireýine"]].map(([k, v]) => `<button class="${f.deal === k ? "active" : ""}" data-deal="${k}">${v}</button>`).join("")}
            </div></div>
            <div class="fgroup"><label for="pf-type">Görnüşi</label><select class="select" id="pf-type">${opt(PROPERTY_TYPES, f.type, "Ählisi")}</select></div>
            <div class="fgroup"><label for="pf-rooms">Otag sany</label><select class="select" id="pf-rooms">${opt({ 1: "1", 2: "2", 3: "3", 4: "4 we köp" }, f.rooms, "Ählisi")}</select></div>
            <div class="fgroup"><label for="pf-district">Ýerleşýän ýeri</label><select class="select" id="pf-district">${opt(Object.fromEntries(DISTRICTS.map((d) => [d, d])), f.district, "Ählisi")}</select></div>
            <div class="fgroup"><label for="pf-status">Ýagdaýy</label><select class="select" id="pf-status">${opt(PROPERTY_STATUS, f.status, "Ählisi")}</select></div>
          </div>
        </aside>
        <div>
          <div class="toolbar">
            <span class="result" id="pf-count"></span>
            <div class="right">
              <select class="select sort-select" id="pf-sort" aria-label="Tertiplemek">
                ${Object.entries({ new: "Täzeleri öňde", cheap: "Arzandan gymmada", expensive: "Gymmatdan arzana", area: "Meýdany boýunça", popular: "Köp görlenler" }).map(([k, v]) => `<option value="${k}" ${f.sort === k ? "selected" : ""}>${v}</option>`).join("")}
              </select>
              <div class="view-switch"><button data-pv="grid" class="${ui.propView === "grid" ? "active" : ""}" aria-label="Tor görnüşi">${icon("grid")}</button><button data-pv="list" class="${ui.propView === "list" ? "active" : ""}" aria-label="Sanaw görnüşi">${icon("list")}</button></div>
            </div>
          </div>
          <div id="prop-results"></div>
        </div>
      </div>`;

    const renderResults = () => {
      const list = filteredProps(onlyFavs);
      $("#pf-count").innerHTML = `Tapyldy: <b>${list.length}</b>`;
      $("#prop-results").innerHTML = list.length
        ? `<div class="props ${ui.propView === "list" ? "list-mode" : ""}">${list.map(propCard).join("")}</div>`
        : `<div class="empty-state"><h3>${onlyFavs ? "Saýlanan emläk ýok" : "Emläk tapylmady"}</h3><p>${onlyFavs ? "Emlägi saýlamak üçin suratdaky ýürek belgisine basyň." : "Süzgüç şertlerini üýtgedip görüň."}</p></div>`;
    };
    renderResults();

    $("#pf-q").addEventListener("input", (e) => { f.q = e.target.value; renderResults(); });
    ["type", "rooms", "district", "status", "sort"].forEach((k) => $("#pf-" + k).addEventListener("change", (e) => { f[k] = e.target.value; renderResults(); }));
    $$("#deal-tabs button").forEach((b) => b.addEventListener("click", () => { f.deal = b.dataset.deal; $$("#deal-tabs button").forEach((x) => x.classList.toggle("active", x === b)); renderResults(); }));
    $("#pf-clear").onclick = () => { ui.pf = emptyFilter(); viewProperties(onlyFavs); };
    $$("[data-pv]").forEach((b) => b.addEventListener("click", () => { ui.propView = b.dataset.pv; lsSet("mekan-propview", ui.propView); $$("[data-pv]").forEach((x) => x.classList.toggle("active", x === b)); renderResults(); }));
  }

  // --- Emläk sahypasy
  function viewProperty(id) {
    const p = P(id);
    if (!p) return notFound();
    setCrumb("Emläkler / " + code(p));
    const agent = A(p.agentId);
    const matches = db.clients.map((c) => ({ c, s: matchScore(c, p) })).filter((x) => x.s >= 50).sort((a, b) => b.s - a.s);
    const views = db.viewings.filter((v) => v.propertyId === p.id).sort((a, b) => b.day - a.day);
    const specs = p.type === "yer"
      ? [["Meýdany", `${p.area} m²`], ["Sotuk", (p.area / 100).toFixed(0)], ["Ýagdaýy", DEAL_TYPES[p.deal]], ["Görlen", `${p.views} gezek`]]
      : [["Meýdany", `${p.area} m²`], ["Otag sany", `${p.rooms} otag`], ["Gat", `${p.floor} / ${p.floors}`], ["Ýagdaýy", DEAL_TYPES[p.deal]], ["Remont", p.renovation], ["Mebel", p.furnished ? "Bar" : "Ýok"], ["Görlen", `${p.views} gezek`], ["Goşulan", rel(p.created)]];
    const hasStockPhoto = !!PHOTOS[p.type] && !p.img;
    const n = Math.min(galleryCount(p), 4);

    view.innerHTML = `
      <div class="crumbs"><a href="#/">Emläkler</a>${icon("chevR")}<span>${code(p)}</span></div>
      <div class="detail-grid">
        <div style="display:flex;flex-direction:column;gap:20px;min-width:0">
          <div class="card gallery">
            <div class="gallery-main" id="g-main">${media(p, 0)}</div>
            ${n > 1 ? `<div class="thumbs">${Array.from({ length: n }, (_, v) => `<button data-v="${v}" class="${v === 0 ? "active" : ""}" aria-label="Surat ${v + 1}">${media(p, v)}</button>`).join("")}</div>` : ""}
          </div>
          <div class="card card-pad">
            <div class="detail-title">
              <div>
                <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap"><span class="pill ${p.deal === "satlyk" ? "green" : "brown"}">${DEAL_TYPES[p.deal]}</span>${propPill(p.status)}<span class="pill gray">${PROPERTY_TYPES[p.type]}</span></div>
                <h1>${esc(p.title)}</h1>
                <div class="prop-addr" style="margin:8px 0 0">${icon("pin")}${esc(p.address)}, ${esc(p.district)}</div>
              </div>
              <div class="detail-price">${priceHtml(p)}${p.type !== "yer" && p.deal === "satlyk" ? `<span class="per-m">${fmt(Math.round(p.price / p.area))} TMT / m²</span>` : ""}</div>
            </div>
            <div class="specs">${specs.map(([k, v]) => `<div class="spec"><small>${k}</small><b>${esc(v)}</b></div>`).join("")}</div>
            <div class="section-title">Düşündiriş</div>
            <p class="desc">${esc(p.description)}</p>
            <div class="section-title">Aýratynlyklary</div>
            <div class="chips">${p.features.length ? p.features.map((x) => `<span class="chip">${icon("check")}${esc(x)}</span>`).join("") : `<span class="muted">Görkezilmedi</span>`}</div>
            <div class="section-title">Ýerleşişi</div>
            <div class="map">${mapSvg(p)}</div>
            ${hasStockPhoto ? `<p class="source-note">Bezeg üçin ulanylan suratlar. Suratlar bu nusga salgysyny görkezmeýär.</p>` : ""}
          </div>
        </div>

        <div class="side-stack">
          <div class="card card-pad">
            <div class="person">${avatar(agent.name)}<div><strong>${agent.name}</strong><small>${agent.role} · ${agent.phone}</small></div></div>
            <div class="actions">
              <button class="btn btn-primary full" data-add="viewing" data-prop="${p.id}">${icon("calendar")}Görkeziş bellemek</button>
              <a class="btn btn-outline" href="tel:${p.ownerPhone.replace(/\s/g, "")}">${icon("phone")}Jaň et</a>
              <button class="btn btn-outline" id="copy-btn">${icon("link")}Göçür</button>
            </div>
            <div class="field" style="margin-top:18px"><label for="p-status">Ýagdaýy</label>
              <select class="select" id="p-status">${Object.entries(PROPERTY_STATUS).map(([k, v]) => `<option value="${k}" ${p.status === k ? "selected" : ""}>${v}</option>`).join("")}</select>
            </div>
          </div>

          <div class="contact-box">Emläk eýesi: <strong>${esc(p.owner)}</strong><br/>Telefon: ${esc(p.ownerPhone)}<br/>Emläk belgisi: ${code(p)}</div>

          <div class="card">
            <div class="card-head"><h3>Laýyk müşderiler</h3><span class="count-chip">${matches.length}</span></div>
            <div class="card-body"><div class="list">
              ${matches.length ? matches.map(({ c, s }) => `<a class="list-item" href="#/musderi/${c.id}">${avatar(c.name, "sm")}<div class="grow"><strong>${esc(c.name)}</strong><small>Býujeti: ${short(c.budgetMin)}–${short(c.budgetMax)} TMT</small></div>${scoreBadge(s)}</a>`).join("") : `<div class="muted">Häzirlikçe laýyk müşderi ýok</div>`}
            </div></div>
          </div>

          <div class="card">
            <div class="card-head"><h3>Görkezişler</h3><span class="count-chip">${views.length}</span></div>
            <div class="card-body"><div class="list">
              ${views.length ? views.map((v) => { const c = C(v.clientId); return c ? `<a class="list-item" href="#/musderi/${c.id}">${avatar(c.name, "sm")}<div class="grow"><strong>${esc(c.name)}</strong><small>${longDate(v.day)} · ${v.time}</small></div>${viewPill(v)}</a>` : ""; }).join("") : `<div class="muted">Entek görkeziş bolmady</div>`}
            </div></div>
          </div>
          <button class="btn btn-danger" id="del-prop">${icon("trash")}Emlägi poz</button>
        </div>
      </div>`;

    $$(".thumbs button").forEach((b) => b.addEventListener("click", () => {
      $("#g-main").innerHTML = media(p, +b.dataset.v);
      $$(".thumbs button").forEach((x) => x.classList.toggle("active", x === b));
    }));
    $("#p-status").addEventListener("change", (e) => { p.status = e.target.value; save(); toast(`Ýagdaýy üýtgedildi: ${PROPERTY_STATUS[p.status]}`); viewProperty(id); renderNav(); });
    $("#copy-btn").addEventListener("click", () => {
      const text = `${p.title}\n${priceText(p)}\n${p.address}, ${p.district}\n${agent.name}: ${agent.phone}`;
      (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(() => toast("Maglumat göçürildi"), () => toast("Göçürip bolmady"));
    });
    $("#del-prop").addEventListener("click", () => {
      if (!confirm("Bu emlägi pozmalymy?")) return;
      db.properties = db.properties.filter((x) => x.id !== p.id);
      db.deals = db.deals.filter((d) => d.propertyId !== p.id);
      db.viewings = db.viewings.filter((v) => v.propertyId !== p.id);
      db.favs = db.favs.filter((x) => x !== p.id);
      save(); toast("Emläk pozuldy"); location.hash = "#/";
    });
  }

  // --- Müşderiler
  function viewClients() {
    const counts = (s) => db.clients.filter((c) => !s || c.status === s).length;
    view.innerHTML = `
      ${heading("Müşderiler", "Satyn alyjylar we kireýine alyjylar", `<button class="btn btn-primary" data-add="client">+ Täze müşderi</button>`)}
      <div class="card">
        <div>
          <div class="utabs" id="c-tabs">
            ${[["", "Ählisi"], ...Object.entries(CLIENT_STATUS)].map(([k, v]) => `<button class="${ui.clientStatus === k ? "active" : ""}" data-status="${k}">${v}<span class="n">(${counts(k)})</span></button>`).join("")}
          </div>
          <div class="clients-bar">
            <input class="input" id="c-q" placeholder="Ady ýa-da telefon belgisi boýunça gözleg" value="${esc(ui.clientQ)}" aria-label="Gözleg"/>
            <select class="select" id="c-role" aria-label="Müşderiniň görnüşi"><option value="">Ähli müşderiler</option><option value="satlyk" ${ui.clientRole === "satlyk" ? "selected" : ""}>Satyn alyjylar</option><option value="kerende" ${ui.clientRole === "kerende" ? "selected" : ""}>Kireýine alyjylar</option></select>
            <button class="btn" id="c-clear">Arassala</button>
          </div>
        </div>
        <div class="table-wrap" id="c-table"></div>
        <div class="muted" style="padding:14px 0;font-size:13px" id="c-count"></div>
      </div>`;

    const renderTable = () => {
      const q = ui.clientQ.trim().toLowerCase().replace(/\s/g, "");
      const list = db.clients.filter((c) => (!ui.clientStatus || c.status === ui.clientStatus) && (!ui.clientRole || c.interest.deal === ui.clientRole) &&
        (!q || (c.name + c.phone).toLowerCase().replace(/\s/g, "").includes(q))).sort((a, b) => b.lastActivity - a.lastActivity);
      $("#c-count").textContent = `Jemi: ${list.length} müşderi`;
      $("#c-table").innerHTML = list.length ? `<table class="table">
        <thead><tr><th>Ady</th><th>Görnüşi</th><th>Islegi</th><th>Býujeti (TMT)</th><th>Ýagdaýy</th><th>Agent</th><th>Soňky işjeňlik</th></tr></thead>
        <tbody>${list.map((c) => `<tr data-go="#/musderi/${c.id}">
          <td><div class="cell-person">${avatar(c.name, "sm")}<div><strong>${esc(c.name)}</strong><small>${esc(c.phone)}</small></div></div></td>
          <td>${rolePill(c)}</td>
          <td data-l="Islegi">${interestText(c.interest)}, ${esc(city(c.interest.district))}</td>
          <td data-l="Býujeti">${fmt(c.budgetMin)} – ${fmt(c.budgetMax)}</td>
          <td>${clientPill(c.status)}</td>
          <td data-l="Agent">${A(c.agentId).name}</td>
          <td data-l="Soňky işjeňlik">${rel(c.lastActivity)}</td>
        </tr>`).join("")}</tbody></table>` : `<div style="padding:30px;text-align:center" class="muted">Müşderi tapylmady</div>`;
    };
    renderTable();
    $("#c-q").addEventListener("input", (e) => { ui.clientQ = e.target.value; renderTable(); });
    $("#c-role").addEventListener("change", (e) => { ui.clientRole = e.target.value; renderTable(); });
    $("#c-clear").onclick = () => { ui.clientQ = ""; ui.clientRole = ""; ui.clientStatus = ""; viewClients(); };
    $$("#c-tabs button").forEach((b) => b.addEventListener("click", () => { ui.clientStatus = b.dataset.status; $$("#c-tabs button").forEach((x) => x.classList.toggle("active", x === b)); renderTable(); }));
  }

  function viewClient(id) {
    const c = C(id);
    if (!c) return notFound();
    setCrumb("Müşderiler / " + c.name);
    const a = A(c.agentId);
    const keys = Object.keys(CLIENT_STATUS);
    const idx = keys.indexOf(c.status);
    const matches = db.properties.map((p) => ({ p, s: matchScore(c, p) })).filter((x) => x.s >= 50).sort((x, y) => y.s - x.s);
    const views = db.viewings.filter((v) => v.clientId === c.id).sort((x, y) => y.day - x.day);
    const notes = [...c.notes].sort((x, y) => y.at - x.at);

    view.innerHTML = `
      <div class="crumbs"><a href="#/musderiler">Müşderiler</a>${icon("chevR")}<span>${esc(c.name)}</span></div>
      <div class="client-grid">
        <div class="side-stack">
          <div class="card profile">
            ${avatar(c.name, "lg")}
            <h2>${esc(c.name)}</h2>
            <div style="margin:10px 0 6px;display:flex;gap:6px;justify-content:center;flex-wrap:wrap">${rolePill(c)}${clientPill(c.status)}</div>
            <div class="muted">${esc(c.phone)}</div>
            <div class="actions">
              <a class="btn btn-primary" href="tel:${c.phone.replace(/\s/g, "")}">${icon("phone")}Jaň et</a>
              <button class="btn btn-outline" data-add="viewing" data-client="${c.id}">${icon("calendar")}Görkeziş</button>
            </div>
            <div class="kv">
              <div><span>Islegi</span><b>${DEAL_TYPES[c.interest.deal]} · ${interestText(c.interest)}</b></div>
              <div><span>Ýeri</span><b>${esc(c.interest.district)}</b></div>
              <div><span>Býujeti</span><b>${fmt(c.budgetMin)} – ${fmt(c.budgetMax)} TMT</b></div>
              <div><span>Çeşme</span><b>${esc(c.source)}</b></div>
              <div><span>Agent</span><b>${a.name}</b></div>
              <div><span>Goşulan</span><b>${longDate(c.created)}</b></div>
            </div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:20px;min-width:0">
          <div class="card">
            <div class="card-head"><h3>Satuw tapgyry</h3><span class="muted">Üýtgetmek üçin basyň</span></div>
            <div class="card-body"><div class="stepper">
              ${keys.map((k, i) => `<button class="step ${i < idx ? "done" : i === idx ? "current" : ""}" data-step="${k}"><i></i><span>${CLIENT_STATUS[k]}</span></button>`).join("")}
            </div></div>
          </div>
          <div class="card">
            <div class="card-head"><h3>Laýyk emläkler</h3><span class="count-chip">${matches.length}</span></div>
            <div class="card-body">${matches.length ? `<div class="mini-props">${matches.map(({ p, s }) => miniProp(p, scoreBadge(s))).join("")}</div>` : `<div class="muted">Häzirlikçe laýyk emläk ýok. Býujeti ýa-da islegleri giňeldip görüň.</div>`}</div>
          </div>
          <div class="card">
            <div class="card-head"><h3>Görkezişler</h3><span class="count-chip">${views.length}</span></div>
            <div class="card-body"><div class="list">
              ${views.length ? views.map((v) => { const p = P(v.propertyId); const d = dateFromOffset(v.day); return p ? `<a class="list-item" href="#/emlak/${p.id}"><div class="date-badge ${v.day === 0 ? "today" : ""}"><b>${d.getDate()}</b><span>${MONTHS_SHORT[d.getMonth()]}</span></div><div class="grow"><strong>${esc(p.title)}</strong><small>${v.time} · ${priceText(p)}</small></div>${viewPill(v)}</a>` : ""; }).join("") : `<div class="muted">Görkeziş ýok</div>`}
            </div></div>
          </div>
          <div class="card">
            <div class="card-head"><h3>Bellikler we taryh</h3></div>
            <div class="card-body">
              <form class="note-form" id="note-form"><input class="input" id="note-input" placeholder="Täze bellik ýazyň…" autocomplete="off" aria-label="Täze bellik"/><button class="btn btn-primary" type="submit">Goş</button></form>
              <div class="timeline" style="margin-top:20px">
                ${notes.map((n) => `<div class="tl-item"><span class="tl-dot"></span><div><small>${rel(n.at)} · ${longDate(n.at)}</small><p>${esc(n.text)}</p></div></div>`).join("")}
              </div>
            </div>
          </div>
        </div>
      </div>`;

    $$("[data-step]").forEach((b) => b.addEventListener("click", () => {
      if (c.status === b.dataset.step) return;
      c.status = b.dataset.step; c.lastActivity = 0;
      c.notes.push({ at: 0, text: `Ýagdaýy üýtgedildi: «${CLIENT_STATUS[c.status]}»` });
      save(); toast(`Ýagdaýy: ${CLIENT_STATUS[c.status]}`); viewClient(id); renderNav();
    }));
    $("#note-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const t = $("#note-input").value.trim();
      if (!t) return;
      c.notes.push({ at: 0, text: t }); c.lastActivity = 0; save(); toast("Bellik goşuldy"); viewClient(id);
    });
  }

  // --- Ylalaşyklar (Kanban)
  function viewDeals() {
    const colors = ["#8a96a3", "#6a4fb3", "#d9730d", "#3a3a3a", "#2e7d32"];
    const total = db.deals.filter((d) => d.stage !== "tamamlandy" && P(d.propertyId)?.deal === "satlyk").reduce((s, d) => s + d.amount, 0);
    view.innerHTML = `
      ${heading("Ylalaşyklar", `Kartoçkany başga sütüne süýşürip, tapgyry üýtgedip bolýar. Açyk satuwlaryň jemi: ${fmt(total)} TMT`)}
      <div class="kanban">
        ${DEAL_STAGES.map((st, i) => {
          const items = db.deals.filter((d) => d.stage === st.id);
          const sum = items.reduce((s, d) => s + d.amount, 0);
          return `<div class="kcol" data-stage="${st.id}" style="--c:${colors[i]}">
            <div class="kcol-head"><h4><i style="background:${colors[i]}"></i>${st.name}</h4><span class="count-chip">${items.length}</span></div>
            <div class="kcol-sum">${fmt(sum)} TMT</div>
            <div class="kcards">${items.map((d) => {
              const p = P(d.propertyId), c = C(d.clientId), a = A(d.agentId);
              if (!p || !c) return "";
              return `<div class="kcard" draggable="true" data-deal="${d.id}">
                <div class="kcard-top"><div class="thumb">${media(p)}</div><div><strong>${esc(p.title)}</strong><small class="muted">${esc(city(p.district))}</small></div></div>
                <div class="kcard-client">${icon("user")}${esc(c.name)}</div>
                <div class="kcard-foot"><b>${fmt(d.amount)} <small>TMT${period(p)}</small></b>
                  <div style="display:flex;gap:6px;align-items:center">${avatar(a.name, "sm")}${i < DEAL_STAGES.length - 1 ? `<button class="icon-btn sq" data-next="${d.id}" title="Indiki tapgyr" aria-label="Indiki tapgyr">${icon("chevR")}</button>` : ""}</div>
                </div>
              </div>`;
            }).join("")}</div>
          </div>`;
        }).join("")}
      </div>`;

    const move = (dealId, stage) => {
      const d = db.deals.find((x) => x.id === +dealId);
      if (!d || d.stage === stage) return;
      d.stage = stage;
      if (stage === "tamamlandy") { const p = P(d.propertyId); if (p) p.status = "satyldy"; const c = C(d.clientId); if (c) c.status = "yapyldy"; }
      save(); toast(`Ylalaşyk «${DEAL_STAGES.find((s) => s.id === stage).name}» tapgyryna geçirildi`); viewDeals(); renderNav();
    };
    $$(".kcard").forEach((k) => {
      k.addEventListener("dragstart", (e) => { e.dataTransfer.setData("text/plain", k.dataset.deal); k.classList.add("dragging"); });
      k.addEventListener("dragend", () => k.classList.remove("dragging"));
      k.addEventListener("click", (e) => { if (e.target.closest("[data-next]")) return; const d = db.deals.find((x) => x.id === +k.dataset.deal); location.hash = `#/emlak/${d.propertyId}`; });
    });
    $$(".kcol").forEach((col) => {
      col.addEventListener("dragover", (e) => { e.preventDefault(); col.classList.add("over"); });
      col.addEventListener("dragleave", () => col.classList.remove("over"));
      col.addEventListener("drop", (e) => { e.preventDefault(); col.classList.remove("over"); move(e.dataTransfer.getData("text/plain"), col.dataset.stage); });
    });
    $$("[data-next]").forEach((b) => b.addEventListener("click", () => {
      const d = db.deals.find((x) => x.id === +b.dataset.next);
      const i = DEAL_STAGES.findIndex((s) => s.id === d.stage);
      move(d.id, DEAL_STAGES[i + 1].id);
    }));
  }

  // --- Senenama
  function viewCalendar() {
    const t = today();
    const mondayOffset = -((t.getDay() + 6) % 7) + ui.weekOffset * 7;
    const days = Array.from({ length: 7 }, (_, i) => mondayOffset + i);
    const d0 = dateFromOffset(days[0]), d6 = dateFromOffset(days[6]);
    const range = d0.getMonth() === d6.getMonth()
      ? `${d0.getDate()}–${d6.getDate()} ${MONTHS[d0.getMonth()]} ${d0.getFullYear()}`
      : `${d0.getDate()} ${MONTHS[d0.getMonth()]} – ${d6.getDate()} ${MONTHS[d6.getMonth()]}`;
    const weekCount = db.viewings.filter((v) => v.day >= days[0] && v.day <= days[6]).length;

    view.innerHTML = `
      ${heading("Senenama", `Bu hepdede ${weekCount} görkeziş`, `
        <div class="week-nav">
          <button class="icon-btn" id="w-prev" aria-label="Öňki hepde">${icon("chevL")}</button>
          <strong>${range}</strong>
          <button class="icon-btn" id="w-next" aria-label="Indiki hepde">${icon("chevR")}</button>
        </div>
        <button class="btn btn-outline" id="w-today">Şu gün</button>
        <button class="btn btn-primary" data-add="viewing">+ Görkeziş bellemek</button>`)}
      <div class="card week-scroll"><div class="week">
        ${days.map((o) => {
          const d = dateFromOffset(o);
          const evs = db.viewings.filter((v) => v.day === o).sort((a, b) => a.time.localeCompare(b.time));
          return `<div class="day ${o === 0 ? "today" : ""} ${d.getDay() === 0 || d.getDay() === 6 ? "weekend" : ""}">
            <div class="day-head"><span>${DAYS_SHORT[d.getDay()]}</span><b>${d.getDate()}</b></div>
            ${evs.map((v) => { const p = P(v.propertyId), c = C(v.clientId); return p && c ? `<div class="event ${v.status === "done" ? "done" : ""}" data-ev="${v.id}" tabindex="0" role="button"><b>${v.time}</b><strong>${esc(p.title.split(",")[0])}</strong><small>${esc(c.name)}</small></div>` : ""; }).join("")}
          </div>`;
        }).join("")}
      </div></div>`;

    $("#w-prev").onclick = () => { ui.weekOffset--; viewCalendar(); };
    $("#w-next").onclick = () => { ui.weekOffset++; viewCalendar(); };
    $("#w-today").onclick = () => { ui.weekOffset = 0; viewCalendar(); };
    $$("[data-ev]").forEach((el) => {
      el.addEventListener("click", () => openViewing(+el.dataset.ev));
      el.addEventListener("keydown", (e) => { if (e.key === "Enter") openViewing(+el.dataset.ev); });
    });
  }

  function openViewing(id) {
    const v = db.viewings.find((x) => x.id === id);
    const p = P(v.propertyId), c = C(v.clientId), a = A(v.agentId);
    openModal({
      label: "Görkeziş maglumatlary",
      body: `<h2>${esc(p.title)}</h2>${miniProp(p)}
        <div class="kv">
          <div><span>Wagty</span><b>${longDate(v.day)}, ${v.time}</b></div>
          <div><span>Müşderi</span><b><a href="#/musderi/${c.id}" style="color:var(--primary-ink)">${esc(c.name)}</a> · ${esc(c.phone)}</b></div>
          <div><span>Agent</span><b>${a.name}</b></div>
          <div><span>Ýagdaýy</span><b>${v.status === "done" ? "Bolup geçdi" : "Meýilleşdirilen"}</b></div>
        </div>`,
      foot: `<button class="btn btn-ghost btn-danger" id="v-del">${icon("trash")}Ýatyr</button>${v.status !== "done" ? `<button class="btn btn-primary" id="v-done">${icon("check")}Bolup geçdi</button>` : ""}`,
      mount: (m) => {
        $("#v-del", m).onclick = () => { db.viewings = db.viewings.filter((x) => x.id !== id); save(); closeModal(); toast("Görkeziş ýatyryldy"); render(); };
        const done = $("#v-done", m);
        if (done) done.onclick = () => {
          v.status = "done";
          if (["taze", "habarlasyldy"].includes(c.status)) c.status = "gorkezildi";
          c.notes.push({ at: 0, text: `«${p.title}» görkezildi.` }); c.lastActivity = 0;
          save(); closeModal(); toast("Görkeziş tamamlandy"); render();
        };
        $$("a", m).forEach((x) => x.addEventListener("click", closeModal));
      },
    });
  }

  // --- Hasabat (analitika)
  function viewReport() {
    const active = db.properties.filter((p) => p.status === "isjen").length;
    const open = db.deals.filter((d) => d.stage !== "tamamlandy");
    const openSum = open.filter((d) => P(d.propertyId)?.deal === "satlyk").reduce((s, d) => s + d.amount, 0);
    const rev = SEED_REVENUE;
    const growth = Math.round(((rev[5] - rev[4]) / rev[4]) * 100);
    const max = Math.max(...rev);
    const now = new Date();
    const months = rev.map((_, i) => MONTHS_SHORT[(now.getMonth() - 5 + i + 12) % 12]);
    const sources = CLIENT_SOURCES.map((s) => [s, db.clients.filter((c) => c.source === s).length]).sort((a, b) => b[1] - a[1]);
    const sMax = Math.max(...sources.map((x) => x[1]), 1);
    const upcoming = db.viewings.filter((v) => v.status === "plan" && v.day >= 0).sort((a, b) => a.day - b.day || a.time.localeCompare(b.time)).slice(0, 5);
    const agents = AGENTS.map((a) => ({ a, n: db.deals.filter((d) => d.agentId === a.id).length, done: db.deals.filter((d) => d.agentId === a.id && d.stage === "tamamlandy").length }));

    view.innerHTML = `
      ${heading("Hasabat", `Şu gün: ${longDate(0)}`)}
      ${infoBoxes([
        ["Işjeň emläkler", active, "home", "blue"],
        ["Açyk ylalaşyklar", open.length, "deals", "orange", `${short(openSum)} TMT satuw`],
        ["Täze müşderiler", db.clients.filter((c) => c.created >= -7).length, "users", "purple", "soňky 7 günde"],
        ["Şu aýky komissiýa", fmt(rev[5]) + " TMT", "wallet", "green", `geçen aýdan +${growth}%`],
      ])}
      <div class="grid dash-grid">
        <div class="card">
          <div class="card-head"><h3>Komissiýa girdejisi</h3><span class="muted">Soňky 6 aý, TMT</span></div>
          <div class="card-body"><div class="chart">
            ${rev.map((r, i) => `<div class="bar-col"><div class="bar ${i === 5 ? "current" : ""}" style="height:${(r / max) * 85}%"><span>${short(r)}</span></div><small>${months[i]}</small></div>`).join("")}
          </div></div>
        </div>
        <div class="card">
          <div class="card-head"><h3>Müşderiler nireden gelýär</h3></div>
          <div class="card-body">${sources.map(([src, n]) => `<div class="hbar"><span>${src}</span><div class="hbar-track"><div class="hbar-fill" style="width:${(n / sMax) * 100}%"></div></div><b>${n}</b></div>`).join("")}</div>
        </div>
        <div class="card">
          <div class="card-head"><h3>Ýakyn görkezişler</h3><a href="#/senenama">Senenama</a></div>
          <div class="card-body"><div class="list">
            ${upcoming.length ? upcoming.map((v) => {
              const p = P(v.propertyId), c = C(v.clientId), d = dateFromOffset(v.day);
              return p && c ? `<a class="list-item" href="#/emlak/${p.id}"><div class="date-badge ${v.day === 0 ? "today" : ""}"><b>${d.getDate()}</b><span>${DAYS_SHORT[d.getDay()]}</span></div><div class="grow"><strong>${esc(p.title)}</strong><small>${icon("clock", "inline")} ${v.time} · ${esc(c.name)}</small></div>${avatar(A(v.agentId).name, "sm")}</a>` : "";
            }).join("") : `<div class="muted">Meýilleşdirilen görkeziş ýok</div>`}
          </div></div>
        </div>
        <div class="card">
          <div class="card-head"><h3>Agentler</h3></div>
          <div class="card-body"><div class="list">
            ${agents.map(({ a, n, done }) => `<div class="list-item">${avatar(a.name)}<div class="grow"><strong>${a.name}</strong><small>${a.role} · ${n} ylalaşyk</small></div><span class="pill green">${done} tamam</span></div>`).join("")}
          </div></div>
        </div>
      </div>`;
  }

  function notFound() {
    view.innerHTML = `<div class="empty-state"><h3>Sahypa tapylmady</h3><p>Bu ýazgy pozulan bolmagy mümkin.</p><a class="btn btn-outline" href="#/">Emläklere gaýt</a></div>`;
  }

  // ---------- Modals ----------
  function openModal({ label, body, foot, mount }) {
    const root = $("#modal-root");
    root.innerHTML = `<div class="modal-backdrop"><div class="modal" role="dialog" aria-modal="true" aria-label="${esc(label)}">
      <div class="modal-head"><span>${esc(label)}</span><button class="close" data-close aria-label="Ýap">${icon("x")}</button></div>
      <div class="modal-content">${body}</div>
      <div class="modal-foot">${foot}</div></div></div>`;
    const bd = $(".modal-backdrop", root);
    bd.addEventListener("mousedown", (e) => { if (e.target === bd) closeModal(); });
    $$("[data-close]", root).forEach((b) => b.addEventListener("click", closeModal));
    mount && mount(root);
    const first = $(".modal input, .modal select", root);
    first && first.focus();
  }
  function closeModal() { $("#modal-root").innerHTML = ""; }

  const field = (label, html, cls = "", err = "Bu meýdany dolduryň") => `<div class="field ${cls}"><label>${label}</label>${html}<div class="err">${err}</div></div>`;
  const options = (obj, sel) => Object.entries(obj).map(([k, v]) => `<option value="${k}" ${String(sel) === String(k) ? "selected" : ""}>${esc(v)}</option>`).join("");
  const districtOpts = (sel) => DISTRICTS.map((d) => `<option ${d === sel ? "selected" : ""}>${d}</option>`).join("");
  const agentOpts = () => AGENTS.map((a) => `<option value="${a.id}">${a.name}</option>`).join("");
  const formFoot = (label) => `<button class="btn" data-close>Ýatyr</button><button class="btn btn-primary" id="save">${label}</button>`;

  function validate(root, rules) {
    let ok = true;
    rules.forEach(([name, test]) => {
      const el = $(`[name="${name}"]`, root);
      const bad = !test(el.value.trim());
      el.closest(".field").classList.toggle("invalid", bad);
      if (bad) ok = false;
    });
    return ok;
  }
  const formData = (root) => Object.fromEntries($$("[name]", root).map((el) => [el.name, el.type === "checkbox" ? el.checked : el.type === "file" ? el.files[0] : el.value.trim()]));

  function addProperty() {
    openModal({
      label: "Täze emläk",
      body: `<h2>Emläk goş</h2><form class="form-grid" id="f">
        ${field("Emlägiň ady", `<input class="input" name="title" maxlength="80" placeholder="Meselem: 2 otagly kwartira, Parahat 4"/>`, "full")}
        ${field("Geleşigiň görnüşi", `<select class="select" name="deal">${options(DEAL_TYPES, "satlyk")}</select>`)}
        ${field("Emlägiň görnüşi", `<select class="select" name="type">${options(PROPERTY_TYPES, "kwartira")}</select>`)}
        ${field("Baha (TMT; kireýine bolsa aýlyk)", `<input class="input" name="price" type="number" min="1" placeholder="750000"/>`, "", "Dogry baha giriziň")}
        ${field("Ýeri", `<select class="select" name="district">${districtOpts()}</select>`)}
        ${field("Doly salgy", `<input class="input" name="address" maxlength="180" placeholder="Köçe, jaý"/>`, "full")}
        ${field("Meýdany (m²)", `<input class="input" name="area" type="number" min="1" placeholder="90"/>`, "", "Meýdany giriziň")}
        ${field("Otag sany", `<input class="input" name="rooms" type="number" min="0" value="2"/>`)}
        ${field("Gaty", `<input class="input" name="floor" type="number" min="0" value="1"/>`)}
        ${field("Jemi gat", `<input class="input" name="floors" type="number" min="0" value="5"/>`)}
        ${field("Emläk eýesi", `<input class="input" name="owner" maxlength="70" placeholder="Ady we familiýasy"/>`)}
        ${field("Eýesiniň telefony", `<input class="input" name="ownerPhone" placeholder="+993 6X XX XX XX"/>`)}
        ${field("Remont", `<select class="select" name="renovation"><option>Ýewro remont</option><option>Gowy remont</option><option>Orta</option><option>Remontsyz</option></select>`)}
        ${field("Agent", `<select class="select" name="agentId">${agentOpts()}</select>`)}
        ${field("Surat (islege görä)", `<input class="input" style="padding-top:9px" type="file" name="photo" accept="image/jpeg,image/png,image/webp"/>`, "full", "JPG, PNG ýa-da WebP, 10 MB-dan kiçi")}
        ${field("Goşmaça maglumat", `<textarea class="input" name="description" rows="2" maxlength="1000"></textarea>`, "full")}
        <label class="check full"><input type="checkbox" name="furnished"/> Mebelli</label>
      </form><p class="form-note">Maglumatlar şu brauzerde saklanýar. Ýüklenen surat diňe şu sessiýada görünýär.</p>`,
      foot: formFoot("Emlägi goş"),
      mount: (m) => {
        $("#save", m).onclick = () => {
          const fileOk = () => { const f = $('[name="photo"]', m).files[0]; return !f || (f.size < 1e7 && ["image/jpeg", "image/png", "image/webp"].includes(f.type)); };
          if (!validate(m, [["title", (v) => v.length > 2], ["price", (v) => +v > 0], ["address", (v) => v.length > 2], ["area", (v) => +v > 0], ["photo", fileOk]])) return;
          const d = formData(m);
          const p = {
            id: ++db.nextId, title: d.title, type: d.type, deal: d.deal, price: +d.price, district: d.district, address: d.address,
            rooms: +d.rooms || 0, area: +d.area, floor: +d.floor || 0, floors: +d.floors || 0, renovation: d.renovation, furnished: d.furnished,
            features: d.furnished ? ["Mebelli"] : [], status: "isjen", agentId: +d.agentId, owner: d.owner || "—", ownerPhone: d.ownerPhone || "—",
            created: 0, views: 0, featured: false, description: d.description || "Goşmaça maglumat girizilmedi.",
          };
          if (d.photo) p.img = URL.createObjectURL(d.photo);
          db.properties.unshift(p); save(); closeModal(); toast("Emläk goşuldy"); renderNav(); location.hash = `#/emlak/${p.id}`;
        };
      },
    });
  }

  function addClient() {
    openModal({
      label: "Täze müşderi",
      body: `<h2>Müşderi goş</h2><form class="form-grid" id="f">
        ${field("Ady we familiýasy", `<input class="input" name="name" maxlength="70" placeholder="Meselem: Aýna Myradowa"/>`)}
        ${field("Telefon", `<input class="input" name="phone" placeholder="+993 6X XX XX XX"/>`, "", "Telefon belgisini giriziň")}
        ${field("Müşderiniň görnüşi", `<select class="select" name="deal"><option value="satlyk">Satyn alyjy</option><option value="kerende">Kireýine alyjy</option></select>`)}
        ${field("Emlägiň görnüşi", `<select class="select" name="type">${options(PROPERTY_TYPES, "kwartira")}</select>`)}
        ${field("Otag sany", `<input class="input" name="rooms" type="number" min="0" value="2"/>`)}
        ${field("Ýeri", `<select class="select" name="district">${districtOpts()}</select>`)}
        ${field("Býujeti (min, TMT)", `<input class="input" name="budgetMin" type="number" min="0" placeholder="500000"/>`, "", "Býujeti giriziň")}
        ${field("Býujeti (max, TMT)", `<input class="input" name="budgetMax" type="number" min="0" placeholder="800000"/>`, "", "Max ≥ min bolmaly")}
        ${field("Çeşme", `<select class="select" name="source">${CLIENT_SOURCES.map((s) => `<option>${s}</option>`).join("")}</select>`)}
        ${field("Agent", `<select class="select" name="agentId">${agentOpts()}</select>`)}
        ${field("Islegi barada", `<textarea class="input" name="note" rows="3" maxlength="500" placeholder="Müşderiniň islegleri"></textarea>`, "full")}
      </form><p class="form-note">Maglumatlar şu brauzerde saklanýar.</p>`,
      foot: formFoot("Müşderini goş"),
      mount: (m) => {
        $("#save", m).onclick = () => {
          const minV = () => +$('[name="budgetMin"]', m).value;
          if (!validate(m, [["name", (v) => v.length > 2], ["phone", (v) => v.replace(/\D/g, "").length >= 8], ["budgetMin", (v) => +v > 0], ["budgetMax", (v) => +v > 0 && +v >= minV()]])) return;
          const d = formData(m);
          const c = {
            id: ++db.nextId, name: d.name, phone: d.phone, source: d.source, status: "taze",
            interest: { deal: d.deal, type: d.type, rooms: +d.rooms || 0, district: d.district },
            budgetMin: +d.budgetMin, budgetMax: +d.budgetMax, agentId: +d.agentId, created: 0, lastActivity: 0,
            notes: [{ at: 0, text: d.note || `Täze müşderi goşuldy (${d.source}).` }],
          };
          db.clients.unshift(c); save(); closeModal(); toast("Müşderi goşuldy"); renderNav(); location.hash = `#/musderi/${c.id}`;
        };
      },
    });
  }

  function addViewing(propId, clientId) {
    const props = db.properties.filter((p) => p.status !== "satyldy");
    openModal({
      label: "Täze görkeziş",
      body: `<h2>Görkeziş bellemek</h2><form class="form-grid" id="f">
        ${field("Emläk", `<select class="select" name="propertyId">${props.map((p) => `<option value="${p.id}" ${+propId === p.id ? "selected" : ""}>${esc(p.title)}</option>`).join("")}</select>`, "full")}
        ${field("Müşderi", `<select class="select" name="clientId">${db.clients.map((c) => `<option value="${c.id}" ${+clientId === c.id ? "selected" : ""}>${esc(c.name)} — ${esc(c.phone)}</option>`).join("")}</select>`, "full")}
        ${field("Senesi", `<input class="input" type="date" name="date" value="${isoFromOffset(1)}"/>`, "", "Senäni saýlaň")}
        ${field("Wagty", `<input class="input" type="time" name="time" value="11:00"/>`, "", "Wagty saýlaň")}
      </form>`,
      foot: formFoot("Bellemek"),
      mount: (m) => {
        $("#save", m).onclick = () => {
          if (!validate(m, [["date", (v) => !!v], ["time", (v) => !!v]])) return;
          const d = formData(m);
          const [y, mo, da] = d.date.split("-").map(Number);
          const p = P(d.propertyId), c = C(d.clientId);
          const day = offsetFromDate(new Date(y, mo - 1, da));
          db.viewings.push({ id: ++db.nextId, propertyId: p.id, clientId: c.id, day, time: d.time, agentId: p.agentId, status: "plan" });
          c.notes.push({ at: 0, text: `Görkeziş bellendi: «${p.title}», ${longDate(day)} ${d.time}.` }); c.lastActivity = 0;
          if (c.status === "taze") c.status = "habarlasyldy";
          save(); closeModal(); toast(`Görkeziş bellendi: ${longDate(day)}, ${d.time}`); renderNav(); render();
        };
      },
    });
  }

  // ---------- Toast ----------
  function toast(msg) {
    const el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    el.innerHTML = `${icon("check")}<span>${esc(msg)}</span>`;
    $("#toast-root").appendChild(el);
    setTimeout(() => { el.style.transition = "opacity .3s"; el.style.opacity = "0"; setTimeout(() => el.remove(), 300); }, 2600);
  }

  // ---------- Nav & router ----------
  let currentKey = "";
  const setCrumb = (t) => (document.title = `${t} — Mekan`);
  function renderNav(key = currentKey) {
    currentKey = key;
    const items = [
      ["emlakler", "#/", "Emläkler", ""],
      ["musderiler", "#/musderiler", "Müşderiler", ""],
      ["saylananlar", "#/saylananlar", "Saýlananlar", db.favs.length || ""],
      ["ylalasyklar", "#/ylalasyklar", "Ylalaşyklar", ""],
      ["senenama", "#/senenama", "Senenama", db.viewings.filter((v) => v.day === 0 && v.status === "plan").length || ""],
      ["hasabat", "#/hasabat", "Hasabat", ""],
    ];
    $("#nav").innerHTML = items.map(([k, h, l, n]) =>
      `<a href="${h}" class="${k === key ? "active" : ""}" ${k === key ? 'aria-current="page"' : ""}>${l}${n !== "" ? ` <span class="count">${n}</span>` : ""}</a>`).join("");
  }

  const routes = [
    [/^\/?$/, () => viewProperties(false), "emlakler", "Emläkler"],
    [/^\/saylananlar$/, () => viewProperties(true), "saylananlar", "Saýlananlar"],
    [/^\/emlak\/(\d+)$/, viewProperty, "emlakler", "Emläkler"],
    [/^\/musderiler$/, viewClients, "musderiler", "Müşderiler"],
    [/^\/musderi\/(\d+)$/, viewClient, "musderiler", "Müşderiler"],
    [/^\/ylalasyklar$/, viewDeals, "ylalasyklar", "Ylalaşyklar"],
    [/^\/senenama$/, viewCalendar, "senenama", "Senenama"],
    [/^\/hasabat$/, viewReport, "hasabat", "Hasabat"],
  ];
  let lastPath = null;
  function render() {
    const path = location.hash.replace(/^#/, "") || "/";
    for (const [re, fn, key, crumb] of routes) {
      const m = path.match(re);
      if (m) {
        setCrumb(crumb);
        fn(...m.slice(1));
        renderNav(key);
        if (path !== lastPath) window.scrollTo(0, 0);
        lastPath = path;
        closeSidebar();
        return;
      }
    }
    notFound();
  }

  // ---------- Global events ----------
  document.addEventListener("click", (e) => {
    const fav = e.target.closest("[data-fav]");
    if (fav) {
      e.stopPropagation();
      const id = +fav.dataset.fav;
      const on = db.favs.includes(id);
      db.favs = on ? db.favs.filter((x) => x !== id) : [...db.favs, id];
      save(); renderNav();
      toast(on ? "Saýlananlardan aýryldy" : "Saýlananlara goşuldy");
      if (currentKey === "saylananlar") render();
      else { fav.classList.toggle("on", !on); fav.setAttribute("aria-pressed", String(!on)); }
      return;
    }
    const add = e.target.closest("[data-add]");
    if (add) {
      const t = add.dataset.add;
      if (t === "property") addProperty();
      else if (t === "client") addClient();
      else addViewing(add.dataset.prop, add.dataset.client);
      return;
    }
    const go = e.target.closest("[data-go]");
    if (go && !e.target.closest("a, button")) { location.hash = go.dataset.go; return; }
    if (!e.target.closest("#global-search")) $("#global-search-results").classList.remove("open");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closeModal(); $("#global-search-results").classList.remove("open"); closeSidebar(); }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); $("#global-search-input").focus(); }
  });

  // Sidebar (mobile)
  const closeSidebar = () => { $("#sidebar").classList.remove("open"); $("#scrim").classList.remove("open"); };
  $("#menu-btn").innerHTML = icon("menu");
  $("#menu-btn").addEventListener("click", () => { $("#sidebar").classList.add("open"); $("#scrim").classList.add("open"); });
  $("#scrim").addEventListener("click", closeSidebar);

  // Theme
  const themeBtn = $("#theme-btn");
  const isDark = () => { const t = document.documentElement.dataset.theme; return t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches; };
  const paintThemeBtn = () => (themeBtn.innerHTML = icon(isDark() ? "sun" : "moon"));
  const savedTheme = lsGet("mekan-theme");
  if (savedTheme) document.documentElement.dataset.theme = savedTheme;
  paintThemeBtn();
  themeBtn.addEventListener("click", () => {
    const next = isDark() ? "light" : "dark";
    document.documentElement.dataset.theme = next; lsSet("mekan-theme", next); paintThemeBtn();
  });

  // Notifications
  $("#bell-btn").innerHTML = icon("bell");
  $("#bell-btn").addEventListener("click", () => {
    const newC = db.clients.filter((c) => c.created === 0);
    const todayV = db.viewings.filter((v) => v.day === 0 && v.status === "plan");
    openModal({
      label: "Bildirişler",
      body: `<h2>Şu günüň habarlary</h2><div class="list">
        ${newC.map((c) => `<a class="list-item" href="#/musderi/${c.id}">${avatar(c.name, "sm")}<div class="grow"><strong>Täze müşderi: ${esc(c.name)}</strong><small>${esc(c.source)} · ${roleText(c)} · ${interestText(c.interest)}</small></div></a>`).join("")}
        ${todayV.map((v) => { const p = P(v.propertyId), c = C(v.clientId); return p && c ? `<a class="list-item" href="#/emlak/${p.id}"><div class="date-badge today"><b>${v.time.slice(0, 2)}</b><span>${v.time.slice(3)}</span></div><div class="grow"><strong>Şu gün ${v.time} — görkeziş</strong><small>${esc(p.title)} · ${esc(c.name)}</small></div></a>` : ""; }).join("")}
        ${!newC.length && !todayV.length ? `<div class="muted">Täze bildiriş ýok</div>` : ""}
      </div>`,
      foot: `<button class="btn" data-close>Ýap</button>`,
      mount: (m) => $$("a", m).forEach((a) => a.addEventListener("click", closeModal)),
    });
    $("#bell-btn").classList.remove("has-dot");
  });

  // Global search
  $(".search-ico").innerHTML = icon("search");
  const sInput = $("#global-search-input"), sRes = $("#global-search-results");
  sInput.addEventListener("input", () => {
    const q = sInput.value.trim().toLowerCase();
    if (!q) { sRes.classList.remove("open"); return; }
    const qd = q.replace(/\s/g, "");
    const ps = db.properties.filter((p) => (p.title + " " + p.address + " " + p.district).toLowerCase().includes(q)).slice(0, 5);
    const cs = db.clients.filter((c) => c.name.toLowerCase().includes(q) || c.phone.replace(/\s/g, "").includes(qd)).slice(0, 5);
    sRes.innerHTML = (ps.length ? `<div class="group">Emläkler</div>` + ps.map((p) => `<a href="#/emlak/${p.id}"><span class="thumb">${media(p)}</span><span><b>${esc(p.title)}</b><small>${priceText(p)}</small></span></a>`).join("") : "")
      + (cs.length ? `<div class="group">Müşderiler</div>` + cs.map((c) => `<a href="#/musderi/${c.id}">${avatar(c.name, "sm")}<span><b>${esc(c.name)}</b><small>${esc(c.phone)}</small></span></a>`).join("") : "")
      || `<div class="empty">«${esc(sInput.value)}» boýunça hiç zat tapylmady</div>`;
    sRes.classList.add("open");
  });
  sRes.addEventListener("click", (e) => { if (e.target.closest("a")) { sRes.classList.remove("open"); sInput.value = ""; } });

  // Reset
  $("#reset-demo").addEventListener("click", () => {
    if (!confirm("Ähli demo maglumatlary başlangyç ýagdaýyna dikeldilsinmi?")) return;
    db = seed(); save(); toast("Demo maglumatlary dikeldildi"); render();
  });

  window.addEventListener("hashchange", render);
  render();
})();
