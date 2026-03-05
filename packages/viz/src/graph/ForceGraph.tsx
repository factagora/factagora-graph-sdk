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
import * as d3Force from 'd3-force'
import type { GraphData, GraphNode, TKGNodeMetadata } from '@factagora/types'
import {
  HOP_LABELS,
  DISCOVERY_GLOW_COLOR,
  DISCOVERY_GLOW_ALPHA,
  DISCOVERY_GLOW_BLUR,
  DARK_MODE,
  LIGHT_MODE,
} from './tkgGraphStyles'
import { getNodeHex } from './graphStyles'

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
  type: string
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
  const fgRef = useRef<any>(null)
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

  // Force simulation 최적화 (LR 계층 구조 + 라벨 겹침 방지)
  useEffect(() => {
    if (!fgRef.current) return

    // link force: 엣지 길이 증가
    fgRef.current.d3Force('link')?.distance(150)

    // charge force: 노드 간 반발력 증가
    fgRef.current.d3Force('charge')?.strength(-400)

    // x-force: hop distance에 따라 Left-to-Right 배치 강제
    fgRef.current.d3Force(
      'x',
      d3Force.forceX((node: any) => {
        const hop = node.metadata?.hopDistance ?? 0
        return hop * 200  // hop마다 200px 간격
      }).strength(0.5)  // x 방향 강제력
    )

    // y-force: 중앙 정렬 (약한 힘)
    fgRef.current.d3Force('y', d3Force.forceY(0).strength(0.1))

    // 시뮬레이션 재시작
    fgRef.current.d3ReheatSimulation()
  }, [graphData])

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
        type: n.type,
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

  // 노드 색상 (타입별 - graphStyles.ts 사용)
  const nodeColor = useCallback((rawNode: any) => {
    const node = rawNode as ForceNode
    return getNodeHex(node.type)
  }, [])

  // 노드 크기 (연결된 엣지 수에 비례)
  const nodeVal = useCallback(
    (rawNode: any) => {
      const node = rawNode as ForceNode
      // 이 노드와 연결된 엣지 수 계산 (degree centrality)
      const degree = data.links.filter((link) => {
        const source = link.source as string | ForceNode
        const target = link.target as string | ForceNode
        const sourceId = typeof source === 'string' ? source : source.id
        const targetId = typeof target === 'string' ? target : target.id
        return sourceId === node.id || targetId === node.id
      }).length

      // degree에 비례하는 크기 (최소 4, degree당 3 추가, 최대 30)
      const size = Math.max(4, Math.min(4 + degree * 3, 30))
      return size
    },
    [data.links]
  )

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

  // 엣지 라벨 그리기 (항상 표시, 겹침 방지를 위한 오프셋)
  const linkCanvasObject = useCallback(
    (rawLink: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const link = rawLink as ForceLink
      const source = typeof link.source === 'object' ? link.source : null
      const target = typeof link.target === 'object' ? link.target : null

      if (!source || !target || source.x == null || target.x == null || source.y == null || target.y == null) {
        return
      }

      // 엣지 중간 지점 계산
      const midX = (source.x + target.x) / 2
      const midY = (source.y + target.y) / 2

      // 엣지 각도 계산 (라벨 오프셋 방향 결정)
      const dx = target.x - source.x
      const dy = target.y - source.y
      const angle = Math.atan2(dy, dx)

      // 라벨을 엣지에서 약간 떨어뜨려서 겹침 방지
      const offsetDistance = 15 / globalScale
      const offsetX = -Math.sin(angle) * offsetDistance
      const offsetY = Math.cos(angle) * offsetDistance

      const labelX = midX + offsetX
      const labelY = midY + offsetY

      // 라벨 텍스트
      const text = link.relationship.replace(/_/g, ' ')
      const fontSize = 11 / globalScale
      ctx.font = `${fontSize}px "Courier New", monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // 텍스트 크기 측정
      const textWidth = ctx.measureText(text).width
      const padding = 5 / globalScale

      // 배경 그리기 (약간 더 투명하게)
      ctx.fillStyle = isDark ? 'rgba(0, 0, 0, 0.75)' : 'rgba(255, 255, 255, 0.85)'
      ctx.fillRect(
        labelX - textWidth / 2 - padding,
        labelY - fontSize / 2 - padding / 2,
        textWidth + padding * 2,
        fontSize + padding
      )

      // 텍스트 그리기
      ctx.fillStyle = isDark ? '#ffffff' : '#374151'
      ctx.fillText(text, labelX, labelY)
    },
    [isDark]
  )

  return (
    <div ref={containerRef} className="w-full">
      <ForceGraph2D
        ref={fgRef}
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
        linkCanvasObjectMode={() => 'after'}
        linkCanvasObject={linkCanvasObject}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={0.8}
        d3AlphaDecay={0.02}        // 시뮬레이션 안정화 속도 (기본값: 0.0228)
        d3VelocityDecay={0.3}      // 노드 움직임 감속 (기본값: 0.4)
        warmupTicks={100}          // 초기 시뮬레이션 틱 (더 나은 배치)
        cooldownTicks={100}        // 안정화 시뮬레이션 틱
        enableZoomInteraction
        enablePanInteraction
      />
    </div>
  )
}
