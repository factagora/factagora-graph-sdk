import { create } from 'zustand'
import type { TimelineItem, TimelineData } from '@factagora/types'
import { useGraphInteractionStore } from './useGraphInteractionStore'

interface TimelineInteractionState {
  selectedItemId: string | null
  selectedItemData: TimelineItem | null
  selectedTimelineData: TimelineData | null

  /** 관계 상세 드로어 열기 */
  openRelationDetail: (item: TimelineItem, timelineData: TimelineData) => void
  /** 관계 상세 드로어 닫기 */
  closeRelationDetail: () => void

  resetInteraction: () => void
}

export const useTimelineInteractionStore = create<TimelineInteractionState>((set) => ({
  selectedItemId: null,
  selectedItemData: null,
  selectedTimelineData: null,

  openRelationDetail: (item, timelineData) => {
    useGraphInteractionStore.getState().closeNodeDetail()
    set({
      selectedItemId: item.id,
      selectedItemData: item,
      selectedTimelineData: timelineData,
    })
  },

  closeRelationDetail: () =>
    set({
      selectedItemId: null,
      selectedItemData: null,
      selectedTimelineData: null,
    }),

  resetInteraction: () =>
    set({
      selectedItemId: null,
      selectedItemData: null,
      selectedTimelineData: null,
    }),
}))
