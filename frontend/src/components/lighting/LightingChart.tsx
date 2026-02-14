/**
 * Lighting Chart Component
 *
 * SVG area chart that visualises LED channel intensity curves over a 24-hour
 * schedule.  Each channel is rendered as a semi-transparent filled area whose
 * colour matches the channel definition.  Hovering over an hour column shows a
 * tooltip with the exact intensity values for every channel at that hour.
 */

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Channel {
  name: string
  color: string
}

interface LightingChartProps {
  channels: Channel[]
  scheduleData: Record<string, number[]>
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const Y_TICKS = [0, 25, 50, 75, 100]

/** Padding around the SVG drawing area (px inside the viewBox). */
const PAD = { top: 16, right: 20, bottom: 32, left: 44 }

/** Fixed viewBox height -- the component stretches to 100% width. */
const VB_HEIGHT = 250

/**
 * We use a fixed viewBox width so all coordinate maths are resolution-
 * independent.  The SVG itself is set to width="100%" so it scales with
 * the container.
 */
const VB_WIDTH = 700

/** Usable chart area inside the padding. */
const CHART_W = VB_WIDTH - PAD.left - PAD.right
const CHART_H = VB_HEIGHT - PAD.top - PAD.bottom

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map an hour (0-23) to an x coordinate in viewBox space. */
function hourToX(hour: number): number {
  return PAD.left + (hour / 23) * CHART_W
}

/** Map an intensity (0-100) to a y coordinate in viewBox space. */
function intensityToY(intensity: number): number {
  return PAD.top + CHART_H - (intensity / 100) * CHART_H
}

/**
 * Build an SVG `<path>` `d` attribute for a filled area representing one
 * channel.  The path traces the intensity curve left-to-right then returns
 * along the x-axis baseline (intensity = 0) to close the shape.
 */
function buildAreaPath(values: number[]): string {
  const points = values.map((v, h) => `${hourToX(h)},${intensityToY(v)}`)
  const baseline = `${hourToX(23)},${intensityToY(0)} ${hourToX(0)},${intensityToY(0)}`
  return `M${points.join(' L')} L${baseline} Z`
}

/**
 * Build an SVG `<polyline>` `points` attribute for the stroke-only curve
 * drawn on top of the filled area.
 */
function buildLinePath(values: number[]): string {
  return values.map((v, h) => `${hourToX(h)},${intensityToY(v)}`).join(' ')
}

/**
 * Resolve the intensity array for every hour (0-23).  Hours missing from
 * `scheduleData` default to 0 for all channels.
 */
function resolveHourlyData(
  scheduleData: Record<string, number[]>,
  channelCount: number,
): number[][] {
  return HOURS.map((h) => {
    const raw = scheduleData[String(h)]
    if (raw) {
      // Pad with zeros if the array is shorter than the channel count
      return Array.from({ length: channelCount }, (_, i) => raw[i] ?? 0)
    }
    return Array(channelCount).fill(0) as number[]
  })
}

/**
 * Convert a hex colour string to an rgba() value with the given alpha.
 * Falls back to the raw colour with 0.25 opacity if parsing fails.
 */
function hexToRgba(hex: string, alpha: number): string {
  const cleaned = hex.replace('#', '')
  if (cleaned.length === 3) {
    const r = parseInt(cleaned[0] + cleaned[0], 16)
    const g = parseInt(cleaned[1] + cleaned[1], 16)
    const b = parseInt(cleaned[2] + cleaned[2], 16)
    return `rgba(${r},${g},${b},${alpha})`
  }
  if (cleaned.length === 6) {
    const r = parseInt(cleaned.slice(0, 2), 16)
    const g = parseInt(cleaned.slice(2, 4), 16)
    const b = parseInt(cleaned.slice(4, 6), 16)
    return `rgba(${r},${g},${b},${alpha})`
  }
  return hex
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function LightingChart({ channels, scheduleData }: LightingChartProps) {
  const { t } = useTranslation('lighting')

  // Ref for the container so we can compute the hovered hour from mouse pos
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const [hoveredHour, setHoveredHour] = useState<number | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null)

  // Pre-compute full 24-hour intensity matrix (one row per hour)
  const hourlyData = useMemo(
    () => resolveHourlyData(scheduleData, channels.length),
    [scheduleData, channels.length],
  )

  // Per-channel value arrays (one array of 24 values per channel)
  const channelSeries = useMemo(() => {
    return channels.map((_, chIdx) => HOURS.map((h) => hourlyData[h][chIdx]))
  }, [channels, hourlyData])

  // ------------------------------------------------------------------
  // Mouse interaction
  // ------------------------------------------------------------------

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const svg = svgRef.current
      if (!svg) return

      const rect = svg.getBoundingClientRect()
      // Convert DOM coords to viewBox coords
      const scaleX = VB_WIDTH / rect.width
      const vbX = (e.clientX - rect.left) * scaleX

      // Determine which hour column the cursor is in
      if (vbX < PAD.left || vbX > PAD.left + CHART_W) {
        setHoveredHour(null)
        setTooltipPos(null)
        return
      }

      const ratio = (vbX - PAD.left) / CHART_W
      const hour = Math.round(ratio * 23)
      const clampedHour = Math.max(0, Math.min(23, hour))

      setHoveredHour(clampedHour)

      // Tooltip position in DOM pixels (relative to the container)
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    },
    [],
  )

  const handleMouseLeave = useCallback(() => {
    setHoveredHour(null)
    setTooltipPos(null)
  }, [])

  // Close tooltip on scroll (prevents stale floating tooltip)
  useEffect(() => {
    const onScroll = () => {
      setHoveredHour(null)
      setTooltipPos(null)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  return (
    <div ref={containerRef} className="relative w-full">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VB_WIDTH} ${VB_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-auto"
        style={{ maxHeight: 250 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* ── Grid lines ── */}
        {/* Horizontal grid lines + Y-axis labels */}
        {Y_TICKS.map((pct) => {
          const y = intensityToY(pct)
          return (
            <g key={`y-${pct}`}>
              <line
                x1={PAD.left}
                y1={y}
                x2={PAD.left + CHART_W}
                y2={y}
                stroke="var(--chart-grid)"
                strokeWidth={1}
                strokeDasharray={pct === 0 ? undefined : '4 3'}
              />
              <text
                x={PAD.left - 6}
                y={y + 3}
                textAnchor="end"
                fill="var(--chart-text)"
                fontSize={10}
                fontFamily="system-ui, sans-serif"
              >
                {pct}%
              </text>
            </g>
          )
        })}

        {/* Vertical grid lines + X-axis labels (every 3 hours) */}
        {HOURS.filter((h) => h % 3 === 0).map((h) => {
          const x = hourToX(h)
          return (
            <g key={`x-${h}`}>
              <line
                x1={x}
                y1={PAD.top}
                x2={x}
                y2={PAD.top + CHART_H}
                stroke="var(--chart-grid)"
                strokeWidth={1}
                strokeDasharray="4 3"
              />
              <text
                x={x}
                y={VB_HEIGHT - PAD.bottom + 16}
                textAnchor="middle"
                fill="var(--chart-text)"
                fontSize={10}
                fontFamily="system-ui, sans-serif"
              >
                {String(h).padStart(2, '0')}
              </text>
            </g>
          )
        })}

        {/* ── Axis lines ── */}
        {/* X axis */}
        <line
          x1={PAD.left}
          y1={PAD.top + CHART_H}
          x2={PAD.left + CHART_W}
          y2={PAD.top + CHART_H}
          stroke="var(--chart-axis)"
          strokeWidth={1}
        />
        {/* Y axis */}
        <line
          x1={PAD.left}
          y1={PAD.top}
          x2={PAD.left}
          y2={PAD.top + CHART_H}
          stroke="var(--chart-axis)"
          strokeWidth={1}
        />

        {/* ── Channel areas (rendered back-to-front) ── */}
        {channelSeries.map((values, idx) => {
          const channel = channels[idx]
          return (
            <g key={`ch-${idx}`}>
              {/* Filled area */}
              <path
                d={buildAreaPath(values)}
                fill={hexToRgba(channel.color, 0.25)}
              />
              {/* Stroke line on top */}
              <polyline
                points={buildLinePath(values)}
                fill="none"
                stroke={channel.color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </g>
          )
        })}

        {/* ── Hover indicator column ── */}
        {hoveredHour !== null && (
          <>
            <line
              x1={hourToX(hoveredHour)}
              y1={PAD.top}
              x2={hourToX(hoveredHour)}
              y2={PAD.top + CHART_H}
              stroke="var(--chart-axis)"
              strokeWidth={1}
              strokeDasharray="3 2"
              opacity={0.6}
            />
            {/* Dots on each channel curve at the hovered hour */}
            {channelSeries.map((values, idx) => (
              <circle
                key={`dot-${idx}`}
                cx={hourToX(hoveredHour)}
                cy={intensityToY(values[hoveredHour])}
                r={4}
                fill={channels[idx].color}
                stroke="#fff"
                strokeWidth={1.5}
              />
            ))}
          </>
        )}
      </svg>

      {/* ── Tooltip (HTML overlay) ── */}
      {hoveredHour !== null && tooltipPos && (
        <div
          className="absolute z-50 pointer-events-none bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs"
          style={{
            left: tooltipPos.x + 14,
            top: tooltipPos.y - 10,
            transform: tooltipPos.x > (containerRef.current?.clientWidth ?? 0) * 0.7
              ? 'translateX(-110%)'
              : undefined,
          }}
        >
          <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {t('chart.xAxis')}: {String(hoveredHour).padStart(2, '0')}:00
          </div>
          {channels.map((ch, idx) => (
            <div key={idx} className="flex items-center gap-2 py-0.5">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: ch.color }}
              />
              <span className="text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
                {ch.name}
              </span>
              <span className="ml-auto font-medium text-gray-900 dark:text-gray-100">
                {hourlyData[hoveredHour][idx]}%
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Legend ── */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 px-1">
        {channels.map((ch, idx) => (
          <div key={idx} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
            <span
              className="inline-block w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: ch.color }}
            />
            {ch.name}
          </div>
        ))}
      </div>
    </div>
  )
}
