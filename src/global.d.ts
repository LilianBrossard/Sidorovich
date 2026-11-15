import type { routing } from "@/i18n/routing";
import type messages from "@/messages/fr.json";

// Le français est la langue source : ses clés servent de référence de typage.
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
