"use client";

import { useState } from "react";
import Link from "next/link";

const QUESTIONS = [
  {
    id: "skinType",
    label: "What's your skin type?",
    options: ["Oily", "Dry", "Combination", "Normal", "Sensitive"],
  },
  {
    id: "concern",
    label: "What's your main concern?",
    options: [
      "Acne & breakouts",
      "Dark spots",
      "Dryness & dehydration",
      "Fine lines",
      "Redness",
    ],
  },
  {
    id: "goal",
    label: "What do you want to achieve?",
    options: [
      "Glass-skin glow",
      "Clear, calm skin",
      "Even skin tone",
      "Firmer, younger-looking skin",
    ],
  },
];

export default function SkincareQuizPage() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const step = Math.min(Object.keys(answers).length, QUESTIONS.length);
  const current = QUESTIONS[step];
  const isLast = step === QUESTIONS.length - 1;

  const choose = (option: string) => {
    const next = { ...answers, [current.id]: option };
    setAnswers(next);
    if (isLast) {
      setDone(true);
    }
  };

  const restart = () => {
    setAnswers({});
    setDone(false);
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <span className="text-xs font-bold uppercase tracking-widest text-accent">
        Skincare Quiz
      </span>
      <h1 className="mt-3 text-3xl font-serif font-medium text-ink">
        Find your Korean skincare match
      </h1>
      <p className="mt-3 text-ink/50">
        Answer a few quick questions and we&apos;ll point you to the right
        products and routine.
      </p>

      {done ? (
        <div className="mt-12 rounded-3xl border border-ink/10 bg-white p-10 text-center">
          <p className="text-3xl">✨</p>
          <h2 className="mt-3 text-2xl font-serif font-medium text-ink">
            Your results are in!
          </h2>
          <p className="mt-3 text-ink/50">
            Based on your answers, we suggest a{" "}
            <span className="font-medium text-ink">
              {answers.skinType} skin
            </span>{" "}
            routine focused on{" "}
            <span className="font-medium text-ink">{answers.concern}</span> to
            help you reach{" "}
            <span className="font-medium text-ink">{answers.goal}</span>.
          </p>
          <p className="mt-3 text-sm text-ink/50">
            Browse our shop filtered by your concern to start your routine.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={`/shop?concern=${encodeURIComponent(answers.concern.toLowerCase().split(" ")[0])}`}
              className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent"
            >
              Shop My Routine
            </Link>
            <button
              onClick={restart}
              className="rounded-full border border-ink/15 px-6 py-3 text-sm font-medium text-ink transition-colors hover:border-ink"
            >
              Retake Quiz
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-12">
          {/* Progress */}
          <div className="mb-8 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/10">
              <div
                className="h-full bg-accent transition-all duration-500"
                style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
              />
            </div>
            <span className="text-sm text-ink/40">
              {step + 1} / {QUESTIONS.length}
            </span>
          </div>

          <h2 className="text-2xl font-serif font-medium text-ink">
            {current.label}
          </h2>
          <div className="mt-6 grid gap-3">
            {current.options.map((option) => (
              <button
                key={option}
                onClick={() => choose(option)}
                className="rounded-2xl border border-ink/15 bg-white px-5 py-4 text-left text-sm font-medium text-ink transition-all hover:border-accent hover:bg-accent-pale"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
