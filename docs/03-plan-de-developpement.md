# 03 · Plan de développement

> **Version :** 0.1, brouillon du 15/11/2026, à valider
> **Documents liés :** [01 · Cahier des charges](01-cahier-des-charges.md) · [02 · Questionnaire et impacts](02-questionnaire.md)

Ce plan découpe le projet en **phases courtes**. Chaque phase se termine par un **jalon vérifiable** et une validation de ta part avant de passer à la suivante. Les identifiants entre crochets (`[F-25]`, `[C3]`…) renvoient aux exigences du cahier des charges.

---

## 1. Principes de travail

1. **En ligne dès le premier jour.** Le site est déployé dès la phase 1, puis enrichi à chaque phase. On ne garde jamais une « grosse version » cachée en local.
2. **La logique avant l'habillage.** D'abord le moteur testé, puis le parcours complet sans décor, et la direction artistique en dernier. Si le temps manque, on a toujours un produit qui fonctionne.
3. **Une donnée, une source.** Les deltas vivent dans le code, les textes dans les fichiers de traduction, et la documentation est générée à partir de ces sources.
4. **Tout est mesuré.** Chaque critère du cahier des charges devient, dès que possible, un test automatique.
5. **Rôles.** Claude implémente, teste et documente. Lilian valide chaque jalon, tranche les choix de contenu et de style, et réalise les actions liées à ses comptes (GitHub, Vercel).

### 1.1 Flux Git

- `main` : production. Elle est protégée : aucune fusion sans CI verte.
- Une branche par sujet (`feat/moteur-score`, `feat/i18n`, `fix/…`), fusionnée par pull request. Chaque PR a son déploiement d'aperçu Vercel.
- Messages de commit au format **Conventional Commits** (`feat:`, `fix:`, `docs:`, `test:`, `chore:`…).
- Un tag par phase terminée (`v0.1.0`, `v0.2.0`…) et `v1.0.0` au lancement.

### 1.2 Architecture cible

```
src/
├─ app/[locale]/
│  ├─ page.tsx                  Accueil (bunker)
│  ├─ quiz/page.tsx             Questionnaire (dossier)
│  ├─ r/[code]/page.tsx         Résultat (PDA), rendu à la demande puis mis en cache
│  ├─ r/[code]/opengraph-image.tsx   Image d'aperçu dynamique
│  ├─ factions/page.tsx
│  ├─ how-it-works/page.tsx
│  ├─ about/page.tsx
│  └─ not-found.tsx
├─ lib/quiz/
│  ├─ engine.ts                 Profil, distances, classement (fonctions pures)
│  ├─ encoding.ts               Réponses ↔ code d'URL (version + somme de contrôle)
│  ├─ calibrate.ts              Simulation des personas, centres calibrés
│  └─ schema.ts                 Schémas Zod des données
├─ data/
│  ├─ axes.ts · factions.ts · questions.ts   Deltas et profils, sans texte
│  └─ centers.v1.json           Centres calibrés, versionnés
├─ messages/fr.json · en.json · uk.json · ru.json   Tous les textes
├─ components/
│  ├─ bunker/ · dossier/ · pda/ Composants propres à chaque scène
│  └─ ui/                        Boutons, radar SVG, sélecteur de langue…
└─ styles/tokens.css            Design tokens
scripts/   calibrate.ts · balance-report.ts · gen-questionnaire-doc.ts
tests/     unit/ · property/ · balance/ · e2e/
```

**Code de résultat** `[F-25]` : les 24 réponses forment un nombre en base mixte (4 ou 5 possibilités par question, environ 50 bits), écrit en base64url. On ajoute un caractère de version et deux caractères de somme de contrôle, soit **environ 12 caractères**. Exemple : `/fr/r/1Kq9xZ0aB7cf`. L'ordre mélangé des réponses à l'écran n'intervient pas : on encode l'indice de la réponse d'origine.

---

## 2. Vue d'ensemble

```mermaid
flowchart LR
  P0[0 · Cadrage] --> P1[1 · Socle]
  P1 --> P2[2 · Moteur]
  P1 --> P3[3 · Contenu et traductions]
  P2 --> P4[4 · Parcours brut]
  P3 --> P4
  P4 --> PT{{Playtest}}
  PT -->|ajustements| P3
  PT --> P5[5 · Direction artistique]
  P5 --> P6[6 · Partage et SEO]
  P6 --> P7[7 · Qualité et lancement]
  P7 --> P8[8 · V2]
```

