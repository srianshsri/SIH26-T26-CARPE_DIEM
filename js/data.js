/* ==========================================================================
   CareGrid — Mock Data Layer
   In a real deployment this file is replaced by API calls to the ABDM /
   facility EHR backend. Everything here is static, deterministic sample
   data so the prototype runs entirely client-side on Netlify.
   ========================================================================== */

const FACILITY = {
  name: "Sarvodaya Primary Health Centre",
  type: "PHC",
  code: "PHC-UP-04417",
  district: "Meerut, Uttar Pradesh",
  inCharge: "Dr. Renu Kashyap, MBBS",
};

/* Condition catalogue used on the Health Risk Assessment (Stage 3) search
   and to drive the scoring model (Stage 4/5). Each condition owns:
   - a colour identity (assessment page is intentionally colourful)
   - a clinical threshold (0-100) above which a follow-up is triggered
   - the factors that feed the score, split into "history" (pulled straight
     from the patient record) and "context" (entered fresh in Stage 4) */
const CONDITIONS = [
  {
    id: "diabetes",
    name: "Diabetes Mellitus (Type II)",
    category: "Endocrine",
    color: "#F1A93B",
    colorSoft: "#FEF3DF",
    icon: "droplet",
    threshold: 62,
    description: "Metabolic risk from glycaemic control, weight and family history.",
    historyFactors: [
      { key: "fastingGlucose", label: "Fasting glucose", weight: 0.30, format: (v) => `${v} mg/dL` },
      { key: "bmi", label: "BMI", weight: 0.15, format: (v) => v },
      { key: "familyHistoryDiabetes", label: "Family history of diabetes", weight: 0.10, format: (v) => (v ? "Present" : "None") },
    ],
    contextFields: [
      { key: "physicalActivity", label: "Physical activity level", type: "select", weight: 0.15,
        options: [{ v: 0, l: "Active — 5+ days/week" }, { v: 1, l: "Moderate — 2-4 days/week" }, { v: 2, l: "Sedentary — rarely active" }] },
      { key: "dietRisk", label: "Dietary sugar/refined-carb intake", type: "slider", weight: 0.15, min: 0, max: 10, def: 5 },
      { key: "medicationAdherence", label: "Medication adherence (last 30 days)", type: "select", weight: 0.15,
        options: [{ v: 0, l: "Consistent" }, { v: 1, l: "Occasional lapses" }, { v: 2, l: "Poor / stopped" }] },
    ],
  },
  {
    id: "hypertension",
    name: "Hypertension",
    category: "Cardiovascular",
    color: "#E1483C",
    colorSoft: "#FDECEA",
    icon: "heart",
    threshold: 58,
    description: "Sustained elevated blood pressure and downstream cardiac strain.",
    historyFactors: [
      { key: "systolicBP", label: "Systolic BP", weight: 0.28, format: (v) => `${v} mmHg` },
      { key: "diastolicBP", label: "Diastolic BP", weight: 0.14, format: (v) => `${v} mmHg` },
      { key: "familyHistoryCardiac", label: "Family history of cardiac disease", weight: 0.08, format: (v) => (v ? "Present" : "None") },
    ],
    contextFields: [
      { key: "saltIntake", label: "Dietary salt intake", type: "slider", weight: 0.14, min: 0, max: 10, def: 5 },
      { key: "stressLevel", label: "Reported stress level", type: "slider", weight: 0.12, min: 0, max: 10, def: 4 },
      { key: "smokingStatus", label: "Smoking status", type: "select", weight: 0.14,
        options: [{ v: 0, l: "Never smoked" }, { v: 1, l: "Former smoker" }, { v: 2, l: "Current smoker" }] },
      { key: "medicationAdherence", label: "Antihypertensive adherence", type: "select", weight: 0.10,
        options: [{ v: 0, l: "Consistent" }, { v: 1, l: "Occasional lapses" }, { v: 2, l: "Poor / stopped" }] },
    ],
  },
  {
    id: "cvd",
    name: "Cardiovascular Disease Risk",
    category: "Cardiovascular",
    color: "#DB2777",
    colorSoft: "#FCE7F3",
    icon: "pulse",
    threshold: 65,
    description: "Composite risk of coronary or cerebrovascular events over 10 years.",
    historyFactors: [
      { key: "age", label: "Age", weight: 0.18, format: (v) => `${v} yrs` },
      { key: "systolicBP", label: "Systolic BP", weight: 0.18, format: (v) => `${v} mmHg` },
      { key: "priorCardiacEvent", label: "Prior cardiac event", weight: 0.14, format: (v) => (v ? "Yes" : "No") },
    ],
    contextFields: [
      { key: "smokingStatus", label: "Smoking status", type: "select", weight: 0.14,
        options: [{ v: 0, l: "Never smoked" }, { v: 1, l: "Former smoker" }, { v: 2, l: "Current smoker" }] },
      { key: "physicalActivity", label: "Physical activity level", type: "select", weight: 0.12,
        options: [{ v: 0, l: "Active — 5+ days/week" }, { v: 1, l: "Moderate — 2-4 days/week" }, { v: 2, l: "Sedentary — rarely active" }] },
      { key: "dietRisk", label: "Dietary fat / sodium intake", type: "slider", weight: 0.12, min: 0, max: 10, def: 5 },
      { key: "medicationAdherence", label: "Medication adherence", type: "select", weight: 0.12,
        options: [{ v: 0, l: "Consistent" }, { v: 1, l: "Occasional lapses" }, { v: 2, l: "Poor / stopped" }] },
    ],
  },
  {
    id: "ckd",
    name: "Chronic Kidney Disease",
    category: "Renal",
    color: "#8B5CF6",
    colorSoft: "#EDE9FE",
    icon: "kidney",
    threshold: 60,
    description: "Progressive decline in renal function tracked via creatinine and eGFR.",
    historyFactors: [
      { key: "creatinine", label: "Serum creatinine", weight: 0.26, format: (v) => `${v} mg/dL` },
      { key: "eGFR", label: "eGFR", weight: 0.20, format: (v) => `${v} mL/min` },
      { key: "diabetesHistory", label: "Existing diabetes", weight: 0.10, format: (v) => (v ? "Yes" : "No") },
    ],
    contextFields: [
      { key: "fluidIntake", label: "Daily fluid intake adequacy", type: "select", weight: 0.14,
        options: [{ v: 0, l: "Adequate" }, { v: 1, l: "Below recommended" }, { v: 2, l: "Poor" }] },
      { key: "nsaidUse", label: "Frequent NSAID / painkiller use", type: "select", weight: 0.15,
        options: [{ v: 0, l: "None" }, { v: 1, l: "Occasional" }, { v: 2, l: "Frequent" }] },
      { key: "medicationAdherence", label: "Medication adherence", type: "select", weight: 0.15,
        options: [{ v: 0, l: "Consistent" }, { v: 1, l: "Occasional lapses" }, { v: 2, l: "Poor / stopped" }] },
    ],
  },
  {
    id: "copd",
    name: "COPD / Chronic Respiratory Illness",
    category: "Respiratory",
    color: "#17A6A6",
    colorSoft: "#E0F5F5",
    icon: "lungs",
    threshold: 55,
    description: "Airway obstruction risk from smoking history and exposure.",
    historyFactors: [
      { key: "spo2", label: "SpO2 at rest", weight: 0.24, format: (v) => `${v}%` },
      { key: "smokingHistoryYears", label: "Smoking history", weight: 0.18, format: (v) => `${v} pack-years` },
    ],
    contextFields: [
      { key: "breathlessness", label: "Breathlessness on exertion", type: "slider", weight: 0.18, min: 0, max: 10, def: 4 },
      { key: "occupationalExposure", label: "Occupational dust / smoke exposure", type: "select", weight: 0.16,
        options: [{ v: 0, l: "None" }, { v: 1, l: "Occasional" }, { v: 2, l: "Daily" }] },
      { key: "medicationAdherence", label: "Inhaler / medication adherence", type: "select", weight: 0.14,
        options: [{ v: 0, l: "Consistent" }, { v: 1, l: "Occasional lapses" }, { v: 2, l: "Poor / stopped" }] },
    ],
  },
  {
    id: "maternal",
    name: "Maternal Health Risk",
    category: "Maternal & Child",
    color: "#EC4899",
    colorSoft: "#FCE7F3",
    icon: "baby",
    threshold: 58,
    description: "Antenatal risk screening for gestational complications.",
    historyFactors: [
      { key: "gestationWeek", label: "Gestation week", weight: 0.16, format: (v) => `Week ${v}` },
      { key: "priorComplication", label: "Prior pregnancy complication", weight: 0.16, format: (v) => (v ? "Yes" : "No") },
      { key: "hemoglobin", label: "Haemoglobin", weight: 0.14, format: (v) => `${v} g/dL` },
    ],
    contextFields: [
      { key: "antenatalVisits", label: "Antenatal visits completed on schedule", type: "select", weight: 0.16,
        options: [{ v: 0, l: "On schedule" }, { v: 1, l: "One missed" }, { v: 2, l: "Multiple missed" }] },
      { key: "nutritionStatus", label: "Nutritional status", type: "slider", weight: 0.18, min: 0, max: 10, def: 5, invert: true },
      { key: "bpDuringVisit", label: "BP reading today (relative to baseline)", type: "slider", weight: 0.20, min: 0, max: 10, def: 4 },
    ],
  },
  {
    id: "mentalhealth",
    name: "Depression / Mental Health Screening",
    category: "Mental Health",
    color: "#6366F1",
    colorSoft: "#E0E7FF",
    icon: "brain",
    threshold: 55,
    description: "PHQ-style screening for depressive symptom burden.",
    historyFactors: [
      { key: "priorMentalHealthDx", label: "Prior diagnosis on record", weight: 0.14, format: (v) => (v ? "Yes" : "No") },
      { key: "sleepDisturbance", label: "Sleep disturbance (recorded)", weight: 0.12, format: (v) => (v ? "Reported" : "None") },
    ],
    contextFields: [
      { key: "moodScore", label: "Self-reported mood (last 2 weeks)", type: "slider", weight: 0.22, min: 0, max: 10, def: 5, invert: true },
      { key: "socialSupport", label: "Perceived social support", type: "slider", weight: 0.18, min: 0, max: 10, def: 6 },
      { key: "stressLevel", label: "Reported stress level", type: "slider", weight: 0.18, min: 0, max: 10, def: 5 },
      { key: "sleepQuality", label: "Sleep quality this week", type: "slider", weight: 0.16, min: 0, max: 10, def: 5, invert: true },
    ],
  },
  {
    id: "anemia",
    name: "Anemia",
    category: "Nutritional",
    color: "#DC2626",
    colorSoft: "#FEE2E2",
    icon: "blood",
    threshold: 50,
    description: "Haemoglobin deficiency risk from nutrition and menstrual history.",
    historyFactors: [
      { key: "hemoglobin", label: "Haemoglobin", weight: 0.34, format: (v) => `${v} g/dL` },
      { key: "priorAnemiaDx", label: "Prior anaemia diagnosis", weight: 0.12, format: (v) => (v ? "Yes" : "No") },
    ],
    contextFields: [
      { key: "dietaryIronIntake", label: "Dietary iron intake", type: "select", weight: 0.20,
        options: [{ v: 0, l: "Adequate" }, { v: 1, l: "Below recommended" }, { v: 2, l: "Poor" }] },
      { key: "fatigueLevel", label: "Reported fatigue level", type: "slider", weight: 0.18, min: 0, max: 10, def: 4 },
      { key: "medicationAdherence", label: "Iron/folic supplement adherence", type: "select", weight: 0.16,
        options: [{ v: 0, l: "Consistent" }, { v: 1, l: "Occasional lapses" }, { v: 2, l: "Poor / stopped" }] },
    ],
  },
];

