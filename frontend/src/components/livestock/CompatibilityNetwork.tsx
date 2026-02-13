/**
 * Compatibility Network Diagram
 *
 * SVG-based force-directed graph showing directed compatibility relationships
 * between aquarium species. Nodes represent species (colored by category)
 * and directed edges represent who threatens whom (predator→prey, aggressor→victim).
 *
 * Uses a simple force simulation (repulsion + edge attraction) for organic layout.
 */

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { checkPair } from '../../config/compatibilityRules'
import type { SpeciesTraits } from '../../config/compatibilityData'
import type { ResolvedSpecies, CompatibilityResult } from '../../config/compatibilityRules'

interface CompatibilityNetworkProps {
  species: ResolvedSpecies[]
}

type EdgeType = 'predator_prey' | 'incompatible' | 'caution'

interface DirectedEdge {
  from: number
  to: number
  type: EdgeType
  results: CompatibilityResult[]
}

// ── Color constants ──

const NODE_COLORS_LIGHT: Record<SpeciesTraits['category'], string> = {
  fish: '#3B82F6',
  coral: '#10B981',
  invertebrate: '#F59E0B',
}

const NODE_COLORS_DARK: Record<SpeciesTraits['category'], string> = {
  fish: '#60A5FA',
  coral: '#34D399',
  invertebrate: '#FBBF24',
}

const EDGE_COLORS: Record<EdgeType, string> = {
  predator_prey: '#EF4444',
  incompatible: '#EF4444',
  caution: '#F59E0B',
}

const NODE_RADIUS = 28
const SVG_SIZE = 560
const PADDING = 70

// ── Force simulation ──

interface SimNode {
  x: number
  y: number
  vx: number
  vy: number
  category: string
}

function runForceSimulation(
  nodes: SimNode[],
  edges: DirectedEdge[],
  iterations: number = 200,
): SimNode[] {
  const n = nodes.length
  if (n === 0) return nodes

  const width = SVG_SIZE - PADDING * 2
  const height = SVG_SIZE - PADDING * 2
  const cx = width / 2
  const cy = height / 2

  // Clone nodes
  const sim = nodes.map(node => ({ ...node }))

  // Spread initial positions — seeded by index to avoid overlap
  for (let i = 0; i < n; i++) {
    const angle = (2 * Math.PI * i) / n + Math.random() * 0.3
    const r = Math.min(width, height) * 0.3
    sim[i].x = cx + r * Math.cos(angle)
    sim[i].y = cy + r * Math.sin(angle)
    sim[i].vx = 0
    sim[i].vy = 0
  }

  // Build adjacency set for attraction
  const connected = new Set<string>()
  for (const e of edges) {
    connected.add(`${e.from}-${e.to}`)
    connected.add(`${e.to}-${e.from}`)
  }

  const repulsionStrength = 8000
  const attractionStrength = 0.005
  const centerGravity = 0.02
  const idealEdgeLength = Math.min(width, height) * 0.3
  const damping = 0.85

  for (let iter = 0; iter < iterations; iter++) {
    const cooling = 1 - iter / iterations

    // Repulsion (all pairs)
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        let dx = sim[i].x - sim[j].x
        let dy = sim[i].y - sim[j].y
        let dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 1) { dx = 1; dy = 0; dist = 1 }

        const force = (repulsionStrength * cooling) / (dist * dist)
        const fx = (dx / dist) * force
        const fy = (dy / dist) * force

        sim[i].vx += fx
        sim[i].vy += fy
        sim[j].vx -= fx
        sim[j].vy -= fy
      }
    }

    // Attraction (edges)
    for (const e of edges) {
      const a = sim[e.from]
      const b = sim[e.to]
      const dx = b.x - a.x
      const dy = b.y - a.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 1) continue

      const displacement = dist - idealEdgeLength
      const force = displacement * attractionStrength * cooling
      const fx = (dx / dist) * force
      const fy = (dy / dist) * force

      a.vx += fx
      a.vy += fy
      b.vx -= fx
      b.vy -= fy
    }

    // Center gravity
    for (let i = 0; i < n; i++) {
      sim[i].vx += (cx - sim[i].x) * centerGravity * cooling
      sim[i].vy += (cy - sim[i].y) * centerGravity * cooling
    }

    // Apply velocity + damping + boundary
    for (let i = 0; i < n; i++) {
      sim[i].vx *= damping
      sim[i].vy *= damping

      sim[i].x += sim[i].vx
      sim[i].y += sim[i].vy

      // Keep inside bounds
      sim[i].x = Math.max(NODE_RADIUS, Math.min(width - NODE_RADIUS, sim[i].x))
      sim[i].y = Math.max(NODE_RADIUS, Math.min(height - NODE_RADIUS, sim[i].y))
    }
  }

  // Offset by padding
  for (let i = 0; i < n; i++) {
    sim[i].x += PADDING
    sim[i].y += PADDING
  }

  return sim
}

