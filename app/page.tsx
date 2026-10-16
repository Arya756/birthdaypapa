"use client";

import * as React from "react";
import { ChevronDown, PartyPopper } from "lucide-react";
import { TiltedGridHero } from "@/components/ui/tilted-grid-hero";
import { triggerPartyBomber } from "@/lib/confetti";

// Photos from /public/photos — add more by copying photo-7.jpeg, photo-8.jpeg etc.
const IMAGES = [
  { src: "/photos/photo-1.jpeg", alt: "Papa" },
  { src: "/photos/photo-2.jpeg", alt: "Papa" },
  { src: "/photos/photo-3.jpeg", alt: "Papa" },
  { src: "/photos/photo-4.jpeg", alt: "Papa" },
  { src: "/photos/photo-5.jpeg", alt: "Papa" },
  { src: "/photos/photo-6.jpeg", alt: "Papa" },
];

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

  // Trigger macOS FaceTime style party bomber on initial page open
  React.useEffect(() => {
    const timer = setTimeout(() => {
      triggerPartyBomber();
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const go = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

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
          {/* Heading sits above the carousel band */}
          <div className="relative z-10 flex h-full flex-col items-center justify-between px-5 pb-6 pt-10 text-center select-none">
            {/* Title */}
            <div
              onClick={triggerPartyBomber}
              className="group flex cursor-pointer flex-col items-center gap-1 transition-transform active:scale-95"
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

            {/* Scroll cue */}
            <button
              onClick={() => go("letter")}
              className="flex flex-col items-center gap-1 rounded-full px-4 py-2 text-[#2e2a26]/60 transition-colors active:text-[#2e2a26]"
            >
              <span className="font-[family-name:var(--font-hand)] text-lg">
                See the letter
              </span>
              <ChevronDown className="h-5 w-5 animate-bounce motion-reduce:animate-none" />
            </button>
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
