# CareGrid — Facility Risk Monitoring Prototype

A front-end prototype for a PHC/GMC patient monitoring workflow, built as a
static multi-page site (plain HTML/CSS/JS — no build step, no framework).

## Flow

1. **Facility dashboard** (`index.html`) — facility info, patients monitored,
   grouped by risk category (High / Moderate / Low), plus a Follow-ups tab.
2. **ABHA login** (`login.html`) — enter a patient's ABHA ID; on a valid match
   their medical history loads. Sample IDs are listed on the page itself.
3. **Patient record** (`patient.html`) — medical history, vitals, medications,
   monitored conditions for the logged-in patient.
4. **Health Risk Assessment** (`assessment.html`) — search or browse health
   conditions to assess (deliberately the most colourful screen).
5. **Assess** (`assess.html`) — combines the patient's medical history with
   fresh contextual data, calculates a 0–100 risk score against a
   disease-specific threshold, and explains the score: per-factor
   contribution breakdown, plain-language narrative, and a recommended
   follow-up.

All data is mock/static, defined in `js/data.js`. The scoring model lives in
`js/scoring.js` and is intentionally transparent (every factor's weight and
normalization is visible in the source) rather than a real clinical model.

## Run locally

No build step required. Any static file server works, e.g.:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then open `http://localhost:8080` (or the port shown).

## Deploy to Netlify

**Option A — drag & drop:** unzip this project and drag the folder onto
[app.netlify.com/drop](https://app.netlify.com/drop).

**Option B — Git:**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

Then in Netlify: **Add new site → Import an existing project**, connect the
repo, and use these build settings (already set in `netlify.toml`):

- Build command: *(none)*
- Publish directory: `.`

No environment variables or dependencies are needed.

## Project structure

```
├── index.html          Stage 1 — facility dashboard
├── login.html           Stage 2 — ABHA login
├── patient.html          Patient record (post-login)
├── assessment.html      Stage 3 — condition search
├── assess.html            Stage 4/5 — assess + score explanation
├── css/style.css
├── js/
│   ├── data.js          Mock facility, patients, condition catalogue
│   ├── app.js            Shared nav, session, small utilities
│   ├── scoring.js         Risk scoring engine
│   ├── dashboard.js / login.js / patient.js / assessment.js / assess.js
├── netlify.toml
└── README.md
```