// ── Helpers ──

function classifyEdge(results: CompatibilityResult[]): EdgeType {
  const hasPredatorPrey = results.some(r => r.ruleId === 'predator_prey')
  if (hasPredatorPrey) return 'predator_prey'

  const hasIncompatible = results.some(r => r.level === 'incompatible')
  if (hasIncompatible) return 'incompatible'

  return 'caution'
}

function clipLineToCircle(
  x1: number, y1: number,
  x2: number, y2: number,
  r: number,
): { x1: number; y1: number; x2: number; y2: number } {
  const dx = x2 - x1
  const dy = y2 - y1
  const dist = Math.sqrt(dx * dx + dy * dy)
  if (dist === 0) return { x1, y1, x2, y2 }

  const ux = dx / dist
  const uy = dy / dist

  return {
    x1: x1 + ux * r,
    y1: y1 + uy * r,
    x2: x2 - ux * (r + 4), // extra gap for arrowhead
    y2: y2 - uy * (r + 4),
  }
}

/**
 * Build directed edges. For each pair (i, j), we run checkPair and create
 * directed edges based on who is the aggressor (speciesA in the result).
 */
function buildDirectedEdges(species: ResolvedSpecies[]): DirectedEdge[] {
  const n = species.length
  const edgeMap = new Map<string, DirectedEdge>()

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const pairResults = checkPair(
        species[i].traits, species[i].name,
        species[j].traits, species[j].name,
      )
      if (pairResults.length === 0) continue

      // Group results by direction
      for (const r of pairResults) {
        let from: number
        let to: number

        if (r.speciesA === species[i].name) {
          from = i; to = j
        } else if (r.speciesA === species[j].name) {
          from = j; to = i
        } else {
          // Fallback: treat as i→j
          from = i; to = j
        }

        const key = `${from}-${to}`
        const existing = edgeMap.get(key)
        if (existing) {
          existing.results.push(r)
          // Upgrade type if needed
          const newType = classifyEdge(existing.results)
          existing.type = newType
        } else {
          edgeMap.set(key, {
            from,
            to,
            type: classifyEdge([r]),
            results: [r],
          })
        }
      }
    }
  }

  return Array.from(edgeMap.values())
}

