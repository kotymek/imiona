const state = {
  all: [],
  filtered: [],
  gender: "all",
  query: "",
  sort: "count-desc",
  page: 1,
  perPage: 50,
  totalPeople: 0,
};

const els = {
  body: document.querySelector("#names-body"),
  search: document.querySelector("#search"),
  sort: document.querySelector("#sort"),
  resultCount: document.querySelector("#result-count"),
  pageInfo: document.querySelector("#page-info"),
  prev: document.querySelector("#prev"),
  next: document.querySelector("#next"),
};

const number = new Intl.NumberFormat("pl-PL");
const date = new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long", year: "numeric" });
const collator = new Intl.Collator("pl", { sensitivity: "base" });

function applyFilters() {
  const query = state.query.trim().toLocaleUpperCase("pl");
  state.filtered = state.all.filter(item =>
    (state.gender === "all" || item.gender === state.gender) &&
    (!query || item.name.includes(query))
  );

  const [field, direction] = state.sort.split("-");
  state.filtered.sort((a, b) => {
    const result = field === "name" ? collator.compare(a.name, b.name) : a.count - b.count;
    return direction === "asc" ? result : -result;
  });

  render();
}

function render() {
  const pages = Math.max(1, Math.ceil(state.filtered.length / state.perPage));
  state.page = Math.min(state.page, pages);
  const start = (state.page - 1) * state.perPage;
  const rows = state.filtered.slice(start, start + state.perPage);

  els.resultCount.textContent = `${number.format(state.filtered.length)} wyników`;
  els.pageInfo.textContent = `Strona ${state.page} z ${pages}`;
  els.prev.disabled = state.page === 1;
  els.next.disabled = state.page === pages;

  if (!rows.length) {
    els.body.innerHTML = '<tr><td colspan="5" class="loading">Nie znaleziono takiego imienia.</td></tr>';
    return;
  }

  els.body.innerHTML = rows.map((item, index) => {
    const isMale = item.gender === "M";
    const share = state.totalPeople ? item.count / state.totalPeople * 100 : 0;
    const barWidth = Math.max(.4, item.count / state.all[0].count * 100);
    return `<tr>
      <td>${number.format(start + index + 1)}</td>
      <td class="name">${titleCase(item.name)}</td>
      <td><span class="gender ${isMale ? "m" : ""}">${isMale ? "Mężczyzna" : "Kobieta"}</span></td>
      <td class="number">${number.format(item.count)}</td>
      <td class="share" title="${share.toLocaleString("pl-PL", { maximumFractionDigits: 4 })}%">
        <div class="bar ${isMale ? "m" : ""}"><span style="width:${barWidth}%"></span></div>
      </td>
    </tr>`;
  }).join("");
}

function titleCase(value) {
  return value.toLocaleLowerCase("pl").replace(/(^|[-\s])\p{L}/gu, letter => letter.toLocaleUpperCase("pl"));
}

async function load() {
  try {
    const response = await fetch("data/names.json");
    if (!response.ok) throw new Error("Nie udało się pobrać danych");
    const payload = await response.json();
    state.all = payload.names;
    state.totalPeople = payload.names.reduce((sum, item) => sum + item.count, 0);
    document.querySelector("#total-people").textContent = compact(state.totalPeople);
    document.querySelector("#total-names").textContent = number.format(payload.names.length);
    document.querySelector("#data-date").textContent = date.format(new Date(`${payload.date}T12:00:00`));
    applyFilters();
  } catch (error) {
    els.body.innerHTML = '<tr><td colspan="5" class="loading">Dane są chwilowo niedostępne. Spróbuj ponownie później.</td></tr>';
    els.resultCount.textContent = "Błąd wczytywania";
  }
}

function compact(value) {
  return new Intl.NumberFormat("pl-PL", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

els.search.addEventListener("input", event => {
  state.query = event.target.value;
  state.page = 1;
  applyFilters();
});
els.sort.addEventListener("change", event => {
  state.sort = event.target.value;
  state.page = 1;
  applyFilters();
});
document.querySelectorAll("[data-gender]").forEach(button => button.addEventListener("click", () => {
  document.querySelector("[data-gender].active").classList.remove("active");
  button.classList.add("active");
  state.gender = button.dataset.gender;
  state.page = 1;
  applyFilters();
}));
els.prev.addEventListener("click", () => { state.page--; render(); window.scrollTo({ top: document.querySelector(".ranking").offsetTop, behavior: "smooth" }); });
els.next.addEventListener("click", () => { state.page++; render(); window.scrollTo({ top: document.querySelector(".ranking").offsetTop, behavior: "smooth" }); });

load();
