# chrome-extension 통합 가이드

이 문서는 **Chrome Extension**에서 factagora-graph-sdk를 통합하는 방법을 설명합니다.

## ✨ Chrome Extension 호환성

factagora-graph-sdk는 Chrome Extension에서 사용할 수 있도록 **React 독립적으로 설계**되었습니다:

- ✅ **Service Worker 호환**: `@factagora/chat-sdk/client` 모듈은 Web API만 사용
- ✅ **Content Script 호환**: DOM 조작 및 메시지 통신 지원
- ✅ **타입 지원**: `@factagora/types` 패키지로 TypeScript 타입 안전성 제공
- ⚠️ **시각화 컴포넌트**: `@factagora/chatbot-viz`는 React 기반 (React 환경 필요)

## 📦 패키지 설치

```bash
# 필수 패키지
pnpm add @factagora/types @factagora/chat-sdk

# 선택 (React 사용 시)
pnpm add @factagora/chatbot-viz react react-dom
```

## 🏗️ 아키텍처

```
┌─────────────────────────────────────┐
│   사용자 (웹 페이지)                  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Content Script                    │
│   - DOM 조작                        │
│   - UI 렌더링                       │
│   - chrome.runtime.sendMessage()    │
└──────────────┬──────────────────────┘
               │ (메시지 통신)
               ▼
┌─────────────────────────────────────┐
│   Service Worker (Background)       │
│   - streamSSE() 호출               │
│   - API 통신                       │
│   - chrome.tabs.sendMessage()      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Factagora API                     │
│   - RAG 파이프라인                   │
│   - SSE 스트리밍                    │
└─────────────────────────────────────┘
```

## 🚀 Quick Start

### 1. manifest.json 설정

```json
{
  "manifest_version": 3,
  "name": "Factagora Chat Extension",
  "version": "1.0.0",
  "permissions": [
    "activeTab",
    "storage"
  ],
  "host_permissions": [
    "https://api.factagora.com/*"
  ],
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"]
    }
  ]
}
```

### 2. Service Worker (background.js)

```typescript
import { streamSSE } from '@factagora/chat-sdk/client'
import type { ParsedSSEEvent } from '@factagora/types'

// 메시지 수신
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'sendMessage') {
    handleChat(request.message, sender.tab?.id)
    return true  // async 응답
  }
})

async function handleChat(message: string, tabId?: number) {
  if (!tabId) return

  const controller = new AbortController()

  try {
    for await (const event of streamSSE('https://api.factagora.com/api/chat/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Key': 'YOUR_API_KEY',  // 환경변수 사용 권장
      },
      body: {
        message,
        collectionId: null,  // null = 웹 검색
        searchMode: 'dg',
      },
      signal: controller.signal
    })) {
      // Content Script로 이벤트 전달
      chrome.tabs.sendMessage(tabId, {
        type: 'sse-event',
        event
      })
    }
  } catch (error) {
    console.error('Chat error:', error)
    chrome.tabs.sendMessage(tabId, {
      type: 'sse-error',
      error: error.message
    })
  }
}

// 스트림 취소 (옵션)
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'cancelStream') {
    // AbortController 로직 추가
  }
})
```

### 3. Content Script (content.js)

