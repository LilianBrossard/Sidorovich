// Usage : node docs/prototype/gen-doc.mjs
// Régénère docs/02-questionnaire.md à partir de model.mjs (source unique des questions et des chiffres).
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { AXES, FACTIONS, QUESTIONS, SCALE_LABELS, VERSION } from './model.mjs';
import {
  AXIS_KEYS, FACTION_KEYS, OPTIONS, contribution, dot, profile, rank, calibrate, D_REF,
} from './engine.mjs';
import { runMetrics } from './metrics.mjs';

const centers = calibrate();
const m = runMetrics(centers);

const MINUS = '−';
const sgn = (v) => (v > 0 ? `+${v}` : v < 0 ? `${MINUS}${-v}` : '0');
const num = (v, d = 2) => (v < 0 ? MINUS : '') + Math.abs(v).toFixed(d).replace('.', ',');
const pct = (v, d = 1) => `${v.toFixed(d).replace('.', ',')} %`;
const deltas = (vec) => vec.map((v, i) => (v ? `${AXIS_KEYS[i]} ${sgn(v)}` : null)).filter(Boolean).join(' · ') || '—';
const LETTERS = 'ABCD';

// --- Indice d'attraction : produit scalaire contribution × centre, centré par question. ---
const pulls = OPTIONS.map((opts) => {
  const raw = opts.map((o) => FACTION_KEYS.map((k) => dot(contribution(o), centers[k])));
  const mean = FACTION_KEYS.map((_, f) => raw.reduce((s, r) => s + r[f], 0) / raw.length);
  return raw.map((r) => r.map((v, f) => v - mean[f]));
});
const all = pulls.flat(2).map(Math.abs).sort((a, b) => a - b);
const q = (p) => all[Math.floor(p * (all.length - 1))];
const T2 = q(0.85); // 15 % des effets les plus forts
const T1 = q(0.55); // 30 % suivants
const sym = (v) => (v >= T2 ? '++' : v >= T1 ? '+' : v <= -T2 ? `${MINUS}${MINUS}` : v <= -T1 ? MINUS : '·');

const signature = (p) =>
  p.map((v, i) => ({ v, i }))
    .filter(({ v }) => Math.abs(v) >= 0.6)
    .sort((a, b) => Math.abs(b.v) - Math.abs(a.v))
    .map(({ v, i }) => {
      const [plus, minus] = AXES[i].name.split(' ↔ ');
      return `${v > 0 ? plus : minus}${Math.abs(v) >= 0.85 ? ' (fort)' : ''}`;
    })
    .join(', ');

const L = [];
const w = (s = '') => L.push(s);

w('# 02 · Questionnaire et impacts par faction');
w();
w(`> **Version ${VERSION}** · brouillon de cadrage du 15/11/2026 · à valider.`);
w('>');
w('> Ce document est **généré** par `node docs/prototype/gen-doc.mjs` à partir de [`prototype/model.mjs`](prototype/model.mjs).');
w('> Pour modifier une question ou un profil, on modifie `model.mjs` puis on régénère : textes, tableaux et indicateurs restent ainsi cohérents.');
w('> Vérification rapide de l’équilibrage : `node docs/prototype/sim.mjs` (code de sortie 1 si un critère échoue).');
w();
w('## Sommaire');
w();
w('1. [Comment lire ce document](#1-comment-lire-ce-document)');
w('2. [Les 7 axes de valeurs](#2-les-7-axes-de-valeurs)');
w('3. [Les 12 factions](#3-les-12-factions)');
w('4. [Méthode de calcul](#4-méthode-de-calcul)');
w('5. [Les 24 questions](#5-les-24-questions)');
w('6. [Textes de Sidorovich hors questions](#6-textes-de-sidorovich-hors-questions)');
w('7. [Synthèse et équilibrage](#7-synthèse-et-équilibrage)');
w();

