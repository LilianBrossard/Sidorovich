"use client";

import { useTranslations } from "next-intl";
import { useEffect, useEffectEvent, useId, useMemo, useRef, useState } from "react";
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

const buttonClass =
  "rounded-sm border px-4 py-2 font-terminal text-sm tracking-wider uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-40";
const primaryButton = `${buttonClass} border-amber-400 bg-amber-400 text-ink-900 hover:bg-amber-400/85`;
const secondaryButton = `${buttonClass} border-paper-500/60 text-paper-300 enabled:hover:border-paper-100 enabled:hover:text-paper-100`;

/** Le questionnaire complet, de l'accueil de Sidorovich au dossier complet. */
export function Quiz({ copy }: { copy: QuizCopy }) {
  const t = useTranslations("quiz");
  const { session, start, dispatch, clear } = useQuizSession();
  const [restarted, setRestarted] = useState(false);
  // Identifiants uniques : Next.js peut garder une autre instance de la page, masquée.
  const titleId = useId();

  if (session === undefined) {
    return (
      <p role="status" className="font-terminal text-sm text-paper-500">
        {t("loading")}
      </p>
    );
  }

  const restart = () => {
    clear();
    setRestarted(true);
  };

  if (session === null) {
    return (
      <section aria-labelledby={titleId} className="space-y-8">
        <h1 id={titleId} className="font-typewriter text-3xl text-paper-100 sm:text-4xl">
          {t("title")}
        </h1>
        <div aria-live="polite">
          <SidorovichLine
            text={restarted ? copy.lines.restart : copy.lines.welcome}
            speaker={copy.speaker}
            skipLabel={t("skip")}
          />
        </div>
        <p className="text-paper-300">{t("rules", { total })}</p>
        <button
          data-testid="quiz-start"
          type="button"
          onClick={start}
          className={primaryButton}
          autoFocus={restarted}
        >
          {t("start")}
        </button>
      </section>
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

  return (
    <section aria-labelledby={titleId} className="space-y-6">
      <div>
        <p className="flex justify-between font-terminal text-xs tracking-wider text-paper-500 uppercase">
          <span>{t("progress", { current: current + 1, total })}</span>
          <span>{question.kind}</span>
        </p>
        <div
          role="progressbar"
          aria-label={t("progressLabel")}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={answered}
          aria-valuetext={t("progressValue", { answered, total })}
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-bunker-700"
        >
          <div
            className="h-full bg-amber-400 transition-[width] duration-300 motion-reduce:transition-none"
            style={{ width: `${(answered / total) * 100}%` }}
          />
        </div>
      </div>

      <div aria-live="polite">
        {line && (
          <SidorovichLine
            key={`${current}-${line}`}
            text={line}
            speaker={copy.speaker}
            skipLabel={t("skip")}
          />
        )}
      </div>

      <div>
        <h1
          id={titleId}
          data-testid="question-title"
          ref={heading}
          tabIndex={-1}
          className="font-typewriter text-2xl text-paper-100 outline-none sm:text-3xl"
        >
          {question.title}
        </h1>
        <p id={promptId} className="mt-3 text-lg leading-relaxed text-paper-300">
          {question.prompt}
        </p>
      </div>

      <ol
        ref={list}
        aria-labelledby={titleId}
        aria-describedby={`${promptId} ${hintId}`}
        className="space-y-3"
      >
        {order.map((option, position) => {
          const isSelected = selected === option;
          return (
            <li key={option}>
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => answer(option)}
                className={`flex w-full items-start gap-3 rounded-sm border px-4 py-3 text-left transition-colors ${
                  isSelected
                    ? "border-amber-400 bg-amber-400/10 text-paper-100"
                    : "border-bunker-700 bg-bunker-900 text-paper-300 hover:border-paper-500 hover:text-paper-100"
                }`}
              >
                <kbd
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 rounded-sm border border-current px-1.5 font-terminal text-xs"
                >
                  {position + 1}
                </kbd>
                <span>{question.options[option]}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <p id={hintId} className="hidden text-xs text-paper-500 sm:block">
        {t("keyboardHint", { count: order.length })}
      </p>

      <nav aria-label={t("navigationLabel")} className="flex flex-wrap items-center gap-3 pt-2">
        <button
          data-testid="quiz-back"
          type="button"
          onClick={() => dispatch({ type: "back" })}
          disabled={current === 0}
          className={secondaryButton}
        >
          ← {t("back")}
        </button>
        <button
          data-testid="quiz-next"
          type="button"
          onClick={() => dispatch({ type: "forward" })}
          disabled={selected === null}
          className={secondaryButton}
        >
          {t("next")} →
        </button>
        <RestartButton onRestart={onRestart} />
      </nav>

      <StorageWarning />
    </section>
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
    <section aria-labelledby={titleId} className="space-y-8">
      <h1 id={titleId} className="font-typewriter text-3xl text-paper-100 sm:text-4xl">
        {t("doneTitle")}
      </h1>
      <div aria-live="polite">
        <SidorovichLine text={line} speaker={copy.speaker} skipLabel={t("skip")} />
      </div>
      <div className="flex flex-wrap items-center gap-3">
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
    </section>
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
        className="ml-auto font-terminal text-xs tracking-wider text-paper-500 uppercase underline underline-offset-4 hover:text-paper-100"
      >
        {t("restart")}
      </button>
    );
  }
  return (
    <div
      role="group"
      aria-label={t("restartConfirm")}
      className="ml-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-sm"
    >
      <span className="text-paper-300">{t("restartConfirm")}</span>
      <button
        type="button"
        data-testid="quiz-restart-yes"
        onClick={onRestart}
        autoFocus
        className="font-terminal text-xs tracking-wider text-amber-400 uppercase underline underline-offset-4"
      >
        {t("restartYes")}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="font-terminal text-xs tracking-wider text-paper-500 uppercase underline underline-offset-4 hover:text-paper-100"
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
  return <p className="text-sm text-amber-400">{t("storageWarning")}</p>;
}
