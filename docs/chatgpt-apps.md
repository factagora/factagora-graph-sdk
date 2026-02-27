# ChatGPT Apps / GPT Actions 통합 가이드

이 문서는 **ChatGPT Apps (GPT Actions)**에서 Factagora API를 통합하는 방법을 설명합니다.

## ✨ GPT Actions 개요

GPT Actions를 사용하면 ChatGPT가 외부 API를 호출하여 실시간 데이터를 가져올 수 있습니다. Factagora API와 통합하면:

- 🔍 **지식 그래프 검색**: TKG/DG 기반 검색 결과
- 📊 **구조화된 데이터**: GraphData, TimelineData 반환
- 🎯 **맥락 기반 응답**: FactBlock 기반 답변 생성

## 🚀 Quick Start

### 1. API 서버 구축 (필수)

GPT Actions는 **OpenAPI 스키마**를 사용하므로, Factagora API를 래핑하는 서버가 필요합니다.

```typescript
// server/api/factblocks/search.ts (Next.js API Route 예시)

import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { query, collectionId, searchMode, topK } = req.body

  try {
    // Factagora API 호출
    const response = await fetch('https://api.factagora.com/factblocks/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Key': process.env.FACTAGORA_API_KEY!,
      },
      body: JSON.stringify({
        query,
        collectionId: collectionId || null,
        searchMode: searchMode || 'dg',
        topK: topK || 30,
      }),
    })

    if (!response.ok) {
      throw new Error(`Factagora API error: ${response.status}`)
    }

    const data = await response.json()
    return res.status(200).json(data)
  } catch (error) {
    console.error('Search error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    })
  }
}
```

### 2. OpenAPI 스키마 작성

```yaml
openapi: 3.0.0
info:
  title: Factagora Search API
  version: 1.0.0
  description: TKG 기반 지식 그래프 검색 API

servers:
  - url: https://your-domain.com/api
    description: Production server

paths:
  /factblocks/search:
    post:
      operationId: searchFactblocks
      summary: FactBlock 검색
      description: |
        질문에 대한 FactBlock을 검색하고 TKG 그래프를 생성합니다.
        collectionId가 null이면 웹 검색을 수행합니다.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - query
              properties:
                query:
                  type: string
                  description: 검색 쿼리
                  example: "Bitcoin price prediction 2026"
                collectionId:
                  type: string
                  nullable: true
                  description: 컬렉션 ID (null이면 웹 검색)
                  example: "crypto-news-2024"
                searchMode:
                  type: string
                  enum: [dg, tkg]
                  default: dg
                  description: 검색 모드 (dg 또는 tkg)
                topK:
                  type: integer
                  minimum: 1
                  maximum: 100
                  default: 30
                  description: 최대 결과 수

      responses:
        '200':
          description: 검색 성공
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: object
                    properties:
                      graph:
                        type: object
                        nullable: true
                        description: TKG 그래프 (컬렉션 검색만)
                        properties:
                          nodes:
                            type: array
                            items:
                              type: object
                          edges:
                            type: array
                            items:
                              type: object
                      timeline:
                        type: object
                        nullable: true
                        description: 타임라인 (TKG 모드만)
                      factblocks:
                        type: array
                        description: 검색된 FactBlock 목록
                        items:
                          type: object
                          properties:
                            id:
                              type: string
                            content:
                              type: string
                            confidence:
                              type: number
                            sources:
                              type: array
                              items:
                                type: string
                      metadata:
                        type: object
                        properties:
                          totalResults:
                            type: integer
                          searchMode:
                            type: string
                          searchSource:
                            type: string
                            enum: [collection, web]
        '400':
          description: 잘못된 요청
        '500':
          description: 서버 오류
```

### 3. GPT Actions 설정

ChatGPT GPT Builder에서:

1. **GPT 생성**
2. **Configure > Actions** 클릭
3. **Import from URL** 또는 **Schema** 입력
4. **Authentication**: None (API 키는 서버에서 처리)
5. **Save**

### 4. Instructions 작성

