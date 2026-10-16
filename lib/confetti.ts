import confetti from "canvas-confetti";

export function triggerPartyBomber() {
  const count = 180;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 99999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  // 1. Initial center multi-layered explosion
  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });

  // 2. Dual macOS FaceTime-style side cannons streaming from bottom corners
  const duration = 1800;
  const animationEnd = Date.now() + duration;
  const colors = [
    "#b8862b", // Warm gold
    "#e05a47", // Celebration red
    "#2bb673", // Emerald
    "#2980b9", // Royal blue
    "#f39c12", // Amber
    "#e84393", // Bright magenta
    "#9b59b6", // Purple
    "#ffd32a", // Sunshine yellow
  ];

  const interval: ReturnType<typeof setInterval> = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      clearInterval(interval);
      return;
    }

    const particleCount = 4;

    // Left cannon shooting up-right
    confetti({
      particleCount,
      angle: 60,
      spread: 65,
      startVelocity: 60,
      origin: { x: 0, y: 0.75 },
      colors,
      zIndex: 99999,
    });

    // Right cannon shooting up-left
    confetti({
      particleCount,
      angle: 120,
      spread: 65,
      startVelocity: 60,
      origin: { x: 1, y: 0.75 },
      colors,
      zIndex: 99999,
    });
  }, 40);
}
