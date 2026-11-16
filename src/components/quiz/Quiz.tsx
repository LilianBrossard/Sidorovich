"use client";

import { useTranslations } from "next-intl";
import { useEffect, useEffectEvent, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { SidorovichLine } from "@/components/SidorovichLine";
import { Link, useRouter } from "@/i18n/navigation";
import { encodeAnswers } from "@/lib/quiz/encoding";
import { answerOrders, completedAnswers, type QuizSession } from "@/lib/quiz/session";
import type { QuizCopy } from "./copy";
import {
  isPersistent,
  sessionQuestionnaire as questionnaire,
  useQuizSession,
} from "./sessionStore";

const total = questionnaire.questions.length;
/** Sidorovich commente la mi-parcours en arrivant sur cette question (la 13e). */
const HALFWAY = Math.floor(total / 2);

const resultHref = (answers: readonly number[]) => `/r/${encodeAnswers(questionnaire, answers)}`;

/** Vrai si plus rien n'a le focus : l'élément qui l'avait vient de disparaître. */
const focusIsLost = () =>
  document.activeElement === null || document.activeElement === document.body;

// Boutons à l'encre, sur le papier du dossier.
const buttonClass =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-[2px] border-[1.5px] border-ink-900 px-4 font-terminal text-xs tracking-[0.1em] uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-40 sm:text-[13px]";
const primaryButton = `${buttonClass} bg-ink-900 text-paper-100 enabled:hover:bg-ink-600 [&:not(button)]:hover:bg-ink-600`;
const secondaryButton = `${buttonClass} text-ink-900 enabled:hover:bg-paper-200`;

/** Le questionnaire complet, de l'accueil de Sidorovich au dossier complet. */
export function Quiz({ copy }: { copy: QuizCopy }) {
  const t = useTranslations("quiz");
  const { session, start, dispatch, clear } = useQuizSession();
  const [restarted, setRestarted] = useState(false);
  // Identifiants uniques : Next.js peut garder une autre instance de la page, masquée.
  const titleId = useId();

  const restart = () => {
    clear();
    setRestarted(true);
  };

  if (session === null) {
    return (
      <Desk
        note={
          <SidorovichLine
            text={restarted ? copy.lines.restart : copy.lines.welcome}
            speaker={copy.speaker}
            skipLabel={t("skip")}
          />
        }
      >
        <Sheet labelledBy={titleId} sheetKey="start">
          <FileHeader>{t("fileTitle")}</FileHeader>
          <h1 id={titleId} className="mt-8 font-typewriter text-3xl leading-tight sm:text-[40px]">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed">{t("rules", { total })}</p>
          <button
            data-testid="quiz-start"
            type="button"
            onClick={start}
            className={`${primaryButton} mt-8 w-full sm:w-auto`}
            autoFocus={restarted}
          >
            {t("start")}
          </button>
        </Sheet>
      </Desk>
    );
  }

  const answers = completedAnswers(questionnaire, session);
  if (answers) {
    return (
      <CompletedScreen
        copy={copy}
        session={session}
        href={resultHref(answers)}
        onReview={() => dispatch({ type: "back" })}
        onRestart={restart}
      />
    );
  }

  return <QuestionScreen copy={copy} session={session} dispatch={dispatch} onRestart={restart} />;
}

/** Le bureau : le feuillet, et à côté (au-dessus sur mobile) la note de Sidorovich. */
function Desk({
  note,
  aside,
  children,
}: {
  note?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_17.5rem] lg:gap-10">
      <div className="min-w-0 lg:col-start-1 lg:row-start-1">{children}</div>
      {(note || aside) && (
        <aside className="order-first flex flex-col gap-8 px-2 lg:order-none lg:col-start-2 lg:row-start-1 lg:px-0 lg:pt-6">
          <div aria-live="polite">{note}</div>
          {aside}
        </aside>
      )}
    </div>
  );
}

