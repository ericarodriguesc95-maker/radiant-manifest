import { cn } from "@/lib/utils";

interface FourPointStarProps {
  size?: number;
  className?: string;
  animate?: "spin" | "pulse" | "none";
  fill?: string;
}

export default function FourPointStar({ 
  size = 24, 
  className, 
  animate = "none",
  fill = "currentColor" 
}: FourPointStarProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn(
        animate === "spin" && "animate-star-spin",
        animate === "pulse" && "animate-star-pulse",
        className
      )}
    >
      <path
        d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z"
        fill={fill}
      />
    </svg>
  );
}
