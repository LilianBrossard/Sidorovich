// Usage : node docs/prototype/sim.mjs
// Affiche les indicateurs d'équilibrage et sort en erreur si un critère du cahier des charges échoue.
import { FACTIONS } from './model.mjs';
import { FACTION_KEYS, calibrate } from './engine.mjs';
import { runMetrics } from './metrics.mjs';

const centers = calibrate();
const m = runMetrics(centers);
const f = (x) => x.toFixed(1).padStart(5) + ' %';
const log = console.log;

log('== Centres calibrés ==');
for (const k of FACTION_KEYS) log(`${k.padEnd(3)} ${centers[k].map((v) => v.toFixed(2).padStart(5)).join(' ')}`);

log('\n== Couverture des axes ==');
for (const c of m.coverage) log(`${c.axis}: ${c.questions} questions (max + ${c.maxPos}, max - ${c.maxNeg})`);

log('\n== Archétypes ==');
for (const a of m.archetype) log(`${a.k.padEnd(3)} -> ${a.top.k.padEnd(3)} ${a.top.c.toFixed(0)} % | 2e ${a.second.k} ${a.second.c.toFixed(0)} % ${a.ok ? 'OK' : 'ÉCHEC'}`);

log('\n== Reconnaissance (σ = 0,3) ==');
for (const r of m.recognition) log(`${FACTIONS[r.k].name.padEnd(12)} ${f(r.rate)}  confusions : ${r.confusions.map((c) => `${c.j} ${f(c.pct)}`).join(', ')}`);

log('\n== Répartition, personas uniformes ==');
log(FACTION_KEYS.map((k) => `${k} ${f(m.share[k])}`).join(' | '));
log(`Résultats serrés (< 3 points d'écart) : ${f(m.closeShare)}`);

log('\n== Critères ==');
for (const c of m.checks) log(`${c.ok ? '✔' : '✘'} ${c.id} ${c.label} : ${c.value}`);
process.exit(m.checks.every((c) => c.ok) ? 0 : 1);
