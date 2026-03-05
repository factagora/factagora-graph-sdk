/**
 * ArgumentMapCustomEdge — 한 점에서 여러 엣지가 나갈 때 겹치지 않게 하는 커스텀 엣지
 *
 * 같은 source에서 나가는 여러 엣지들이 부채꼴 모양으로 퍼지도록 함
 */

'use client'

import { BaseEdge, getBezierPath, type EdgeProps } from '@xyflow/react'

export function ArgumentMapCustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {
  // data에서 index와 total을 받아옴
  const index = data?.index || 0
  const total = data?.total || 1

  // 여러 엣지가 한 점에서 나갈 때 수직으로 분산
  const offsetRange = total > 1 ? Math.min(total * 30, 150) : 0
  const offset = total > 1
    ? (index - (total - 1) / 2) * (offsetRange / Math.max(total - 1, 1))
    : 0

  // bezier path 계산 (부드러운 곡선, offset 적용)
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY: sourceY + offset,
    sourcePosition,
    targetX,
    targetY: targetY + offset,
    targetPosition,
  })

  return <BaseEdge id={id} path={edgePath} style={style} markerEnd={markerEnd} />
}
