/**
 * 로컬 빌드 패키지 타입 체크 테스트 (types + chat-sdk)
 */
import type { GraphData, ChatSession, StreamingStatus } from './packages/types/src'

// chat-sdk client import 테스트
import { parseSSEChunk } from './packages/chat-sdk/src/client/sseParser'

// types 패키지 타입 체크
const data: GraphData = {
  nodes: [],
  edges: [],
  metadata: null,
}

const session: ChatSession = {
  id: 'test-session',
  userId: 'test-user',
  collectionId: 'test-collection',
  collectionTitle: 'Test Collection',
  title: 'Test Chat',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isDeleted: false,
}

const status: StreamingStatus = 'idle'

// chat-sdk 함수 테스트
const { events } = parseSSEChunk('event: done\ndata: {"messageId":"123","model":"gpt-4.1-mini"}\n\n')

console.log('✅ All types and functions imported successfully!', {
  data,
  session,
  status,
  parsedEvents: events,
})
