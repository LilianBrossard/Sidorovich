"use client";

import { useTranslations } from "next-intl";
import { useState, useSyncExternalStore } from "react";

const subscribeNothing = () => () => {};
const hasNativeShare = () => typeof navigator.share === "function";

/** Partage natif quand le navigateur le propose, copie du lien dans tous les cas [F-27]. */
export function ShareButtons({ title, text }: { title: string; text: string }) {
  const t = useTranslations("share");
  const canShare = useSyncExternalStore(subscribeNothing, hasNativeShare, () => false);
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  };

  const share = async () => {
    try {
      await navigator.share({ title, text, url: window.location.href });
    } catch (error) {
      // Partage annulé par l'utilisateur : rien à faire. Autre échec : on copie le lien.
      if (!(error instanceof DOMException && error.name === "AbortError")) await copy();
    }
  };

  const button =
    "rounded-sm border px-4 py-2 font-terminal text-sm tracking-wider uppercase transition-colors";

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-3">
        {canShare && (
          <button
            type="button"
            onClick={share}
            className={`${button} border-amber-400 bg-amber-400 text-ink-900 hover:bg-amber-400/85`}
          >
            {t("share")}
          </button>
        )}
        <button
          type="button"
          onClick={copy}
          className={`${button} border-paper-500/60 text-paper-300 hover:border-paper-100 hover:text-paper-100`}
        >
          {t("copy")}
        </button>
      </div>
      <p role="status" className="min-h-5 text-sm text-paper-300">
        {status === "copied" && t("copied")}
        {status === "failed" && t("copyFailed")}
      </p>
    </div>
  );
}