/** Un feuillet du dossier, posé sur un second feuillet ; il glisse à chaque question. */
function Sheet({
  labelledBy,
  sheetKey,
  children,
}: {
  labelledBy: string;
  sheetKey: string | number;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="absolute inset-0 translate-x-2 translate-y-2.5 rotate-[1.2deg] bg-paper-300 shadow-[0_12px_30px_rgb(0_0_0/0.45)]"
      />
      <section
        key={sheetKey}
        aria-labelledby={labelledBy}
        className="surface-paper relative animate-sheet-in bg-ruled px-5 pt-6 pb-6 text-ink-900 shadow-[0_14px_34px_rgb(0_0_0/0.5)] motion-reduce:animate-fade-in sm:px-14 sm:pt-11 sm:pb-10"
      >
        {children}
      </section>
    </div>
  );
}

function FileHeader({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <p className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 font-terminal text-[11px] tracking-[0.18em] text-ink-600 uppercase sm:text-xs">
      <span>{children}</span>
      {aside}
    </p>
  );
}

interface QuestionScreenProps {
  readonly copy: QuizCopy;
  readonly session: QuizSession;
  readonly dispatch: ReturnType<typeof useQuizSession>["dispatch"];
  readonly onRestart: () => void;
}

function QuestionScreen({ copy, session, dispatch, onRestart }: QuestionScreenProps) {
  const t = useTranslations("quiz");
  const router = useRouter();
  const id = useId();
  const titleId = `${id}-title`;
  const promptId = `${id}-prompt`;
  const hintId = `${id}-hint`;
  const { current } = session;
  const question = copy.questions[current];
  const orders = useMemo(() => answerOrders(questionnaire, session.seed), [session.seed]);
  const order = orders[current];
  const selected = session.answers[current];
  const answered = session.answers.filter((a) => a !== null).length;

  // Réaction à la réponse précédente, sinon commentaire de mi-parcours.
  const previous = current > 0 ? session.answers[current - 1] : null;
  const quip = previous === null ? null : copy.questions[current - 1].quips[previous];
  const line = quip ?? (current === HALFWAY ? copy.lines.halfway : null);

  const answer = (option: number) => {
    const next = dispatch({ type: "answer", option });
    const done = next && completedAnswers(questionnaire, next);
    if (done) router.push(resultHref(done));
  };

  // Après chaque changement de question, le focus revient sur l'intitulé [F-15]. À l'arrivée
  // sur l'écran, seulement si le bouton cliqué a disparu (« Je m'assois », « Revoir… »).
  const heading = useRef<HTMLHeadingElement>(null);
  const shownQuestion = useRef<number | null>(null);
  useEffect(() => {
    if (shownQuestion.current === current) return;
    const arriving = shownQuestion.current === null;
    shownQuestion.current = current;
    if (!arriving || focusIsLost()) heading.current?.focus();
  }, [current]);

  // Raccourcis clavier : 1 à 4 (ou 5), flèches, Retour arrière [F-15].
  const list = useRef<HTMLOListElement>(null);
  const onKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.defaultPrevented) return;
    const target = event.target;
    if (target instanceof Element && target.closest("input, textarea, select, [contenteditable]")) {
      return;
    }

    const digit = Number.parseInt(event.key, 10);
    if (digit >= 1 && digit <= order.length) {
      event.preventDefault();
      answer(order[digit - 1]);
    } else if (event.key === "ArrowLeft" || event.key === "Backspace") {
      event.preventDefault();
      dispatch({ type: "back" });
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      dispatch({ type: "forward" });
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      // Flèches haut et bas : on passe d'une réponse à l'autre.
      const buttons = [...(list.current?.querySelectorAll("button") ?? [])];
      event.preventDefault();
      const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
      const step = event.key === "ArrowDown" ? 1 : -1;
      const next = index === -1 ? (step === 1 ? 0 : buttons.length - 1) : index + step;
      buttons[(next + buttons.length) % buttons.length]?.focus();
    }
  });
  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const note = line ? (
    <SidorovichLine
      key={`${current}-${line}`}
      text={line}
      speaker={copy.speaker}
      skipLabel={t("skip")}
    />
  ) : null;

  const keyboard = (
    <section
      aria-label={t("keyboardTitle")}
      className="hidden rounded-sm border border-bunker-700 bg-bunker-950 px-5 py-4 font-terminal text-[13px] leading-relaxed text-paper-300 lg:block"
    >
      <p className="mb-2 text-[11px] tracking-[0.2em] text-paper-500 uppercase">
        {t("keyboardTitle")}
      </p>
      <p id={hintId}>{t("keyboardHint", { count: order.length })}</p>
    </section>
  );

  return (
    <Desk note={note} aside={keyboard}>
      <Sheet labelledBy={titleId} sheetKey={current}>
        <span
          aria-hidden="true"
          className="absolute top-8 right-10 hidden rotate-6 border-[3px] border-rust-500 px-3.5 py-1.5 font-terminal text-sm font-semibold tracking-[0.2em] text-rust-500 uppercase opacity-55 sm:block"
        >
          {t("confidential")}
        </span>

        <FileHeader>
          <span className="hidden sm:inline">{t("fileTitle")} · </span>
          {t("progress", { current: current + 1, total })}
        </FileHeader>
        <div
          role="progressbar"
          aria-label={t("progressLabel")}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={answered}
          aria-valuetext={t("progressValue", { answered, total })}
          className="mt-3 grid max-w-lg grid-cols-12 gap-[5px] sm:grid-cols-24 sm:pr-0"
        >
          {session.answers.map((value, index) => (
            <span
              key={index}
              aria-hidden="true"
              className={`aspect-square border-[1.5px] ${
                index === current
                  ? "border-rust-600 shadow-[0_0_0_2px_var(--color-paper-100),0_0_0_3.5px_var(--color-rust-600)]"
                  : value !== null
                    ? "border-ink-900 bg-ink-900"
                    : "border-ink-600"
              }`}
            />
          ))}
        </div>

        <p className="mt-8 font-terminal text-xs font-semibold tracking-[0.2em] text-rust-600 uppercase sm:mt-10 sm:text-[13px]">
          {question.kind}
        </p>
        <h1
          id={titleId}
          data-testid="question-title"
          ref={heading}
          tabIndex={-1}
          className="mt-2 font-typewriter text-[28px] leading-tight outline-none sm:text-[40px]"
        >
          {question.title}
        </h1>
        <p id={promptId} className="mt-3 max-w-2xl text-lg leading-relaxed sm:mt-4 sm:text-[21px]">
          {question.prompt}
        </p>

        <ol
          ref={list}
          aria-labelledby={titleId}
          aria-describedby={`${promptId} ${hintId}`}
          className="mt-6 space-y-2.5 sm:mt-8"
        >
          {order.map((option, position) => {
            const isSelected = selected === option;
            return (
              <li key={option}>
                <button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => answer(option)}
                  className={`flex min-h-12 w-full items-start gap-3 rounded-[2px] px-3 py-3 text-left text-base leading-snug transition-colors sm:gap-4 sm:px-4 sm:py-3.5 sm:text-lg ${
                    isSelected
                      ? "border-2 border-ink-900 bg-paper-200 font-bold"
                      : "border-[1.5px] border-ink-900/35 bg-white/25 hover:border-ink-900 hover:bg-paper-200/60"
                  }`}
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="mt-0.5 size-5 shrink-0 sm:size-6"
                  >
                    <rect
                      x="2"
                      y="2"
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    {isSelected && (
                      <path
                        d="M5 5 L19 19 M19 5 L5 19"
                        stroke="currentColor"
                        strokeWidth="2.6"
                        strokeLinecap="round"
                      />
                    )}
                  </svg>
                  <span className="flex-1">{question.options[option]}</span>
                  <kbd
                    aria-hidden="true"
                    className="mt-1 hidden font-terminal text-xs font-normal text-ink-600 sm:block"
                  >
                    {position + 1}
                  </kbd>
                </button>
              </li>
            );
          })}
        </ol>

        <nav
          aria-label={t("navigationLabel")}
          className="mt-6 grid grid-cols-2 gap-2.5 border-t-[1.5px] border-dashed border-ink-900/35 pt-5 sm:mt-8 sm:flex sm:flex-wrap sm:items-center sm:gap-3"
        >
          <button
            data-testid="quiz-back"
            type="button"
            onClick={() => dispatch({ type: "back" })}
            disabled={current === 0}
            className={secondaryButton}
          >
            ← <span className="sm:hidden">{t("backShort")}</span>
            <span className="hidden sm:inline">{t("back")}</span>
          </button>
          <button
            data-testid="quiz-next"
            type="button"
            onClick={() => dispatch({ type: "forward" })}
            disabled={selected === null}
            className={primaryButton}
          >
            <span className="sm:hidden">{t("nextShort")}</span>
            <span className="hidden sm:inline">{t("next")}</span> →
          </button>
          <RestartButton onRestart={onRestart} />
        </nav>

        <StorageWarning />
      </Sheet>
    </Desk>
  );
}

