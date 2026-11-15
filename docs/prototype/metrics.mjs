// Indicateurs d'équilibrage du questionnaire. Les seuils sont ceux du cahier des charges (section 5.3).
import { FACTIONS, QUESTIONS } from './model.mjs';
import {
  AXIS_KEYS, FACTION_KEYS, OPTIONS, MAX_POS, MAX_NEG,
  profile, rank, dist, dot, contribution, answerAs, makeRng, clamp,
} from './engine.mjs';

export const THRESHOLDS = {
  archetype: 12,          // C1 : 12/12 archétypes reconnus
  reachMin: 80,           // C2 : chaque faction atteignable avec un score ≥ 80 %
  recognitionMin: 65,     // C3 : reconnaissance ≥ 65 % pour chaque faction…
  recognitionMean: 80,    //      … et ≥ 80 % en moyenne
  shareMin: 2,            // C4 : chaque faction obtient entre 2 %…
  shareMax: 25,           //      … et 25 % des résultats (personas uniformes)
  axisMinQuestions: 8,    // C5 : chaque axe est touché par au moins 8 questions
};

const tally = () => Object.fromEntries(FACTION_KEYS.map((k) => [k, 0]));

export function runMetrics(centers, { n = 20000, seed = 7 } = {}) {
  const rng = makeRng(seed);
  const out = {};

  out.coverage = AXIS_KEYS.map((a, i) => ({
    axis: a,
    questions: OPTIONS.filter((o) => o.some((v) => v[i] !== 0)).length,
    maxPos: MAX_POS[i],
    maxNeg: MAX_NEG[i],
  }));

  out.neighbors = FACTION_KEYS.map((k) => {
    const nn = FACTION_KEYS.filter((j) => j !== k)
      .map((j) => ({ j, d: dist(centers[k], centers[j]) }))
      .sort((a, b) => a.d - b.d);
    return { k, first: nn[0], second: nn[1] };
  });

  // Archétype : à chaque question, on choisit l'option la plus alignée avec le profil déclaré.
  out.archetype = FACTION_KEYS.map((k) => {
    const p = FACTIONS[k].p;
    const choice = OPTIONS.map((opts) => {
      let best = 0, bv = -Infinity;
      opts.forEach((o, i) => { const v = dot(contribution(o), p); if (v > bv) { bv = v; best = i; } });
      return best;
    });
    const r = rank(profile(choice), centers);
    return { k, top: r[0], second: r[1], ok: r[0].k === k };
  });

  // Atteignabilité : descente coordonnée pour trouver les réponses qui rapprochent le plus du centre.
  out.reach = FACTION_KEYS.map((k) => {
    const target = centers[k];
    const choice = OPTIONS.map(() => 0);
    for (let it = 0; it < 20; it++) {
      let changed = false;
      OPTIONS.forEach((opts, q) => {
        let best = choice[q], bd = Infinity;
        opts.forEach((_, i) => {
          const c = [...choice]; c[q] = i;
          const d = dist(profile(c), target);
          if (d < bd - 1e-12) { bd = d; best = i; }
        });
        if (best !== choice[q]) { choice[q] = best; changed = true; }
      });
      if (!changed) break;
    }
    const r = rank(profile(choice), centers);
    return { k, score: r.find((x) => x.k === k).c, first: r[0].k === k };
  });

  // Personas uniformes : convictions tirées au hasard dans tout l'espace.
  {
    const count = tally();
    let close = 0;
    for (let i = 0; i < n; i++) {
      const p = AXIS_KEYS.map(() => rng.rnd() * 2 - 1);
      const r = rank(profile(answerAs(p, 3, rng)), centers);
      count[r[0].k]++;
      if (r[0].c - r[1].c < 3) close++;
    }
    out.share = Object.fromEntries(FACTION_KEYS.map((k) => [k, (100 * count[k]) / n]));
    out.closeShare = (100 * close) / n;
  }

  // Reconnaissance : personas proches d'une faction (σ = 0,3) ; part classée dans la bonne faction.
  out.recognition = FACTION_KEYS.map((k) => {
    const m = 2000;
    const conf = tally();
    for (let i = 0; i < m; i++) {
      const p = FACTIONS[k].p.map((v) => clamp(v + 0.3 * rng.gauss()));
      conf[rank(profile(answerAs(p, 3, rng)), centers)[0].k]++;
    }
    const rate = (100 * conf[k]) / m;
    const confusions = FACTION_KEYS.filter((j) => j !== k)
      .map((j) => ({ j, pct: (100 * conf[j]) / m }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 2);
    return { k, rate, confusions };
  });

  // Réponses totalement aléatoires (quelqu'un qui clique au hasard).
  {
    const count = tally();
    for (let i = 0; i < n; i++) {
      count[rank(profile(OPTIONS.map((o) => Math.floor(rng.rnd() * o.length))), centers)[0].k]++;
    }
    out.random = Object.fromEntries(FACTION_KEYS.map((k) => [k, (100 * count[k]) / n]));
  }

  const T = THRESHOLDS;
  const recMean = out.recognition.reduce((s, r) => s + r.rate, 0) / out.recognition.length;
  out.recognitionMean = recMean;
  out.checks = [
    { id: 'C1', label: 'Archétypes reconnus', value: `${out.archetype.filter((a) => a.ok).length}/12`, ok: out.archetype.filter((a) => a.ok).length >= T.archetype },
    { id: 'C2', label: `Atteignabilité (score ≥ ${T.reachMin} % et 1er)`, value: `min ${Math.min(...out.reach.map((r) => r.score)).toFixed(0)} %`, ok: out.reach.every((r) => r.first && r.score >= T.reachMin) },
    { id: 'C3', label: `Reconnaissance (≥ ${T.recognitionMin} % chacune, ≥ ${T.recognitionMean} % en moyenne)`, value: `min ${Math.min(...out.recognition.map((r) => r.rate)).toFixed(1)} %, moyenne ${recMean.toFixed(1)} %`, ok: out.recognition.every((r) => r.rate >= T.recognitionMin) && recMean >= T.recognitionMean },
    { id: 'C4', label: `Répartition (entre ${T.shareMin} % et ${T.shareMax} %)`, value: `de ${Math.min(...Object.values(out.share)).toFixed(1)} % à ${Math.max(...Object.values(out.share)).toFixed(1)} %`, ok: Object.values(out.share).every((s) => s >= T.shareMin && s <= T.shareMax) },
    { id: 'C5', label: `Couverture (≥ ${T.axisMinQuestions} questions par axe)`, value: `min ${Math.min(...out.coverage.map((c) => c.questions))}`, ok: out.coverage.every((c) => c.questions >= T.axisMinQuestions) },
    { id: 'C6', label: 'Aucune option sans effet (hors « Sans avis »)', value: `${QUESTIONS.length} questions`, ok: QUESTIONS.every((q) => q.type === 'scale' || q.answers.every((r) => Object.values(r.d).some((v) => v !== 0))) },
  ];
  return out;
}
