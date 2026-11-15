// Usage : npm run docs:questionnaire
// Régénère docs/02-questionnaire.md à partir des données (src/data) et des textes français
// (src/messages/fr.json). Textes, tableaux d'impact et indicateurs restent ainsi cohérents.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { CENTERS_FILES, CURRENT_QUESTIONNAIRE, FACTIONS } from "../src/data";
import { runBalance } from "../src/lib/quiz/balance";
import {
  AXIS_KEYS,
  FACTION_KEYS,
  SCALE_LEVELS,
  TENDENCY_LEAN,
  TENDENCY_LEVELS,
  TENDENCY_STRONG,
  type FactionKey,
} from "../src/lib/quiz/domain";
import {
  compile,
  computeProfile,
  dot,
  normalize,
  rankFactions,
  REFERENCE_DISTANCE,
} from "../src/lib/quiz/engine";
import { archetypeAnswers } from "../src/lib/quiz/balance";
import type { GameId } from "../src/lib/quiz/domain";
import type { Vector } from "../src/lib/quiz/types";
import fr from "../src/messages/fr.json";

const questionnaire = CURRENT_QUESTIONNAIRE;
const centers = CENTERS_FILES[questionnaire.version].centers;
const report = runBalance(questionnaire, FACTIONS, centers);
const { options } = compile(questionnaire);

const MINUS = "−";
const sgn = (v: number) => (v > 0 ? `+${v}` : v < 0 ? `${MINUS}${-v}` : "0");
const num = (v: number, d = 2) => (v < 0 ? MINUS : "") + Math.abs(v).toFixed(d).replace(".", ",");
const pct = (v: number, d = 1) => `${v.toFixed(d).replace(".", ",")} %`;
const deltas = (vec: Vector) =>
  vec
    .map((v, i) => (v ? `${AXIS_KEYS[i]} ${sgn(v)}` : null))
    .filter(Boolean)
    .join(" · ") || "—";
const LETTERS = "ABCD";
const factionName = (f: FactionKey) => fr.factions[f].name;
const axisName = (i: number) => `${fr.axes[AXIS_KEYS[i]].plus} ↔ ${fr.axes[AXIS_KEYS[i]].minus}`;

function origin(games: readonly GameId[]): string {
  const trilogy = games.includes("soc");
  if (trilogy) return games.includes("s2") ? "Trilogie, S2" : "Trilogie";
  if (games.includes("cs")) return "Clear Sky";
  return "S2";
}

// --- Indice d'attraction : produit scalaire contribution × centre, centré par question. ---
const pulls = options.map((opts) => {
  const raw = opts.map((o) =>
    FACTION_KEYS.map((f) => dot(normalize(questionnaire, o), centers[f])),
  );
  const mean = FACTION_KEYS.map((_, f) => raw.reduce((s, r) => s + r[f], 0) / raw.length);
  return raw.map((r) => r.map((v, f) => v - mean[f]));
});
const sorted = pulls
  .flat(2)
  .map(Math.abs)
  .sort((a, b) => a - b);
const quantile = (p: number) => sorted[Math.floor(p * (sorted.length - 1))];
const T2 = quantile(0.85); // 15 % des effets les plus forts
const T1 = quantile(0.55); // 30 % suivants
const sym = (v: number) =>
  v >= T2 ? "++" : v >= T1 ? "+" : v <= -T2 ? `${MINUS}${MINUS}` : v <= -T1 ? MINUS : "·";

const signature = (profile: Vector) =>
  profile
    .map((v, i) => ({ v, i }))
    .filter(({ v }) => Math.abs(v) >= 0.6)
    .sort((a, b) => Math.abs(b.v) - Math.abs(a.v))
    .map(({ v, i }) => {
      const axis = fr.axes[AXIS_KEYS[i]];
      return `${v > 0 ? axis.plus : axis.minus}${Math.abs(v) >= 0.85 ? " (fort)" : ""}`;
    })
    .join(", ");

