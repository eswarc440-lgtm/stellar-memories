import { useEffect, useMemo, useRef, useState } from "react";

import type { Faculty } from "../data/faculty";
import { playCue } from "./audio";

function Lines({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <>
      {text.split("\n").map((line, i) => (
        <p
          key={`${line}-${i}`}
          className="animate-rise text-balance"
          style={{ animationDelay: `${delay + i * 0.42}s` }}
        >
          {line === "" ? "\u00a0" : line}
        </p>
      ))}
    </>
  );
}

function Petals({ count = 26 }: { count?: number }) {
  const petals = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: `${(i * 97) % 100}%`,
        delay: `${(i % 9) * 1.1}s`,
        dur: `${9 + (i % 6) * 1.7}s`,
        drift: `${((i % 7) - 3) * 40}px`,
        size: 5 + (i % 4) * 3,
      })),
    [count],
  );
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {petals.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-gold/70"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            ["--drift" as string]: p.drift,
            animation: `petal-fall ${p.dur} linear ${p.delay} infinite`,
            boxShadow: "0 0 12px currentColor",
          }}
        />
      ))}
    </div>
  );
}

function Terminal({ onDone, subject }: { onDone: () => void; subject: string }) {
  const script = useMemo(
    () => [
      "> initializing_teacher_impact.exe",
      "",
      `> loading module: ${subject.toLowerCase().replace(/[^a-z]+/g, "_")}`,
      "> calculating_knowledge...",
      "████████████████████ 100%",
      "> calculating_inspiration...",
      "████████████████████ 100%",
      "> calculating_memories...",
      "████████████████████ 100%",
      "",
      "> result:",
      "TEACHER_IMPACT = ∞",
      "",
      "ERROR: value exceeds all known limits.",
      "Your contribution cannot be measured.",
      "",
      "// because some impacts are infinite.",
    ],
    [subject],
  );
  const [shown, setShown] = useState<string[]>([]);
  const done = useRef(false);

  useEffect(() => {
    let i = 0;
    const id = window.setInterval(() => {
      const line = script[i];
      if (line === undefined) {
        window.clearInterval(id);
        if (!done.current) {
          done.current = true;
          onDone();
        }
        return;
      }
      setShown((s) => [...s, line]);
      if (line.trim() !== "") playCue("type");
      i += 1;
    }, 460);
    return () => window.clearInterval(id);
  }, [script, onDone]);

  return (
    <div className="w-full max-w-xl rounded-xl border border-border bg-deep/80 p-5 text-left font-mono text-[13px] leading-relaxed text-chalk shadow-[var(--shadow-glow)] backdrop-blur-md sm:p-7 sm:text-sm">
      {shown.map((l, i) => (
        <div
          key={i}
          className={
            l.startsWith("ERROR")
              ? "text-destructive"
              : l.startsWith("TEACHER_IMPACT")
                ? "gold-text text-lg font-bold"
                : l.startsWith("//")
                  ? "text-chalk-dim italic"
                  : "text-chalk-dim"
          }
        >
          {l === "" ? "\u00a0" : l}
        </div>
      ))}
      <span className="inline-block" style={{ animation: "caret 1s steps(1) infinite" }}>
        ▌
      </span>
    </div>
  );
}

const shellBase =
  "pointer-events-none fixed inset-0 flex flex-col items-center justify-center px-6 text-center";