/* Patients monitored by the facility. abhaId is the login credential used
   in Stage 2. History values feed the "historyFactors" defined above. */
const PATIENTS = [
  {
    id: "p1", abhaId: "14-2233-4455-6677", name: "Meena Devi", age: 58, gender: "Female",
    village: "Kharkhauda", riskCategory: "high", lastVisit: "2026-08-02", nextFollowUp: "2026-08-25",
    conditions: ["Diabetes Mellitus (Type II)", "Hypertension"],
    vitals: { systolicBP: 158, diastolicBP: 98, fastingGlucose: 186, bmi: 29.4, spo2: 96, hemoglobin: 11.2, creatinine: 1.1, eGFR: 68 },
    flags: { familyHistoryDiabetes: true, familyHistoryCardiac: true, priorCardiacEvent: false, diabetesHistory: true, priorAnemiaDx: false, priorComplication: false, priorMentalHealthDx: false, sleepDisturbance: true },
    smokingHistoryYears: 0, gestationWeek: null,
    history: [
      { date: "2026-08-02", note: "Fasting glucose elevated at 186 mg/dL; BP 158/98. Counselled on salt restriction, medication adherence reviewed." },
      { date: "2026-06-14", note: "Routine NCD check-up. Reported occasional missed metformin doses." },
      { date: "2026-04-02", note: "Diagnosed hypertensive; started on amlodipine 5mg." },
    ],
    medications: ["Metformin 500mg BD", "Amlodipine 5mg OD"],
  },
  {
    id: "p2", abhaId: "22-8811-9902-3344", name: "Ramesh Chauhan", age: 47, gender: "Male",
    village: "Sardhana Road", riskCategory: "high", lastVisit: "2026-08-10", nextFollowUp: "2026-08-24",
    conditions: ["Cardiovascular Disease Risk", "COPD / Chronic Respiratory Illness"],
    vitals: { systolicBP: 164, diastolicBP: 101, fastingGlucose: 112, bmi: 26.1, spo2: 92, hemoglobin: 13.5, creatinine: 1.0, eGFR: 78 },
    flags: { familyHistoryDiabetes: false, familyHistoryCardiac: true, priorCardiacEvent: true, diabetesHistory: false, priorAnemiaDx: false },
    smokingHistoryYears: 22, gestationWeek: null,
    history: [
      { date: "2026-08-10", note: "Reports breathlessness on climbing stairs. SpO2 92% at rest. History of MI in 2023." },
      { date: "2026-05-20", note: "Chest pain evaluated; ECG stable. Advised smoking cessation counselling." },
    ],
    medications: ["Aspirin 75mg OD", "Atorvastatin 20mg OD", "Salbutamol inhaler PRN"],
  },
  {
    id: "p3", abhaId: "33-4021-5590-1123", name: "Sunita Rawat", age: 31, gender: "Female",
    village: "Daurala", riskCategory: "moderate", lastVisit: "2026-08-15", nextFollowUp: "2026-09-05",
    conditions: ["Maternal Health Risk", "Anemia"],
    vitals: { systolicBP: 122, diastolicBP: 80, fastingGlucose: 92, bmi: 23.8, spo2: 98, hemoglobin: 9.8, creatinine: 0.7, eGFR: 96 },
    flags: { priorComplication: false, priorAnemiaDx: true, familyHistoryDiabetes: false, familyHistoryCardiac: false, priorCardiacEvent: false, diabetesHistory: false },
    gestationWeek: 26, smokingHistoryYears: 0,
    history: [
      { date: "2026-08-15", note: "26 weeks gestation. Haemoglobin 9.8 g/dL — mild anaemia. Iron-folic supplementation reinforced." },
      { date: "2026-07-11", note: "Second antenatal visit. Fundal height consistent with dates." },
    ],
    medications: ["Iron-folic acid tablet OD", "Calcium 500mg OD"],
  },
  {
    id: "p4", abhaId: "41-7765-2201-8834", name: "Vikram Singh", age: 62, gender: "Male",
    village: "Kharkhauda", riskCategory: "moderate", lastVisit: "2026-07-29", nextFollowUp: "2026-08-28",
    conditions: ["Chronic Kidney Disease", "Hypertension"],
    vitals: { systolicBP: 142, diastolicBP: 90, fastingGlucose: 118, bmi: 24.9, spo2: 97, hemoglobin: 12.1, creatinine: 1.6, eGFR: 52 },
    flags: { diabetesHistory: true, familyHistoryCardiac: false, familyHistoryDiabetes: true, priorCardiacEvent: false, priorAnemiaDx: false },
    smokingHistoryYears: 5, gestationWeek: null,
    history: [
      { date: "2026-07-29", note: "eGFR trending down (58 → 52 over 4 months). Advised nephrology referral if trend continues." },
      { date: "2026-03-18", note: "Routine review, creatinine stable at 1.5 mg/dL." },
    ],
    medications: ["Losartan 50mg OD", "Sodium bicarbonate supplement"],
  },
  {
    id: "p5", abhaId: "55-3312-6690-4471", name: "Anjali Gupta", age: 26, gender: "Female",
    village: "Modipuram", riskCategory: "low", lastVisit: "2026-08-05", nextFollowUp: "2026-11-05",
    conditions: ["Depression / Mental Health Screening"],
    vitals: { systolicBP: 114, diastolicBP: 74, fastingGlucose: 88, bmi: 21.6, spo2: 99, hemoglobin: 13.0, creatinine: 0.6, eGFR: 102 },
    flags: { priorMentalHealthDx: false, sleepDisturbance: false, familyHistoryDiabetes: false, familyHistoryCardiac: false, priorCardiacEvent: false, diabetesHistory: false, priorAnemiaDx: false },
    smokingHistoryYears: 0, gestationWeek: null,
    history: [
      { date: "2026-08-05", note: "Routine wellness screening, PHQ score low, no active concerns." },
    ],
    medications: [],
  },
  {
    id: "p6", abhaId: "66-9081-1123-5567", name: "Om Prakash Sharma", age: 70, gender: "Male",
    village: "Sardhana Road", riskCategory: "high", lastVisit: "2026-08-18", nextFollowUp: "2026-08-22",
    conditions: ["Diabetes Mellitus (Type II)", "Chronic Kidney Disease", "Cardiovascular Disease Risk"],
    vitals: { systolicBP: 172, diastolicBP: 104, fastingGlucose: 214, bmi: 27.8, spo2: 94, hemoglobin: 10.9, creatinine: 1.9, eGFR: 44 },
    flags: { diabetesHistory: true, familyHistoryDiabetes: true, familyHistoryCardiac: true, priorCardiacEvent: true, priorAnemiaDx: false },
    smokingHistoryYears: 30, gestationWeek: null,
    history: [
      { date: "2026-08-18", note: "Uncontrolled glucose (214 mg/dL), BP 172/104. Same-day physician review flagged for urgent follow-up." },
      { date: "2026-07-02", note: "Missed last two follow-up visits. Family contacted for medication adherence support." },
    ],
    medications: ["Insulin (mixed) BD", "Telmisartan 40mg OD", "Atorvastatin 20mg OD"],
  },
  {
    id: "p7", abhaId: "77-4456-8820-9912", name: "Priya Yadav", age: 34, gender: "Female",
    village: "Daurala", riskCategory: "low", lastVisit: "2026-08-01", nextFollowUp: "2026-10-01",
    conditions: ["Hypertension"],
    vitals: { systolicBP: 128, diastolicBP: 82, fastingGlucose: 96, bmi: 22.9, spo2: 99, hemoglobin: 12.8, creatinine: 0.7, eGFR: 99 },
    flags: { familyHistoryCardiac: false, familyHistoryDiabetes: false, priorCardiacEvent: false, diabetesHistory: false, priorAnemiaDx: false },
    smokingHistoryYears: 0, gestationWeek: null,
    history: [
      { date: "2026-08-01", note: "Borderline BP on two consecutive visits. Lifestyle counselling given, no medication started." },
    ],
    medications: [],
  },
  {
    id: "p8", abhaId: "88-1290-3345-6601", name: "D. Iqbal Ansari", age: 54, gender: "Male",
    village: "Modipuram", riskCategory: "moderate", lastVisit: "2026-08-12", nextFollowUp: "2026-09-02",
    conditions: ["COPD / Chronic Respiratory Illness"],
    vitals: { systolicBP: 134, diastolicBP: 86, fastingGlucose: 104, bmi: 25.2, spo2: 93, hemoglobin: 13.9, creatinine: 0.9, eGFR: 88 },
    flags: { familyHistoryCardiac: false, familyHistoryDiabetes: false, priorCardiacEvent: false, diabetesHistory: false, priorAnemiaDx: false },
    smokingHistoryYears: 18, gestationWeek: null,
    history: [
      { date: "2026-08-12", note: "Works at a stone-crushing unit; reports chronic cough. SpO2 93%. Referred for spirometry at GMC." },
    ],
    medications: ["Salbutamol inhaler PRN"],
  },
];

function findPatientByAbha(abhaId) {
  const norm = (abhaId || "").replace(/\s+/g, "");
  return PATIENTS.find((p) => p.abhaId.replace(/-/g, "") === norm.replace(/-/g, ""));
}
function getPatient(id) {
  return PATIENTS.find((p) => p.id === id);
}
function getCondition(id) {
  return CONDITIONS.find((c) => c.id === id);
}
