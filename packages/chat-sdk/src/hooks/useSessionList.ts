/**
 * useSessionList 훅 — 세션 목록 관리
 *
 * chatApiClient를 사용하여 세션 목록 조회 및 삭제 (낙관적 업데이트).
 */

'use client'

import { useState, useCallback, useEffect } from 'react'
import type { ChatSession } from '@factagora/types'
import { fetchSessions, deleteSession as apiDeleteSession, type ChatApiClientOptions } from '../client/chatApiClient'

// ─── Types ─────────────────────────────────────────────────────

export interface UseSessionListOptions {
  /**
   * 컬렉션 ID (필터링)
   */
  collectionId: string | null

  /**
   * 삭제된 세션 포함 여부 (기본값: false)
   */
  includeDeleted?: boolean

  /**
   * 자동 fetch 여부 (기본값: true)
   */
  autoFetch?: boolean

  /**
   * API base URL (기본값: '' — relative URL)
   */
  apiBaseUrl?: string

  /**
   * 추가 HTTP 헤더 (인증 토큰 등)
   */
  headers?: Record<string, string>
}

export interface UseSessionListReturn {
  sessions: ChatSession[]
  isLoading: boolean
  error: Error | null
  fetchSessions: () => Promise<void>
  deleteSession: (sessionId: string) => Promise<boolean>
}

// ─── Hook ──────────────────────────────────────────────────────

export function useSessionList(options: UseSessionListOptions): UseSessionListReturn {
  const {
    collectionId,
    includeDeleted = false,
    autoFetch = true,
    apiBaseUrl = '',
    headers = {},
  } = options

  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const apiOptions: ChatApiClientOptions = {
    baseUrl: apiBaseUrl,
    headers,
  }

  const fetchSessionsCallback = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchSessions(
        {
          collectionId,
          includeDeleted,
        },
        apiOptions
      )
      setSessions(data)
    } catch (err) {
      const fetchError = err instanceof Error ? err : new Error('Unknown error')
      setError(fetchError)
    } finally {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionId, includeDeleted])

  const deleteSessionCallback = useCallback(
    async (sessionId: string): Promise<boolean> => {
      // 낙관적 업데이트
      const previousSessions = sessions
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))

      try {
        const success = await apiDeleteSession(sessionId, apiOptions)

        if (!success) {
          // 실패 시 롤백
          setSessions(previousSessions)
        }

        return success
      } catch {
        // 실패 시 롤백
        setSessions(previousSessions)
        return false
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessions]
  )

  // 자동 fetch
  useEffect(() => {
    if (autoFetch) {
      fetchSessionsCallback()
    }
  }, [autoFetch, fetchSessionsCallback])

  return {
    sessions,
    isLoading,
    error,
    fetchSessions: fetchSessionsCallback,
    deleteSession: deleteSessionCallback,
  }
}