w('## 1. Comment lire ce document');
w();
w('- Les questions sont des **dilemmes moraux, sociétaux ou personnels**. La plupart ne parlent pas du jeu ; seul l’habillage (la voix de Sidorovich, quelques décors) rappelle la Zone.');
w('- Chaque réponse **déplace le profil du candidat sur 1 à 4 axes**, de −2 à +2. Elle ne donne jamais de points directement à une faction.');
w('- Le tableau **Impact** de chaque question montre l’effet de chaque réponse sur la proximité avec chaque faction :');
w('  - `++` : rapproche fortement de la faction ; `+` : rapproche ;');
w('  - `·` : effet faible ou nul ;');
w(`  - \`${MINUS}\` : éloigne ; \`${MINUS}${MINUS}\` : éloigne fortement.`);
w('- Ces symboles sont **calculés**, pas estimés à la main (voir [4.4](#44-indice-dattraction-des-tableaux-dimpact)).');
w('- Les lettres A à D servent de repère dans ce document. **Sur le site, l’ordre des réponses est mélangé** à chaque partie pour éviter les biais de position.');
w('- Questions de type *Affirmation* : échelle à 5 niveaux (' + SCALE_LABELS.map((s) => `« ${s} »`).join(', ') + '). Les niveaux intermédiaires valent la moitié des extrêmes, « Sans avis » vaut 0.');
w('- Les textes sont rédigés en **français**, langue source. Ils sont formulés à l’épicène autant que possible : le candidat peut être une candidate. Les traductions EN, UK et RU sont produites en phase 3 du plan de développement.');
w();

w('## 2. Les 7 axes de valeurs');
w();
w('Les axes s’inspirent librement de la théorie des fondements moraux (Haidt : autorité, loyauté, soin, sacré), complétée par trois dimensions propres à l’univers : le rapport à la violence, le rapport à l’inconnu et l’arbitrage entre principes et résultats.');
w();
w('| Code | Axe | Pôle + | Pôle − | Questions |');
w('|---|---|---|---|---|');
AXES.forEach((a, i) => w(`| \`${a.key}\` | ${a.name} | ${a.plus} | ${a.minus} | ${m.coverage[i].questions} |`));
w();

w('## 3. Les 12 factions');
w();
w('Le **profil déclaré** exprime l’intention de conception : où se situe chaque faction sur les 7 axes, de −1 à +1. La **signature** reprend les axes les plus marqués (|valeur| ≥ 0,6).');
w();
w('| Code | Faction | Origine | En une phrase | Signature |');
w('|---|---|---|---|---|');
for (const k of FACTION_KEYS) {
  const f = FACTIONS[k];
  w(`| \`${k}\` | **${f.name}**${f.en !== f.name ? ` (${f.en})` : ''} | ${f.origin} | ${f.pitch} | ${signature(f.p)} |`);
}
w();
w('**Profils déclarés** (intention) :');
w();
w(`| Faction | ${AXIS_KEYS.join(' | ')} |`);
w(`|---|${AXIS_KEYS.map(() => '---:').join('|')}|`);
for (const k of FACTION_KEYS) w(`| ${FACTIONS[k].name} | ${FACTIONS[k].p.map((v) => num(v, 1)).join(' | ')} |`);
w();
w('> Ward, Spark et Noon viennent de *S.T.A.L.K.E.R. 2* (2024). Leur idéologie a été vérifiée dans des guides publiés après la sortie du jeu, mais la relecture « lore » de la phase 3 doit la confirmer, ainsi que leurs noms officiels en français.');
w();

