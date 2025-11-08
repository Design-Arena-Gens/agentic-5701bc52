import { leads } from "./src/leads.js";

const industryFilter = document.querySelector("#filter-industry");
const locationFilter = document.querySelector("#filter-location");
const platformFilter = document.querySelector("#filter-platform");
const activityFilter = document.querySelector("#filter-activity");
const searchFilter = document.querySelector("#filter-search");
const leadsContainer = document.querySelector("#leads-container");
const emptyState = document.querySelector("#empty-state");
const signalTotal = document.querySelector("#signal-total");
const signalAnimation = document.querySelector("#signal-animation");
const signalMarkets = document.querySelector("#signal-markets");

const unique = (items) => [...new Set(items)];

const populateFilters = () => {
  const industries = unique(leads.map((lead) => lead.industry));
  const locations = unique(leads.map((lead) => lead.location.country));
  const platforms = unique(leads.flatMap((lead) => lead.platforms.map((p) => p.type)));

  industries.sort().forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    industryFilter.appendChild(option);
  });

  locations.sort().forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    locationFilter.appendChild(option);
  });

  platforms.sort().forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    platformFilter.appendChild(option);
  });
};

const renderSignals = () => {
  signalTotal.textContent = leads.length.toString().padStart(2, "0");

  const strongAnimation = leads.filter((lead) =>
    lead.signals.some((signal) => signal.toLowerCase().includes("motion"))
  );
  signalAnimation.textContent = `${strongAnimation.length}/${leads.length}`;

  const topMarkets = unique(
    leads.map((lead) => lead.location.region).filter((region) => region && region !== "Global")
  )
    .slice(0, 4)
    .join(" • ");
  signalMarkets.textContent = topMarkets || "Multi-region";
};

const renderLeads = (filteredLeads) => {
  leadsContainer.innerHTML = "";
  if (!filteredLeads.length) {
    emptyState.classList.remove("hidden");
    return;
  }
  emptyState.classList.add("hidden");

  filteredLeads.forEach((lead) => {
    const card = document.createElement("article");
    card.className = "lead-card";
    card.innerHTML = `
      <div class="lead-card__header">
        <div>
          <div class="lead-card__industry">${lead.industry}</div>
          <h3>${lead.brand}</h3>
          <div class="lead-card__location">${lead.location.city} • ${lead.location.country}</div>
        </div>
        <div class="lead-card__status ${lead.status === "High-fit" ? "hot" : "warm"}">
          ${lead.status}
        </div>
      </div>
      <p class="lead-card__summary">${lead.summary}</p>
      <div class="lead-card__meta">
        <div>
          <span>Platform</span>
          ${lead.platforms
            .map(
              (platform) =>
                `<div>${platform.type} • ${platform.handle} (${platform.followersLabel})</div>`
            )
            .join("")}
        </div>
        <div>
          <span>Cadence</span>
          <div>${lead.activity.description}</div>
        </div>
      </div>
      <div class="lead-card__signals">
        ${lead.signals.map((signal) => `<span>${signal}</span>`).join("")}
      </div>
      <a class="lead-card__link" href="${lead.primaryLink}" target="_blank" rel="noopener">
        Review Presence
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 12h11.17l-4.58 4.59L13 18l7-7-7-7-1.41 1.41L16.17 11H5v1z"/>
        </svg>
      </a>
    `;
    leadsContainer.appendChild(card);
  });
};

const filterLeads = () => {
  const industry = industryFilter.value;
  const location = locationFilter.value;
  const platform = platformFilter.value;
  const activity = activityFilter.value;
  const query = searchFilter.value.trim().toLowerCase();

  const result = leads.filter((lead) => {
    const byIndustry = industry === "all" || lead.industry === industry;
    const byLocation = location === "all" || lead.location.country === location;
    const byPlatform =
      platform === "all" ||
      lead.platforms.some((item) => item.type.toLowerCase() === platform.toLowerCase());
    const byActivity = activity === "all" || lead.activity.level === activity;

    const searchable = [
      lead.brand,
      lead.industry,
      lead.location.city,
      lead.location.country,
      lead.summary,
      ...lead.signals,
      ...lead.platforms.map((item) => item.handle),
      lead.positioningKeywords.join(" "),
    ]
      .join(" ")
      .toLowerCase();

    const bySearch = !query || searchable.includes(query);

    return byIndustry && byLocation && byPlatform && byActivity && bySearch;
  });

  renderLeads(result);
};

const registerListeners = () => {
  [industryFilter, locationFilter, platformFilter, activityFilter].forEach((control) =>
    control.addEventListener("change", filterLeads)
  );
  searchFilter.addEventListener("input", () => {
    window.clearTimeout(searchFilter._timeoutId);
    searchFilter._timeoutId = window.setTimeout(filterLeads, 160);
  });
};

populateFilters();
renderSignals();
renderLeads(leads);
registerListeners();
