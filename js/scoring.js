/* ==========================================================================
   CareGrid — Scoring Engine (Stage 4)
   A transparent, explainable mock model: every factor normalizes to a 0-1
   risk value, is multiplied by its configured weight, and summed to a
   0-100 score. The same per-factor breakdown drives the Stage 5 explainer.
   ========================================================================== */

function clamp01(v) { return Math.max(0, Math.min(1, v)); }

const NORMALIZERS = {
  systolicBP: (v) => clamp01((v - 110) / (180 - 110)),
  diastolicBP: (v) => clamp01((v - 70) / (110 - 70)),
  fastingGlucose: (v) => clamp01((v - 90) / (200 - 90)),
  bmi: (v) => clamp01((v - 22) / (35 - 22)),
  spo2: (v) => clamp01((97 - v) / (97 - 88)),
  hemoglobin: (v) => clamp01((13 - v) / (13 - 7)),
  creatinine: (v) => clamp01((v - 0.8) / (3 - 0.8)),
  eGFR: (v) => clamp01((90 - v) / (90 - 30)),
  age: (v) => clamp01((v - 30) / (75 - 30)),
  smokingHistoryYears: (v) => clamp01(v / 30),
  gestationWeek: () => 0.3, // informational, not itself a risk driver
};
const BOOLEAN_KEYS = new Set([
  "familyHistoryDiabetes", "familyHistoryCardiac", "priorCardiacEvent", "diabetesHistory",
  "priorAnemiaDx", "priorComplication", "priorMentalHealthDx", "sleepDisturbance",
]);

function historyRisk(key, value) {
  if (BOOLEAN_KEYS.has(key)) return value ? 1 : 0;
  if (NORMALIZERS[key]) return NORMALIZERS[key](value);
  return 0.3;
}

function contextRisk(field, rawValue) {
  if (field.type === "select") {
    const max = Math.max(...field.options.map((o) => o.v));
    return clamp01(rawValue / max);
  }
  if (field.type === "slider") {
    const norm = clamp01((rawValue - field.min) / (field.max - field.min));
    return field.invert ? 1 - norm : norm;
  }
  return 0;
}

function getHistoryValue(patient, key) {
  if (key in patient.vitals) return patient.vitals[key];
  if (key === "age") return patient.age;
  if (key === "gestationWeek") return patient.gestationWeek;
  if (key === "smokingHistoryYears") return patient.smokingHistoryYears || 0;
  if (patient.flags && key in patient.flags) return patient.flags[key];
  return undefined;
}

/* Runs the model. contextValues: { fieldKey: rawValue }. Returns:
   { score, band, factors: [{ label, points, risk, source }] } */
function computeRiskScore(patient, condition, contextValues) {
  const factors = [];
  let total = 0;

  condition.historyFactors.forEach((f) => {
    const raw = getHistoryValue(patient, f.key);
    if (raw === undefined || raw === null) return;
    const risk = historyRisk(f.key, raw);
    const points = risk * f.weight * 100;
    total += points;
    factors.push({ label: f.label, points, risk, source: "history", display: f.format ? f.format(raw) : raw });
  });

  condition.contextFields.forEach((f) => {
    const raw = contextValues[f.key];
    if (raw === undefined) return;
    const risk = contextRisk(f, raw);
    const points = risk * f.weight * 100;
    total += points;
    let display = raw;
    if (f.type === "select") display = f.options.find((o) => o.v == raw)?.l ?? raw;
    if (f.type === "slider") display = `${raw}/${f.max}`;
    factors.push({ label: f.label, points, risk, source: "context", display });
  });

  const score = Math.round(clamp01(total / 100) * 100);
  factors.sort((a, b) => b.points - a.points);
  const band = bandFromScore(score, condition.threshold);
  return { score, band, factors };
}

function followUpPlan(band) {
  if (band === "high") return {
    title: "Urgent follow-up recommended",
    text: "Schedule a review within 3–5 days. Consider referral to the nearest GMC or specialist if symptoms progress before then.",
  };
  if (band === "moderate") return {
    title: "Follow-up in 2–4 weeks",
    text: "Reinforce lifestyle counselling and medication adherence. Re-assess at the next scheduled visit or sooner if symptoms change.",
  };
  return {
    title: "Routine follow-up in 3 months",
    text: "No immediate action needed beyond continuing current care. Re-screen at the next routine visit.",
  };
}

function buildNarrative(patient, condition, result) {
  const top = result.factors.slice(0, 2).filter((f) => f.points > 4);
  const bandWord = { high: "high", moderate: "moderate", low: "low" }[result.band];
  const vsThreshold = result.score >= condition.threshold
    ? `above the ${condition.threshold}-point clinical threshold for ${condition.name.toLowerCase()}`
    : `below the ${condition.threshold}-point clinical threshold for ${condition.name.toLowerCase()}`;

  let drivers = "no single factor dominating the result";
  if (top.length === 1) drivers = `driven mainly by <b>${top[0].label.toLowerCase()}</b> (${top[0].display})`;
  if (top.length >= 2) drivers = `driven mainly by <b>${top[0].label.toLowerCase()}</b> (${top[0].display}) and <b>${top[1].label.toLowerCase()}</b> (${top[1].display})`;

  return `${patient.name}'s score of <b>${result.score}/100</b> falls in the <b>${bandWord} risk</b> band — ${vsThreshold}. This is ${drivers}.`;
}
