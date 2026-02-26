/**
 * RelationDetailDrawer — 우측 사이드 패널
 *
 * 타임라인 아이템(관계) 클릭 시 관계 상세 정보
 * (제목, 기간, 신뢰도, FactBlock 내용)를 표시한다.
 *
 * @example
 * ```tsx
 * import { RelationDetailDrawer } from '@factagora/viz/timeline'
 *
 * <RelationDetailDrawer
 *   item={selectedItem}
 *   itemColor="#3b82f6"
 *   labels={{
 *     period: "Period",
 *     confidence: "Confidence",
 *     sources: "Sources",
 *     ongoing: "Ongoing"
 *   }}
 *   formatDate={(date) => new Date(date).toLocaleDateString()}
 *   fetchFactblockContent={async (id) => {
 *     const res = await fetch(`/api/factblocks/${id}`)
 *     const data = await res.json()
 *     return data.content
 *   }}
 *   onClose={() => setSelectedItem(null)}
 * />
 * ```
 */

'use client'

import { useState, useEffect } from 'react'
import type { TimelineItem } from '@factagora/types'

export interface RelationDetailDrawerLabels {
  period?: string
  confidence?: string
  sources?: string
  ongoing?: string
}

export interface RelationDetailDrawerProps {
  item: TimelineItem | null
  itemColor?: string
  labels?: RelationDetailDrawerLabels
  formatDate?: (date: string) => string
  fetchFactblockContent?: (id: string) => Promise<string>
  onClose: () => void
}

export function RelationDetailDrawer({
  item,
  itemColor = '#3b82f6',
  labels,
  formatDate = (date) => date.split('T')[0],
  fetchFactblockContent,
  onClose,
}: RelationDetailDrawerProps) {
  const [factblockContents, setFactblockContents] = useState<Record<string, string>>({})
  const [factblockLoading, setFactblockLoading] = useState(false)

  const defaultLabels: RelationDetailDrawerLabels = {
    period: labels?.period ?? 'Period',
    confidence: labels?.confidence ?? 'Confidence',
    sources: labels?.sources ?? 'Sources',
    ongoing: labels?.ongoing ?? 'Ongoing',
  }

  const data = item?.data ?? null
  const factblockIds = data?.factblockIds ?? []
  const factblockKey = factblockIds.join(',')

  // factblockIds가 변경될 때 content fetch
  useEffect(() => {
    if (!factblockKey || !fetchFactblockContent) {
      setFactblockContents({})
      return
    }

    const ids = factblockKey.split(',')
    const controller = new AbortController()

    const fetchFactblocks = async () => {
      setFactblockLoading(true)
      const results: Record<string, string> = {}

      await Promise.allSettled(
        ids.map(async (id) => {
          try {
            const content = await fetchFactblockContent(id)
            if (content) {
              results[id] = content
            }
          } catch {
            // AbortError 또는 네트워크 에러 — 무시 (ID fallback)
          }
        })
      )

      if (!controller.signal.aborted) {
        setFactblockContents(results)
        setFactblockLoading(false)
      }
    }

    fetchFactblocks()
    return () => controller.abort()
  }, [factblockKey, fetchFactblockContent])

  if (!item || !data) return null

  return (
    <aside className="w-[380px] flex-shrink-0 border-l border-border bg-background flex flex-col h-full overflow-hidden relative">
      {/* 닫기 버튼 */}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 rounded opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 z-10"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
        <span className="sr-only">Close</span>
      </button>

      {/* 헤더 — 제목 + 주체/객체 */}
      <div className="p-5 pb-4 border-b border-border space-y-3">
        <h2 className="text-lg font-semibold leading-snug text-foreground pr-8">
          {item.title ?? item.content}
        </h2>

        <p className="text-xs text-muted-foreground">
          {data.subjectName} → {data.objectName}
        </p>
      </div>

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5">
        {/* 기간 */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {defaultLabels.period}
          </h4>
          <p className="text-sm text-foreground">
            {formatDate(item.start)}
            {' ~ '}
            {item.end ? formatDate(item.end) : defaultLabels.ongoing}
          </p>
        </div>

        {/* 신뢰도 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {defaultLabels.confidence}
            </h4>
            <span className="text-sm font-bold text-foreground tabular-nums">
              {Math.round(data.confidence * 100)}%
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.round(data.confidence * 100)}%`,
                backgroundColor: itemColor,
              }}
            />
          </div>
        </div>

        {/* FactBlocks — 실제 내용 표시 */}
        {factblockIds.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {defaultLabels.sources}
            </h4>
            <ul className="space-y-2">
              {factblockIds.map((fbId) => (
                <li key={fbId} className="rounded-md border border-border bg-muted/30 px-3 py-2">
                  {factblockLoading ? (
                    <div className="space-y-1.5 animate-pulse">
                      <div className="h-3 w-3/4 bg-muted rounded" />
                      <div className="h-3 w-1/2 bg-muted rounded" />
                    </div>
                  ) : factblockContents[fbId] ? (
                    <p className="text-sm text-foreground leading-relaxed">
                      {factblockContents[fbId]}
                    </p>
                  ) : (
                    <span className="font-mono text-xs text-muted-foreground">{fbId}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </aside>
  )
}
