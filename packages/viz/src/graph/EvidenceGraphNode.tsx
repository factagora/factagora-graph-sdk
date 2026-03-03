/**
 * EvidenceGraphNode — @xyflow/react 커스텀 노드
 *
 * Evidence 그래프용. claim/prediction/agent/evidence 타입별로
 * 아이콘, 색상, 메타데이터 배지를 표시한다.
 */

'use client'

import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { GraphNode, EvidenceNodeMetadata } from '@factagora/types'
import {
  getEvidenceNodeIcon,
  getEvidenceNodeColor,
  getAgentPositionColor,
} from './evidenceGraphStyles'

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}

interface EvidenceGraphNodeData {
  node: GraphNode
  isHovered?: boolean
  isSelected?: boolean
}

/** 판정/포지션 배지 */
function VerdictBadge({ label, className }: { label: string; className: string }) {
  return (
    <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-bold uppercase', className)}>
      {label}
    </span>
  )
}

/** 신뢰도 퍼센트 표시 */
function ConfidenceBadge({ value }: { value: number }) {
  return (
    <span className="text-[9px] text-muted-foreground tabular-nums">
      {(value * 100).toFixed(0)}%
    </span>
  )
}

function EvidenceGraphNodeInner({ data }: { data: any }) {
  const { node, isHovered, isSelected } = data as EvidenceGraphNodeData
  const meta = node.metadata as EvidenceNodeMetadata | null
  const nodeRole = meta?.nodeRole ?? node.type
  const Icon = getEvidenceNodeIcon(nodeRole)
  const color = getEvidenceNodeColor(nodeRole)

  /** 에이전트 노드: 포지션에 따라 색상 변경 */
  const isAgent = nodeRole === 'agent'
  const agentColor = isAgent ? getAgentPositionColor(meta?.position ?? '') : null
  const nodeColor = agentColor ?? color
  const nodeBorder = agentColor?.border ?? color.border

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-muted-foreground/40 !border-0"
      />

      <div
        className={cn(
          'px-3 py-2 rounded-lg border min-w-[160px] max-w-[240px] cursor-pointer transition-all duration-200',
          nodeColor.bg,
          nodeBorder,
          'border-solid',
          isHovered && 'ring-2 ring-primary/60 scale-[1.03]',
          isSelected && 'ring-2 ring-primary bg-primary/10',
        )}
      >
        {/* 상단: 아이콘 + 레이블 */}
        <div className="flex items-center gap-2">
          <Icon className={cn('w-4 h-4 flex-shrink-0', nodeColor.text)} />
          <span
            className="text-xs font-semibold text-foreground truncate flex-1"
            title={node.label}
          >
            {node.label}
          </span>
        </div>

        {/* 하단: 타입별 메타데이터 */}
        <div className="flex items-center gap-1.5 mt-1">
          {/* Claim: 판정 배지 */}
          {nodeRole === 'claim' && meta?.verdict && (
            <VerdictBadge
              label={meta.verdict}
              className={getAgentPositionColor(meta.verdict).badge}
            />
          )}

          {/* Agent: 포지션 + 신뢰도 */}
          {isAgent && (
            <>
              {meta?.position && (
                <VerdictBadge
                  label={meta.position}
                  className={agentColor?.badge ?? ''}
                />
              )}
              {meta?.agentConfidence != null && (
                <ConfidenceBadge value={meta.agentConfidence} />
              )}
              {meta?.personality && (
                <span className="text-[9px] text-muted-foreground truncate">
                  {meta.personality}
                </span>
              )}
            </>
          )}

          {/* Evidence: 출처 타입 + 신뢰도 */}
          {nodeRole === 'evidence' && (
            <>
              {meta?.sourceType && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-teal-500/20 text-teal-700 dark:text-teal-300 uppercase">
                  {meta.sourceType}
                </span>
              )}
              {meta?.credibility != null && (
                <ConfidenceBadge value={meta.credibility} />
              )}
            </>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-muted-foreground/40 !border-0"
      />
    </>
  )
}

export const EvidenceGraphNode = memo(EvidenceGraphNodeInner)
