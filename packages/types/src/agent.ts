/**
 * Agent 통합 타입 (Social Network용)
 *
 * 다양한 AI Agent (Factagora RAG, ChatGPT, Claude, Perplexity 등)를
 * Social Network에 통합하기 위한 표준 계약(contract) 정의
 */

import type { GraphData } from './graph'
import type { TimelineData } from './timeline'

// ─── Agent 출력 표준 형식 ──────────────────────────────────────

/**
 * Agent 출력 표준 형식
 *
 * 모든 Agent는 이 형식으로 출력을 변환해야 함
 * (Factagora RAG, ChatGPT, Claude, Perplexity 등)
 */
export interface AgentOutput {
  /**
   * 그래프 데이터 (선택적)
   *
   * - Factagora RAG: DG/TKG 그래프
   * - ChatGPT: null (그래프 없음)
   * - Claude: null
   */
  graph: GraphData | null

  /**
   * 타임라인 데이터 (선택적)
   *
   * - Factagora RAG (TKG 모드): 타임라인
   * - 기타 Agent: null
   */
  timeline: TimelineData | null

  /**
   * 텍스트 응답 (필수)
   *
   * Agent가 생성한 텍스트 응답
   */
  content: string

  /**
   * Agent 메타데이터
   */
  agentMeta: AgentMetadata
}

/**
 * Agent 메타데이터
 */
export interface AgentMetadata {
  /**
   * Agent 고유 ID
   *
   * 예: 'factagora_rag', 'chatgpt', 'claude', 'perplexity'
   */
  agentId: string

  /**
   * Agent 타입
   *
   * - `factagora_rag`: Factagora RAG 챗봇
   * - `external`: 외부 AI Agent (ChatGPT, Claude, Perplexity)
   */
  agentType: 'factagora_rag' | 'external'

  /**
   * 사용된 LLM 모델 (선택적)
   *
   * 예: 'gpt-4.1-mini', 'claude-sonnet-4-5', 'gpt-4o'
   */
  model?: string

  /**
   * 검색 모드 (Factagora RAG 전용, 선택적)
   */
  searchMode?: 'dg' | 'tkg'
}

// ─── Agent Adapter 인터페이스 ──────────────────────────────────

/**
 * Agent Adapter 인터페이스
 *
 * 각 Agent의 raw 출력을 표준 AgentOutput으로 변환하는 어댑터
 *
 * **구현 예시**:
 * ```typescript
 * class FactagoraRagAdapter implements AgentAdapter {
 *   agentId = 'factagora_rag'
 *
 *   toStandardOutput(rawOutput: {
 *     content: string
 *     graph?: GraphData
 *     timeline?: TimelineData
 *     model: string
 *     searchMode: 'dg' | 'tkg'
 *   }): AgentOutput {
 *     return {
 *       graph: rawOutput.graph || null,
 *       timeline: rawOutput.timeline || null,
 *       content: rawOutput.content,
 *       agentMeta: {
 *         agentId: this.agentId,
 *         agentType: 'factagora_rag',
 *         model: rawOutput.model,
 *         searchMode: rawOutput.searchMode,
 *       },
 *     }
 *   }
 * }
 *
 * class ChatGPTAdapter implements AgentAdapter {
 *   agentId = 'chatgpt'
 *
 *   toStandardOutput(rawOutput: string): AgentOutput {
 *     return {
 *       graph: null,
 *       timeline: null,
 *       content: rawOutput,
 *       agentMeta: {
 *         agentId: this.agentId,
 *         agentType: 'external',
 *         model: 'gpt-4o',
 *       },
 *     }
 *   }
 * }
 * ```
 */
export interface AgentAdapter {
  /**
   * Agent 고유 ID
   */
  agentId: string

  /**
   * raw 출력을 표준 AgentOutput으로 변환
   *
   * @param rawOutput - Agent의 raw 출력 (형식 다양)
   * @returns 표준 AgentOutput
   */
  toStandardOutput(rawOutput: unknown): AgentOutput
}

// ─── Agent 레지스트리 타입 (선택적) ────────────────────────────

/**
 * Agent 레지스트리 타입
 *
 * Social Network에서 사용 가능한 Agent 목록 관리
 */
export interface AgentRegistry {
  /**
   * Agent ID → Adapter 매핑
   */
  adapters: Map<string, AgentAdapter>

  /**
   * Agent 등록
   */
  register(adapter: AgentAdapter): void

  /**
   * Agent 조회
   */
  get(agentId: string): AgentAdapter | undefined

  /**
   * 사용 가능한 Agent ID 목록
   */
  list(): string[]
}
