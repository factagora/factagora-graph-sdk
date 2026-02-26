/**
 * TreeGraph — @xyflow/react 기반 트리 그래프 렌더링
 *
 * dagre LR 레이아웃으로 노드를 배치하고,
 * 외부 상태를 통해 선택/hover 연동을 지원한다.
 *
 * @example
 * ```tsx
 * import { TreeGraph } from '@factagora/viz/graph'
 *
 * <TreeGraph
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
import type { GraphData, GraphNode } from '@factagora/types'
import { TreeGraphNode } from './TreeGraphNode'
import { getLayoutedElements } from './layoutUtils'

const nodeTypes: NodeTypes = {
  citationNode: TreeGraphNode,
}

export interface TreeGraphProps {
  graphData: GraphData
  selectedNodeId?: string | null
  hoveredNodeId?: string | null
  onNodeSelect?: (nodeId: string) => void
  onNodeHover?: (nodeId: string | null) => void
}

export function TreeGraph({
  graphData,
  selectedNodeId,
  hoveredNodeId,
  onNodeSelect,
  onNodeHover,
}: TreeGraphProps) {
  const reactFlowInstance = useReactFlow()

  // dagre 레이아웃 계산
  const layouted = useMemo(
    () => getLayoutedElements(graphData.nodes, graphData.edges),
    [graphData.nodes, graphData.edges]
  )

  // hover/selected 상태를 노드 data에 주입
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
    [layouted.nodes, hoveredNodeId, selectedNodeId]
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(nodesWithState)
  const [edges, setEdges, onEdgesChange] = useEdgesState(layouted.edges)

  // graphData 변경 시 노드/엣지 갱신
  useEffect(() => {
    setNodes(nodesWithState)
    setEdges(layouted.edges)
  }, [nodesWithState, layouted.edges, setNodes, setEdges])

  // 선택된 노드로 줌
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

  // ReactFlow onNodeClick
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (onNodeSelect) {
        onNodeSelect(node.id)
      }
    },
    [onNodeSelect]
  )

  // ReactFlow onNodeMouseEnter/Leave
  const handleNodeMouseEnter = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (onNodeHover) {
        onNodeHover(node.id)
      }
    },
    [onNodeHover]
  )

  const handleNodeMouseLeave = useCallback(() => {
    if (onNodeHover) {
      onNodeHover(null)
    }
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
      // 읽기 전용 설정
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