function CompletedScreen({
  copy,
  session,
  href,
  onReview,
  onRestart,
}: {
  readonly copy: QuizCopy;
  readonly session: QuizSession;
  readonly href: string;
  readonly onReview: () => void;
  readonly onRestart: () => void;
}) {
  const t = useTranslations("quiz");
  const titleId = useId();
  const last = session.answers[total - 1];
  const quip = last === null ? null : copy.questions[total - 1].quips[last];
  const line = quip ? `${quip} ${copy.lines.computing}` : copy.lines.computing;

  return (
    <Desk note={<SidorovichLine text={line} speaker={copy.speaker} skipLabel={t("skip")} />}>
      <Sheet labelledBy={titleId} sheetKey="done">
        <FileHeader>{t("fileTitle")}</FileHeader>
        <h1 id={titleId} className="mt-10 inline-block">
          <span className="inline-block -rotate-6 animate-stamp border-4 border-rust-600 px-5 py-2 font-terminal text-2xl font-semibold tracking-[0.18em] text-rust-600 uppercase motion-reduce:animate-fade-in sm:text-3xl">
            {t("doneTitle")}
          </span>
        </h1>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Link data-testid="quiz-verdict" href={href} prefetch className={primaryButton}>
            {t("seeVerdict")}
          </Link>
          <button
            data-testid="quiz-review"
            type="button"
            onClick={onReview}
            className={secondaryButton}
          >
            {t("review")}
          </button>
          <RestartButton onRestart={onRestart} />
        </div>
      </Sheet>
    </Desk>
  );
}

