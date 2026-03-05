/**
 * ArgumentMapGraphNode — Argument Map 그래프용 커스텀 노드
 *
 * 노드 구조:
 * - Header: 역할 아이콘 + ROOT 뱃지 (root_claim만)
 * - Verdict Badge: 색상 + 아이콘 + 텍스트
 * - Title: 제목 (bold)
 * - Footer: Confidence % + Agent 이름 + Challenge 횟수
 */

import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { GraphNode } from '@factagora/types'
import {
  getVerdictColor,
  getVerdictIcon,
  getVerdictLabel,
  NODE_ROLE_COLORS,
  NODE_ROLE_ICONS,
} from './argumentMapGraphStyles'

interface ArgumentMapGraphNodeData {
  node: GraphNode
  isHovered?: boolean
  isSelected?: boolean
}

function ArgumentMapGraphNodeComponent({ data }: { data: any }) {
  const { node } = data as ArgumentMapGraphNodeData
  const metadata = node.metadata as any
  const nodeRole = metadata?.nodeRole || 'sub_claim'
  const verdict = metadata?.verdict || null
  const verificationStatus = metadata?.verificationStatus || 'PENDING'
  const confidence = metadata?.verificationConfidence || data.confidence || 0
  const challengeCount = metadata?.challengeCount || 0
  const agentName = metadata?.agentName || null

  // 스타일 및 아이콘
  const roleStyle = NODE_ROLE_COLORS[nodeRole] || NODE_ROLE_COLORS.sub_claim
  const VerdictIcon = getVerdictIcon(verdict)
  const RoleIcon = NODE_ROLE_ICONS[nodeRole] || NODE_ROLE_ICONS.sub_claim
  const verdictColor = getVerdictColor(verdict)
  const verdictLabel = getVerdictLabel(verdict)

  return (
    <div
      className={`relative rounded-lg border-2 ${roleStyle.border} ${roleStyle.bg} shadow-md transition-all hover:shadow-lg`}
      style={{ width: '280px', minHeight: '64px', padding: '12px' }}
    >
      {/* Handles */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />

      {/* Header: Role Icon + ROOT Badge */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <RoleIcon className="w-4 h-4 text-slate-600" />
          {nodeRole === 'root_claim' && (
            <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
              ROOT
            </span>
          )}
        </div>

        {/* Verdict Badge */}
        <div
          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
          style={{
            backgroundColor: verdictColor + '20',
            color: verdictColor,
            border: `1px solid ${verdictColor}`,
          }}
        >
          <VerdictIcon className="w-3 h-3" />
          {verdictLabel}
        </div>
      </div>

      {/* Title */}
      <div className={`text-sm font-medium ${roleStyle.text} leading-snug mb-2`}>
        {node.label}
      </div>

      {/* Footer: Confidence + Agent + Challenge */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          {/* Confidence */}
          <span className="font-medium">
            {Math.round(confidence * 100)}%
          </span>

          {/* Agent */}
          {agentName && (
            <span className="text-blue-600 truncate max-w-[100px]">
              @{agentName}
            </span>
          )}
        </div>

        {/* Challenge Count */}
        {challengeCount > 0 && (
          <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded text-xs font-semibold">
            Challenge: {challengeCount}
          </span>
        )}
      </div>
    </div>
  )
}

export const ArgumentMapGraphNode = memo(ArgumentMapGraphNodeComponent)
