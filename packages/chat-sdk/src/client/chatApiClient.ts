/**
 * Chat API 클라이언트 (React 독립적)
 *
 * 세션 CRUD, 공유 링크 등 REST API 호출.
 * baseUrl 파라미터화로 다양한 환경에서 사용 가능.
 *
 * @example
 * ```ts
 * // Next.js (relative URL)
 * const sessions = await fetchSessions({ collectionId: 'col-123' })
 *
 * // Chrome Extension (absolute URL)
 * const sessions = await fetchSessions(
 *   { collectionId: 'col-123' },
 *   { baseUrl: 'https://api.factagora.com' }
 * )
 * ```
 */

import type { ChatSession } from '@factagora/types'

/**
 * API 클라이언트 옵션
 */
export interface ChatApiClientOptions {
  /**
   * API base URL (기본값: '' — relative URL)
   * 예: 'https://api.factagora.com'
   */
  baseUrl?: string

  /**
   * 추가 HTTP 헤더 (인증 토큰 등)
   */
  headers?: Record<string, string>
}

/**
 * 세션 목록 조회 파라미터
 */
export interface FetchSessionsParams {
  /**
   * 컬렉션 ID (필터링)
   */
  collectionId?: string | null

  /**
   * 삭제된 세션 포함 여부 (기본값: false)
   */
  includeDeleted?: boolean
}

/**
 * 세션 목록 조회
 *
 * @param params - 조회 파라미터
 * @param options - API 클라이언트 옵션
 * @returns 세션 배열
 * @throws fetch 에러
 *
 * @example
 * ```ts
 * const sessions = await fetchSessions({ collectionId: 'col-123' })
 * console.log(sessions.length)
 * ```
 */
export async function fetchSessions(
  params: FetchSessionsParams = {},
  options: ChatApiClientOptions = {}
): Promise<ChatSession[]> {
  const { baseUrl = '', headers = {} } = options
  const { collectionId, includeDeleted = false } = params

  // Query string 생성
  const searchParams = new URLSearchParams()
  if (collectionId) {
    searchParams.set('collection_id', collectionId)
  }
  if (includeDeleted) {
    searchParams.set('is_deleted', 'false')
  }

  const queryString = searchParams.toString()
  const url = `${baseUrl}/api/chat/sessions${queryString ? `?${queryString}` : ''}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    throw new Error(errorBody?.error?.message || `Failed to fetch sessions: ${response.status}`)
  }

  const json = await response.json()
  return Array.isArray(json.data) ? json.data : []
}

/**
 * 세션 삭제
 *
 * @param sessionId - 세션 ID
 * @param options - API 클라이언트 옵션
 * @returns 삭제 성공 여부
 *
 * @example
 * ```ts
 * const success = await deleteSession('session-123')
 * if (success) {
 *   console.log('Session deleted')
 * }
 * ```
 */
export async function deleteSession(
  sessionId: string,
  options: ChatApiClientOptions = {}
): Promise<boolean> {
  const { baseUrl = '', headers = {} } = options

  const url = `${baseUrl}/api/chat/sessions/${sessionId}`

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    })

    // 204 No Content 또는 200 OK
    return response.ok || response.status === 204
  } catch {
    return false
  }
}

/**
 * 세션 상세 조회
 *
 * @param sessionId - 세션 ID
 * @param options - API 클라이언트 옵션
 * @returns 세션 정보
 * @throws fetch 에러
 *
 * @example
 * ```ts
 * const session = await fetchSession('session-123')
 * console.log(session.title)
 * ```
 */
export async function fetchSession(
  sessionId: string,
  options: ChatApiClientOptions = {}
): Promise<ChatSession> {
  const { baseUrl = '', headers = {} } = options

  const url = `${baseUrl}/api/chat/sessions/${sessionId}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    throw new Error(errorBody?.error?.message || `Failed to fetch session: ${response.status}`)
  }

  const json = await response.json()
  return json.data
}
