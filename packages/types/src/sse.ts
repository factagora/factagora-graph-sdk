/**
 * SSE (Server-Sent Events) 이벤트 타입 정의
 *
 * 백엔드 RAG 파이프라인과 프론트엔드 간 실시간 통신에 사용
 * 모든 SSE data 필드는 camelCase
 */

import type { GraphData } from './graph'
import type { TimelineData } from './timeline'

// ─── 이벤트 타입 ───────────────────────────────────────────────

/** SSE 이벤트 타입 (9종) */
export type SSEEventType =
  | 'session'
  | 'status'
  | 'retrieval'
  | 'delta'
  | 'graph'
  | 'timeline'
  | 'follow_up'
  | 'done'
  | 'error'

// ─── 이벤트 데이터 ─────────────────────────────────────────────

/** 세션 이벤트 (스트리밍 시작 시) */
export interface SSESessionEvent {
  /** 세션 ID */
  sessionId: string

  /** 새 세션 여부 */
  isNew: boolean

  /** 컬렉션 제목 (선택적) */
  collectionTitle?: string | null
}

/** 상태 이벤트 (RAG 파이프라인 진행 상태) */
export interface SSEStatusEvent {
  /** 처리 단계 */
  step: 'analyzing' | 'searching' | 'expanding' | 'generating'

  /** 상태 메시지 */
  message: string
}

/** 검색 이벤트 (retrieval 진단 정보) */
export interface SSERetrievalEvent {
  /** 원본 검색 결과 수 (벡터 검색) */
  rawCount: number

  /** 재순위화 후 결과 수 */
  rankedCount: number

  /** 유사도 임계값 */
  threshold: number

  /** 최고 유사도 점수 */
  topSimilarity: number

  /** 진단 메시지 (검색 실패 이유 등) */
  diagnosis: string | null
}

/** 델타 이벤트 (LLM 응답 토큰) */
export interface SSEDeltaEvent {
  /** 응답 토큰 (스트리밍) */
  content: string
}

/**
 * 그래프 이벤트 (DG/TKG 그래프 시각화 데이터)
 *
 * ⚠️ 백엔드는 직접 GraphData 구조를 전송 (graph 필드로 감싸지 않음)
 */
export interface SSEGraphEvent extends GraphData {}

/**
 * 타임라인 이벤트 (TKG 타임라인 시각화 데이터)
 *
 * ⚠️ 백엔드는 직접 TimelineData 구조를 전송 (timeline 필드로 감싸지 않음)
 */
export interface SSETimelineEvent extends TimelineData {}

/** 후속 질문 이벤트 (LLM 생성 추천 질문) */
export interface SSEFollowUpEvent {
  /** 후속 질문 목록 */
  questions: string[]
}

/** 완료 이벤트 (스트리밍 종료 신호) */
export interface SSEDoneEvent {
  /** 메시지 ID (DB 저장) */
  messageId: string

  /** 사용된 모델 */
  model: string

  /** 요청 ID (추적용) */
  requestId: string

  /** 검색 모드 (dg 또는 tkg) */
  searchMode: 'dg' | 'tkg'
}

/** 에러 이벤트 */
export interface SSEErrorEvent {
  /** 에러 메시지 */
  message: string

  /** 에러 코드 */
  code: string

  /** 재시도 가능 여부 (선택적) */
  retriable?: boolean
}

// ─── 유니온 타입 ───────────────────────────────────────────────

/** 파싱된 SSE 이벤트 (type discriminated union) */
export type ParsedSSEEvent =
  | { type: 'session'; data: SSESessionEvent }
  | { type: 'status'; data: SSEStatusEvent }
  | { type: 'retrieval'; data: SSERetrievalEvent }
  | { type: 'delta'; data: SSEDeltaEvent }
  | { type: 'graph'; data: SSEGraphEvent }
  | { type: 'timeline'; data: SSETimelineEvent }
  | { type: 'follow_up'; data: SSEFollowUpEvent }
  | { type: 'done'; data: SSEDoneEvent }
  | { type: 'error'; data: SSEErrorEvent }