```typescript
import type { ParsedSSEEvent, GraphData, TimelineData } from '@factagora/types'

let currentGraphData: GraphData | null = null
let currentTimelineData: TimelineData | null = null
let partialContent = ''

// Service Worker로부터 메시지 수신
chrome.runtime.onMessage.addListener((request) => {
  if (request.type === 'sse-event') {
    const event: ParsedSSEEvent = request.event
    handleSSEEvent(event)
  } else if (request.type === 'sse-error') {
    showError(request.error)
  }
})

function handleSSEEvent(event: ParsedSSEEvent) {
  switch (event.type) {
    case 'session':
      console.log('Session created:', event.data.sessionId)
      break

    case 'status':
      updateStatus(event.data.step, event.data.message)
      break

    case 'delta':
      partialContent += event.data.content
      updateChatUI(partialContent)
      break

    case 'graph':
      currentGraphData = event.data.graph
      renderGraph(event.data.graph)
      break

    case 'timeline':
      currentTimelineData = event.data.timeline
      renderTimeline(event.data.timeline)
      break

    case 'done':
      console.log('Message ID:', event.data.messageId)
      finalizeChatUI()
      break

    case 'error':
      showError(event.data.message)
      break
  }
}

function updateChatUI(content: string) {
  const chatContainer = document.getElementById('factagora-chat')
  if (chatContainer) {
    chatContainer.innerHTML = `<p>${content}</p>`
  }
}

function renderGraph(graphData: GraphData) {
  // 간단한 그래프 표시 (텍스트 기반)
  const graphInfo = `
    <div class="graph-info">
      <h4>Knowledge Graph</h4>
      <p>${graphData.nodes.length} nodes, ${graphData.edges.length} edges</p>
    </div>
  `
  document.getElementById('factagora-graph')!.innerHTML = graphInfo

  // 또는 React 사용 시:
  // import { GraphPanel } from '@factagora/chatbot-viz/graph'
  // ReactDOM.render(<GraphPanel graphData={graphData} />, graphElement)
}

function renderTimeline(timelineData: TimelineData) {
  const timelineInfo = `
    <div class="timeline-info">
      <h4>Timeline</h4>
      <p>${timelineData.items.length} events</p>
    </div>
  `
  document.getElementById('factagora-timeline')!.innerHTML = timelineInfo
}

function updateStatus(step: string, message: string) {
  const statusEl = document.getElementById('factagora-status')
  if (statusEl) {
    statusEl.textContent = `${step}: ${message}`
  }
}

function showError(message: string) {
  alert(`Error: ${message}`)
}

function finalizeChatUI() {
  const statusEl = document.getElementById('factagora-status')
  if (statusEl) {
    statusEl.textContent = 'Done'
  }
}

// 사용자 메시지 전송
function sendMessage(message: string) {
  chrome.runtime.sendMessage({
    action: 'sendMessage',
    message
  })
}

// UI 초기화
document.addEventListener('DOMContentLoaded', () => {
  const inputEl = document.getElementById('factagora-input') as HTMLInputElement
  const sendBtn = document.getElementById('factagora-send')

  sendBtn?.addEventListener('click', () => {
    const message = inputEl?.value
    if (message) {
      sendMessage(message)
      inputEl.value = ''
    }
  })
})
```

## 🎨 React 사용 시 (선택사항)

Content Script에서 React를 사용하면 `@factagora/chatbot-viz` 컴포넌트를 활용할 수 있습니다.

### React 컴포넌트 렌더링

```typescript
// content.tsx (React)
import React from 'react'
import ReactDOM from 'react-dom/client'
import { GraphPanel } from '@factagora/chatbot-viz/graph'
import { TimelinePanel } from '@factagora/chatbot-viz/timeline'
import type { GraphData, TimelineData } from '@factagora/types'

function ChatWidget() {
  const [graphData, setGraphData] = React.useState<GraphData | null>(null)
  const [timelineData, setTimelineData] = React.useState<TimelineData | null>(null)
  const [content, setContent] = React.useState('')

  React.useEffect(() => {
    // Service Worker로부터 메시지 수신
    chrome.runtime.onMessage.addListener((request) => {
      if (request.type === 'sse-event') {
        const event = request.event

        switch (event.type) {
          case 'delta':
            setContent(prev => prev + event.data.content)
            break
          case 'graph':
            setGraphData(event.data.graph)
            break
          case 'timeline':
            setTimelineData(event.data.timeline)
            break
        }
      }
    })
  }, [])

  const sendMessage = (message: string) => {
    chrome.runtime.sendMessage({
      action: 'sendMessage',
      message
    })
  }

  return (
    <div className="factagora-widget">
      <div className="chat-content">{content}</div>

      {graphData && (
        <GraphPanel
          graphData={graphData}
          theme="dark"
          onNodeClick={(node) => console.log(node)}
        />
      )}

      {timelineData && (
        <TimelinePanel
          timelineData={timelineData}
          theme="dark"
        />
      )}

      <input
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            sendMessage(e.currentTarget.value)
            e.currentTarget.value = ''
          }
        }}
      />
    </div>
  )
}

// Content Script 실행
const root = document.createElement('div')
root.id = 'factagora-root'
document.body.appendChild(root)

ReactDOM.createRoot(root).render(<ChatWidget />)
```

