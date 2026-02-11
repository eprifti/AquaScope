/**
 * Minimal Banner — Clean, professional animated SVG banner with subtle bubbles and wave
 */
export default function MinimalBanner() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1200 280"
      width="100%"
      preserveAspectRatio="xMidYMid slice"
      style={{ display: 'block' }}
    >
      <defs>
        {/* Ocean blue to teal gradient */}
        <linearGradient id="mb-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0369a1" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="1200" height="280" fill="url(#mb-bg)" />

      {/* Subtle rising bubbles */}
      <circle cx="220" cy="260" r="4" fill="white" opacity="0.12">
        <animate attributeName="cy" from="260" to="20" dur="8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.12;0.18;0.06;0" dur="8s" repeatCount="indefinite" />
      </circle>
      <circle cx="540" cy="250" r="3" fill="white" opacity="0.10">
        <animate attributeName="cy" from="250" to="10" dur="10s" begin="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.10;0.15;0.05;0" dur="10s" begin="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="830" cy="255" r="3.5" fill="white" opacity="0.11">
        <animate attributeName="cy" from="255" to="15" dur="9s" begin="4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.11;0.16;0.05;0" dur="9s" begin="4s" repeatCount="indefinite" />
      </circle>
      <circle cx="1020" cy="245" r="2.5" fill="white" opacity="0.09">
        <animate attributeName="cy" from="245" to="25" dur="11s" begin="6s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.09;0.14;0.04;0" dur="11s" begin="6s" repeatCount="indefinite" />
      </circle>

      {/* Centered title text */}
      <text
        x="600"
        y="128"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
        fontSize="56"
        fontWeight="600"
        fill="white"
        letterSpacing="2"
      >
        AquaScope
      </text>

      {/* Tagline */}
      <text
        x="600"
        y="168"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
        fontSize="18"
        fontWeight="300"
        fill="white"
        opacity="0.55"
        letterSpacing="3"
      >
        Aquarium Management System
      </text>

      {/* Gentle wave line at the bottom */}
      <path
        d="M0 258 Q75 248 150 258 T300 258 T450 258 T600 258 T750 258 T900 258 T1050 258 T1200 258 V280 H0 Z"
        fill="white"
        opacity="0.06"
      >
        <animate
          attributeName="d"
          values="
            M0 258 Q75 248 150 258 T300 258 T450 258 T600 258 T750 258 T900 258 T1050 258 T1200 258 V280 H0 Z;
            M0 262 Q75 272 150 262 T300 262 T450 262 T600 262 T750 262 T900 262 T1050 262 T1200 262 V280 H0 Z;
            M0 258 Q75 248 150 258 T300 258 T450 258 T600 258 T750 258 T900 258 T1050 258 T1200 258 V280 H0 Z
          "
          dur="6s"
          repeatCount="indefinite"
        />
      </path>
      <path
        d="M0 264 Q100 256 200 264 T400 264 T600 264 T800 264 T1000 264 T1200 264 V280 H0 Z"
        fill="white"
        opacity="0.04"
      >
        <animate
          attributeName="d"
          values="
            M0 264 Q100 256 200 264 T400 264 T600 264 T800 264 T1000 264 T1200 264 V280 H0 Z;
            M0 268 Q100 276 200 268 T400 268 T600 268 T800 268 T1000 268 T1200 268 V280 H0 Z;
            M0 264 Q100 256 200 264 T400 264 T600 264 T800 264 T1000 264 T1200 264 V280 H0 Z
          "
          dur="8s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  )
}
