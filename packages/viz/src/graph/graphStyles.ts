/**
 * Citation Graph 노드/엣지 스타일 상수
 *
 * 타입별 아이콘 매핑, 색상(Tailwind + hex)
 */

import {
  FileText,
  AlertCircle,
  Lightbulb,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/** 노드 타입별 Lucide 아이콘 */
export const NODE_TYPE_ICONS: Record<string, LucideIcon> = {
  claim: AlertCircle,     // 주장 (경고 아이콘)
  prediction: Lightbulb,  // 예측 (전구 아이콘)
}

/** 기본 아이콘 (파일/문서) */
export const DEFAULT_NODE_ICON: LucideIcon = FileText

/** 노드 타입별 색상 (Tailwind 클래스) */
export const NODE_TYPE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  claim: { bg: 'bg-amber-500/10', border: 'border-amber-500/40', text: 'text-amber-600 dark:text-amber-400' },
  prediction: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/40', text: 'text-yellow-600 dark:text-yellow-400' },
}

/** 기본 색상 (파란색) */
export const DEFAULT_NODE_COLOR = {
  bg: 'bg-blue-500/10',
  border: 'border-blue-500/40',
  text: 'text-blue-600 dark:text-blue-400',
}

/** 노드 타입별 hex 색상 (엣지 스타일 + 인라인 CSS용) */
export const NODE_TYPE_HEX: Record<string, string> = {
  claim: '#f59e0b',       // 주황색
  prediction: '#eab308',  // 노란색
}

export const DEFAULT_NODE_HEX = '#3b82f6'  // 기본 파란색 (fact 색상)

/** 아이콘 조회 헬퍼 */
export function getNodeIcon(type: string): LucideIcon {
  return NODE_TYPE_ICONS[type] || DEFAULT_NODE_ICON
}

/** 색상 조회 헬퍼 */
export function getNodeColor(type: string) {
  return NODE_TYPE_COLORS[type] || DEFAULT_NODE_COLOR
}

/** hex 색상 조회 헬퍼 */
export function getNodeHex(type: string): string {
  return NODE_TYPE_HEX[type] || DEFAULT_NODE_HEX
}

/** inline style용 hex 색상 객체 반환 */
export function getNodeColorHex(type: string): { bg: string; border: string; text: string } {
  const hex = NODE_TYPE_HEX[type] || DEFAULT_NODE_HEX

  // hex to rgba for background (10% opacity)
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)

  return {
    bg: `rgba(${r}, ${g}, ${b}, 0.1)`,
    border: `rgba(${r}, ${g}, ${b}, 0.4)`,
    text: hex,
  }
}
