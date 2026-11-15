import type { Metadata } from "next";
import { getFormatter, getTranslations } from "next-intl/server";
import { FactionMark } from "@/components/FactionMark";
import { RetakeLink } from "@/components/quiz/RetakeLink";
import { Radar } from "@/components/result/Radar";
import { ShareButtons } from "@/components/result/ShareButtons";
import { SidorovichQuote } from "@/components/SidorovichQuote";
import { CENTERS_FILES, archetypeCode, isRetiredCode, resultFromCode } from "@/data/index";
import { Link } from "@/i18n/navigation";
import { AXIS_KEYS, FACTION_KEYS } from "@/lib/quiz/domain";
import { axisTendency } from "@/lib/quiz/engine";

// Page résultat [F-20…F-27]. Le résultat se recalcule à partir du code de l'URL : aucune base
// de données. Les 12 dossiers types sont pré-rendus ; tout autre code est rendu à sa première
// visite, puis servi depuis le cache comme une page statique [T-01].
export const ensureStatic = "navigation";

export function generateStaticParams() {
  return FACTION_KEYS.map((faction) => ({ code: archetypeCode(faction) }));
}

const percentOptions = { style: "percent", maximumFractionDigits: 0 } as const;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/r/[code]">): Promise<Metadata> {
  const { code } = await params;
  const t = await getTranslations("result");
  const factions = await getTranslations("factions");
  const format = await getFormatter();
  const decoded = resultFromCode(code);
  // Une infinité de combinaisons possibles : ces pages ne sont pas indexées.
  const robots = { index: false, follow: true };
  if (!decoded.ok) return { title: t("invalidTitle"), robots };

  const { top } = decoded.result;
  return {
    title: t("metaTitle", {
      faction: factions(`${top.faction}.name`),
      percent: format.number(top.compatibility / 100, percentOptions),
    }),
    description: factions(`${top.faction}.pitch`),
    robots,
  };
}

