/**
 * GraphPanel — DG/TKG 그래프 자동 분기 컨테이너
 *
 * metadata.graphType에 따라 TreeGraph(DG) 또는 ForceGraph(TKG) 자동 렌더링.
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
import { ReactFlowProvider } from '@xyflow/react'

// 간단한 className 유틸
function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}

// TKG metadata 타입 가드
function isTKGGraphMetadata(metadata: GraphData['metadata']): boolean {
  return (metadata as any)?.graphType === 'multihop_tkg'
}

export interface GraphPanelLabels {
  dgTitle?: string
  tkgTitle?: string
  nodes?: string
  edges?: string
}

export interface GraphPanelProps {
  graphData: GraphData
  labels?: GraphPanelLabels
  className?: string
  hideHeader?: boolean
  theme?: 'light' | 'dark'
  // TreeGraph props
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

  const isTKG = isTKGGraphMetadata(graphData.metadata)

  const defaultLabels: GraphPanelLabels = {
    dgTitle: labels?.dgTitle ?? 'Knowledge Graph',
    tkgTitle: labels?.tkgTitle ?? 'Multi-hop Graph',
    nodes: labels?.nodes ?? 'nodes',
    edges: labels?.edges ?? 'edges',
  }

  // 헤더 렌더링
  const renderHeader = (title: string, nodeCount: number, edgeCount?: number) => (
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
          {nodeCount} {defaultLabels.nodes}
          {edgeCount !== undefined && ` · ${edgeCount} ${defaultLabels.edges}`}
        </span>
        <span className="md:hidden text-muted-foreground">
          {isCollapsed ? (
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          ) : (
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          )}
        </span>
      </div>
    </button>
  )

  // TKG 멀티홉 그래프
  if (isTKG) {
    const totalNodes = graphData.metadata?.totalNodes ?? 0
    const totalEdges = (graphData.metadata as any)?.totalEdges ?? 0

    return (
      <div
        className={cn(
          'relative overflow-hidden',
          !hideHeader && 'rounded-xl border border-border bg-card',
          className
        )}
      >
        {!hideHeader && renderHeader(defaultLabels.tkgTitle!, totalNodes, totalEdges)}
        {(hideHeader || !isCollapsed) && (
          <div className={hideHeader ? 'h-full' : 'h-[calc(100%-28px)]'}>
            <ForceGraph
              graphData={graphData}
              theme={theme}
              onNodeClick={onNodeClick}
              onNodeHover={onNodeHover}
              hoveredNodeId={hoveredNodeId}
            />
          </div>
        )}
      </div>
    )
  }

  // DG 트리 그래프
  const totalNodes = graphData.metadata?.totalNodes ?? 0

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        !hideHeader && 'rounded-xl border border-border bg-card',
        isCollapsed && 'h-auto',
        className
      )}
    >
      {!hideHeader && renderHeader(defaultLabels.dgTitle!, totalNodes)}

      {(hideHeader || !isCollapsed) && (
        <div className={hideHeader ? 'h-full' : 'h-[calc(100%-28px)]'}>
          <ReactFlowProvider>
            <TreeGraph
              graphData={graphData}
              selectedNodeId={selectedNodeId}
              hoveredNodeId={hoveredNodeId}
              onNodeSelect={onNodeSelect}
              onNodeHover={onNodeHover}
            />
          </ReactFlowProvider>
        </div>
      )}
    </div>
  )
}
