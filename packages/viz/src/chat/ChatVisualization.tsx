/**
 * ChatVisualization - 그래프와 타임라인을 통합 관리하는 컴포넌트
 *
 * graphData와 timelineData를 받아서 자동으로 적절한 UI를 렌더링합니다:
 * - 둘 다 없으면: null
 * - 하나만 있으면: 해당 패널만 렌더링
 * - 둘 다 있으면: 탭/스택/나란히 보기
 *
 * @example
 * ```tsx
 * import { ChatVisualization } from '@factagora/chatbot-viz'
 *
 * <ChatVisualization
 *   graphData={graphData}
 *   timelineData={timelineData}
 *   mode="tabs"
 *   defaultView="timeline"
 *   labels={{
 *     graphTab: "Knowledge Graph",
 *     timelineTab: "Timeline"
 *   }}
 * />
 * ```
 */

'use client'

import { useState } from 'react'
import type { GraphData, TimelineData, TimelineItem, GraphNode } from '@factagora/types'
import { GraphPanel } from '../graph/GraphPanel'
import { TimelinePanel } from '../timeline/TimelinePanel'

// 간단한 className 유틸
function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}

export type VisualizationMode = 'auto' | 'tabs' | 'stacked' | 'side-by-side'
export type DefaultView = 'graph' | 'timeline'

export interface ChatVisualizationLabels {
  graphTab?: string
  timelineTab?: string
}

export interface ChatVisualizationProps {
  graphData?: GraphData | null
  timelineData?: TimelineData | null
  mode?: VisualizationMode
  defaultView?: DefaultView
  labels?: ChatVisualizationLabels
  theme?: 'light' | 'dark'
  className?: string
  onGraphNodeClick?: (node: GraphNode, graphData: GraphData) => void
  onTimelineItemClick?: (item: TimelineItem, timelineData: TimelineData) => void
}

export function ChatVisualization({
  graphData,
  timelineData,
  mode = 'auto',
  defaultView = 'graph',
  labels = {},
  theme = 'light',
  className,
  onGraphNodeClick,
  onTimelineItemClick,
}: ChatVisualizationProps) {
  const {
    graphTab = 'Graph',
    timelineTab = 'Timeline',
  } = labels

  const hasGraph = !!(graphData && graphData.nodes.length > 0)
  const hasTimeline = !!(timelineData && timelineData.items.length > 0)
  const hasBoth = hasGraph && hasTimeline

  const [activeView, setActiveView] = useState<DefaultView>(defaultView)

  // 둘 다 없으면 아무것도 렌더링하지 않음
  if (!hasGraph && !hasTimeline) {
    return null
  }

  // 하나만 있으면 해당 패널만 렌더링
  if (!hasBoth) {
    if (hasTimeline) {
      return (
        <div className={className}>
          <TimelinePanel
            timelineData={timelineData!}
            onItemSelect={onTimelineItemClick}
          />
        </div>
      )
    }
    if (hasGraph) {
      return (
        <div className={className}>
          <GraphPanel
            graphData={graphData!}
            theme={theme}
            onNodeClick={onGraphNodeClick}
          />
        </div>
      )
    }
    return null
  }

  // 둘 다 있는 경우 - mode에 따라 렌더링
  const resolvedMode = mode === 'auto' ? 'tabs' : mode

  // Stacked 모드: 위아래로 쌓기
  if (resolvedMode === 'stacked') {
    return (
      <div className={cn('space-y-4', className)}>
        <GraphPanel
          graphData={graphData!}
          theme={theme}
          onNodeClick={onGraphNodeClick}
        />
        <TimelinePanel
          timelineData={timelineData!}
          onItemSelect={onTimelineItemClick}
        />
      </div>
    )
  }

  // Side-by-side 모드: 좌우로 나란히
  if (resolvedMode === 'side-by-side') {
    return (
      <div className={cn('grid grid-cols-2 gap-4', className)}>
        <GraphPanel
          graphData={graphData!}
          theme={theme}
          onNodeClick={onGraphNodeClick}
        />
        <TimelinePanel
          timelineData={timelineData!}
          onItemSelect={onTimelineItemClick}
        />
      </div>
    )
  }

  // Tabs 모드: 탭으로 전환 (기본)
  return (
    <div
      className={cn(
        'rounded-xl border bg-white dark:bg-gray-900',
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200',
        className
      )}
    >
      {/* 탭 헤더 */}
      <div
        className={cn(
          'flex items-center justify-end px-3 py-1.5 border-b',
          theme === 'dark'
            ? 'bg-gray-800/50 border-gray-700'
            : 'bg-gray-50 border-gray-200'
        )}
      >
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setActiveView('graph')}
            className={cn(
              'px-3 py-1 text-xs font-medium rounded transition-colors',
              activeView === 'graph'
                ? theme === 'dark'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-500 text-white'
                : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            )}
          >
            {graphTab}
          </button>
          <button
            type="button"
            onClick={() => setActiveView('timeline')}
            className={cn(
              'px-3 py-1 text-xs font-medium rounded transition-colors',
              activeView === 'timeline'
                ? theme === 'dark'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-500 text-white'
                : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            )}
          >
            {timelineTab}
          </button>
        </div>
      </div>

      {/* 패널 렌더링 */}
      <div>
        {activeView === 'graph' ? (
          <GraphPanel
            graphData={graphData!}
            theme={theme}
            hideHeader
            onNodeClick={onGraphNodeClick}
          />
        ) : (
          <TimelinePanel
            timelineData={timelineData!}
            hideHeader
            onItemSelect={onTimelineItemClick}
          />
        )}
      </div>
    </div>
  )
}
