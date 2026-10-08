const test = require('node:test');
const assert = require('node:assert/strict');
const {prepare, filter, normalize, resultLabel} = require('../core.js');
const fs = require('node:fs');
const real = prepare(JSON.parse(fs.readFileSync('data/names.json', 'utf8')).names);
test('wyszukiwanie i sortowanie zachowują miejsce Łukasza w pełnym rankingu', () => {
  const original = real.find(x => x.name === 'ŁUKASZ' && x.gender === 'M');
  const found = filter(real, {query:'lukasz', gender:'M', sort:'name-desc'});
  assert(found.some(x => x.name === 'LUKASZ'));
  assert.equal(found.find(x => x.name === 'ŁUKASZ').rank, original.rank);
  assert(original.rank > 1);
  assert.equal(normalize('ŁÓDŹ'), 'lodz');
});
test('remisy mają ranking 1, 1, 3 i osobne miejsca wśród płci', () => {
  const names = prepare([{name:'OLA', gender:'K', count:10},{name:'JAN', gender:'M', count:10},{name:'EWA', gender:'K', count:5}]);
  assert.deepEqual(names.map(x=>x.rank), [1,1,3]);
  assert.equal(names.find(x=>x.name==='EWA').genderRank,2);
});
test('filtry łączą się i nie zmieniają danych ani numerów', () => {
  const found = filter(real, {gender:'K', letter:'A', rare:true, short:true, sort:'count-asc'});
  assert(found.length > 0);
  assert(found.every(x=>x.gender==='K' && x.name.startsWith('A') && x.count<=100 && [...x.name].length<=4));
  assert(found.every((x,i)=>!i || x.count>=found[i-1].count));
  assert.equal(real[0].rank,1);
  assert.equal(filter(real,{query:'nieistniejaceimiexyz'}).length,0);
});
test('polska odmiana liczby wyników', () => {
  assert.deepEqual([0,1,2,5,12,22,101,104].map(resultLabel), ['wyników','wynik','wyniki','wyników','wyników','wyniki','wyników','wyniki']);
});
