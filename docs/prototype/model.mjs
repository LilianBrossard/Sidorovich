// Données du questionnaire — version 0 (prototype de cadrage).
// Source unique des chiffres du document docs/02-questionnaire.md.
// En phase 2 du plan de développement, ce fichier est porté en TypeScript dans src/data/.

export const VERSION = 'v0';

export const AXES = [
  { key: 'ORD', name: 'Ordre ↔ Liberté', plus: 'Ordre, hiérarchie, discipline, respect des règles', minus: "Liberté, refus de l’autorité, autonomie" },
  { key: 'ALT', name: 'Altruisme ↔ Intérêt personnel', plus: 'Bien commun, entraide, sacrifice pour autrui', minus: 'Profit, survie personnelle, opportunisme' },
  { key: 'COL', name: 'Collectif ↔ Indépendance', plus: 'Appartenance, loyauté au groupe, fraternité', minus: 'Loup solitaire, ne rien devoir à personne' },
  { key: 'FOI', name: 'Foi ↔ Raison', plus: 'Croyance, mystique, intuition, sacré', minus: 'Science, preuves, scepticisme' },
  { key: 'FOR', name: 'Force ↔ Non-violence', plus: 'La force est un outil légitime', minus: 'Refus de la violence, dialogue, prudence' },
  { key: 'ZON', name: "Respect ↔ Maîtrise de l’inconnu", plus: "Préserver, coexister, laisser vivre l’inconnu", minus: "Contrôler, exploiter ou détruire l’inconnu" },
  { key: 'IDE', name: 'Idéalisme ↔ Pragmatisme', plus: 'Les principes avant le résultat', minus: 'Le résultat avant les principes, compromis' },
];

// Profils déclarés : l’intention de conception, valeurs dans [-1, 1], dans l’ordre des AXES.
// Le moteur ne s’en sert pas directement : il les calibre par simulation (voir engine.mjs).
export const FACTIONS = {
  SOL: { name: 'Solitaires', en: 'Loners / Free Stalkers', origin: 'Trilogie, S2', p: [-0.3, 0.2, -0.8, 0.1, 0.0, 0.0, -0.5],
    pitch: 'Indépendants et débrouillards. Entraide ponctuelle entre stalkers, mais sans chef ni drapeau.' },
  DEV: { name: 'Devoir', en: 'Duty', origin: 'Trilogie, S2', p: [0.9, 0.6, 0.9, -0.2, 0.7, -0.9, 0.7],
    pitch: "Paramilitaires à la discipline de fer. La Zone est une menace qu’il faut éradiquer pour protéger l’humanité." },
  LIB: { name: 'Liberté', en: 'Freedom', origin: 'Trilogie, S2', p: [-0.9, 0.3, -0.2, -0.3, 0.1, 0.3, 0.6],
    pitch: "Anarchistes. La Zone doit être ouverte à tous et le savoir circuler librement. Refus de toute autorité." },
  BAN: { name: 'Bandits', en: 'Bandits', origin: 'Trilogie, S2', p: [-0.6, -0.9, 0.2, 0.0, 0.8, -0.2, -0.8],
    pitch: 'Criminels en bandes. Le profit par la force, la loi du plus fort.' },
  MER: { name: 'Mercenaires', en: 'Mercenaries', origin: 'Trilogie, S2', p: [0.3, -0.6, -0.3, -0.5, 0.7, -0.5, -1.0],
    pitch: 'Professionnels sous contrat. Discipline, efficacité, et loyauté envers qui paie.' },
  MON: { name: 'Monolithe', en: 'Monolith', origin: 'Trilogie, S2', p: [0.8, -0.3, 1.0, 1.0, 0.9, 0.8, 0.9],
    pitch: 'Fanatiques voués au Monolithe. Foi absolue, dévotion totale, sacrifice.' },
  ECO: { name: 'Écologistes', en: 'Ecologists / Scientists', origin: 'Trilogie, S2', p: [0.2, 0.5, 0.0, -1.0, -0.9, 0.3, 0.2],
    pitch: 'Chercheurs. Comprendre la Zone par la science, avec prudence et sans violence.' },
  MIL: { name: 'Militaires', en: 'Military', origin: 'Trilogie', p: [1.0, -0.2, 0.8, -0.2, 0.9, -0.7, -0.5],
    pitch: "Armée régulière. Ordre, obéissance, et un périmètre à tenir coûte que coûte." },
  CS: { name: 'Clear Sky', en: 'Clear Sky', origin: 'Clear Sky', p: [0.0, 0.8, 0.6, -0.4, 0.2, 0.4, 0.7],
    pitch: 'Chercheurs-combattants idéalistes. Comprendre la Zone pour la stabiliser et protéger le monde.' },
  WAR: { name: 'Ward', en: 'Ward', origin: 'S2', p: [0.7, 0.5, 0.4, -0.7, 0.4, -1.0, -0.2],
    pitch: "Force officielle de la Zone. Protéger la société extérieure, contrôler la Zone, quitte à la détruire." },
  SPA: { name: 'Spark', en: 'Spark', origin: 'S2', p: [-0.3, 0.6, 0.5, 0.6, 0.3, 1.0, 0.8],
    pitch: "Le groupe de Scar. Croit en une « Zone rayonnante » qui doit prospérer, et combat toute tentative de la contrôler." },
  NOO: { name: 'Noon', en: 'Noon', origin: 'S2', p: [0.3, 0.0, 0.9, 0.3, 0.8, -0.3, 0.5],
    pitch: "Anciens fanatiques du Monolithe libérés de son emprise. Fraternité soudée et discrète, en quête de vérité." },
};

