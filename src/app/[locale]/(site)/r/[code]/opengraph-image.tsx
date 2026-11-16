import { hasLocale } from "next-intl";
import { getFormatter, getTranslations } from "next-intl/server";
import { ImageResponse } from "next/og";
import { CENTERS_FILES, resultFromCode } from "@/data/index";
import { routing } from "@/i18n/routing";
import { DefaultCard, VerdictCard } from "@/lib/og/cards";
import { OG_FONTS, OG_SIZE } from "@/lib/og/fonts";

// Image d'aperçu d'un résultat, par langue [F-28] : emblème, faction, % et mini-radar.
// Un code invalide reçoit l'image par défaut.

type Params = { locale: string; code: string };

const localeOf = (value: string) =>
  hasLocale(routing.locales, value) ? value : routing.defaultLocale;
const percentOptions = { style: "percent", maximumFractionDigits: 0 } as const;

export async function generateImageMetadata({ params }: { params: Params }) {
  const locale = localeOf(params.locale);
  const t = await getTranslations({ locale });
  const format = await getFormatter({ locale });
  const decoded = resultFromCode(params.code);
  const alt = decoded.ok
    ? t("og.verdictAlt", {
        faction: t(`factions.${decoded.result.top.faction}.name`),
        percent: format.number(decoded.result.top.compatibility / 100, percentOptions),
      })
    : t("og.defaultAlt");
  return [{ id: "verdict", alt, size: OG_SIZE, contentType: "image/png" }];
}

export default async function Image({ params }: { params: Promise<Params> }) {
  const { locale: raw, code } = await params;
  const locale = localeOf(raw);
  const t = await getTranslations({ locale });
  const format = await getFormatter({ locale });
  const decoded = resultFromCode(code);

  if (!decoded.ok) {
    return new ImageResponse(
      <DefaultCard
        kicker={t("home.kicker")}
        title={t("metadata.title")}
        tagline={t("home.tagline")}
      />,
      { ...OG_SIZE, fonts: OG_FONTS },
    );
  }

  const { top, profile } = decoded.result;
  return new ImageResponse(
    <VerdictCard
      kicker={t.markup("result.kicker", { code, id: (chunks) => chunks })}
      faction={top.faction}
      label={t("result.verdictLabel")}
      name={t(`factions.${top.faction}.name`)}
      compatibility={t("result.compatibility", {
        percent: format.number(top.compatibility / 100, percentOptions),
      })}
      siteName={t("metadata.title")}
      cta={t("og.cta")}
      profile={profile}
      center={CENTERS_FILES[decoded.questionnaire.version].centers[top.faction]}
    />,
    { ...OG_SIZE, fonts: OG_FONTS },
  );
}
