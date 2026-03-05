/**
 * EvidenceTreeGraph — @xyflow/react 기반 Evidence 그래프 렌더링
 *
 * claim/prediction을 중심으로 agent, evidence 노드를
 * dagre LR 레이아웃으로 표시한다.
 *
 * @example
 * ```tsx
 * import { EvidenceTreeGraph } from '@factagora/viz/graph'
 *
 * <EvidenceTreeGraph
 *   graphData={data}
 *   selectedNodeId={selectedId}
 *   hoveredNodeId={hoveredId}
 *   onNodeSelect={(id) => setSelectedId(id)}
 *   onNodeHover={(id) => setHoveredId(id)}
 * />
 * ```
 */

'use client'

import { useMemo, useEffect, useCallback } from 'react'
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from '@xyflow/react'
import type { Node, NodeTypes } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import dagre from '@dagrejs/dagre'
import type { GraphData, GraphNode, GraphEdge } from '@factagora/types'
import { EvidenceGraphNode } from './EvidenceGraphNode'
import { getNodeHex } from './graphStyles'

const nodeTypes: NodeTypes = {
  evidenceNode: EvidenceGraphNode,
}

const NODE_WIDTH = 240
const NODE_HEIGHT = 56

/** dagre LR 레이아웃 계산 */
function getEvidenceLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
): { nodes: Node[]; edges: import('@xyflow/react').Edge[] } {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: 'LR', nodesep: 20, ranksep: 100, marginx: 20, marginy: 20 })

  nodes.forEach((node) => {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  })

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target)
  })

  dagre.layout(g)

  const layoutedNodes: Node[] = nodes.map((node) => {
    const pos = g.node(node.id)
    return {
      id: node.id,
      type: 'evidenceNode',
      position: {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - NODE_HEIGHT / 2,
      },
      data: node as unknown as Record<string, unknown>,
    }
  })

  const layoutedEdges: import('@xyflow/react').Edge[] = edges.map((edge, i) => {
    // graphStyles.ts 사용 (통일된 색상)
    const sourceNode = nodes.find((n) => n.id === edge.source)
    const hex = getNodeHex(sourceNode?.type ?? 'evidence')

    return {
      id: `e-${edge.source}-${edge.target}-${i}`,
      source: edge.source,
      target: edge.target,
      type: 'bezier',
      animated: false,
      style: { stroke: hex, strokeWidth: 1.5, opacity: 0.5 },
    }
  })

  return { nodes: layoutedNodes, edges: layoutedEdges }
}

export interface EvidenceTreeGraphProps {
  graphData: GraphData
  selectedNodeId?: string | null
  hoveredNodeId?: string | null
  onNodeSelect?: (nodeId: string) => void
  onNodeHover?: (nodeId: string | null) => void
}

export function EvidenceTreeGraph({
  graphData,
  selectedNodeId,
  hoveredNodeId,
  onNodeSelect,
  onNodeHover,
}: EvidenceTreeGraphProps) {
  const reactFlowInstance = useReactFlow()

  const layouted = useMemo(
    () => getEvidenceLayout(graphData.nodes, graphData.edges),
    [graphData.nodes, graphData.edges],
  )

  const nodesWithState = useMemo(
    () =>
      layouted.nodes.map((node) => ({
        ...node,
        data: {
          node: node.data as unknown as GraphNode,
          isHovered: node.id === hoveredNodeId,
          isSelected: node.id === selectedNodeId,
        },
      })),
    [layouted.nodes, hoveredNodeId, selectedNodeId],
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(nodesWithState)
  const [edges, setEdges, onEdgesChange] = useEdgesState(layouted.edges)

  useEffect(() => {
    setNodes(nodesWithState)
    setEdges(layouted.edges)
  }, [nodesWithState, layouted.edges, setNodes, setEdges])

  useEffect(() => {
    if (!selectedNodeId || !reactFlowInstance) return
    const node = reactFlowInstance.getNode(selectedNodeId)
    if (node) {
      reactFlowInstance.fitView({
        nodes: [{ id: selectedNodeId }],
        duration: 500,
        padding: 0.5,
      })
    }
  }, [selectedNodeId, reactFlowInstance])

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      onNodeSelect?.(node.id)
    },
    [onNodeSelect],
  )

  const handleNodeMouseEnter = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      onNodeHover?.(node.id)
    },
    [onNodeHover],
  )

  const handleNodeMouseLeave = useCallback(() => {
    onNodeHover?.(null)
  }, [onNodeHover])

  const onInit = useCallback(() => {
    reactFlowInstance.fitView({ padding: 0.3, duration: 300 })
  }, [reactFlowInstance])

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      onNodeClick={handleNodeClick}
      onNodeMouseEnter={handleNodeMouseEnter}
      onNodeMouseLeave={handleNodeMouseLeave}
      onInit={onInit}
      fitView
      fitViewOptions={{ padding: 0.3 }}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      panOnDrag
      zoomOnScroll
      zoomOnPinch
      minZoom={0.3}
      maxZoom={2}
      proOptions={{ hideAttribution: true }}
    />
  )
}
