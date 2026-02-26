/**
 * @factagora/chat-sdk/client 엔트리 포인트
 *
 * React 독립적인 Web API 모듈.
 * Service Worker, Node.js, Chrome Extension 등에서 사용 가능.
 *
 * @example
 * ```ts
 * // Chrome Extension Service Worker
 * import { streamSSE, fetchSessions } from '@factagora/chat-sdk/client'
 *
 * for await (const event of streamSSE('/api/chat/message', { ... })) {
 *   console.log(event.type, event.data)
 * }
 * ```
 */

export { streamSSE, type SSERequestOptions } from './sseClient'
export { parseSSEChunk } from './sseParser'
export {
  fetchSessions,
  deleteSession,
  fetchSession,
  type ChatApiClientOptions,
  type FetchSessionsParams,
} from './chatApiClient'
