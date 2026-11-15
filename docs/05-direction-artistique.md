# 05 · Direction artistique

Phase 5 du [plan de développement](03-plan-de-developpement.md). La planche d'ambiance et les 6 maquettes (3 décors, sur ordinateur et sur mobile) ont été validées le 15 novembre 2026, avec une seule demande de changement : **un fond vidéo en boucle pour la scène de Sidorovich**, à la place de l'illustration SVG.

## 1. Trois décors pour un seul entretien

| Décor | Page | Matière | Idée |
|---|---|---|---|
| **Bunker** | Accueil | Béton, ampoule nue | On entre chez Sidorovich. Seule la lampe apporte de la chaleur. |
| **Dossier** | Questionnaire | Papier ligné, encre, tampon | On remplit sa candidature, feuillet par feuillet. Sidorovich commente sur des notes trombonées. |
| **PDA** | Résultat | Coque kaki, écran à phosphore | Le verdict arrive comme un message sur l'appareil du stalker. |

Les autres pages (Factions, Comment ça marche, À propos, 404) reprennent le béton du bunker ; les fiches des factions sont des fiches de papier.

## 2. Couleurs et polices

Les tokens sont dans [`src/app/globals.css`](../src/app/globals.css).

| Token | Valeur | Usage |
|---|---|---|
| `bunker-950` à `bunker-700` | `#0d0d0b` à `#34312a` | Fonds, murs, joints |
| `paper-100`, `paper-200`, `paper-300` | `#efe6cf`, `#e3d6b4`, `#d9c9a3` | Feuillets, réponse cochée, notes |
| `ink-900`, `ink-600` | `#1d1a14`, `#4a4336` | Texte sur papier |
| `rust-500`, `rust-600` | `#a4502a`, `#8f4322` | Tampons ; texte rouge sur papier (contraste ≥ 4,5:1) |
| `amber-400` | `#f2b544` | Lampe, boutons, phosphore du PDA |
| `desk-900`, `pda-900`, `pda-700`, `pda-300`, `screen-950` | — | Bureau, coque et écran du PDA |

Polices : **PT Mono** (titres, dossier, répliques), **PT Sans** (texte courant), **IBM Plex Mono** (PDA, étiquettes, boutons). Toutes couvrent le cyrillique.

Les matières sont dessinées en CSS, sans image : `bg-concrete`, `bg-desk`, `bg-ruled`, `bg-scanlines`.

## 3. Emblèmes

Douze tampons ronds tracés au trait ([`FactionEmblem.tsx`](../src/components/FactionEmblem.tsx)), un pictogramme par idée, volontairement éloignés des logos du jeu `[L-02]` :

| Faction | Pictogramme | Faction | Pictogramme |
|---|---|---|---|
| Solitaires | Feu de camp | Écologistes | Fiole de laboratoire |
| Devoir | Bastion | Militaires | Galons |
| Liberté | Cadenas ouvert | Clear Sky | Soleil levant |
| Bandits | Loup de voleur | Ward | Clé |
| Mercenaires | Pièce sous un viseur | Spark | Étincelle |
| Monolithe | Stèle qui rayonne | Noon | Cadran arrêté à midi |

## 4. Mouvement

Animations en CSS uniquement : rien n'alourdit le JavaScript `[T-05]`.

| Animation | Où | Durée |
|---|---|---|
| Lampe qui vacille | Bunker | 2 ou 3 baisses irrégulières en 23 s |
| Feuillet glissé | À chaque question | 260 ms |
| Coup de tampon | « Dossier complet » | 220 ms |
| Démarrage du PDA | Blocs du résultat, un par un | 420 ms, décalés de 90 ms |
| Tracé du radar | Profil du candidat | 900 ms |
| Frappe à la machine | Répliques de Sidorovich | 2 caractères toutes les 30 ms ; un clic l'arrête |

Avec `prefers-reduced-motion` `[V-06]` : la lampe ne vacille plus, les répliques s'affichent d'un coup, le radar apparaît directement, tout le reste devient un simple fondu, et la vidéo n'est pas chargée.

