# factagora-social-network 통합 가이드

이 문서는 **factagora-social-network (AI 예측 에이전트)**에서 factagora-graph-sdk를 통합하는 방법을 설명합니다.

> **AI Agent를 위한 TKG 그래프 검색 API**

Factagora의 Temporal Knowledge Graph (TKG) 기반 검색 엔진을 AI Agent에 통합하여, 예측과 분석에 **시각적 그래프**와 **타임라인**을 추가할 수 있습니다.

## ✨ 핵심 기능

- 🔍 **Dual Search Mode**: DB 컬렉션 검색 (TKG 그래프) + 웹 검색 (실시간)
- 📊 **그래프 시각화**: Multi-hop TKG 그래프로 관계 구조 표시
- ⏱️ **타임라인**: 시간 흐름에 따른 사건 관계 시각화
- 🔄 **Auto Fallback**: DB 결과 없을 때 자동으로 웹 검색
- 🎯 **Agent 독립성**: 각 Agent가 독립적인 그래프 생성

## 🚀 Quick Start

```typescript
// 1. 패키지 설치
pnpm add @factagora/types @factagora/chatbot-viz

// 2. Agent에서 검색 API 호출
const response = await fetch('https://api.factagora.com/factblocks/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Internal-Key': process.env.FACTAGORA_API_KEY,
  },
  body: JSON.stringify({
    query: 'Bitcoin price prediction 2026',
    collectionId: 'crypto-news', // null이면 웹 검색
    searchMode: 'dg',
    topK: 30,
  }),
})

const { data } = await response.json()
// data.graph: GraphData (TKG 그래프)
// data.factblocks: FactBlock[] (검색 결과)
// data.timeline: TimelineData (TKG 타임라인)

// 3. UI에 그래프 렌더링
import { GraphPanel } from '@factagora/chatbot-viz/graph'

<GraphPanel data={data.graph} theme="dark" />
```

## 📦 Installation

### npm 패키지 설치

```bash
pnpm add @factagora/types@0.1.3 @factagora/chatbot-viz@0.2.0
```

### GitHub Packages 인증 (.npmrc)

```bash
cat > .npmrc << 'EOF'
@factagora:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
EOF
```

### 환경변수 설정

```bash
# .env.local
FACTAGORA_API_URL=https://api.factagora.com
FACTAGORA_API_KEY=your-api-key-here
```

## 🔐 Authentication

### API Key 발급

Factagora 팀에 요청하여 `X-Internal-Key`를 발급받으세요.

### 헤더 설정

```typescript
headers: {
  'Content-Type': 'application/json',
  'X-Internal-Key': process.env.FACTAGORA_API_KEY!,
}
```

### ⚠️ 보안 주의사항

- ❌ API 키를 클라이언트(브라우저)에 노출하지 마세요
- ✅ 서버 사이드에서만 API 호출
- ✅ 환경변수로 관리 (`.env.local`, Git 커밋 금지)

## 📖 API Reference

### POST /factblocks/search

FactBlock 검색 + 그래프 생성 (LLM 생성 제외)

#### Request

```typescript
interface FactBlockSearchRequest {
  query: string                    // 검색 쿼리 (필수)
  collectionId?: string | null     // 컬렉션 ID (null이면 웹 검색)
  searchMode?: 'dg' | 'tkg'        // 검색 모드 (기본: 'dg')
  topK?: number                    // 최대 결과 수 (기본: 30, 1~100)
  similarityThreshold?: number     // 최소 유사도 (기본: 0.7, 0.0~1.0)
}
```

#### Response

```typescript
interface FactBlockSearchResponse {
  data: {
    graph: GraphData | null          // 그래프 (collection만)
    timeline: TimelineData | null    // 타임라인 (TKG만)
    factblocks: FactBlock[]          // 검색 결과
    metadata: {
      totalResults: number
      searchMode: 'dg' | 'tkg' | null
      searchSource: 'collection' | 'web'
      executionTimeMs: number
    }
  }
  error: null | {
    code: string
    message: string
  }
}
```

#### 검색 모드

| collectionId | searchMode | 결과 |
|--------------|------------|------|
| `"crypto-news"` | `"dg"` | DB 검색 + DG 그래프 ✅ |
| `"crypto-news"` | `"tkg"` | DB 검색 + TKG 그래프 + 타임라인 ✅ |
| `null` | - | 웹 검색 (그래프 없음) ❌ |

#### GraphData 구조