/** « Recommencer », avec une confirmation : on n'efface pas 20 réponses par mégarde [F-14]. */
function RestartButton({ onRestart }: { readonly onRestart: () => void }) {
  const t = useTranslations("quiz");
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        data-testid="quiz-restart"
        onClick={() => setConfirming(true)}
        className="col-span-2 min-h-11 font-terminal text-xs tracking-wider text-ink-600 uppercase underline underline-offset-4 hover:text-ink-900 sm:ml-auto"
      >
        {t("restart")}
      </button>
    );
  }
  return (
    <div
      role="group"
      aria-label={t("restartConfirm")}
      className="col-span-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm sm:ml-auto"
    >
      <span>{t("restartConfirm")}</span>
      <button
        type="button"
        data-testid="quiz-restart-yes"
        onClick={onRestart}
        autoFocus
        className="min-h-11 font-terminal text-xs font-semibold tracking-wider text-rust-600 uppercase underline underline-offset-4"
      >
        {t("restartYes")}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="min-h-11 font-terminal text-xs tracking-wider text-ink-600 uppercase underline underline-offset-4 hover:text-ink-900"
      >
        {t("restartNo")}
      </button>
    </div>
  );
}

/** Prévient si le navigateur refuse la sauvegarde (navigation privée stricte, par exemple). */
function StorageWarning() {
  const t = useTranslations("quiz");
  const [persistent] = useState(isPersistent);
  if (persistent) return null;
  return <p className="mt-4 text-sm font-bold text-rust-600">{t("storageWarning")}</p>;
}