## 5. La vidéo du bunker (à fournir)

Le lecteur est en place ([`BackgroundVideo.tsx`](../src/components/bunker/BackgroundVideo.tsx)). En attendant la vidéo, la scène montre seulement la lumière de la lampe.

### Contenu

- Un marchand trapu, la cinquantaine, crâne dégarni, derrière un comptoir encombré (vieille radio, registre, bouteille), dans un bunker en béton.
- Une ampoule nue sous un abat-jour métallique, qui oscille à peine ; lumière chaude de tungstène, poussière en suspension.
- Presque immobile : il respire, tourne un peu la tête, compte des billets ou tire sur une cigarette. Caméra fixe.
- **Création originale** : un personnage « dans l'esprit » de Sidorovich, pas une copie du modèle du jeu. Ne pas donner de captures du jeu comme référence à l'outil, et ne pas utiliser le visage d'une personne réelle reconnaissable.

### Cadrage et technique

| Critère | Valeur |
|---|---|
| Format | 16:9, 1280 × 720 minimum |
| Cadrage | Plan moyen, de la taille à la lampe. Le personnage reste dans le **tiers central** : la scène est recadrée en format presque carré sur ordinateur et en paysage sur mobile. |
| Durée | 6 à 10 secondes |
| Boucle | Sans raccord visible : la dernière image rejoint la première |
| Son | Aucun (piste audio retirée) |
| Poids | WebM ≤ 1,5 Mo, MP4 ≤ 2,5 Mo, image fixe ≤ 100 Ko |
| Lumière | Sombre et chaude ; la bulle de texte se pose en haut à gauche, éviter un détail important à cet endroit |

### Prompt pour un générateur vidéo

> Static medium shot, dim Soviet-era concrete bunker office. A heavyset, balding middle-aged trader with stubble sits behind a cluttered wooden counter (old radio, ledger, bottle). A single bare tungsten bulb under a metal shade sways very slightly above him, warm amber light, dust motes floating, faint cigarette smoke. He barely moves: breathing, a slight head tilt, counting banknotes. Cinematic, 35 mm, muted colors, deep shadows, subject centered, seamless loop, no text, no logos.

### Encodage

Avec [FFmpeg](https://ffmpeg.org/), depuis la vidéo d'origine `source.mp4` :

```bash
ffmpeg -i source.mp4 -an -vf "scale=1280:-2,fps=24" -c:v libvpx-vp9 -b:v 0 -crf 38 -row-mt 1 public/media/bunker/sidorovich.webm
```

```bash
ffmpeg -i source.mp4 -an -vf "scale=1280:-2,fps=24" -c:v libx264 -preset slow -crf 28 -pix_fmt yuv420p -movflags +faststart public/media/bunker/sidorovich.mp4
```

```bash
ffmpeg -i source.mp4 -vf "scale=1280:-2" -frames:v 1 -q:v 4 public/media/bunker/sidorovich-poster.jpg
```

Si un fichier dépasse son poids maximal, augmenter `-crf` de 2 et recommencer.

### Activation

Poser les trois fichiers dans `public/media/bunker/`, puis renseigner [`src/components/bunker/video.ts`](../src/components/bunker/video.ts) :

```ts
export const BUNKER_VIDEO = {
  poster: "/media/bunker/sidorovich-poster.jpg",
  sources: [
    { src: "/media/bunker/sidorovich.webm", type: "video/webm" },
    { src: "/media/bunker/sidorovich.mp4", type: "video/mp4" },
  ],
};
```

Comportement du lecteur :

- La vidéo est muette, en boucle, et décorative : les lecteurs d'écran l'ignorent.
- Elle se met en pause hors de l'écran. Un bouton pause est toujours présent, car l'animation dure plus de 5 secondes (WCAG 2.2.2).
- Elle ne se télécharge pas si la personne a réduit les animations ou active l'économiseur de données : l'image fixe reste affichée.
