const CODES = ["1f973", "2728", "1f31f", "1f338", "1f929"];

/** Radial burst of animated emojis around a point (or element). */
export function celebrate(origin?: { x: number; y: number } | Element | null) {
  if (typeof window === "undefined") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  if (origin instanceof Element) {
    const r = origin.getBoundingClientRect();
    x = r.left + r.width / 2;
    y = r.top + r.height / 2;
  } else if (origin) {
    ({ x, y } = origin);
  }
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI * 2 * i) / 10;
    const dist = 60 + Math.random() * 40;
    const img = document.createElement("img");
    img.src = `https://fonts.gstatic.com/s/e/notoemoji/latest/${CODES[i % CODES.length]}/512.webp`;
    img.alt = "";
    img.className = "confetti-piece";
    img.style.left = `${x}px`;
    img.style.top = `${y}px`;
    img.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
    img.style.setProperty("--dy", `${Math.sin(angle) * dist}px`);
    document.body.appendChild(img);
    setTimeout(() => img.remove(), 1150);
  }
}
