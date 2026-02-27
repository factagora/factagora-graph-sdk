/**
 * useChat 훅 — 챗봇 메인 훅
 *
 * streamSSE로 SSE 스트리밍 처리.
 * sseClient를 사용하여 React 독립적인 로직 분리.
 *
 * 무한 루프 방지:
 * - sendMessage는 useCallback으로 안정화, dependency에 상태값 넣지 않음
 * - 상태는 useRef로 최신값 참조 또는 setState(prev => ...) 함수형 업데이트
 * - AbortController를 useRef로 관리
 */

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type {
  ChatMessage,
  SearchMode,
  StreamingStatus,
  GraphData,
  TimelineData,
  SSESessionEvent,
  SSEStatusEvent,
  SSEDeltaEvent,
  SSEDoneEvent,
  SSEErrorEvent,
  SSEFollowUpEvent,
  SSEGraphEvent,
  SSETimelineEvent,
} from '@factagora/types'
import { streamSSE } from '../client/sseClient'

// ─── Types ─────────────────────────────────────────────────────

export interface UseChatOptions {
  /**
   * 컬렉션 ID (필수)
   */
  collectionId: string | null

  /**
   * 세션 ID (기존 세션 이어가기)
   */
  sessionId?: string | null

  /**
   * 검색 모드 (기본값: 'dg')
   */
  searchMode?: SearchMode

  /**
   * SSE 스트리밍 URL (기본값: '/api/chat/message')
   */
  streamUrl?: string

  /**
   * API base URL (기본값: '' — relative URL)
   */
  apiBaseUrl?: string

  /**
   * 추가 HTTP 헤더 (인증 토큰 등)
   */
  headers?: Record<string, string>

  /**
   * 세션 생성 콜백
   */
  onSessionCreated?: (sessionId: string) => void

  /**
   * 스트림 완료 콜백
   */
  onStreamComplete?: () => void

  /**
   * 에러 콜백
   */
  onError?: (error: Error) => void
}

export interface UseChatReturn {
  messages: ChatMessage[]
  isStreaming: boolean
  isCollectionBased: boolean
  status: StreamingStatus
  statusMessage: string
  partialContent: string
  graphData: GraphData | null
  timelineData: TimelineData | null
  followUpQuestions: string[]
  sessionId: string | null
  error: Error | null
  currentSearchMode: SearchMode
  sendMessage: (content: string, model?: string, searchMode?: SearchMode) => Promise<void>
  cancelStream: () => void
  loadSession: (sessionId: string, existingMessages: ChatMessage[]) => void
  resetChat: () => void
}

// ─── Hook ──────────────────────────────────────────────────────