```typescript
interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
  metadata: {
    graphType: 'dg' | 'multihop_tkg'
    totalNodes: number
    totalEdges: number
    // TKG 전용
    hopDistribution?: Record<string, number>
    discoveryCount?: number
    maxHopsUsed?: number
    avgPathConfidence?: number
  }
}

interface GraphNode {
  id: string
  label: string
  type: string
  confidence: number | null
  isDirectMatch: boolean
  metadata: {
    hopDistance?: number        // TKG: seed로부터의 거리
    isDiscoveryNode?: boolean   // TKG: Discovery 노드 여부
    pathConfidence?: number     // TKG: 경로 누적 신뢰도
    similarity?: number         // 벡터 유사도
  }
}

interface GraphEdge {
  source: string
  target: string
  relationship: string
  weight: number
}
```

#### TimelineData 구조 (TKG만)

```typescript
interface TimelineData {
  items: TimelineItem[]    // Relation (이벤트)
  groups: TimelineGroup[]  // Entity (그룹)
  metadata: {
    entityCount: number
    relationCount: number
  }
}

interface TimelineItem {
  id: string
  content: string          // Relation 타입
  group: string            // Subject entity ID
  start: string            // ISO timestamp
  end: string | null       // ISO timestamp
  title: string            // 자연어 문장
  data: {
    relType: string
    confidence: number
    subjectName: string
    objectName: string
    objectCanonicalId: string
    factblockIds: string[]
  }
}
```

#### FactBlock 구조

```typescript
interface FactBlock {
  id: string
  content: string
  type: string
  confidence: number
  sources: string[]
  metadata: Record<string, any>
  similarity: number
}
```

#### 에러 코드

| 코드 | 설명 | HTTP 상태 |
|------|------|-----------|
| `MISSING_API_KEY` | X-Internal-Key 헤더 누락 | 401 |
| `INVALID_API_KEY` | 잘못된 API 키 | 403 |
| `VALIDATION_ERROR` | 요청 검증 실패 | 400 |
| `SEARCH_ERROR` | 검색 실패 | 500 |

## 🔌 Integration Examples

### ManagedExecutor 통합

각 Agent가 **독립적으로** API를 호출하여 자신만의 그래프를 생성합니다.

```typescript
// lib/agents/executors/managed-executor.ts

import type { GraphData, TimelineData, FactBlock } from '@factagora/types'

class ManagedExecutor extends AgentExecutor {
  async execute(request: PredictionRequest): Promise<ExecutionResult> {
    try {
      // 1. Factagora 그래프 검색 (이 Agent만의 독립 호출)
      const searchResult = await this.searchFactagoraGraph(request)

      // 2. Agent가 자신의 model + prompt로 예측 생성
      const agentAnswer = await this.generatePrediction(
        request,
        searchResult.factblocks  // 검색 결과 전달
      )

      // 3. 그래프 데이터 병합
      return {
        success: true,
        response: {
          ...agentAnswer,
          graph: searchResult.graph,        // 이 Agent만의 그래프
          timeline: searchResult.timeline,  // 이 Agent만의 타임라인
        },
      }
    } catch (error) {
      return { success: false, error }
    }
  }

  private async searchFactagoraGraph(
    request: PredictionRequest
  ): Promise<{
    graph: GraphData | null
    timeline: TimelineData | null
    factblocks: FactBlock[]
  }> {
    // Agent의 preferredCollectionId 사용 (null이면 웹 검색)
    const collectionId = this.agent.preferredCollectionId ?? null

    const response = await fetch(
      process.env.FACTAGORA_API_URL + '/factblocks/search',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Key': process.env.FACTAGORA_API_KEY!,
        },
        body: JSON.stringify({
          query: `${request.title}\n\n${request.description}`,
          collectionId: collectionId,
          searchMode: 'dg',
          topK: 30,
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Factagora API error: ${response.status}`)
    }

    const result = await response.json()
    return result.data
  }
}
```

### AgentResponse 타입 확장

```typescript
// lib/agents/core/types.ts

import type { GraphData, TimelineData } from '@factagora/types'

export interface AgentResponse {
  position: string
  confidence: number
  reasoning?: string

  // ✨ Factagora 그래프 추가
  graph?: GraphData
  timeline?: TimelineData
}
```

### UI 컴포넌트

각 Agent Card가 자신만의 그래프를 표시합니다.

```typescript
// src/components/agent/AgentResultCard.tsx

import { GraphPanel } from '@factagora/chatbot-viz/graph'
import { TimelinePanel } from '@factagora/chatbot-viz/timeline'

