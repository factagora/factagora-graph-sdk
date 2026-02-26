/**
 * TKG Multi-hop 그래프 스타일 상수
 *
 * hop distance별 노드 색상/크기, Discovery 글로우 효과 설정
 */

/** hop distance별 노드 색상 (hex) */
export const HOP_COLORS: Record<number, string> = {
  0: '#3B82F6', // blue-500 — seed (직접 검색 결과)
  1: '#8B5CF6', // violet-500 — 1-hop 확장
  2: '#F59E0B', // amber-500 — 2-hop 확장
}

/** hop distance별 노드 크기 (ForceGraph nodeVal — 가까울수록 크게) */
export const HOP_SIZES: Record<number, number> = {
  0: 4,   // seed: 가장 큼
  1: 2.5, // 1-hop: 중간
  2: 1.5, // 2-hop: 작음
}

/** hop distance별 라벨 */
export const HOP_LABELS: Record<number, string> = {
  0: 'Seed',
  1: '1-hop',
  2: '2-hop',
}

/** Discovery 노드 글로우 효과 */
export const DISCOVERY_GLOW_COLOR = '#FFD700'
export const DISCOVERY_GLOW_ALPHA = 0.3
export const DISCOVERY_GLOW_BLUR = 15

/** 기본 노드 색상 (매핑에 없는 hop) */
export const DEFAULT_HOP_COLOR = '#9CA3AF'

/** 다크모드 색상 */
export const DARK_MODE = {
  background: '#1a1a2e',
  labelColor: '#e5e7eb',
  edgeBase: '209, 213, 219',
}

/** 라이트모드 색상 */
export const LIGHT_MODE = {
  background: '#ffffff',
  labelColor: '#374151',
  edgeBase: '156, 163, 175',
}