```
You are a Factagora GPT that provides knowledge graph-based answers.

When a user asks a question:
1. Use the searchFactblocks action to search for relevant FactBlocks
2. Analyze the returned factblocks and graph data
3. Provide a comprehensive answer based on the search results
4. If a graph is returned, mention the number of nodes and edges
5. Cite sources from the factblocks array

Always prioritize accuracy and cite your sources.
```

## 🎨 고급 설정

### 인증 추가 (선택사항)

API 서버에 인증을 추가하려면:

```typescript
// API Route with API Key validation
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // API Key 검증
  const apiKey = req.headers['x-api-key']
  if (apiKey !== process.env.GPT_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // ... Factagora API 호출
}
```

OpenAPI 스키마에 인증 추가:

```yaml
components:
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key

security:
  - ApiKeyAuth: []
```

GPT Actions 설정:
- **Authentication**: API Key
- **Auth Type**: Custom
- **Header Name**: `X-API-Key`
- **API Key**: `your-gpt-api-key`

### 여러 Action 추가

```yaml
paths:
  /factblocks/search:
    post:
      operationId: searchFactblocks
      # ... (위와 동일)

  /sessions:
    get:
      operationId: listSessions
      summary: 세션 목록 조회
      parameters:
        - name: collectionId
          in: query
          schema:
            type: string
      responses:
        '200':
          description: 세션 목록
          content:
            application/json:
              schema:
                type: object
                properties:
                  sessions:
                    type: array
                    items:
                      type: object

  /sessions/{sessionId}:
    get:
      operationId: getSession
      summary: 세션 상세 조회
      parameters:
        - name: sessionId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: 세션 상세 정보
```

## 💡 사용 예시

### 예시 1: 간단한 검색

**사용자 질문:**
> "Bitcoin의 최근 가격 동향을 알려줘"

**GPT 내부 동작:**
```json
// Action: searchFactblocks
{
  "query": "Bitcoin price trends",
  "collectionId": "crypto-news-2024",
  "searchMode": "dkg",
  "topK": 10
}
```

**응답:**
```
Bitcoin의 최근 가격 동향을 분석한 결과:

1. [FactBlock 내용 요약...]
2. [FactBlock 내용 요약...]

이 정보는 12개의 노드와 15개의 엣지로 구성된 지식 그래프에서 가져왔습니다.

출처:
- https://source1.com
- https://source2.com
```

### 예시 2: 복잡한 질의

**사용자 질문:**
> "AI 업계의 주요 동향과 관련 기업들을 시간순으로 정리해줘"

**GPT 내부 동작:**
```json
{
  "query": "AI industry trends and companies timeline",
  "collectionId": "tech-news",
  "searchMode": "tkg",
  "topK": 30
}
```

**응답:**
```
AI 업계의 주요 동향 타임라인:

[2023-01]
- OpenAI, ChatGPT 출시
- Microsoft, OpenAI에 100억 달러 투자

[2023-06]
- Anthropic, Claude 2 출시
- Google, Bard 정식 출시

... (타임라인 데이터 기반 설명)

이 분석은 45개 엔티티, 120개 관계로 구성된 시간 지식 그래프(TKG)를 기반으로 합니다.
```

## 🔍 디버깅

### Action 테스트

GPT Builder의 **Test** 기능 사용:

```
Test Action: searchFactblocks
Input:
{
  "query": "test query",
  "collectionId": null,
  "searchMode": "dg"
}
```

### 서버 로그 확인

```typescript
// API Route에 로깅 추가
console.log('GPT Request:', {
  query: req.body.query,
  collectionId: req.body.collectionId,
  timestamp: new Date().toISOString()
})

console.log('Factagora Response:', {
  totalResults: data.data.metadata.totalResults,
  searchSource: data.data.metadata.searchSource
})
```

### CORS 이슈

GPT Actions는 서버 사이드에서 호출되므로 CORS 문제가 없지만, 개발 중 테스트 시 CORS 설정이 필요할 수 있습니다:

```typescript
// Next.js API Route CORS 설정
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // ... API 로직
}
```

## ⚠️ 제한사항

### GPT Actions 제약

