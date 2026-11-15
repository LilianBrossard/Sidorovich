/** Générateur pseudo-aléatoire déterministe : mêmes chiffres à chaque exécution [S-03]. */
export interface Rng {
  /** Nombre uniforme dans [0, 1). */
  next(): number;
  /** Nombre suivant une loi normale centrée réduite (Box-Muller). */
  gaussian(): number;
}

/** Générateur congruentiel linéaire (constantes de Numerical Recipes). */
export function createRng(seed: number): Rng {
  let state = seed >>> 0;
  const next = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  return {
    next,
    gaussian: () => Math.sqrt(-2 * Math.log(next() + 1e-12)) * Math.cos(2 * Math.PI * next()),
  };
}
