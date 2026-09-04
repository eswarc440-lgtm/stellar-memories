import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import { getFaculty } from "../data/faculty";
import { Experience } from "../experience/Experience";
import { Overlay } from "../experience/Overlay";
import { SCENE_COUNT } from "../experience/scenes";
import { playCue, setMuted, startAmbience } from "../experience/audio";

export const Route = createFileRoute("/")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    to: typeof search["to"] === "string" ? search["to"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "The Classroom of Memories — A Teachers' Day Experience" },
      {
        name: "description",
        content:
          "An interactive 3D Teachers' Day journey: from a classroom of memories to a universe of gratitude, with a personalized message for your teacher.",
      },
      { property: "og:title", content: "The Classroom of Memories" },
      {
        property: "og:description",
        content: "Some lessons end with the bell. The best ones never do. A 3D Teachers' Day journey.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Journey,
});

function Journey() {
  const { to } = useSearch({ from: "/" });
  const faculty = getFaculty(to);
  const [scene, setScene] = useState(0);
  const [muted, setMutedState] = useState(false);

  const next = useCallback(() => {
    setScene((s) => {
      const n = Math.min(s + 1, SCENE_COUNT - 1);
      if (n !== s) {
        startAmbience();
        playCue(n === 3 ? "whoosh" : n === 4 || n === 10 ? "sparkle" : "chime");
      }
      return n;
    });
  }, []);

  const replay = useCallback(() => {
    playCue("whoosh");
    setScene(0);
  }, []);

  useEffect(() => {
    setMuted(muted);
  }, [muted]);

  return (
    <main className="relative h-dvh w-screen overflow-hidden bg-deep">
      <h1 className="sr-only">
        The Classroom of Memories — a Teachers&apos; Day experience for {faculty.name}
      </h1>

      <Experience scene={scene} faculty={faculty} />
      <div className="pointer-events-none fixed inset-0 [background:var(--gradient-galaxy)] opacity-70" />
      <div className="pointer-events-none fixed inset-0 [background:radial-gradient(ellipse_at_center,transparent_45%,#05040a_100%)]" />

      <Overlay scene={scene} faculty={faculty} onNext={next} onReplay={replay} />

      <header className="pointer-events-none fixed inset-x-0 top-0 flex items-center justify-between p-5 sm:p-7">
        <span className="font-body text-[10px] tracking-[0.4em] text-chalk-dim uppercase">
          The Classroom of Memories
        </span>
        <button
          onClick={() => {
            startAmbience();
            setMutedState((m) => !m);
          }}
          className="pointer-events-auto rounded-full border border-border px-3 py-1.5 font-body text-[10px] tracking-[0.28em] text-chalk-dim uppercase transition-colors hover:text-gold"
        >
          {muted ? "sound off" : "sound on"}
        </button>
      </header>

      <footer className="pointer-events-none fixed inset-x-0 bottom-0 flex flex-col items-center gap-3 p-5 sm:p-7">
        <div className="flex gap-1.5">
          {Array.from({ length: SCENE_COUNT }, (_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all duration-700 ${
                i === scene ? "w-6 bg-gold" : i < scene ? "w-2 bg-gold/40" : "w-2 bg-chalk/15"
              }`}
            />
          ))}
        </div>
        <span className="font-display text-xs text-chalk-dim italic">
          Some lessons end with the bell. The best ones never do.
        </span>
      </footer>
    </main>
  );
}
