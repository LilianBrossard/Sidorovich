# 04 · Protocole de playtest

Dernière étape de la phase 4 du [plan de développement](03-plan-de-developpement.md) : faire passer l'entretien à **10 à 20 personnes** avant d'habiller le site. On vérifie trois choses : la durée, le ton de Sidorovich et la justesse du verdict.

## 1. Préparation

- Utiliser l'aperçu Vercel de la branche, ou la production une fois la PR fusionnée.
- Viser des profils variés : quelques joueurs de S.T.A.L.K.E.R. (pour juger le verdict au regard du lore) et des personnes qui ne connaissent pas les jeux (pour juger la clarté des questions).
- Couvrir au moins deux langues en dehors du français, et au moins un téléphone.
- Ne rien expliquer du fonctionnement avant la fin : on donne seulement le lien.

## 2. Pendant la partie

Observer sans aider (en personne ou en partage d'écran) :

- l'heure de début et l'heure de fin ;
- les questions qui font hésiter longtemps, ou relire ;
- les retours en arrière ;
- les réactions aux répliques de Sidorovich (sourire, agacement, indifférence) ;
- tout blocage : bouton introuvable, texte coupé, erreur.

## 3. Après la partie

Poser ces questions, dans cet ordre :

1. Sans regarder le classement : quelle faction pensais-tu obtenir ?
2. Le verdict te semble-t-il juste ? Note de **1** (pas du tout) à **5** (tout à fait).
3. La 2e ou la 3e faction du classement t'aurait-elle mieux convenu ?
4. Une question t'a-t-elle semblé floue, orientée ou mal traduite ? Laquelle ?
5. Le ton de Sidorovich : trop, pas assez, juste bien ?
6. Partagerais-tu ce résultat ? Pourquoi ?

Noter aussi le code du résultat (les 12 caractères à la fin de l'adresse) : il permet de rejouer exactement le même dossier.

## 4. Grille de synthèse

| # | Langue | Appareil | Connaît le jeu | Durée | Faction attendue | Verdict | Note /5 | Questions floues | Remarques |
|---|---|---|---|---|---|---|---|---|---|
| 1 | | | | | | | | | |
| 2 | | | | | | | | | |
| … | | | | | | | | | |

## 5. Seuils et suites

| Indicateur | Objectif | Si l'objectif n'est pas atteint |
|---|---|---|
| Durée médiane | 4 à 8 minutes | Raccourcir les énoncés les plus longs. |
| Note moyenne de justesse | ≥ 3,5 / 5 | Revoir les profils déclarés des factions concernées, recalibrer (`npm run calibrate`), puis vérifier l'équilibrage (`npm run balance`). |
| Même question jugée floue | par 3 personnes ou plus | Réécrire la question dans les 4 langues. |
| Blocage | aucun | Corriger avant la phase 5. |

Une modification des questions ou des profils renvoie en phase 3 : relancer la calibration, régénérer le [document 02](02-questionnaire.md) et vérifier que les critères C1 à C6 restent verts. Les questions de la v1 ne sont pas encore figées (`PUBLISHED_FINGERPRINTS` est vide) : on peut encore les changer sans casser de lien partagé.
