/**
 * Reef Banner — Dense SPS/LPS reef scape with animated corals, fish, and effects
 */
export default function ReefBanner() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 280" width="100%" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="rb-ocean" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#bae6fd" />
          <stop offset="35%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
        <linearGradient id="rb-sand" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#e8d5a3" />
          <stop offset="50%" stopColor="#f0e0b0" />
          <stop offset="100%" stopColor="#d4c28a" />
        </linearGradient>
        <radialGradient id="rb-c1" cx="25%" cy="15%" r="40%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <radialGradient id="rb-c2" cx="65%" cy="30%" r="35%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <radialGradient id="rb-c3" cx="85%" cy="10%" r="30%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>

      {/* Background */}
      <rect width="1200" height="280" fill="url(#rb-ocean)" rx="12" />

      {/* Caustic light */}
      <rect width="1200" height="280" fill="url(#rb-c1)" rx="12" opacity="0.6">
        <animate attributeName="opacity" values="0.6;0.3;0.6" dur="7s" repeatCount="indefinite" />
      </rect>
      <rect width="1200" height="280" fill="url(#rb-c2)" rx="12" opacity="0.4">
        <animate attributeName="opacity" values="0.4;0.7;0.4" dur="11s" repeatCount="indefinite" />
      </rect>
      <rect width="1200" height="280" fill="url(#rb-c3)" rx="12" opacity="0.3">
        <animate attributeName="opacity" values="0.3;0.5;0.3" dur="9s" repeatCount="indefinite" />
      </rect>

      {/* Light rays */}
      <polygon points="200,0 260,0 340,280 220,280" fill="rgba(255,255,255,0.04)">
        <animate attributeName="opacity" values="0.04;0.08;0.04" dur="6s" repeatCount="indefinite" />
      </polygon>
      <polygon points="700,0 750,0 810,280 680,280" fill="rgba(255,255,255,0.03)">
        <animate attributeName="opacity" values="0.03;0.06;0.03" dur="8s" repeatCount="indefinite" />
      </polygon>

      {/* Sandy bottom */}
      <ellipse cx="600" cy="280" rx="650" ry="38" fill="#e8d5a3" opacity="0.7" />
      <ellipse cx="600" cy="283" rx="620" ry="28" fill="#d4c28a" opacity="0.5" />

      {/* Live rock structure */}
      <ellipse cx="120" cy="252" rx="40" ry="18" fill="#7f8c8d" />
      <ellipse cx="120" cy="250" rx="38" ry="16" fill="#95a5a6" />
      <ellipse cx="350" cy="255" rx="55" ry="22" fill="#6c7a7d" />
      <ellipse cx="350" cy="253" rx="52" ry="20" fill="#8e9ea2" />
      <ellipse cx="600" cy="258" rx="45" ry="16" fill="#7f8c8d" />
      <ellipse cx="600" cy="256" rx="42" ry="14" fill="#a3b1b5" />
      <ellipse cx="850" cy="254" rx="50" ry="20" fill="#6c7a7d" />
      <ellipse cx="850" cy="252" rx="48" ry="18" fill="#8e9ea2" />
      <ellipse cx="1050" cy="256" rx="35" ry="16" fill="#7f8c8d" />
      <ellipse cx="1050" cy="254" rx="33" ry="14" fill="#95a5a6" />

      {/* Coralline algae patches */}
      <ellipse cx="130" cy="245" rx="12" ry="5" fill="#c084fc" opacity="0.3" />
      <ellipse cx="360" cy="248" rx="15" ry="6" fill="#d946ef" opacity="0.2" />
      <ellipse cx="860" cy="246" rx="14" ry="5" fill="#a855f7" opacity="0.25" />

      {/* ══ CORALS ══ */}

      {/* 1. Large Acropora staghorn — left */}
      <g>
        <animateTransform attributeName="transform" type="rotate" values="-1 80 248;1 80 248;-1 80 248" dur="5s" repeatCount="indefinite" />
        <path d="M80 248 Q72 220 60 195 Q56 185 50 178" stroke="#e84393" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M80 248 Q85 215 82 192 Q80 182 78 175" stroke="#e84393" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M80 248 Q95 220 108 200 Q114 193 120 186" stroke="#fd79a8" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M60 195 Q54 188 46 182" stroke="#e84393" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M82 192 Q90 180 96 174" stroke="#fd79a8" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M108 200 Q116 188 124 180" stroke="#fd79a8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="50" cy="176" r="4" fill="#fab1d0" /><circle cx="46" cy="180" r="3.5" fill="#fab1d0" />
        <circle cx="78" cy="173" r="4" fill="#fab1d0" /><circle cx="96" cy="172" r="3.5" fill="#fab1d0" />
        <circle cx="120" cy="184" r="4" fill="#fab1d0" /><circle cx="124" cy="178" r="3" fill="#fab1d0" />
      </g>

      {/* 2. Montipora plate — center-left */}
      <g>
        <animateTransform attributeName="transform" type="rotate" values="0.5 280 248;-0.5 280 248;0.5 280 248" dur="6s" repeatCount="indefinite" />
        <ellipse cx="280" cy="238" rx="35" ry="10" fill="#a78bfa" />
        <ellipse cx="280" cy="236" rx="33" ry="8" fill="#c4b5fd" />
        <ellipse cx="280" cy="235" rx="28" ry="5" fill="#ddd6fe" opacity="0.5" />
      </g>

      {/* 3. Torch coral — near left rock */}
      <g>
        <animateTransform attributeName="transform" type="rotate" values="-2 180 248;2 180 248;-2 180 248" dur="3.5s" repeatCount="indefinite" />
        <path d="M175 248 Q170 228 168 215" stroke="#854d0e" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M185 248 Q183 225 180 212" stroke="#854d0e" strokeWidth="4" fill="none" strokeLinecap="round" />
        <ellipse cx="168" cy="210" rx="8" ry="6" fill="#4ade80" opacity="0.8" />
        <ellipse cx="180" cy="207" rx="9" ry="7" fill="#86efac" opacity="0.8" />
        <circle cx="165" cy="208" r="2" fill="#bbf7d0" /><circle cx="171" cy="206" r="2" fill="#bbf7d0" />
        <circle cx="177" cy="204" r="2" fill="#bbf7d0" /><circle cx="183" cy="205" r="2" fill="#bbf7d0" />
      </g>

      {/* 4. Brain coral — center */}
      <g>
        <animateTransform attributeName="transform" type="rotate" values="0.5 520 252;-0.5 520 252;0.5 520 252" dur="7s" repeatCount="indefinite" />
        <ellipse cx="520" cy="244" rx="30" ry="16" fill="#a29bfe" />
        <ellipse cx="520" cy="242" rx="28" ry="14" fill="#b8b0ff" />
        <path d="M496 242 Q508 234 520 242 Q532 234 544 242" stroke="#8c83e8" strokeWidth="2" fill="none" />
        <path d="M502 244 Q511 238 520 244 Q529 238 538 244" stroke="#8c83e8" strokeWidth="1.5" fill="none" />
      </g>

      {/* 5. Sea fan — right-center */}
      <g>
        <animateTransform attributeName="transform" type="rotate" values="-1.5 700 250;1.5 700 250;-1.5 700 250" dur="5s" repeatCount="indefinite" />
        <path d="M700 250 Q694 222 686 198 Q684 188 680 180" stroke="#00b894" strokeWidth="4.5" fill="none" strokeLinecap="round" />
        <path d="M700 250 Q706 218 712 196 Q714 188 718 182" stroke="#00b894" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M686 198 Q680 192 674 188" stroke="#55efc4" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M686 198 Q692 190 698 184" stroke="#55efc4" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M712 196 Q706 186 702 180" stroke="#55efc4" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M712 196 Q718 188 724 184" stroke="#55efc4" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="680" cy="178" r="3" fill="#55efc4" /><circle cx="674" cy="186" r="2.5" fill="#55efc4" />
        <circle cx="698" cy="182" r="2.5" fill="#55efc4" /><circle cx="718" cy="180" r="3" fill="#55efc4" />
        <circle cx="724" cy="182" r="2.5" fill="#55efc4" />
      </g>

      {/* 6. Mushroom corals — on left rock */}
      <g>
        <animateTransform attributeName="transform" type="rotate" values="-0.5 140 242;0.5 140 242;-0.5 140 242" dur="4s" repeatCount="indefinite" />
        <ellipse cx="135" cy="240" rx="12" ry="5" fill="#f472b6" />
        <ellipse cx="150" cy="238" rx="10" ry="4.5" fill="#ec4899" />
        <ellipse cx="135" cy="239" rx="8" ry="3" fill="#f9a8d4" opacity="0.6" />
      </g>

      {/* 7. Zoanthid colony — on center rock */}
      <g>
        <animateTransform attributeName="transform" type="rotate" values="0.3 580 250;-0.3 580 250;0.3 580 250" dur="3s" repeatCount="indefinite" />
        <circle cx="570" cy="248" r="5" fill="#f59e0b" /><circle cx="570" cy="248" r="3" fill="#fbbf24" />
        <circle cx="580" cy="246" r="5" fill="#f97316" /><circle cx="580" cy="246" r="3" fill="#fb923c" />
        <circle cx="590" cy="249" r="4.5" fill="#ef4444" /><circle cx="590" cy="249" r="2.8" fill="#fca5a5" />
        <circle cx="575" cy="253" r="4.5" fill="#22c55e" /><circle cx="575" cy="253" r="2.8" fill="#86efac" />
        <circle cx="585" cy="254" r="4" fill="#f59e0b" /><circle cx="585" cy="254" r="2.5" fill="#fde68a" />
      </g>

      {/* 8. Acropora table — right rock */}
      <g>
        <animateTransform attributeName="transform" type="rotate" values="-0.8 900 244;0.8 900 244;-0.8 900 244" dur="6s" repeatCount="indefinite" />
        <path d="M870 248 Q870 228 870 218" stroke="#0ea5e9" strokeWidth="5" fill="none" strokeLinecap="round" />
        <ellipse cx="870" cy="215" rx="32" ry="6" fill="#38bdf8" />
        <ellipse cx="870" cy="213" rx="30" ry="4" fill="#7dd3fc" opacity="0.6" />
        <path d="M890 248 Q895 230 898 222" stroke="#0ea5e9" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <circle cx="898" cy="220" r="3" fill="#bae6fd" />
      </g>

      {/* 9. Hammer coral */}
      <g>
        <animateTransform attributeName="transform" type="rotate" values="-2 460 250;2 460 250;-2 460 250" dur="3s" repeatCount="indefinite" />
        <path d="M455 252 Q452 232 450 218" stroke="#854d0e" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M465 252 Q463 230 460 216" stroke="#854d0e" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <ellipse cx="450" cy="214" rx="10" ry="5" fill="#a3e635" opacity="0.8" />
        <ellipse cx="460" cy="212" rx="11" ry="6" fill="#84cc16" opacity="0.8" />
        <circle cx="446" cy="212" r="2.5" fill="#d9f99d" /><circle cx="454" cy="210" r="2.5" fill="#d9f99d" />
        <circle cx="462" cy="209" r="2.5" fill="#d9f99d" /><circle cx="468" cy="211" r="2" fill="#d9f99d" />
      </g>

      {/* 10. Anemone with clownfish */}
      <g>
        <animateTransform attributeName="transform" type="rotate" values="-1.5 1000 250;1.5 1000 250;-1.5 1000 250" dur="3.5s" repeatCount="indefinite" />
        <path d="M990 254 Q984 232 978 215" stroke="#c084fc" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M995 254 Q994 228 992 212" stroke="#a855f7" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M1000 254 Q1004 230 1008 214" stroke="#c084fc" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M1005 254 Q1012 234 1020 218" stroke="#a855f7" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M1010 254 Q1018 238 1028 222" stroke="#c084fc" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="978" cy="213" r="4" fill="#e9d5ff" /><circle cx="992" cy="210" r="4" fill="#e9d5ff" />
        <circle cx="1008" cy="212" r="4" fill="#e9d5ff" /><circle cx="1020" cy="216" r="3.5" fill="#e9d5ff" />
        <circle cx="1028" cy="220" r="3" fill="#e9d5ff" />
      </g>

      {/* 11. Small Acropora colony — far right */}
      <g>
        <animateTransform attributeName="transform" type="rotate" values="1 1100 250;-1 1100 250;1 1100 250" dur="4.5s" repeatCount="indefinite" />
        <path d="M1095 252 Q1088 228 1082 210" stroke="#06b6d4" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M1100 252 Q1105 225 1108 208" stroke="#22d3ee" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M1082 210 Q1076 204 1070 200" stroke="#06b6d4" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="1082" cy="208" r="3" fill="#a5f3fc" /><circle cx="1070" cy="198" r="3" fill="#a5f3fc" />
        <circle cx="1108" cy="206" r="3.5" fill="#a5f3fc" />
      </g>

      {/* 12. Leather coral — far left */}
      <g>
        <animateTransform attributeName="transform" type="rotate" values="-0.8 40 254;0.8 40 254;-0.8 40 254" dur="5s" repeatCount="indefinite" />
        <path d="M40 258 Q40 240 40 230" stroke="#854d0e" strokeWidth="6" fill="none" strokeLinecap="round" />
        <ellipse cx="40" cy="226" rx="18" ry="8" fill="#a3a042" />
        <ellipse cx="40" cy="224" rx="16" ry="6" fill="#c4b778" opacity="0.6" />
      </g>

      {/* ══ FISH ══ */}

      {/* Clownfish (in anemone area) */}
      <g>
        <animateTransform attributeName="transform" type="translate" values="0,0;8,-4;-5,3;0,0" dur="4s" repeatCount="indefinite" />
        <g transform="translate(998, 228)">
          <ellipse cx="0" cy="0" rx="10" ry="6" fill="#f39c12" />
          <path d="M-4 -5 Q-4 0 -4 5" stroke="white" strokeWidth="2" fill="none" />
          <path d="M3 -5 Q3 0 3 5" stroke="white" strokeWidth="2" fill="none" />
          <path d="M-10 0 L-14 -4 L-14 4 Z" fill="#e67e22" />
          <circle cx="5" cy="-2" r="2" fill="white" /><circle cx="5.5" cy="-2" r="1.2" fill="#2d3436" />
        </g>
      </g>

      {/* Blue Tang */}
      <g>
        <animateTransform attributeName="transform" type="translate" values="-80,0;300,-4;680,3;680,0;300,4;-80,-3;-80,0" dur="22s" keyTimes="0;0.24;0.48;0.52;0.76;0.98;1" repeatCount="indefinite" />
        <g>
          <animateTransform attributeName="transform" type="scale" values="1,1;1,1;1,1;-1,1;-1,1;-1,1;1,1" dur="22s" keyTimes="0;0.48;0.49;0.50;0.98;0.99;1" repeatCount="indefinite" />
          <g transform="translate(0, 140)">
            <ellipse cx="0" cy="0" rx="16" ry="10" fill="#0984e3" />
            <path d="M-6 -7 Q0 0 -6 7" stroke="#074f8a" strokeWidth="2.5" fill="none" />
            <path d="M-16 0 L-22 -7 L-22 7 Z" fill="#74b9ff" />
            <path d="M-16 0 L-18 -3 L-18 3 Z" fill="#fdcb6e" />
            <circle cx="8" cy="-2" r="2.5" fill="white" /><circle cx="9" cy="-2" r="1.4" fill="#2d3436" />
          </g>
        </g>
      </g>

      {/* Yellow Tang */}
      <g>
        <animateTransform attributeName="transform" type="translate" values="-60,0;350,4;750,-3;750,0;350,-5;-60,2;-60,0" dur="19s" keyTimes="0;0.24;0.48;0.52;0.76;0.98;1" begin="3s" repeatCount="indefinite" />
        <g>
          <animateTransform attributeName="transform" type="scale" values="1,1;1,1;1,1;-1,1;-1,1;-1,1;1,1" dur="19s" keyTimes="0;0.48;0.49;0.50;0.98;0.99;1" begin="3s" repeatCount="indefinite" />
          <g transform="translate(0, 110)">
            <ellipse cx="0" cy="0" rx="14" ry="12" fill="#f1c40f" />
            <path d="M-4 -12 Q0 -18 6 -12" fill="#f1c40f" stroke="#e6b800" strokeWidth="0.5" />
            <path d="M-4 12 Q0 17 6 12" fill="#f1c40f" stroke="#e6b800" strokeWidth="0.5" />
            <path d="M-14 0 L-20 -6 L-20 6 Z" fill="#f9e547" />
            <circle cx="7" cy="-3" r="2.5" fill="white" /><circle cx="8" cy="-3" r="1.4" fill="#2d3436" />
          </g>
        </g>
      </g>

      {/* Chromis school (3 fish) */}
      <g>
        <animateTransform attributeName="transform" type="translate" values="-40,0;400,2;800,-2;800,0;400,-3;-40,2;-40,0" dur="14s" keyTimes="0;0.24;0.48;0.52;0.76;0.98;1" begin="1s" repeatCount="indefinite" />
        <g>
          <animateTransform attributeName="transform" type="scale" values="1,1;1,1;1,1;-1,1;-1,1;-1,1;1,1" dur="14s" keyTimes="0;0.48;0.49;0.50;0.98;0.99;1" begin="1s" repeatCount="indefinite" />
          <g transform="translate(0, 60)">
            <ellipse cx="0" cy="0" rx="8" ry="5" fill="#00cec9" />
            <path d="M-8 0 L-12 -4 L-12 4 Z" fill="#81ecec" />
            <circle cx="4" cy="-1.5" r="1.5" fill="white" /><circle cx="4.5" cy="-1.5" r="0.8" fill="#2d3436" />
          </g>
          <g transform="translate(14, 68)">
            <ellipse cx="0" cy="0" rx="7" ry="4.5" fill="#00b894" />
            <path d="M-7 0 L-11 -3.5 L-11 3.5 Z" fill="#55efc4" />
            <circle cx="3.5" cy="-1" r="1.3" fill="white" /><circle cx="4" cy="-1" r="0.7" fill="#2d3436" />
          </g>
          <g transform="translate(-10, 70)">
            <ellipse cx="0" cy="0" rx="7.5" ry="4.5" fill="#00cec9" />
            <path d="M-7.5 0 L-11 -3.5 L-11 3.5 Z" fill="#81ecec" />
            <circle cx="3.5" cy="-1" r="1.3" fill="white" /><circle cx="4" cy="-1" r="0.7" fill="#2d3436" />
          </g>
        </g>
      </g>

      {/* Anthias */}
      <g>
        <animateTransform attributeName="transform" type="translate" values="-50,0;320,-3;700,5;700,0;320,3;-50,-4;-50,0" dur="16s" keyTimes="0;0.24;0.48;0.52;0.76;0.98;1" begin="5s" repeatCount="indefinite" />
        <g>
          <animateTransform attributeName="transform" type="scale" values="1,1;1,1;1,1;-1,1;-1,1;-1,1;1,1" dur="16s" keyTimes="0;0.48;0.49;0.50;0.98;0.99;1" begin="5s" repeatCount="indefinite" />
          <g transform="translate(0, 90)">
            <ellipse cx="0" cy="0" rx="11" ry="7" fill="#f472b6" />
            <path d="M-11 0 L-17 -5 L-17 5 Z" fill="#f9a8d4" />
            <circle cx="5" cy="-2" r="2" fill="white" /><circle cx="5.5" cy="-2" r="1.2" fill="#2d3436" />
          </g>
        </g>
      </g>

      {/* Mandarin dragonet — bottom */}
      <g>
        <animateTransform attributeName="transform" type="translate" values="0,0;20,-2;40,0;20,2;0,0" dur="12s" repeatCount="indefinite" />
        <g transform="translate(420, 256)">
          <ellipse cx="0" cy="0" rx="10" ry="6" fill="#0ea5e9" />
          <ellipse cx="0" cy="0" rx="9" ry="5.5" fill="#38bdf8" />
          <circle cx="-3" cy="-1" r="2" fill="#f97316" opacity="0.6" />
          <circle cx="2" cy="0" r="2.5" fill="#22c55e" opacity="0.5" />
          <path d="M-10 0 L-14 -4 L-14 4 Z" fill="#7dd3fc" />
          <circle cx="5" cy="-2" r="2" fill="white" /><circle cx="5.5" cy="-2" r="1.2" fill="#2d3436" />
        </g>
      </g>

      {/* ══ BOTTOM DWELLERS ══ */}

      {/* Cleaner shrimp */}
      <g>
        <animateTransform attributeName="transform" type="translate" values="0,0;25,0;50,0;50,0;25,0;0,0;0,0" dur="10s" keyTimes="0;0.17;0.35;0.50;0.70;0.90;1" repeatCount="indefinite" />
        <g transform="translate(780, 258)">
          <path d="M-8 0 Q-5 -4 0 -3 Q5 -2 8 0 Q5 2 0 2 Q-5 1.5 -8 0Z" fill="#e17055" />
          <path d="M-8 0 L-11 -2 L-12 0 L-11 2 Z" fill="#fab1a0" />
          <path d="M8 -2 Q14 -8 18 -10" stroke="#e17055" strokeWidth="0.7" fill="none" />
          <path d="M8 -1 Q15 -6 20 -8" stroke="#e17055" strokeWidth="0.7" fill="none" />
          <circle cx="7" cy="-3" r="1" fill="white" /><circle cx="7.3" cy="-3" r="0.5" fill="#2d3436" />
        </g>
      </g>

      {/* ══ BUBBLES ══ */}
      <circle cx="180" cy="248" r="3" fill="white" opacity="0.4">
        <animate attributeName="cy" from="248" to="15" dur="4.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.4" to="0" dur="4.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="480" cy="244" r="2.5" fill="white" opacity="0.3">
        <animate attributeName="cy" from="244" to="10" dur="5.5s" begin="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.3" to="0" dur="5.5s" begin="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="720" cy="250" r="3.5" fill="white" opacity="0.35">
        <animate attributeName="cy" from="250" to="20" dur="6s" begin="0.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.35" to="0" dur="6s" begin="0.8s" repeatCount="indefinite" />
      </circle>
      <circle cx="950" cy="246" r="2.8" fill="white" opacity="0.3">
        <animate attributeName="cy" from="246" to="15" dur="4s" begin="2.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.3" to="0" dur="4s" begin="2.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="1100" cy="252" r="2" fill="white" opacity="0.25">
        <animate attributeName="cy" from="252" to="10" dur="5s" begin="3.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.25" to="0" dur="5s" begin="3.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="300" cy="240" r="2" fill="white" opacity="0.2">
        <animate attributeName="cy" from="240" to="8" dur="4.8s" begin="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.2" to="0" dur="4.8s" begin="2s" repeatCount="indefinite" />
      </circle>

      {/* Floating particles */}
      <circle cx="200" cy="80" r="1.5" fill="white" opacity="0.15">
        <animate attributeName="cy" values="80;75;85;80" dur="7s" repeatCount="indefinite" />
        <animate attributeName="cx" values="200;205;198;200" dur="7s" repeatCount="indefinite" />
      </circle>
      <circle cx="550" cy="100" r="1.2" fill="white" opacity="0.12">
        <animate attributeName="cy" values="100;95;105;100" dur="9s" repeatCount="indefinite" />
      </circle>
      <circle cx="900" cy="70" r="1.5" fill="white" opacity="0.15">
        <animate attributeName="cy" values="70;65;75;70" dur="6s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}