// Curved path for edges (so bidirectional edges don't overlap)
function curvedPath(
  x1: number, y1: number,
  x2: number, y2: number,
  curvature: number,
): string {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const dx = x2 - x1
  const dy = y2 - y1
  // Perpendicular offset
  const cx = mx - dy * curvature
  const cy = my + dx * curvature
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`
}

// ── Component ──

export default function CompatibilityNetwork({ species }: CompatibilityNetworkProps) {
  const { t } = useTranslation('compatibility')
  const [hoveredNode, setHoveredNode] = useState<number | null>(null)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    checkDark()
    const observer = new MutationObserver(checkDark)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    return () => observer.disconnect()
  }, [])

  const nodeColors = isDark ? NODE_COLORS_DARK : NODE_COLORS_LIGHT
  const textColor = isDark ? '#D1D5DB' : '#374151'


  const n = species.length

  // Build directed edges
  const edges = useMemo(() => buildDirectedEdges(species), [species])

  // Check for bidirectional edges (to apply curvature)
  const bidirectional = useMemo(() => {
    const set = new Set<string>()
    const biSet = new Set<string>()
    for (const e of edges) {
      const reverse = `${e.to}-${e.from}`
      if (set.has(reverse)) {
        biSet.add(`${e.from}-${e.to}`)
        biSet.add(reverse)
      }
      set.add(`${e.from}-${e.to}`)
    }
    return biSet
  }, [edges])

  // Run force simulation
  const positions = useMemo(() => {
    const initialNodes: SimNode[] = species.map(sp => ({
      x: 0, y: 0, vx: 0, vy: 0,
      category: sp.traits.category,
    }))
    return runForceSimulation(initialNodes, edges)
  }, [species, edges])

  const handleNodeEnter = useCallback((idx: number) => {
    setHoveredNode(idx)
  }, [])

  const handleNodeLeave = useCallback(() => {
    setHoveredNode(null)
  }, [])

  if (n < 2) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-400 dark:text-gray-500 text-sm">
        {t('network.tooFewSpecies', { defaultValue: 'Add at least 2 species to see the compatibility network.' })}
      </div>
    )
  }

  if (edges.length === 0) {
    return (
      <div className="space-y-4">
        <svg
          width="100%"
          viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Compatibility network diagram"
        >
          {species.map((sp, i) => {
            const pos = positions[i]
            return (
              <g key={i}>
                <circle
                  cx={pos.x} cy={pos.y} r={NODE_RADIUS}
                  fill={nodeColors[sp.traits.category]} opacity={0.9}
                />
                <text
                  x={pos.x} y={pos.y + NODE_RADIUS + 14}
                  textAnchor="middle" dominantBaseline="central"
                  fill={textColor} fontSize={11} fontWeight={600}
                >
                  {sp.traits.commonGroupName}
                </text>
              </g>
            )
          })}
        </svg>
        <div className="text-center text-sm text-emerald-600 dark:text-emerald-400 font-medium">
          {t('network.noConnections', { defaultValue: 'No compatibility issues detected between these species.' })}
        </div>
        <NetworkLegend t={t} isDark={isDark} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <svg
        width="100%"
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Compatibility network diagram"
      >
        <defs>
          <marker id="arrow-red" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M 0 0 L 8 3 L 0 6 z" fill="#EF4444" />
          </marker>
          <marker id="arrow-red-dim" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M 0 0 L 8 3 L 0 6 z" fill="#EF4444" opacity="0.15" />
          </marker>
          <marker id="arrow-amber" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M 0 0 L 8 3 L 0 6 z" fill="#F59E0B" />
          </marker>
          <marker id="arrow-amber-dim" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M 0 0 L 8 3 L 0 6 z" fill="#F59E0B" opacity="0.15" />
          </marker>
        </defs>

        {/* Edges (drawn first, behind nodes) */}
        {edges.map((edge, idx) => {
          const fromPos = positions[edge.from]
          const toPos = positions[edge.to]
          const clipped = clipLineToCircle(fromPos.x, fromPos.y, toPos.x, toPos.y, NODE_RADIUS)

          const isHighlighted =
            hoveredNode === null ||
            edge.from === hoveredNode ||
            edge.to === hoveredNode

          const opacity = hoveredNode === null ? 0.7 : isHighlighted ? 0.9 : 0.12

          const isBidirectional = bidirectional.has(`${edge.from}-${edge.to}`)
          const curvature = isBidirectional ? 0.15 : 0

          let strokeDasharray: string | undefined
          let strokeWidth: number
          const arrowColor = edge.type === 'caution' ? 'amber' : 'red'
          const arrowId = isHighlighted ? `arrow-${arrowColor}` : `arrow-${arrowColor}-dim`

          switch (edge.type) {
            case 'predator_prey':
              strokeDasharray = undefined
              strokeWidth = 2.5
              break
            case 'incompatible':
              strokeDasharray = '6,3'
              strokeWidth = 2
              break
            case 'caution':
              strokeDasharray = '4,4'
              strokeWidth = 1.5
              break
          }

          if (curvature === 0) {
            return (
              <line
                key={`edge-${idx}`}
                x1={clipped.x1} y1={clipped.y1}
                x2={clipped.x2} y2={clipped.y2}
                stroke={EDGE_COLORS[edge.type]}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                opacity={opacity}
                markerEnd={`url(#${arrowId})`}
                style={{ transition: 'opacity 0.2s ease' }}
              />
            )
          }

          return (
            <path
              key={`edge-${idx}`}
              d={curvedPath(clipped.x1, clipped.y1, clipped.x2, clipped.y2, curvature)}
              fill="none"
              stroke={EDGE_COLORS[edge.type]}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              opacity={opacity}
              markerEnd={`url(#${arrowId})`}
              style={{ transition: 'opacity 0.2s ease' }}
            />
          )
        })}

        {/* Nodes */}
        {species.map((sp, i) => {
          const pos = positions[i]
          const isHighlighted = hoveredNode === null || hoveredNode === i
          const nodeOpacity = hoveredNode === null ? 0.9 : isHighlighted ? 1 : 0.3

          return (
            <g
              key={i}
              onMouseEnter={() => handleNodeEnter(i)}
              onMouseLeave={handleNodeLeave}
              style={{ cursor: 'pointer', transition: 'opacity 0.2s ease' }}
              opacity={nodeOpacity}
            >
              <circle
                cx={pos.x} cy={pos.y} r={NODE_RADIUS}
                fill={nodeColors[sp.traits.category]}
                stroke={hoveredNode === i ? textColor : 'transparent'}
                strokeWidth={hoveredNode === i ? 2 : 0}
              />
              <text
                x={pos.x} y={pos.y}
                textAnchor="middle" dominantBaseline="central"
                fill="#fff" fontSize={11} fontWeight={700}
                style={{ pointerEvents: 'none' }}
              >
                {sp.traits.commonGroupName.length > 10
                  ? sp.traits.commonGroupName.slice(0, 9) + '\u2026'
                  : sp.traits.commonGroupName}
              </text>
              <text
                x={pos.x} y={pos.y + NODE_RADIUS + 14}
                textAnchor="middle" dominantBaseline="central"
                fill={textColor}
                fontSize={11}
                fontWeight={600}
                style={{ pointerEvents: 'none' }}
              >
                {sp.traits.commonGroupName}
              </text>
            </g>
          )
        })}
      </svg>

      <NetworkLegend t={t} isDark={isDark} />
    </div>
  )
}

