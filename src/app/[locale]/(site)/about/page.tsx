import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

const REPOSITORY_URL = "https://github.com/LilianBrossard/Sidorovich";
const LICENSE_URL = `${REPOSITORY_URL}/blob/main/LICENSE`;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("about");
  return { title: t("metaTitle") };
}

/** Mentions légales, données personnelles, crédits, licence et avertissement fan [F-32]. */
export default async function AboutPage() {
  const t = await getTranslations("about");
  const common = await getTranslations("common");

  const sections = [
    { id: "project", title: t("project.title"), lines: [t("project.body")] },
    {
      id: "legal",
      title: t("legal.title"),
      lines: [t("legal.publisher"), t("legal.contact"), t("legal.host")],
    },
    { id: "privacy", title: t("privacy.title"), lines: [t("privacy.body")] },
    {
      id: "credits",
      title: t("credits.title"),
      lines: [t("credits.fonts"), t("credits.code"), t("credits.images")],
    },
    { id: "fan", title: t("fan.title"), lines: [common("disclaimer"), t("fan.body")] },
  ];

  return (
    <article className="space-y-10 leading-relaxed">
      <h1 className="font-typewriter text-3xl text-paper-100 sm:text-4xl">{t("title")}</h1>
      {sections.map(({ id, title, lines }) => (
        <section key={id} className="space-y-2">
          <h2 className="font-typewriter text-2xl text-paper-100">{title}</h2>
          {lines.map((line) => (
            <p key={line} className="text-paper-300">
              {line}
            </p>
          ))}
        </section>
      ))}
      <section className="space-y-2">
        <h2 className="font-typewriter text-2xl text-paper-100">{t("license.title")}</h2>
        <p className="text-paper-300">{t("license.body")}</p>
        <p className="flex flex-wrap gap-x-6 gap-y-2">
          <a
            href={LICENSE_URL}
            className="text-amber-400 underline underline-offset-4"
            rel="noopener"
          >
            {t("license.link")}
          </a>
          <a
            href={REPOSITORY_URL}
            className="text-amber-400 underline underline-offset-4"
            rel="noopener"
          >
            {common("sourceCode")}
          </a>
        </p>
      </section>
    </article>
  );
}
