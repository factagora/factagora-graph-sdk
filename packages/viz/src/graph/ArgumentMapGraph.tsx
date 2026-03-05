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
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import dagre from '@dagrejs/dagre'
import type { GraphData } from '@factagora/types'
import { ArgumentMapGraphNode } from './ArgumentMapGraphNode'
import {
  getEdgeTypeColor,
  getEdgeTypeLabel,
  NODE_WIDTH,
  NODE_HEIGHT,
  RANK_SEPARATION,
  NODE_SEPARATION,
} from './argumentMapGraphStyles'

const nodeTypes: NodeTypes = {
  argumentMapNode: ArgumentMapGraphNode,
}

/** dagre TB 레이아웃 계산 */
function getArgumentMapLayout(graphData: GraphData): {
  nodes: Node[]
  edges: import('@xyflow/react').Edge[]
} {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({
    rankdir: 'TB', // Top-to-Bottom
    nodesep: NODE_SEPARATION,
    ranksep: RANK_SEPARATION,
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

  const layoutedEdges: import('@xyflow/react').Edge[] = graphData.edges.map((edge, i) => {
    const edgeType = edge.relationship.toUpperCase()
    const color = getEdgeTypeColor(edgeType)
    const label = getEdgeTypeLabel(edgeType)

    return {
      id: `e-${edge.source}-${edge.target}-${i}`,
      source: edge.source,
      target: edge.target,
      label,
      type: 'smoothstep',
      animated: false,
      style: {
        stroke: color,
        strokeWidth: 2,
      },
      labelStyle: {
        fontSize: 11,
        fontWeight: 600,
        fill: color,
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
      onNodeClick={handleNodeClick}
      onNodeMouseEnter={handleNodeMouseEnter}
      onNodeMouseLeave={handleNodeMouseLeave}
      onPaneClick={handlePaneClick}
      fitView
      minZoom={0.1}
      maxZoom={2}
      defaultEdgeOptions={{
        type: 'smoothstep',
      }}
    >
      <Background />
      <Controls />
    </ReactFlow>
  )
}
