# Sidorovich RH

> Entretien d'embauche dans la Zone : réponds aux 24 questions de Sidorovich et découvre laquelle des 12 factions de l'univers _S.T.A.L.K.E.R._ est faite pour toi.

**Statut :** phase 1 du [plan de développement](docs/03-plan-de-developpement.md) (socle technique). Le questionnaire arrive en phase 4.

Site en 4 langues : français, English, українська, русский.

## Documentation

- [Cahier des charges](docs/01-cahier-des-charges.md)
- [Questionnaire et impacts par faction](docs/02-questionnaire.md), généré depuis les données
- [Plan de développement](docs/03-plan-de-developpement.md)

## Pile technique

Next.js 16 (App Router, Cache Components) · TypeScript strict · Tailwind CSS 4 · next-intl · Vitest · GitHub Actions · Vercel.

## Démarrer

Node.js 22 ou plus récent. Utiliser un npm récent (11.19 ou plus, livré avec Node 24) : npm 11.6 écrit un `package-lock.json` que la CI refuse.

```bash
npm install
npm run dev
```

Puis ouvrir <http://localhost:3000>. Aucune variable d'environnement n'est nécessaire.

| Commande                          | Rôle                                               |
| --------------------------------- | -------------------------------------------------- |
| `npm run dev`                     | Serveur de développement                           |
| `npm run build`                   | Build de production                                |
| `npm run lint`                    | ESLint                                             |
| `npm run format` / `format:check` | Prettier                                           |
| `npm run typecheck`               | Génère les types de routes puis vérifie TypeScript |
| `npm test`                        | Tests unitaires (Vitest)                           |
| `npm run balance`                 | Critères d'équilibrage du questionnaire (C1 à C6)  |
| `npm run docs:questionnaire`      | Régénère `docs/02-questionnaire.md`                |
| `npm run check`                   | Tout ce que la CI vérifie, sauf le build           |

## Licence et mentions

Code, textes et visuels originaux sous [licence MIT](LICENSE).

Projet de fan non officiel, non affilié à GSC Game World. _S.T.A.L.K.E.R._ et les noms de son univers sont des marques de GSC Game World et ne sont pas couverts par cette licence.
