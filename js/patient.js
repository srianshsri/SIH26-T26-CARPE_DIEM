(function () {
  const patient = requireAuth();
  if (!patient) return;

  const vitalLabels = {
    systolicBP: ["Systolic BP", "mmHg"], diastolicBP: ["Diastolic BP", "mmHg"],
    fastingGlucose: ["Fasting glucose", "mg/dL"], bmi: ["BMI", ""],
    spo2: ["SpO2", "%"], hemoglobin: ["Haemoglobin", "g/dL"],
    creatinine: ["Creatinine", "mg/dL"], eGFR: ["eGFR", "mL/min"],
  };

  const vitalsHtml = Object.entries(patient.vitals).map(([k, v]) => {
    const [label, unit] = vitalLabels[k] || [k, ""];
    return `<div class="vital-tile"><div class="v-label">${label}</div><div class="v-value">${v}${unit ? " " + unit : ""}</div></div>`;
  }).join("");

  const historyHtml = patient.history.map((h) => `
    <div class="timeline-item">
      <div class="timeline-dot"></div>
      <div>
        <div class="timeline-date">${fmtDate(h.date)}</div>
        <div class="timeline-note">${h.note}</div>
      </div>
    </div>
  `).join("");

  const medsHtml = patient.medications.length
    ? `<ul class="med-list">${patient.medications.map((m) => `<li>${m}</li>`).join("")}</ul>`
    : `<p style="margin-top:10px">No active medications on record.</p>`;

  document.getElementById("record-root").innerHTML = `
    <div class="record-header">
      <div class="record-id">
        <div class="record-avatar">${initials(patient.name)}</div>
        <div>
          <h1>${patient.name}</h1>
          <div class="record-sub">
            <span><b>${patient.age}</b> yrs · ${patient.gender}</span>
            <span>${patient.village}, ${FACILITY.district.split(",")[0]}</span>
            <span class="mono">${patient.abhaId}</span>
            ${riskBadge(patient.riskCategory)}
          </div>
        </div>
      </div>
      <a class="btn btn-primary" href="assessment.html">Go to Health Risk Assessment →</a>
    </div>

    <div class="grid-2col">
      <div>
        <div class="panel">
          <h3>Recent visit history</h3>
          <div class="timeline">${historyHtml}</div>
        </div>
      </div>
      <div>
        <div class="panel">
          <h3>Latest vitals</h3>
          <div class="vitals-grid">${vitalsHtml}</div>
        </div>
        <div class="panel">
          <h3>Monitored conditions</h3>
          <div class="condition-tag-list">${patient.conditions.map((c) => `<span class="condition-tag">${c}</span>`).join("")}</div>
        </div>
        <div class="panel">
          <h3>Current medications</h3>
          ${medsHtml}
        </div>
      </div>
    </div>
  `;
})();
