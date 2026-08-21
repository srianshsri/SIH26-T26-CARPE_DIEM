(function () {
  const input = document.getElementById("abha-input");
  const field = document.getElementById("abha-field");
  const errorMsg = document.getElementById("abha-error");
  const loginBtn = document.getElementById("login-btn");

  // Auto-format as XX-XXXX-XXXX-XXXX
  input.addEventListener("input", () => {
    let digits = input.value.replace(/\D/g, "").slice(0, 14);
    let out = "";
    [2, 4, 4, 4].forEach((len, i) => {
      const start = [0, 2, 6, 10][i];
      const chunk = digits.slice(start, start + len);
      if (chunk) out += (out ? "-" : "") + chunk;
    });
    input.value = out;
    field.classList.remove("field-error");
    errorMsg.classList.remove("is-visible");
  });

  // Pre-fill if arriving from a dashboard row click
  const pendingId = sessionStorage.getItem("caregrid_pending_patient");
  if (pendingId) {
    const p = getPatient(pendingId);
    if (p) input.value = p.abhaId;
  }

  document.getElementById("demo-list").innerHTML = PATIENTS.slice(0, 4).map((p) => `
    <button class="demo-id-btn" data-abha="${p.abhaId}">
      <span class="pname">${p.name}</span>
      <span>${p.abhaId}</span>
    </button>
  `).join("");
  document.querySelectorAll(".demo-id-btn").forEach((btn) => {
    btn.addEventListener("click", () => { input.value = btn.dataset.abha; attemptLogin(); });
  });

  function attemptLogin() {
    const patient = findPatientByAbha(input.value);
    if (!patient) {
      field.classList.add("field-error");
      errorMsg.classList.add("is-visible");
      return;
    }
    loginBtn.textContent = "Verifying…";
    loginBtn.disabled = true;
    setTimeout(() => {
      Session.set({ patientId: patient.id, loggedInAt: new Date().toISOString() });
      sessionStorage.removeItem("caregrid_pending_patient");
      window.location.href = "patient.html";
    }, 450);
  }

  loginBtn.addEventListener("click", attemptLogin);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") attemptLogin(); });
})();
