/**
 * ForceGraph — react-force-graph-2d 기반 TKG 멀티홉 그래프 렌더러
 *
 * hop distance별 노드 색상/크기, Discovery 글로우, 방향 에지
 * Canvas API 사용 (SSR 환경에서는 dynamic import 필수)
 *
 * @example
 * ```tsx
 * import dynamic from 'next/dynamic'
 * const ForceGraph = dynamic(() => import('@factagora/viz/graph').then(m => ({ default: m.ForceGraph })), { ssr: false })
 *
 * <ForceGraph
 *   graphData={data}
 *   theme="dark"
 *   onNodeClick={(node, data) => console.log(node)}
 *   onNodeHover={(id) => setHoveredId(id)}
 *   hoveredNodeId={hoveredId}
 * />
 * ```
 */

'use client'

import { useMemo, useRef, useState, useEffect, useCallback } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import type { GraphData, GraphNode, TKGNodeMetadata } from '@factagora/types'
import {
  HOP_COLORS,
  HOP_SIZES,
  HOP_LABELS,
  DISCOVERY_GLOW_COLOR,
  DISCOVERY_GLOW_ALPHA,
  DISCOVERY_GLOW_BLUR,
  DEFAULT_HOP_COLOR,
  DARK_MODE,
  LIGHT_MODE,
} from './tkgGraphStyles'

// ─── Types ──────────────────────────────────────────────────────

// react-force-graph-2d의 노드/링크는 [others: string]: any 확장 제네릭이므로
// 콜백에서 any로 받은 뒤 내부에서 타입 어서션하여 사용
interface ForceNode {
  id: string
  label: string
  confidence: number | null
  isDirectMatch: boolean
  content: string | null
  metadata: TKGNodeMetadata | null
  x?: number
  y?: number
  [key: string]: unknown
}

interface ForceLink {
  source: string | ForceNode
  target: string | ForceNode
  relationship: string
  weight: number | null
  [key: string]: unknown
}

export interface ForceGraphProps {
  graphData: GraphData
  theme?: 'light' | 'dark'
  onNodeClick?: (node: GraphNode, graphData: GraphData) => void
  onNodeHover?: (nodeId: string | null) => void
  hoveredNodeId?: string | null
}

// ─── Component ──────────────────────────────────────────────────

export function ForceGraph({
  graphData,
  theme = 'light',
  onNodeClick,
  onNodeHover,
  hoveredNodeId,
}: ForceGraphProps) {
  const isDark = theme === 'dark'
  const colors = isDark ? DARK_MODE : LIGHT_MODE

  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 })

  // 반응형 크기
  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect
      setDimensions({
        width,
        height: width < 768 ? 250 : 400,
      })
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  // SSE nodes/edges → ForceGraph 형식 변환
  const data = useMemo(
    () => ({
      nodes: graphData.nodes.map((n) => ({
        id: n.id,
        label: n.label,
        confidence: n.confidence,
        isDirectMatch: n.isDirectMatch,
        content: n.content,
        metadata: n.metadata as TKGNodeMetadata | null,
      })),
      links: graphData.edges.map((e) => ({
        source: e.source,
        target: e.target,
        relationship: e.relationship,
        weight: e.weight,
      })),
    }),
    [graphData]
  )

  // 노드 클릭 → 콜백 호출
  const handleNodeClick = useCallback(
    (rawNode: any) => {
      const node = rawNode as ForceNode
      const graphNode = graphData.nodes.find((n) => n.id === node.id)
      if (!graphNode || !onNodeClick) return
      onNodeClick(graphNode, graphData)
    },
    [graphData, onNodeClick]
  )

  // 노드 hover → 콜백 호출
  const handleNodeHover = useCallback(
    (rawNode: any) => {
      const node = rawNode as ForceNode | null
      if (onNodeHover) {
        onNodeHover(node?.id ?? null)
      }
    },
    [onNodeHover]
  )

  // 노드 색상 (hop distance별)
  const nodeColor = useCallback((rawNode: any) => {
    const node = rawNode as ForceNode
    const hop = node.metadata?.hopDistance ?? 0
    return HOP_COLORS[hop] ?? DEFAULT_HOP_COLOR
  }, [])

  // 노드 크기 (hop distance별)
  const nodeVal = useCallback((rawNode: any) => {
    const node = rawNode as ForceNode
    const hop = node.metadata?.hopDistance ?? 0
    return HOP_SIZES[hop] ?? 1
  }, [])

  // 노드 툴팁
  const nodeLabel = useCallback((rawNode: any) => {
    const node = rawNode as ForceNode
    const hop = node.metadata?.hopDistance ?? 0
    const conf = ((node.metadata?.pathConfidence ?? 0) * 100).toFixed(0)
    const hopLabel = HOP_LABELS[hop] ?? `${hop}-hop`
    const discovery = node.metadata?.isDiscoveryNode ? ' ✨ Discovery' : ''
    return `${node.label}\n${hopLabel} · 신뢰도 ${conf}%${discovery}`
  }, [])

  // 에지 라벨
  const linkLabel = useCallback((rawLink: any) => {
    const link = rawLink as ForceLink
    return typeof link.relationship === 'string'
      ? link.relationship.replace(/_/g, ' ')
      : ''
  }, [])

  // 에지 굵기 (confidence 비례)
  const linkWidth = useCallback((rawLink: any) => {
    const link = rawLink as ForceLink
    return Math.max(0.5, (link.weight ?? 0.5) * 3)
  }, [])

  // 에지 색상 (confidence에 따라 투명도 조절)
  const linkColor = useCallback(
    (rawLink: any) => {
      const link = rawLink as ForceLink
      const alpha = 0.3 + (link.weight ?? 0.5) * 0.7
      return `rgba(${colors.edgeBase}, ${alpha})`
    },
    [colors.edgeBase]
  )

  // Canvas 커스텀 드로잉 (Discovery 글로우 + hover 하이라이트)
  const nodeCanvasObject = useCallback(
    (rawNode: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const node = rawNode as ForceNode
      // Discovery 노드 글로우
      if (node.metadata?.isDiscoveryNode && node.x != null && node.y != null) {
        const radius = 8 / globalScale
        ctx.beginPath()
        ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI)
        ctx.fillStyle = `rgba(255, 215, 0, ${DISCOVERY_GLOW_ALPHA})`
        ctx.shadowColor = DISCOVERY_GLOW_COLOR
        ctx.shadowBlur = DISCOVERY_GLOW_BLUR / globalScale
        ctx.fill()
        ctx.shadowBlur = 0
      }

      // Hover 하이라이트
      if (node.id === hoveredNodeId && node.x != null && node.y != null) {
        const r = 10 / globalScale
        ctx.beginPath()
        ctx.arc(node.x, node.y, r, 0, 2 * Math.PI)
        ctx.strokeStyle = '#3B82F6'
        ctx.lineWidth = 2 / globalScale
        ctx.stroke()
      }
    },
    [hoveredNodeId]
  )

  return (
    <div ref={containerRef} className="w-full">
      <ForceGraph2D
        graphData={data}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor={colors.background}
        nodeLabel={nodeLabel}
        nodeVal={nodeVal}
        nodeColor={nodeColor}
        nodeCanvasObjectMode={() => 'before'}
        nodeCanvasObject={nodeCanvasObject}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        linkLabel={linkLabel}
        linkWidth={linkWidth}
        linkColor={linkColor}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={0.8}
        cooldownTicks={100}
        enableZoomInteraction
        enablePanInteraction
      />
    </div>
  )
}