// ── Legend ──

interface NetworkLegendProps {
  t: (key: string, options?: Record<string, string>) => string
  isDark: boolean
}

function NetworkLegend({ t, isDark }: NetworkLegendProps) {
  const nodeColors = isDark ? NODE_COLORS_DARK : NODE_COLORS_LIGHT

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-gray-600 dark:text-gray-400">
      {/* Node types */}
      <span className="flex items-center gap-1.5">
        <svg width="12" height="12"><circle cx="6" cy="6" r="5" fill={nodeColors.fish} /></svg>
        {t('network.fish', { defaultValue: 'Fish' })}
      </span>
      <span className="flex items-center gap-1.5">
        <svg width="12" height="12"><circle cx="6" cy="6" r="5" fill={nodeColors.coral} /></svg>
        {t('network.coral', { defaultValue: 'Coral' })}
      </span>
      <span className="flex items-center gap-1.5">
        <svg width="12" height="12"><circle cx="6" cy="6" r="5" fill={nodeColors.invertebrate} /></svg>
        {t('network.invertebrate', { defaultValue: 'Invertebrate' })}
      </span>

      <span className="text-gray-300 dark:text-gray-600">|</span>

      {/* Edge types */}
      <span className="flex items-center gap-1.5">
        <svg width="28" height="12">
          <defs>
            <marker id="leg-arrow-red" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <path d="M 0 0 L 6 2 L 0 4 z" fill="#EF4444" />
            </marker>
          </defs>
          <line x1="2" y1="6" x2="22" y2="6" stroke="#EF4444" strokeWidth="2.5" markerEnd="url(#leg-arrow-red)" />
        </svg>
        {t('network.predatorPrey', { defaultValue: 'Predator \u2192 Prey' })}
      </span>
      <span className="flex items-center gap-1.5">
        <svg width="28" height="12">
          <defs>
            <marker id="leg-arrow-red2" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <path d="M 0 0 L 6 2 L 0 4 z" fill="#EF4444" />
            </marker>
          </defs>
          <line x1="2" y1="6" x2="22" y2="6" stroke="#EF4444" strokeWidth="2" strokeDasharray="6,3" markerEnd="url(#leg-arrow-red2)" />
        </svg>
        {t('network.incompatible', { defaultValue: 'Incompatible' })}
      </span>
      <span className="flex items-center gap-1.5">
        <svg width="28" height="12">
          <defs>
            <marker id="leg-arrow-amber" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <path d="M 0 0 L 6 2 L 0 4 z" fill="#F59E0B" />
            </marker>
          </defs>
          <line x1="2" y1="6" x2="22" y2="6" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4,4" markerEnd="url(#leg-arrow-amber)" />
        </svg>
        {t('network.caution', { defaultValue: 'Caution' })}
      </span>
    </div>
  )
}
