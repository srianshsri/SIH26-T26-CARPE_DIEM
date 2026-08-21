(function () {
  const patient = requireAuth();
  if (!patient) return;

  document.getElementById("hero-title").textContent = `Assessing ${patient.name}`;
  document.getElementById("hero-sub").textContent =
    `${patient.age}y ${patient.gender} · Search below or pick from a condition already flagged on this record.`;
  document.getElementById("search-icon").innerHTML = ICONS.search;

  const CONDITION_ICONS = {
    droplet: `<path d="M12 3s6 6.7 6 11a6 6 0 1 1-12 0c0-4.3 6-11 6-11z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>`,
    heart: `<path d="M12 20s-7.5-4.7-9.7-9.4C1 7.2 3 4 6.3 4 8.4 4 10 5.2 12 7.5 14 5.2 15.6 4 17.7 4 21 4 23 7.2 21.7 10.6 19.5 15.3 12 20 12 20z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>`,
    pulse: `<path d="M2 12h4l2-6 4 12 2-9 2 3h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
    kidney: `<path d="M9 3c-3 0-5 3-5 7s1 6 1 9c0 1.5 3 2 3-1 0-2 1-3 3-2 3 1 6-1 6-6 0-5-3-7-6-7-1 0-1.5.5-2 0z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>`,
    lungs: `<path d="M12 3v7m0 0c-1-2-3-2-4-1-2 1-3 5-2 9 1 3 3 2 3-1l1-4m2 6c1-2 3-2 4-1 2 1 3 5 2 9-1 3-3 2-3-1l-1-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
    baby: `<circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.6"/><path d="M5 21c0-4 3-7 7-7s7 3 7 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>`,
    brain: `<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-1 5.7A3 3 0 0 0 8 17c0 1.7 1.3 3 3 3M9 4c1 0 2 .5 2.5 1.3M9 4v13m6-13a3 3 0 0 1 3 3 3 3 0 0 1 1 5.7A3 3 0 0 1 16 17c0 1.7-1.3 3-3 3M15 4c-1 0-2 .5-2.5 1.3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>`,
    blood: `<path d="M12 3s6 6.7 6 11a6 6 0 1 1-12 0c0-4.3 6-11 6-11z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9.5 13.5a2.5 2.5 0 0 0 3.6 2.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" fill="none"/>`,
  };

  const flaggedNames = new Set(patient.conditions);
  const categories = ["All", ...new Set(CONDITIONS.map((c) => c.category))];
  let activeCategory = "All";
  let query = "";

  document.getElementById("category-filters").innerHTML = categories.map((c) =>
    `<button class="chip-filter ${c === "All" ? "is-active" : ""}" data-cat="${c}">${c}</button>`
  ).join("");

  function renderGrid() {
    const list = CONDITIONS.filter((c) => {
      const matchesCat = activeCategory === "All" || c.category === activeCategory;
      const matchesQuery = !query || c.name.toLowerCase().includes(query) || c.category.toLowerCase().includes(query);
      return matchesCat && matchesQuery;
    });

    document.getElementById("condition-grid").innerHTML = list.map((c) => `
      <div class="condition-card ${c.id === selectedId ? "is-selected" : ""}" data-id="${c.id}"
           style="--card-color:${c.color}; --card-soft:${c.colorSoft}">
        ${flaggedNames.has(c.name) ? '<span class="flagged-pill">On record</span>' : ""}
        <div class="condition-icon"><svg viewBox="0 0 24 24" fill="none">${CONDITION_ICONS[c.icon] || CONDITION_ICONS.pulse}</svg></div>
        <span class="condition-cat">${c.category}</span>
        <h4>${c.name}</h4>
        <p>${c.description}</p>
      </div>
    `).join("") || `<p style="color:var(--ink-faint); grid-column:1/-1; text-align:center; padding:40px 0">No conditions match “${query}”.</p>`;

    document.querySelectorAll(".condition-card").forEach((card) => {
      card.addEventListener("click", () => selectCondition(card.dataset.id));
    });
  }

  let selectedId = null;
  function selectCondition(id) {
    selectedId = id;
    const cond = getCondition(id);
    document.getElementById("assess-bar").style.display = "flex";
    document.getElementById("selected-name").textContent = cond.name;
    document.getElementById("assess-go").href = `assess.html?condition=${id}`;
    renderGrid();
    document.getElementById("assess-bar").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  document.querySelectorAll(".chip-filter").forEach((chip) => {
    chip.addEventListener("click", () => {
      activeCategory = chip.dataset.cat;
      document.querySelectorAll(".chip-filter").forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      renderGrid();
    });
  });

  document.getElementById("condition-search").addEventListener("input", (e) => {
    query = e.target.value.trim().toLowerCase();
    renderGrid();
  });

  // Pre-select via ?condition= if arriving with one
  const params = new URLSearchParams(window.location.search);
  if (params.get("condition")) selectCondition(params.get("condition"));

  renderGrid();
})();