export function useChat(options: UseChatOptions): UseChatReturn {
  const {
    collectionId,
    sessionId: initialSessionId = null,
    searchMode: defaultSearchMode = 'dg',
    streamUrl = '/api/chat/message',
    apiBaseUrl = '',
    headers: customHeaders = {},
    onSessionCreated,
    onStreamComplete,
    onError,
  } = options

  // State
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [status, setStatus] = useState<StreamingStatus>('idle')
  const [statusMessage, setStatusMessage] = useState('')
  const [partialContent, setPartialContent] = useState('')
  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [timelineData, setTimelineData] = useState<TimelineData | null>(null)
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([])
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId ?? null)
  const [error, setError] = useState<Error | null>(null)
  const [currentSearchMode, setCurrentSearchMode] = useState<SearchMode>(defaultSearchMode)
  const [isCollectionBased, setIsCollectionBased] = useState(false)

  // Refs (최신값 참조 — 무한 루프 방지)
  const abortControllerRef = useRef<AbortController | null>(null)
  const sessionIdRef = useRef(sessionId)
  const collectionIdRef = useRef(collectionId)
  const onSessionCreatedRef = useRef(onSessionCreated)
  const onStreamCompleteRef = useRef(onStreamComplete)
  const onErrorRef = useRef(onError)
  const graphDataRef = useRef<GraphData | null>(null)
  const timelineDataRef = useRef<TimelineData | null>(null)

  // Ref 동기화
  useEffect(() => {
    sessionIdRef.current = sessionId
  }, [sessionId])

  useEffect(() => {
    collectionIdRef.current = collectionId
  }, [collectionId])

  useEffect(() => {
    onSessionCreatedRef.current = onSessionCreated
  }, [onSessionCreated])

  useEffect(() => {
    onStreamCompleteRef.current = onStreamComplete
  }, [onStreamComplete])

  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  // 언마운트 시 자동 abort
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  // cancelStream
  const cancelStream = useCallback(() => {
    abortControllerRef.current?.abort()
    setIsStreaming(false)
    setStatus('idle')
    setStatusMessage('')
  }, [])

  // loadSession — 기존 세션 메시지를 로드하여 세션 전환
  const loadSession = useCallback((newSessionId: string, existingMessages: ChatMessage[]) => {
    abortControllerRef.current?.abort()
    setSessionId(newSessionId)
    sessionIdRef.current = newSessionId
    setMessages(existingMessages)
    setIsStreaming(false)
    setIsCollectionBased(false)
    setStatus('idle')
    setStatusMessage('')
    setPartialContent('')
    setError(null)
    setFollowUpQuestions([])

    // 마지막 어시스턴트 메시지에서 graph/timeline 데이터 복원
    const lastAssistant = [...existingMessages].reverse().find(m => m.role === 'assistant')
    const restoredGraph = lastAssistant?.retrievalGraph ?? null
    const restoredTimeline = lastAssistant?.retrievalTimeline ?? null
    setGraphData(restoredGraph)
    graphDataRef.current = restoredGraph
    setTimelineData(restoredTimeline)
    timelineDataRef.current = restoredTimeline
  }, [])

  // resetChat — 세션 초기화 (새 대화 시작)
  const resetChat = useCallback(() => {
    abortControllerRef.current?.abort()
    setSessionId(null)
    sessionIdRef.current = null
    setMessages([])
    setIsStreaming(false)
    setIsCollectionBased(false)
    setStatus('idle')
    setStatusMessage('')
    setPartialContent('')
    setError(null)
    setFollowUpQuestions([])
    setGraphData(null)
    graphDataRef.current = null
    setTimelineData(null)
    timelineDataRef.current = null
  }, [])

  // sendMessage (dependency에 상태값 넣지 않음 — useRef로 최신값 참조)
  const sendMessage = useCallback(
    async (content: string, model?: string, searchMode?: SearchMode) => {
      // 이전 스트림 중단
      abortControllerRef.current?.abort()

      const controller = new AbortController()
      abortControllerRef.current = controller

      const resolvedSearchMode = searchMode || defaultSearchMode
      setCurrentSearchMode(resolvedSearchMode)

      // 1. user 메시지 추가
      const userMessage: ChatMessage = {
        id: `temp-user-${Date.now()}`,
        sessionId: sessionIdRef.current || '',
        role: 'user',
        content,
        createdAt: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, userMessage])
      setIsStreaming(true)
      setIsCollectionBased(false)
      setStatus('analyzing')
      setStatusMessage('')
      setPartialContent('')
      setError(null)
      setFollowUpQuestions([])
      setGraphData(null)
      graphDataRef.current = null
      setTimelineData(null)
      timelineDataRef.current = null

      try {
        let accumulatedContent = ''
        let hasRetrieval = false

        const url = `${apiBaseUrl}${streamUrl}`

        // 2. streamSSE로 SSE 스트리밍
        for await (const event of streamSSE(url, {
          method: 'POST',
          headers: customHeaders,
          body: {
            collectionId: collectionIdRef.current,
            sessionId: sessionIdRef.current || undefined,
            message: content,
            model: model || undefined,
            searchMode: resolvedSearchMode,
          },
          signal: controller.signal,
        })) {
          // 3. 이벤트별 상태 업데이트
          switch (event.type) {
            case 'session': {
              const data = event.data as SSESessionEvent
              setSessionId(data.sessionId)
              sessionIdRef.current = data.sessionId
              onSessionCreatedRef.current?.(data.sessionId)
              break
            }
            case 'status': {
              const data = event.data as SSEStatusEvent
              setStatus(data.step as StreamingStatus)
              setStatusMessage(data.message)
              break
            }
            case 'retrieval': {
              hasRetrieval = true
              setIsCollectionBased(true)
              break
            }
            case 'delta': {
              const data = event.data as SSEDeltaEvent
              accumulatedContent += data.content
              setPartialContent(accumulatedContent)
              break
            }
            case 'graph': {
              const data = event.data as SSEGraphEvent
              setGraphData(data)
              graphDataRef.current = data
              break
            }
            case 'timeline': {
              const data = event.data as SSETimelineEvent
              setTimelineData(data)
              timelineDataRef.current = data
              break
            }
            case 'follow_up': {
              const data = event.data as SSEFollowUpEvent
              setFollowUpQuestions(data.questions)
              break
            }
            case 'done': {
              const data = event.data as SSEDoneEvent
              // assistant 메시지 확정
              const assistantMessage: ChatMessage = {
                id: data.messageId,
                sessionId: sessionIdRef.current || '',
                role: 'assistant',
                content: accumulatedContent,
                modelUsed: data.model,
                requestId: data.requestId,
                isCollectionBased: hasRetrieval,
                retrievalGraph: graphDataRef.current ?? undefined,
                retrievalTimeline: timelineDataRef.current ?? undefined,
                createdAt: new Date().toISOString(),
              }
              setMessages((prev) => [...prev, assistantMessage])
              setPartialContent('')
              accumulatedContent = ''
              setIsStreaming(false)
              setStatus('idle')
              setStatusMessage('')
              onStreamCompleteRef.current?.()
              break
            }
            case 'error': {
              const data = event.data as SSEErrorEvent
              const streamError = new Error(data.message)
              setError(streamError)
              setIsStreaming(false)
              setStatus('idle')
              setStatusMessage('')
              onErrorRef.current?.(streamError)
              break
            }
          }
        }
      } catch (err) {
        // AbortError는 정상 (cancelStream 또는 언마운트)
        if (err instanceof DOMException && err.name === 'AbortError') {
          setIsStreaming(false)
          setStatus('idle')
          return
        }

        const streamError = err instanceof Error ? err : new Error('Unknown error')
        setError(streamError)
        setIsStreaming(false)
        setStatus('idle')
        setStatusMessage('')
        onErrorRef.current?.(streamError)
      }
    },
    [defaultSearchMode, streamUrl, apiBaseUrl, customHeaders]
  )

  return {
    messages,
    isStreaming,
    isCollectionBased,
    status,
    statusMessage,
    partialContent,
    graphData,
    timelineData,
    followUpQuestions,
    sessionId,
    error,
    currentSearchMode,
    sendMessage,
    cancelStream,
    loadSession,
    resetChat,
  }
}
