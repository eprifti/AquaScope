/**
 * Planted Banner — Lush freshwater planted aquarium with swaying plants, schooling fish, and CO2 bubbles
 */
export default function PlantedBanner() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 280" width="100%" style={{ display: 'block' }}>
      <defs>
        {/* Tannin-tinted freshwater gradient */}
        <linearGradient id="pb-water" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#d4e6b5" />
          <stop offset="25%" stopColor="#a8c686" />
          <stop offset="60%" stopColor="#5a7a3a" />
          <stop offset="100%" stopColor="#2d4a1a" />
        </linearGradient>
        {/* Dark soil substrate */}
        <linearGradient id="pb-soil" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2c1e0f" />
          <stop offset="30%" stopColor="#3d2b18" />
          <stop offset="70%" stopColor="#302010" />
          <stop offset="100%" stopColor="#241a0c" />
        </linearGradient>
        {/* Driftwood grain */}
        <linearGradient id="pb-wood" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5c3a1e" />
          <stop offset="50%" stopColor="#7a4f2e" />
          <stop offset="100%" stopColor="#4a2e14" />
        </linearGradient>
        {/* Caustic light from above — warm tones */}
        <radialGradient id="pb-c1" cx="30%" cy="10%" r="45%">
          <stop offset="0%" stopColor="rgba(255,255,220,0.25)" />
          <stop offset="100%" stopColor="rgba(255,255,220,0)" />
        </radialGradient>
        <radialGradient id="pb-c2" cx="60%" cy="20%" r="35%">
          <stop offset="0%" stopColor="rgba(255,240,180,0.18)" />
          <stop offset="100%" stopColor="rgba(255,240,180,0)" />
        </radialGradient>
        <radialGradient id="pb-c3" cx="85%" cy="12%" r="30%">
          <stop offset="0%" stopColor="rgba(255,255,200,0.14)" />
          <stop offset="100%" stopColor="rgba(255,255,200,0)" />
        </radialGradient>
        {/* CO2 bubble shimmer */}
        <radialGradient id="pb-bubble" cx="40%" cy="30%" r="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.2)" />
        </radialGradient>
      </defs>

      {/* Background water */}
      <rect width="1200" height="280" fill="url(#pb-water)" rx="12" />

      {/* Caustic light ripples */}
      <rect width="1200" height="280" fill="url(#pb-c1)" rx="12" opacity="0.6">
        <animate attributeName="opacity" values="0.6;0.25;0.6" dur="8s" repeatCount="indefinite" />
      </rect>
      <rect width="1200" height="280" fill="url(#pb-c2)" rx="12" opacity="0.4">
        <animate attributeName="opacity" values="0.4;0.65;0.4" dur="11s" repeatCount="indefinite" />
      </rect>
      <rect width="1200" height="280" fill="url(#pb-c3)" rx="12" opacity="0.3">
        <animate attributeName="opacity" values="0.3;0.5;0.3" dur="9s" repeatCount="indefinite" />
      </rect>

      {/* Warm light rays from above */}
      <polygon points="150,0 220,0 300,280 170,280" fill="rgba(255,255,200,0.04)">
        <animate attributeName="opacity" values="0.04;0.09;0.04" dur="7s" repeatCount="indefinite" />
      </polygon>
      <polygon points="550,0 610,0 680,280 520,280" fill="rgba(255,255,200,0.035)">
        <animate attributeName="opacity" values="0.035;0.07;0.035" dur="9s" repeatCount="indefinite" />
      </polygon>
      <polygon points="900,0 950,0 1010,280 860,280" fill="rgba(255,255,200,0.03)">
        <animate attributeName="opacity" values="0.03;0.06;0.03" dur="6s" repeatCount="indefinite" />
      </polygon>

      {/* ══ SUBSTRATE ══ */}
      {/* Dark aquasoil base */}
      <ellipse cx="600" cy="280" rx="660" ry="42" fill="#2c1e0f" opacity="0.9" />
      <ellipse cx="600" cy="283" rx="640" ry="32" fill="#3d2b18" opacity="0.7" />
      {/* Gravel texture spots */}
      <circle cx="100" cy="272" r="2" fill="#1a1008" opacity="0.4" />
      <circle cx="250" cy="275" r="1.5" fill="#1a1008" opacity="0.3" />
      <circle cx="400" cy="270" r="2" fill="#241a0c" opacity="0.35" />
      <circle cx="600" cy="274" r="1.8" fill="#1a1008" opacity="0.3" />
      <circle cx="800" cy="271" r="2" fill="#241a0c" opacity="0.4" />
      <circle cx="1000" cy="273" r="1.5" fill="#1a1008" opacity="0.35" />
      <circle cx="1150" cy="276" r="1.8" fill="#241a0c" opacity="0.3" />

      {/* ══ DWARF HAIRGRASS CARPET ══ */}
      {/* Dense foreground carpet across the bottom */}
      <g opacity="0.85">
        {/* Left section */}
        <g>
          <animateTransform attributeName="transform" type="rotate" values="-0.8 100 262;0.8 100 262;-0.8 100 262" dur="4s" repeatCount="indefinite" />
          <path d="M60 268 Q62 256 64 248" stroke="#4a8c28" strokeWidth="1.2" fill="none" />
          <path d="M65 268 Q66 258 68 250" stroke="#5a9c32" strokeWidth="1" fill="none" />
          <path d="M70 268 Q71 257 72 249" stroke="#4a8c28" strokeWidth="1.2" fill="none" />
          <path d="M75 268 Q77 256 78 247" stroke="#5a9c32" strokeWidth="1" fill="none" />
          <path d="M80 268 Q81 258 83 250" stroke="#4a8c28" strokeWidth="1.2" fill="none" />
          <path d="M85 268 Q86 257 88 249" stroke="#5a9c32" strokeWidth="1" fill="none" />
          <path d="M90 268 Q92 256 93 248" stroke="#4a8c28" strokeWidth="1.2" fill="none" />
          <path d="M95 268 Q96 258 98 250" stroke="#5a9c32" strokeWidth="1" fill="none" />
          <path d="M100 268 Q101 257 103 248" stroke="#4a8c28" strokeWidth="1.2" fill="none" />
          <path d="M105 268 Q106 256 108 249" stroke="#5a9c32" strokeWidth="1" fill="none" />
          <path d="M110 268 Q112 258 113 250" stroke="#4a8c28" strokeWidth="1.2" fill="none" />
          <path d="M115 268 Q116 257 118 249" stroke="#5a9c32" strokeWidth="1" fill="none" />
          <path d="M120 268 Q121 256 122 248" stroke="#4a8c28" strokeWidth="1" fill="none" />
        </g>
        {/* Center-left section */}
        <g>
          <animateTransform attributeName="transform" type="rotate" values="0.6 280 262;-0.6 280 262;0.6 280 262" dur="4.5s" repeatCount="indefinite" />
          <path d="M240 268 Q242 256 243 249" stroke="#4a8c28" strokeWidth="1.2" fill="none" />
          <path d="M245 268 Q246 257 248 249" stroke="#5a9c32" strokeWidth="1" fill="none" />
          <path d="M250 268 Q251 256 253 248" stroke="#4a8c28" strokeWidth="1.2" fill="none" />
          <path d="M255 268 Q257 258 258 250" stroke="#5a9c32" strokeWidth="1" fill="none" />
          <path d="M260 268 Q261 257 263 249" stroke="#4a8c28" strokeWidth="1.2" fill="none" />
          <path d="M265 268 Q266 256 268 248" stroke="#5a9c32" strokeWidth="1" fill="none" />
          <path d="M270 268 Q272 258 273 250" stroke="#4a8c28" strokeWidth="1.2" fill="none" />
          <path d="M275 268 Q276 257 278 248" stroke="#5a9c32" strokeWidth="1" fill="none" />
          <path d="M280 268 Q281 256 283 249" stroke="#4a8c28" strokeWidth="1" fill="none" />
          <path d="M285 268 Q286 258 288 250" stroke="#5a9c32" strokeWidth="1" fill="none" />
          <path d="M290 268 Q291 257 293 249" stroke="#4a8c28" strokeWidth="1.2" fill="none" />
          <path d="M295 268 Q296 256 298 248" stroke="#5a9c32" strokeWidth="1" fill="none" />
          <path d="M300 268 Q302 258 303 250" stroke="#4a8c28" strokeWidth="1" fill="none" />
        </g>
        {/* Right section */}
        <g>
          <animateTransform attributeName="transform" type="rotate" values="-0.5 950 262;0.5 950 262;-0.5 950 262" dur="5s" repeatCount="indefinite" />
          <path d="M900 268 Q902 256 903 249" stroke="#4a8c28" strokeWidth="1.2" fill="none" />
          <path d="M905 268 Q906 258 908 250" stroke="#5a9c32" strokeWidth="1" fill="none" />
          <path d="M910 268 Q911 257 913 249" stroke="#4a8c28" strokeWidth="1.2" fill="none" />
          <path d="M915 268 Q917 256 918 248" stroke="#5a9c32" strokeWidth="1" fill="none" />
          <path d="M920 268 Q921 258 923 250" stroke="#4a8c28" strokeWidth="1.2" fill="none" />
          <path d="M925 268 Q926 257 928 249" stroke="#5a9c32" strokeWidth="1" fill="none" />
          <path d="M930 268 Q932 256 933 248" stroke="#4a8c28" strokeWidth="1.2" fill="none" />
          <path d="M935 268 Q936 258 938 250" stroke="#5a9c32" strokeWidth="1" fill="none" />
          <path d="M940 268 Q941 257 943 249" stroke="#4a8c28" strokeWidth="1" fill="none" />
          <path d="M945 268 Q946 256 948 248" stroke="#5a9c32" strokeWidth="1.2" fill="none" />
          <path d="M950 268 Q952 258 953 250" stroke="#4a8c28" strokeWidth="1" fill="none" />
          <path d="M955 268 Q956 257 958 249" stroke="#5a9c32" strokeWidth="1.2" fill="none" />
          <path d="M960 268 Q962 256 963 248" stroke="#4a8c28" strokeWidth="1" fill="none" />
          <path d="M965 268 Q966 258 968 250" stroke="#5a9c32" strokeWidth="1" fill="none" />
          <path d="M970 268 Q971 257 973 249" stroke="#4a8c28" strokeWidth="1.2" fill="none" />
          <path d="M975 268 Q976 256 978 248" stroke="#5a9c32" strokeWidth="1" fill="none" />
          <path d="M980 268 Q981 258 983 250" stroke="#4a8c28" strokeWidth="1" fill="none" />
          <path d="M985 268 Q986 257 988 249" stroke="#5a9c32" strokeWidth="1.2" fill="none" />
          <path d="M990 268 Q991 256 993 248" stroke="#4a8c28" strokeWidth="1" fill="none" />
        </g>
      </g>

      {/* ══ DRIFTWOOD ══ */}
      {/* Main driftwood piece — spans center-left */}
      <path d="M320 265 Q350 248 420 238 Q480 232 530 240 Q560 245 580 258"
        stroke="#5c3a1e" strokeWidth="14" fill="none" strokeLinecap="round" />
      <path d="M340 262 Q370 246 430 237 Q485 232 540 242 Q565 248 575 255"
        stroke="#7a4f2e" strokeWidth="8" fill="none" strokeLinecap="round" />
      {/* Branch going up */}
      <path d="M420 238 Q400 215 380 190 Q370 175 365 162"
        stroke="#5c3a1e" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M425 236 Q408 218 392 198"
        stroke="#7a4f2e" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* Small branch offshoot */}
      <path d="M400 215 Q385 205 375 195"
        stroke="#5c3a1e" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* Right offshoot */}
      <path d="M480 234 Q500 218 520 208"
        stroke="#5c3a1e" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M485 235 Q502 222 515 214"
        stroke="#7a4f2e" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Wood texture details */}
      <path d="M360 258 Q390 246 430 238" stroke="#4a2e14" strokeWidth="1" fill="none" opacity="0.5" />
      <path d="M450 235 Q490 233 530 242" stroke="#4a2e14" strokeWidth="1" fill="none" opacity="0.4" />

      {/* ══ PLANTS ══ */}

      {/* 1. Tall Vallisneria — far left, swaying */}
      <g>
        <animateTransform attributeName="transform" type="rotate" values="-3 50 268;3 50 268;-3 50 268" dur="4s" repeatCount="indefinite" />
        <path d="M50 268 Q45 220 38 170 Q32 130 28 80 Q26 60 30 40" stroke="#3d8b24" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M50 268 Q55 215 58 165 Q60 125 56 85 Q54 65 50 45" stroke="#4a9c2e" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M55 268 Q62 225 68 180 Q72 145 70 110 Q68 90 65 70" stroke="#3d8b24" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M45 268 Q38 230 32 185 Q28 150 30 115 Q32 95 36 75" stroke="#4a9c2e" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M58 268 Q65 230 72 190 Q78 155 76 125 Q74 105 72 85" stroke="#5aac38" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </g>

      {/* 2. Vallisneria — behind driftwood */}
      <g>
        <animateTransform attributeName="transform" type="rotate" values="2 450 268;-2.5 450 268;2 450 268" dur="4.5s" repeatCount="indefinite" />
        <path d="M445 268 Q440 220 435 170 Q432 130 435 90 Q436 70 440 50" stroke="#3d8b24" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M450 268 Q455 218 458 168 Q460 130 456 92 Q454 72 450 55" stroke="#4a9c2e" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M455 268 Q460 225 465 180 Q468 145 464 110 Q462 90 458 70" stroke="#5aac38" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M440 268 Q434 228 430 185 Q428 150 432 115 Q434 95 438 75" stroke="#3d8b24" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </g>

      {/* 3. Vallisneria — far right */}
      <g>
        <animateTransform attributeName="transform" type="rotate" values="-2 1140 268;3 1140 268;-2 1140 268" dur="5s" repeatCount="indefinite" />
        <path d="M1135 268 Q1130 215 1125 165 Q1120 120 1125 80 Q1128 60 1132 40" stroke="#3d8b24" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M1140 268 Q1145 220 1148 170 Q1150 130 1146 90 Q1144 70 1140 50" stroke="#4a9c2e" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M1148 268 Q1155 225 1160 180 Q1162 140 1158 100 Q1155 80 1152 60" stroke="#5aac38" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M1130 268 Q1122 228 1118 185 Q1115 148 1118 112 Q1120 92 1125 72" stroke="#3d8b24" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </g>

      {/* 4. Amazon Sword — large, center-right */}
      <g>
        <animateTransform attributeName="transform" type="rotate" values="-1.5 780 265;1.5 780 265;-1.5 780 265" dur="5s" repeatCount="indefinite" />
        {/* Central leaves */}
        <path d="M780 265 Q775 230 770 195 Q768 178 770 165" stroke="#3a7a20" strokeWidth="2" fill="none" />
        <ellipse cx="770" cy="195" rx="14" ry="40" fill="#3a7a20" opacity="0.7" transform="rotate(-5, 770, 195)" />
        <path d="M780 265 Q785 225 790 190 Q792 175 790 160" stroke="#3a7a20" strokeWidth="2" fill="none" />
        <ellipse cx="790" cy="190" rx="13" ry="38" fill="#4a8a2a" opacity="0.7" transform="rotate(5, 790, 190)" />
        {/* Outer leaves */}
        <path d="M780 265 Q765 235 750 205 Q742 190 740 178" stroke="#2e6a18" strokeWidth="1.8" fill="none" />
        <ellipse cx="752" cy="208" rx="12" ry="32" fill="#2e6a18" opacity="0.6" transform="rotate(-20, 752, 208)" />
        <path d="M780 265 Q798 232 812 200 Q818 188 820 175" stroke="#2e6a18" strokeWidth="1.8" fill="none" />
        <ellipse cx="810" cy="205" rx="11" ry="30" fill="#4a8a2a" opacity="0.6" transform="rotate(18, 810, 205)" />
        {/* Back leaves */}
        <path d="M780 265 Q758 240 738 215 Q728 200 725 188" stroke="#2e6a18" strokeWidth="1.5" fill="none" />
        <ellipse cx="740" cy="218" rx="10" ry="28" fill="#2e6a18" opacity="0.5" transform="rotate(-28, 740, 218)" />
        <path d="M780 265 Q802 238 822 210 Q830 198 835 185" stroke="#2e6a18" strokeWidth="1.5" fill="none" />
        <ellipse cx="822" cy="215" rx="10" ry="28" fill="#4a8a2a" opacity="0.5" transform="rotate(25, 822, 215)" />
      </g>

      {/* 5. Amazon Sword — smaller, far right-center */}
      <g>
        <animateTransform attributeName="transform" type="rotate" values="1 1050 265;-1 1050 265;1 1050 265" dur="5.5s" repeatCount="indefinite" />
        <path d="M1050 265 Q1045 238 1040 210 Q1038 198 1040 188" stroke="#3a7a20" strokeWidth="1.8" fill="none" />
        <ellipse cx="1042" cy="215" rx="10" ry="28" fill="#3a7a20" opacity="0.65" transform="rotate(-6, 1042, 215)" />
        <path d="M1050 265 Q1055 235 1060 208 Q1062 196 1060 186" stroke="#4a8a2a" strokeWidth="1.8" fill="none" />
        <ellipse cx="1058" cy="212" rx="10" ry="28" fill="#4a8a2a" opacity="0.65" transform="rotate(6, 1058, 212)" />
        <path d="M1050 265 Q1035 242 1025 220 Q1018 208 1018 198" stroke="#2e6a18" strokeWidth="1.5" fill="none" />
        <ellipse cx="1028" cy="222" rx="8" ry="24" fill="#2e6a18" opacity="0.5" transform="rotate(-18, 1028, 222)" />
        <path d="M1050 265 Q1065 240 1075 218 Q1080 206 1080 196" stroke="#2e6a18" strokeWidth="1.5" fill="none" />
        <ellipse cx="1072" cy="222" rx="8" ry="24" fill="#4a8a2a" opacity="0.5" transform="rotate(16, 1072, 222)" />
      </g>

      {/* 6. Anubias on driftwood — attached to main branch */}
      <g>
        <animateTransform attributeName="transform" type="rotate" values="-0.5 405 210;0.5 405 210;-0.5 405 210" dur="6s" repeatCount="indefinite" />
        {/* Thick rhizome on wood */}
        <path d="M390 218 Q400 215 415 212 Q425 210 435 212" stroke="#2d5a14" strokeWidth="4" fill="none" strokeLinecap="round" />
        {/* Broad, dark leaves */}
        <ellipse cx="395" cy="198" rx="12" ry="18" fill="#1e5010" opacity="0.8" transform="rotate(-15, 395, 198)" />
        <ellipse cx="410" cy="194" rx="14" ry="20" fill="#265a14" opacity="0.8" transform="rotate(5, 410, 194)" />
        <ellipse cx="425" cy="196" rx="12" ry="17" fill="#1e5010" opacity="0.75" transform="rotate(20, 425, 196)" />
        <ellipse cx="400" cy="202" rx="10" ry="14" fill="#2d6a1a" opacity="0.6" transform="rotate(-25, 400, 202)" />
        {/* Leaf veins */}
        <line x1="395" y1="210" x2="395" y2="185" stroke="#1a4010" strokeWidth="0.8" opacity="0.4" />
        <line x1="410" y1="208" x2="410" y2="180" stroke="#1a4010" strokeWidth="0.8" opacity="0.4" />
        <line x1="425" y1="209" x2="425" y2="184" stroke="#1a4010" strokeWidth="0.8" opacity="0.4" />
      </g>

      {/* 7. Bucephalandra — on driftwood near base */}
      <g>
        <animateTransform attributeName="transform" type="rotate" values="0.4 540 245;-0.4 540 245;0.4 540 245" dur="5.5s" repeatCount="indefinite" />
        {/* Small compact rhizome */}
        <path d="M530 248 Q538 246 545 244 Q552 243 558 244" stroke="#1a4a10" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* Small shiny leaves */}
        <ellipse cx="534" cy="236" rx="6" ry="10" fill="#1a5518" opacity="0.8" transform="rotate(-12, 534, 236)" />
        <ellipse cx="542" cy="234" rx="7" ry="11" fill="#22601e" opacity="0.8" transform="rotate(3, 542, 234)" />
        <ellipse cx="550" cy="235" rx="6" ry="10" fill="#1a5518" opacity="0.75" transform="rotate(15, 550, 235)" />
        <ellipse cx="556" cy="237" rx="5.5" ry="9" fill="#22601e" opacity="0.7" transform="rotate(22, 556, 237)" />
        {/* Metallic sheen on leaves */}
        <ellipse cx="542" cy="232" rx="3" ry="5" fill="rgba(255,255,255,0.08)" transform="rotate(3, 542, 232)" />
        <ellipse cx="550" cy="233" rx="2.5" ry="4.5" fill="rgba(255,255,255,0.06)" transform="rotate(15, 550, 233)" />
      </g>

      {/* 8. Java Fern — on right side of driftwood branch */}
      <g>
        <animateTransform attributeName="transform" type="rotate" values="-1 510 215;1 510 215;-1 510 215" dur="5s" repeatCount="indefinite" />
        {/* Rhizome attached to branch */}
        <path d="M502 218 Q510 215 520 212" stroke="#2a5a14" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* Long, narrow, wavy leaves */}
        <path d="M505 215 Q500 190 498 160 Q497 140 500 120" stroke="#2a5a14" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M510 213 Q512 185 514 155 Q515 135 512 115" stroke="#358a20" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <path d="M516 212 Q520 188 525 165 Q528 148 526 130" stroke="#2a5a14" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M508 215 Q502 195 496 172 Q492 155 494 138" stroke="#358a20" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Baby plantlets on leaf tips */}
        <circle cx="500" cy="118" r="3" fill="#4a9c2e" opacity="0.5" />
        <circle cx="512" cy="113" r="2.5" fill="#4a9c2e" opacity="0.5" />
        <circle cx="526" cy="128" r="2.5" fill="#4a9c2e" opacity="0.4" />
      </g>

      {/* 9. Floating plants at surface — Salvinia / Duckweed clusters */}
      <g>
        <animate attributeName="opacity" values="0.8;0.75;0.8" dur="4s" repeatCount="indefinite" />
        {/* Cluster 1 */}
        <g>
          <animateTransform attributeName="transform" type="translate" values="0,0;6,0;0,0;-4,0;0,0" dur="8s" repeatCount="indefinite" />
          <ellipse cx="80" cy="12" rx="18" ry="6" fill="#3a8520" opacity="0.7" />
          <ellipse cx="95" cy="14" rx="14" ry="5" fill="#4a9530" opacity="0.65" />
          <ellipse cx="68" cy="14" rx="12" ry="4.5" fill="#358020" opacity="0.6" />
          {/* Root dangling */}
          <line x1="80" y1="18" x2="80" y2="32" stroke="#3a7520" strokeWidth="0.8" opacity="0.4" />
          <line x1="90" y1="19" x2="90" y2="28" stroke="#3a7520" strokeWidth="0.6" opacity="0.3" />
        </g>
        {/* Cluster 2 */}
        <g>
          <animateTransform attributeName="transform" type="translate" values="0,0;-5,0;0,0;7,0;0,0" dur="10s" repeatCount="indefinite" />
          <ellipse cx="350" cy="10" rx="22" ry="7" fill="#3a8520" opacity="0.7" />
          <ellipse cx="370" cy="12" rx="16" ry="5.5" fill="#4a9530" opacity="0.65" />
          <ellipse cx="335" cy="13" rx="14" ry="5" fill="#358020" opacity="0.6" />
          <ellipse cx="380" cy="14" rx="10" ry="4" fill="#3a8520" opacity="0.55" />
          <line x1="350" y1="17" x2="350" y2="34" stroke="#3a7520" strokeWidth="0.8" opacity="0.4" />
          <line x1="365" y1="17" x2="365" y2="30" stroke="#3a7520" strokeWidth="0.6" opacity="0.3" />
        </g>
        {/* Cluster 3 */}
        <g>
          <animateTransform attributeName="transform" type="translate" values="0,0;4,0;0,0;-6,0;0,0" dur="9s" repeatCount="indefinite" />
          <ellipse cx="650" cy="11" rx="20" ry="6.5" fill="#3a8520" opacity="0.65" />
          <ellipse cx="668" cy="13" rx="15" ry="5" fill="#4a9530" opacity="0.6" />
          <ellipse cx="638" cy="14" rx="13" ry="4.5" fill="#358020" opacity="0.55" />
          <line x1="650" y1="17" x2="650" y2="30" stroke="#3a7520" strokeWidth="0.7" opacity="0.35" />
        </g>
        {/* Cluster 4 */}
        <g>
          <animateTransform attributeName="transform" type="translate" values="0,0;-3,0;0,0;5,0;0,0" dur="7s" repeatCount="indefinite" />
          <ellipse cx="1020" cy="12" rx="16" ry="5.5" fill="#3a8520" opacity="0.65" />
          <ellipse cx="1035" cy="14" rx="12" ry="4.5" fill="#4a9530" opacity="0.6" />
          <ellipse cx="1008" cy="14" rx="10" ry="4" fill="#358020" opacity="0.55" />
          <line x1="1020" y1="17" x2="1020" y2="28" stroke="#3a7520" strokeWidth="0.6" opacity="0.3" />
        </g>
      </g>

      {/* 10. Small Cryptocoryne — left foreground */}
      <g>
        <animateTransform attributeName="transform" type="rotate" values="-1 170 265;1 170 265;-1 170 265" dur="5s" repeatCount="indefinite" />
        <ellipse cx="162" cy="248" rx="7" ry="16" fill="#5a7a30" opacity="0.7" transform="rotate(-15, 162, 248)" />
        <ellipse cx="170" cy="245" rx="8" ry="18" fill="#4a6a24" opacity="0.7" transform="rotate(5, 170, 245)" />
        <ellipse cx="178" cy="247" rx="7" ry="16" fill="#5a7a30" opacity="0.65" transform="rotate(18, 178, 247)" />
        <ellipse cx="166" cy="252" rx="6" ry="12" fill="#6a8a3a" opacity="0.5" transform="rotate(-22, 166, 252)" />
      </g>

      {/* 11. Rotala — right side, reddish stems */}
      <g>
        <animateTransform attributeName="transform" type="rotate" values="1.5 860 268;-1.5 860 268;1.5 860 268" dur="4.5s" repeatCount="indefinite" />
        <path d="M850 268 Q848 235 845 200 Q843 180 845 160" stroke="#8a4a2a" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M855 268 Q856 232 858 198 Q859 178 856 158" stroke="#9a5a34" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M860 268 Q862 238 864 205 Q865 185 862 165" stroke="#8a4a2a" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M865 268 Q867 235 870 202 Q872 182 868 162" stroke="#9a5a34" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M870 268 Q872 240 875 210 Q876 190 873 170" stroke="#8a4a2a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        {/* Small reddish leaves along stems */}
        <ellipse cx="845" cy="180" rx="5" ry="3" fill="#a85a30" opacity="0.6" transform="rotate(-20, 845, 180)" />
        <ellipse cx="845" cy="195" rx="5" ry="3" fill="#b06a3a" opacity="0.55" transform="rotate(15, 845, 195)" />
        <ellipse cx="858" cy="178" rx="5" ry="3" fill="#a85a30" opacity="0.6" transform="rotate(10, 858, 178)" />
        <ellipse cx="858" cy="193" rx="4.5" ry="2.8" fill="#b06a3a" opacity="0.55" transform="rotate(-12, 858, 193)" />
        <ellipse cx="864" cy="185" rx="5" ry="3" fill="#a85a30" opacity="0.55" transform="rotate(-8, 864, 185)" />
        <ellipse cx="870" cy="182" rx="4.5" ry="2.8" fill="#b06a3a" opacity="0.55" transform="rotate(14, 870, 182)" />
        {/* Red-tinted tops */}
        <ellipse cx="845" cy="160" rx="6" ry="4" fill="#c45a30" opacity="0.7" />
        <ellipse cx="856" cy="158" rx="6" ry="4" fill="#d46a3a" opacity="0.7" />
        <ellipse cx="862" cy="165" rx="5.5" ry="3.5" fill="#c45a30" opacity="0.65" />
        <ellipse cx="868" cy="162" rx="5.5" ry="3.5" fill="#d46a3a" opacity="0.65" />
        <ellipse cx="873" cy="170" rx="5" ry="3.5" fill="#c45a30" opacity="0.6" />
      </g>

      {/* ══ FISH ══ */}

      {/* Cardinal Tetra school (6 small fish) */}
      <g>
        <animateTransform attributeName="transform" type="translate"
          values="-100,0;350,3;800,-2;800,0;350,-4;-100,2;-100,0"
          dur="18s" keyTimes="0;0.24;0.48;0.52;0.76;0.98;1" repeatCount="indefinite" />
        <g>
          <animateTransform attributeName="transform" type="scale"
            values="1,1;1,1;1,1;-1,1;-1,1;-1,1;1,1"
            dur="18s" keyTimes="0;0.48;0.49;0.50;0.98;0.99;1" repeatCount="indefinite" />
          {/* Tetra 1 */}
          <g transform="translate(0, 100)">
            <ellipse cx="0" cy="0" rx="7" ry="3.5" fill="#cc2222" />
            <rect x="-5" y="-2.5" width="7" height="5" fill="#1a4aff" opacity="0.7" rx="1" />
            <path d="M-7 0 L-10 -3 L-10 3 Z" fill="#dd3333" />
            <circle cx="4" cy="-1" r="1.2" fill="white" /><circle cx="4.3" cy="-1" r="0.6" fill="#111" />
          </g>
          {/* Tetra 2 */}
          <g transform="translate(15, 106)">
            <ellipse cx="0" cy="0" rx="6.5" ry="3.2" fill="#cc2222" />
            <rect x="-4.5" y="-2.2" width="6.5" height="4.4" fill="#1a4aff" opacity="0.7" rx="1" />
            <path d="M-6.5 0 L-9.5 -2.8 L-9.5 2.8 Z" fill="#dd3333" />
            <circle cx="3.5" cy="-1" r="1.1" fill="white" /><circle cx="3.8" cy="-1" r="0.55" fill="#111" />
          </g>
          {/* Tetra 3 */}
          <g transform="translate(-12, 108)">
            <ellipse cx="0" cy="0" rx="7" ry="3.5" fill="#cc2222" />
            <rect x="-5" y="-2.5" width="7" height="5" fill="#1a4aff" opacity="0.7" rx="1" />
            <path d="M-7 0 L-10 -3 L-10 3 Z" fill="#dd3333" />
            <circle cx="4" cy="-1" r="1.2" fill="white" /><circle cx="4.3" cy="-1" r="0.6" fill="#111" />
          </g>
          {/* Tetra 4 */}
          <g transform="translate(8, 114)">
            <ellipse cx="0" cy="0" rx="6.5" ry="3.2" fill="#bb1818" />
            <rect x="-4.5" y="-2.2" width="6.5" height="4.4" fill="#1a4aff" opacity="0.65" rx="1" />
            <path d="M-6.5 0 L-9.5 -2.8 L-9.5 2.8 Z" fill="#cc2222" />
            <circle cx="3.5" cy="-1" r="1.1" fill="white" /><circle cx="3.8" cy="-1" r="0.55" fill="#111" />
          </g>
          {/* Tetra 5 */}
          <g transform="translate(-6, 96)">
            <ellipse cx="0" cy="0" rx="6.8" ry="3.3" fill="#cc2222" />
            <rect x="-4.8" y="-2.3" width="6.8" height="4.6" fill="#1a4aff" opacity="0.7" rx="1" />
            <path d="M-6.8 0 L-9.8 -2.8 L-9.8 2.8 Z" fill="#dd3333" />
            <circle cx="3.8" cy="-1" r="1.1" fill="white" /><circle cx="4.1" cy="-1" r="0.55" fill="#111" />
          </g>
          {/* Tetra 6 */}
          <g transform="translate(22, 102)">
            <ellipse cx="0" cy="0" rx="6.5" ry="3.2" fill="#bb1818" />
            <rect x="-4.5" y="-2.2" width="6.5" height="4.4" fill="#1a4aff" opacity="0.65" rx="1" />
            <path d="M-6.5 0 L-9.5 -2.8 L-9.5 2.8 Z" fill="#cc2222" />
            <circle cx="3.5" cy="-1" r="1.1" fill="white" /><circle cx="3.8" cy="-1" r="0.55" fill="#111" />
          </g>
        </g>
      </g>

      {/* Corydoras 1 — bottom dweller, left */}
      <g>
        <animateTransform attributeName="transform" type="translate"
          values="0,0;40,0;80,0;80,0;40,0;0,0"
          dur="14s" keyTimes="0;0.20;0.40;0.55;0.75;1" repeatCount="indefinite" />
        <g>
          <animateTransform attributeName="transform" type="scale"
            values="1,1;1,1;1,1;-1,1;-1,1;1,1"
            dur="14s" keyTimes="0;0.40;0.41;0.55;0.56;1" repeatCount="indefinite" />
          <g transform="translate(180, 262)">
            {/* Body — stocky with armored plates */}
            <ellipse cx="0" cy="0" rx="10" ry="6" fill="#c4a870" />
            <ellipse cx="0" cy="-1" rx="9" ry="5" fill="#d4b880" />
            {/* Dark spots */}
            <circle cx="-4" cy="-1" r="1.5" fill="#8a7a50" opacity="0.5" />
            <circle cx="1" cy="0" r="1.8" fill="#8a7a50" opacity="0.4" />
            <circle cx="-2" cy="2" r="1.3" fill="#8a7a50" opacity="0.45" />
            {/* Tail */}
            <path d="M-10 0 L-14 -4 L-14 4 Z" fill="#b49860" />
            {/* Dorsal fin */}
            <path d="M-2 -6 Q0 -10 3 -6" fill="#c4a870" stroke="#b49860" strokeWidth="0.5" />
            {/* Whiskers (barbels) */}
            <line x1="8" y1="2" x2="14" y2="4" stroke="#a08a60" strokeWidth="0.6" />
            <line x1="8" y1="3" x2="13" y2="6" stroke="#a08a60" strokeWidth="0.6" />
            {/* Eye */}
            <circle cx="6" cy="-2" r="2" fill="white" /><circle cx="6.5" cy="-2" r="1.1" fill="#2d2d2d" />
          </g>
        </g>
      </g>

      {/* Corydoras 2 — bottom dweller, right of first */}
      <g>
        <animateTransform attributeName="transform" type="translate"
          values="0,0;35,0;70,0;70,0;35,0;0,0"
          dur="16s" keyTimes="0;0.22;0.44;0.55;0.78;1" begin="2s" repeatCount="indefinite" />
        <g>
          <animateTransform attributeName="transform" type="scale"
            values="1,1;1,1;1,1;-1,1;-1,1;1,1"
            dur="16s" keyTimes="0;0.44;0.45;0.55;0.56;1" begin="2s" repeatCount="indefinite" />
          <g transform="translate(220, 264)">
            <ellipse cx="0" cy="0" rx="9" ry="5.5" fill="#b89860" />
            <ellipse cx="0" cy="-1" rx="8" ry="4.5" fill="#c8a870" />
            <circle cx="-3" cy="0" r="1.3" fill="#8a7a50" opacity="0.45" />
            <circle cx="2" cy="-1" r="1.5" fill="#8a7a50" opacity="0.4" />
            <path d="M-9 0 L-12.5 -3.5 L-12.5 3.5 Z" fill="#a88850" />
            <path d="M-1.5 -5.5 Q0.5 -9 2.5 -5.5" fill="#b89860" stroke="#a88850" strokeWidth="0.5" />
            <line x1="7" y1="2" x2="12" y2="3.5" stroke="#a08a60" strokeWidth="0.5" />
            <line x1="7" y1="2.5" x2="11.5" y2="5" stroke="#a08a60" strokeWidth="0.5" />
            <circle cx="5.5" cy="-1.5" r="1.8" fill="white" /><circle cx="6" cy="-1.5" r="1" fill="#2d2d2d" />
          </g>
        </g>
      </g>

      {/* Apistogramma — colorful dwarf cichlid, mid-bottom */}
      <g>
        <animateTransform attributeName="transform" type="translate"
          values="-60,0;200,-3;500,2;500,0;200,4;-60,-2;-60,0"
          dur="20s" keyTimes="0;0.24;0.48;0.52;0.76;0.98;1" begin="4s" repeatCount="indefinite" />
        <g>
          <animateTransform attributeName="transform" type="scale"
            values="1,1;1,1;1,1;-1,1;-1,1;-1,1;1,1"
            dur="20s" keyTimes="0;0.48;0.49;0.50;0.98;0.99;1" begin="4s" repeatCount="indefinite" />
          <g transform="translate(0, 220)">
            {/* Body */}
            <ellipse cx="0" cy="0" rx="13" ry="8" fill="#e8a820" />
            <ellipse cx="0" cy="-1" rx="12" ry="7" fill="#f0b830" />
            {/* Blue iridescent flank */}
            <ellipse cx="-2" cy="0" rx="8" ry="4" fill="#4488cc" opacity="0.35" />
            {/* Black lateral stripe */}
            <line x1="-8" y1="0" x2="8" y2="0" stroke="#333" strokeWidth="1.5" opacity="0.4" />
            {/* Dorsal fin — tall and spiny */}
            <path d="M-8 -8 Q-4 -16 0 -14 Q4 -13 8 -8" fill="#e8a820" stroke="#d09018" strokeWidth="0.5" />
            <path d="M-6 -9 Q-3 -14 0 -13" stroke="#4488cc" strokeWidth="0.5" opacity="0.5" fill="none" />
            {/* Anal fin */}
            <path d="M-4 8 Q0 12 5 8" fill="#e8a820" stroke="#d09018" strokeWidth="0.5" />
            {/* Caudal (tail) fin — lyre-shaped */}
            <path d="M-13 0 L-20 -7 L-18 0 L-20 7 Z" fill="#f0c040" />
            <path d="M-18 -4 L-20 -7" stroke="#d09018" strokeWidth="0.5" />
            <path d="M-18 4 L-20 7" stroke="#d09018" strokeWidth="0.5" />
            {/* Pelvic fins — elongated, yellow-blue */}
            <path d="M3 6 Q5 12 2 14" stroke="#4488cc" strokeWidth="1" fill="none" opacity="0.6" />
            {/* Eye */}
            <circle cx="7" cy="-2" r="2.5" fill="white" /><circle cx="7.5" cy="-2" r="1.4" fill="#c44" />
            {/* Red eye ring */}
            <circle cx="7" cy="-2" r="2.5" fill="none" stroke="#cc3333" strokeWidth="0.5" opacity="0.5" />
          </g>
        </g>
      </g>

      {/* Otocinclus — small algae eater on "glass" (front view, left side) */}
      <g>
        <animateTransform attributeName="transform" type="translate"
          values="0,0;0,15;0,30;0,15;0,0" dur="12s" repeatCount="indefinite" />
        <g transform="translate(25, 130)">
          {/* Side-on body clinging to glass */}
          <ellipse cx="0" cy="0" rx="5" ry="8" fill="#8a9a6a" />
          <ellipse cx="0" cy="-1" rx="4" ry="7" fill="#9aaa7a" />
          {/* Sucker mouth */}
          <ellipse cx="0" cy="-8" rx="3" ry="2" fill="#7a8a5a" />
          <ellipse cx="0" cy="-8" rx="2" ry="1.2" fill="#6a7a4a" />
          {/* Dark lateral stripe */}
          <line x1="0" y1="-5" x2="0" y2="5" stroke="#5a6a3a" strokeWidth="1.5" opacity="0.4" />
          {/* Tail */}
          <path d="M0 8 L-3 12 L3 12 Z" fill="#8a9a6a" />
          {/* Fins */}
          <path d="M-5 -2 L-8 -4 L-5 0" fill="#9aaa7a" opacity="0.6" />
          <path d="M5 -2 L8 -4 L5 0" fill="#9aaa7a" opacity="0.6" />
          {/* Eyes */}
          <circle cx="-2" cy="-6" r="1.5" fill="white" /><circle cx="-1.7" cy="-6" r="0.8" fill="#2d2d2d" />
          <circle cx="2" cy="-6" r="1.5" fill="white" /><circle cx="2.3" cy="-6" r="0.8" fill="#2d2d2d" />
        </g>
      </g>

      {/* Amano Shrimp 1 — on driftwood */}
      <g>
        <animateTransform attributeName="transform" type="translate"
          values="0,0;12,0;24,0;24,0;12,0;0,0" dur="10s" keyTimes="0;0.2;0.4;0.55;0.75;1" repeatCount="indefinite" />
        <g transform="translate(480, 244)">
          {/* Transparent body */}
          <path d="M-7 0 Q-4 -3 0 -2.5 Q4 -2 7 0 Q4 1.5 0 1.5 Q-4 1 -7 0Z" fill="#c8c8a0" opacity="0.5" />
          {/* Spots inside body */}
          <circle cx="-2" cy="-0.5" r="0.6" fill="#888860" opacity="0.5" />
          <circle cx="1" cy="0" r="0.5" fill="#888860" opacity="0.4" />
          <circle cx="3" cy="-0.5" r="0.5" fill="#888860" opacity="0.4" />
          {/* Tail fan */}
          <path d="M-7 0 L-10 -1.5 L-10 1.5 Z" fill="#b8b890" opacity="0.4" />
          {/* Antennae */}
          <path d="M7 -1.5 Q10 -5 13 -6" stroke="#a0a080" strokeWidth="0.4" fill="none" />
          <path d="M7 -1 Q11 -4 14 -5" stroke="#a0a080" strokeWidth="0.4" fill="none" />
          {/* Walking legs */}
          <line x1="-2" y1="1.5" x2="-3" y2="3.5" stroke="#a0a080" strokeWidth="0.3" />
          <line x1="0" y1="1.5" x2="0" y2="3.5" stroke="#a0a080" strokeWidth="0.3" />
          <line x1="2" y1="1.5" x2="2.5" y2="3.5" stroke="#a0a080" strokeWidth="0.3" />
          <line x1="4" y1="1" x2="5" y2="3" stroke="#a0a080" strokeWidth="0.3" />
          {/* Eye */}
          <circle cx="6.5" cy="-2.5" r="0.8" fill="#444" opacity="0.6" />
        </g>
      </g>

      {/* Amano Shrimp 2 — on substrate right side */}
      <g>
        <animateTransform attributeName="transform" type="translate"
          values="0,0;-15,0;-30,0;-30,0;-15,0;0,0" dur="12s" keyTimes="0;0.2;0.4;0.55;0.75;1" begin="3s" repeatCount="indefinite" />
        <g transform="translate(720, 262) scale(-1,1)">
          <path d="M-7 0 Q-4 -3 0 -2.5 Q4 -2 7 0 Q4 1.5 0 1.5 Q-4 1 -7 0Z" fill="#c8c8a0" opacity="0.45" />
          <circle cx="-1" cy="-0.5" r="0.5" fill="#888860" opacity="0.4" />
          <circle cx="2" cy="0" r="0.5" fill="#888860" opacity="0.4" />
          <path d="M-7 0 L-10 -1.5 L-10 1.5 Z" fill="#b8b890" opacity="0.4" />
          <path d="M7 -1.5 Q10 -5 13 -6" stroke="#a0a080" strokeWidth="0.4" fill="none" />
          <path d="M7 -1 Q11 -4 14 -5" stroke="#a0a080" strokeWidth="0.4" fill="none" />
          <line x1="-1" y1="1.5" x2="-2" y2="3.5" stroke="#a0a080" strokeWidth="0.3" />
          <line x1="1" y1="1.5" x2="1" y2="3.5" stroke="#a0a080" strokeWidth="0.3" />
          <line x1="3" y1="1" x2="3.5" y2="3" stroke="#a0a080" strokeWidth="0.3" />
          <circle cx="6.5" cy="-2.5" r="0.8" fill="#444" opacity="0.55" />
        </g>
      </g>

      {/* ══ CO2 DIFFUSER AND BUBBLES ══ */}

      {/* CO2 Diffuser — ceramic disc on substrate */}
      <g transform="translate(620, 265)">
        <rect x="-10" y="-3" width="20" height="6" rx="3" fill="#d0d0d0" opacity="0.6" />
        <rect x="-8" y="-2" width="16" height="4" rx="2" fill="#e8e8e8" opacity="0.4" />
        {/* Airline tubing hint */}
        <path d="M10 0 Q18 0 22 5 Q26 10 30 12" stroke="#aadda8" strokeWidth="1.5" fill="none" opacity="0.3" />
      </g>

      {/* CO2 micro-bubbles — tiny, rising from diffuser */}
      <circle cx="612" cy="260" r="1.5" fill="url(#pb-bubble)" opacity="0.5">
        <animate attributeName="cy" from="260" to="20" dur="5s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.5" to="0" dur="5s" repeatCount="indefinite" />
        <animate attributeName="r" from="1.5" to="2.5" dur="5s" repeatCount="indefinite" />
      </circle>
      <circle cx="618" cy="260" r="1.2" fill="url(#pb-bubble)" opacity="0.45">
        <animate attributeName="cy" from="260" to="15" dur="5.5s" begin="0.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.45" to="0" dur="5.5s" begin="0.5s" repeatCount="indefinite" />
        <animate attributeName="r" from="1.2" to="2.2" dur="5.5s" begin="0.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="622" cy="260" r="1" fill="url(#pb-bubble)" opacity="0.4">
        <animate attributeName="cy" from="260" to="18" dur="4.8s" begin="1.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.4" to="0" dur="4.8s" begin="1.2s" repeatCount="indefinite" />
        <animate attributeName="r" from="1" to="1.8" dur="4.8s" begin="1.2s" repeatCount="indefinite" />
      </circle>
      <circle cx="616" cy="260" r="1.3" fill="url(#pb-bubble)" opacity="0.45">
        <animate attributeName="cy" from="260" to="12" dur="6s" begin="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.45" to="0" dur="6s" begin="2s" repeatCount="indefinite" />
        <animate attributeName="r" from="1.3" to="2" dur="6s" begin="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="625" cy="260" r="0.9" fill="url(#pb-bubble)" opacity="0.35">
        <animate attributeName="cy" from="260" to="22" dur="5.2s" begin="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.35" to="0" dur="5.2s" begin="3s" repeatCount="indefinite" />
        <animate attributeName="r" from="0.9" to="1.6" dur="5.2s" begin="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="610" cy="260" r="1.1" fill="url(#pb-bubble)" opacity="0.4">
        <animate attributeName="cy" from="260" to="16" dur="4.5s" begin="1.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.4" to="0" dur="4.5s" begin="1.8s" repeatCount="indefinite" />
        <animate attributeName="r" from="1.1" to="1.9" dur="4.5s" begin="1.8s" repeatCount="indefinite" />
      </circle>
      <circle cx="620" cy="260" r="1.4" fill="url(#pb-bubble)" opacity="0.5">
        <animate attributeName="cy" from="260" to="10" dur="5.8s" begin="0.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.5" to="0" dur="5.8s" begin="0.8s" repeatCount="indefinite" />
        <animate attributeName="r" from="1.4" to="2.3" dur="5.8s" begin="0.8s" repeatCount="indefinite" />
      </circle>
      <circle cx="614" cy="260" r="0.8" fill="url(#pb-bubble)" opacity="0.35">
        <animate attributeName="cy" from="260" to="25" dur="4.2s" begin="2.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.35" to="0" dur="4.2s" begin="2.5s" repeatCount="indefinite" />
        <animate attributeName="r" from="0.8" to="1.4" dur="4.2s" begin="2.5s" repeatCount="indefinite" />
      </circle>

      {/* ══ FLOATING PARTICLES / DETRITUS ══ */}
      <circle cx="300" cy="90" r="1.2" fill="#c8c8a0" opacity="0.12">
        <animate attributeName="cy" values="90;85;95;90" dur="8s" repeatCount="indefinite" />
        <animate attributeName="cx" values="300;304;298;300" dur="8s" repeatCount="indefinite" />
      </circle>
      <circle cx="700" cy="75" r="1" fill="#c8c8a0" opacity="0.1">
        <animate attributeName="cy" values="75;70;80;75" dur="10s" repeatCount="indefinite" />
        <animate attributeName="cx" values="700;703;697;700" dur="10s" repeatCount="indefinite" />
      </circle>
      <circle cx="1000" cy="60" r="1.3" fill="#c8c8a0" opacity="0.12">
        <animate attributeName="cy" values="60;55;65;60" dur="7s" repeatCount="indefinite" />
      </circle>
      <circle cx="150" cy="50" r="0.9" fill="#c8c8a0" opacity="0.08">
        <animate attributeName="cy" values="50;46;54;50" dur="9s" repeatCount="indefinite" />
      </circle>
      <circle cx="500" cy="120" r="1.1" fill="#c8c8a0" opacity="0.1">
        <animate attributeName="cy" values="120;115;125;120" dur="6s" repeatCount="indefinite" />
        <animate attributeName="cx" values="500;504;497;500" dur="6s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}
