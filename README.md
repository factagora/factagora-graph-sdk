# factagora-graph-sdk

Factagora 그래프 기반 지식 탐색 SDK - 모노레포

## 📦 Packages

- **[@factagora/types](./packages/types)** - 공유 TypeScript 타입 (Graph, Timeline, SSE, Chat, Agent)
- **[@factagora/chat-sdk](./packages/chat-sdk)** - RAG 챗봇 SDK (React hooks + Web API)
- **[@factagora/viz](./packages/viz)** - 그래프/타임라인 시각화 컴포넌트

## 🚀 Quick Start

```bash
# 의존성 설치
pnpm install

# 모든 패키지 빌드
pnpm build

# 개발 모드
pnpm dev
```

## 🏗️ Tech Stack

- **모노레포**: Turborepo + pnpm workspaces
- **타입 시스템**: TypeScript 5.9+
- **빌드**: tsup (esbuild 기반)
- **패키지 레지스트리**: GitHub Packages

## 📁 구조

```
factagora-graph-sdk/
├── packages/
│   ├── types/         # @factagora/types
│   ├── chat-sdk/      # @factagora/chat-sdk
│   └── viz/           # @factagora/viz
├── tooling/
│   └── tsconfig/      # 공유 TypeScript 설정
└── .github/
    └── workflows/     # CI/CD
```

## 📖 사용 예시

### @factagora/types
```typescript
import type { GraphData, TimelineData, SSEEvent } from '@factagora/types'
```

### @factagora/chat-sdk
```typescript
import { useChat } from '@factagora/chat-sdk'

function ChatComponent() {
  const { messages, sendMessage, isStreaming } = useChat({
    sessionId: 'session-123',
    collectionId: 'col-456'
  })

  // ...
}
```

### @factagora/viz
```typescript
import { GraphPanel } from '@factagora/viz'

<GraphPanel data={graphData} theme="dark" />
```

## 📝 License

MIT © Factagora Team
