/**
 * Evidence 그래프 노드/엣지 스타일 상수
 *
 * claim, prediction, agent, evidence 타입별 아이콘 + 색상
 */

import {
  FileCheck,
  TrendingUp,
  Bot,
  FileSearch,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/** Evidence 노드 타입별 Lucide 아이콘 */
export const EVIDENCE_NODE_ICONS: Record<string, LucideIcon> = {
  claim: FileCheck,
  prediction: TrendingUp,
  agent: Bot,
  evidence: FileSearch,
}

/** Evidence 노드 타입별 색상 (Tailwind 클래스) */
export const EVIDENCE_NODE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  claim: { bg: 'bg-blue-500/10', border: 'border-blue-500/40', text: 'text-blue-600 dark:text-blue-400' },
  prediction: { bg: 'bg-purple-500/10', border: 'border-purple-500/40', text: 'text-purple-600 dark:text-purple-400' },
  agent: { bg: 'bg-slate-500/10', border: 'border-slate-500/40', text: 'text-slate-600 dark:text-slate-400' },
  evidence: { bg: 'bg-teal-500/10', border: 'border-teal-500/40', text: 'text-teal-600 dark:text-teal-400' },
}

/** 에이전트 포지션별 색상 (Tailwind 클래스) */
export const AGENT_POSITION_COLORS: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  TRUE: { bg: 'bg-green-500/10', border: 'border-green-500/40', text: 'text-green-600 dark:text-green-400', badge: 'bg-green-500/20 text-green-700 dark:text-green-300' },
  FALSE: { bg: 'bg-red-500/10', border: 'border-red-500/40', text: 'text-red-600 dark:text-red-400', badge: 'bg-red-500/20 text-red-700 dark:text-red-300' },
  UNCERTAIN: { bg: 'bg-amber-500/10', border: 'border-amber-500/40', text: 'text-amber-600 dark:text-amber-400', badge: 'bg-amber-500/20 text-amber-700 dark:text-amber-300' },
}

/** 기본 에이전트 포지션 색상 */
export const DEFAULT_AGENT_POSITION_COLOR = {
  bg: 'bg-slate-500/10',
  border: 'border-slate-500/40',
  text: 'text-slate-600 dark:text-slate-400',
  badge: 'bg-slate-500/20 text-slate-700 dark:text-slate-300',
}

/** Evidence 노드 타입별 hex 색상 (엣지 스타일용) */
export const EVIDENCE_NODE_HEX: Record<string, string> = {
  claim: '#3b82f6',
  prediction: '#a855f7',
  agent: '#64748b',
  evidence: '#14b8a6',
}

/** 에이전트 포지션별 hex 색상 */
export const AGENT_POSITION_HEX: Record<string, string> = {
  TRUE: '#22c55e',
  FALSE: '#ef4444',
  UNCERTAIN: '#f59e0b',
}

export const DEFAULT_EVIDENCE_NODE_HEX = '#94a3b8'

/** Evidence 아이콘 조회 헬퍼 */
export function getEvidenceNodeIcon(type: string): LucideIcon {
  return EVIDENCE_NODE_ICONS[type] || EVIDENCE_NODE_ICONS.evidence
}

/** Evidence 색상 조회 헬퍼 */
export function getEvidenceNodeColor(type: string) {
  return EVIDENCE_NODE_COLORS[type] || EVIDENCE_NODE_COLORS.evidence
}

/** Evidence hex 색상 조회 헬퍼 */
export function getEvidenceNodeHex(type: string): string {
  return EVIDENCE_NODE_HEX[type] || DEFAULT_EVIDENCE_NODE_HEX
}

/** 에이전트 포지션 색상 조회 헬퍼 */
export function getAgentPositionColor(position: string) {
  return AGENT_POSITION_COLORS[position?.toUpperCase()] || DEFAULT_AGENT_POSITION_COLOR
}