| Phase | Objectif | Charge estimée* | Jalon | Tag |
|---|---|---|---|---|
| 0 · Cadrage | Les 3 documents et le prototype du moteur | ✅ fait | Documents validés par Lilian | — |
| 1 · Socle | Projet Next.js en 4 langues, CI, déploiement | ✅ code fait, Vercel à brancher | « Hello Zone » en production dans les 4 langues | `v0.1.0` |
| 2 · Moteur | Moteur de score en TypeScript, testé et équilibré | 2 j | Tests et critères C1 à C6 verts en CI | `v0.2.0` |
| 3 · Contenu | Textes FR définitifs et traductions EN, UK, RU | 2 j + relectures | 100 % des clés traduites ; lore validé | `v0.3.0` |
| 4 · Parcours brut | Test jouable de bout en bout, sans décor | 2 j | Tests de bout en bout verts ; playtest fait | `v0.4.0` |
| 5 · Direction artistique | Bunker, dossier, PDA, animations | 4 à 5 j | Maquettes respectées ; budgets de performance tenus | `v0.5.0` |
| 6 · Partage et SEO | Images d'aperçu, métadonnées | 1 j | Aperçus validés sur 4 plateformes | `v0.6.0` |
| 7 · Qualité et lancement | Audits, mentions légales, README | 1 à 2 j | Recette du cahier des charges (§ 12) complète | `v1.0.0` |
| 8 · V2 | Statistiques, comparaison, easter egg | 2 à 3 j | Au choix après le lancement | `v1.x` |

\* En jours de travail effectif. Les relectures externes (traductions, lore) et tes validations s'ajoutent au calendrier, sans être du temps de développement.

---

## 3. Détail des phases

### Phase 0 · Cadrage ✅

- [x] Choix structurants : factions, rôle de Sidorovich, modèle de calcul, back-end, direction artistique, longueur.
- [x] Cahier des charges ([01](01-cahier-des-charges.md)).
- [x] Questionnaire v0 avec impacts calculés ([02](02-questionnaire.md)).
- [x] Prototype du moteur et des tests d'équilibrage (`docs/prototype/`), tous les critères au vert.
- [x] Plan de développement (ce document).
- [x] **Jalon : documents validés** le 15/11/2026 (réponses aux questions ouvertes reportées dans le cahier, § 13.2).

### Phase 1 · Socle technique

**Préalables de ton côté :**
- Vérifier que `git push` fonctionne vers le dépôt (Git Credential Manager est configuré sur ta machine).
- Créer le projet Vercel en important le dépôt GitHub (Q-A : adresse `*.vercel.app`).