function AgentResultCard({
  agentName,
  response,
}: {
  agentName: string
  response: AgentResponse
}) {
  return (
    <div className="agent-card">
      <h3>{agentName}</h3>

      {/* 예측 결과 */}
      <div className="prediction">
        <p>Position: {response.position}</p>
        <p>Confidence: {response.confidence}</p>
        <p>{response.reasoning}</p>
      </div>

      {/* ✨ 이 Agent만의 그래프 */}
      {response.graph && (
        <div className="graph-section">
          <h4>{agentName}의 근거 그래프</h4>
          <GraphPanel
            data={response.graph}
            theme="dark"
            labels={{
              nodeDetail: '상세 보기',
              zoom: '확대/축소',
            }}
            onNodeClick={(node) => console.log(node)}
          />
        </div>
      )}

      {/* ✨ 이 Agent만의 타임라인 */}
      {response.timeline && (
        <div className="timeline-section">
          <h4>{agentName}의 시간 흐름</h4>
          <TimelinePanel
            data={response.timeline}
            theme="dark"
            labels={{ title: '시간 흐름' }}
          />
        </div>
      )}
    </div>
  )
}
```

### Agent 설정 (Collection 지정)

```typescript
// Agent 정의 시 preferredCollectionId 추가
const agents = [
  {
    id: 'agent-crypto-expert',
    name: 'Crypto Expert',
    preferredCollectionId: 'crypto-news-2024',  // TKG 컬렉션 사용
  },
  {
    id: 'agent-realtime',
    name: 'Realtime Analyst',
    preferredCollectionId: null,  // 웹 검색 사용 (그래프 없음)
  },
]
```

## ⚡ Advanced Usage

### 동적 검색 모드 선택

질문 유형에 따라 검색 모드를 자동 선택:

```typescript
function selectSearchMode(query: string): 'dg' | 'tkg' {
  const temporalKeywords = ['언제', '최근', '변화', '추세', '역사', '과거']

  if (temporalKeywords.some(kw => query.includes(kw))) {
    return 'tkg'  // 시간 관련 질문 → TKG + 타임라인
  }

  return 'dg'  // 일반 질문 → DG 그래프
}

const searchMode = selectSearchMode(request.title)
```

### Timeout 설정

```typescript
const controller = new AbortController()
const timeoutId = setTimeout(() => controller.abort(), 10000) // 10초

try {
  const response = await fetch(url, {
    signal: controller.signal,
    ...options,
  })
  clearTimeout(timeoutId)
} catch (error) {
  if (error.name === 'AbortError') {
    throw new Error('Factagora API timeout (10초 초과)')
  }
  throw error
}
```

### Retry 로직

```typescript
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options)
      if (response.ok) return response

      if (response.status >= 500 && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
        continue
      }

      return response
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}
```

### 그래프 커스터마이징

```typescript
<GraphPanel
  data={graph}
  theme="dark"

  // 노드 스타일 커스터마이징
  nodeStyles={{
    entity: { color: '#3b82f6', size: 20 },
    discovery: { color: '#10b981', size: 25 },
  }}

  // 이벤트 핸들러
  onNodeClick={(node) => {
    console.log('Node clicked:', node)
    // 상세 정보 모달 열기 등
  }}

  onEdgeClick={(edge) => {
    console.log('Edge clicked:', edge)
  }}

  // 레이블 다국어화
  labels={{
    nodeDetail: 'View Details',
    zoom: 'Zoom In/Out',
    reset: 'Reset View',
  }}
/>
```

## 🐛 Error Handling

### 네트워크 에러

```typescript
try {
  const searchResult = await this.searchFactagoraGraph(request)
} catch (error) {
  if (error.message.includes('fetch')) {
    logger.error('Factagora API 연결 실패', { error })

    // Fallback: 그래프 없이 계속 진행
    return {
      graph: null,
      timeline: null,
      factblocks: [],
    }
  }
  throw error
}
```

### API 에러 처리

```typescript
if (!response.ok) {
  const errorData = await response.json().catch(() => ({}))

  // 인증 에러
  if (response.status === 401 || response.status === 403) {
    throw new Error('Factagora API 인증 실패. API 키를 확인하세요.')
  }

  // 검증 에러
  if (response.status === 400) {
    throw new Error(`잘못된 요청: ${errorData.error?.message}`)
  }

  // 서버 에러
  throw new Error(`Factagora API 에러: ${response.status}`)
}
```

### 빈 결과 처리

API가 자동으로 Fallback을 처리하므로, 빈 결과는 거의 발생하지 않습니다:

```typescript
// collectionId가 있어도 결과가 0개면 자동으로 웹 검색으로 전환됨
{
  "data": {
    "graph": null,
    "factblocks": [웹 검색 결과...],
    "metadata": {
      "searchSource": "web",  // Fallback 발생
    }
  }
}
```

UI에서는 그래프 유무만 체크:

```typescript
{response.graph ? (
  <GraphPanel data={response.graph} />
) : (
  <p>그래프를 생성할 수 없습니다 (웹 검색 결과)</p>
)}
```

## ❓ FAQ

### Q1. Agent가 여러 개일 때 어떻게 되나요?

**A**: 각 Agent가 **독립적으로** API를 호출합니다.

```
Agent A (collection: "crypto-news") → TKG 그래프 A
Agent B (collection: null) → 웹 검색 (그래프 없음)
Agent C (collection: "finance-data") → TKG 그래프 C
```

각 Agent Card에 자신만의 그래프가 표시됩니다.

### Q2. 웹 검색은 왜 그래프가 없나요?

**A**: TKG (Temporal Knowledge Graph)는 **Factagora의 핵심 차별화 기술**입니다.

웹 검색 결과는 단순 텍스트 검색이므로 FactBlock 간 **관계 정보**가 없어 그래프를 생성할 수 없습니다.

### Q3. DG vs TKG 중 어떤 걸 사용해야 하나요?

**A**:

| 모드 | 용도 | 그래프 | 타임라인 | 속도 |
|------|------|--------|----------|------|
| **DG** | 일반 문서 검색 | ✅ | ❌ | 빠름 |
| **TKG** | 시간 흐름 중요한 질문 | ✅ | ✅ | 느림 |

**권장**: 기본값 `"dg"` 사용. 시간 관련 키워드 감지되면 `"tkg"` 전환.

### Q4. API 응답이 느릴 때 어떻게 하나요?

**A**:

1. **Timeout 설정** (10초)
2. **로딩 상태 UI** 표시
3. **Fallback**: 그래프 없이 계속 진행

```typescript
const [loading, setLoading] = useState(false)