export function Overlay({
  scene,
  faculty,
  onNext,
  onReplay,
}: {
  scene: number;
  faculty: Faculty;
  onNext: () => void;
  onReplay: () => void;
}) {
  const [terminalDone, setTerminalDone] = useState(false);

  useEffect(() => {
    if (scene !== 7) setTerminalDone(false);
  }, [scene]);

  useEffect(() => {
    if (scene !== 3) return;
    const id = window.setTimeout(onNext, 5200);
    return () => window.clearTimeout(id);
  }, [scene, onNext]);

  const cta = (label: string, action: () => void, key: string) => (
    <button
      key={key}
      onClick={action}
      className="pointer-events-auto mt-10 inline-flex items-center gap-3 rounded-full border border-gold/45 bg-gold/10 px-7 py-3 font-body text-xs tracking-[0.3em] text-gold uppercase backdrop-blur-sm transition-all duration-500 hover:bg-gold/20 hover:tracking-[0.42em] hover:shadow-[var(--shadow-glow)]"
    >
      {label}
    </button>
  );

  return (
    <div className={shellBase}>
      {scene === 0 && (
        <div className="max-w-lg font-display text-2xl leading-relaxed text-chalk sm:text-3xl">
          <Lines text={"Some lessons are written on a board..."} />
          <div className="h-6" />
          <Lines text={"...and some are written in our lives."} delay={2.4} />
          <div className="animate-rise" style={{ animationDelay: "4.4s" }}>
            {cta("Enter the classroom →", onNext, "enter")}
          </div>
        </div>
      )}

      {scene === 1 && (
        <div className="-mt-24 max-w-2xl sm:-mt-28">
          <p className="animate-rise font-display text-3xl tracking-wide text-chalky sm:text-5xl">
            WELCOME, {faculty.name.toUpperCase()}
          </p>
          <p
            className="animate-rise mt-6 font-body text-[11px] tracking-[0.42em] text-chalk-dim uppercase"
            style={{ animationDelay: "1.1s" }}
          >
            Today&apos;s lesson
          </p>
          <p
            className="animate-rise gold-text mt-2 font-display text-4xl sm:text-6xl"
            style={{ animationDelay: "1.5s" }}
          >
            GRATITUDE ❤
          </p>
          <div className="animate-rise" style={{ animationDelay: "2.6s" }}>
            {cta("Continue", onNext, "s1")}
          </div>
        </div>
      )}

      {scene === 2 && (
        <div className="-mt-16 max-w-2xl">
          <div className="font-display text-xl leading-relaxed text-chalky sm:text-2xl">
            <Lines
              text={
                "Every student remembers\na few teachers differently.\n\nBut some teachers...\nare impossible to forget."
              }
            />
          </div>
          <p
            className="animate-rise gold-text mt-8 font-display text-4xl sm:text-6xl"
            style={{ animationDelay: "3.2s" }}
          >
            {faculty.honorific} {faculty.name}
          </p>
          <p
            className="animate-rise mt-3 font-body text-[11px] tracking-[0.38em] text-chalk-dim uppercase"
            style={{ animationDelay: "3.6s" }}
          >
            {faculty.subject}
          </p>
          <div className="animate-rise" style={{ animationDelay: "4.2s" }}>
            {cta("Let the classroom go →", onNext, "s2")}
          </div>
        </div>
      )}

      {scene === 3 && (
        <div className="max-w-xl font-display text-2xl leading-relaxed text-chalk sm:text-4xl">
          <Lines text={"A teacher's impact\nis bigger than a classroom."} />
          <p
            className="animate-rise gold-text mt-10 font-body text-[11px] tracking-[0.42em] uppercase"
            style={{ animationDelay: "3s" }}
          >
            Welcome to the Universe of Gratitude
          </p>
        </div>
      )}

      {scene === 4 && (
        <div className="flex h-full w-full flex-col items-center justify-between py-16">
          <p className="animate-rise font-body text-[11px] tracking-[0.42em] text-chalk-dim uppercase">
            The constellation of {faculty.constellationName}
          </p>
          <div className="flex max-w-3xl flex-wrap justify-center gap-x-8 gap-y-3">
            {faculty.qualities.map((q, i) => (
              <span
                key={q}
                className="animate-rise animate-soft-pulse font-body text-[10px] tracking-[0.36em] text-star uppercase sm:text-xs"
                style={{ animationDelay: `${0.6 + i * 0.35}s` }}
              >
                {q}
              </span>
            ))}
          </div>
          <div>{cta("Open the book", onNext, "s4")}</div>
        </div>
      )}

      {scene === 5 && (
        <div className="pointer-events-auto w-full max-w-2xl rounded-2xl border border-border bg-deep/55 p-8 backdrop-blur-md sm:p-12">
          <p className="font-body text-[11px] tracking-[0.42em] text-gold uppercase">
            More than a subject
          </p>
          <div className="mt-6 space-y-2 font-display text-xl leading-relaxed text-chalk sm:text-2xl">
            <Lines text={faculty.lesson} delay={0.3} />
          </div>
          {cta("Continue", onNext, "s5")}
        </div>
      )}

      {scene === 6 && (
        <div className="pointer-events-auto w-full max-w-2xl rounded-2xl border border-star/25 bg-[color-mix(in_oklab,var(--star)_8%,transparent)] p-8 shadow-[var(--shadow-glow)] backdrop-blur-xl sm:p-12">
          <p className="font-body text-[11px] tracking-[0.42em] text-star uppercase">
            A memory I&apos;ll always remember
          </p>
          <div className="mt-6 space-y-2 font-display text-xl leading-relaxed text-chalk sm:text-2xl">
            <Lines text={faculty.memory} delay={0.3} />
          </div>
          {cta("Run one last program", onNext, "s6")}
        </div>
      )}

      {scene === 7 && (
        <div className="flex w-full flex-col items-center">
          <Terminal subject={faculty.subject} onDone={() => setTerminalDone(true)} />
          {terminalDone && cta("Continue", onNext, "s7")}
        </div>
      )}

      {scene === 8 && (
        <div className="max-w-xl">
          <Petals />
          <div className="font-display text-2xl leading-relaxed text-chalk sm:text-3xl">
            <Lines
              text={
                "Behind every student\nwho learns to believe in themselves,\n\nthere is often a teacher\nwho believed in them first."
              }
            />
          </div>
          <p
            className="animate-rise gold-text mt-8 font-display text-3xl sm:text-5xl"
            style={{ animationDelay: "3.4s" }}
          >
            Thank you, {faculty.name}.
          </p>
          <div className="animate-rise" style={{ animationDelay: "4.2s" }}>
            {cta("Read the letter", onNext, "s8")}
          </div>
        </div>
      )}

      {scene === 9 && (
        <div className="pointer-events-auto w-full max-w-2xl rounded-2xl border border-gold/25 bg-deep/60 p-8 text-left shadow-[var(--shadow-glow)] backdrop-blur-md sm:p-12">
          <Petals count={14} />
          <div className="space-y-2 font-display text-lg leading-relaxed text-chalk sm:text-2xl">
            <Lines text={faculty.message} delay={0.2} />
          </div>
          <p className="gold-text animate-rise mt-8 font-display text-2xl sm:text-3xl" style={{ animationDelay: "2.4s" }}>
            Happy Teachers&apos; Day ❤
          </p>
          <p
            className="animate-rise mt-4 font-body text-[11px] tracking-[0.32em] text-chalk-dim uppercase"
            style={{ animationDelay: "2.8s" }}
          >
            With respect &amp; gratitude, {faculty.signature}
          </p>
          <div className="text-center">{cta("One last look up", onNext, "s9")}</div>
        </div>
      )}

      {scene === 10 && (
        <div className="flex h-full w-full flex-col items-center justify-between py-16">
          <p className="animate-rise gold-text font-display text-4xl sm:text-6xl">
            {faculty.constellationName}
          </p>
          <div className="space-y-1 font-body text-[10px] tracking-[0.42em] text-chalk-dim uppercase sm:text-xs">
            <Lines text={"A teacher\nA mentor\nAn inspiration"} delay={1} />
          </div>
          <div>
            <p className="animate-rise font-display text-2xl text-chalky sm:text-4xl">
              Happy Teachers&apos; Day ❤
            </p>
            {cta("Replay the journey ↻", onReplay, "s10")}
          </div>
        </div>
      )}
    </div>
  );
}
