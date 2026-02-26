/**
 * @factagora/types
 *
 * Factagora 그래프 기반 지식 탐색 SDK - 공유 TypeScript 타입
 *
 * - Graph: DG/TKG 그래프 시각화 타입
 * - Timeline: TKG 타임라인 시각화 타입
 * - SSE: Server-Sent Events 실시간 통신 타입
 * - Chat: 채팅 도메인 타입
 * - Enums: 공통 Enum 타입
 * - Agent: Social Network Agent 통합 타입
 */

// ─── Graph 타입 ────────────────────────────────────────────────
export type {
  GraphData,
  GraphNode,
  GraphEdge,
  GraphMetadata,
  DGGraphMetadata,
  TKGGraphMetadata,
  TKGNodeMetadata,
} from './graph'

export { isTKGGraphMetadata } from './graph'

// ─── Timeline 타입 ─────────────────────────────────────────────
export type {
  TimelineData,
  TimelineItem,
  TimelineGroup,
  TimelineMetadata,
  TimelineItemData,
} from './timeline'

// ─── SSE 이벤트 타입 ───────────────────────────────────────────
export type {
  SSEEventType,
  SSESessionEvent,
  SSEStatusEvent,
  SSERetrievalEvent,
  SSEDeltaEvent,
  SSEGraphEvent,
  SSETimelineEvent,
  SSEFollowUpEvent,
  SSEDoneEvent,
  SSEErrorEvent,
  ParsedSSEEvent,
} from './sse'

// ─── Chat 도메인 타입 ──────────────────────────────────────────
export type { ChatSession, ChatMessage, ChatRequest } from './chat'

// ─── Enum 타입 ─────────────────────────────────────────────────
export type { SearchMode, QueryType, FactBlockType, StreamingStatus } from './enums'

// ─── Agent 통합 타입 ───────────────────────────────────────────
export type {
  AgentOutput,
  AgentMetadata,
  AgentAdapter,
  AgentRegistry,
} from './agent'