const lines: string[] = [];
const w = (s = "") => lines.push(s);
const table = (header: string[], align: string[], rows: string[][]) => {
  w(`| ${header.join(" | ")} |`);
  w(`|${align.join("|")}|`);
  for (const row of rows) w(`| ${row.join(" | ")} |`);
};

w("# 02 · Questionnaire et impacts par faction");
w();
w(`> **Version ${questionnaire.version}** · brouillon à valider.`);
w(">");
w(
  "> Ce document est **généré** par `npm run docs:questionnaire` à partir de [`src/data/questionnaire.v1.ts`](../src/data/questionnaire.v1.ts) (logique), [`src/data/factions.ts`](../src/data/factions.ts) (profils) et [`src/messages/fr.json`](../src/messages/fr.json) (textes).",
);
w(
  "> Pour modifier une question ou un profil, on modifie ces fichiers, on relance `npm run calibrate`, puis on régénère ce document.",
);
w("> Vérification de l’équilibrage : `npm run balance` (code de sortie 1 si un critère échoue).");
w();
w("## Sommaire");
w();
w("1. [Comment lire ce document](#1-comment-lire-ce-document)");
w("2. [Les 7 axes de valeurs](#2-les-7-axes-de-valeurs)");
w("3. [Les 12 factions](#3-les-12-factions)");
w("4. [Méthode de calcul](#4-méthode-de-calcul)");
w("5. [Les 24 questions](#5-les-24-questions)");
w("6. [Textes de Sidorovich hors questions](#6-textes-de-sidorovich-hors-questions)");
w("7. [Synthèse et équilibrage](#7-synthèse-et-équilibrage)");
w();

w("## 1. Comment lire ce document");
w();
w(
  "- Les questions sont des **dilemmes moraux, sociétaux ou personnels**. La plupart ne parlent pas du jeu ; seul l’habillage (la voix de Sidorovich, quelques décors) rappelle la Zone.",
);
w(
  "- Chaque réponse **déplace le profil du candidat sur 1 à 4 axes**, de −2 à +2. Elle ne donne jamais de points directement à une faction.",
);
w(
  "- Le tableau **Impact** de chaque question montre l’effet de chaque réponse sur la proximité avec chaque faction :",
);
w("  - `++` : rapproche fortement de la faction ; `+` : rapproche ;");
w("  - `·` : effet faible ou nul ;");
w(`  - \`${MINUS}\` : éloigne ; \`${MINUS}${MINUS}\` : éloigne fortement.`);
w(
  "- Ces symboles sont **calculés**, pas estimés à la main (voir [4.4](#44-indice-dattraction-des-tableaux-dimpact)).",
);
w(
  "- Les lettres A à D servent de repère dans ce document. **Sur le site, l’ordre des réponses est mélangé** à chaque partie pour éviter les biais de position.",
);
w(
  `- Questions de type *Affirmation* : échelle à 5 niveaux (${SCALE_LEVELS.map((l) => `« ${fr.scale[l]} »`).join(", ")}). Les niveaux intermédiaires valent la moitié des extrêmes, « ${fr.scale.neutral} » vaut 0.`,
);
w(
  "- Les textes sont rédigés en **français**, langue source. Ils sont formulés à l’épicène autant que possible : le candidat peut être une candidate. Les traductions EN, UK et RU (premières versions, relecture par des locuteurs natifs à prévoir) sont dans `src/messages/`.",
);
w();

w("## 2. Les 7 axes de valeurs");
w();
w(
  "Les axes s’inspirent librement de la théorie des fondements moraux (Haidt : autorité, loyauté, soin, sacré), complétée par trois dimensions propres à l’univers : le rapport à la violence, le rapport à l’inconnu et l’arbitrage entre principes et résultats.",
);
w();
table(
  ["Code", "Axe", "Pôle +", "Pôle −", "Questions"],
  ["---", "---", "---", "---", "---"],
  AXIS_KEYS.map((axis, i) => [
    `\`${axis}\``,
    axisName(i),
    fr.axes[axis].plusDescription,
    fr.axes[axis].minusDescription,
    String(report.coverage[i].questions),
  ]),
);
w();

