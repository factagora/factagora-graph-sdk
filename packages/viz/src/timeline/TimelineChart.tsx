/**
 * TimelineChart — vis-timeline 기반 타임라인 렌더링
 *
 * vis-timeline의 Timeline + DataSet을 사용하여
 * 백엔드에서 받은 items/groups를 그대로 시각화한다.
 *
 * @example
 * ```tsx
 * import { TimelineChart } from '@factagora/viz/timeline'
 *
 * <TimelineChart
 *   timelineData={data}
 *   itemColor="#3b82f6"
 *   onItemSelect={(item, timelineData) => {
 *     setSelectedItem(item)
 *   }}
 * />
 * ```
 */

'use client'

import { useRef, useEffect, useMemo, useState } from 'react'
import { Timeline } from 'vis-timeline/standalone'
import { DataSet } from 'vis-data'
import 'vis-timeline/styles/vis-timeline-graph2d.min.css'
import type { TimelineData, TimelineItem } from '@factagora/types'

export interface TimelineChartProps {
  timelineData: TimelineData
  itemColor?: string
  onItemSelect?: (item: TimelineItem, timelineData: TimelineData) => void
}

export function TimelineChart({
  timelineData,
  itemColor = '#3b82f6',
  onItemSelect,
}: TimelineChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<Timeline | null>(null)
  const [ready, setReady] = useState(false)

  // vis-timeline DataSet 구축
  const { itemsDS, groupsDS } = useMemo(() => {
    const processedItems = timelineData.items.map((item) => {
      const isOngoing = !item.end

      return {
        id: item.id,
        content: item.title ?? item.content,
        group: item.group,
        start: item.start,
        end: item.end ?? new Date().toISOString(),
        title: item.content,
        type: 'range' as const,
        className: isOngoing ? 'tl-ongoing' : undefined,
        style: `background-color: ${itemColor}20; border-color: ${itemColor}; color: ${itemColor};`,
      }
    })

    const processedGroups = timelineData.groups.map((g) => ({
      id: g.id,
      content: g.content,
      title: g.title ?? undefined,
    }))

    return {
      itemsDS: new DataSet(processedItems),
      groupsDS: new DataSet(processedGroups),
    }
  }, [timelineData, itemColor])

  useEffect(() => {
    if (!containerRef.current || timelineData.items.length === 0) return

    setReady(false)

    const GROUP_MIN_HEIGHT = 36

    const options = {
      stack: true,
      stackSubgroups: false,
      showCurrentTime: true,
      groupMinHeight: GROUP_MIN_HEIGHT,
      zoomMin: 1000 * 60 * 60 * 24 * 30,
      zoomMax: 1000 * 60 * 60 * 24 * 365 * 10,
      orientation: { axis: 'top' as const, item: 'top' as const },
      margin: { item: { horizontal: 2, vertical: 4 }, axis: 5 },
      tooltip: { followMouse: true, overflowMethod: 'cap' as const },
      selectable: true,
      // 내부 스크롤 비활성화 → 외부 컨테이너(TimelinePanel)에서 통합 스크롤 처리
      verticalScroll: false,
      horizontalScroll: false,
      zoomable: true,
      moveable: true,
    }

    const tl = new Timeline(containerRef.current, itemsDS, groupsDS, options)
    timelineRef.current = tl

    // 아이템 클릭 → 상세 드로어 열기
    tl.on('select', (props: { items: string[] }) => {
      if (props.items.length > 0 && onItemSelect) {
        const itemId = props.items[0]
        const item = timelineData.items.find((i) => i.id === itemId)
        if (item) {
          onItemSelect(item, timelineData)
        }
      }
    })

    // 초기 한 번만 fit (스크롤 리셋 방지)
    setTimeout(() => {
      tl.fit({ animation: false })
    }, 0)

    // changed 이벤트: 스택 레이아웃 계산 완료 후 발생
    const onChanged = () => {
      setReady(true)
      tl.off('changed', onChanged)
    }
    tl.on('changed', onChanged)

    // fallback: changed가 발생하지 않는 경우 대비
    const timerId = setTimeout(() => setReady(true), 150)

    return () => {
      clearTimeout(timerId)
      tl.destroy()
      timelineRef.current = null
    }
  }, [itemsDS, groupsDS, timelineData, onItemSelect])

  return (
    <div
      ref={containerRef}
      className="w-full transition-opacity duration-200"
      style={{ opacity: ready ? 1 : 0 }}
    />
  )
}