w('## 4. Méthode de calcul');
w();
w('### 4.1 Du questionnaire au profil');
w();
w('1. Chaque réponse ajoute ses deltas aux totaux des 7 axes.');
w('2. En fin de test, chaque total est ramené entre −1 et +1. Un total positif est divisé par le **maximum positif atteignable** sur cet axe, un total négatif par le **maximum négatif atteignable**. Avec ces bornes asymétriques, les deux pôles de chaque axe restent atteignables même quand les questions ne sont pas parfaitement symétriques.');
w('3. On obtient le **profil du candidat** `u`, un vecteur de 7 valeurs.');
w();
w('Bornes actuelles :');
w();
w(`| | ${AXIS_KEYS.join(' | ')} |`);
w(`|---|${AXIS_KEYS.map(() => '---:').join('|')}|`);
w(`| Maximum + | ${m.coverage.map((c) => c.maxPos).join(' | ')} |`);
w(`| Maximum − | ${m.coverage.map((c) => c.maxNeg).join(' | ')} |`);
w();
w('### 4.2 Du profil à la faction');
w();
w('1. On calcule la **distance euclidienne** `d` entre `u` et le centre de chaque faction.');
w(`2. **Compatibilité** = 100 × (1 − d / √7), bornée à 0. √7 ≈ ${D_REF.toFixed(2).replace('.', ',')} est la distance du centre de l’espace à un sommet.`);
w('3. La faction la plus proche est le **résultat**. Le site affiche le classement complet et un radar à 7 branches (profil du candidat contre profil de la faction).');
w('4. Si l’écart entre la 1re et la 2e faction est **inférieur à 3 points**, le résultat est présenté comme **hybride** : Sidorovich hésite à voix haute, puis tranche.');
w('5. Le calcul est **déterministe** : les mêmes réponses donnent toujours le même résultat. Le lien de partage peut donc contenir seulement les réponses encodées, sans base de données.');
w();
w('La distance euclidienne a un avantage sur la similarité cosinus : elle tient compte de l’intensité des convictions. Une personne aux avis modérés sur tout tombe naturellement chez les **Solitaires**, la faction la plus « centrale ». C’est cohérent avec l’univers, où les Solitaires sont les plus nombreux.');
w();
w('### 4.3 Calibration des centres');
w();
w('Un vrai répondant ne choisit jamais 24 fois la réponse la plus extrême. Comparer son profil directement aux profils déclarés favoriserait donc les factions modérées, et des factions extrêmes comme le Monolithe ne sortiraient presque jamais.');
w();
w('Le moteur utilise donc des **centres calibrés**. Pour chaque faction, on simule 3 000 personas proches du profil déclaré (profil + bruit gaussien σ = 0,3, réponses tirées avec une probabilité ∝ exp(3 × alignement)). Le centre est le profil moyen que ces personas obtiennent réellement. Le calcul est reproductible (générateur pseudo-aléatoire à graine fixe). Il est refait à chaque modification du questionnaire et ses résultats sont versionnés.');
w();
w('**Centres calibrés** (utilisés par le moteur) :');
w();
w(`| Faction | ${AXIS_KEYS.join(' | ')} |`);
w(`|---|${AXIS_KEYS.map(() => '---:').join('|')}|`);
for (const k of FACTION_KEYS) w(`| ${FACTIONS[k].name} | ${centers[k].map((v) => num(v)).join(' | ')} |`);
w();
w('Un grand écart entre profil déclaré et centre calibré signale qu’**aucune question ne permet d’exprimer** cette facette de la faction. C’est un signal pour retravailler le questionnaire.');
w();
w('### 4.4 Indice d’attraction (des tableaux d’impact)');
w();
w('Pour une réponse et une faction : indice = produit scalaire entre la contribution normalisée de la réponse et le centre de la faction, **moins la moyenne de cet indice sur toutes les réponses de la même question**. Un indice positif rapproche le candidat de la faction par rapport à une réponse « moyenne ».');
w(`Seuils : \`++\` pour les 15 % d’effets les plus forts (|indice| ≥ ${T2.toFixed(3).replace('.', ',')}), \`+\` pour les 30 % suivants (≥ ${T1.toFixed(3).replace('.', ',')}).`);
w();

// --- Exemple chiffré ---
{
  const k = 'DEV';
  const choice = OPTIONS.map((opts) => {
    let best = 0, bv = -Infinity;
    opts.forEach((o, i) => { const v = dot(contribution(o), FACTIONS[k].p); if (v > bv) { bv = v; best = i; } });
    return best;
  });
  const u = profile(choice);
  const r = rank(u, centers);
  w('### 4.5 Exemple');
  w();
  w(`Un candidat qui répond systématiquement « comme le Devoir » obtient le profil :`);
  w();
  w(`| | ${AXIS_KEYS.join(' | ')} |`);
  w(`|---|${AXIS_KEYS.map(() => '---:').join('|')}|`);
  w(`| u | ${u.map((v) => num(v)).join(' | ')} |`);
  w();
  w(`Classement : ${r.slice(0, 4).map((x, i) => `${i + 1}. ${FACTIONS[x.k].name} ${Math.round(x.c)} %`).join(' · ')} … ${FACTIONS[r.at(-1).k].name} ${Math.round(r.at(-1).c)} %.`);
  w();
}

