/* ==========================================================================
   CareGrid — Shared App Shell
   Session state persists in sessionStorage (cleared when the tab closes),
   mirroring how a real front-desk workstation would behave between logins.
   ========================================================================== */

const Session = {
  KEY: "caregrid_session",
  get() {
    try { return JSON.parse(sessionStorage.getItem(this.KEY)) || {}; }
    catch (e) { return {}; }
  },
  set(patch) {
    const cur = this.get();
    sessionStorage.setItem(this.KEY, JSON.stringify({ ...cur, ...patch }));
  },
  clear() { sessionStorage.removeItem(this.KEY); },
};

const ICONS = {
  logo: `<svg viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="9" fill="url(#g)"/><path d="M16 8v16M8 16h16" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/><defs><linearGradient id="g" x1="0" y1="0" x2="32" y2="32"><stop stop-color="#1C5CD1"/><stop offset="1" stop-color="#0B2B5C"/></linearGradient></defs></svg>`,
  chevron: `<svg viewBox="0 0 20 20" fill="none"><path d="M7.5 5l5 5-5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  search: `<svg viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.6"/><path d="M17 17l-4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  user: `<svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3.4" stroke="currentColor" stroke-width="1.5"/><path d="M3.5 17c1.4-3.4 4-5 6.5-5s5.1 1.6 6.5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  logout: `<svg viewBox="0 0 20 20" fill="none"><path d="M8 17H5a1.5 1.5 0 0 1-1.5-1.5v-11A1.5 1.5 0 0 1 5 3h3M13.5 14l3.5-4-3.5-4M17 10H7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  bell: `<svg viewBox="0 0 20 20" fill="none"><path d="M10 3.5c-2.2 0-3.8 1.8-3.8 4v2.3c0 .6-.2 1.1-.6 1.6l-.9 1.1c-.5.6-.1 1.5.7 1.5h9.2c.8 0 1.2-.9.7-1.5l-.9-1.1c-.4-.5-.6-1-.6-1.6V7.5c0-2.2-1.6-4-3.8-4z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M8.5 15.5a1.5 1.5 0 0 0 3 0" stroke="currentColor" stroke-width="1.4"/></svg>`,
};

function riskBadge(level) {
  const map = { high: ["High risk", "risk-high"], moderate: ["Moderate", "risk-moderate"], low: ["Low risk", "risk-low"] };
  const [label, cls] = map[level] || ["Unknown", ""];
  return `<span class="badge ${cls}">${label}</span>`;
}

function bandFromScore(score, threshold) {
  if (score >= threshold) return "high";
  if (score >= threshold - 22) return "moderate";
  return "low";
}

function initials(name) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/* Renders the persistent top bar. `active` highlights the current stage;
   `locked` steps beyond login are shown but non-interactive if no patient
   is loaded, mirroring the real gated flow. */
function renderNav(active) {
  const session = Session.get();
  const loggedIn = !!session.patientId;
  const patient = loggedIn ? getPatient(session.patientId) : null;

  const steps = [
    { key: "dashboard", label: "Facility", href: "index.html", always: true },
    { key: "login", label: "ABHA Login", href: "login.html", always: true },
    { key: "patient", label: "Patient Record", href: `patient.html`, needsAuth: true },
    { key: "assessment", label: "Risk Assessment", href: `assessment.html`, needsAuth: true },
    { key: "assess", label: "Assess", href: null, needsAuth: true, noDirect: true },
  ];

  const navHtml = steps.map((s) => {
    const disabled = s.needsAuth && !loggedIn;
    const isActive = s.key === active;
    const cls = ["nav-step", isActive ? "is-active" : "", disabled ? "is-disabled" : ""].join(" ").trim();
    const href = disabled || s.noDirect ? "#" : s.href;
    return `<a class="${cls}" href="${href}" ${disabled ? 'aria-disabled="true" tabindex="-1"' : ""}>${s.label}</a>`;
  }).join("");

  const mount = document.getElementById("app-nav");
  if (!mount) return;
  mount.innerHTML = `
    <div class="topbar">
      <div class="topbar-inner">
        <a class="brand" href="index.html">
          <span class="brand-mark">${ICONS.logo}</span>
          <span class="brand-text">
            <span class="brand-name">CareGrid</span>
            <span class="brand-sub">${FACILITY.type} · ${FACILITY.code}</span>
          </span>
        </a>
        <nav class="stage-nav" aria-label="Assessment stages">${navHtml}</nav>
        <div class="topbar-right">
          ${loggedIn ? `
            <div class="session-chip">
              <span class="avatar">${initials(patient.name)}</span>
              <span class="session-info">
                <span class="session-name">${patient.name}</span>
                <span class="session-abha">${patient.abhaId}</span>
              </span>
              <button class="icon-btn" id="logout-btn" title="End session">${ICONS.logout}</button>
            </div>` : `<a class="btn btn-primary btn-sm" href="login.html">Log in with ABHA</a>`}
        </div>
      </div>
    </div>`;

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", () => { Session.clear(); window.location.href = "index.html"; });
}

/* Guards a page: redirect to login if no active patient session. */
function requireAuth() {
  const session = Session.get();
  if (!session.patientId) {
    window.location.href = "login.html";
    return null;
  }
  return getPatient(session.patientId);
}

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.getAttribute("data-page");
  if (page) renderNav(page);
});
