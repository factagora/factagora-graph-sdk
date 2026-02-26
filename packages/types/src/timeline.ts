/**
 * 타임라인 시각화 타입 정의
 *
 * TKG (Temporal Knowledge Graph) 타임라인 시각화에 사용되는 타입
 * vis-timeline 라이브러리와 호환
 */

// ─── 타임라인 데이터 구조 ────────────────────────────────────────

export interface TimelineData {
  items: TimelineItem[]
  groups: TimelineGroup[]
  metadata: TimelineMetadata | null
}

/** 타임라인 아이템 (relation) */
export interface TimelineItem {
  /** 아이템 고유 ID */
  id: string

  /** 아이템 내용 (표시 텍스트) */
  content: string

  /** 소속 그룹 ID (entity ID) */
  group: string

  /** 시작 시점 (ISO 8601) */
  start: string

  /** 종료 시점 (ISO 8601, null = 현재 진행형) */
  end: string | null

  /** 툴팁 제목 */
  title: string | null

  /** CSS 클래스명 (스타일링용) */
  className: string | null

  /** 추가 데이터 */
  data: TimelineItemData | null
}

/** 타임라인 아이템 추가 데이터 (relation 상세 정보) */
export interface TimelineItemData {
  /** 관계 타입 (예: "진단", "처방", "검사") */
  relType: string

  /** 신뢰도 (0.0 ~ 1.0) */
  confidence: number

  /** Subject entity 이름 */
  subjectName: string

  /** Object entity 이름 */
  objectName: string

  /** Object entity의 canonical ID */
  objectCanonicalId: string

  /** 이 relation을 지지하는 factblock ID 목록 */
  factblockIds: string[]
}

/** 타임라인 그룹 (entity) */
export interface TimelineGroup {
  /** 그룹 고유 ID (entity ID) */
  id: string

  /** 그룹 레이블 (entity 이름) */
  content: string

  /** 툴팁 제목 */
  title: string | null

  /** 추가 데이터 */
  data: TimelineGroupData | null
}

/** 타임라인 그룹 추가 데이터 (entity 상세 정보) */
export interface TimelineGroupData {
  /** 검색 유사도 (0.0 ~ 1.0) */
  similarity: number
}

/** 타임라인 메타데이터 (통계 정보) */
export interface TimelineMetadata {
  /** 총 entity 수 (그룹 수) */
  entityCount: number

  /** 표시된 relation 수 (아이템 수) */
  relationCount: number

  /** 백엔드에서 찾은 전체 relation 수 (필터링 전) */
  totalRelationsFound: number

  /** 기간 정보가 없는 relation 수 */
  relationsWithoutPeriod: number
}