setLoading(true)
try {
  const result = await fetchWithTimeout(url, options, 10000)
} catch (error) {
  // Fallback: 그래프 없이 진행
} finally {
  setLoading(false)
}
```

### Q5. collectionId는 어떻게 설정하나요?

**A**: Agent 정의 시 `preferredCollectionId` 추가:

```typescript
const agent = {
  id: 'agent-crypto',
  preferredCollectionId: 'crypto-news-2024',  // 특정 컬렉션
}

const agent2 = {
  id: 'agent-web',
  preferredCollectionId: null,  // 웹 검색
}
```

### Q6. 그래프가 너무 복잡할 때는?

**A**: `topK` 값을 줄이거나 `similarityThreshold`를 높이세요:

```typescript
{
  query: "...",
  topK: 10,              // 30 → 10 (노드 수 감소)
  similarityThreshold: 0.8,  // 0.7 → 0.8 (필터링 강화)
}
```

### Q7. 타임라인 아이템이 너무 많을 때는?

**A**: TKG 검색은 자동으로 주요 관계만 선택합니다. 추가 필터링이 필요하면 백엔드 팀에 문의하세요.

## 🔧 Troubleshooting

### API 키 오류

```
❌ Error: Factagora API error: 401
```

**해결**:
1. `.env.local`에 `FACTAGORA_API_KEY` 설정 확인
2. API 키가 유효한지 Factagora 팀에 확인

### CORS 에러

```
❌ Access-Control-Allow-Origin error
```

**해결**:
- API는 **서버 사이드**에서만 호출해야 합니다
- 클라이언트(브라우저)에서 직접 호출 금지

### GraphPanel 렌더링 오류

```
❌ Error: Cannot read property 'nodes' of null
```

**해결**:
```typescript
{response.graph && response.graph.nodes && (
  <GraphPanel data={response.graph} />
)}
```

### npm 패키지 설치 실패

```
❌ 404 Not Found - GET https://npm.pkg.github.com/@factagora/types
```

**해결**:
1. `.npmrc` 파일 생성 확인
2. `GITHUB_TOKEN` 환경변수 설정
3. GitHub Packages 접근 권한 확인

## 🎯 핵심 차별화

### TKG 그래프는 컬렉션에만 생성됩니다

| 검색 소스 | FactBlock | Graph | Timeline | 설명 |
|----------|-----------|-------|----------|------|
| **컬렉션 (DB)** | TKG 데이터 | ✅ | ✅ (TKG) | **핵심 기술** |
| **웹 검색** | 웹 결과 | ❌ | ❌ | 단순 검색 |

**이유**: TKG (Temporal Knowledge Graph) 기반 그래프 시각화가 Factagora의 **핵심 차별화 기술**입니다.

## 📚 추가 리소스

- [Factagora 챗봇 백엔드 GitHub](https://github.com/factagora/chatbot)
- [API 상세 문서](https://api.factagora.com/docs)
- [@factagora/types 타입 정의](https://github.com/factagora/factagora-packages)
- [@factagora/chatbot-viz 컴포넌트](https://github.com/factagora/factagora-packages)

## 🤝 지원

- 기술 지원: Factagora Slack #chatbot-integration
- 이슈 제기: [GitHub Issues](https://github.com/factagora/chatbot/issues)
- 문의: dev@factagora.com

---

**관련 문서:**
- [메인 README](../README.md) - 패키지 상세 가이드
- [live-article 통합](./live-article.md) - 기본 챗봇
- [chrome-extension 통합](./chrome-extension.md) - 크롬 익스텐션
- [chatgpt-apps 통합](./chatgpt-apps.md) - ChatGPT Apps
