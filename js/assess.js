(function () {
  const patient = requireAuth();
  if (!patient) return;

  const params = new URLSearchParams(window.location.search);
  const condition = getCondition(params.get("condition"));
  if (!condition) { window.location.href = "assessment.html"; return; }

  document.getElementById("assess-title").textContent = condition.name;
  document.getElementById("assess-sub").innerHTML =
    `Assessing <b>${patient.name}</b> (${patient.age}y ${patient.gender}) for <b>${condition.name}</b>. ` +
    `Clinical threshold for follow-up: <b class="mono">${condition.threshold}/100</b>.`;

  // ---- History readout (auto-filled, read-only) ----
  document.getElementById("history-readout").innerHTML = condition.historyFactors.map((f) => {
    const raw = getHistoryValue(patient, f.key);
    const display = raw === undefined ? "No data" : (f.format ? f.format(raw) : raw);
    return `<div class="readout-tile"><div class="rl">${f.label}</div><div class="rv">${display}</div></div>`;
  }).join("");

  // ---- Contextual fields (entered fresh for this assessment) ----
  const contextValues = {};
  condition.contextFields.forEach((f) => {
    if (f.type === "slider") contextValues[f.key] = f.def;
    if (f.type === "select") contextValues[f.key] = f.options[0].v;
  });

  document.getElementById("context-fields").innerHTML = condition.contextFields.map((f) => {
    if (f.type === "slider") {
      return `
        <div class="context-field">
          <label>${f.label}</label>
          <div class="slider-row">
            <input type="range" min="${f.min}" max="${f.max}" value="${f.def}" data-key="${f.key}" class="ctx-slider">
            <span class="slider-val" id="val-${f.key}">${f.def}</span>
          </div>
          <div class="slider-scale"><span>Low</span><span>High</span></div>
        </div>`;
    }
    return `
      <div class="context-field">
        <label>${f.label}</label>
        <div class="select-pill-group" data-key="${f.key}">
          ${f.options.map((o, i) => `<button type="button" class="select-pill ${i === 0 ? "is-selected" : ""}" data-val="${o.v}">${o.l}</button>`).join("")}
        </div>
      </div>`;
  }).join("");

  document.querySelectorAll(".ctx-slider").forEach((el) => {
    el.addEventListener("input", () => {
      contextValues[el.dataset.key] = Number(el.value);
      document.getElementById(`val-${el.dataset.key}`).textContent = el.value;
    });
  });
  document.querySelectorAll(".select-pill-group").forEach((group) => {
    group.querySelectorAll(".select-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        group.querySelectorAll(".select-pill").forEach((b) => b.classList.remove("is-selected"));
        btn.classList.add("is-selected");
        contextValues[group.dataset.key] = Number(btn.dataset.val);
      });
    });
  });

  // ---- Gauge ----
  function gaugeSvg(score, band, threshold) {
    const r = 84, c = 2 * Math.PI * r;
    const offset = c * (1 - score / 100);
    const bandColor = { high: "var(--risk-high)", moderate: "var(--risk-mod)", low: "var(--risk-low)" }[band];
    const thresholdAngle = (threshold / 100) * 360 - 90;
    return `
      <svg viewBox="0 0 200 200" width="230" height="230">
        <circle cx="100" cy="100" r="${r}" fill="none" stroke="var(--bg-panel)" stroke-width="16"/>
        <circle cx="100" cy="100" r="${r}" fill="none" stroke="${bandColor}" stroke-width="16"
          stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${offset}"
          transform="rotate(-90 100 100)" style="transition:stroke-dashoffset .7s cubic-bezier(.4,0,.2,1)"/>
        <g transform="rotate(${thresholdAngle} 100 100)">
          <line x1="100" y1="6" x2="100" y2="24" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/>
        </g>
      </svg>`;
  }

  function explainItem(f) {
    const cls = f.points >= 8 ? "up" : f.points <= 2 ? "flat" : "up";
    return `
      <li class="explain-item">
        <span class="ei-label">${f.label} <span class="mono" style="color:var(--ink-faint)">— ${f.display}</span></span>
        <span class="ei-pts ${cls}">+${f.points.toFixed(1)}</span>
      </li>`;
  }

  function render(result) {
    const bandLabel = { high: "risk-high", moderate: "risk-moderate", low: "risk-low" }[result.band];
    const plan = followUpPlan(result.band);
    const narrative = buildNarrative(patient, condition, result);

    document.getElementById("result-card").innerHTML = `
      <span class="eyebrow">Stage 5 · Result &amp; explanation</span>
      <div class="dial-wrap">
        ${gaugeSvg(result.score, result.band, condition.threshold)}
        <div class="dial-score"><span class="num">${result.score}</span><span class="out-of">out of 100</span></div>
      </div>
      <div class="result-band-badge">${riskBadge(result.band)}</div>
      <div class="threshold-note">
        Clinical threshold for <b>${condition.name}</b> is <b>${condition.threshold}/100</b> —
        this score is <b>${result.score >= condition.threshold ? "above" : "below"}</b> that line.
      </div>

      <div class="narrative-box">${narrative}</div>

      <h4 style="text-align:left; margin-top:20px">How this score was calculated</h4>
      <ul class="explain-list">${result.factors.map(explainItem).join("")}</ul>

      <div class="followup-card band-${result.band}">
        <div>
          <h5>${plan.title}</h5>
          <p>${plan.text}</p>
        </div>
      </div>
    `;
    document.getElementById("result-card").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  document.getElementById("calc-btn").addEventListener("click", () => {
    const btn = document.getElementById("calc-btn");
    btn.textContent = "Calculating…";
    btn.disabled = true;
    setTimeout(() => {
      const result = computeRiskScore(patient, condition, contextValues);
      render(result);
      btn.textContent = "Recalculate risk score";
      btn.disabled = false;
    }, 400);
  });
})();
