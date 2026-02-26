/**
 * SSE 파서 유틸리티 (순수 함수 — React 독립적)
 *
 * SSE 텍스트 청크를 파싱하여 이벤트 배열로 변환.
 * 청크가 이벤트 경계에서 분할될 수 있으므로 버퍼링 처리.
 *
 * SSE 형식: `event: type\ndata: {...}\n\n`
 */

import type { ParsedSSEEvent, SSEEventType } from '@factagora/types'

/**
 * SSE 텍스트 버퍼를 파싱하여 완료된 이벤트와 남은 버퍼를 반환
 *
 * @param buffer - 누적된 SSE 텍스트 버퍼
 * @returns 파싱된 이벤트 배열과 남은 버퍼
 *
 * @example
 * ```ts
 * const { events, remaining } = parseSSEChunk(sseBuffer)
 * sseBuffer = remaining
 *
 * for (const event of events) {
 *   console.log(event.type, event.data)
 * }
 * ```
 */
export function parseSSEChunk(buffer: string): {
  events: ParsedSSEEvent[]
  remaining: string
} {
  const events: ParsedSSEEvent[] = []

  // 이벤트는 빈 줄(\n\n)로 구분
  const blocks = buffer.split('\n\n')

  // 마지막 블록은 아직 완료되지 않았을 수 있음
  const remaining = blocks.pop() || ''

  for (const block of blocks) {
    if (!block.trim()) continue

    let eventType: SSEEventType | null = null
    let dataStr = ''

    const lines = block.split('\n')

    for (const line of lines) {
      if (line.startsWith('event:')) {
        eventType = line.slice(6).trim() as SSEEventType
      } else if (line.startsWith('data:')) {
        dataStr = line.slice(5).trim()
      }
    }

    if (eventType && dataStr) {
      try {
        const data = JSON.parse(dataStr)
        events.push({ type: eventType, data })
      } catch {
        // JSON 파싱 실패 — 무시 (로그)
        console.warn('[sseParser] Failed to parse SSE data:', dataStr)
      }
    }
  }

  return { events, remaining }
}
