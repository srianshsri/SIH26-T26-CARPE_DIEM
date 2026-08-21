(function () {
  document.getElementById("facility-name").textContent = FACILITY.name;
  document.getElementById("facility-type").textContent = `${FACILITY.type} · Front page`;
  document.getElementById("facility-incharge").textContent = FACILITY.inCharge;
  document.getElementById("facility-district").textContent = FACILITY.district;
  document.getElementById("facility-code").textContent = FACILITY.code;

  const counts = { high: 0, moderate: 0, low: 0 };
  PATIENTS.forEach((p) => counts[p.riskCategory]++);

  document.getElementById("stat-grid").innerHTML = `
    <div class="stat-card accent-blue"><div class="stat-num">${PATIENTS.length}</div><div class="stat-label">Patients monitored</div></div>
    <div class="stat-card accent-high"><div class="stat-num">${counts.high}</div><div class="stat-label">High risk</div></div>
    <div class="stat-card accent-mod"><div class="stat-num">${counts.moderate}</div><div class="stat-label">Moderate risk</div></div>
    <div class="stat-card accent-low"><div class="stat-num">${counts.low}</div><div class="stat-label">Low risk</div></div>
  `;

  // Tabs
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("is-active"));
      document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("is-active"));
      btn.classList.add("is-active");
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add("is-active");
    });
  });

  // Filters + table
  let activeFilter = "all";
  const filters = [
    { key: "all", label: `All (${PATIENTS.length})` },
    { key: "high", label: `High risk (${counts.high})` },
    { key: "moderate", label: `Moderate (${counts.moderate})` },
    { key: "low", label: `Low (${counts.low})` },
  ];
  document.getElementById("filter-row").innerHTML = filters.map((f) =>
    `<button class="chip-filter ${f.key === "all" ? "is-active" : ""}" data-filter="${f.key}">${f.label}</button>`
  ).join("");

  function renderRows() {
    const rows = PATIENTS.filter((p) => activeFilter === "all" || p.riskCategory === activeFilter);
    document.getElementById("patient-rows").innerHTML = rows.map((p) => `
      <tr data-id="${p.id}">
        <td>
          <div class="patient-name-cell">
            <span class="avatar" style="background:var(--blue-800)">${initials(p.name)}</span>
            <span>
              <div>${p.name}</div>
              <div class="p-village">${p.village}</div>
            </span>
          </div>
        </td>
        <td>${p.age} · ${p.gender}</td>
        <td class="p-conditions">${p.conditions.join(", ")}</td>
        <td>${riskBadge(p.riskCategory)}</td>
        <td>${fmtDate(p.lastVisit)}</td>
        <td>${fmtDate(p.nextFollowUp)}</td>
      </tr>
    `).join("") || `<tr><td colspan="6" style="text-align:center;color:var(--ink-faint);padding:26px">No patients in this category.</td></tr>`;

    document.querySelectorAll("#patient-rows tr[data-id]").forEach((row) => {
      row.addEventListener("click", () => {
        sessionStorage.setItem("caregrid_pending_patient", row.dataset.id);
        window.location.href = "login.html";
      });
    });
  }
  renderRows();

  document.querySelectorAll(".chip-filter").forEach((chip) => {
    chip.addEventListener("click", () => {
      activeFilter = chip.dataset.filter;
      document.querySelectorAll(".chip-filter").forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      renderRows();
    });
  });

  // Follow-ups
  const upcoming = [...PATIENTS].sort((a, b) => new Date(a.nextFollowUp) - new Date(b.nextFollowUp));
  document.getElementById("followup-list").innerHTML = upcoming.map((p) => `
    <div class="followup-row" data-id="${p.id}" style="cursor:pointer">
      <div class="followup-left">
        <span class="followup-date">${fmtDate(p.nextFollowUp)}</span>
        <span>
          <div style="font-weight:700">${p.name}</div>
          <div class="p-village">${p.conditions.join(", ")}</div>
        </span>
      </div>
      ${riskBadge(p.riskCategory)}
    </div>
  `).join("");
  document.querySelectorAll("#followup-list .followup-row").forEach((row) => {
    row.addEventListener("click", () => {
      sessionStorage.setItem("caregrid_pending_patient", row.dataset.id);
      window.location.href = "login.html";
    });
  });
})();
