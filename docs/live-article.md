# live-article 통합 가이드

이 문서는 **live-article (Next.js 기본 챗봇)**에서 factagora-graph-sdk를 통합하는 방법을 설명합니다.

## 📦 패키지 설치

```bash
pnpm add @factagora/types @factagora/chat-sdk @factagora/chatbot-viz
```

## 🏗️ 아키텍처

live-article은 하이브리드 아키텍처로 구성됩니다:

```
┌─────────────────────────────┐
│   사용자 (브라우저)            │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   live-article (Next.js)               │
│   - UI 컴포넌트                         │
│   - 인증 (NextAuth.js)                  │
│   - API 라우트 (프록시)                  │
│   - 권한 체크                           │
└──────────────┬──────────────────────────┘
               │ (SSE 프록시)
               │ X-Internal-Key 헤더
               ▼
┌─────────────────────────────────────────┐
│   factagora-chatbot (FastAPI)          │
│   - RAG 파이프라인                       │
│   - 검색/Reranking/LLM                  │
│   - 세션/메시지 CRUD                     │
│   - Azure 내부 네트워크                   │
└──────────────┬──────────────────────────┘
               │
    ┌──────────┼──────────┐
    ▼          ▼          ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│ Supabase │ │ Azure    │ │ LLM API  │
│ PostgreSQL│ │OpenAI   │ │(GPT/    │
│ + pgvector│ │Embedding │ │Claude/  │
│          │ │          │ │Gemini)  │
└──────────┘ └──────────┘ └──────────┘
```

## 🔄 통합 패턴

### 1. CollectionDetailClient 컨테이너

전체 채팅 UI의 최상위 컨테이너입니다.

```typescript
'use client'

import { useChat } from '@factagora/chat-sdk'
import { useSessionList } from '@factagora/chat-sdk'

export function CollectionDetailClient({
  collectionId,
}: CollectionDetailClientProps) {
  // ─── Chat 훅 (세션 전환 지원) ─────────────────────────────────
  const {
    messages,
    isStreaming,
    isCollectionBased,
    status,
    statusMessage,
    partialContent,
    followUpQuestions,
    graphData,
    timelineData,
    sessionId: chatSessionId,
    sendMessage,
    cancelStream,
    loadSession,
    resetChat,
  } = useChat({
    collectionId,
    onSessionCreated: (newSessionId) => {
      sessionList.fetchSessions()
      updateSessionUrl(newSessionId)
    },
    onStreamComplete: () => {
      sessionList.fetchSessions()
    },
  })

  // ─── Session List 훅 ──────────────────────────────────────────
  const sessionList = useSessionList({
    collectionId,
    autoFetch: true,
  })

  // ─── URL ↔ 세션 동기화 ──────────────────────────────────────
  const updateSessionUrl = useCallback((sid: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (sid) {
      params.set('session', sid)
    } else {
      params.delete('session')
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [searchParams, pathname, router])

  // 세션 선택 핸들러
  const handleSessionSelect = useCallback(async (selectedSession: ChatSession) => {
    if (selectedSession.id === chatSessionId) return
    try {
      const res = await fetch(`/api/chat/sessions/${selectedSession.id}`)
      if (!res.ok) return
      const json = await res.json()
      const sessionMessages: ChatMessage[] = json.data?.messages ?? []
      loadSession(selectedSession.id, sessionMessages)
      updateSessionUrl(selectedSession.id)
    } catch (err) {
      console.error('Failed to load session:', err)
    }
  }, [chatSessionId, loadSession, updateSessionUrl])

  return (
    <div className="flex w-full h-full">
      {/* 좌측: Sources + Sessions */}
      <CollectionLeftPanel
        collectionId={collectionId}
        sessions={sessionList.sessions}
        selectedSessionId={chatSessionId}
        onSessionSelect={handleSessionSelect}
        onNewChat={resetChat}
      />

      {/* 우측: Chat Interface */}
      <ChatInterface
        collectionId={collectionId}
        messages={messages}
        isStreaming={isStreaming}
        isCollectionBased={isCollectionBased}
        status={status}
        statusMessage={statusMessage}
        partialContent={partialContent}
        followUpQuestions={followUpQuestions}
        graphData={graphData}
        timelineData={timelineData}
        sendMessage={sendMessage}
        cancelStream={cancelStream}
      />

      {/* 우측 드로어: 노드/관계 상세 */}
      <NodeDetailDrawer />
      <RelationDetailDrawer />
    </div>
  )
}
```

