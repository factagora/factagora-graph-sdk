/**
 * 공통 Enum 타입 정의
 *
 * 백엔드 API, 프론트엔드, Chrome Extension에서 공통으로 사용하는 Enum 타입
 */

// ─── 검색 모드 ─────────────────────────────────────────────────

/**
 * 검색 모드
 *
 * - `dg`: Document Graph - 트리 기반 factblock 관계
 * - `tkg`: Temporal Knowledge Graph - Multi-hop 시간적 엔티티 관계
 */
export type SearchMode = 'dg' | 'tkg'

// ─── 질문 유형 ─────────────────────────────────────────────────

/**
 * 질문 유형 (LLM 분석 결과)
 *
 * - `factual`: 사실 기반 질문 (예: "삼성전자의 2024년 반도체 투자는?")
 * - `analytical`: 분석 질문 (예: "AI 반도체 시장의 전망은?")
 * - `temporal`: 시간적 질문 (예: "최근 HBM 시장 변화는?")
 */
export type QueryType = 'factual' | 'analytical' | 'temporal'

// ─── FactBlock 타입 ────────────────────────────────────────────

/**
 * FactBlock 유형 (의료/일반 도메인)
 *
 * **일반 도메인**:
 * - `fact`: 객관적 사실
 * - `prediction`: 예측/전망
 * - `analysis`: 분석/해석
 * - `opinion`: 의견/주장
 *
 * **의료 도메인 (FHIR 기반)**:
 * - `condition`: 질병/증상
 * - `procedure`: 시술/수술
 * - `drug`: 약물/치료제
 * - `measurement`: 수치/측정
 * - `visit`: 방문/내원
 *
 * **기타**:
 * - `unknown`: 미분류
 */
export type FactBlockType =
  | 'fact'
  | 'prediction'
  | 'analysis'
  | 'opinion'
  | 'condition'
  | 'procedure'
  | 'drug'
  | 'measurement'
  | 'visit'
  | 'unknown'

// ─── 스트리밍 상태 ──────────────────────────────────────────────

/**
 * 스트리밍 상태 (챗봇 UI)
 *
 * - `idle`: 대기 중
 * - `analyzing`: 질문 분석 중
 * - `searching`: 검색 중
 * - `expanding`: 그래프 확장 중
 * - `generating`: 응답 생성 중
 */
export type StreamingStatus = 'idle' | 'analyzing' | 'searching' | 'expanding' | 'generating'
