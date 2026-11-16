import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { ImageResponse } from "next/og";
import { routing } from "@/i18n/routing";
import { DefaultCard } from "@/lib/og/cards";
import { OG_FONTS, OG_SIZE } from "@/lib/og/fonts";

// Image d'aperçu par défaut, une par langue [F-28] : reprise par toutes les pages,
// sauf les résultats qui ont la leur.

const localeOf = (value: string) =>
  hasLocale(routing.locales, value) ? value : routing.defaultLocale;

export async function generateImageMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: localeOf(params.locale), namespace: "og" });
  return [{ id: "default", alt: t("defaultAlt"), size: OG_SIZE, contentType: "image/png" }];
}

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const locale = localeOf((await params).locale);
  const t = await getTranslations({ locale });
  return new ImageResponse(
    <DefaultCard
      kicker={t("home.kicker")}
      title={t("metadata.title")}
      tagline={t("home.tagline")}
    />,
    { ...OG_SIZE, fonts: OG_FONTS },
  );
}
