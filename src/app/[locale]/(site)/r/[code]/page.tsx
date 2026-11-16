import type { Metadata } from "next";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";
import type { CSSProperties, ReactNode } from "react";
import { FactionEmblem } from "@/components/FactionEmblem";
import { RetakeLink } from "@/components/quiz/RetakeLink";
import { Radar } from "@/components/result/Radar";
import { ShareButtons } from "@/components/result/ShareButtons";
import { CENTERS_FILES, archetypeCode, isRetiredCode, resultFromCode } from "@/data/index";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { AXIS_KEYS, FACTION_KEYS } from "@/lib/quiz/domain";
import { axisTendency } from "@/lib/quiz/engine";
import { pageMetadata } from "@/lib/site";

// Page résultat [F-20…F-27], sur l'écran d'un PDA. Le résultat se recalcule à partir du code
// de l'URL : aucune base de données. Les 12 dossiers types sont pré-rendus ; tout autre code
// est rendu à sa première visite, puis servi depuis le cache comme une page statique [T-01].
export const ensureStatic = "navigation";

export function generateStaticParams() {
  return FACTION_KEYS.map((faction) => ({ code: archetypeCode(faction) }));
}

const percentOptions = { style: "percent", maximumFractionDigits: 0 } as const;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/r/[code]">): Promise<Metadata> {
  const { code } = await params;
  const t = await getTranslations();
  const format = await getFormatter();
  const decoded = resultFromCode(code);
  // Une infinité de combinaisons possibles : ces pages ne sont pas indexées.
  const base = {
    locale: (await getLocale()) as AppLocale,
    path: `/r/${code}`,
    siteName: t("metadata.title"),
    imageAlt: null,
    index: false,
  };
  if (!decoded.ok) {
    return pageMetadata({
      ...base,
      title: t("result.invalidTitle"),
      description: t("metadata.description"),
    });
  }

  const { top } = decoded.result;
  return pageMetadata({
    ...base,
    title: t("result.metaTitle", {
      faction: t(`factions.${top.faction}.name`),
      percent: format.number(top.compatibility / 100, percentOptions),
    }),
    description: t(`factions.${top.faction}.pitch`),
  });
}

/** Démarrage du PDA : chaque bloc s'allume un peu après le précédent [V-05] [V-06]. */
const boot = (step: number): { className: string; style: CSSProperties } => ({
  className:
    "animate-boot [animation-delay:var(--boot-delay)] motion-reduce:animate-fade-in motion-reduce:[animation-delay:0ms]",
  style: { "--boot-delay": `${step * 90}ms` } as CSSProperties,
});

const heading = "font-terminal text-xs font-semibold tracking-[0.2em] uppercase sm:text-[13px]";