w("## 3. Les 12 factions");
w();
w(
  "Le **profil déclaré** exprime l’intention de conception : où se situe chaque faction sur les 7 axes, de −1 à +1. La **signature** reprend les axes les plus marqués (|valeur| ≥ 0,6).",
);
w();
table(
  ["Code", "Faction", "Origine", "En une phrase", "Signature"],
  ["---", "---", "---", "---", "---"],
  FACTION_KEYS.map((f) => [
    `\`${f}\``,
    `**${factionName(f)}**`,
    origin(FACTIONS[f].games),
    fr.factions[f].pitch,
    signature(FACTIONS[f].profile),
  ]),
);
w();
w("**Profils déclarés** (intention) :");
w();
table(
  ["Faction", ...AXIS_KEYS],
  ["---", ...AXIS_KEYS.map(() => "---:")],
  FACTION_KEYS.map((f) => [factionName(f), ...FACTIONS[f].profile.map((v) => num(v, 1))]),
);
w();
w(
  "> Ward, Spark et Noon viennent de *S.T.A.L.K.E.R. 2* (2024). Leur idéologie a été vérifiée dans des guides publiés après la sortie du jeu, mais la relecture « lore » de la phase 3 doit la confirmer, ainsi que leurs noms officiels en français.",
);
w();

w("## 4. Méthode de calcul");
w();
w("### 4.1 Du questionnaire au profil");
w();
w("1. Chaque réponse ajoute ses deltas aux totaux des 7 axes.");
w(
  "2. En fin de test, chaque total est ramené entre −1 et +1. Un total positif est divisé par le **maximum positif atteignable** sur cet axe, un total négatif par le **maximum négatif atteignable**. Avec ces bornes asymétriques, les deux pôles de chaque axe restent atteignables même quand les questions ne sont pas parfaitement symétriques.",
);
w("3. On obtient le **profil du candidat** `u`, un vecteur de 7 valeurs.");
w();
w("Bornes actuelles :");
w();
table(
  ["", ...AXIS_KEYS],
  ["---", ...AXIS_KEYS.map(() => "---:")],
  [
    ["Maximum +", ...report.coverage.map((c) => String(c.maxPositive))],
    ["Maximum −", ...report.coverage.map((c) => String(c.maxNegative))],
  ],
);
w();
w("### 4.2 Du profil à la faction");
w();
w("1. On calcule la **distance euclidienne** `d` entre `u` et le centre de chaque faction.");
w(
  `2. **Compatibilité** = 100 × (1 − d / √7), bornée à 0. √7 ≈ ${REFERENCE_DISTANCE.toFixed(2).replace(".", ",")} est la distance du centre de l’espace à un sommet.`,
);
w(
  "3. La faction la plus proche est le **résultat**. Le site affiche le classement complet et un radar à 7 branches (profil du candidat contre profil de la faction).",
);
w(
  "4. Si l’écart entre la 1re et la 2e faction est **inférieur à 3 points**, le résultat est présenté comme **hybride** : Sidorovich hésite à voix haute, puis tranche.",
);
w(
  "5. Le calcul est **déterministe** : les mêmes réponses donnent toujours le même résultat. Le lien de partage peut donc contenir seulement les réponses encodées, sans base de données.",
);
w();
w(
  "La distance euclidienne a un avantage sur la similarité cosinus : elle tient compte de l’intensité des convictions. Une personne aux avis modérés sur tout tombe naturellement chez les **Solitaires**, la faction la plus « centrale ». C’est cohérent avec l’univers, où les Solitaires sont les plus nombreux.",
);
w();
w("### 4.3 Calibration des centres");
w();
w(
  "Un vrai répondant ne choisit jamais 24 fois la réponse la plus extrême. Comparer son profil directement aux profils déclarés favoriserait donc les factions modérées, et des factions extrêmes comme le Monolithe ne sortiraient presque jamais.",
);
w();
const params = CENTERS_FILES[questionnaire.version].params;
w(
  `Le moteur utilise donc des **centres calibrés**. Pour chaque faction, on simule ${params.samples.toLocaleString("fr-FR")} personas proches du profil déclaré (profil + bruit gaussien σ = ${String(params.sigma).replace(".", ",")}, réponses tirées avec une probabilité ∝ exp(${params.beta} × alignement)). Le centre est le profil moyen que ces personas obtiennent réellement. Le calcul est reproductible (générateur pseudo-aléatoire à graine fixe). Il est refait par \`npm run calibrate\` à chaque modification du questionnaire, et ses résultats sont versionnés dans [\`src/data/centers.${questionnaire.version}.json\`](../src/data/centers.${questionnaire.version}.json).`,
);
w();
w("**Centres calibrés** (utilisés par le moteur) :");
w();
table(
  ["Faction", ...AXIS_KEYS],
  ["---", ...AXIS_KEYS.map(() => "---:")],
  FACTION_KEYS.map((f) => [factionName(f), ...centers[f].map((v) => num(v))]),
);
w();
w(
  "Un grand écart entre profil déclaré et centre calibré signale qu’**aucune question ne permet d’exprimer** cette facette de la faction. C’est un signal pour retravailler le questionnaire.",
);
w();
w("### 4.4 Indice d’attraction (des tableaux d’impact)");
w();
w(
  "Pour une réponse et une faction : indice = produit scalaire entre la contribution normalisée de la réponse et le centre de la faction, **moins la moyenne de cet indice sur toutes les réponses de la même question**. Un indice positif rapproche le candidat de la faction par rapport à une réponse « moyenne ».",
);
w(
  `Seuils : \`++\` pour les 15 % d’effets les plus forts (|indice| ≥ ${T2.toFixed(3).replace(".", ",")}), \`+\` pour les 30 % suivants (≥ ${T1.toFixed(3).replace(".", ",")}).`,
);
w();
{
  const u = computeProfile(questionnaire, archetypeAnswers(questionnaire, FACTIONS.DEV.profile));
  const ranking = rankFactions(u, centers);
  w("### 4.5 Exemple");
  w();
  w("Un candidat qui répond systématiquement « comme le Devoir » obtient le profil :");
  w();
  table(
    ["", ...AXIS_KEYS],
    ["---", ...AXIS_KEYS.map(() => "---:")],
    [["u", ...u.map((v) => num(v))]],
  );
  w();
  w(
    `Classement : ${ranking
      .slice(0, 4)
      .map((r, i) => `${i + 1}. ${factionName(r.faction)} ${Math.round(r.compatibility)} %`)
      .join(
        " · ",
      )} … ${factionName(ranking.at(-1)!.faction)} ${Math.round(ranking.at(-1)!.compatibility)} %.`,
  );
  w();
}

