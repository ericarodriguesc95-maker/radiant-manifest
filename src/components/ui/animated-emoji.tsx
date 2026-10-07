import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export const EMOJI = {
  fire: "1f525", target: "1f3af", muscle: "1f4aa", trophy: "1f3c6", pray: "1f64f",
  gem: "1f48e", smile: "1f60a", starstruck: "1f929", party: "1f973", drop: "1f4a7",
  sleep: "1f634", flower: "1f338", sparkles: "2728", star: "1f31f", crown: "1f451",
  money: "1f4b8", heart: "1f49b", gift: "1f381", letter: "1f48c",
} as const;
export type EmojiName = keyof typeof EMOJI;

interface Props {
  name: EmojiName;
  size?: number | string;
  motion?: "float" | "pop" | "none";
  className?: string;
}

/** Animated Google Noto emoji; animation pauses while off-screen. */
export default function AnimatedEmoji({ name, size = "1.35em", motion = "float", className }: Props) {
  const ref = useRef<HTMLImageElement>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <img
      ref={ref}
      src={`https://fonts.gstatic.com/s/e/notoemoji/latest/${EMOJI[name]}/512.webp`}
      alt=""
      aria-hidden="true"
      loading="lazy"
      width={typeof size === "number" ? size : undefined}
      height={typeof size === "number" ? size : undefined}
      style={{ width: size, height: size }}
      className={cn(
        "inline-block select-none align-middle",
        motion === "float" && "emoji-float",
        motion === "pop" && "emoji-pop",
        !visible && "anim-paused",
        className,
      )}
    />
  );
}