### 2. ChatInterface 레이아웃

```typescript
export function ChatInterface({
  collectionId,
  messages,
  isStreaming,
  isCollectionBased,
  status,
  statusMessage,
  partialContent,
  followUpQuestions,
  graphData,
  timelineData,
  sendMessage,
  cancelStream,
}: ChatInterfaceProps) {
  const [selectedSearchMode, setSelectedSearchMode] = useState<SearchMode>('dg')
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini')

  const handleSend = (msg: string) => {
    sendMessage(msg, selectedModel, selectedSearchMode)
  }

  return (
    <section className="flex-1 flex flex-col">
      {/* Messages */}
      <ChatMessages
        messages={messages}
        partialContent={partialContent}
        isStreaming={isStreaming}
        isCollectionBased={isCollectionBased}
        graphData={graphData}
        timelineData={timelineData}
        onSuggestSelect={handleSend}
        statusIndicator={<StatusIndicator status={status} message={statusMessage} />}
      />

      {/* Follow-up Suggestions */}
      {!isStreaming && followUpQuestions.length > 0 && (
        <FollowUpSuggestions
          questions={followUpQuestions}
          onSelect={handleSend}
        />
      )}

      {/* Input Area */}
      <ChatInput
        onSend={handleSend}
        isStreaming={isStreaming}
        onStop={cancelStream}
        searchMode={selectedSearchMode}
        onSearchModeChange={setSelectedSearchMode}
        model={selectedModel}
        onModelChange={setSelectedModel}
      />
    </section>
  )
}
```

### 3. GraphTogglePanel 구현

DG와 TKG 그래프를 토글하는 패널입니다.

```typescript
export function GraphTogglePanel({
  graphData,
  timelineData,
  className,
}: GraphTogglePanelProps) {
  const hasGraph = !!(graphData && graphData.nodes.length > 0)
  const hasTimeline = !!(timelineData && timelineData.items.length > 0)
  const hasBoth = hasGraph && hasTimeline

  const [activeView, setActiveView] = useState<'tkg' | 'dg'>('tkg')

  // 하나만 있으면 직접 렌더
  if (!hasBoth) {
    if (hasTimeline) return <TimelinePanel timelineData={timelineData!} className={className} />
    if (hasGraph) return <CitationGraphPanel graphData={graphData!} className={className} />
    return null
  }

  // 둘 다 있으면 토글
  return (
    <div className={cn('rounded-xl border', className)}>
      {/* 토글 헤더 */}
      <div className="flex items-center justify-end px-3 py-1.5">
        <div className="flex gap-0.5">
          <button
            onClick={() => setActiveView('tkg')}
            className={activeView === 'tkg' ? 'active' : ''}
          >
            Timeline
          </button>
          <button
            onClick={() => setActiveView('dg')}
            className={activeView === 'dg' ? 'active' : ''}
          >
            Citation Graph
          </button>
        </div>
      </div>

      {/* 콘텐츠 */}
      {activeView === 'tkg' ? (
        <TimelinePanel timelineData={timelineData!} hideHeader />
      ) : (
        <CitationGraphPanel graphData={graphData!} hideHeader />
      )}
    </div>
  )
}
```

## 🎨 어댑터 패턴

live-article에서는 @factagora/chatbot-viz 컴포넌트를 래핑하여 로컬 환경에 맞게 어댑터를 구현합니다.

### TimelinePanel 래핑

