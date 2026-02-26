/**
 * 그래프 시각화 타입 정의
 *
 * DG (Document Graph) 및 TKG (Temporal Knowledge Graph) 시각화에 사용되는 공통 타입
 */

// ─── 그래프 데이터 구조 ────────────────────────────────────────

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
  metadata: GraphMetadata | null
}

export interface GraphNode {
  /** 노드 고유 ID */
  id: string

  /** 노드 레이블 (표시명) */
  label: string

  /** 노드 타입 (fact, condition, procedure, drug, measurement, visit, analysis, ...) */
  type: string

  /** 신뢰도 (0.0 ~ 1.0) */
  confidence: number | null

  /** 직접 검색 매칭 여부 (retrieval 결과) */
  isDirectMatch: boolean

  /** 노드 상세 내용 */
  content: string | null

  /** 출처 URL 목록 */
  sources: string[]

  /** 태그 목록 */
  tags: string[]

  /** 추가 메타데이터 (TKG의 경우 TKGNodeMetadata) */
  metadata: TKGNodeMetadata | Record<string, unknown> | null

  /** 검증 시작 시점 (ISO 8601) */
  validationCreatedAt: string | null

  /** 검증 종료 시점 (ISO 8601) */
  validationEndedAt: string | null
}

export interface GraphEdge {
  /** 소스 노드 ID */
  source: string

  /** 타겟 노드 ID */
  target: string

  /** 관계 타입 (parent_of, child_of, supports, contradicts, relates_to, derives_from, ...) */
  relationship: string

  /** 엣지 가중치 */
  weight: number | null
}

// ─── DG (Document Graph) 메타데이터 ────────────────────────────

/** DG 그래프 메타데이터 (Document Graph 트리 구조) */
export interface DGGraphMetadata {
  /** 그래프 확장 깊이 (1 = 1-hop) */
  expansionDepth: number

  /** 총 노드 수 */
  totalNodes: number

  /** 직접 매칭된 노드 수 (retrieval 결과) */
  directMatchCount: number

  /** 확장된 노드 수 (graph expansion 결과) */
  expandedCount: number

  /** 허용된 관계 타입 목록 */
  allowedRelationshipTypes: string[]
}

// ─── TKG (Temporal Knowledge Graph) 메타데이터 ─────────────────

/** TKG Multi-hop 그래프 노드 메타데이터 */
export interface TKGNodeMetadata {
  /** Hop 거리 (0 = seed entity, 1 = 1-hop, 2 = 2-hop) */
  hopDistance: number

  /** Discovery 노드 여부 (시스템이 발견한 연결고리) */
  isDiscoveryNode: boolean

  /** 원본 벡터 유사도 (seed entity만 해당, 0.0 ~ 1.0) */
  similarity: number | null

  /** 경로 누적 신뢰도 (Path Confidence, 0.0 ~ 1.0) */
  pathConfidence: number

  /** 유효 기간 시작 (ISO 8601) */
  validPeriodStart?: string | null

  /** 유효 기간 종료 (ISO 8601) */
  validPeriodEnd?: string | null
}

/** TKG Multi-hop 그래프 메타데이터 */
export interface TKGGraphMetadata {
  /** 그래프 타입 식별자 */
  graphType: 'multihop_tkg'

  /** 총 노드 수 */
  totalNodes: number

  /** 총 엣지 수 */
  totalEdges: number

  /** Hop 분포 (예: {"0": 5, "1": 10, "2": 3}) */
  hopDistribution: Record<string, number>

  /** Discovery 노드 수 */
  discoveryCount: number

  /** 실제 사용된 최대 hop 수 */
  maxHopsUsed: number

  /** 설정된 최대 hop 수 */
  maxHopsConfig: number

  /** 설정된 최대 노드 수 */
  maxNodesConfig: number

  /** 평균 경로 신뢰도 */
  avgPathConfidence: number
}

// ─── 유니온 타입 및 타입 가드 ──────────────────────────────────

/** 그래프 메타데이터 (DG 또는 TKG) */
export type GraphMetadata = DGGraphMetadata | TKGGraphMetadata

/** TKG 그래프 메타데이터 타입 가드 */
export function isTKGGraphMetadata(
  metadata: GraphMetadata | null | undefined,
): metadata is TKGGraphMetadata {
  return !!metadata && 'graphType' in metadata && metadata.graphType === 'multihop_tkg'
}
