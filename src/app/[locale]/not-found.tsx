import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/** 404 dans la langue de la page [F-33]. */
export default function LocaleNotFound() {
  const t = useTranslations("notFound");

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-16">
      <p className="font-terminal text-xs tracking-[0.25em] text-amber-400 uppercase">404</p>
      <h1 className="mt-3 font-typewriter text-3xl sm:text-5xl">{t("title")}</h1>
      <p className="mt-4 text-paper-300">{t("body")}</p>
      <p className="mt-8">
        <Link href="/" className="text-amber-400 underline underline-offset-4">
          {t("back")}
        </Link>
      </p>
    </main>
  );
}