{
  const fmt = (v: number) => String(v).replace(".", ",");
  w("### 4.6 Explications par axe");
  w();
  w(
    `Sur la page résultat, une phrase décrit la position du candidat sur chaque axe [F-23]. Seuils : |valeur| ≥ ${fmt(TENDENCY_STRONG)} pour une tendance nette, ≥ ${fmt(TENDENCY_LEAN)} pour un penchant, sinon équilibre.`,
  );
  w();
  const LABELS: Record<(typeof TENDENCY_LEVELS)[number], string> = {
    strongMinus: `≤ −${fmt(TENDENCY_STRONG)}`,
    leanMinus: `≤ −${fmt(TENDENCY_LEAN)}`,
    balanced: "entre les deux",
    leanPlus: `≥ ${fmt(TENDENCY_LEAN)}`,
    strongPlus: `≥ ${fmt(TENDENCY_STRONG)}`,
  };
  table(
    ["Axe", ...TENDENCY_LEVELS.map((l) => LABELS[l])],
    ["---", ...TENDENCY_LEVELS.map(() => "---")],
    AXIS_KEYS.map((axis) => [
      `\`${axis}\``,
      ...TENDENCY_LEVELS.map((l) => fr.axes[axis].tendencies[l]),
    ]),
  );
  w();
}

