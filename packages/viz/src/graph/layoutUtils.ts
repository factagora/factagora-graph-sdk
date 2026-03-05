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

/** dagre로 TB 트리 레이아웃 계산 후 @xyflow/react 노드/엣지 반환 */
export function getLayoutedElements(
  nodes: GraphNode[],
  edges: GraphEdge[]
): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({
    rankdir: 'LR',              // Left-to-Right (왼쪽→오른쪽)
    ranker: 'network-simplex',  // 그래프 최적화 (엣지 교차 최소화)
    nodesep: 120,               // 같은 레벨 노드 간격
    ranksep: 130,               // 레벨 간 간격 (edge 길이)
    edgesep: 50,                // 엣지 간격
    marginx: 60,                // 좌우 마진
    marginy: 60,                // 상하 마진
  })

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
      type: 'smoothstep',  // 부드러운 곡선 엣지
      animated: false,
      label: edge.relationship,
      labelStyle: {
        fontSize: '10px',
        fontWeight: 500,
        fill: '#374151',
        fontFamily: '"Courier New", Courier, monospace',
      },
      labelBgStyle: {
        fill: '#ffffff',
        fillOpacity: 0.98,  // 더 불투명하게
      },
      labelBgPadding: [10, 6],  // 패딩 증가
      labelBgBorderRadius: 4,
      style: { stroke: hex, strokeWidth: 1.5, opacity: 0.7 },  // 더 두껍고 진하게
    }
  })

  return { nodes: layoutedNodes, edges: layoutedEdges }
}
