/**
 * ArgumentMapGraph — @xyflow/react 기반 Argument Map 그래프 렌더링
 *
 * root_claim을 중심으로 sub_claim 노드를
 * dagre TB (Top-Bottom) 레이아웃으로 표시한다.
 *
 * Edge Type별 색상:
 * - SUPPORTS: green
 * - CONTRADICTS: red
 * - QUALIFIES: yellow
 * - DEPENDS_ON: blue
 * - DERIVED_FROM: purple
 * - SUPERSEDES: orange
 *
 * @example
 * ```tsx
 * import { ArgumentMapGraph } from '@factagora/viz/graph'
 *
 * <ArgumentMapGraph
 *   graphData={data}
 *   selectedNodeId={selectedId}
 *   hoveredNodeId={hoveredId}
 *   onNodeSelect={(id) => setSelectedId(id)}
 *   onNodeHover={(id) => setHoveredId(id)}
 * />
 * ```
 */

'use client'

import { useMemo, useCallback } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type NodeTypes,
  type EdgeTypes,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import dagre from '@dagrejs/dagre'
import type { GraphData } from '@factagora/types'
import { ArgumentMapGraphNode } from './ArgumentMapGraphNode'
import { ArgumentMapCustomEdge } from './ArgumentMapCustomEdge'

const nodeTypes: NodeTypes = {
  argumentMapNode: ArgumentMapGraphNode,
}

const edgeTypes: EdgeTypes = {
  custom: ArgumentMapCustomEdge,
}

// 레이아웃 상수
const NODE_WIDTH = 220
const NODE_HEIGHT = 40

// 엣지 타입별 색상 (간단한 매핑)
const EDGE_TYPE_COLORS: Record<string, string> = {
  SUPPORTS: '#22c55e',
  CONTRADICTS: '#ef4444',
  QUALIFIES: '#eab308',
  DEPENDS_ON: '#3b82f6',
  DERIVED_FROM: '#a855f7',
  SUPERSEDES: '#f97316',
}

const getEdgeTypeColor = (type: string) => EDGE_TYPE_COLORS[type.toUpperCase()] || '#94a3b8'

/** dagre LR 레이아웃 계산 */
function getArgumentMapLayout(graphData: GraphData): {
  nodes: Node[]
  edges: import('@xyflow/react').Edge[]
} {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({
    rankdir: 'LR', // Left-to-Right
    nodesep: 80,
    ranksep: 120,
    marginx: 20,
    marginy: 20,
  })

  graphData.nodes.forEach((node) => {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  })

  graphData.edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target)
  })

  dagre.layout(g)

  const layoutedNodes: Node[] = graphData.nodes.map((node) => {
    const pos = g.node(node.id)
    return {
      id: node.id,
      type: 'argumentMapNode',
      position: {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - NODE_HEIGHT / 2,
      },
      data: {
        node,
        isHovered: false,
        isSelected: false,
      },
    }
  })

  // 각 source별로 엣지 그룹화 (한 점에서 여러 엣지가 나갈 때 겹치지 않게)
  const sourceEdgeGroups = new Map<string, number>()
  graphData.edges.forEach((edge) => {
    const count = sourceEdgeGroups.get(edge.source) || 0
    sourceEdgeGroups.set(edge.source, count + 1)
  })

  const sourceEdgeIndex = new Map<string, number>()

  const layoutedEdges: import('@xyflow/react').Edge[] = graphData.edges.map((edge, i) => {
    const edgeType = edge.relationship.toUpperCase()
    const color = getEdgeTypeColor(edgeType)

    // 같은 source에서 나가는 엣지들의 index 계산
    const sourceCount = sourceEdgeGroups.get(edge.source) || 1
    const index = sourceEdgeIndex.get(edge.source) || 0
    sourceEdgeIndex.set(edge.source, index + 1)

    return {
      id: `e-${edge.source}-${edge.target}-${i}`,
      source: edge.source,
      target: edge.target,
      type: 'custom',
      data: {
        index,
        total: sourceCount,
      },
      animated: false,
      style: {
        stroke: color,
        strokeWidth: 2,
      },
      markerEnd: {
        type: 'arrowclosed',
        color,
        width: 20,
        height: 20,
      },
    }
  })

  return { nodes: layoutedNodes, edges: layoutedEdges }
}

export interface ArgumentMapGraphProps {
  graphData: GraphData
  selectedNodeId?: string | null
  hoveredNodeId?: string | null
  onNodeSelect?: (nodeId: string | null) => void
  onNodeHover?: (nodeId: string | null) => void
}

export function ArgumentMapGraph({
  graphData,
  selectedNodeId: _selectedNodeId,
  hoveredNodeId: _hoveredNodeId,
  onNodeSelect,
  onNodeHover,
}: ArgumentMapGraphProps) {
  // 레이아웃 계산
  const { nodes, edges } = useMemo(
    () => getArgumentMapLayout(graphData),
    [graphData]
  )

  // 노드 클릭
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      onNodeSelect?.(node.id)
    },
    [onNodeSelect]
  )

  // 노드 호버
  const handleNodeMouseEnter = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      onNodeHover?.(node.id)
    },
    [onNodeHover]
  )

  const handleNodeMouseLeave = useCallback(() => {
    onNodeHover?.(null)
  }, [onNodeHover])

  // 배경 클릭 시 선택 해제
  const handlePaneClick = useCallback(() => {
    onNodeSelect?.(null)
  }, [onNodeSelect])

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodeClick={handleNodeClick}
      onNodeMouseEnter={handleNodeMouseEnter}
      onNodeMouseLeave={handleNodeMouseLeave}
      onPaneClick={handlePaneClick}
      fitView
      minZoom={0.1}
      maxZoom={2}
      defaultEdgeOptions={{
        type: 'custom',
      }}
    >
      <Background />
      <Controls />
    </ReactFlow>
  )
}
