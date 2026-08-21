import { useRouterState } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { tourForPath } from "@/lib/tour-steps";

const SEEN_KEY = "lavin-tour-seen";

type Rect = { top: number; left: number; width: number; height: number };

function readSeen(): string[] {
  try {
    const raw = window.localStorage.getItem(SEEN_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function markSeen(path: string) {
  try {
    const list = readSeen();
    if (!list.includes(path)) {
      window.localStorage.setItem(SEEN_KEY, JSON.stringify([...list, path]));
    }
  } catch {
    /* ignore */
  }
}

export function useTourTrigger() {
  return useCallback(() => {
    window.dispatchEvent(new CustomEvent("lavin-tour-start"));
  }, []);
}

export function PageTour() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const steps = useMemo(() => tourForPath(pathname), [pathname]);
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  const start = useCallback(() => {
    setIndex(0);
    setActive(true);
  }, []);

  const stop = useCallback(() => {
    setActive(false);
    markSeen(pathname);
  }, [pathname]);

  useEffect(() => {
    const handler = () => start();
    window.addEventListener("lavin-tour-start", handler);
    return () => window.removeEventListener("lavin-tour-start", handler);
  }, [start]);

  // auto-start sekali per halaman
  useEffect(() => {
    setActive(false);
    const timer = window.setTimeout(() => {
      if (!readSeen().includes(pathname)) start();
    }, 900);
    return () => window.clearTimeout(timer);
  }, [pathname, start]);

  const step = active ? steps[index] : undefined;

  useEffect(() => {
    if (!step) {
      setRect(null);
      return;
    }
    const sync = () => {
      const el = step.target ? document.querySelector(step.target) : null;
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) {
        setRect(null);
        return;
      }
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    const el = step.target ? document.querySelector(step.target) : null;
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
    const raf = window.setTimeout(sync, 350);
    window.addEventListener("resize", sync);
    window.addEventListener("scroll", sync, true);
    return () => {
      window.clearTimeout(raf);
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", sync, true);
    };
  }, [step]);

  if (!active || !step) return null;

  const last = index === steps.length - 1;
  const pad = 6;

  return (
    <div className="fixed inset-0 z-[90]">
      <div className="absolute inset-0 bg-black/60" onClick={stop} />

      {rect ? (
        <div
          className="pointer-events-none absolute rounded-lg ring-2 ring-[#d4b877] transition-all duration-200"
          style={{
            top: rect.top - pad,
            left: rect.left - pad,
            width: rect.width + pad * 2,
            height: rect.height + pad * 2,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.6)",
          }}
        />
      ) : null}

      <div
        role="dialog"
        aria-label={step.title}
        className="absolute inset-x-3 bottom-4 mx-auto max-w-md rounded-xl border border-gold-line bg-background p-4 shadow-2xl sm:inset-x-auto sm:right-6 sm:bottom-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
              Tutorial · {index + 1}/{steps.length}
            </p>
            <h2 className="mt-1 font-display text-base font-semibold text-foreground">
              {step.title}
            </h2>
          </div>
          <Button variant="ghost" size="icon" aria-label="Tutup tutorial" onClick={stop}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>

        <div className="mt-4 flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={stop}>
            Lewati
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={index === 0}
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
            >
              Kembali
            </Button>
            <Button
              size="sm"
              onClick={() => (last ? stop() : setIndex((i) => i + 1))}
            >
              {last ? "Selesai" : "Lanjut"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