w('## 5. Les 24 questions');
w();
QUESTIONS.forEach((qq, qi) => {
  const opts = OPTIONS[qi];
  const P = pulls[qi];
  const rows = qq.type === 'scale'
    ? [{ label: SCALE_LABELS[4], idx: 4 }, { label: SCALE_LABELS[0], idx: 0 }]
    : qq.answers.map((a, i) => ({ label: LETTERS[i], text: a.t, idx: i }));

  const spread = FACTION_KEYS.map((k, f) => ({ k, s: Math.max(...P.map((r) => r[f])) - Math.min(...P.map((r) => r[f])) }))
    .sort((a, b) => b.s - a.s).slice(0, 3).map((x) => FACTIONS[x.k].name);

  w(`### ${qq.id} · ${qq.title}`);
  w();
  w(`*${qq.kind}* · Départage surtout : ${spread.join(', ')}`);
  w();
  w(`> **Sidorovich :** « ${qq.prompt} »`);
  w();
  if (qq.type === 'scale') {
    w(`Échelle à 5 niveaux. « Tout à fait d’accord » : ${deltas(opts[4])}. « Pas du tout d’accord » : effet inverse.`);
  } else {
    w('| | Réponse | Effet sur les axes |');
    w('|---|---|---|');
    rows.forEach((r) => w(`| **${r.label}** | ${r.text} | ${deltas(opts[r.idx])} |`));
  }
  w();
  w(`| Impact | ${FACTION_KEYS.join(' | ')} |`);
  w(`|---|${FACTION_KEYS.map(() => ':---:').join('|')}|`);
  rows.forEach((r) => w(`| ${qq.type === 'scale' ? r.label : `**${r.label}**`} | ${P[r.idx].map(sym).join(' | ')} |`));
  w();
  if (qq.quip) {
    for (const [key, line] of Object.entries(qq.quip)) w(`*Réplique de Sidorovich${key === 'any' ? '' : ` après la réponse ${key}`} :* « ${line} »`);
    w();
  }
});

w('## 6. Textes de Sidorovich hors questions');
w();
w('Première version du ton : bourru, sarcastique, mercantile, jamais insultant. Pas de grossièretés : le site doit rester présentable dans un portfolio.');
w();
w('| Moment | Réplique |');
w('|---|---|');
w('| Accueil | « Entre, entre. Et ferme la porte, ça fait des courants d’air. Alors comme ça, tu veux travailler dans la Zone ? Bien. Je ne vais pas t’envoyer n’importe où. Vingt-quatre questions. Réponds honnêtement : les mensonges, je les sens à dix kilomètres. » |');
w('| Mi-parcours (après Q12) | « À mi-chemin. Tu tiens le coup ? Tiens, un coup de vodka. Contre les radiations, il n’y a pas mieux. » |');
w('| Calcul du résultat | « Voyons voir ce dossier… » |');
w('| Résultat hybride | « Hm. Tu hésites entre {A} et {B}. Moi aussi. Je t’envoie chez {A}… ils paient mieux. » |');
w('| Recommencer | « Encore ? Tu crois que tu vas me rouler ? Bon. On reprend depuis le début. » |');
w();
w('**Verdicts par faction :**');
w();
w('| Faction | Verdict de Sidorovich |');
w('|---|---|');
const VERDICTS = {
  SOL: 'Toi, tu n’appartiens à personne. Va, stalker. Et rapporte-moi des artefacts.',
  DEV: 'Discipline, principes, gâchette facile… Le Devoir va t’adorer. Évite de leur parler de moi.',
  LIB: 'Tu n’aimes ni les ordres ni les uniformes. Liberté t’attend. Là-bas, ils partagent tout, même ce qu’ils n’ont pas.',
  BAN: 'Tu as le sens des affaires… mais pas celui des manières. Les Bandits ont une place pour toi. Loin de mon comptoir.',
  MER: 'Efficace, pas de questions, pas de bavardage. Les Mercenaires paient bien. Moi, moins.',
  MON: 'Gloire au Monol… Hm. Non. Toi, je ne veux plus te voir ici.',
  ECO: 'Des questions, toujours des questions. Va voir les scientifiques : ils adorent qu’on leur rapporte des échantillons.',
  MIL: 'Tu aimes les ordres. L’armée aussi. Au moins, tu sauras où dormir.',
  CS: 'De l’idéalisme et une bonne gâchette. Clear Sky… s’il en reste.',
  WAR: 'Protéger les gens du dehors, contrôler ce qui entre et ce qui sort… La Ward a besoin de gens comme toi. Moi, un peu moins.',
  SPA: 'Tu crois que la Zone a une âme. Spark t’accueillera à bras ouverts. Je vends des combinaisons, si besoin.',
  NOO: 'Tu as l’air de quelqu’un qui revient de loin. Noon saura quoi faire de toi.',
};
for (const k of FACTION_KEYS) w(`| ${FACTIONS[k].name} | « ${VERDICTS[k]} » |`);
w();

