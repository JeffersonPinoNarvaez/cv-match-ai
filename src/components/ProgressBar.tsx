import { motion } from "framer-motion";
import { cn } from "../lib/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
  colorClassName?: string;
  "aria-label"?: string;
}

export function ProgressBar({
  value,
  className,
  colorClassName,
  "aria-label": ariaLabel,
}: ProgressBarProps) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div
      className={cn(
        "relative h-1.5 w-full overflow-hidden rounded-full",
        "bg-[var(--bg-elevated)]",
        className
      )}
      role="progressbar"
      aria-valuenow={safeValue}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${safeValue}%` }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{
          backgroundColor: colorClassName || "var(--accent)",
        }}
      />
    </div>
  );
}

