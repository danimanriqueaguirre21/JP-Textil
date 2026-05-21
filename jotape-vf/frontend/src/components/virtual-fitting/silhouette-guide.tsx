"use client";

export function SilhouetteGuide() {
  return (
    <svg
      viewBox="0 0 120 280"
      className="pointer-events-none absolute inset-0 m-auto h-[85%] w-auto opacity-35"
      aria-hidden
    >
      <ellipse cx="60" cy="28" rx="18" ry="22" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M60 50 L60 130 M35 70 L85 70 M42 130 L42 200 M78 130 L78 200 M42 200 L50 260 M78 200 L70 260"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
