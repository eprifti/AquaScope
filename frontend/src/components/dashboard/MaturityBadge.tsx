import { useTranslation } from 'react-i18next'

interface MaturityBadgeProps {
  score: number
  level: string
  ageScore: number
  stabilityScore: number
  livestockScore: number
}

const LEVEL_COLORS: Record<string, { stroke: string; text: string }> = {
  new:         { stroke: '#9ca3af', text: 'text-gray-400 dark:text-gray-500' },
  growing:     { stroke: '#38bdf8', text: 'text-sky-400' },
  established: { stroke: '#0284c7', text: 'text-sky-600 dark:text-sky-400' },
  thriving:    { stroke: '#10b981', text: 'text-emerald-500' },
  mature:      { stroke: '#f59e0b', text: 'text-amber-500' },
}

export default function MaturityBadge({ score, level, ageScore, stabilityScore, livestockScore }: MaturityBadgeProps) {
  const { t } = useTranslation()
  const config = LEVEL_COLORS[level] || LEVEL_COLORS.new

  const size = 40
  const strokeWidth = 3
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const center = size / 2

  return (
    <div
      className="inline-flex items-center gap-1.5"
      title={t('maturityTooltip', { age: ageScore, stability: stabilityScore, livestock: livestockScore })}
    >
      <svg width={size} height={size} className="flex-shrink-0">
        <circle
          cx={center} cy={center} r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-600"
        />
        <circle
          cx={center} cy={center} r={radius}
          fill="none"
          stroke={config.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
        <text
          x={center} y={center}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-gray-800 dark:fill-gray-100 font-bold"
          fontSize={11}
        >
          {score}
        </text>
      </svg>
      <span className={`text-xs font-semibold capitalize ${config.text}`}>
        {t(`maturityLevels.${level}`)}
      </span>
    </div>
  )
}
