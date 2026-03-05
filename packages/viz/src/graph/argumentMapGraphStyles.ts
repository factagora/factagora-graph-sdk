/**
 * Argument Map 그래프 노드/엣지 스타일 상수
 *
 * Edge Types: SUPPORTS, CONTRADICTS, QUALIFIES, DEPENDS_ON, DERIVED_FROM, SUPERSEDES
 * Verdicts: TRUE, FALSE, PARTIALLY_TRUE, UNVERIFIED, MISLEADING
 */

import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  User,
  type LucideIcon,
} from 'lucide-react'

// ─── Edge Type 색상 및 라벨 ──────────────────────────────────────

/** Edge Type별 색상 (Tailwind 기반) */
export const EDGE_TYPE_COLORS: Record<string, string> = {
  SUPPORTS: '#22c55e',     // green-500 - 지지/뒷받침
  CONTRADICTS: '#ef4444',  // red-500 - 반박/부정
  QUALIFIES: '#eab308',    // yellow-500 - 조건부 수정
  DEPENDS_ON: '#3b82f6',   // blue-500 - 전제 조건
  DERIVED_FROM: '#a855f7', // purple-500 - 추론 출처
  SUPERSEDES: '#f97316',   // orange-500 - 시간적 대체
}

/** Edge Type별 한글 라벨 */
export const EDGE_TYPE_LABELS: Record<string, string> = {
  SUPPORTS: '지지',
  CONTRADICTS: '반박',
  QUALIFIES: '조건부',
  DEPENDS_ON: '전제',
  DERIVED_FROM: '추론',
  SUPERSEDES: '대체',
}

// ─── Verdict 색상 및 아이콘 ──────────────────────────────────────

/** Verdict별 색상 */
export const VERDICT_COLORS: Record<string, string> = {
  TRUE: '#22c55e',           // green-500
  FALSE: '#ef4444',          // red-500
  PARTIALLY_TRUE: '#eab308', // yellow-500
  UNVERIFIED: '#94a3b8',     // slate-400
  MISLEADING: '#f97316',     // orange-500
  PENDING: '#94a3b8',        // slate-400 (alias for null)
}

/** Verdict별 Lucide 아이콘 */
export const VERDICT_ICONS: Record<string, LucideIcon> = {
  TRUE: ShieldCheck,
  FALSE: ShieldAlert,
  PARTIALLY_TRUE: ShieldQuestion,
  UNVERIFIED: Shield,
  MISLEADING: ShieldAlert,
  PENDING: Shield,
}

/** Verdict별 한글 라벨 */
export const VERDICT_LABELS: Record<string, string> = {
  TRUE: '사실',
  FALSE: '거짓',
  PARTIALLY_TRUE: '부분 사실',
  UNVERIFIED: '미검증',
  MISLEADING: '오도',
  PENDING: '검토중',
}

// ─── 노드 역할별 색상 및 아이콘 ──────────────────────────────────

/** 노드 역할별 색상 (Tailwind 클래스) */
export const NODE_ROLE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  root_claim: {
    bg: 'bg-blue-50',
    border: 'border-blue-400',
    text: 'text-blue-900',
  },
  sub_claim: {
    bg: 'bg-slate-50',
    border: 'border-slate-300',
    text: 'text-slate-900',
  },
}

/** 노드 역할별 Lucide 아이콘 */
export const NODE_ROLE_ICONS: Record<string, LucideIcon> = {
  root_claim: Shield,
  sub_claim: User, // Agent-derived sub-claim
}

// ─── 레이아웃 상수 ──────────────────────────────────────

/** 노드 너비 (픽셀) */
export const NODE_WIDTH = 280

/** 노드 최소 높이 (픽셀) */
export const NODE_HEIGHT = 64

/** 계층 간 간격 (TB 방향, 픽셀) */
export const RANK_SEPARATION = 120

/** 같은 계층 내 노드 간 간격 (픽셀) */
export const NODE_SEPARATION = 80

// ─── 유틸리티 함수 ──────────────────────────────────────

/**
 * Verdict 값에 대한 안전한 색상 반환
 * null/undefined인 경우 PENDING 색상 반환
 */
export function getVerdictColor(verdict: string | null | undefined): string {
  if (!verdict) return VERDICT_COLORS.PENDING
  return VERDICT_COLORS[verdict] || VERDICT_COLORS.PENDING
}

/**
 * Verdict 값에 대한 안전한 아이콘 반환
 */
export function getVerdictIcon(verdict: string | null | undefined): LucideIcon {
  if (!verdict) return VERDICT_ICONS.PENDING
  return VERDICT_ICONS[verdict] || VERDICT_ICONS.PENDING
}

/**
 * Verdict 값에 대한 안전한 라벨 반환
 */
export function getVerdictLabel(verdict: string | null | undefined): string {
  if (!verdict) return VERDICT_LABELS.PENDING
  return VERDICT_LABELS[verdict] || verdict
}

/**
 * Edge Type에 대한 안전한 색상 반환
 */
export function getEdgeTypeColor(edgeType: string): string {
  return EDGE_TYPE_COLORS[edgeType.toUpperCase()] || '#94a3b8' // 기본값: slate-400
}

/**
 * Edge Type에 대한 안전한 라벨 반환
 */
export function getEdgeTypeLabel(edgeType: string): string {
  return EDGE_TYPE_LABELS[edgeType.toUpperCase()] || edgeType
}
