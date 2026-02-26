/**
 * SSE 클라이언트 (React 독립적 — Service Worker 호환)
 *
 * fetch + ReadableStream으로 SSE 스트리밍을 처리하는 async generator.
 * React 훅이 아니므로 Chrome Extension Service Worker, Node.js 등에서도 사용 가능.
 *
 * @example
 * ```ts
 * const controller = new AbortController()
 *
 * try {
 *   for await (const event of streamSSE('/api/chat/message', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: { message: 'Hello' },
 *     signal: controller.signal,
 *   })) {
 *     if (event.type === 'delta') {
 *       console.log(event.data.content)
 *     }
 *   }
 * } catch (error) {
 *   if (error.name === 'AbortError') {
 *     console.log('Stream cancelled')
 *   } else {
 *     console.error('Stream error:', error)
 *   }
 * }
 * ```
 */

import type { ParsedSSEEvent } from '@factagora/types'
import { parseSSEChunk } from './sseParser'

/**
 * SSE 스트리밍 요청 옵션
 */
export interface SSERequestOptions {
  /**
   * HTTP 메서드 (기본값: 'POST')
   */
  method?: 'GET' | 'POST'

  /**
   * HTTP 헤더
   */
  headers?: Record<string, string>

  /**
   * 요청 본문 (JSON.stringify됨)
   */
  body?: unknown

  /**
   * AbortSignal (스트림 취소용)
   */
  signal?: AbortSignal
}

/**
 * SSE 스트리밍 async generator
 *
 * @param url - 요청 URL
 * @param options - 요청 옵션
 * @yields SSE 이벤트
 * @throws fetch 에러, 파싱 에러 (AbortError는 정상 취소)
 */
export async function* streamSSE(
  url: string,
  options: SSERequestOptions = {}
): AsyncGenerator<ParsedSSEEvent, void, unknown> {
  const { method = 'POST', headers = {}, body, signal } = options

  // 1. fetch 요청
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    signal,
  })

  // 2. 응답 검증
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    throw new Error(errorBody?.error?.message || `Request failed: ${response.status}`)
  }

  if (!response.body) {
    throw new Error('No response body')
  }

  // 3. ReadableStream reader + TextDecoder
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let sseBuffer = ''

  try {
    // 4. 스트림 읽기 루프
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      // 5. TextDecoder로 디코딩하여 버퍼에 누적
      sseBuffer += decoder.decode(value, { stream: true })

      // 6. SSE 파싱
      const { events, remaining } = parseSSEChunk(sseBuffer)
      sseBuffer = remaining

      // 7. 각 이벤트를 yield
      for (const event of events) {
        yield event
      }
    }
  } finally {
    // 8. reader 정리 (에러 발생 시에도 실행)
    reader.releaseLock()
  }
}