- ❌ **그래프 시각화 불가**: ChatGPT UI에서 그래프 렌더링 불가 (텍스트로만 설명 가능)
- ❌ **타임라인 시각화 불가**: 타임라인 데이터를 텍스트로 변환해야 함
- ✅ **구조화된 데이터 활용 가능**: JSON 데이터를 분석하여 답변 생성 가능
- ⚠️ **응답 크기 제한**: OpenAPI 응답이 너무 크면 타임아웃 발생 가능

### 권장 사항

1. **topK 제한**: 30 이하 권장 (응답 크기 최소화)
2. **타임아웃 설정**: API 서버에서 10초 타임아웃 설정
3. **에러 핸들링**: 명확한 에러 메시지 반환
4. **Rate Limiting**: API 호출 빈도 제한

## 🎯 Best Practices

### 1. Instructions 최적화

```
You are a Factagora Knowledge Graph GPT.

IMPORTANT RULES:
1. ALWAYS use searchFactblocks action for factual questions
2. NEVER make up information - only use data from search results
3. ALWAYS cite sources from the factblocks array
4. If graph data is available, mention the graph structure (nodes/edges count)
5. If no results are found, inform the user and suggest alternative queries

RESPONSE FORMAT:
1. Direct answer to the question
2. Supporting evidence from factblocks
3. Graph metadata (if available)
4. Source citations
```

### 2. 검색 모드 자동 선택

```
When determining search mode:
- Use "tkg" for temporal questions (trends, history, timelines)
- Use "dg" for general factual questions
```

### 3. Fallback 처리

```
If searchSource is "web" (fallback occurred):
- Inform the user that results are from web search, not knowledge graph
- Mention that graph visualization is not available
- Suggest more specific queries
```

## 📚 추가 참고

- [OpenAI GPT Actions 문서](https://platform.openai.com/docs/actions)
- [OpenAPI Specification](https://swagger.io/specification/)
- [메인 README](../README.md) - API 상세 가이드

## 🤝 예제 프로젝트

### Next.js API Route 전체 예시

```typescript
// pages/api/factblocks/search.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import type { FactBlockSearchRequest, FactBlockSearchResponse } from '@factagora/types'

const FACTAGORA_API_URL = process.env.FACTAGORA_API_URL || 'https://api.factagora.com'
const FACTAGORA_API_KEY = process.env.FACTAGORA_API_KEY

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FactBlockSearchResponse | { error: string }>
) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // API Key 검증 (선택사항)
  const apiKey = req.headers['x-api-key']
  if (process.env.GPT_API_KEY && apiKey !== process.env.GPT_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { query, collectionId, searchMode, topK, similarityThreshold } = req.body as FactBlockSearchRequest

  // 입력 검증
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Invalid query' })
  }

  console.log('GPT Search Request:', {
    query,
    collectionId,
    searchMode,
    topK,
    timestamp: new Date().toISOString()
  })

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10초 타임아웃

    const response = await fetch(`${FACTAGORA_API_URL}/factblocks/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Key': FACTAGORA_API_KEY!,
      },
      body: JSON.stringify({
        query,
        collectionId: collectionId || null,
        searchMode: searchMode || 'dg',
        topK: Math.min(topK || 30, 50),  // 최대 50개로 제한
        similarityThreshold: similarityThreshold || 0.7,
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Factagora API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
    }

    const data: FactBlockSearchResponse = await response.json()

    console.log('Factagora Response:', {
      totalResults: data.data.metadata.totalResults,
      searchSource: data.data.metadata.searchSource,
      hasGraph: !!data.data.graph,
      hasTimeline: !!data.data.timeline
    })

    return res.status(200).json(data)
  } catch (error: any) {
    console.error('Search error:', error)

    if (error.name === 'AbortError') {
      return res.status(504).json({ error: 'Request timeout' })
    }

    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    })
  }
}
```

---

**관련 문서:**
- [메인 README](../README.md) - 패키지 상세 가이드
- [live-article 통합](./live-article.md) - 기본 챗봇
- [social-network 통합](./social-network.md) - AI 예측 에이전트
- [chrome-extension 통합](./chrome-extension.md) - 크롬 익스텐션
