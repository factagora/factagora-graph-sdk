/**
 * GraphPanel — DG/TKG/Evidence 그래프 자동 분기 컨테이너
 *
 * metadata.graphType에 따라 자동 렌더링:
 * - "multihop_tkg" → ForceGraph
 * - "evidence" → EvidenceTreeGraph
 * - 그 외 → TreeGraph (DG 기본)
 *
 * 모바일에서 collapse 가능, 헤더 숨김 옵션 제공.
 *
 * @example
 * ```tsx
 * import { GraphPanel } from '@factagora/viz/graph'
 *
 * <GraphPanel
 *   graphData={data}
 *   labels={{
 *     dgTitle: "Knowledge Graph",
 *     tkgTitle: "Multi-hop Graph",
 *     evidenceTitle: "Evidence Graph",
 *     nodes: "nodes",
 *     edges: "edges"
 *   }}
 *   selectedNodeId={selectedId}
 *   hoveredNodeId={hoveredId}
 *   onNodeSelect={(id) => setSelectedId(id)}
 *   onNodeHover={(id) => setHoveredId(id)}
 *   onNodeClick={(node, data) => openDetail(node)}
 * />
 * ```
 */

'use client'

import { useState } from 'react'
import type { GraphData, GraphNode } from '@factagora/types'
import { ForceGraph } from './ForceGraph'
import { TreeGraph } from './TreeGraph'
import { EvidenceTreeGraph } from './EvidenceTreeGraph'
import { ReactFlowProvider } from '@xyflow/react'

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}

/** graphType 판별 */
function getGraphType(metadata: GraphData['metadata']): 'tkg' | 'evidence' | 'dg' {
  const graphType = (metadata as any)?.graphType
  if (graphType === 'multihop_tkg') return 'tkg'
  if (graphType === 'evidence') return 'evidence'
  return 'dg'
}

export interface GraphPanelLabels {
  dgTitle?: string
  tkgTitle?: string
  evidenceTitle?: string
  nodes?: string
  edges?: string
}

export interface GraphPanelProps {
  graphData: GraphData
  labels?: GraphPanelLabels
  className?: string
  hideHeader?: boolean
  theme?: 'light' | 'dark'
  // TreeGraph / EvidenceTreeGraph props
  selectedNodeId?: string | null
  hoveredNodeId?: string | null
  onNodeSelect?: (nodeId: string) => void
  onNodeHover?: (nodeId: string | null) => void
  // ForceGraph props
  onNodeClick?: (node: GraphNode, graphData: GraphData) => void
}

export function GraphPanel({
  graphData,
  labels,
  className,
  hideHeader = false,
  theme = 'light',
  selectedNodeId,
  hoveredNodeId,
  onNodeSelect,
  onNodeHover,
  onNodeClick,
}: GraphPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const graphType = getGraphType(graphData.metadata)

  const defaultLabels: Required<GraphPanelLabels> = {
    dgTitle: labels?.dgTitle ?? 'Knowledge Graph',
    tkgTitle: labels?.tkgTitle ?? 'Multi-hop Graph',
    evidenceTitle: labels?.evidenceTitle ?? 'Evidence Graph',
    nodes: labels?.nodes ?? 'nodes',
    edges: labels?.edges ?? 'edges',
  }

  const title = graphType === 'tkg'
    ? defaultLabels.tkgTitle
    : graphType === 'evidence'
      ? defaultLabels.evidenceTitle
      : defaultLabels.dgTitle

  const totalNodes = graphData.metadata?.totalNodes ?? graphData.nodes.length
  const totalEdges = (graphData.metadata as any)?.totalEdges ?? graphData.edges.length

  const renderHeader = () => (
    <button
      type="button"
      onClick={() => setIsCollapsed((prev) => !prev)}
      className="flex items-center justify-between w-full px-3 py-1.5 border-b border-border bg-muted/30 md:cursor-default"
    >
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        {title}
      </span>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground tabular-nums">
          {totalNodes} {defaultLabels.nodes}
          {totalEdges > 0 && ` · ${totalEdges} ${defaultLabels.edges}`}
        </span>
        <span className="md:hidden text-muted-foreground">
          {isCollapsed ? (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          )}
        </span>
      </div>
    </button>
  )

  const contentClassName = hideHeader ? 'h-full' : 'h-[calc(100%-28px)]'

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        !hideHeader && 'rounded-xl border border-border bg-card',
        isCollapsed && 'h-auto',
        className,
      )}
    >
      {!hideHeader && renderHeader()}

      {(hideHeader || !isCollapsed) && (
        <div className={contentClassName}>
          {graphType === 'tkg' && (
            <ForceGraph
              graphData={graphData}
              theme={theme}
              onNodeClick={onNodeClick}
              onNodeHover={onNodeHover}
              hoveredNodeId={hoveredNodeId}
            />
          )}

          {graphType === 'evidence' && (
            <ReactFlowProvider>
              <EvidenceTreeGraph
                graphData={graphData}
                selectedNodeId={selectedNodeId}
                hoveredNodeId={hoveredNodeId}
                onNodeSelect={onNodeSelect}
                onNodeHover={onNodeHover}
              />
            </ReactFlowProvider>
          )}

          {graphType === 'dg' && (
            <ReactFlowProvider>
              <TreeGraph
                graphData={graphData}
                selectedNodeId={selectedNodeId}
                hoveredNodeId={hoveredNodeId}
                onNodeSelect={onNodeSelect}
                onNodeHover={onNodeHover}
              />
            </ReactFlowProvider>
          )}
        </div>
      )}
    </div>
  )
}
