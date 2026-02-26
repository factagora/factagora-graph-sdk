import { create } from 'zustand'
import type { GraphNode, GraphData } from '@factagora/types'
import { useTimelineInteractionStore } from './useTimelineInteractionStore'

interface GraphInteractionState {
  hoveredNodeId: string | null
  selectedNodeId: string | null
  lastClickedFactBlockId: string | null

  /** 우측 드로어에 표시할 노드 데이터 */
  selectedNodeData: GraphNode | null
  /** 우측 드로어에 표시할 그래프 데이터 (connections 조회용) */
  selectedGraphData: GraphData | null

  // Actions
  setHoveredNodeId: (id: string | null) => void
  setSelectedNodeId: (id: string | null) => void
  setLastClickedFactBlockId: (id: string | null) => void
  highlightNode: (id: string | null) => void
  selectAndZoomNode: (id: string | null) => void

  /** 노드 상세 드로어 열기 (노드 + 그래프 데이터 저장) */
  openNodeDetail: (node: GraphNode, graphData: GraphData) => void
  /** 노드 상세 드로어 닫기 */
  closeNodeDetail: () => void

  // Reset
  resetInteraction: () => void
}

export const useGraphInteractionStore = create<GraphInteractionState>((set) => ({
  hoveredNodeId: null,
  selectedNodeId: null,
  lastClickedFactBlockId: null,
  selectedNodeData: null,
  selectedGraphData: null,

  setHoveredNodeId: (id) => set({ hoveredNodeId: id }),
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setLastClickedFactBlockId: (id) => set({ lastClickedFactBlockId: id }),

  highlightNode: (id) => set({ hoveredNodeId: id }),

  selectAndZoomNode: (id) =>
    set({
      selectedNodeId: id,
      lastClickedFactBlockId: id,
    }),

  openNodeDetail: (node, graphData) => {
    useTimelineInteractionStore.getState().closeRelationDetail()
    set({
      selectedNodeId: node.id,
      lastClickedFactBlockId: node.id,
      selectedNodeData: node,
      selectedGraphData: graphData,
    })
  },

  closeNodeDetail: () =>
    set({
      selectedNodeId: null,
      selectedNodeData: null,
      selectedGraphData: null,
    }),

  resetInteraction: () =>
    set({
      hoveredNodeId: null,
      selectedNodeId: null,
      lastClickedFactBlockId: null,
      selectedNodeData: null,
      selectedGraphData: null,
    }),
}))