w("## 5. Les 24 questions");
w();
questionnaire.questions.forEach((question, qi) => {
  const texts = fr.questionnaire[question.id as keyof typeof fr.questionnaire] as {
    title: string;
    prompt: string;
    answers?: Record<string, string>;
    quips?: Record<string, string>;
  };
  const opts = options[qi];
  const P = pulls[qi];
  const rows =
    question.type === "scale"
      ? [
          { label: fr.scale.stronglyAgree, idx: 4 },
          { label: fr.scale.stronglyDisagree, idx: 0 },
        ]
      : question.answers.map((a, i) => ({ label: LETTERS[i], text: texts.answers![a.id], idx: i }));

  const spread = FACTION_KEYS.map((f, fi) => ({
    f,
    s: Math.max(...P.map((r) => r[fi])) - Math.min(...P.map((r) => r[fi])),
  }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 3)
    .map((x) => factionName(x.f));

  w(`### ${question.id} · ${texts.title}`);
  w();
  w(`*${fr.questionKinds[question.kind]}* · Départage surtout : ${spread.join(", ")}`);
  w();
  w(`> **Sidorovich :** « ${texts.prompt} »`);
  w();
  if (question.type === "scale") {
    w(
      `Échelle à 5 niveaux. « ${fr.scale.stronglyAgree} » : ${deltas(opts[4])}. « ${fr.scale.stronglyDisagree} » : effet inverse.`,
    );
  } else {
    table(
      ["", "Réponse", "Effet sur les axes"],
      ["---", "---", "---"],
      rows.map((r) => [`**${r.label}**`, "text" in r ? r.text : "", deltas(opts[r.idx])]),
    );
  }
  w();
  table(
    ["Impact", ...FACTION_KEYS],
    ["---", ...FACTION_KEYS.map(() => ":---:")],
    rows.map((r) => [question.type === "scale" ? r.label : `**${r.label}**`, ...P[r.idx].map(sym)]),
  );
  w();
  if (texts.quips) {
    for (const [key, line] of Object.entries(texts.quips)) {
      w(`*Réplique de Sidorovich après la réponse ${key.toUpperCase()} :* « ${line} »`);
    }
    w();
  }
});

w("## 6. Textes de Sidorovich hors questions");
w();
w(
  "Première version du ton : bourru, sarcastique, mercantile, jamais insultant. Pas de grossièretés : le site doit rester présentable dans un portfolio.",
);
w();
table(
  ["Moment", "Réplique"],
  ["---", "---"],
  [
    ["Accueil", `« ${fr.home.intro} »`],
    ["Mi-parcours (après Q12)", `« ${fr.sidorovich.halfway} »`],
    ["Calcul du résultat", `« ${fr.sidorovich.computing} »`],
    ["Résultat hybride", `« ${fr.sidorovich.hybrid} »`],
    ["Recommencer", `« ${fr.sidorovich.restart} »`],
  ],
);
w();
w("**Verdicts par faction :**");
w();
table(
  ["Faction", "Verdict de Sidorovich"],
  ["---", "---"],
  FACTION_KEYS.map((f) => [factionName(f), `« ${fr.factions[f].verdict} »`]),
);
w();

w("## 7. Synthèse et équilibrage");
w();
w("### 7.1 Couverture : quels axes chaque question touche");
w();
w(
  "Chaque case indique l’amplitude disponible sur l’axe : plus forte valeur positive / plus forte valeur négative parmi les réponses.",
);
w();
table(
  ["Question", ...AXIS_KEYS],
  ["---", ...AXIS_KEYS.map(() => ":---:")],
  [
    ...questionnaire.questions.map((question, qi) => [
      `${question.id} ${fr.questionnaire[question.id as keyof typeof fr.questionnaire].title}`,
      ...AXIS_KEYS.map((_, i) => {
        const values = options[qi].map((o) => o[i]);
        const hi = Math.max(...values);
        const lo = Math.min(...values);
        return [hi > 0 ? sgn(hi) : null, lo < 0 ? sgn(lo) : null].filter(Boolean).join(" / ");
      }),
    ]),
    ["**Questions par axe**", ...report.coverage.map((c) => `**${c.questions}**`)],
  ],
);
w();
w("### 7.2 Critères d’équilibrage");
w();
w(
  "Ces critères sont repris dans le cahier des charges (section 5.3). Ils sont vérifiés par les tests automatisés (`tests/balance`) à chaque intégration continue.",
);
w();
table(
  ["Critère", "Mesure actuelle", "Statut"],
  ["---", "---", "---"],
  report.checks.map((c) => [
    `${c.id} · ${c.label}`,
    c.value.replace(/(\d)\.(\d)/g, "$1,$2"),
    c.ok ? "✅" : "❌",
  ]),
);
w();
w("Définitions :");
w();
w(
  "- **Archétype** : on répond à chaque question avec l’option la plus alignée sur le profil déclaré de la faction. Le résultat doit être cette faction.",
);
w(
  "- **Atteignabilité** : il existe une combinaison de réponses qui place la faction en tête avec un score élevé.",
);
w(
  "- **Reconnaissance** : 2 000 personas proches de la faction (profil + bruit σ = 0,3) ; part de celles qui obtiennent bien cette faction.",
);
w(
  "- **Répartition** : 20 000 personas aux convictions tirées au hasard dans tout l’espace ; part de résultats obtenue par chaque faction.",
);
w();
w("### 7.3 Résultats détaillés");
w();
table(
  [
    "Faction",
    "Archétype",
    "Reconnaissance",
    "Confusions principales",
    "Part (personas uniformes)",
    "Part (clics au hasard)",
  ],
  ["---", "---", "---:", "---", "---:", "---:"],
  FACTION_KEYS.map((f) => {
    const a = report.archetypes.find((x) => x.faction === f)!;
    const r = report.recognition.find((x) => x.faction === f)!;
    return [
      factionName(f),
      `${a.ok ? "✅" : "❌"} ${Math.round(a.top.compatibility)} %`,
      pct(r.rate),
      r.confusions.map((c) => `${factionName(c.faction)} ${pct(c.rate)}`).join(", "),
      pct(report.share[f]),
      pct(report.randomShare[f]),
    ];
  }),
);
w();
w(
  `Résultats « hybrides » (écart < 3 points entre la 1re et la 2e faction) : **${pct(report.hybridShare)}** des personas uniformes. C’est voulu : Sidorovich « hésite » dans environ un cas sur quatre, ce qui rend le résultat plus vivant.`,
);
w();
w(
  "Quelqu’un qui clique au hasard obtient le plus souvent **Solitaires** : un profil sans conviction marquée reste proche du centre. C’est un comportement acceptable.",
);
w();
w("### 7.4 Points faibles connus (à confronter au playtest de la phase 4)");
w();
for (const r of report.recognition.filter((x) => x.rate < 75).sort((a, b) => a.rate - b.rate)) {
  w(
    `- **${factionName(r.faction)}** : reconnaissance ${pct(r.rate)}, souvent confondue avec ${r.confusions.map((c) => factionName(c.faction)).join(" et ")}. Piste : ajouter ou ajuster une question qui oppose directement ces factions.`,
  );
}
const duty = report.archetypes.find((a) => a.faction === "DEV")!;
w(
  `- **Devoir** reste rare chez les personas uniformes (${pct(report.share.DEV)}) : son profil combine cinq axes très marqués, une zone étroite de l’espace. Les joueurs qui « visent » le Devoir l’obtiennent sans difficulté (archétype ${Math.round(duty.top.compatibility)} %).`,
);
w(
  "- Les personas simulées ne remplacent pas de vrais répondants. Un test avec 10 à 20 personnes est prévu en phase 4 pour confronter le modèle à la réalité.",
);
w();

const path = fileURLToPath(new URL("../docs/02-questionnaire.md", import.meta.url));
writeFileSync(path, lines.join("\n"), "utf8");
console.log(
  `Écrit : ${path} (${lines.length} lignes) · critères ${report.checks.every((c) => c.ok) ? "OK" : "EN ÉCHEC"}`,
);