```typescript
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { useTimelineInteractionStore } from '@/stores'
import type { TimelineData } from '@factagora/types'

const TimelinePanelPackage = dynamic(
  () => import('@factagora/chatbot-viz/timeline').then((m) => ({ default: m.TimelinePanel })),
  { ssr: false },  // vis-timeline은 Canvas 기반이므로 SSR 비활성화
)

export function TimelinePanel({ timelineData, className, hideHeader = false }: TimelinePanelProps) {
  const t = useTranslations('chat')
  const openRelationDetail = useTimelineInteractionStore((s) => s.openRelationDetail)

  // next-intl → labels 변환 (다국어 지원)
  const labels = useMemo(
    () => ({
      title: t('chat.timeline.title'),
      stats: t('chat.timeline.stats', { entities: '{entities}', relations: '{relations}' }),
      emptyRelations: t('chat.timeline.emptyRelations'),
      emptyRelationsDetail: t('chat.timeline.emptyRelationsDetail', { count: '{count}' }),
    }),
    [t],
  )

  // store → props 변환 (상호작용 연결)
  const handleItemSelect = useCallback((item: any, data: any) => {
    openRelationDetail(item, data)
  }, [openRelationDetail])

  return (
    <TimelinePanelPackage
      timelineData={timelineData}
      labels={labels}
      className={className}
      hideHeader={hideHeader}
      itemColor="#3b82f6"
      onItemSelect={handleItemSelect}
    />
  )
}
```

### ForceGraph 래핑 (TKG)

```typescript
import dynamic from 'next/dynamic'
import { useThemeStore } from '@/stores/useThemeStore'
import { useGraphInteractionStore } from '@/stores/useGraphInteractionStore'
import type { GraphData } from '@factagora/types'

const ForceGraph = dynamic(
  () => import('@factagora/chatbot-viz/graph').then((m) => ({ default: m.ForceGraph })),
  { ssr: false },
)

export function TKGForceGraph({ graphData }: TKGForceGraphProps) {
  // Theme 상태 관리
  const theme = useThemeStore((s) => s.theme)
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  // Graph 상호작용 상태
  const hoveredNodeId = useGraphInteractionStore((s) => s.hoveredNodeId)
  const openNodeDetail = useGraphInteractionStore((s) => s.openNodeDetail)
  const setHoveredNodeId = useGraphInteractionStore((s) => s.setHoveredNodeId)

  const handleNodeClick = useCallback((node: any, data: any) => {
    openNodeDetail(node, data)
  }, [openNodeDetail])

  const handleNodeHover = useCallback((nodeId: string | null) => {
    setHoveredNodeId(nodeId)
  }, [setHoveredNodeId])

  return (
    <ForceGraph
      graphData={graphData}
      theme={isDark ? 'dark' : 'light'}
      onNodeClick={handleNodeClick}
      onNodeHover={handleNodeHover}
      hoveredNodeId={hoveredNodeId}
    />
  )
}
```

## 📊 상태 관리 (Zustand)

### useGraphInteractionStore

```typescript
import { create } from 'zustand'
import type { GraphNode, GraphData } from '@factagora/types'

interface GraphInteractionState {
  hoveredNodeId: string | null
  selectedNodeId: string | null
  selectedNodeData: GraphNode | null
  selectedGraphData: GraphData | null

  setHoveredNodeId: (id: string | null) => void
  setSelectedNodeId: (id: string | null) => void

  openNodeDetail: (node: GraphNode, graphData: GraphData) => void
  closeNodeDetail: () => void

  resetInteraction: () => void
}

export const useGraphInteractionStore = create<GraphInteractionState>((set) => ({
  hoveredNodeId: null,
  selectedNodeId: null,
  selectedNodeData: null,
  selectedGraphData: null,

  setHoveredNodeId: (id) => set({ hoveredNodeId: id }),
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  openNodeDetail: (node, graphData) => {
    // Timeline과의 상호 제외 (한 번에 하나만 활성화)
    useTimelineInteractionStore.getState().closeRelationDetail()
    set({
      selectedNodeId: node.id,
      selectedNodeData: node,
      selectedGraphData: graphData,
    })
  },

  closeNodeDetail: () => set({
    selectedNodeId: null,
    selectedNodeData: null,
    selectedGraphData: null,
  }),

  resetInteraction: () => set({
    hoveredNodeId: null,
    selectedNodeId: null,
    selectedNodeData: null,
    selectedGraphData: null,
  }),
}))
```

### useTimelineInteractionStore