**Tâches :**
- [x] Relier le dossier local au dépôt `LilianBrossard/Sidorovich` ; ajouter `.gitignore`, `.gitattributes` (fins de ligne LF), `README` minimal et `LICENSE` MIT (Q-D).
- [x] Initialiser Next.js 16.4 (TypeScript strict, App Router, Cache Components, dossier `src/`, Tailwind 4, ESLint) et ajouter Prettier.
- [x] Installer `next-intl` 4 avec `next/root-params` : routage `/fr` `/en` `/uk` `/ru`, détection `Accept-Language` à la racine (repli sur l'anglais), choix mémorisé par cookie, en-têtes `hreflang`, sélecteur de langue `[I-01] [I-02] [I-06] [I-08]`.
- [x] Charger les polices latin + cyrillique via `next/font` : *PT Sans* (texte), *PT Mono* (dossier), *IBM Plex Mono* (PDA) ; page de contrôle `/fr/typography` `[I-04]`.
- [x] Créer l'accueil provisoire dans les 4 langues, le pied de page avec l'avertissement fan et la 404 localisée, y compris pour les URL du type `/fichier.txt` `[F-01] [F-03] [F-33] [L-01] [N-07]`.
- [x] Ajouter le test de complétude des traductions `[I-03]`.
- [x] Mettre en place GitHub Actions : lint, format, types, tests, équilibrage C1 à C6, build `[T-09] [T-10]`.
- [ ] Protéger `main` dans les réglages GitHub (Settings → Branches : PR obligatoire, vérification « CI » requise). **À faire par Lilian.**
- [ ] Brancher Vercel : import du dépôt, aperçu par PR, production sur `main`. **À faire par Lilian.**

**Fini quand :** l'URL de production affiche une page dans les 4 langues, la CI est verte et une PR de test a généré son aperçu.

### Phase 2 · Moteur de score (développé en TDD)

- [ ] Porter le prototype en TypeScript dans `src/lib/quiz/` et `src/data/`. Les deltas restent dans le code ; les textes partent dans `messages/`.
- [ ] Écrire les schémas Zod ; le build échoue sur une donnée invalide `[S-02]`.
- [ ] Écrire `engine.ts` : fonctions pures `profile()`, `rank()`, `compatibility()`, détection du résultat hybride `[S-01] [F-24]`.
- [ ] Écrire `encoding.ts` : encodage, décodage, version et somme de contrôle ; rejet propre des codes invalides `[F-25] [F-26]`.
- [ ] Écrire `npm run calibrate` : graine fixe, sortie `centers.v1.json` versionnée `[S-03]`.
- [ ] Tests unitaires : cas connus, bornes, déterminisme `[S-05]`.
- [ ] Tests de propriétés (fast-check) : `décoder(encoder(x)) = x`, profil toujours dans [−1, 1]⁷, classement toujours de 12 factions.
- [ ] Tests d'équilibrage C1 à C6, exécutés en CI `[5.3]`.
- [ ] Empreinte de chaque version publiée du questionnaire `[S-04]`.
- [ ] Remplacer `docs/prototype/` par `scripts/gen-questionnaire-doc.ts`, qui lit `src/data` et `messages/fr.json`.

**Fini quand :** `npm test` est vert, la couverture du moteur atteint au moins 90 % et le document 02 se régénère depuis le code.

### Phase 3 · Contenu et traductions

- [ ] Intégrer tes retours sur le document 02 : formulations, réponses, répliques.
- [ ] Traiter les points faibles connus (doc 02, § 7.4) : mieux séparer Clear Sky de Spark et Liberté, Noon de Devoir, et Ward de Devoir et Militaires. Relancer l'équilibrage après chaque changement.
- [ ] Rédiger les fiches des 12 factions, les textes d'interface et les explications par axe `[F-23] [F-30] [N-06]`.
- [ ] Faire la relecture lore, en particulier pour Ward, Spark et Noon : idéologie et noms officiels en français `[13.2]`.
- [ ] Traduire en EN, UK et RU à partir du glossaire (cahier, § 7).
- [ ] Ajouter le test de complétude des traductions `[I-03]`.
- [ ] Faire relire UK et RU par des locuteurs natifs `[I-07]` (question Q-B).
- [ ] Relire les contenus sensibles : rien de politique ou de religieux réel ; formulations épicènes `[N-03] [N-04]`.

**Fini quand :** les 4 langues sont complètes, le test de complétude passe et les relectures sont notées.

### Phase 4 · Parcours fonctionnel brut

Un design volontairement minimal : on valide le fonctionnement avant de l'habiller.

- [ ] Créer les pages accueil, questionnaire, résultat, factions, « Comment ça marche », « À propos » et 404 `[F-01] [F-30…F-33]`.
- [ ] Gérer l'état du questionnaire avec `useReducer` : mélange des réponses par graine, retour arrière, reprise depuis `localStorage` `[F-11] [F-13] [F-14]`.
- [ ] Gérer le clavier et la progression `[F-12] [F-15]`.
- [ ] Afficher les répliques de Sidorovich (effet de frappe qu'on peut passer) `[F-16]`.
- [ ] Construire la page résultat : faction, %, classement, radar SVG avec alternative textuelle, explications par axe, cas hybride `[F-20…F-24]`.
- [ ] Ajouter le partage natif et la copie du lien `[F-27]`.
- [ ] Écrire les tests Playwright : parcours complet dans les 4 langues, sur mobile et ordinateur ; lien partagé rouvert dans un nouveau contexte ; code invalide.
- [ ] **Playtest avec 10 à 20 personnes** : durée, réactions, résultat jugé juste ou non (note sur 5). Retour en phase 3 si besoin.

**Fini quand :** le test est jouable de bout en bout en production, les tests de bout en bout sont verts et la synthèse du playtest est écrite.

### Phase 5 · Direction artistique

- [ ] Préparer un moodboard (planche d'ambiance), puis **6 maquettes** : 3 scènes × mobile et ordinateur. **Tu les valides avant l'intégration** `[V-04]`.
- [ ] Créer les design tokens et les composants de base : papier, tampon, case à cocher, écran PDA, boutons `[V-01] [V-02]`.
- [ ] **Bunker** : décor en SVG et CSS, lampe qui vacille, silhouette de Sidorovich à contre-jour, bulles de dialogue.
- [ ] **Dossier** : formulaire, cases cochées, tampon final, transitions entre questions.
- [ ] **PDA** : séquence de démarrage, lignes de balayage, radar animé, 12 emblèmes SVG originaux `[V-03]`.
- [ ] Animations Motion, `prefers-reduced-motion`, 60 images par seconde `[V-05] [V-06]`.
- [ ] Responsive de 360 px à 1920 px `[V-07]`.
- [ ] (Souhaitable) Ambiance sonore coupée par défaut `[F-40]`.
- [ ] Contrôler les budgets : Lighthouse et poids du JavaScript à chaque PR `[T-03…T-05]`.

**Fini quand :** les maquettes sont respectées, les seuils de performance et d'accessibilité sont tenus et le rendu est vérifié sur un vrai téléphone.

### Phase 6 · Partage et SEO

- [ ] Générer les images d'aperçu par résultat et par langue (`opengraph-image.tsx`) `[F-28]`.
- [ ] Ajouter les métadonnées par page et par langue, `hreflang`, `sitemap.xml`, `robots.txt`, icônes et manifest `[T-08] [I-06]`.
- [ ] Vérifier les aperçus dans les outils de Discord, X, Facebook et LinkedIn.
- [ ] Trancher le nom et le domaine (question Q-A).

**Fini quand :** un lien de résultat collé sur les 4 plateformes affiche le bon aperçu, dans la bonne langue.

### Phase 7 · Qualité et lancement

- [ ] Audit d'accessibilité : axe-core automatisé, parcours au clavier, NVDA et VoiceOver `[T-06]`.
- [ ] Lighthouse sur les 3 pages clés, sur mobile ; Core Web Vitals `[T-03] [T-04]`.
- [ ] Tests multi-navigateurs et sur appareils réels `[T-07]`.
- [ ] En-têtes de sécurité, Dependabot, `npm audit` `[T-11]`.
- [ ] Mentions légales, crédits, avertissement fan, licence ; vérification des conditions de GSC Game World `[L-01…L-06]`.
- [ ] (Souhaitable) Vercel Web Analytics `[T-12]`.
- [ ] README portfolio : capture animée, schéma d'architecture, explication du moteur, indicateurs d'équilibrage, scores Lighthouse.
- [ ] Dérouler la checklist de recette du cahier des charges (§ 12) ; tag `v1.0.0`.

**Fini quand :** tous les points de la recette sont cochés.

### Phase 8 · V2 (optionnelle, après le lancement)

- [ ] **Statistiques globales** `[F-42]` : Upstash Redis via la Vercel Marketplace, route `POST /api/results` qui reçoit seulement le code, un compteur par faction, limitation de débit (`@upstash/ratelimit`), dédoublonnage, page `/stats`, politique de confidentialité `[L-04]`.
- [ ] **Comparaison de deux résultats** `[F-43]` : `/compare/{code1}/{code2}`, radars superposés.
- [ ] **Easter egg** `[F-41]`.
- [ ] Recalibrer le modèle à partir des statistiques réelles. Les simulations sont alors confrontées aux vrais répondants.

---

## 4. Risques

| Risque | Impact | Parade |
|---|---|---|
| Idéologie de Ward, Spark ou Noon mal interprétée | Joueurs déçus, crédibilité | Relecture lore en phase 3 ; les profils restent faciles à ajuster grâce au document 02 généré. |
| Traductions UK et RU de qualité insuffisante | Image négative auprès d'une partie importante du public | Relecture native ; à défaut, mention de traduction assistée `[I-07]`. |
| Équilibrage réel différent de la simulation | Résultats jugés injustes | Playtest en phase 4 ; recalibrage par les statistiques en V2. |
| Droits sur les visuels | Retrait du site | Aucun asset officiel ; silhouette plutôt que portrait ; emblèmes originaux `[L-02] [V-03]`. |
| Animations trop lourdes sur mobile | Performance sous le seuil | Budgets contrôlés à chaque PR ; animations CSS et SVG d'abord ; réduction des animations respectée. |
| Polices cyrilliques peu adaptées au style | Rendu incohérent selon la langue | Choix et test des polices dès la phase 1. |
| Ajouts au fil de l'eau | Le lancement recule | Priorités MoSCoW ; tout ajout passe par le cahier des charges ; la V2 est séparée. |
| Production des illustrations plus lente que prévu | Phase 5 qui déborde | Style volontairement graphique (SVG et CSS, silhouettes) ; question Q-C tranchée tôt. |

---

## 5. Prochaines actions

1. **Toi :** relire les documents [01](01-cahier-des-charges.md), [02](02-questionnaire.md) et [03](03-plan-de-developpement.md), puis répondre aux questions ouvertes Q-A à Q-E (cahier, § 13.2), au moins Q-B et Q-C, qui pèsent le plus sur le calendrier.
2. **Toi :** `gh auth login`, ou vérifier l'accès en écriture au dépôt, puis créer le projet Vercel lié au dépôt.
3. **Claude :** démarrer la phase 1 dès ta validation.
