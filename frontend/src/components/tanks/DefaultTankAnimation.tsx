/**
 * DefaultTankAnimation Component
 *
 * Animated aquarium background for tanks without custom images.
 * Shows different scenes based on water type: saltwater, freshwater, or brackish.
 */

interface DefaultTankAnimationProps {
  waterType?: string
}

export default function DefaultTankAnimation({ waterType = 'saltwater' }: DefaultTankAnimationProps) {
  const config = WATER_TYPE_CONFIGS[waterType] || WATER_TYPE_CONFIGS.saltwater

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Water gradient background */}
      <div className={`absolute inset-0 ${config.gradient} opacity-90`}></div>

      {/* Light rays */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`light-ray light-ray-1 ${config.rayColor}`}></div>
        <div className={`light-ray light-ray-2 ${config.rayColor}`}></div>
      </div>

      {/* Animated bubbles */}
      <div className="absolute inset-0">
        <div className={`bubble bubble-1 ${config.bubbleColor}`}>○</div>
        <div className={`bubble bubble-2 ${config.bubbleColor}`}>○</div>
        <div className={`bubble bubble-3 ${config.bubbleColor}`}>○</div>
        <div className={`bubble bubble-4 ${config.bubbleColor}`}>○</div>
      </div>

      {/* Swimming creatures */}
      <div className="absolute inset-0">
        {config.fish.map((emoji, i) => (
          <div key={i} className={`fish fish-${i + 1}`}>{emoji}</div>
        ))}
      </div>

      {/* Bottom elements */}
      <div className="absolute bottom-0 left-0 right-0">
        {/* Substrate */}
        <div className={`absolute bottom-0 left-0 right-0 h-4 ${config.substrate}`}></div>
        {/* Bottom decorations */}
        <div className="flex justify-around text-3xl pb-1 relative">
          {config.bottom.map((emoji, i) => (
            <span key={i} className={`seaweed seaweed-${i + 1}`}>{emoji}</span>
          ))}
        </div>
      </div>

      {/* Water type label */}
      <div className="absolute top-3 left-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.badge}`}>
          {config.label}
        </span>
      </div>

      <style>{`
        @keyframes bubble-rise {
          0% { transform: translateY(0) translateX(0); opacity: 0.6; }
          50% { transform: translateY(-100px) translateX(8px); opacity: 0.4; }
          100% { transform: translateY(-200px) translateX(-4px); opacity: 0; }
        }

        @keyframes swim {
          0% { transform: translateX(-40px) scaleX(1); }
          49% { transform: translateX(calc(100% + 20px)) scaleX(1); }
          50% { transform: translateX(calc(100% + 20px)) scaleX(-1); }
          99% { transform: translateX(-40px) scaleX(-1); }
          100% { transform: translateX(-40px) scaleX(1); }
        }

        @keyframes sway {
          0%, 100% { transform: rotate(-5deg) translateY(0); }
          50% { transform: rotate(5deg) translateY(-2px); }
        }

        @keyframes ray {
          0%, 100% { opacity: 0.03; }
          50% { opacity: 0.08; }
        }

        .light-ray {
          position: absolute;
          top: -20px;
          width: 60px;
          height: 120%;
          transform: skewX(-15deg);
          animation: ray 6s ease-in-out infinite;
        }

        .light-ray-1 { left: 25%; animation-delay: 0s; }
        .light-ray-2 { left: 60%; animation-delay: 3s; }

        .bubble {
          position: absolute;
          font-size: 10px;
          animation: bubble-rise 5s infinite;
        }

        .bubble-1 { left: 15%; bottom: 4px; animation-delay: 0s; animation-duration: 4s; }
        .bubble-2 { left: 45%; bottom: 4px; animation-delay: 1.2s; animation-duration: 5s; }
        .bubble-3 { left: 70%; bottom: 4px; animation-delay: 2.4s; animation-duration: 4.5s; }
        .bubble-4 { left: 85%; bottom: 4px; animation-delay: 3.6s; animation-duration: 5.5s; }

        .fish {
          position: absolute;
          font-size: 28px;
          animation: swim linear infinite;
        }

        .fish-1 { top: 18%; animation-duration: 16s; animation-delay: 0s; }
        .fish-2 { top: 45%; animation-duration: 22s; animation-delay: 4s; }
        .fish-3 { top: 65%; animation-duration: 19s; animation-delay: 8s; }

        .seaweed {
          display: inline-block;
          transform-origin: bottom center;
          animation: sway 3s ease-in-out infinite;
        }

        .seaweed-1 { animation-delay: 0s; }
        .seaweed-2 { animation-delay: 0.7s; }
        .seaweed-3 { animation-delay: 1.4s; }
        .seaweed-4 { animation-delay: 2.1s; }
        .seaweed-5 { animation-delay: 0.3s; }
      `}</style>
    </div>
  )
}

interface WaterTypeConfig {
  gradient: string
  rayColor: string
  bubbleColor: string
  substrate: string
  badge: string
  label: string
  fish: string[]
  bottom: string[]
}

const WATER_TYPE_CONFIGS: Record<string, WaterTypeConfig> = {
  saltwater: {
    gradient: 'bg-gradient-to-b from-cyan-300 via-blue-400 to-blue-700',
    rayColor: 'bg-cyan-200',
    bubbleColor: 'text-white/40',
    substrate: 'bg-gradient-to-t from-amber-200 to-amber-100/60',
    badge: 'bg-blue-600/80 text-white backdrop-blur-sm',
    label: 'Saltwater',
    fish: ['🐠', '🐟', '🦈'],
    bottom: ['🪸', '🌊', '🐚', '🪸', '🦑'],
  },
  freshwater: {
    gradient: 'bg-gradient-to-b from-emerald-200 via-emerald-400 to-emerald-700',
    rayColor: 'bg-emerald-200',
    bubbleColor: 'text-white/30',
    substrate: 'bg-gradient-to-t from-stone-400 to-stone-300/60',
    badge: 'bg-emerald-600/80 text-white backdrop-blur-sm',
    label: 'Freshwater',
    fish: ['🐟', '🐡', '🦐'],
    bottom: ['🌿', '🌱', '🪨', '🌿', '🌱'],
  },
  brackish: {
    gradient: 'bg-gradient-to-b from-teal-200 via-teal-400 to-teal-700',
    rayColor: 'bg-teal-200',
    bubbleColor: 'text-white/35',
    substrate: 'bg-gradient-to-t from-yellow-700/50 to-yellow-600/30',
    badge: 'bg-teal-600/80 text-white backdrop-blur-sm',
    label: 'Brackish',
    fish: ['🐟', '🦀', '🐡'],
    bottom: ['🌿', '🪵', '🐚', '🌿', '🪨'],
  },
}
