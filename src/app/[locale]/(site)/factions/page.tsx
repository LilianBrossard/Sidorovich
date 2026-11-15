import type { Metadata } from "next";
import { getFormatter, getTranslations } from "next-intl/server";
import { AxisBars } from "@/components/AxisBars";
import { FactionMark } from "@/components/FactionMark";
import { CENTERS_FILES, CURRENT_QUESTIONNAIRE, FACTIONS, archetypeCode } from "@/data/index";
import { Link } from "@/i18n/navigation";
import { AXIS_KEYS, FACTION_KEYS } from "@/lib/quiz/domain";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("factionsPage");
  return { title: t("metaTitle"), description: t("intro") };
}

/** Les 12 fiches : nom, emblème, idéologie, signature sur les axes [F-30]. */
export default async function FactionsPage() {
  const t = await getTranslations("factionsPage");
  const factions = await getTranslations("factions");
  const axes = await getTranslations("axes");
  const games = await getTranslations("games");
  const format = await getFormatter();
  const centers = CENTERS_FILES[CURRENT_QUESTIONNAIRE.version].centers;
  const axisLabels = AXIS_KEYS.map((axis) => ({
    minus: axes(`${axis}.minus`),
    plus: axes(`${axis}.plus`),
  }));

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <h1 className="font-typewriter text-3xl text-paper-100 sm:text-4xl">{t("title")}</h1>
        <p className="leading-relaxed text-paper-300">{t("intro")}</p>
      </header>

      <ul className="grid gap-6 sm:grid-cols-2">
        {FACTION_KEYS.map((faction) => {
          const name = factions(`${faction}.name`);
          const values = centers[faction];
          return (
            <li
              key={faction}
              className="flex flex-col gap-4 rounded-sm border border-bunker-700 bg-bunker-900 p-5"
            >
              <article className="flex flex-1 flex-col gap-4">
                <header className="flex items-center gap-4">
                  <FactionMark name={name} />
                  <div>
                    <h2 className="font-typewriter text-xl text-paper-100">{name}</h2>
                    <p className="text-xs text-paper-500">
                      {t("games", {
                        games: format.list(
                          FACTIONS[faction].games.map((game) => games(game)),
                          { type: "conjunction" },
                        ),
                      })}
                    </p>
                  </div>
                </header>
                <p className="text-sm leading-relaxed text-paper-300">
                  {factions(`${faction}.pitch`)}
                </p>
                <div className="mt-auto space-y-2">
                  <h3 className="font-terminal text-xs tracking-wider text-paper-500 uppercase">
                    {t("signature")}
                  </h3>
                  <AxisBars
                    axes={axisLabels}
                    values={values}
                    describe={(i) =>
                      t("axisValue", {
                        minus: axisLabels[i].minus,
                        plus: axisLabels[i].plus,
                        value: format.number(Math.round(values[i] * 100), {
                          signDisplay: "exceptZero",
                        }),
                      })
                    }
                  />
                </div>
                <Link
                  href={`/r/${archetypeCode(faction)}`}
                  className="text-sm text-amber-400 underline underline-offset-4"
                >
                  {t("archetype", { faction: name })}
                </Link>
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
