# 02 · Questionnaire et impacts par faction

> **Version v1** · brouillon à valider.
>
> Ce document est **généré** par `npm run docs:questionnaire` à partir de [`src/data/questionnaire.v1.ts`](../src/data/questionnaire.v1.ts) (logique), [`src/data/factions.ts`](../src/data/factions.ts) (profils) et [`src/messages/fr.json`](../src/messages/fr.json) (textes).
> Pour modifier une question ou un profil, on modifie ces fichiers, on relance `npm run calibrate`, puis on régénère ce document.
> Vérification de l’équilibrage : `npm run balance` (code de sortie 1 si un critère échoue).

## Sommaire

1. [Comment lire ce document](#1-comment-lire-ce-document)
2. [Les 7 axes de valeurs](#2-les-7-axes-de-valeurs)
3. [Les 12 factions](#3-les-12-factions)
4. [Méthode de calcul](#4-méthode-de-calcul)
5. [Les 24 questions](#5-les-24-questions)
6. [Textes de Sidorovich hors questions](#6-textes-de-sidorovich-hors-questions)
7. [Synthèse et équilibrage](#7-synthèse-et-équilibrage)

## 1. Comment lire ce document

- Les questions sont des **dilemmes moraux, sociétaux ou personnels**. La plupart ne parlent pas du jeu ; seul l’habillage (la voix de Sidorovich, quelques décors) rappelle la Zone.
- Chaque réponse **déplace le profil du candidat sur 1 à 4 axes**, de −2 à +2. Elle ne donne jamais de points directement à une faction.
- Le tableau **Impact** de chaque question montre l’effet de chaque réponse sur la proximité avec chaque faction :
  - `++` : rapproche fortement de la faction ; `+` : rapproche ;
  - `·` : effet faible ou nul ;
  - `−` : éloigne ; `−−` : éloigne fortement.
- Ces symboles sont **calculés**, pas estimés à la main (voir [4.4](#44-indice-dattraction-des-tableaux-dimpact)).
- Les lettres A à D servent de repère dans ce document. **Sur le site, l’ordre des réponses est mélangé** à chaque partie pour éviter les biais de position.
- Questions de type *Affirmation* : échelle à 5 niveaux (« Pas du tout d’accord », « Plutôt pas d’accord », « Sans avis », « Plutôt d’accord », « Tout à fait d’accord »). Les niveaux intermédiaires valent la moitié des extrêmes, « Sans avis » vaut 0.
- Les textes sont rédigés en **français**, langue source. Ils sont formulés à l’épicène autant que possible : le candidat peut être une candidate. Les traductions EN, UK et RU sont produites en phase 3 du plan de développement.

## 2. Les 7 axes de valeurs

Les axes s’inspirent librement de la théorie des fondements moraux (Haidt : autorité, loyauté, soin, sacré), complétée par trois dimensions propres à l’univers : le rapport à la violence, le rapport à l’inconnu et l’arbitrage entre principes et résultats.

| Code | Axe | Pôle + | Pôle − | Questions |
|---|---|---|---|---|
| `ORD` | Ordre ↔ Liberté | Ordre, hiérarchie, discipline, respect des règles | Liberté, refus de l’autorité, autonomie | 14 |
| `ALT` | Altruisme ↔ Intérêt personnel | Bien commun, entraide, sacrifice pour autrui | Profit, survie personnelle, opportunisme | 15 |
| `COL` | Collectif ↔ Indépendance | Appartenance, loyauté au groupe, fraternité | Loup solitaire, ne rien devoir à personne | 13 |
| `FOI` | Foi ↔ Raison | Croyance, mystique, intuition, sacré | Science, preuves, scepticisme | 10 |
| `FOR` | Force ↔ Non-violence | La force est un outil légitime | Refus de la violence, dialogue, prudence | 12 |
| `ZON` | Respect ↔ Maîtrise de l’inconnu | Préserver, coexister, laisser vivre l’inconnu | Contrôler, exploiter ou détruire l’inconnu | 8 |
| `IDE` | Idéalisme ↔ Pragmatisme | Les principes avant le résultat | Le résultat avant les principes, compromis | 18 |

## 3. Les 12 factions

Le **profil déclaré** exprime l’intention de conception : où se situe chaque faction sur les 7 axes, de −1 à +1. La **signature** reprend les axes les plus marqués (|valeur| ≥ 0,6).

| Code | Faction | Origine | En une phrase | Signature |
|---|---|---|---|---|
| `SOL` | **Solitaires** | Trilogie, S2 | Indépendants et débrouillards. Entraide ponctuelle entre stalkers, mais sans chef ni drapeau. | Indépendance |
| `DEV` | **Devoir** | Trilogie, S2 | Paramilitaires à la discipline de fer. La Zone est une menace qu’il faut éradiquer pour protéger l’humanité. | Ordre (fort), Collectif (fort), Maîtrise de l’inconnu (fort), Force, Idéalisme, Altruisme |
| `LIB` | **Liberté** | Trilogie, S2 | Anarchistes. La Zone doit être ouverte à tous et le savoir circuler librement. Refus de toute autorité. | Liberté (fort), Idéalisme |
| `BAN` | **Bandits** | Trilogie, S2 | Criminels en bandes. Le profit par la force, la loi du plus fort. | Intérêt personnel (fort), Force, Pragmatisme, Liberté |
| `MER` | **Mercenaires** | Trilogie, S2 | Professionnels sous contrat. Discipline, efficacité, et loyauté envers qui paie. | Pragmatisme (fort), Force, Intérêt personnel |
| `MON` | **Monolithe** | Trilogie, S2 | Fanatiques voués au Monolithe. Foi absolue, dévotion totale, sacrifice. | Collectif (fort), Foi (fort), Force (fort), Idéalisme (fort), Ordre, Respect |
| `ECO` | **Écologistes** | Trilogie, S2 | Chercheurs. Comprendre la Zone par la science, avec prudence et sans violence. | Raison (fort), Non-violence (fort) |
| `MIL` | **Militaires** | Trilogie | Armée régulière. Ordre, obéissance, et un périmètre à tenir coûte que coûte. | Ordre (fort), Force (fort), Collectif, Maîtrise de l’inconnu |
| `CS` | **Clear Sky** | Clear Sky | Chercheurs-combattants idéalistes. Comprendre la Zone pour la stabiliser et protéger le monde. | Altruisme, Idéalisme, Collectif |
| `WAR` | **Ward** | S2 | Force officielle de la Zone. Protéger la société extérieure, contrôler la Zone, quitte à la détruire. | Maîtrise de l’inconnu (fort), Ordre, Raison |
| `SPA` | **Spark** | S2 | Le groupe de Scar. Croit en une « Zone rayonnante » qui doit prospérer, et combat toute tentative de la contrôler. | Respect (fort), Idéalisme, Altruisme, Foi |
| `NOO` | **Noon** | S2 | Anciens fanatiques du Monolithe libérés de son emprise. Fraternité soudée et discrète, en quête de vérité. | Collectif (fort), Force |

**Profils déclarés** (intention) :

| Faction | ORD | ALT | COL | FOI | FOR | ZON | IDE |
|---|---:|---:|---:|---:|---:|---:|---:|
| Solitaires | −0,3 | 0,2 | −0,8 | 0,1 | 0,0 | 0,0 | −0,5 |
| Devoir | 0,9 | 0,6 | 0,9 | −0,2 | 0,7 | −0,9 | 0,7 |
| Liberté | −0,9 | 0,3 | −0,2 | −0,3 | 0,1 | 0,3 | 0,6 |
| Bandits | −0,6 | −0,9 | 0,2 | 0,0 | 0,8 | −0,2 | −0,8 |
| Mercenaires | 0,3 | −0,6 | −0,3 | −0,5 | 0,7 | −0,5 | −1,0 |
| Monolithe | 0,8 | −0,3 | 1,0 | 1,0 | 0,9 | 0,8 | 0,9 |
| Écologistes | 0,2 | 0,5 | 0,0 | −1,0 | −0,9 | 0,3 | 0,2 |
| Militaires | 1,0 | −0,2 | 0,8 | −0,2 | 0,9 | −0,7 | −0,5 |
| Clear Sky | 0,0 | 0,8 | 0,6 | −0,4 | 0,2 | 0,4 | 0,7 |
| Ward | 0,7 | 0,5 | 0,4 | −0,7 | 0,4 | −1,0 | −0,2 |
| Spark | −0,3 | 0,6 | 0,5 | 0,6 | 0,3 | 1,0 | 0,8 |
| Noon | 0,3 | 0,0 | 0,9 | 0,3 | 0,8 | −0,3 | 0,5 |

> Ward, Spark et Noon viennent de *S.T.A.L.K.E.R. 2* (2024). Leur idéologie a été vérifiée dans des guides publiés après la sortie du jeu, mais la relecture « lore » de la phase 3 doit la confirmer, ainsi que leurs noms officiels en français.

## 4. Méthode de calcul

### 4.1 Du questionnaire au profil

1. Chaque réponse ajoute ses deltas aux totaux des 7 axes.
2. En fin de test, chaque total est ramené entre −1 et +1. Un total positif est divisé par le **maximum positif atteignable** sur cet axe, un total négatif par le **maximum négatif atteignable**. Avec ces bornes asymétriques, les deux pôles de chaque axe restent atteignables même quand les questions ne sont pas parfaitement symétriques.
3. On obtient le **profil du candidat** `u`, un vecteur de 7 valeurs.

Bornes actuelles :

|  | ORD | ALT | COL | FOI | FOR | ZON | IDE |
|---|---:|---:|---:|---:|---:|---:|---:|
| Maximum + | 20 | 17 | 11 | 12 | 15 | 12 | 19 |
| Maximum − | 18 | 19 | 12 | 12 | 9 | 13 | 23 |

### 4.2 Du profil à la faction

1. On calcule la **distance euclidienne** `d` entre `u` et le centre de chaque faction.
2. **Compatibilité** = 100 × (1 − d / √7), bornée à 0. √7 ≈ 2,65 est la distance du centre de l’espace à un sommet.
3. La faction la plus proche est le **résultat**. Le site affiche le classement complet et un radar à 7 branches (profil du candidat contre profil de la faction).
4. Si l’écart entre la 1re et la 2e faction est **inférieur à 3 points**, le résultat est présenté comme **hybride** : Sidorovich hésite à voix haute, puis tranche.
5. Le calcul est **déterministe** : les mêmes réponses donnent toujours le même résultat. Le lien de partage peut donc contenir seulement les réponses encodées, sans base de données.

La distance euclidienne a un avantage sur la similarité cosinus : elle tient compte de l’intensité des convictions. Une personne aux avis modérés sur tout tombe naturellement chez les **Solitaires**, la faction la plus « centrale ». C’est cohérent avec l’univers, où les Solitaires sont les plus nombreux.

### 4.3 Calibration des centres

Un vrai répondant ne choisit jamais 24 fois la réponse la plus extrême. Comparer son profil directement aux profils déclarés favoriserait donc les factions modérées, et des factions extrêmes comme le Monolithe ne sortiraient presque jamais.

Le moteur utilise donc des **centres calibrés**. Pour chaque faction, on simule 3 000 personas proches du profil déclaré (profil + bruit gaussien σ = 0,3, réponses tirées avec une probabilité ∝ exp(3 × alignement)). Le centre est le profil moyen que ces personas obtiennent réellement. Le calcul est reproductible (générateur pseudo-aléatoire à graine fixe). Il est refait par `npm run calibrate` à chaque modification du questionnaire, et ses résultats sont versionnés dans [`src/data/centers.v1.json`](../src/data/centers.v1.json).

**Centres calibrés** (utilisés par le moteur) :

| Faction | ORD | ALT | COL | FOI | FOR | ZON | IDE |
|---|---:|---:|---:|---:|---:|---:|---:|
| Solitaires | −0,22 | −0,11 | −0,62 | −0,01 | −0,01 | −0,10 | −0,48 |
| Devoir | 0,76 | 0,48 | 0,79 | −0,25 | 0,52 | −0,71 | 0,40 |
| Liberté | −0,70 | 0,23 | −0,01 | −0,07 | −0,16 | 0,24 | 0,53 |
| Bandits | −0,31 | −0,75 | −0,29 | −0,14 | 0,46 | −0,46 | −0,60 |
| Mercenaires | 0,27 | −0,55 | −0,46 | −0,46 | 0,47 | −0,72 | −0,81 |
| Monolithe | 0,68 | 0,04 | 0,67 | 0,82 | 0,41 | 0,80 | 0,55 |
| Écologistes | 0,15 | 0,51 | 0,16 | −0,62 | −0,66 | 0,04 | 0,21 |
| Militaires | 0,74 | −0,02 | 0,44 | −0,31 | 0,61 | −0,77 | −0,38 |
| Clear Sky | 0,07 | 0,62 | 0,60 | −0,10 | −0,00 | 0,23 | 0,59 |
| Ward | 0,70 | 0,38 | 0,40 | −0,53 | 0,40 | −0,83 | −0,19 |
| Spark | −0,26 | 0,48 | 0,44 | 0,75 | 0,06 | 0,77 | 0,71 |
| Noon | 0,45 | 0,21 | 0,71 | 0,18 | 0,59 | −0,25 | 0,39 |

Un grand écart entre profil déclaré et centre calibré signale qu’**aucune question ne permet d’exprimer** cette facette de la faction. C’est un signal pour retravailler le questionnaire.

### 4.4 Indice d’attraction (des tableaux d’impact)

Pour une réponse et une faction : indice = produit scalaire entre la contribution normalisée de la réponse et le centre de la faction, **moins la moyenne de cet indice sur toutes les réponses de la même question**. Un indice positif rapproche le candidat de la faction par rapport à une réponse « moyenne ».
Seuils : `++` pour les 15 % d’effets les plus forts (|indice| ≥ 0,112), `+` pour les 30 % suivants (≥ 0,057).

### 4.5 Exemple

Un candidat qui répond systématiquement « comme le Devoir » obtient le profil :

|  | ORD | ALT | COL | FOI | FOR | ZON | IDE |
|---|---:|---:|---:|---:|---:|---:|---:|
| u | 0,85 | 0,47 | 0,82 | −0,42 | 0,73 | −0,92 | 0,32 |

Classement : 1. Devoir 86 % · 2. Ward 71 % · 3. Militaires 64 % · 4. Noon 61 % … Spark 6 %.

## 5. Les 24 questions

### Q01 · Le wagon fou

*Dilemme* · Départage surtout : Écologistes, Militaires, Mercenaires

> **Sidorovich :** « Un wagonnet de minerai dévale la pente, droit sur cinq ouvriers. Toi, tu tiens l’aiguillage : si tu le bascules, le wagonnet part sur la voie où travaille un seul ouvrier. Il te reste trois secondes. »

|  | Réponse | Effet sur les axes |
|---|---|---|
| **A** | Je bascule. Cinq vies valent plus qu’une. | ALT +1 · FOR +1 · IDE −2 |
| **B** | Je ne touche à rien. Ce n’est pas à moi de choisir qui meurt. | FOI +1 · FOR −1 · IDE +1 |
| **C** | Je hurle pour les prévenir, sans toucher au levier. | ALT +1 · FOR −2 |
| **D** | Je regarde d’abord qui sont les cinq. | ALT −1 · COL +1 · IDE −1 |

| Impact | SOL | DEV | LIB | BAN | MER | MON | ECO | MIL | CS | WAR | SPA | NOO |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **A** | · | · | · | + | ++ | · | − | + | · | + | · | · |
| **B** | · | · | · | · | − | + | · | − | · | − | + | · |
| **C** | · | − | · | − | − | − | ++ | − | · | · | · | − |
| **D** | · | · | · | + | + | · | − | + | · | · | · | + |

*Réplique de Sidorovich après la réponse D :* « Tu vérifies la marchandise avant d’acheter. J’aime ça. »

### Q02 · L’ordre stupide

*Situation* · Départage surtout : Devoir, Militaires, Monolithe

> **Sidorovich :** « Ton chef d’équipe te donne un ordre complètement idiot. Pas dangereux, juste idiot. »

|  | Réponse | Effet sur les axes |
|---|---|---|
| **A** | J’obéis. Une équipe sans discipline est une équipe morte. | ORD +2 · COL +1 |
| **B** | J’obéis, et je lui dis ce que j’en pense une fois le travail fini. | ORD +1 · COL +1 · IDE −1 |
| **C** | Je fais à ma façon. Tant que le résultat est là, il n’y verra que du feu. | ORD −1 · COL −1 · IDE −1 |
| **D** | Je refuse. Personne ne pense à ma place. | ORD −2 · COL −1 · IDE +1 |

| Impact | SOL | DEV | LIB | BAN | MER | MON | ECO | MIL | CS | WAR | SPA | NOO |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **A** | − | ++ | − | − | · | ++ | · | ++ | + | + | · | ++ |
| **B** | · | + | · | · | · | + | · | + | · | + | · | + |
| **C** | + | −− | · | + | · | −− | · | − | − | − | · | − |
| **D** | · | −− | + | · | · | − | · | −− | · | −− | · | − |

### Q03 · Le portefeuille

*Situation* · Départage surtout : Bandits, Devoir, Ward

> **Sidorovich :** « Tu trouves un portefeuille par terre : une belle liasse de billets et les papiers de son propriétaire. Personne ne t’a vu. »

|  | Réponse | Effet sur les axes |
|---|---|---|
| **A** | Je le rends tel quel. | ORD +1 · ALT +2 |
| **B** | Je le rends, mais une petite récompense ne serait pas de refus. | ALT +1 · IDE −1 |
| **C** | Je garde les billets et je renvoie les papiers. Faut pas exagérer. | ALT −1 · IDE −1 |
| **D** | Je garde tout. La chance, ça se saisit. | ORD −1 · ALT −2 |

| Impact | SOL | DEV | LIB | BAN | MER | MON | ECO | MIL | CS | WAR | SPA | NOO |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **A** | · | + | · | −− | − | · | + | · | + | + | · | · |
| **B** | · | · | · | · | · | · | · | · | · | · | · | · |
| **C** | · | · | · | · | · | · | · | · | · | · | · | · |
| **D** | · | − | · | + | · | · | − | · | − | − | · | · |

*Réplique de Sidorovich après la réponse A :* « Honnête… Tu ne feras pas fortune ici, mais bon. »

### Q04 · L’inconnu sous l’émission

*Dilemme* · Départage surtout : Bandits, Clear Sky, Mercenaires

> **Sidorovich :** « Une émission arrive, le ciel vire au rouge. Quelqu’un tambourine à la porte de ton abri : une personne blessée, que tu ne connais pas. Tu n’as de provisions que pour toi. »

|  | Réponse | Effet sur les axes |
|---|---|---|
| **A** | J’ouvre et je partage tout. On verra demain. | ALT +2 · IDE +1 |
| **B** | J’ouvre, mais je garde mon arme à portée de main. | ALT +1 · FOR +1 · IDE −1 |
| **C** | Je lui glisse de quoi tenir et je referme. | COL −1 · IDE −1 |
| **D** | Je n’ouvre pas. Ma survie d’abord. | ALT −2 · COL −1 |

| Impact | SOL | DEV | LIB | BAN | MER | MON | ECO | MIL | CS | WAR | SPA | NOO |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **A** | − | + | + | −− | −− | + | + | · | ++ | · | + | + |
| **B** | · | + | · | · | · | · | · | + | · | + | · | · |
| **C** | · | − | · | · | · | · | · | · | · | · | · | − |
| **D** | · | − | · | + | + | · | − | · | − | − | − | − |

### Q05 · L’énergie inconnue

*Société* · Départage surtout : Ward, Spark, Militaires

> **Sidorovich :** « Des chercheurs ont découvert une énergie inconnue. Elle pourrait tout changer… ou tout raser. »

|  | Réponse | Effet sur les axes |
|---|---|---|
| **A** | On l’étudie, avec prudence. Le savoir n’est jamais un crime. | FOI −2 · FOR −1 · ZON +1 |
| **B** | On la détruit avant qu’elle ne nous détruise. | FOR +1 · ZON −2 · IDE +1 |
| **C** | On la contrôle et on la met au service du pays. | ORD +1 · ZON −2 · IDE −1 |
| **D** | On n’y touche pas. Certaines choses nous dépassent. | FOI +1 · ZON +2 |

| Impact | SOL | DEV | LIB | BAN | MER | MON | ECO | MIL | CS | WAR | SPA | NOO |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **A** | · | − | + | − | · | − | ++ | − | · | · | · | −− |
| **B** | · | ++ | · | + | + | · | − | ++ | · | ++ | · | + |
| **C** | · | + | − | + | ++ | − | · | ++ | − | ++ | −− | · |
| **D** | · | −− | · | − | −− | ++ | − | −− | · | −− | ++ | · |

### Q06 · Les forces invisibles

*Affirmation* · Départage surtout : Monolithe, Spark, Ward

> **Sidorovich :** « Il existe des forces qui nous dépassent, et la science ne les expliquera jamais. »

Échelle à 5 niveaux. « Tout à fait d’accord » : FOI +2 · ZON +1. « Pas du tout d’accord » : effet inverse.

| Impact | SOL | DEV | LIB | BAN | MER | MON | ECO | MIL | CS | WAR | SPA | NOO |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Tout à fait d’accord | · | − | · | − | −− | ++ | − | −− | · | −− | ++ | · |
| Pas du tout d’accord | · | + | · | + | ++ | −− | + | ++ | · | ++ | −− | · |

### Q07 · La parole donnée

*Dilemme* · Départage surtout : Bandits, Monolithe, Mercenaires

> **Sidorovich :** « Tu as promis un travail à un client. La veille, quelqu’un d’autre t’offre le double pour faire exactement l’inverse. »

|  | Réponse | Effet sur les axes |
|---|---|---|
| **A** | Je tiens parole, point. Un engagement, c’est sacré. | ORD +1 · IDE +2 |
| **B** | Je tiens parole : un pro qui trahit ses clients ne retravaille jamais. | ORD +1 · COL −1 · IDE −2 |
| **C** | Je prends le double. Le premier n’avait qu’à payer plus. | ORD −1 · ALT −2 · IDE −1 |
| **D** | Je préviens le premier client et je le laisse surenchérir. | COL −1 · IDE −2 |

| Impact | SOL | DEV | LIB | BAN | MER | MON | ECO | MIL | CS | WAR | SPA | NOO |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **A** | − | ++ | · | −− | −− | ++ | · | · | ++ | · | ++ | + |
| **B** | · | · | · | · | + | · | · | · | · | · | − | · |
| **C** | · | − | · | + | · | · | · | · | · | − | · | · |
| **D** | · | · | · | · | · | − | · | · | · | · | · | · |

*Réplique de Sidorovich après la réponse D :* « Celle-là, c’est ma préférée. »

### Q08 · La caisse commune

*Dilemme* · Départage surtout : Devoir, Monolithe, Bandits

> **Sidorovich :** « Ton meilleur ami pioche dans la caisse commune du groupe. Tu es la seule personne à le savoir. »

|  | Réponse | Effet sur les axes |
|---|---|---|
| **A** | Je le dénonce. Les règles valent pour tout le monde. | ORD +2 · COL +1 · IDE +1 |
| **B** | Je lui parle seul à seul : il rembourse et on n’en parle plus. | ORD −1 · ALT +1 · IDE −1 |
| **C** | Je me tais. Un ami, ça ne se trahit pas. | ORD −2 · COL +1 |
| **D** | Je lui demande ma part pour me taire. | ORD −1 · ALT −2 · IDE −1 |

| Impact | SOL | DEV | LIB | BAN | MER | MON | ECO | MIL | CS | WAR | SPA | NOO |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **A** | − | ++ | · | − | · | ++ | · | + | + | + | · | ++ |
| **B** | · | · | · | · | · | − | · | · | · | · | · | · |
| **C** | · | · | + | · | · | · | · | · | · | · | · | · |
| **D** | + | −− | · | ++ | + | − | − | · | − | − | − | − |

### Q09 · Le contrat doré

*Dilemme* · Départage surtout : Mercenaires, Spark, Bandits

> **Sidorovich :** « On t’offre une fortune pour un travail propre en apparence. Seul problème : le client est quelqu’un que tu méprises. »

|  | Réponse | Effet sur les axes |
|---|---|---|
| **A** | J’accepte. L’argent n’a pas d’odeur. | ALT −1 · IDE −2 |
| **B** | J’accepte, et j’en reverse une partie à une bonne cause. | ALT +1 · IDE −1 |
| **C** | Je refuse. Certaines choses ne s’achètent pas. | IDE +2 |
| **D** | J’accepte… pour mieux le saboter de l’intérieur. | ORD −1 · FOR +1 · IDE +1 |

| Impact | SOL | DEV | LIB | BAN | MER | MON | ECO | MIL | CS | WAR | SPA | NOO |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **A** | · | − | − | + | + | · | · | · | − | · | − | · |
| **B** | · | · | · | · | · | · | · | · | · | · | · | · |
| **C** | · | · | · | − | − | · | · | · | + | · | + | · |
| **D** | · | · | · | · | · | · | · | · | · | · | · | · |

*Réplique de Sidorovich après la réponse A :* « Voilà qui me plaît. »

### Q10 · La force

*Affirmation* · Départage surtout : Écologistes, Militaires, Noon

> **Sidorovich :** « Certains problèmes ne se règlent que par la force. »

Échelle à 5 niveaux. « Tout à fait d’accord » : FOR +2. « Pas du tout d’accord » : effet inverse.

| Impact | SOL | DEV | LIB | BAN | MER | MON | ECO | MIL | CS | WAR | SPA | NOO |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Tout à fait d’accord | · | + | · | + | + | + | − | + | · | + | · | + |
| Pas du tout d’accord | · | − | · | − | − | − | ++ | −− | · | − | · | −− |

### Q11 · Survivre avec qui ?

*Préférence* · Départage surtout : Devoir, Noon, Monolithe

> **Sidorovich :** « Le monde est devenu dur. Pour tenir, tu préfères t’entourer… »

|  | Réponse | Effet sur les axes |
|---|---|---|
| **A** | D’une équipe soudée, avec un chef et des règles. | ORD +1 · COL +2 |
| **B** | D’une bande d’amis où chacun reste libre. | ORD −1 · COL +1 |
| **C** | De quelques contacts fiables, mais mes choix ne regardent que moi. | COL −1 · IDE −1 |
| **D** | De personne. On ne peut compter que sur soi. | ALT −1 · COL −2 |

| Impact | SOL | DEV | LIB | BAN | MER | MON | ECO | MIL | CS | WAR | SPA | NOO |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **A** | −− | ++ | · | − | − | ++ | · | + | ++ | + | + | ++ |
| **B** | · | · | · | · | − | · | · | · | + | · | + | · |
| **C** | + | − | · | · | + | − | · | · | − | · | · | − |
| **D** | + | −− | · | + | + | − | · | − | −− | − | − | −− |

### Q12 · La forêt et la route

*Société* · Départage surtout : Monolithe, Spark, Mercenaires

> **Sidorovich :** « Une forêt très ancienne bloque le tracé d’une route qui relancerait l’économie de toute une région. »

|  | Réponse | Effet sur les axes |
|---|---|---|
| **A** | On construit. L’humain d’abord. | ZON −2 · IDE −1 |
| **B** | On construit, et on replante ailleurs. | ALT +1 · ZON −1 |
| **C** | On cherche un autre tracé, même s’il coûte bien plus cher. | ZON +1 · IDE +1 |
| **D** | On ne touche pas à la forêt. Elle était là avant nous. | FOI +1 · ZON +2 · IDE +1 |

| Impact | SOL | DEV | LIB | BAN | MER | MON | ECO | MIL | CS | WAR | SPA | NOO |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **A** | · | + | − | ++ | ++ | −− | · | ++ | − | ++ | −− | · |
| **B** | · | + | · | · | · | − | · | + | · | + | − | · |
| **C** | · | · | · | · | − | + | · | − | · | − | + | · |
| **D** | · | −− | · | − | −− | ++ | · | −− | · | −− | ++ | · |

### Q13 · Le secret

*Dilemme* · Départage surtout : Militaires, Devoir, Ward

> **Sidorovich :** « Tu découvres un secret qui sèmerait la panique s’il éclatait. Pourtant, les gens auraient le droit de savoir. »

|  | Réponse | Effet sur les axes |
|---|---|---|
| **A** | Je révèle tout. La vérité appartient à tout le monde. | ORD −2 · COL −1 · IDE +2 |
| **B** | Je préviens les autorités et je les laisse gérer. | ORD +2 · COL +1 |
| **C** | Je garde le secret. Certaines vérités font plus de mal que de bien. | ORD +1 · ALT +1 · IDE −1 |
| **D** | Je le vends au plus offrant. | ALT −2 · IDE −2 |

| Impact | SOL | DEV | LIB | BAN | MER | MON | ECO | MIL | CS | WAR | SPA | NOO |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **A** | · | − | ++ | · | − | − | · | −− | · | −− | + | − |
| **B** | − | ++ | − | − | · | ++ | · | + | + | + | · | + |
| **C** | · | · | · | · | · | · | · | · | · | + | · | · |
| **D** | · | − | − | ++ | ++ | · | − | · | − | · | − | − |

*Réplique de Sidorovich après la réponse D :* « Enfin quelqu’un de raisonnable. »

### Q14 · La cause

*Valeurs* · Départage surtout : Monolithe, Devoir, Noon

> **Sidorovich :** « Jusqu’où irais-tu pour une cause en laquelle tu crois de tout ton être ? »

|  | Réponse | Effet sur les axes |
|---|---|---|
| **A** | Jusqu’au bout. Donner ma vie, ou prendre celle des autres. | COL +2 · FOI +1 · FOR +1 · IDE +2 |
| **B** | Très loin, tant que je ne fais de mal à personne. | FOR −1 · IDE +1 |
| **C** | Je me méfie des causes : elles finissent toujours par dévorer leurs fidèles. | COL −1 · FOI −1 · IDE −1 |
| **D** | Nulle part. Aucune cause ne vaut ma peau. | ALT −1 · COL −2 · IDE −2 |

| Impact | SOL | DEV | LIB | BAN | MER | MON | ECO | MIL | CS | WAR | SPA | NOO |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **A** | −− | ++ | · | − | −− | ++ | · | + | ++ | · | ++ | ++ |
| **B** | · | · | · | − | − | · | + | − | · | · | · | · |
| **C** | + | · | · | · | + | −− | · | · | · | · | −− | − |
| **D** | ++ | −− | − | ++ | ++ | −− | − | · | −− | · | −− | −− |

*Réplique de Sidorovich après la réponse A :* « Hm. Toi, je vais te garder à l’œil. »

### Q15 · Le remède

*Dilemme* · Départage surtout : Monolithe, Spark, Mercenaires

> **Sidorovich :** « Un scientifique veut tester un remède miracle sur des volontaires. Une chance sur dix d’y rester. Sans essai, des milliers de malades mourront. »

|  | Réponse | Effet sur les axes |
|---|---|---|
| **A** | On teste tout de suite. Le progrès a toujours eu un prix. | FOI −1 · ZON −1 · IDE −1 |
| **B** | On teste, mais seulement après des années de précautions. | FOI −1 · IDE +1 |
| **C** | Je me porte volontaire. | ALT +2 · COL +1 · FOI −1 · IDE +1 |
| **D** | Non. On ne joue pas avec la vie. | FOI +1 · ZON +1 · IDE +1 |

| Impact | SOL | DEV | LIB | BAN | MER | MON | ECO | MIL | CS | WAR | SPA | NOO |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **A** | + | · | − | ++ | ++ | −− | · | + | − | + | −− | · |
| **B** | · | · | · | · | · | · | · | · | · | · | · | · |
| **C** | − | ++ | · | − | − | · | + | · | ++ | + | + | + |
| **D** | · | −− | · | · | − | ++ | − | −− | · | −− | ++ | · |

### Q16 · La main de fer

*Affirmation* · Départage surtout : Militaires, Devoir, Ward

> **Sidorovich :** « Le monde irait mieux s’il était dirigé d’une main de fer. »

Échelle à 5 niveaux. « Tout à fait d’accord » : ORD +2 · FOR +1. « Pas du tout d’accord » : effet inverse.

| Impact | SOL | DEV | LIB | BAN | MER | MON | ECO | MIL | CS | WAR | SPA | NOO |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Tout à fait d’accord | · | ++ | − | · | + | + | · | ++ | · | + | · | + |
| Pas du tout d’accord | · | −− | + | · | − | −− | · | −− | · | −− | · | − |

### Q17 · Le butin

*Situation* · Départage surtout : Mercenaires, Clear Sky, Spark

> **Sidorovich :** « Ton groupe met la main sur un gros butin. Comment on partage ? »

|  | Réponse | Effet sur les axes |
|---|---|---|
| **A** | À parts égales, chef compris. | ORD −1 · ALT +1 · COL +1 |
| **B** | Le chef décide. C’est son rôle. | ORD +2 |
| **C** | Selon ce que chacun a risqué. Contrat, c’est contrat. | ORD +1 · ALT −1 · COL −1 · IDE −1 |
| **D** | Je me sers en premier, avant que quelqu’un d’autre ne le fasse. | ORD −1 · ALT −2 · FOR +1 |

| Impact | SOL | DEV | LIB | BAN | MER | MON | ECO | MIL | CS | WAR | SPA | NOO |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **A** | · | + | + | − | −− | · | + | · | + | · | + | · |
| **B** | · | + | · | − | · | + | · | · | · | + | · | · |
| **C** | + | − | · | · | + | · | · | · | − | · | − | − |
| **D** | · | − | · | + | · | · | − | · | · | − | · | · |

### Q18 · La créature

*Dilemme* · Départage surtout : Monolithe, Militaires, Spark

> **Sidorovich :** « Une créature inconnue rôde près du village. Elle n’a encore attaqué personne. »

|  | Réponse | Effet sur les axes |
|---|---|---|
| **A** | On l’abat avant qu’elle ne le fasse. | FOR +2 · ZON −2 |
| **B** | On la capture pour l’étudier. | FOI −2 · ZON −1 |
| **C** | On l’observe de loin et on la laisse vivre. | FOR −1 · ZON +2 |
| **D** | Je m’approche. Elle cherche peut-être à nous dire quelque chose. | FOI +2 · ZON +1 |

| Impact | SOL | DEV | LIB | BAN | MER | MON | ECO | MIL | CS | WAR | SPA | NOO |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **A** | · | ++ | − | ++ | ++ | − | − | ++ | · | ++ | −− | ++ |
| **B** | · | + | · | + | ++ | −− | + | + | · | ++ | −− | · |
| **C** | · | −− | + | −− | −− | + | + | −− | · | −− | ++ | − |
| **D** | · | − | · | − | −− | ++ | − | −− | · | −− | ++ | · |

*Réplique de Sidorovich après la réponse D :* « Si elle te répond, demande-lui où elle cache ses artefacts. »

### Q19 · Les caméras

*Société* · Départage surtout : Militaires, Ward, Liberté

> **Sidorovich :** « Pour en finir avec le crime, les autorités proposent de filmer chaque rue et chaque maison, jour et nuit. »

|  | Réponse | Effet sur les axes |
|---|---|---|
| **A** | J’accepte. Qui n’a rien à se reprocher n’a rien à craindre. | ORD +2 · IDE −1 |
| **B** | Les rues, oui. Les maisons, non. | ORD +1 |
| **C** | Je refuse. La liberté vaut bien quelques risques. | ORD −2 · COL −1 · IDE +1 |
| **D** | Je refuse, et je casse les caméras. | ORD −2 · FOR +1 |

| Impact | SOL | DEV | LIB | BAN | MER | MON | ECO | MIL | CS | WAR | SPA | NOO |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **A** | · | + | − | · | · | + | · | + | · | + | · | · |
| **B** | · | + | · | · | · | · | · | · | · | · | · | · |
| **C** | · | − | + | · | · | − | · | −− | · | − | · | − |
| **D** | · | · | · | · | · | · | · | · | · | · | · | · |

### Q20 · L’étape suivante

*Affirmation* · Départage surtout : Monolithe, Spark, Mercenaires

> **Sidorovich :** « Ce qui nous effraie aujourd’hui pourrait être la prochaine étape de l’humanité. »

Échelle à 5 niveaux. « Tout à fait d’accord » : FOI +1 · ZON +2 · IDE +1. « Pas du tout d’accord » : effet inverse.

| Impact | SOL | DEV | LIB | BAN | MER | MON | ECO | MIL | CS | WAR | SPA | NOO |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Tout à fait d’accord | · | −− | + | −− | −− | ++ | · | −− | + | −− | ++ | · |
| Pas du tout d’accord | · | ++ | · | ++ | ++ | −− | · | ++ | · | ++ | −− | · |

### Q21 · Le repenti

*Dilemme* · Départage surtout : Devoir, Clear Sky, Noon

> **Sidorovich :** « Un ancien membre d’une secte violente demande à rejoindre ton groupe. Sous l’emprise de son gourou, il a fait des choses terribles. Aujourd’hui, il dit avoir ouvert les yeux. »

|  | Réponse | Effet sur les axes |
|---|---|---|
| **A** | Je l’accepte. Tout le monde mérite une seconde chance. | ALT +1 · COL +1 · IDE +1 |
| **B** | Je l’accepte, mais il devra faire ses preuves sur le terrain. | ORD +1 · COL +1 · FOR +1 |
| **C** | Je refuse. On ne change jamais vraiment. | ALT −1 · COL −1 |
| **D** | Je le livre à la justice. Il doit payer. | ORD +2 · FOR +1 |

| Impact | SOL | DEV | LIB | BAN | MER | MON | ECO | MIL | CS | WAR | SPA | NOO |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **A** | − | · | + | − | −− | · | + | · | + | · | + | · |
| **B** | · | + | · | · | · | + | · | + | · | · | · | + |
| **C** | + | −− | · | + | + | −− | · | − | − | − | − | −− |
| **D** | · | · | · | · | · | · | · | + | · | · | · | · |

### Q22 · Le voleur du camp

*Situation* · Départage surtout : Militaires, Devoir, Noon

> **Sidorovich :** « On a surpris quelqu’un en train de piller les réserves du camp. »

|  | Réponse | Effet sur les axes |
|---|---|---|
| **A** | Une punition sévère, devant tout le monde. Pour l’exemple. | ORD +1 · FOR +2 |
| **B** | On le juge selon les règles du camp, ni plus ni moins. | ORD +2 |
| **C** | On cherche pourquoi il a volé. Si c’est la faim, on l’aide. | ALT +2 · FOR −1 |
| **D** | On le relâche. Qui sommes-nous pour juger ? | ORD −2 · FOR −1 |

| Impact | SOL | DEV | LIB | BAN | MER | MON | ECO | MIL | CS | WAR | SPA | NOO |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **A** | · | + | − | + | + | + | − | ++ | · | + | · | + |
| **B** | · | + | − | · | · | + | · | + | · | + | · | · |
| **C** | · | · | · | − | − | · | + | − | · | · | · | · |
| **D** | · | −− | + | · | − | −− | · | −− | · | −− | · | −− |

### Q23 · La preuve

*Affirmation* · Départage surtout : Monolithe, Spark, Ward

> **Sidorovich :** « Ce qui ne peut pas être prouvé n’existe pas. »

Échelle à 5 niveaux. « Tout à fait d’accord » : FOI −2 · ZON −1. « Pas du tout d’accord » : effet inverse.

| Impact | SOL | DEV | LIB | BAN | MER | MON | ECO | MIL | CS | WAR | SPA | NOO |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Tout à fait d’accord | · | + | · | + | ++ | −− | + | ++ | · | ++ | −− | · |
| Pas du tout d’accord | · | − | · | − | −− | ++ | − | −− | · | −− | ++ | · |

### Q24 · Le vœu

*Valeurs* · Départage surtout : Devoir, Mercenaires, Clear Sky

> **Sidorovich :** « Dernière question. On raconte qu’au cœur de la Zone, une machine exauce un vœu. Un seul. Tu demandes quoi ? »

|  | Réponse | Effet sur les axes |
|---|---|---|
| **A** | La paix et la liberté pour tout le monde. | ORD −1 · ALT +2 · IDE +1 |
| **B** | Que la Zone disparaisse à jamais. | ALT +1 · ZON −2 · IDE +1 |
| **C** | Comprendre. Tout comprendre. | FOI −1 · ZON +1 · IDE +1 |
| **D** | Être riche. Immensément riche. | ALT −2 · COL −1 · IDE −2 |

| Impact | SOL | DEV | LIB | BAN | MER | MON | ECO | MIL | CS | WAR | SPA | NOO |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **A** | · | · | + | − | −− | · | · | − | + | · | ++ | · |
| **B** | · | ++ | · | · | · | · | · | + | · | ++ | · | + |
| **C** | · | · | · | · | − | + | · | · | · | · | · | · |
| **D** | + | −− | − | ++ | ++ | − | − | · | −− | − | −− | − |

*Réplique de Sidorovich après la réponse D :* « Tu iras loin… ou pas très loin. »

## 6. Textes de Sidorovich hors questions

Première version du ton : bourru, sarcastique, mercantile, jamais insultant. Pas de grossièretés : le site doit rester présentable dans un portfolio.

| Moment | Réplique |
|---|---|
| Accueil | « Entre, entre. Et ferme la porte, ça fait des courants d’air. Alors comme ça, tu veux travailler dans la Zone ? Bien. Je ne vais pas t’envoyer n’importe où. Vingt-quatre questions. Réponds honnêtement : les mensonges, je les sens à dix kilomètres. » |
| Mi-parcours (après Q12) | « À mi-chemin. Tu tiens le coup ? Tiens, un coup de vodka. Contre les radiations, il n’y a pas mieux. » |
| Calcul du résultat | « Voyons voir ce dossier… » |
| Résultat hybride | « Hm. Tu hésites entre {first} et {second}. Moi aussi. Je t’envoie chez {first}… ils paient mieux. » |
| Recommencer | « Encore ? Tu crois que tu vas me rouler ? Bon. On reprend depuis le début. » |

**Verdicts par faction :**

| Faction | Verdict de Sidorovich |
|---|---|
| Solitaires | « Toi, tu n’appartiens à personne. Va, stalker. Et rapporte-moi des artefacts. » |
| Devoir | « Discipline, principes, gâchette facile… Le Devoir va t’adorer. Évite de leur parler de moi. » |
| Liberté | « Tu n’aimes ni les ordres ni les uniformes. Liberté t’attend. Là-bas, ils partagent tout, même ce qu’ils n’ont pas. » |
| Bandits | « Tu as le sens des affaires… mais pas celui des manières. Les Bandits ont une place pour toi. Loin de mon comptoir. » |
| Mercenaires | « Efficace, pas de questions, pas de bavardage. Les Mercenaires paient bien. Moi, moins. » |
| Monolithe | « Gloire au Monol… Hm. Non. Toi, je ne veux plus te voir ici. » |
| Écologistes | « Des questions, toujours des questions. Va voir les scientifiques : ils adorent qu’on leur rapporte des échantillons. » |
| Militaires | « Tu aimes les ordres. L’armée aussi. Au moins, tu sauras où dormir. » |
| Clear Sky | « De l’idéalisme et une bonne gâchette. Clear Sky… s’il en reste. » |
| Ward | « Protéger les gens du dehors, contrôler ce qui entre et ce qui sort… La Ward a besoin de gens comme toi. Moi, un peu moins. » |
| Spark | « Tu crois que la Zone a une âme. Spark t’accueillera à bras ouverts. Je vends des combinaisons, si besoin. » |
| Noon | « Tu as l’air de quelqu’un qui revient de loin. Noon saura quoi faire de toi. » |

## 7. Synthèse et équilibrage

### 7.1 Couverture : quels axes chaque question touche

Chaque case indique l’amplitude disponible sur l’axe : plus forte valeur positive / plus forte valeur négative parmi les réponses.

| Question | ORD | ALT | COL | FOI | FOR | ZON | IDE |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Q01 Le wagon fou |  | +1 / −1 | +1 | +1 | +1 / −2 |  | +1 / −2 |
| Q02 L’ordre stupide | +2 / −2 |  | +1 / −1 |  |  |  | +1 / −1 |
| Q03 Le portefeuille | +1 / −1 | +2 / −2 |  |  |  |  | −1 |
| Q04 L’inconnu sous l’émission |  | +2 / −2 | −1 |  | +1 |  | +1 / −1 |
| Q05 L’énergie inconnue | +1 |  |  | +1 / −2 | +1 / −1 | +2 / −2 | +1 / −1 |
| Q06 Les forces invisibles |  |  |  | +2 / −2 |  | +1 / −1 |  |
| Q07 La parole donnée | +1 / −1 | −2 | −1 |  |  |  | +2 / −2 |
| Q08 La caisse commune | +2 / −2 | +1 / −2 | +1 |  |  |  | +1 / −1 |
| Q09 Le contrat doré | −1 | +1 / −1 |  |  | +1 |  | +2 / −2 |
| Q10 La force |  |  |  |  | +2 / −2 |  |  |
| Q11 Survivre avec qui ? | +1 / −1 | −1 | +2 / −2 |  |  |  | −1 |
| Q12 La forêt et la route |  | +1 |  | +1 |  | +2 / −2 | +1 / −1 |
| Q13 Le secret | +2 / −2 | +1 / −2 | +1 / −1 |  |  |  | +2 / −2 |
| Q14 La cause |  | −1 | +2 / −2 | +1 / −1 | +1 / −1 |  | +2 / −2 |
| Q15 Le remède |  | +2 | +1 | +1 / −1 |  | +1 / −1 | +1 / −1 |
| Q16 La main de fer | +2 / −2 |  |  |  | +1 / −1 |  |  |
| Q17 Le butin | +2 / −1 | +1 / −2 | +1 / −1 |  | +1 |  | −1 |
| Q18 La créature |  |  |  | +2 / −2 | +2 / −1 | +2 / −2 |  |
| Q19 Les caméras | +2 / −2 |  | −1 |  | +1 |  | +1 / −1 |
| Q20 L’étape suivante |  |  |  | +1 / −1 |  | +2 / −2 | +1 / −1 |
| Q21 Le repenti | +2 | +1 / −1 | +1 / −1 |  | +1 |  | +1 |
| Q22 Le voleur du camp | +2 / −2 | +2 |  |  | +2 / −1 |  |  |
| Q23 La preuve |  |  |  | +2 / −2 |  | +1 / −1 |  |
| Q24 Le vœu | −1 | +2 / −2 | −1 | −1 |  | +1 / −2 | +1 / −2 |
| **Questions par axe** | **14** | **15** | **13** | **10** | **12** | **8** | **18** |

### 7.2 Critères d’équilibrage

Ces critères sont repris dans le cahier des charges (section 5.3). Ils sont vérifiés par les tests automatisés (`tests/balance`) à chaque intégration continue.

| Critère | Mesure actuelle | Statut |
|---|---|---|
| C1 · Archétypes reconnus | 12/12 | ✅ |
| C2 · Atteignabilité (score ≥ 80 % et 1er) | min 94 % | ✅ |
| C3 · Reconnaissance (≥ 65 % chacune, ≥ 80 % en moyenne) | min 65,5 %, moyenne 83,2 % | ✅ |
| C4 · Répartition (entre 2 % et 25 %) | de 2,8 % à 21,7 % | ✅ |
| C5 · Couverture (≥ 8 questions par axe) | min 8 | ✅ |
| C6 · Aucune réponse sans effet (hors « Sans avis ») | 24 questions | ✅ |

Définitions :

- **Archétype** : on répond à chaque question avec l’option la plus alignée sur le profil déclaré de la faction. Le résultat doit être cette faction.
- **Atteignabilité** : il existe une combinaison de réponses qui place la faction en tête avec un score élevé.
- **Reconnaissance** : 2 000 personas proches de la faction (profil + bruit σ = 0,3) ; part de celles qui obtiennent bien cette faction.
- **Répartition** : 20 000 personas aux convictions tirées au hasard dans tout l’espace ; part de résultats obtenue par chaque faction.

### 7.3 Résultats détaillés

| Faction | Archétype | Reconnaissance | Confusions principales | Part (personas uniformes) | Part (clics au hasard) |
|---|---|---:|---|---:|---:|
| Solitaires | ✅ 72 % | 79,5 % | Mercenaires 10,1 %, Bandits 4,7 % | 21,7 % | 54,0 % |
| Devoir | ✅ 86 % | 92,0 % | Noon 5,6 %, Ward 2,0 % | 2,8 % | 0,0 % |
| Liberté | ✅ 79 % | 84,7 % | Spark 7,8 %, Solitaires 2,6 % | 14,4 % | 10,6 % |
| Bandits | ✅ 77 % | 87,5 % | Mercenaires 8,9 %, Solitaires 2,9 % | 8,5 % | 2,1 % |
| Mercenaires | ✅ 85 % | 92,5 % | Bandits 5,3 %, Militaires 1,6 % | 7,3 % | 0,7 % |
| Monolithe | ✅ 89 % | 98,2 % | Noon 1,1 %, Spark 0,7 % | 6,8 % | 0,4 % |
| Écologistes | ✅ 74 % | 92,0 % | Liberté 3,5 %, Clear Sky 2,0 % | 8,6 % | 7,8 % |
| Militaires | ✅ 85 % | 78,0 % | Ward 9,8 %, Mercenaires 6,1 % | 4,2 % | 2,6 % |
| Clear Sky | ✅ 79 % | 65,5 % | Spark 9,1 %, Liberté 7,8 % | 5,4 % | 7,5 % |
| Ward | ✅ 83 % | 72,5 % | Devoir 16,3 %, Militaires 9,2 % | 6,3 % | 3,1 % |
| Spark | ✅ 85 % | 89,5 % | Monolithe 7,9 %, Clear Sky 1,9 % | 7,5 % | 0,9 % |
| Noon | ✅ 81 % | 66,5 % | Devoir 17,9 %, Monolithe 7,3 % | 6,6 % | 10,3 % |

Résultats « hybrides » (écart < 3 points entre la 1re et la 2e faction) : **25,6 %** des personas uniformes. C’est voulu : Sidorovich « hésite » dans environ un cas sur quatre, ce qui rend le résultat plus vivant.

Quelqu’un qui clique au hasard obtient le plus souvent **Solitaires** : un profil sans conviction marquée reste proche du centre. C’est un comportement acceptable.

### 7.4 Points faibles connus (à traiter en phase 3)

- **Clear Sky** : reconnaissance 65,5 %, souvent confondue avec Spark et Liberté. Piste : ajouter ou ajuster une question qui oppose directement ces factions.
- **Noon** : reconnaissance 66,5 %, souvent confondue avec Devoir et Monolithe. Piste : ajouter ou ajuster une question qui oppose directement ces factions.
- **Ward** : reconnaissance 72,5 %, souvent confondue avec Devoir et Militaires. Piste : ajouter ou ajuster une question qui oppose directement ces factions.
- **Devoir** reste rare chez les personas uniformes (2,8 %) : son profil combine cinq axes très marqués, une zone étroite de l’espace. Les joueurs qui « visent » le Devoir l’obtiennent sans difficulté (archétype 86 %).
- Les personas simulées ne remplacent pas de vrais répondants. Un test avec 10 à 20 personnes est prévu en phase 4 pour confronter le modèle à la réalité.
