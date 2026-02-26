/**
 * dagre 기반 LR 트리 레이아웃 유틸리티
 *
 * 마인드맵 스타일: 컴팩트 노드 + bezier 엣지 + 타입별 색상
 */

import dagre from '@dagrejs/dagre'
import type { Node, Edge } from '@xyflow/react'
import type { GraphNode, GraphEdge } from '@factagora/types'
import { getNodeHex } from './graphStyles'

const NODE_WIDTH = 220
const NODE_HEIGHT = 40

/** dagre로 LR 트리 레이아웃 계산 후 @xyflow/react 노드/엣지 반환 */
export function getLayoutedElements(
  nodes: GraphNode[],
  edges: GraphEdge[]
): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: 'LR', nodesep: 24, ranksep: 90, marginx: 20, marginy: 20 })

  nodes.forEach((node) => {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  })

  // 노드 ID → 타입 매핑 (엣지 색상용)
  const nodeTypeMap = new Map(nodes.map((n) => [n.id, n.type]))

  edges.forEach((edge) => {
    if (edge.relationship === 'child_of') {
      g.setEdge(edge.target, edge.source)
    } else {
      g.setEdge(edge.source, edge.target)
    }
  })

  dagre.layout(g)

  const layoutedNodes: Node[] = nodes.map((node) => {
    const pos = g.node(node.id)
    return {
      id: node.id,
      type: 'citationNode',
      position: {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - NODE_HEIGHT / 2,
      },
      data: node as unknown as Record<string, unknown>,
    }
  })

  const layoutedEdges: Edge[] = edges.map((edge, i) => {
    const isChildOf = edge.relationship === 'child_of'
    const sourceId = isChildOf ? edge.target : edge.source
    const sourceType = nodeTypeMap.get(sourceId) || 'unknown'
    const hex = getNodeHex(sourceType)

    return {
      id: `e-${edge.source}-${edge.target}-${i}`,
      source: sourceId,
      target: isChildOf ? edge.source : edge.target,
      type: 'bezier',
      animated: false,
      style: { stroke: hex, strokeWidth: 1.5, opacity: 0.5 },
    }
  })

  return { nodes: layoutedNodes, edges: layoutedEdges }
}