export default async function ResultPage({ params }: PageProps<"/[locale]/r/[code]">) {
  const { code } = await params;
  const decoded = resultFromCode(code);
  if (!decoded.ok) return <InvalidResult retired={isRetiredCode(code)} />;

  const t = await getTranslations("result");
  const factions = await getTranslations("factions");
  const axes = await getTranslations("axes");
  const sidorovich = await getTranslations("sidorovich");
  const format = await getFormatter();

  const { result, questionnaire } = decoded;
  const { top, runnerUp, ranking, profile, isHybrid } = result;
  const center = CENTERS_FILES[questionnaire.version].centers[top.faction];
  const name = factions(`${top.faction}.name`);
  const percent = format.number(top.compatibility / 100, percentOptions);
  const signed = (value: number) =>
    format.number(Math.round(value * 100), { signDisplay: "exceptZero" });

  return (
    <Pda label={t("deviceLabel")}>
      <p
        {...boot(0)}
        className={`${boot(0).className} text-[11px] tracking-[0.1em] sm:text-[13px]`}
      >
        {"> "}
        {t.rich("kicker", {
          code,
          id: (chunks) => <span className="normal-case">{chunks}</span>,
        })}
      </p>

      <header
        style={boot(1).style}
        className={`${boot(1).className} flex items-center gap-4 sm:gap-9`}
      >
        <FactionEmblem faction={top.faction} label={name} className="size-21 shrink-0 sm:size-33" />
        <div className="min-w-0">
          <p className="text-[11px] tracking-[0.2em] text-amber-400/75 uppercase sm:text-[13px]">
            {t("verdictLabel")}
          </p>
          <h1 className="mt-1 text-[34px] leading-none font-semibold break-words sm:text-[56px]">
            {name}
          </h1>
          <p className="mt-2 text-base sm:text-xl">
            {t("compatibility", { percent })}
            {isHybrid && (
              <span className="text-amber-400/75">
                {" · "}
                {t("runnerUp", {
                  faction: factions(`${runnerUp.faction}.name`),
                  percent: format.number(runnerUp.compatibility / 100, percentOptions),
                })}
              </span>
            )}
          </p>
        </div>
      </header>

      <figure
        style={boot(2).style}
        className={`${boot(2).className} m-0 rounded border border-amber-400/40`}
      >
        <figcaption className="border-b border-amber-400/40 px-3 py-2 text-[11px] tracking-[0.18em] text-amber-400/75 uppercase sm:px-4 sm:text-xs">
          {t("messageTitle")}
        </figcaption>
        <blockquote className="space-y-2 px-3 py-3 text-[15px] leading-relaxed sm:px-4 sm:py-4 sm:text-[17px]">
          {isHybrid && (
            <p>
              {sidorovich("hybrid", {
                first: name,
                second: factions(`${runnerUp.faction}.name`),
              })}
            </p>
          )}
          <p>{factions(`${top.faction}.verdict`)}</p>
        </blockquote>
      </figure>

      <p
        style={boot(3).style}
        className={`${boot(3).className} max-w-4xl text-sm leading-relaxed text-amber-400/90 sm:text-base`}
      >
        {factions(`${top.faction}.description`)}
      </p>

      <div
        style={boot(4).style}
        className={`${boot(4).className} grid gap-x-12 gap-y-9 lg:grid-cols-2`}
      >
        <section className="flex flex-col gap-3">
          <h2 className={heading}>{t("radarTitle")}</h2>
          <Radar
            axes={AXIS_KEYS.map((axis) => axes(`${axis}.plus`))}
            series={[
              { label: name, values: center, tone: "faction" },
              { label: t("you"), values: profile, tone: "candidate" },
            ]}
            title={t("radarTitle")}
            description={t("radarHelp")}
          />
          <ul className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-amber-400/75 sm:text-[13px]">
            <li className="flex items-center gap-2">
              <span aria-hidden="true" className="inline-block h-[3px] w-5 bg-amber-400" />
              {t("you")}
            </li>
            <li className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="inline-block w-5 border-t-2 border-dashed border-amber-400/75"
              />
              {name}
            </li>
          </ul>
          <p className="text-xs leading-relaxed text-amber-400/75 sm:text-[13px]">
            {t("radarHelp")}
          </p>
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

        <section className="flex flex-col gap-3">
          <h2 className={heading}>{t("profileTitle")}</h2>
          <ul data-testid="profile" className="flex flex-col gap-3.5">
            {AXIS_KEYS.map((axis, i) => (
              <li key={axis}>
                <p
                  aria-hidden="true"
                  className="flex items-center gap-2.5 text-[10px] tracking-[0.12em] text-amber-400/75 uppercase sm:text-[11px]"
                >
                  <span>{axes(`${axis}.minus`)}</span>
                  <span className="relative h-0.5 max-w-36 min-w-12 flex-1 bg-amber-400/20">
                    <span
                      className="absolute -top-1 -ml-[5px] size-2.5 rounded-full bg-amber-400"
                      style={{ left: `${((profile[i] + 1) / 2) * 100}%` }}
                    />
                  </span>
                  <span>{axes(`${axis}.plus`)}</span>
                </p>
                <p className="mt-1 text-sm leading-relaxed text-amber-400/90 sm:text-[15px]">
                  {axes(`${axis}.tendencies.${axisTendency(profile[i])}`)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section style={boot(5).style} className={`${boot(5).className} flex flex-col gap-3`}>
        <h2 className={heading}>{t("rankingTitle", { count: ranking.length })}</h2>
        <ol
          data-testid="ranking"
          className="grid gap-x-12 gap-y-2 text-[13px] sm:text-[15px] lg:grid-flow-col lg:grid-cols-2 lg:grid-rows-6"
        >
          {ranking.map((entry, i) => {
            const isTop = entry.faction === top.faction;
            return (
              <li
                key={entry.faction}
                className="grid grid-cols-[1.5rem_minmax(0,1fr)_4.5rem_2.75rem] items-center gap-2 sm:grid-cols-[2rem_minmax(0,1fr)_8.75rem_3.25rem] sm:gap-3"
              >
                <span className="text-amber-400/75">{String(i + 1).padStart(2, "0")}</span>
                <span className={isTop ? "font-semibold" : undefined}>
                  {factions(`${entry.faction}.name`)}
                </span>
                <span aria-hidden="true" className="h-1.5 bg-amber-400/20 sm:h-2">
                  <span
                    className={`block h-full ${isTop ? "bg-amber-400" : "bg-amber-400/55"}`}
                    style={{ width: `${entry.compatibility}%` }}
                  />
                </span>
                <span className="text-right tabular-nums">
                  {format.number(entry.compatibility / 100, percentOptions)}
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      <nav
        aria-label={t("shareTitle")}
        style={boot(6).style}
        className={`${boot(6).className} grid grid-cols-2 gap-2 border-t border-amber-400/40 pt-5 sm:flex sm:flex-wrap sm:gap-3`}
      >
        <ShareButtons title={t("shareTitle")} text={t("shareText", { faction: name, percent })} />
        <RetakeLink className={pdaKey}>{t("retake")}</RetakeLink>
        <Link href="/factions" className={pdaKey}>
          {t("allFactions")}
        </Link>
      </nav>
    </Pda>
  );
}

/** Touche de PDA secondaire (les touches de partage ont leur propre style). */
const pdaKey =
  "inline-flex min-h-12 items-center justify-center rounded-sm border-2 border-amber-400/40 px-3 text-center font-terminal text-xs tracking-[0.08em] text-amber-400 uppercase hover:border-amber-400 sm:px-5 sm:text-sm";

/** Le PDA : une coque kaki et un écran à phosphore, posés sur le bureau. */
function Pda({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col bg-desk">
      <div className="mx-auto w-full max-w-6xl sm:px-8 sm:py-12">
        <div className="bg-pda-900 px-2 pb-2 shadow-[0_24px_60px_rgb(0_0_0/0.55)] sm:rounded-[30px] sm:border-2 sm:border-pda-700 sm:px-6 sm:pb-7">
          <p
            aria-hidden="true"
            className="flex items-center justify-between gap-4 px-3 py-2.5 font-terminal text-[10px] tracking-[0.25em] text-pda-300 uppercase sm:py-5 sm:text-[11px]"
          >
            <span className="flex items-center gap-2.5">
              <span className="hidden size-2.5 rounded-full bg-[#1b1c14] shadow-[inset_0_1px_2px_rgb(0_0_0/0.6)] sm:block" />
              {label}
            </span>
            <span className="hidden h-2.5 w-30 bg-[repeating-linear-gradient(90deg,#1b1c14_0_3px,transparent_3px_7px)] sm:block" />
          </p>
          <article className="flex flex-col gap-7 rounded-xl bg-scanlines px-4 py-6 font-terminal text-amber-400 shadow-[inset_0_0_60px_rgb(0_0_0/0.8)] sm:gap-9 sm:px-10 sm:py-9">
            {children}
          </article>
        </div>
      </div>
    </div>
  );
}

async function InvalidResult({ retired }: { retired: boolean }) {
  const t = await getTranslations("result");
  return (
    <Pda label={t("deviceLabel")}>
      <p className="text-[11px] tracking-[0.2em] uppercase sm:text-[13px]">
        {"> "}
        {t("invalidKicker")}
      </p>
      <h1 className="text-3xl font-semibold sm:text-4xl">
        {retired ? t("outdatedTitle") : t("invalidTitle")}
      </h1>
      <p className="max-w-2xl text-sm leading-relaxed text-amber-400/90 sm:text-base">
        {retired ? t("outdatedBody") : t("invalidBody")}
      </p>
      <div>
        <RetakeLink className={pdaKey}>{t("retake")}</RetakeLink>
      </div>
    </Pda>
  );
}
