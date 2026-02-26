/**
 * 채팅 도메인 타입 정의
 *
 * RAG 챗봇의 세션, 메시지, API 요청/응답 타입
 */

import type { GraphData } from './graph'
import type { TimelineData } from './timeline'

// ─── 도메인 모델 ───────────────────────────────────────────────

/** 채팅 세션 */
export interface ChatSession {
  /** 세션 고유 ID */
  id: string

  /** 컬렉션 ID (null = Global Chat, 홈 화면) */
  collectionId: string | null

  /** 컬렉션 제목 (백엔드에서 포함 시 표시) */
  collectionTitle?: string | null

  /** 사용자 ID */
  userId: string

  /** 세션 제목 */
  title: string | null

  /** 생성 시각 (ISO 8601) */
  createdAt: string

  /** 수정 시각 (ISO 8601) */
  updatedAt: string

  /** 삭제 여부 (soft delete) */
  isDeleted: boolean
}

/** 채팅 메시지 */
export interface ChatMessage {
  /** 메시지 고유 ID */
  id: string

  /** 소속 세션 ID */
  sessionId: string

  /** 메시지 역할 */
  role: 'user' | 'assistant'

  /** 메시지 내용 */
  content: string

  /** 요청 ID (추적용, 선택적) */
  requestId?: string

  /** Retrieval 그래프 데이터 (assistant 메시지만) */
  retrievalGraph?: GraphData

  /** Retrieval 타임라인 데이터 (assistant 메시지만, TKG 모드) */
  retrievalTimeline?: TimelineData

  /** 사용된 LLM 모델 (선택적) */
  modelUsed?: string

  /** 질문 유형 (선택적) */
  queryType?: 'factual' | 'analytical' | 'temporal'

  /** 후속 질문 제안 (선택적) */
  followUpQuestions?: string[]

  /** 사용자 피드백 (선택적) */
  userFeedback?: 'positive' | 'negative' | null

  /** 피드백 코멘트 (선택적) */
  feedbackComment?: string

  /** 컬렉션 기반 검색 여부 (retrieval SSE 이벤트 수신 여부) */
  isCollectionBased?: boolean

  /** 생성 시각 (ISO 8601) */
  createdAt: string
}

// ─── API 요청 ──────────────────────────────────────────────────

/** 채팅 메시지 전송 요청 (SSE stream) */
export interface ChatRequest {
  /** 사용자 ID */
  userId: string

  /** 세션 ID (선택적, null = 새 세션 생성) */
  sessionId?: string | null

  /** 컬렉션 ID (선택적, null = Global Chat) */
  collectionId?: string | null

  /** 사용자 메시지 */
  message: string

  /** 사용할 LLM 모델 (선택적, 기본값: gpt-4.1-mini) */
  model?: string

  /** 검색 모드 (선택적, 기본값: dg) */
  searchMode?: 'dg' | 'tkg'
}
