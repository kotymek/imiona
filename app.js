const $ = selector => document.querySelector(selector);
const number = new Intl.NumberFormat('pl-PL');
const date = new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Warsaw' });
const titleCase = value => value.toLocaleLowerCase('pl').replace(/(^|[-\s])\p{L}/gu, letter => letter.toLocaleUpperCase('pl'));
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const state = { all: [], filtered: [], gender: 'all', query: '', sort: 'count-desc', letter: '', rare: false, short: false, page: 1, perPage: 50, total: 0, selected: [], current: null, history: [] };
const percentage = count => `${(count / state.total * 100).toLocaleString('pl-PL', { maximumFractionDigits: 4 })}%`;
const label = item => `${titleCase(item.name)} (${item.gender === 'K' ? 'kobiety' : 'mężczyźni'})`;
const itemLink = item => `#${new URLSearchParams({ name: item.name, gender: item.gender })}`;
function applyFilters() { state.filtered = Names.filter(state.all, state); render(); }
function render() {
  const pages = Math.max(1, Math.ceil(state.filtered.length / state.perPage));
  state.page = Math.max(1, Math.min(state.page, pages));
  $('#result-count').textContent = `${number.format(state.filtered.length)} ${Names.resultLabel(state.filtered.length)}`;
  $('#page-info').textContent = `Strona ${state.page} z ${number.format(pages)}`;
  $('#page-number').max = pages;
  $('#page-number').value = state.page;
  $('#prev').disabled = state.page === 1;
  $('#next').disabled = state.page === pages;
  const rows = state.filtered.slice((state.page - 1) * state.perPage, state.page * state.perPage);
  $('#names-body').innerHTML = rows.length ? rows.map(item => {
    const selected = state.selected.includes(item);
    return `<tr><td>${number.format(item.rank)}</td><td class="name"><a href="${escape(itemLink(item))}">${escape(titleCase(item.name))}</a></td>
      <td><span class="gender ${item.gender === 'M' ? 'm' : ''}">${item.gender === 'M' ? 'Mężczyzna' : 'Kobieta'}</span></td>
      <td class="number">${number.format(item.count)}</td><td class="share number">${percentage(item.count)}</td>
      <td><button class="add" data-key="${escape(Names.key(item))}" aria-label="${escape((selected ? 'Usuń z porównania: ' : 'Dodaj do porównania: ') + label(item))}" aria-pressed="${selected}">${selected ? '✓' : '+'}</button></td></tr>`;
  }).join('') : '<tr><td colspan="6" class="loading">Nie znaleziono imienia. Zmień zapytanie lub wyczyść filtry.</td></tr>';
}
function toggleCompare(item) {
  if (state.selected.includes(item)) state.selected = state.selected.filter(other => other !== item);
  else if (state.selected.length < 4) state.selected.push(item);
  else { $('#comparison-status').textContent = 'Możesz porównać najwyżej 4 imiona. Usuń jedno z wybranych.'; $('#copy-status').textContent = 'Porównanie mieści najwyżej 4 imiona. Zamknij kartę i usuń jedno z wybranych.'; return; }
  $('#comparison-status').textContent = `Wybrano ${state.selected.length} z 4 imion.${state.selected.length < 2 ? ' Dodaj co najmniej dwa imiona, aby je porównać.' : ''}`;
  const max = Math.max(...state.selected.map(item => item.count), 1);
  $('#comparison').innerHTML = state.selected.map(item => `<div class="compare-row"><div><a href="${escape(itemLink(item))}">${escape(label(item))}</a><button data-key="${escape(Names.key(item))}" aria-label="${escape('Usuń z porównania: ' + label(item))}">×</button></div><strong>${number.format(item.count)} osób</strong><span class="hint">Miejsce ${number.format(item.rank)} · ${percentage(item.count)} zestawienia · ${number.format(max - item.count)} mniej niż najczęstsze z wybranych</span><div class="bar" aria-hidden="true"><span style="width:${item.count / max * 100}%"></span></div></div>`).join('');
  $('#compare-tray').hidden = state.selected.length === 0;
  $('#compare-tray').textContent = `Porównaj wybrane imiona (${state.selected.length}/4) ↓`;
  $('#copy-status').textContent = state.selected.includes(item) ? 'Imię dodane do porównania. Zestawienie znajdziesz pod rankingiem.' : 'Imię usunięte z porównania.';
  const focusedKey = document.activeElement?.dataset.key;
  render(); updateCompareButton();
  if (focusedKey) [...document.querySelectorAll('#names-body button[data-key]')].find(button => button.dataset.key === focusedKey)?.focus();
}
function updateCompareButton() { $('#detail-compare').textContent = state.selected.includes(state.current) ? 'Usuń z porównania' : 'Dodaj do porównania'; }
async function showDetail(item) {
  state.current = item;
  $('#name-title').textContent = titleCase(item.name);
  $('#copy-status').textContent = '';
  $('#share-url').value = new URL(itemLink(item), location.href).href;
  updateCompareButton();
  const index = state.all.indexOf(item);
  const neighbours = state.all.slice(Math.max(0, index - 1), index + 2).filter(other => other !== item);
  $('#name-detail').innerHTML = `<p>${item.gender === 'K' ? 'Kobiety' : 'Mężczyźni'} · stan na ${escape(state.dataDate)}</p><div class="detail-stats"><div><strong>${number.format(item.count)}</strong><span>osób</span></div><div><strong>#${number.format(item.rank)}</strong><span>w rankingu ogólnym</span></div><div><strong>#${number.format(item.genderRank)}</strong><span>wśród ${item.gender === 'K' ? 'kobiet' : 'mężczyzn'}</span></div></div><p>Około <strong>1 na ${number.format(Math.round(state.total / item.count))}</strong> osób w tym zestawieniu nosi ten zapis imienia (${percentage(item.count)}).</p><h3>Obok w rankingu</h3><ul>${neighbours.map(other => `<li><a href="${escape(itemLink(other))}">${escape(label(other))}</a> — #${number.format(other.rank)}, ${number.format(other.count)} osób</li>`).join('')}</ul><h3>Historia liczebności</h3><div id="history-detail">Wczytywanie historii…</div>`;
  if (!$('#name-dialog').open) $('#name-dialog').showModal();
  try {
    const observations = await Promise.all(state.history.map(async entry => {
      if (entry.date === state.rawDate) return { date: entry.date, count: item.count };
      if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) throw new Error('Invalid date');
      const response = await fetch(`data/history/${entry.date}.json`);
      if (!response.ok) throw new Error('History unavailable');
      const payload = await response.json();
      const found = payload.names.find(other => Names.key(other) === Names.key(item));
      return { date: entry.date, count: found?.count };
    }));
    if (state.current !== item) return;
    if (observations.length < 2) $('#history-detail').textContent = 'Mamy jeden zachowany stan danych. Kolejne publikacje będą archiwizowane automatycznie; wtedy pojawi się porównanie w czasie. To historia rejestru PESEL, nie ranking noworodków.';
    else $('#history-detail').innerHTML = `<table><thead><tr><th>Stan danych</th><th>Liczba osób</th><th>Zmiana od poprzedniego stanu</th></tr></thead><tbody>${observations.map((entry, i) => { const previous = observations[i - 1]?.count; const delta = entry.count != null && previous != null ? entry.count - previous : null; return `<tr><td>${escape(entry.date)}</td><td>${entry.count == null ? 'Brak w pliku' : number.format(entry.count)}</td><td>${delta == null ? '—' : (delta > 0 ? '+' : '') + number.format(delta)}</td></tr>`; }).join('')}</tbody></table><p class="hint">Zmiany w rejestrze nie oznaczają liczby urodzeń.</p>`;
  } catch { if (state.current === item) $('#history-detail').textContent = 'Historia jest chwilowo niedostępna. Dane bieżące pozostają dostępne.'; }
}
function openFromHash() {
  const params = new URLSearchParams(location.hash.slice(1));
  const item = state.all.find(item => item.name === params.get('name') && item.gender === params.get('gender'));
  if (item) showDetail(item);
  else if ($('#name-dialog').open) $('#name-dialog').close();
}
async function load() {
  try {
    const response = await fetch('data/names.json');
    if (!response.ok) throw new Error('Data unavailable');
    const payload = await response.json();
    state.all = Names.prepare(payload.names);
    state.total = state.all.reduce((sum, item) => sum + item.count, 0);
    state.rawDate = payload.date;
    state.dataDate = date.format(new Date(`${payload.date}T12:00:00Z`));
    $('#total-people').textContent = new Intl.NumberFormat('pl-PL', { notation: 'compact', maximumFractionDigits: 1 }).format(state.total);
    $('#total-names').textContent = number.format(state.all.length);
    $('#data-date').textContent = $('#method-date').textContent = state.dataDate;
    $('#checked-date').textContent = payload.updated ? date.format(new Date(payload.updated)) : 'Brak informacji';
    const letters = [...new Set(state.all.map(item => [...item.name][0]))].sort(new Intl.Collator('pl').compare);
    letters.forEach(letter => $('#letter').add(new Option(letter, letter)));
    applyFilters();
    try { const response = await fetch('data/history/index.json'); if (!response.ok) throw new Error(); state.history = await response.json(); }
    catch { state.history = [{ date: payload.date }]; }
    openFromHash();
  } catch {
    $('#names-body').innerHTML = '<tr><td colspan="6" class="loading">Dane są chwilowo niedostępne. <button id="retry">Spróbuj ponownie</button></td></tr>';
    $('#result-count').textContent = 'Błąd wczytywania';
    $('#retry').addEventListener('click', load);
  }
}
$('#search').addEventListener('input', event => { state.query = event.target.value; state.page = 1; applyFilters(); });
for (const id of ['sort', 'letter', 'rare', 'short']) $( `#${id}`).addEventListener('change', event => { state[id] = event.target.type === 'checkbox' ? event.target.checked : event.target.value; state.page = 1; applyFilters(); });
document.querySelectorAll('[data-gender]').forEach(button => { button.setAttribute('aria-pressed', button.dataset.gender === 'all'); button.addEventListener('click', () => { state.gender = button.dataset.gender; document.querySelectorAll('[data-gender]').forEach(other => { const active = other === button; other.classList.toggle('active', active); other.setAttribute('aria-pressed', active); }); state.page = 1; applyFilters(); }); });
$('#reset').addEventListener('click', () => { $('#search').value = $('#letter').value = ''; $('#rare').checked = $('#short').checked = false; $('#sort').value = 'count-desc'; Object.assign(state, { query: '', letter: '', rare: false, short: false, sort: 'count-desc' }); document.querySelector('[data-gender="all"]').click(); });
function changePage(page) { state.page = page; render(); $('.ranking').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); }
$('#prev').addEventListener('click', () => changePage(state.page - 1));
$('#next').addEventListener('click', () => changePage(state.page + 1));
$('#per-page').addEventListener('change', event => { state.perPage = Number(event.target.value); state.page = 1; render(); });
$('#page-form').addEventListener('submit', event => { event.preventDefault(); changePage(Number($('#page-number').value)); });
for (const selector of ['#names-body', '#comparison']) $(selector).addEventListener('click', event => { const button = event.target.closest('button[data-key]'); if (button) toggleCompare(state.all.find(item => Names.key(item) === button.dataset.key)); });
$('#detail-compare').addEventListener('click', () => toggleCompare(state.current));
$('#close-dialog').addEventListener('click', () => $('#name-dialog').close());
$('#name-dialog').addEventListener('close', () => { if (new URLSearchParams(location.hash.slice(1)).has('name')) history.replaceState(null, '', location.pathname + location.search); state.current = null; });
$('#copy-link').addEventListener('click', async () => { try { await navigator.clipboard.writeText($('#share-url').value); $('#copy-status').textContent = 'Link skopiowany.'; } catch { $('#share-url').select(); $('#copy-status').textContent = 'Skopiuj zaznaczony link.'; } });
window.addEventListener('hashchange', openFromHash);
load();
