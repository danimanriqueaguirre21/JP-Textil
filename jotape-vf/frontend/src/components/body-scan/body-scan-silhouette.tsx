import { cn } from "@/lib/utils";
import type { BodyScanView } from "@/types/body-scan";

type Props = {
  view: BodyScanView;
  className?: string;
};

/** Silueta guía superpuesta en el visor de cámara. */
export function BodyScanSilhouette({ view, className }: Props) {
  const isFront = view === "front";

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 flex items-center justify-center",
        className,
      )}
      aria-hidden
    >
      <svg
        viewBox="0 0 120 280"
        className="h-[min(78%,520px)] w-auto text-violet-300/55 dark:text-violet-400/40"
      >
        {isFront ? (
          <>
            <ellipse
              cx="60"
              cy="28"
              rx="17"
              ry="19"
              fill="currentColor"
              opacity="0.12"
            />
            <path
              d="M60 50 L60 132 M34 78 L86 78 M40 132 L40 200 M80 132 L80 200 M40 200 L48 262 M80 200 L72 262"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeDasharray="6 4"
              opacity="0.65"
            />
          </>
        ) : (
          <>
            <ellipse
              cx="62"
              cy="28"
              rx="14"
              ry="19"
              fill="currentColor"
              opacity="0.12"
            />
            <path
              d="M62 50 L62 132 M48 78 L76 90 M52 132 L52 200 M70 132 L70 200 M52 200 L56 262 M70 200 L66 262"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeDasharray="6 4"
              opacity="0.65"
            />
          </>
        )}
        <rect
          x="8"
          y="8"
          width="104"
          height="264"
          rx="12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeDasharray="4 6"
          opacity="0.35"
        />
      </svg>
    </div>
  );
}
