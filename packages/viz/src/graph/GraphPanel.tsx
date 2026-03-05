/**
 * GraphPanel — DG/TKG/Evidence/ArgumentMap 그래프 자동 분기 컨테이너
 *
 * metadata.graphType에 따라 자동 렌더링:
 * - "multihop_tkg" → ForceGraph
 * - "evidence" → EvidenceTreeGraph
 * - "argument_map" → ArgumentMapGraph
 * - 그 외 → TreeGraph (DG 기본)
 *
 * 헤더 숨김 옵션 제공.
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
 *     argumentMapTitle: "Argument Map",
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

import type { GraphData, GraphNode } from '@factagora/types'
import { ForceGraph } from './ForceGraph'
import { TreeGraph } from './TreeGraph'
import { EvidenceTreeGraph } from './EvidenceTreeGraph'
import { ArgumentMapGraph } from './ArgumentMapGraph'
import { ReactFlowProvider } from '@xyflow/react'

/** graphType 판별 */
function getGraphType(metadata: GraphData['metadata']): 'tkg' | 'evidence' | 'argument_map' | 'dg' {
  const graphType = (metadata as any)?.graphType
  if (graphType === 'multihop_tkg') return 'tkg'
  if (graphType === 'evidence') return 'evidence'
  if (graphType === 'argument_map') return 'argument_map'
  return 'dg'
}

export interface GraphPanelLabels {
  dgTitle?: string
  tkgTitle?: string
  evidenceTitle?: string
  argumentMapTitle?: string
  nodes?: string
  edges?: string
}

export interface GraphPanelProps {
  graphData: GraphData
  labels?: GraphPanelLabels
  className?: string
  hideHeader?: boolean
  theme?: 'light' | 'dark'
  // TreeGraph / EvidenceTreeGraph / ArgumentMapGraph props
  selectedNodeId?: string | null
  hoveredNodeId?: string | null
  onNodeSelect?: (nodeId: string | null) => void
  onNodeHover?: (nodeId: string | null) => void
  // ForceGraph props
  onNodeClick?: (node: GraphNode, graphData: GraphData) => void
  // Font customization
  fontFamily?: string
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
  fontFamily = '"Courier New", Courier, monospace',
}: GraphPanelProps) {
  const graphType = getGraphType(graphData.metadata)

  const defaultLabels: Required<GraphPanelLabels> = {
    dgTitle: labels?.dgTitle ?? 'Knowledge Graph',
    tkgTitle: labels?.tkgTitle ?? 'Multi-hop Graph',
    evidenceTitle: labels?.evidenceTitle ?? 'Evidence Graph',
    argumentMapTitle: labels?.argumentMapTitle ?? 'Argument Map',
    nodes: labels?.nodes ?? 'nodes',
    edges: labels?.edges ?? 'edges',
  }

  const title = graphType === 'tkg'
    ? defaultLabels.tkgTitle
    : graphType === 'evidence'
      ? defaultLabels.evidenceTitle
      : graphType === 'argument_map'
        ? defaultLabels.argumentMapTitle
        : defaultLabels.dgTitle

  const totalNodes = graphData.metadata?.totalNodes ?? graphData.nodes.length
  const totalEdges = (graphData.metadata as any)?.totalEdges ?? graphData.edges.length

  const renderHeader = () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '6px 12px',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: 'rgba(249, 250, 251, 0.3)',
      }}
    >
      <span
        style={{
          fontSize: '10px',
          fontWeight: 600,
          color: '#6b7280',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {title}
      </span>
      <span
        style={{
          fontSize: '10px',
          color: '#6b7280',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {totalNodes} {defaultLabels.nodes}
        {totalEdges > 0 && ` · ${totalEdges} ${defaultLabels.edges}`}
      </span>
    </div>
  )

  const contentStyle: React.CSSProperties = hideHeader
    ? { height: '100%' }
    : { height: 'calc(100% - 28px)' }

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    height: '100%',
    ...(!hideHeader && {
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      backgroundColor: '#ffffff',
    }),
  }

  return (
    <div className={className} style={containerStyle}>
      {!hideHeader && renderHeader()}

      <div style={contentStyle}>
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

        {graphType === 'argument_map' && (
          <ReactFlowProvider>
            <ArgumentMapGraph
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
              fontFamily={fontFamily}
            />
          </ReactFlowProvider>
        )}
      </div>
    </div>
  )
}
