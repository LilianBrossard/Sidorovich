"use client";

import { useTranslations } from "next-intl";
import { useState, useSyncExternalStore } from "react";

const subscribeNothing = () => () => {};
const hasNativeShare = () => typeof navigator.share === "function";

const key =
  "inline-flex min-h-12 items-center justify-center rounded-sm border-2 border-amber-400 px-3 font-terminal text-xs tracking-[0.08em] uppercase sm:px-5 sm:text-sm";

/**
 * Partage natif quand le navigateur le propose, copie du lien dans tous les cas [F-27].
 * Rendu en fragment : les touches se rangent dans la barre d'actions du PDA.
 */
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

  return (
    <>
      {canShare && (
        <button
          type="button"
          onClick={share}
          className={`${key} bg-amber-400 font-semibold text-screen-950 hover:bg-amber-400/85`}
        >
          {t("share")}
        </button>
      )}
      <button
        type="button"
        onClick={copy}
        className={`${key} ${canShare ? "text-amber-400 hover:bg-amber-400/10" : "col-span-2 bg-amber-400 font-semibold text-screen-950 hover:bg-amber-400/85"}`}
      >
        {t("copy")}
      </button>
      <p role="status" className="order-last col-span-2 min-h-5 basis-full text-sm">
        {status === "copied" && t("copied")}
        {status === "failed" && t("copyFailed")}
      </p>
    </>
  );
}
