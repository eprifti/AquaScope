/**
 * Ocean Banner — Minimal abstract ocean scene with layered waves,
 * light rays, floating particles, and caustic floor patterns
 */
export default function OceanBanner() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 280" width="100%" preserveAspectRatio="xMidYMid slice" style={{ display: 'block' }}>
      <defs>
        {/* Deep ocean gradient — darker at bottom, lighter at top */}
        <linearGradient id="ob-ocean" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#87ceeb" />
          <stop offset="25%" stopColor="#2980b9" />
          <stop offset="60%" stopColor="#1a4c7a" />
          <stop offset="100%" stopColor="#0c2340" />
        </linearGradient>

        {/* Light ray gradient — fades from translucent white to transparent */}
        <linearGradient id="ob-ray" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
          <stop offset="60%" stopColor="rgba(255,255,255,0.03)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>

        {/* Caustic light radial gradients for the floor */}
        <radialGradient id="ob-caustic1" cx="20%" cy="90%" r="25%">
          <stop offset="0%" stopColor="rgba(135,206,235,0.12)" />
          <stop offset="100%" stopColor="rgba(135,206,235,0)" />
        </radialGradient>
        <radialGradient id="ob-caustic2" cx="55%" cy="88%" r="20%">
          <stop offset="0%" stopColor="rgba(41,128,185,0.10)" />
          <stop offset="100%" stopColor="rgba(41,128,185,0)" />
        </radialGradient>
        <radialGradient id="ob-caustic3" cx="80%" cy="92%" r="22%">
          <stop offset="0%" stopColor="rgba(135,206,235,0.09)" />
          <stop offset="100%" stopColor="rgba(135,206,235,0)" />
        </radialGradient>

        {/* Wave fill gradients */}
        <linearGradient id="ob-wave1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(135,206,235,0.15)" />
          <stop offset="100%" stopColor="rgba(135,206,235,0.02)" />
        </linearGradient>
        <linearGradient id="ob-wave2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(41,128,185,0.12)" />
          <stop offset="100%" stopColor="rgba(41,128,185,0.02)" />
        </linearGradient>
        <linearGradient id="ob-wave3" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(26,76,122,0.10)" />
          <stop offset="100%" stopColor="rgba(26,76,122,0.01)" />
        </linearGradient>
        <linearGradient id="ob-wave4" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(12,35,64,0.08)" />
          <stop offset="100%" stopColor="rgba(12,35,64,0.01)" />
        </linearGradient>
      </defs>

      {/* ══ BACKGROUND ══ */}
      <rect width="1200" height="280" fill="url(#ob-ocean)" />

      {/* ══ LIGHT RAYS FROM SURFACE ══ */}

      {/* Ray 1 — left diagonal beam */}
      <polygon points="160,0 230,0 330,280 200,280" fill="url(#ob-ray)" opacity="0.7">
        <animate attributeName="opacity" values="0.7;0.35;0.7" dur="8s" repeatCount="indefinite" />
      </polygon>

      {/* Ray 2 — center-right diagonal beam */}
      <polygon points="620,0 700,0 780,280 640,280" fill="url(#ob-ray)" opacity="0.5">
        <animate attributeName="opacity" values="0.5;0.25;0.6;0.5" dur="11s" repeatCount="indefinite" />
      </polygon>

      {/* Ray 3 — far right beam, narrower */}
      <polygon points="950,0 1000,0 1060,280 960,280" fill="url(#ob-ray)" opacity="0.4">
        <animate attributeName="opacity" values="0.4;0.2;0.45;0.4" dur="9.5s" repeatCount="indefinite" />
      </polygon>

      {/* ══ CAUSTIC LIGHT PATTERNS ON THE FLOOR ══ */}
      <rect width="1200" height="280" fill="url(#ob-caustic1)" opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.4;0.8" dur="7s" repeatCount="indefinite" />
      </rect>
      <rect width="1200" height="280" fill="url(#ob-caustic2)" opacity="0.6">
        <animate attributeName="opacity" values="0.6;0.9;0.6" dur="9s" repeatCount="indefinite" />
      </rect>
      <rect width="1200" height="280" fill="url(#ob-caustic3)" opacity="0.5">
        <animate attributeName="opacity" values="0.5;0.8;0.5" dur="11s" repeatCount="indefinite" />
      </rect>

      {/* Caustic mesh lines — subtle wiggly light reflections near the bottom */}
      <path
        d="M0 255 Q60 248 120 255 Q180 262 240 255 Q300 248 360 255 Q420 262 480 255
           Q540 248 600 255 Q660 262 720 255 Q780 248 840 255 Q900 262 960 255
           Q1020 248 1080 255 Q1140 262 1200 255"
        stroke="rgba(135,206,235,0.07)" strokeWidth="1.5" fill="none"
      >
        <animate attributeName="d"
          values="
            M0 255 Q60 248 120 255 Q180 262 240 255 Q300 248 360 255 Q420 262 480 255 Q540 248 600 255 Q660 262 720 255 Q780 248 840 255 Q900 262 960 255 Q1020 248 1080 255 Q1140 262 1200 255;
            M0 255 Q60 262 120 255 Q180 248 240 255 Q300 262 360 255 Q420 248 480 255 Q540 262 600 255 Q660 248 720 255 Q780 262 840 255 Q900 248 960 255 Q1020 262 1080 255 Q1140 248 1200 255;
            M0 255 Q60 248 120 255 Q180 262 240 255 Q300 248 360 255 Q420 262 480 255 Q540 248 600 255 Q660 262 720 255 Q780 248 840 255 Q900 262 960 255 Q1020 248 1080 255 Q1140 262 1200 255"
          dur="10s" repeatCount="indefinite"
        />
      </path>
      <path
        d="M0 265 Q80 258 160 265 Q240 272 320 265 Q400 258 480 265
           Q560 272 640 265 Q720 258 800 265 Q880 272 960 265
           Q1040 258 1120 265 Q1160 272 1200 265"
        stroke="rgba(135,206,235,0.05)" strokeWidth="1" fill="none"
      >
        <animate attributeName="d"
          values="
            M0 265 Q80 258 160 265 Q240 272 320 265 Q400 258 480 265 Q560 272 640 265 Q720 258 800 265 Q880 272 960 265 Q1040 258 1120 265 Q1160 272 1200 265;
            M0 265 Q80 272 160 265 Q240 258 320 265 Q400 272 480 265 Q560 258 640 265 Q720 272 800 265 Q880 258 960 265 Q1040 272 1120 265 Q1160 258 1200 265;
            M0 265 Q80 258 160 265 Q240 272 320 265 Q400 258 480 265 Q560 272 640 265 Q720 258 800 265 Q880 272 960 265 Q1040 258 1120 265 Q1160 272 1200 265"
          dur="12s" repeatCount="indefinite"
        />
      </path>

      {/* ══ WAVE LAYER 1 — Topmost, fastest, lightest ══ */}
      <g>
        <animateTransform
          attributeName="transform" type="translate"
          values="0,0;-60,0;0,0;60,0;0,0"
          dur="12s" repeatCount="indefinite"
        />
        <path
          d="M-100 42 Q0 28 100 42 Q200 56 300 42 Q400 28 500 42 Q600 56 700 42
             Q800 28 900 42 Q1000 56 1100 42 Q1200 28 1300 42 L1300 80 L-100 80 Z"
          fill="url(#ob-wave1)" opacity="0.8"
        >
          <animate attributeName="d"
            values="
              M-100 42 Q0 28 100 42 Q200 56 300 42 Q400 28 500 42 Q600 56 700 42 Q800 28 900 42 Q1000 56 1100 42 Q1200 28 1300 42 L1300 80 L-100 80 Z;
              M-100 42 Q0 56 100 42 Q200 28 300 42 Q400 56 500 42 Q600 28 700 42 Q800 56 900 42 Q1000 28 1100 42 Q1200 56 1300 42 L1300 80 L-100 80 Z;
              M-100 42 Q0 28 100 42 Q200 56 300 42 Q400 28 500 42 Q600 56 700 42 Q800 28 900 42 Q1000 56 1100 42 Q1200 28 1300 42 L1300 80 L-100 80 Z"
            dur="7s" repeatCount="indefinite"
          />
        </path>
      </g>

      {/* ══ WAVE LAYER 2 — Mid-upper, medium speed ══ */}
      <g>
        <animateTransform
          attributeName="transform" type="translate"
          values="0,0;45,0;0,0;-45,0;0,0"
          dur="16s" repeatCount="indefinite"
        />
        <path
          d="M-100 70 Q50 58 200 70 Q350 82 500 70 Q650 58 800 70
             Q950 82 1100 70 Q1200 58 1300 70 L1300 115 L-100 115 Z"
          fill="url(#ob-wave2)" opacity="0.7"
        >
          <animate attributeName="d"
            values="
              M-100 70 Q50 58 200 70 Q350 82 500 70 Q650 58 800 70 Q950 82 1100 70 Q1200 58 1300 70 L1300 115 L-100 115 Z;
              M-100 70 Q50 82 200 70 Q350 58 500 70 Q650 82 800 70 Q950 58 1100 70 Q1200 82 1300 70 L1300 115 L-100 115 Z;
              M-100 70 Q50 58 200 70 Q350 82 500 70 Q650 58 800 70 Q950 82 1100 70 Q1200 58 1300 70 L1300 115 L-100 115 Z"
            dur="9s" repeatCount="indefinite"
          />
        </path>
      </g>

      {/* ══ WAVE LAYER 3 — Mid-lower, slower ══ */}
      <g>
        <animateTransform
          attributeName="transform" type="translate"
          values="0,0;-35,0;0,0;35,0;0,0"
          dur="20s" repeatCount="indefinite"
        />
        <path
          d="M-100 110 Q100 98 300 110 Q500 122 700 110
             Q900 98 1100 110 Q1200 122 1300 110 L1300 160 L-100 160 Z"
          fill="url(#ob-wave3)" opacity="0.6"
        >
          <animate attributeName="d"
            values="
              M-100 110 Q100 98 300 110 Q500 122 700 110 Q900 98 1100 110 Q1200 122 1300 110 L1300 160 L-100 160 Z;
              M-100 110 Q100 122 300 110 Q500 98 700 110 Q900 122 1100 110 Q1200 98 1300 110 L1300 160 L-100 160 Z;
              M-100 110 Q100 98 300 110 Q500 122 700 110 Q900 98 1100 110 Q1200 122 1300 110 L1300 160 L-100 160 Z"
            dur="11s" repeatCount="indefinite"
          />
        </path>
      </g>

      {/* ══ WAVE LAYER 4 — Deepest, slowest, most subtle ══ */}
      <g>
        <animateTransform
          attributeName="transform" type="translate"
          values="0,0;25,0;0,0;-25,0;0,0"
          dur="26s" repeatCount="indefinite"
        />
        <path
          d="M-100 160 Q150 150 400 160 Q650 170 900 160
             Q1100 150 1300 160 L1300 200 L-100 200 Z"
          fill="url(#ob-wave4)" opacity="0.5"
        >
          <animate attributeName="d"
            values="
              M-100 160 Q150 150 400 160 Q650 170 900 160 Q1100 150 1300 160 L1300 200 L-100 200 Z;
              M-100 160 Q150 170 400 160 Q650 150 900 160 Q1100 170 1300 160 L1300 200 L-100 200 Z;
              M-100 160 Q150 150 400 160 Q650 170 900 160 Q1100 150 1300 160 L1300 200 L-100 200 Z"
            dur="14s" repeatCount="indefinite"
          />
        </path>
      </g>

      {/* ══ FLOATING PARTICLES — tiny dots drifting slowly upward ══ */}

      {/* Particle 1 */}
      <circle cx="120" cy="220" r="1.2" fill="rgba(255,255,255,0.15)">
        <animate attributeName="cy" values="220;40" dur="18s" repeatCount="indefinite" />
        <animate attributeName="cx" values="120;130;115;125;120" dur="18s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0;0.15;0.15;0" dur="18s" repeatCount="indefinite" />
      </circle>

      {/* Particle 2 */}
      <circle cx="310" cy="240" r="1" fill="rgba(255,255,255,0.12)">
        <animate attributeName="cy" values="240;30" dur="22s" begin="2s" repeatCount="indefinite" />
        <animate attributeName="cx" values="310;318;304;312;310" dur="22s" begin="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0;0.12;0.12;0" dur="22s" begin="2s" repeatCount="indefinite" />
      </circle>

      {/* Particle 3 */}
      <circle cx="530" cy="200" r="1.4" fill="rgba(255,255,255,0.13)">
        <animate attributeName="cy" values="200;25" dur="20s" begin="5s" repeatCount="indefinite" />
        <animate attributeName="cx" values="530;540;525;535;530" dur="20s" begin="5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0;0.13;0.13;0" dur="20s" begin="5s" repeatCount="indefinite" />
      </circle>

      {/* Particle 4 */}
      <circle cx="720" cy="250" r="1.1" fill="rgba(255,255,255,0.11)">
        <animate attributeName="cy" values="250;35" dur="24s" begin="8s" repeatCount="indefinite" />
        <animate attributeName="cx" values="720;728;714;722;720" dur="24s" begin="8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0;0.11;0.11;0" dur="24s" begin="8s" repeatCount="indefinite" />
      </circle>

      {/* Particle 5 */}
      <circle cx="890" cy="230" r="1.3" fill="rgba(255,255,255,0.14)">
        <animate attributeName="cy" values="230;20" dur="19s" begin="3s" repeatCount="indefinite" />
        <animate attributeName="cx" values="890;898;884;892;890" dur="19s" begin="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0;0.14;0.14;0" dur="19s" begin="3s" repeatCount="indefinite" />
      </circle>

      {/* Particle 6 */}
      <circle cx="1050" cy="210" r="1" fill="rgba(255,255,255,0.10)">
        <animate attributeName="cy" values="210;30" dur="21s" begin="10s" repeatCount="indefinite" />
        <animate attributeName="cx" values="1050;1058;1044;1052;1050" dur="21s" begin="10s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0;0.10;0.10;0" dur="21s" begin="10s" repeatCount="indefinite" />
      </circle>

      {/* Particle 7 */}
      <circle cx="200" cy="260" r="0.9" fill="rgba(255,255,255,0.10)">
        <animate attributeName="cy" values="260;50" dur="25s" begin="6s" repeatCount="indefinite" />
        <animate attributeName="cx" values="200;206;196;204;200" dur="25s" begin="6s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0;0.10;0.10;0" dur="25s" begin="6s" repeatCount="indefinite" />
      </circle>

      {/* Particle 8 */}
      <circle cx="650" cy="180" r="1.1" fill="rgba(255,255,255,0.12)">
        <animate attributeName="cy" values="180;15" dur="17s" begin="12s" repeatCount="indefinite" />
        <animate attributeName="cx" values="650;656;644;652;650" dur="17s" begin="12s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0;0.12;0.12;0" dur="17s" begin="12s" repeatCount="indefinite" />
      </circle>

      {/* Particle 9 — larger, slower, very subtle */}
      <circle cx="420" cy="270" r="1.6" fill="rgba(255,255,255,0.08)">
        <animate attributeName="cy" values="270;10" dur="30s" begin="4s" repeatCount="indefinite" />
        <animate attributeName="cx" values="420;432;412;426;420" dur="30s" begin="4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0;0.08;0.08;0" dur="30s" begin="4s" repeatCount="indefinite" />
      </circle>

      {/* Particle 10 */}
      <circle cx="1150" cy="245" r="0.8" fill="rgba(255,255,255,0.09)">
        <animate attributeName="cy" values="245;45" dur="23s" begin="14s" repeatCount="indefinite" />
        <animate attributeName="cx" values="1150;1156;1146;1154;1150" dur="23s" begin="14s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0;0.09;0.09;0" dur="23s" begin="14s" repeatCount="indefinite" />
      </circle>

      {/* ══ SUBTLE SURFACE SHIMMER — top edge highlight ══ */}
      <rect x="0" y="0" width="1200" height="3" fill="rgba(255,255,255,0.08)">
        <animate attributeName="opacity" values="0.08;0.15;0.06;0.12;0.08" dur="6s" repeatCount="indefinite" />
      </rect>
      <rect x="0" y="3" width="1200" height="2" fill="rgba(135,206,235,0.06)">
        <animate attributeName="opacity" values="0.06;0.10;0.04;0.08;0.06" dur="8s" repeatCount="indefinite" />
      </rect>
    </svg>
  )
}
