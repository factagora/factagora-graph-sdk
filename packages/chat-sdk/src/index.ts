/**
 * @factagora/chat-sdk 메인 엔트리 포인트
 *
 * React 훅을 기본 export.
 * Web API는 '@factagora/chat-sdk/client'에서 import.
 *
 * @example
 * ```tsx
 * // React 훅 (메인 엔트리)
 * import { useChat, useSessionList } from '@factagora/chat-sdk'
 *
 * // Web API (client 엔트리)
 * import { streamSSE, fetchSessions } from '@factagora/chat-sdk/client'
 * ```
 */

export { useChat, type UseChatOptions, type UseChatReturn } from './hooks/useChat'
export { useSessionList, type UseSessionListOptions, type UseSessionListReturn } from './hooks/useSessionList'
