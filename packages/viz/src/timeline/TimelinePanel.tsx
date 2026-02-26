/**
 * TimelinePanel — TimelineChart 컨테이너
 *
 * 접기/펼치기 헤더 + 메타데이터 요약 + vis-timeline 렌더링
 *
 * @example
 * ```tsx
 * import { TimelinePanel } from '@factagora/viz/timeline'
 *
 * <TimelinePanel
 *   timelineData={data}
 *   labels={{
 *     title: "Timeline",
 *     stats: "{entities} entities · {relations} relations",
 *     emptyRelations: "No timeline items available",
 *     emptyRelationsDetail: "{count} relations without period"
 *   }}
 *   itemColor="#3b82f6"
 *   onItemSelect={(item) => setSelectedItem(item)}
 * />
 * ```
 */

'use client'

import { useState } from 'react'
import type { TimelineData, TimelineItem } from '@factagora/types'
import { TimelineChart } from './TimelineChart'

// 간단한 className 유틸
function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}

export interface TimelinePanelLabels {
  title?: string
  stats?: string
  emptyRelations?: string
  emptyRelationsDetail?: string
}

export interface TimelinePanelProps {
  timelineData: TimelineData
  labels?: TimelinePanelLabels
  className?: string
  hideHeader?: boolean
  itemColor?: string
  onItemSelect?: (item: TimelineItem, timelineData: TimelineData) => void
}

export function TimelinePanel({
  timelineData,
  labels,
  className,
  hideHeader = false,
  itemColor = '#3b82f6',
  onItemSelect,
}: TimelinePanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const defaultLabels: TimelinePanelLabels = {
    title: labels?.title ?? 'Timeline',
    stats: labels?.stats ?? '{entities} entities · {relations} relations',
    emptyRelations: labels?.emptyRelations ?? 'No timeline items available',
    emptyRelationsDetail:
      labels?.emptyRelationsDetail ?? '{count} relations without period',
  }

  // 아이템이 없고 시간정보 없는 관계만 있는 경우
  const hasNoItems = timelineData.items.length === 0
  const hasSkippedRelations = (timelineData.metadata?.relationsWithoutPeriod ?? 0) > 0

  // stats 템플릿 치환
  const statsText = defaultLabels
    .stats!.replace('{entities}', String(timelineData.metadata?.entityCount ?? 0))
    .replace('{relations}', String(timelineData.metadata?.relationCount ?? 0))

  const emptyDetailText = defaultLabels
    .emptyRelationsDetail!.replace(
      '{count}',
      String(timelineData.metadata?.relationsWithoutPeriod ?? 0)
    )

  return (
    <div
      className={cn(
        'relative',
        !hideHeader && 'rounded-xl border border-border bg-card',
        className
      )}
    >
      {/* 헤더 — hideHeader일 때 건너뜀 */}
      {!hideHeader && (
        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="flex items-center justify-between w-full px-3 py-1.5 border-b border-border bg-muted/30 md:cursor-default"
        >
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            {defaultLabels.title}
          </span>
          <div className="flex items-center gap-2">
            {timelineData.metadata && (
              <span className="text-[10px] text-muted-foreground tabular-nums">
                {statsText}
              </span>
            )}
            <span className="md:hidden text-muted-foreground">
              {isCollapsed ? (
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              )}
            </span>
          </div>
        </button>
      )}

      {/* 본문: 타임라인 영역 (통합 스크롤) */}
      {(hideHeader || !isCollapsed) && (
        <div className="max-h-[600px] overflow-auto">
          {hasNoItems ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <p className="text-sm text-muted-foreground">{defaultLabels.emptyRelations}</p>
              {hasSkippedRelations && (
                <p className="text-xs text-muted-foreground/70 mt-1">{emptyDetailText}</p>
              )}
            </div>
          ) : (
            <TimelineChart
              timelineData={timelineData}
              itemColor={itemColor}
              onItemSelect={onItemSelect}
            />
          )}
        </div>
      )}
    </div>
  )
}
