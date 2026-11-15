# Documentation du projet

| Document | Contenu |
|---|---|
| [01 · Cahier des charges](01-cahier-des-charges.md) | Objectifs, périmètre, exigences mesurables (fonctionnelles, techniques, i18n, design, légal), recette. |
| [02 · Questionnaire et impacts](02-questionnaire.md) | Les 7 axes, les 12 factions, la méthode de calcul, les 24 questions avec leur impact sur chaque faction, les indicateurs d'équilibrage. **Document généré.** |
| [03 · Plan de développement](03-plan-de-developpement.md) | Phases, tâches, jalons, architecture cible, risques. |

## Prototype du moteur (`prototype/`)

Un prototype JavaScript sans dépendance, qui a servi à concevoir et équilibrer le questionnaire avant tout développement. Il nécessite Node.js 18 ou plus récent.

| Fichier | Rôle |
|---|---|
| `model.mjs` | Données : axes, profils des factions, questions, réponses, deltas, répliques. |
| `engine.mjs` | Moteur : normalisation, distances, compatibilité, simulation de personas, calibration. |
| `metrics.mjs` | Indicateurs d'équilibrage C1 à C6 (seuils du cahier des charges, § 5.3). |
| `sim.mjs` | Affiche les indicateurs. Code de sortie 1 si un critère échoue. |
| `gen-doc.mjs` | Régénère `02-questionnaire.md`. |

```bash
node docs/prototype/sim.mjs
```

```bash
node docs/prototype/gen-doc.mjs
```

En phase 2 du plan, ce prototype est porté en TypeScript dans `src/lib/quiz/` puis retiré.
