import { useEffect, useState } from "react";

import splashAsset from "@/assets/splash-building.webp.asset.json";
import splash360 from "@/assets/splash-building-360.webp.asset.json";
import splash480 from "@/assets/splash-building-480.webp.asset.json";

const splashSrcSet = [
  `${splash360.url} 360w`,
  `${splash480.url} 480w`,
  `${splashAsset.url} 1024w`,
].join(", ");

const STORAGE_KEY = "lavin-splash-shown";

export function SplashScreen({ onDone }: { onDone?: () => void } = {}) {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem(STORAGE_KEY) === "1") {
      setVisible(false);
      onDone?.();
      return;
    }
    window.sessionStorage.setItem(STORAGE_KEY, "1");
    const fade = window.setTimeout(() => setLeaving(true), 2200);
    const hide = window.setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, 2900);
    return () => {
      window.clearTimeout(fade);
      window.clearTimeout(hide);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const skip = () => {
    setLeaving(true);
    window.setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, 500);
  };

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-label="Memuat aplikasi inventaris Lavin Kost Purwokerto"
      onClick={skip}
      className={`fixed inset-0 z-[100] overflow-hidden bg-[#0b0d10] transition-opacity duration-700 ${
        leaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <img
        src={splashAsset.url}
        srcSet={splashSrcSet}
        sizes="100vw"
        width={1024}
        height={1084}
        fetchPriority="high"
        decoding="async"
        alt="Bangunan Lavin Kost Purwokerto"
        className="absolute inset-0 h-full w-full animate-[splash-zoom_6s_ease-out_forwards] object-contain object-top sm:object-cover sm:object-center"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d10] via-[#0b0d10]/55 to-[#0b0d10]/15" />
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_10%,transparent_35%,rgba(11,13,16,0.75)_100%)]" />

      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-8 pb-14 text-center sm:pb-20">
        <img
          src="/app-icon-192.png"
          alt=""
          width={56}
          height={56}
          className="h-12 w-12 rounded-full border border-[#d4b877]/60 bg-black/30 p-1 shadow-lg backdrop-blur sm:h-14 sm:w-14"
        />
        <p className="mt-5 text-[10px] tracking-[0.42em] text-[#d4b877] uppercase sm:text-[11px]">
          Eksklusif
        </p>
        <h1 className="mt-3 font-display text-[1.7rem] leading-tight font-light tracking-[0.06em] text-white text-balance sm:text-4xl lg:text-5xl">
          Lavin Kost Purwokerto
        </h1>
        <div className="mt-5 flex items-center gap-3">
          <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#d4b877] sm:w-16" />
          <span className="h-1.5 w-1.5 rotate-45 bg-[#d4b877]" />
          <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#d4b877] sm:w-16" />
        </div>
        <p className="mt-5 text-[11px] tracking-[0.22em] text-white/70 uppercase sm:text-xs">
          Sistem Inventaris &amp; Manajemen Hunian
        </p>
        <div className="mt-8 h-0.5 w-32 overflow-hidden rounded-full bg-white/15 sm:w-44">
          <div className="h-full w-1/3 animate-[splash-bar_1.6s_ease-in-out_infinite] bg-[#d4b877]" />
        </div>
      </div>
    </div>
  );
}

