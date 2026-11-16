import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider, type Messages } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { fontVariables } from "@/lib/fonts";
import { SITE_URL } from "@/lib/site";
import "../globals.css";

// Les 4 langues sont pré-rendues. Une langue inconnue (ex. /fichier.txt, qui ne passe pas
// par le proxy) est rejetée par (site)/layout.tsx, sous ce layout, pour afficher la 404 du site.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return {
    metadataBase: SITE_URL,
    applicationName: t("title"),
    title: { default: t("title"), template: `%s · ${t("title")}` },
    description: t("description"),
  };
}

export const viewport: Viewport = { themeColor: "#0d0d0b", colorScheme: "dark" };

/**
 * Seuls ces espaces de noms partent dans le navigateur : les composants client n'utilisent
 * qu'eux. Les textes du questionnaire passent en props, depuis la page /quiz.
 */
const CLIENT_NAMESPACES = ["common", "nav", "quiz", "resume", "share"] as const;

export default async function LocaleLayout({ children }: LayoutProps<"/[locale]">) {
  const locale = await getLocale();
  const messages = await getMessages();
  const clientMessages = Object.fromEntries(
    CLIENT_NAMESPACES.map((namespace) => [namespace, messages[namespace]]),
  ) as Pick<Messages, (typeof CLIENT_NAMESPACES)[number]>;

  return (
    <html lang={locale} className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <NextIntlClientProvider messages={clientMessages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
