/**
 * Citation Graph 노드/엣지 스타일 상수
 *
 * 타입별 아이콘 매핑, 색상(Tailwind + hex)
 */

import {
  FileText,
  Stethoscope,
  Scissors,
  Pill,
  BarChart3,
  Building2,
  Search,
  HelpCircle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/** 노드 타입별 Lucide 아이콘 */
export const NODE_TYPE_ICONS: Record<string, LucideIcon> = {
  fact: FileText,
  condition: Stethoscope,
  procedure: Scissors,
  drug: Pill,
  measurement: BarChart3,
  visit: Building2,
  analysis: Search,
}

/** 기본 아이콘 (매핑에 없는 타입) */
export const DEFAULT_NODE_ICON: LucideIcon = HelpCircle

/** 노드 타입별 색상 (Tailwind 클래스) */
export const NODE_TYPE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  fact: { bg: 'bg-blue-500/10', border: 'border-blue-500/40', text: 'text-blue-600 dark:text-blue-400' },
  condition: { bg: 'bg-red-500/10', border: 'border-red-500/40', text: 'text-red-600 dark:text-red-400' },
  procedure: { bg: 'bg-green-500/10', border: 'border-green-500/40', text: 'text-green-600 dark:text-green-400' },
  drug: { bg: 'bg-purple-500/10', border: 'border-purple-500/40', text: 'text-purple-600 dark:text-purple-400' },
  measurement: { bg: 'bg-amber-500/10', border: 'border-amber-500/40', text: 'text-amber-600 dark:text-amber-400' },
  visit: { bg: 'bg-teal-500/10', border: 'border-teal-500/40', text: 'text-teal-600 dark:text-teal-400' },
  analysis: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/40', text: 'text-indigo-600 dark:text-indigo-400' },
}

/** 기본 색상 */
export const DEFAULT_NODE_COLOR = {
  bg: 'bg-muted/50',
  border: 'border-border',
  text: 'text-muted-foreground',
}

/** 노드 타입별 hex 색상 (엣지 스타일 + 인라인 CSS용) */
export const NODE_TYPE_HEX: Record<string, string> = {
  fact: '#3b82f6',
  condition: '#ef4444',
  procedure: '#22c55e',
  drug: '#a855f7',
  measurement: '#f59e0b',
  visit: '#14b8a6',
  analysis: '#6366f1',
}

export const DEFAULT_NODE_HEX = '#94a3b8'

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