export const SCALE_LABELS = ["Pas du tout d’accord", "Plutôt pas d’accord", 'Sans avis', "Plutôt d’accord", "Tout à fait d’accord"];
export const SCALE_FACTORS = [-1, -0.5, 0, 0.5, 1];

// type 'choice' : answers[].d = deltas par axe (entiers de -2 à +2).
// type 'scale'  : v = deltas pour « Tout à fait d’accord » ; les autres niveaux sont multipliés par SCALE_FACTORS.
// quip : réplique optionnelle de Sidorovich après la réponse (clé = lettre de la réponse, ou 'any').
export const QUESTIONS = [
  { id: 'Q01', type: 'choice', title: 'Le wagon fou', kind: 'Dilemme',
    prompt: "Un wagonnet de minerai dévale la pente, droit sur cinq ouvriers. Toi, tu tiens l’aiguillage : si tu le bascules, le wagonnet part sur la voie où travaille un seul ouvrier. Il te reste trois secondes.",
    answers: [
      { t: 'Je bascule. Cinq vies valent plus qu’une.', d: { IDE: -2, ALT: 1, FOR: 1 } },
      { t: 'Je ne touche à rien. Ce n’est pas à moi de choisir qui meurt.', d: { IDE: 1, FOR: -1, FOI: 1 } },
      { t: 'Je hurle pour les prévenir, sans toucher au levier.', d: { FOR: -2, ALT: 1 } },
      { t: 'Je regarde d’abord qui sont les cinq.', d: { ALT: -1, IDE: -1, COL: 1 } },
    ],
    quip: { D: 'Prudent. J’aime les gens qui vérifient la marchandise.' } },

  { id: 'Q02', type: 'choice', title: 'L’ordre stupide', kind: 'Situation',
    prompt: 'Ton chef d’équipe te donne un ordre complètement idiot. Pas dangereux, juste idiot.',
    answers: [
      { t: 'J’obéis. Une équipe sans discipline est une équipe morte.', d: { ORD: 2, COL: 1 } },
      { t: 'J’obéis, et je lui dis ce que j’en pense une fois le travail fini.', d: { ORD: 1, COL: 1, IDE: -1 } },
      { t: 'Je fais à ma façon. Tant que le résultat est là, il n’y verra que du feu.', d: { ORD: -1, COL: -1, IDE: -1 } },
      { t: 'Je refuse. Personne ne pense à ma place.', d: { ORD: -2, COL: -1, IDE: 1 } },
    ] },

  { id: 'Q03', type: 'choice', title: 'Le portefeuille', kind: 'Situation',
    prompt: 'Tu trouves un portefeuille par terre : une belle liasse de billets et les papiers de son propriétaire. Personne ne t’a vu.',
    answers: [
      { t: 'Je le rends tel quel.', d: { ALT: 2, ORD: 1 } },
      { t: 'Je le rends, mais une petite récompense ne serait pas de refus.', d: { ALT: 1, IDE: -1 } },
      { t: 'Je garde les billets et je renvoie les papiers. Faut pas exagérer.', d: { ALT: -1, IDE: -1 } },
      { t: 'Je garde tout. La chance, ça se saisit.', d: { ALT: -2, ORD: -1 } },
    ],
    quip: { A: 'Honnête… Tu ne feras pas fortune ici, mais bon.' } },

  { id: 'Q04', type: 'choice', title: 'L’inconnu sous l’émission', kind: 'Dilemme',
    prompt: 'Une émission arrive, le ciel vire au rouge. Quelqu’un tambourine à la porte de ton abri : une personne blessée, que tu ne connais pas. Tu n’as de provisions que pour toi.',
    answers: [
      { t: 'J’ouvre et je partage tout. On verra demain.', d: { ALT: 2, IDE: 1 } },
      { t: 'J’ouvre, mais je garde mon arme à portée de main.', d: { ALT: 1, FOR: 1, IDE: -1 } },
      { t: 'Je lui glisse de quoi tenir et je referme.', d: { IDE: -1, COL: -1 } },
      { t: 'Je n’ouvre pas. Ma survie d’abord.', d: { ALT: -2, COL: -1 } },
    ] },

  { id: 'Q05', type: 'choice', title: 'L’énergie inconnue', kind: 'Société',
    prompt: 'Des chercheurs ont découvert une énergie inconnue. Elle pourrait tout changer… ou tout raser.',
    answers: [
      { t: 'On l’étudie, avec prudence. Le savoir n’est jamais un crime.', d: { FOI: -2, ZON: 1, FOR: -1 } },
      { t: 'On la détruit avant qu’elle ne nous détruise.', d: { ZON: -2, FOR: 1, IDE: 1 } },
      { t: 'On la contrôle et on la met au service du pays.', d: { ZON: -2, ORD: 1, IDE: -1 } },
      { t: 'On n’y touche pas. Certaines choses nous dépassent.', d: { ZON: 2, FOI: 1 } },
    ] },

  { id: 'Q06', type: 'scale', title: 'Les forces invisibles', kind: 'Affirmation',
    prompt: 'Il existe des forces qui nous dépassent, et la science ne les expliquera jamais.',
    v: { FOI: 2, ZON: 1 } },

  { id: 'Q07', type: 'choice', title: 'La parole donnée', kind: 'Dilemme',
    prompt: 'Tu as promis un travail à un client. La veille, quelqu’un d’autre t’offre le double pour faire exactement l’inverse.',
    answers: [
      { t: 'Je tiens parole, point. Un engagement, c’est sacré.', d: { IDE: 2, ORD: 1 } },
      { t: 'Je tiens parole : un pro qui trahit ses clients ne retravaille jamais.', d: { IDE: -2, ORD: 1, COL: -1 } },
      { t: 'Je prends le double. Le premier n’avait qu’à payer plus.', d: { ALT: -2, ORD: -1, IDE: -1 } },
      { t: 'Je préviens le premier client et je le laisse surenchérir.', d: { IDE: -2, COL: -1 } },
    ],
    quip: { D: 'Celle-là, c’est ma préférée.' } },

  { id: 'Q08', type: 'choice', title: 'La caisse commune', kind: 'Dilemme',
    prompt: 'Ton meilleur ami pioche dans la caisse commune du groupe. Tu es la seule personne à le savoir.',
    answers: [
      { t: 'Je le dénonce. Les règles valent pour tout le monde.', d: { ORD: 2, COL: 1, IDE: 1 } },
      { t: 'Je lui parle seul à seul : il rembourse et on n’en parle plus.', d: { ORD: -1, ALT: 1, IDE: -1 } },
      { t: 'Je me tais. Un ami, ça ne se trahit pas.', d: { ORD: -2, COL: 1 } },
      { t: 'Je lui demande ma part pour me taire.', d: { ALT: -2, ORD: -1, IDE: -1 } },
    ] },

  { id: 'Q09', type: 'choice', title: 'Le contrat doré', kind: 'Dilemme',
    prompt: 'On t’offre une fortune pour un travail propre en apparence. Seul problème : le client est quelqu’un que tu méprises.',
    answers: [
      { t: 'J’accepte. L’argent n’a pas d’odeur.', d: { IDE: -2, ALT: -1 } },
      { t: 'J’accepte, et j’en reverse une partie à une bonne cause.', d: { IDE: -1, ALT: 1 } },
      { t: 'Je refuse. Certaines choses ne s’achètent pas.', d: { IDE: 2 } },
      { t: 'J’accepte… pour mieux le saboter de l’intérieur.', d: { IDE: 1, FOR: 1, ORD: -1 } },
    ],
    quip: { A: 'Voilà qui me plaît.' } },

  { id: 'Q10', type: 'scale', title: 'La force', kind: 'Affirmation',
    prompt: 'Certains problèmes ne se règlent que par la force.',
    v: { FOR: 2 } },

  { id: 'Q11', type: 'choice', title: 'Survivre avec qui ?', kind: 'Préférence',
    prompt: 'Le monde est devenu dur. Pour tenir, tu préfères t’entourer…',
    answers: [
      { t: 'D’une équipe soudée, avec un chef et des règles.', d: { COL: 2, ORD: 1 } },
      { t: 'D’une bande d’amis où chacun reste libre.', d: { COL: 1, ORD: -1 } },
      { t: 'De quelques contacts fiables, mais mes choix ne regardent que moi.', d: { COL: -1, IDE: -1 } },
      { t: 'De personne. On ne peut compter que sur soi.', d: { COL: -2, ALT: -1 } },
    ] },

  { id: 'Q12', type: 'choice', title: 'La forêt et la route', kind: 'Société',
    prompt: 'Une forêt très ancienne bloque le tracé d’une route qui relancerait l’économie de toute une région.',
    answers: [
      { t: 'On construit. L’humain d’abord.', d: { ZON: -2, IDE: -1 } },
      { t: 'On construit, et on replante ailleurs.', d: { ZON: -1, ALT: 1 } },
      { t: 'On cherche un autre tracé, même s’il coûte bien plus cher.', d: { ZON: 1, IDE: 1 } },
      { t: 'On ne touche pas à la forêt. Elle était là avant nous.', d: { ZON: 2, FOI: 1, IDE: 1 } },
    ] },

  { id: 'Q13', type: 'choice', title: 'Le secret', kind: 'Dilemme',
    prompt: 'Tu découvres un secret qui sèmerait la panique s’il éclatait. Pourtant, les gens auraient le droit de savoir.',
    answers: [
      { t: 'Je révèle tout. La vérité appartient à tout le monde.', d: { ORD: -2, IDE: 2, COL: -1 } },
      { t: 'Je préviens les autorités et je les laisse gérer.', d: { ORD: 2, COL: 1 } },
      { t: 'Je garde le secret. Certaines vérités font plus de mal que de bien.', d: { IDE: -1, ORD: 1, ALT: 1 } },
      { t: 'Je le vends au plus offrant.', d: { ALT: -2, IDE: -2 } },
    ],
    quip: { D: 'Enfin quelqu’un de raisonnable.' } },

  { id: 'Q14', type: 'choice', title: 'La cause', kind: 'Valeurs',
    prompt: 'Jusqu’où irais-tu pour une cause en laquelle tu crois de tout ton être ?',
    answers: [
      { t: 'Jusqu’au bout. Donner ma vie, ou prendre celle des autres.', d: { COL: 2, IDE: 2, FOI: 1, FOR: 1 } },
      { t: 'Très loin, tant que je ne fais de mal à personne.', d: { IDE: 1, FOR: -1 } },
      { t: 'Je me méfie des causes : elles finissent toujours par dévorer leurs fidèles.', d: { IDE: -1, COL: -1, FOI: -1 } },
      { t: 'Nulle part. Aucune cause ne vaut ma peau.', d: { IDE: -2, COL: -2, ALT: -1 } },
    ],
    quip: { A: 'Hm. Toi, je vais te garder à l’œil.' } },

  { id: 'Q15', type: 'choice', title: 'Le remède', kind: 'Dilemme',
    prompt: 'Un scientifique veut tester un remède miracle sur des volontaires. Une chance sur dix d’y rester. Sans essai, des milliers de malades mourront.',
    answers: [
      { t: 'On teste tout de suite. Le progrès a toujours eu un prix.', d: { FOI: -1, IDE: -1, ZON: -1 } },
      { t: 'On teste, mais seulement après des années de précautions.', d: { FOI: -1, IDE: 1 } },
      { t: 'Je me porte volontaire.', d: { ALT: 2, COL: 1, IDE: 1, FOI: -1 } },
      { t: 'Non. On ne joue pas avec la vie.', d: { FOI: 1, IDE: 1, ZON: 1 } },
    ] },

  { id: 'Q16', type: 'scale', title: 'La main de fer', kind: 'Affirmation',
    prompt: 'Le monde irait mieux s’il était dirigé d’une main de fer.',
    v: { ORD: 2, FOR: 1 } },

  { id: 'Q17', type: 'choice', title: 'Le butin', kind: 'Situation',
    prompt: 'Ton groupe met la main sur un gros butin. Comment on partage ?',
    answers: [
      { t: 'À parts égales, chef compris.', d: { ALT: 1, ORD: -1, COL: 1 } },
      { t: 'Le chef décide. C’est son rôle.', d: { ORD: 2 } },
      { t: 'Selon ce que chacun a risqué. Contrat, c’est contrat.', d: { IDE: -1, ORD: 1, ALT: -1, COL: -1 } },
      { t: 'Je me sers en premier, avant que quelqu’un d’autre ne le fasse.', d: { ALT: -2, FOR: 1, ORD: -1 } },
    ] },

  { id: 'Q18', type: 'choice', title: 'La créature', kind: 'Dilemme',
    prompt: 'Une créature inconnue rôde près du village. Elle n’a encore attaqué personne.',
    answers: [
      { t: 'On l’abat avant qu’elle ne le fasse.', d: { FOR: 2, ZON: -2 } },
      { t: 'On la capture pour l’étudier.', d: { ZON: -1, FOI: -2 } },
      { t: 'On l’observe de loin et on la laisse vivre.', d: { ZON: 2, FOR: -1 } },
      { t: 'Je m’approche. Elle cherche peut-être à nous dire quelque chose.', d: { FOI: 2, ZON: 1 } },
    ],
    quip: { D: 'Si elle te répond, demande-lui où elle cache ses artefacts.' } },

  { id: 'Q19', type: 'choice', title: 'Les caméras', kind: 'Société',
    prompt: 'Pour en finir avec le crime, les autorités proposent de filmer chaque rue et chaque maison, jour et nuit.',
    answers: [
      { t: 'J’accepte. Qui n’a rien à se reprocher n’a rien à craindre.', d: { ORD: 2, IDE: -1 } },
      { t: 'Les rues, oui. Les maisons, non.', d: { ORD: 1 } },
      { t: 'Je refuse. La liberté vaut bien quelques risques.', d: { ORD: -2, IDE: 1, COL: -1 } },
      { t: 'Je refuse, et je casse les caméras.', d: { ORD: -2, FOR: 1 } },
    ] },

  { id: 'Q20', type: 'scale', title: 'L’étape suivante', kind: 'Affirmation',
    prompt: 'Ce qui nous effraie aujourd’hui pourrait être la prochaine étape de l’humanité.',
    v: { ZON: 2, IDE: 1, FOI: 1 } },

  { id: 'Q21', type: 'choice', title: 'Le repenti', kind: 'Dilemme',
    prompt: 'Un ancien membre d’une secte violente demande à rejoindre ton groupe. Sous l’emprise de son gourou, il a fait des choses terribles. Aujourd’hui, il dit avoir ouvert les yeux.',
    answers: [
      { t: 'Je l’accepte. Tout le monde mérite une seconde chance.', d: { ALT: 1, COL: 1, IDE: 1 } },
      { t: 'Je l’accepte, mais il devra faire ses preuves sur le terrain.', d: { COL: 1, FOR: 1, ORD: 1 } },
      { t: 'Je refuse. On ne change jamais vraiment.', d: { COL: -1, ALT: -1 } },
      { t: 'Je le livre à la justice. Il doit payer.', d: { ORD: 2, FOR: 1 } },
    ] },

  { id: 'Q22', type: 'choice', title: 'Le voleur du camp', kind: 'Situation',
    prompt: 'On a surpris quelqu’un en train de piller les réserves du camp.',
    answers: [
      { t: 'Une punition sévère, devant tout le monde. Pour l’exemple.', d: { ORD: 1, FOR: 2 } },
      { t: 'On le juge selon les règles du camp, ni plus ni moins.', d: { ORD: 2 } },
      { t: 'On cherche pourquoi il a volé. Si c’est la faim, on l’aide.', d: { ALT: 2, FOR: -1 } },
      { t: 'On le relâche. Qui sommes-nous pour juger ?', d: { ORD: -2, FOR: -1 } },
    ] },

  { id: 'Q23', type: 'scale', title: 'La preuve', kind: 'Affirmation',
    prompt: 'Ce qui ne peut pas être prouvé n’existe pas.',
    v: { FOI: -2, ZON: -1 } },

  { id: 'Q24', type: 'choice', title: 'Le vœu', kind: 'Valeurs',
    prompt: 'Dernière question. On raconte qu’au cœur de la Zone, une machine exauce un vœu. Un seul. Tu demandes quoi ?',
    answers: [
      { t: 'La paix et la liberté pour tout le monde.', d: { ALT: 2, ORD: -1, IDE: 1 } },
      { t: 'Que la Zone disparaisse à jamais.', d: { ZON: -2, IDE: 1, ALT: 1 } },
      { t: 'Comprendre. Tout comprendre.', d: { ZON: 1, FOI: -1, IDE: 1 } },
      { t: 'Être riche. Immensément riche.', d: { ALT: -2, IDE: -2, COL: -1 } },
    ],
    quip: { D: 'Tu iras loin… ou pas très loin.' } },
];