export default async function ResultPage({ params }: PageProps<"/[locale]/r/[code]">) {
  const { code } = await params;
  const decoded = resultFromCode(code);
  if (!decoded.ok) return <InvalidResult retired={isRetiredCode(code)} />;

  const t = await getTranslations("result");
  const factions = await getTranslations("factions");
  const axes = await getTranslations("axes");
  const sidorovich = await getTranslations("sidorovich");
  const common = await getTranslations("common");
  const format = await getFormatter();

  const { result, questionnaire } = decoded;
  const { top, runnerUp, ranking, profile, isHybrid } = result;
  const center = CENTERS_FILES[questionnaire.version].centers[top.faction];
  const name = factions(`${top.faction}.name`);
  const percent = format.number(top.compatibility / 100, percentOptions);
  const signed = (value: number) =>
    format.number(Math.round(value * 100), { signDisplay: "exceptZero" });

  return (
    <article className="space-y-12">
      <header className="space-y-6">
        <p className="font-terminal text-xs tracking-[0.25em] text-amber-400 uppercase">
          {t.rich("kicker", {
            code,
            id: (chunks) => <span className="tracking-wider normal-case">{chunks}</span>,
          })}
        </p>
        <div className="flex items-center gap-4 sm:gap-5">
          <FactionMark name={name} size="lg" />
          <div className="min-w-0">
            <p className="font-terminal text-xs tracking-wider text-paper-500 uppercase">
              {t("verdictLabel")}
            </p>
            <h1 className="font-typewriter text-3xl break-words text-paper-100 sm:text-5xl">
              {name}
            </h1>
            <p className="mt-1 text-lg text-amber-400">{t("compatibility", { percent })}</p>
          </div>
        </div>
        <SidorovichQuote speaker={common("speaker")}>
          {isHybrid && (
            <p>
              {sidorovich("hybrid", {
                first: name,
                second: factions(`${runnerUp.faction}.name`),
              })}
            </p>
          )}
          <p>{factions(`${top.faction}.verdict`)}</p>
        </SidorovichQuote>
        <p className="leading-relaxed text-paper-300">{factions(`${top.faction}.description`)}</p>
      </header>

      <section className="space-y-4">
        <h2 className="font-typewriter text-2xl text-paper-100">{t("radarTitle")}</h2>
        <ul className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-paper-300">
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="inline-block h-0.5 w-6 bg-amber-400" />
            {t("you")}
          </li>
          <li className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-block w-6 border-t-2 border-dashed border-paper-300"
            />
            {name}
          </li>
        </ul>
        <Radar
          axes={AXIS_KEYS.map((axis) => axes(`${axis}.plus`))}
          series={[
            { label: name, values: center, tone: "faction" },
            { label: t("you"), values: profile, tone: "candidate" },
          ]}
          title={t("radarTitle")}
          description={t("radarHelp")}
        />
        <p className="text-sm text-paper-500">{t("radarHelp")}</p>
        <div className="sr-only">
          <table>
            <caption>{t("radarTable")}</caption>
            <thead>
              <tr>
                <th scope="col">{t("axis")}</th>
                <th scope="col">{t("you")}</th>
                <th scope="col">{name}</th>
              </tr>
            </thead>
            <tbody>
              {AXIS_KEYS.map((axis, i) => (
                <tr key={axis}>
                  <th scope="row">
                    {axes(`${axis}.plus`)} / {axes(`${axis}.minus`)}
                  </th>
                  <td>{signed(profile[i])}</td>
                  <td>{signed(center[i])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-typewriter text-2xl text-paper-100">{t("profileTitle")}</h2>
        <ul data-testid="profile" className="space-y-4">
          {AXIS_KEYS.map((axis, i) => (
            <li key={axis}>
              <p className="font-terminal text-xs tracking-wider text-paper-500 uppercase">
                {axes(`${axis}.minus`)} ↔ {axes(`${axis}.plus`)}
              </p>
              <p className="mt-1 text-paper-300">
                {axes(`${axis}.tendencies.${axisTendency(profile[i])}`)}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-typewriter text-2xl text-paper-100">
          {t("rankingTitle", { count: ranking.length })}
        </h2>
        <ol data-testid="ranking" className="space-y-2">
          {ranking.map((entry, i) => {
            const value = format.number(entry.compatibility / 100, percentOptions);
            const isTop = entry.faction === top.faction;
            return (
              <li key={entry.faction} className="grid grid-cols-[2rem_1fr_auto] items-center gap-3">
                <span className="font-terminal text-xs text-paper-500">{i + 1}</span>
                <div>
                  <p className={isTop ? "text-amber-400" : "text-paper-300"}>
                    {factions(`${entry.faction}.name`)}
                  </p>
                  <div aria-hidden="true" className="mt-1 h-1 rounded-full bg-bunker-700">
                    <div
                      className={`h-full rounded-full ${isTop ? "bg-amber-400" : "bg-paper-500"}`}
                      style={{ width: `${entry.compatibility}%` }}
                    />
                  </div>
                </div>
                <span className="font-terminal text-sm text-paper-300 tabular-nums">{value}</span>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="space-y-4">
        <h2 className="font-typewriter text-2xl text-paper-100">{t("shareTitle")}</h2>
        <ShareButtons title={t("shareTitle")} text={t("shareText", { faction: name, percent })} />
        <p className="flex flex-wrap gap-x-6 gap-y-2">
          <RetakeLink className="text-amber-400 underline underline-offset-4">
            {t("retake")}
          </RetakeLink>
          <Link href="/factions" className="text-paper-300 underline underline-offset-4">
            {t("allFactions")}
          </Link>
        </p>
      </section>
    </article>
  );
}

async function InvalidResult({ retired }: { retired: boolean }) {
  const t = await getTranslations("result");
  return (
    <section className="space-y-6">
      <p className="font-terminal text-xs tracking-[0.25em] text-amber-400 uppercase">
        {t("invalidKicker")}
      </p>
      <h1 className="font-typewriter text-3xl text-paper-100 sm:text-4xl">
        {retired ? t("outdatedTitle") : t("invalidTitle")}
      </h1>
      <p className="text-paper-300">{retired ? t("outdatedBody") : t("invalidBody")}</p>
      <RetakeLink className="inline-block text-amber-400 underline underline-offset-4">
        {t("retake")}
      </RetakeLink>
    </section>
  );
}
