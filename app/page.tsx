"use client";

import * as React from "react";
import { ChevronDown, PartyPopper, Volume2, VolumeX } from "lucide-react";
import { TiltedGridHero } from "@/components/ui/tilted-grid-hero";
import { ChocolateCake } from "@/components/ui/chocolate-cake";
import { triggerPartyBomber } from "@/lib/confetti";

// Photos from /public/photos — all 17 photos looping continuously
const IMAGES = Array.from({ length: 17 }, (_, i) => ({
  src: `/photos/photo-${i + 1}.jpeg`,
  alt: "Papa",
}));

// Returns true on screens narrower than 640 px (Tailwind's sm breakpoint).
// SSR-safe: starts as false so server and first client paint agree.
function useMobile() {
  const [mobile, setMobile] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    setMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return mobile;
}

export default function Page() {
  const isMobile = useMobile();
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Trigger macOS FaceTime style party bomber on initial page open
  React.useEffect(() => {
    const timer = setTimeout(() => {
      triggerPartyBomber();
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Background celebration music — triggers instantly when the user first starts scrolling
  React.useEffect(() => {
    const audio = new Audio("/sound/music.mp3");
    audio.loop = true;
    audio.volume = 0.65;
    audioRef.current = audio;

    // Keep React state in sync with audio engine
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    let startTouchY = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        startTouchY = e.touches[0].clientY;
      }
    };

    const removeScrollListeners = () => {
      window.removeEventListener("scroll", onScrollAttempt);
      document.removeEventListener("scroll", onScrollAttempt);
      window.removeEventListener("wheel", onWheelAttempt);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMoveAttempt);
      window.removeEventListener("keydown", onKeyDownAttempt);
      observer.disconnect();
    };

    const triggerPlay = () => {
      if (!audioRef.current) return;
      if (audioRef.current.paused) {
        audioRef.current
          .play()
          .then(() => {
            removeScrollListeners();
          })
          .catch(() => {
            // Keep listeners active if browser requires further gesture progression
          });
      } else {
        removeScrollListeners();
      }
    };

    const onScrollAttempt = () => {
      triggerPlay();
    };

    const onWheelAttempt = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 0) {
        triggerPlay();
      }
    };

    const onTouchMoveAttempt = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const deltaY = Math.abs(e.touches[0].clientY - startTouchY);
        // The first moment a finger moves vertically to scroll:
        if (deltaY > 3) {
          triggerPlay();
        }
      }
    };

    const onKeyDownAttempt = (e: KeyboardEvent) => {
      if (["ArrowDown", "PageDown", "Space"].includes(e.code)) {
        triggerPlay();
      }
    };

    // Also observe when the letter section starts entering viewport
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            triggerPlay();
          }
        }
      },
      { threshold: 0.05 },
    );

    const letterEl = document.getElementById("letter");
    if (letterEl) observer.observe(letterEl);

    window.addEventListener("scroll", onScrollAttempt, { passive: true });
    document.addEventListener("scroll", onScrollAttempt, { passive: true });
    window.addEventListener("wheel", onWheelAttempt, { passive: true, capture: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
    window.addEventListener("touchmove", onTouchMoveAttempt, { passive: true, capture: true });
    window.addEventListener("keydown", onKeyDownAttempt, { passive: true });

    return () => {
      removeScrollListeners();
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.pause();
    };
  }, []);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  };

  const go = (id: string) => {
    // Start music on "See the letter" scroll navigation as well
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="overflow-x-hidden">
      {/* ── Party Bomber button (macOS video reaction style) ── */}
      <button
        onClick={triggerPartyBomber}
        aria-label="Celebrate with party popper"
        title="Tap to celebrate! 🎉"
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-[#fffdf8]/90 text-[#2e2a26] shadow-sm backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-[#b8862b] hover:text-white active:scale-90"
      >
        <PartyPopper className="h-5 w-5" />
      </button>

      {/* ── Music Toggle button ── */}
      <button
        onClick={toggleMusic}
        aria-label={isPlaying ? "Mute celebration music" : "Play celebration music"}
        title={isPlaying ? "Mute music 🎵" : "Play music 🎵"}
        className="fixed right-4 top-4 z-50 flex h-10 items-center gap-1.5 rounded-full bg-[#fffdf8]/90 px-3.5 text-[#2e2a26] shadow-sm backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-[#b8862b] hover:text-white active:scale-95"
      >
        {isPlaying ? (
          <>
            <Volume2 className="h-4 w-4 text-[#b8862b]" />
            <span className="flex h-3 items-end gap-0.5">
              <span className="h-2 w-0.5 bg-[#b8862b] animate-pulse" />
              <span className="h-3 w-0.5 bg-[#b8862b] animate-pulse delay-75" />
              <span className="h-1.5 w-0.5 bg-[#b8862b] animate-pulse delay-150" />
            </span>
          </>
        ) : (
          <>
            <VolumeX className="h-4 w-4 opacity-50" />
            <span className="text-xs font-medium opacity-70">Music</span>
          </>
        )}
      </button>


      {/* ── Page 1: photo carousel ── */}
      <section
        id="hero"
        className="relative flex h-svh flex-col snap-start overflow-hidden bg-[#fbf8f2]"
      >
        <TiltedGridHero
          images={IMAGES}
          /* Larger tiles on mobile with generous gap to prevent overlap */
          tileHeight={isMobile ? 24 : 44}
          maxWidth={isMobile ? 35 : 55}
          gap={isMobile ? 16 : 6}
          aspectRatio={3 / 4}
          axis={isMobile ? 50 : 52}
          speed={4}
          curve={isMobile ? 52 : 72}
          fade={isMobile ? 10 : 10}
          className="absolute inset-0"
        >
          {/* Heading sits above the carousel band — pointer-events-none lets drag gestures pass directly to carousel */}
          <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-between px-5 pb-6 pt-10 text-center select-none">
            {/* Title */}
            <div
              onClick={triggerPartyBomber}
              className="pointer-events-auto group flex cursor-pointer flex-col items-center gap-1 transition-transform active:scale-95"
              title="Tap for party popper! 🎉"
            >
              <p
                className="font-[family-name:var(--font-hand)] text-sm tracking-widest text-[#b8862b]/80 group-hover:text-[#b8862b]"
                style={{ letterSpacing: "0.18em" }}
              >
                A little something for you
              </p>
              <h1 className="font-[family-name:var(--font-script)] text-[2.6rem] font-bold leading-tight text-[#2e2a26]">
                Happy Birthday
                <br />
                Papa
              </h1>
            </div>

            {/* Bottom section: 3D Chocolate Cake + Scroll navigation */}
            <div className="flex flex-col items-center">
              {/* Rotating 3D Chocolate Cake with candle */}
              <div
                onClick={triggerPartyBomber}
                className="pointer-events-auto -mb-2 transition-transform hover:scale-105 active:scale-95"
                title="Happy Birthday Cake! 🎂 Tap to celebrate"
              >
                <ChocolateCake size={isMobile ? 115 : 135} />
              </div>

              {/* Scroll cue */}
              <button
                onClick={() => go("letter")}
                className="pointer-events-auto flex flex-col items-center gap-0.5 rounded-full px-4 py-1 text-[#2e2a26]/60 transition-colors hover:text-[#2e2a26] active:text-[#2e2a26]"
              >
                <span className="font-[family-name:var(--font-hand)] text-base">
                  See the letter
                </span>
                <ChevronDown className="h-4 w-4 animate-bounce motion-reduce:animate-none" />
              </button>
            </div>
          </div>
        </TiltedGridHero>
      </section>

      {/* ── Page 2: letter ── */}
      <section
        id="letter"
        className="flex min-h-svh snap-start flex-col items-center justify-center bg-[#fbf8f2] px-4 py-14"
      >
        {/* Paper card */}
        <article
          className="relative w-full max-w-sm rounded-sm bg-[#fffdf8] shadow-[0_2px_4px_rgba(46,42,38,0.08),0_18px_40px_-12px_rgba(46,42,38,0.25)]"
          style={{ transform: "rotate(-1deg)" }}
        >
          {/* Ruled lines */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 opacity-35"
            style={{
              top: "3.5rem",
              bottom: "3rem",
              backgroundImage:
                "repeating-linear-gradient(to bottom, transparent 0, transparent 33px, #d9cfbd 33px, #d9cfbd 34px)",
            }}
          />

          <div className="px-7 pb-10 pt-8">
            <div
              className="relative font-[family-name:var(--font-hand)] text-[1.35rem] leading-[34px] text-[#2e2a26]"
            >
              <p>Dear Papa,</p>
              <p className="mt-[34px]">
                Happy Birthday Papa. Hamlog aise zyada express nahi karte hain
                ek dusre ko bolke, but I really Love you and I am so proud to
                be your Son.
              </p>
              <p className="mt-[34px]">
                Aap jis way mein poore ghar ko sambhalte hain, jis way mein
                hamlog ko support karte hain, aur itna chill rehte hain — itni
                sari responsibilities ke baawajood — wo kar paana kafi mushkil
                hai kisi ke liye bhi.
              </p>
              <p className="mt-[34px]">
                Hamlog bohot lucky aur gifted hain ki aap hamare Papa hain.
                Aapse bahut strength milti hai. Ye sab cheezein hum bol nahi
                paate kabhi — lekin hum chahte hain ki aap jaano.
              </p>
              <p className="mt-[34px]">
                Ek din hum bhi aapke jaisa banna chahte hain — aapke liye aur
                aas-paas sabke liye.
              </p>
              <p className="mt-[34px]">
                I wish you a very Happy Birthday, Papa. Aise hi acche se raho
                hamesha. Ek din hum bhi aapka strength banenge. 🎂
              </p>
              <p className="mt-[34px] text-right">
                With all my love,
                <br />
                Ayush Aryan
              </p>
            </div>
          </div>
        </article>

        {/* Back to top */}
        <button
          onClick={() => go("hero")}
          className="mt-10 font-[family-name:var(--font-hand)] text-base text-[#2e2a26]/50 underline-offset-4 transition-colors active:text-[#2e2a26]"
        >
          ↑ Back to photos
        </button>
      </section>
    </main>
  );
}