```typescript
import { create } from 'zustand'
import type { TimelineItem, TimelineData } from '@factagora/types'

interface TimelineInteractionState {
  selectedItemId: string | null
  selectedItemData: TimelineItem | null
  selectedTimelineData: TimelineData | null

  openRelationDetail: (item: TimelineItem, timelineData: TimelineData) => void
  closeRelationDetail: () => void

  resetInteraction: () => void
}

export const useTimelineInteractionStore = create<TimelineInteractionState>((set) => ({
  selectedItemId: null,
  selectedItemData: null,
  selectedTimelineData: null,

  openRelationDetail: (item, timelineData) => {
    // Graph와의 상호 제외
    useGraphInteractionStore.getState().closeNodeDetail()
    set({
      selectedItemId: item.id,
      selectedItemData: item,
      selectedTimelineData: timelineData,
    })
  },

  closeRelationDetail: () => set({
    selectedItemId: null,
    selectedItemData: null,
    selectedTimelineData: null,
  }),

  resetInteraction: () => set({
    selectedItemId: null,
    selectedItemData: null,
    selectedTimelineData: null,
  }),
}))
```

## 📝 컴포넌트 계층 구조

```
CollectionDetailClient (Container)
├─ useChat Hook
│  ├─ messages
│  ├─ graphData
│  └─ timelineData
├─ useSessionList Hook
│  └─ sessions
│
├─ CollectionLeftPanel
│  ├─ Sources
│  └─ Sessions
│
└─ ChatInterface
   ├─ ChatMessages
   │  ├─ UserMessage
   │  ├─ AssistantMessage
   │  └─ GraphTogglePanel
   │     ├─ TimelinePanel (TKG)
   │     └─ CitationGraphPanel (DG)
   │
   ├─ FollowUpSuggestions
   └─ ChatInput
```

## 🔄 SSE 통신 흐름

```
[1] 사용자 질문 입력
  ↓
[2] Next.js SSE 프록시 (POST /api/chat/message)
  ├─ 인증 (requireAuth) → userId
  ├─ 요청 검증 (Zod schema)
  ├─ 컬렉션 접근 권한 체크
  └─ FastAPI로 프록시
  ↓
[3] FastAPI /rag/stream (POST 요청)
  ↓
[4] SSE 이벤트 시작
  └─ session, status, retrieval, delta, graph, timeline, follow_up, done
  ↓
[5] 프론트엔드 렌더링
  ├─ AssistantMessage: 텍스트 응답
  ├─ CitationGraph: 멀티홉 그래프
  ├─ NodeDetailPanel: 노드 상세
  └─ FollowUpSuggestions: 후속 질문
```

## 🛠️ 구현 패턴

### 무한 루프 방지 (useRef 패턴)

```typescript
// ✅ 올바른 구현
const sessionIdRef = useRef(sessionId)
const collectionIdRef = useRef(collectionId)

useEffect(() => {
  sessionIdRef.current = sessionId
}, [sessionId])

const sendMessage = useCallback(
  async (content: string) => {
    // ref로 최신값 참조 (dependency에 상태값 넣지 않음)
    const currentSessionId = sessionIdRef.current
    // ...
  },
  [defaultSearchMode]  // 상태값 미포함
)
```

### 양방향 상호작용 패턴 (Mutual Exclusion)

Graph와 Timeline은 한 번에 하나만 활성화:

```typescript
// useGraphInteractionStore
openNodeDetail: (node, graphData) => {
  // Timeline과의 상호 제외
  useTimelineInteractionStore.getState().closeRelationDetail()
  set({ selectedNodeData: node, ... })
}

// useTimelineInteractionStore
openRelationDetail: (item, timelineData) => {
  // Graph와의 상호 제외
  useGraphInteractionStore.getState().closeNodeDetail()
  set({ selectedItemData: item, ... })
}
```

## 📚 추가 참고

자세한 타입 정의와 API 레퍼런스는 [메인 README](../README.md)를 참조하세요.

---

**관련 문서:**
- [메인 README](../README.md) - 패키지 상세 가이드
- [social-network 통합](./social-network.md) - AI 예측 에이전트
- [chrome-extension 통합](./chrome-extension.md) - 크롬 익스텐션
- [chatgpt-apps 통합](./chatgpt-apps.md) - ChatGPT Apps
