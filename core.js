(function (root) {
  const collator = new Intl.Collator('pl', { sensitivity: 'base' });
  const normalize = value => value.toLocaleLowerCase('pl').normalize('NFD').replace(/\p{M}/gu, '').replace(/ł/g, 'l');
  const key = item => `${item.gender}:${item.name}`;
  function prepare(names) {
    const sorted = names.map(item => ({ ...item, search: normalize(item.name) }))
      .sort((a, b) => b.count - a.count || collator.compare(a.name, b.name) || a.gender.localeCompare(b.gender));
    const groups = { K: [], M: [] };
    let lastCount, rank;
    sorted.forEach((item, index) => {
      if (item.count !== lastCount) rank = index + 1;
      item.rank = rank;
      lastCount = item.count;
      const group = groups[item.gender];
      item.genderRank = group.length && group.at(-1).count === item.count ? group.at(-1).genderRank : group.length + 1;
      group.push(item);
    });
    return sorted;
  }
  function filter(names, { query = '', gender = 'all', letter = '', rare = false, short = false, sort = 'count-desc' }) {
    const q = normalize(query.trim());
    const filtered = names.filter(item => (gender === 'all' || item.gender === gender)
      && (!q || item.search.includes(q)) && (!letter || item.name.startsWith(letter))
      && (!rare || item.count <= 100) && (!short || [...item.name].length <= 4));
    const [field, direction] = sort.split('-');
    return filtered.sort((a, b) => {
      const result = field === 'name' ? collator.compare(a.name, b.name) : a.count - b.count;
      return (direction === 'asc' ? result : -result) || a.rank - b.rank || collator.compare(a.name, b.name);
    });
  }
  function resultLabel(n) {
    return new Intl.PluralRules('pl').select(n) === 'one' ? 'wynik' : new Intl.PluralRules('pl').select(n) === 'few' ? 'wyniki' : 'wyników';
  }
  const api = { normalize, key, prepare, filter, resultLabel };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Names = api;
})(globalThis);