### 빌드 설정 (Vite)

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        background: 'src/background.ts',
        content: 'src/content.tsx'
      },
      output: {
        entryFileNames: '[name].js',
        format: 'iife'
      }
    }
  }
})
```

## 📚 사용 가능한 API

### streamSSE (Service Worker에서 사용)

```typescript
import { streamSSE } from '@factagora/chat-sdk/client'

for await (const event of streamSSE(url, options)) {
  // event 처리
}
```

### REST API (Service Worker에서 사용)

```typescript
import { fetchSessions, fetchSession, deleteSession } from '@factagora/chat-sdk/client'

// 세션 목록 조회
const sessions = await fetchSessions(
  { collectionId: null },
  { baseUrl: 'https://api.factagora.com' }
)

// 세션 상세 조회
const session = await fetchSession('session-id', {
  baseUrl: 'https://api.factagora.com'
})

// 세션 삭제
await deleteSession('session-id', {
  baseUrl: 'https://api.factagora.com'
})
```

## ⚠️ 제한사항

### Service Worker 제약

- ❌ DOM 접근 불가 (Content Script에서만 가능)
- ❌ React 렌더링 불가 (Content Script에서만 가능)
- ✅ fetch, AbortController, Web API 사용 가능
- ✅ chrome.runtime API 사용 가능

### Content Script 제약

- ❌ 직접 API 호출 시 CORS 에러 발생 가능
- ✅ Service Worker를 통한 프록시 권장
- ✅ React 사용 가능 (빌드 필요)

## 🔐 보안 고려사항

### API Key 관리

```typescript
// ❌ 하드코딩 금지
const apiKey = 'my-secret-key'

// ✅ chrome.storage 사용 (옵션 페이지에서 설정)
chrome.storage.sync.get(['apiKey'], ({ apiKey }) => {
  // apiKey 사용
})

// ✅ 환경변수 (빌드 시 주입)
const apiKey = import.meta.env.VITE_FACTAGORA_API_KEY
```

### CSP (Content Security Policy)

```json
// manifest.json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

## 💡 실전 예시

### Sidebar Extension

웹 페이지 옆에 Factagora 채팅 사이드바를 띄우는 예시:

```typescript
// content.tsx
function FacagoraSidebar() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [messages, setMessages] = React.useState<ChatMessage[]>([])

  const sendMessage = (text: string) => {
    chrome.runtime.sendMessage({
      action: 'sendMessage',
      message: text
    })
  }

  return (
    <>
      <button
        className="factagora-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        Chat
      </button>

      {isOpen && (
        <div className="factagora-sidebar">
          <ChatInterface
            messages={messages}
            onSendMessage={sendMessage}
          />
        </div>
      )}
    </>
  )
}
```

### Popup Extension

Extension 아이콘 클릭 시 팝업에서 채팅하는 예시:

```typescript
// popup.tsx
import { useChat } from '@factagora/chat-sdk'

function PopupChat() {
  const {
    messages,
    isStreaming,
    graphData,
    sendMessage,
  } = useChat({
    collectionId: null,  // 웹 검색
    streamUrl: 'https://api.factagora.com/api/chat/message',
    headers: {
      'X-Internal-Key': import.meta.env.VITE_FACTAGORA_API_KEY
    }
  })

  return (
    <div className="popup-container">
      <ChatMessages messages={messages} />
      {graphData && <GraphPanel graphData={graphData} />}
      <ChatInput onSend={sendMessage} disabled={isStreaming} />
    </div>
  )
}
```

## 📖 추가 참고

자세한 타입 정의와 API 레퍼런스는 [메인 README](../README.md)를 참조하세요.

Chrome Extension 개발 가이드:
- [Chrome Extensions 공식 문서](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 마이그레이션](https://developer.chrome.com/docs/extensions/mv3/intro/)

---

**관련 문서:**
- [메인 README](../README.md) - 패키지 상세 가이드
- [live-article 통합](./live-article.md) - 기본 챗봇
- [social-network 통합](./social-network.md) - AI 예측 에이전트
- [chatgpt-apps 통합](./chatgpt-apps.md) - ChatGPT Apps
