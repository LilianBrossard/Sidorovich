# Documentation du projet

| Document | Contenu |
|---|---|
| [01 · Cahier des charges](01-cahier-des-charges.md) | Objectifs, périmètre, exigences mesurables (fonctionnelles, techniques, i18n, design, légal), recette. |
| [02 · Questionnaire et impacts](02-questionnaire.md) | Les 7 axes, les 12 factions, la méthode de calcul, les 24 questions avec leur impact sur chaque faction, les indicateurs d'équilibrage. **Document généré.** |
| [03 · Plan de développement](03-plan-de-developpement.md) | Phases, tâches, jalons, architecture cible, risques. |

## Régénérer le document 02

Le document 02 est produit à partir du code : la logique dans [`src/data/`](../src/data), les textes dans [`src/messages/fr.json`](../src/messages/fr.json), le moteur dans [`src/lib/quiz/`](../src/lib/quiz).

```bash
npm run calibrate
```

```bash
npm run docs:questionnaire
```

`npm run calibrate` est nécessaire seulement si les deltas ou les profils des factions ont changé. `npm run balance` affiche les indicateurs d'équilibrage sans rien écrire.
