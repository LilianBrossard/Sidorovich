import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    // Les simulations d'équilibrage prennent quelques secondes.
    testTimeout: 60_000,
    hookTimeout: 60_000,
    coverage: {
      provider: "v8",
      include: ["src/lib/quiz/**", "src/data/**"],
      reporter: ["text", "text-summary"],
      // [S-01] : au moins 90 % des lignes du moteur couvertes.
      thresholds: { lines: 90, statements: 90, functions: 90, branches: 85 },
    },
  },
});