w('## 7. Synthèse et équilibrage');
w();
w('### 7.1 Couverture : quels axes chaque question touche');
w();
w('Chaque case indique l’amplitude disponible sur l’axe : plus forte valeur positive / plus forte valeur négative parmi les réponses.');
w();
w(`| Question | ${AXIS_KEYS.join(' | ')} |`);
w(`|---|${AXIS_KEYS.map(() => ':---:').join('|')}|`);
QUESTIONS.forEach((qq, qi) => {
  const cells = AXIS_KEYS.map((_, i) => {
    const vals = OPTIONS[qi].map((o) => o[i]);
    const hi = Math.max(...vals), lo = Math.min(...vals);
    if (!hi && !lo) return '';
    return [hi > 0 ? sgn(hi) : null, lo < 0 ? sgn(lo) : null].filter(Boolean).join(' / ');
  });
  w(`| ${qq.id} ${qq.title} | ${cells.join(' | ')} |`);
});
w(`| **Questions par axe** | ${m.coverage.map((c) => `**${c.questions}**`).join(' | ')} |`);
w();
w('### 7.2 Critères d’équilibrage');
w();
w('Ces critères sont repris dans le cahier des charges (section 5.3) et deviendront des tests automatisés exécutés en intégration continue.');
w();
w('| Critère | Mesure actuelle | Statut |');
w('|---|---|---|');
for (const c of m.checks) w(`| ${c.id} · ${c.label} | ${c.value.replace(/(\d)\.(\d)/g, '$1,$2')} | ${c.ok ? '✅' : '❌'} |`);
w();
w('Définitions :');
w();
w('- **Archétype** : on répond à chaque question avec l’option la plus alignée sur le profil déclaré de la faction. Le résultat doit être cette faction.');
w('- **Atteignabilité** : il existe une combinaison de réponses qui place la faction en tête avec un score élevé.');
w('- **Reconnaissance** : 2 000 personas proches de la faction (profil + bruit σ = 0,3) ; part de celles qui obtiennent bien cette faction.');
w('- **Répartition** : 20 000 personas aux convictions tirées au hasard dans tout l’espace ; part de résultats obtenue par chaque faction.');
w();
w('### 7.3 Résultats détaillés');
w();
w(`| Faction | Archétype | Reconnaissance | Confusions principales | Part (personas uniformes) | Part (clics au hasard) |`);
w('|---|---|---:|---|---:|---:|');
for (const k of FACTION_KEYS) {
  const a = m.archetype.find((x) => x.k === k);
  const r = m.recognition.find((x) => x.k === k);
  w(`| ${FACTIONS[k].name} | ${a.ok ? '✅' : '❌'} ${Math.round(a.top.c)} % | ${pct(r.rate)} | ${r.confusions.map((c) => `${FACTIONS[c.j].name} ${pct(c.pct)}`).join(', ')} | ${pct(m.share[k])} | ${pct(m.random[k])} |`);
}
w();
w(`Résultats « hybrides » (écart < 3 points entre la 1re et la 2e faction) : **${pct(m.closeShare)}** des personas uniformes. C’est voulu : Sidorovich « hésite » dans environ un cas sur quatre, ce qui rend le résultat plus vivant.`);
w();
w('Quelqu’un qui clique au hasard obtient le plus souvent **Solitaires** : un profil sans conviction marquée reste proche du centre. C’est un comportement acceptable.');
w();
w('### 7.4 Points faibles connus (à traiter en phase 3)');
w();
const weak = m.recognition.filter((r) => r.rate < 75).sort((a, b) => a.rate - b.rate);
for (const r of weak) {
  w(`- **${FACTIONS[r.k].name}** : reconnaissance ${pct(r.rate)}, souvent confondue avec ${r.confusions.map((c) => FACTIONS[c.j].name).join(' et ')}. Piste : ajouter ou ajuster une question qui oppose directement ces factions.`);
}
w(`- **Devoir** reste rare chez les personas uniformes (${pct(m.share.DEV)}) : son profil combine cinq axes très marqués, une zone étroite de l’espace. Les joueurs qui « visent » le Devoir l’obtiennent sans difficulté (archétype ${Math.round(m.archetype.find((a) => a.k === 'DEV').top.c)} %).`);
w('- Les personas simulées ne remplacent pas de vrais répondants. Un test avec 10 à 20 personnes est prévu en phase 3 pour confronter le modèle à la réalité.');
w();

const outPath = fileURLToPath(new URL('../02-questionnaire.md', import.meta.url));
writeFileSync(outPath, L.join('\n'), 'utf8');
console.log(`Écrit : ${outPath} (${L.length} lignes) · seuils ++ ${T2.toFixed(3)} / + ${T1.toFixed(3)} · critères ${m.checks.every((c) => c.ok) ? 'OK' : 'EN ÉCHEC'}`);
