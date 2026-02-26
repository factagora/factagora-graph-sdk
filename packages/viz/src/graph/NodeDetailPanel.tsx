/**
 * NodeDetailPanel — 선택된 그래프 노드의 상세 정보 패널
 *
 * 추가 API 호출 없이 graph 이벤트의 pre-loaded 데이터를 표시한다.
 *
 * @example
 * ```tsx
 * import { NodeDetailPanel } from '@factagora/viz/graph'
 *
 * <NodeDetailPanel
 *   node={selectedNode}
 *   labels={{
 *     confidence: "Confidence",
 *     content: "Content",
 *     sources: "Sources",
 *     tags: "Tags",
 *     validationPeriod: "Validation Period",
 *     directMatch: "Direct Match",
 *     expanded: "Expanded",
 *     closeDetail: "Close",
 *     nodeType: {
 *       claim: "Claim",
 *       evidence: "Evidence"
 *     }
 *   }}
 *   onClose={() => setSelectedNode(null)}
 *   formatDate={(date) => new Date(date).toLocaleDateString()}
 * />
 * ```
 */

'use client'

import type { GraphNode } from '@factagora/types'
import { getNodeIcon, getNodeColor } from './graphStyles'

// 간단한 className 유틸
function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}

export interface NodeDetailPanelLabels {
  nodeType?: Record<string, string>
  confidence?: string
  content?: string
  sources?: string
  tags?: string
  validationPeriod?: string
  directMatch?: string
  expanded?: string
  closeDetail?: string
}

export interface NodeDetailPanelProps {
  node: GraphNode
  labels?: NodeDetailPanelLabels
  onClose: () => void
  formatDate?: (date: string) => string
}

export function NodeDetailPanel({
  node,
  labels,
  onClose,
  formatDate = (date) => date.split('T')[0], // 기본: YYYY-MM-DD
}: NodeDetailPanelProps) {
  const Icon = getNodeIcon(node.type)
  const color = getNodeColor(node.type)

  const defaultLabels: NodeDetailPanelLabels = {
    nodeType: labels?.nodeType ?? {},
    confidence: labels?.confidence ?? 'Confidence',
    content: labels?.content ?? 'Content',
    sources: labels?.sources ?? 'Sources',
    tags: labels?.tags ?? 'Tags',
    validationPeriod: labels?.validationPeriod ?? 'Validation Period',
    directMatch: labels?.directMatch ?? 'Direct Match',
    expanded: labels?.expanded ?? 'Expanded',
    closeDetail: labels?.closeDetail ?? 'Close',
  }

  return (
    <div className="h-full flex flex-col bg-card overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-start gap-2 p-3 border-b border-border">
        <Icon className={cn('w-4 h-4 mt-0.5 flex-shrink-0', color.text)} />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">
            {node.label}
          </h4>
          <span className={cn('text-[10px] mt-0.5 inline-block', color.text)}>
            {defaultLabels.nodeType![node.type] || node.type}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-muted transition-colors flex-shrink-0"
          aria-label={defaultLabels.closeDetail}
        >
          <svg
            className="w-3.5 h-3.5 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
        {/* 신뢰도 */}
        {node.confidence !== null && node.confidence !== undefined && (
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
              {defaultLabels.confidence}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${Math.round(node.confidence * 100)}%` }}
                />
              </div>
              <span className="text-xs font-medium text-foreground tabular-nums">
                {Math.round(node.confidence * 100)}%
              </span>
            </div>
          </div>
        )}

        {/* 내용 */}
        {node.content && (
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
              {defaultLabels.content}
            </p>
            <p className="text-xs text-foreground leading-relaxed">{node.content}</p>
          </div>
        )}

        {/* 출처 */}
        {node.sources && node.sources.length > 0 && (
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
              {defaultLabels.sources}
            </p>
            <ul className="space-y-0.5">
              {node.sources.map((source, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="text-muted-foreground/60 mt-0.5">-</span>
                  <span>{source}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 태그 */}
        {node.tags && node.tags.length > 0 && (
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
              {defaultLabels.tags}
            </p>
            <div className="flex flex-wrap gap-1">
              {node.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex px-1.5 py-0.5 text-[10px] rounded bg-muted text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 검증 기간 */}
        {(node.validationCreatedAt || node.validationEndedAt) && (
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
              {defaultLabels.validationPeriod}
            </p>
            <p className="text-xs text-muted-foreground">
              {node.validationCreatedAt ? formatDate(node.validationCreatedAt) : '?'}
              {' ~ '}
              {node.validationEndedAt ? formatDate(node.validationEndedAt) : '?'}
            </p>
          </div>
        )}

        {/* 매칭 유형 */}
        <div>
          <span
            className={cn(
              'inline-flex px-1.5 py-0.5 text-[10px] rounded-full font-medium',
              node.isDirectMatch
                ? 'bg-primary/10 text-primary'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {node.isDirectMatch ? defaultLabels.directMatch : defaultLabels.expanded}
          </span>
        </div>
      </div>
    </div>
  )
}
