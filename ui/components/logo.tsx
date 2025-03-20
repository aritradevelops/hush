export function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle with gradient */}
      <circle
        cx="12"
        cy="12"
        r="11"
        fill="url(#gradient)"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      {/* Lock symbol */}
      <path
        d="M8 11V9C8 7.34315 9.34315 6 11 6H13C14.6569 6 16 7.34315 16 9V11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="8"
        y="11"
        width="8"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      {/* Speech bubble */}
      <path
        d="M8 14H16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M8 16H12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Gradient definition */}
      <defs>
        <linearGradient
          id="gradient"
          x1="2"
          y1="2"
          x2="22"
          y2="22"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="hsl(var(--primary))" />
          <stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
        </linearGradient>
      </defs>
    </svg>
  );
} 