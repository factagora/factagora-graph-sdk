import type { GraphData, TimelineData } from '@factagora/types'

/**
 * DG (Document Graph) Mock Data - Argument Map 구조
 * TreeGraph로 렌더링 (dagre LR 레이아웃)
 */
export const mockDGGraphData: GraphData = {
  nodes: [
    // Root Claim
    {
      id: 'claim-root-1',
      label: 'AI가 2027년까지 대부분의 코딩 작업을 대체할 것이다',
      type: 'claim',
      confidence: 0.75,
      isDirectMatch: true,
      content: 'AI가 2027년까지 대부분의 코딩 작업을 대체할 것이다. 생성형 AI의 발전으로 코드 작성 자동화가 급속도로 진행되고 있다.',
      sources: ['https://example.com/ai-coding-future'],
      tags: ['AI', 'Coding', 'Automation', 'Prediction'],
      metadata: {
        origin_type: 'USER_CREATED',
        verification_status: 'PENDING',
        verdict: null,
        verdict_date: null,
        challenge_count: 0,
      },
      validationCreatedAt: '2024-01-15T00:00:00Z',
      validationEndedAt: null,
    },
    // Sub-claim 1: SUPPORTS
    {
      id: 'claim-sub-1',
      label: 'GitHub Copilot 사용자의 55%가 생산성 향상 보고',
      type: 'claim',
      confidence: 0.85,
      isDirectMatch: false,
      content: 'GitHub의 공식 조사에 따르면 Copilot 사용자의 55%가 코딩 생산성이 향상되었다고 보고했다.',
      sources: ['https://example.com/github-copilot-survey'],
      tags: ['GitHub Copilot', 'Productivity', 'Survey'],
      metadata: {
        origin_type: 'AGENT_DERIVED',
        verification_status: 'VERIFIED_TRUE',
        verdict: 'TRUE',
        verdict_date: '2024-01-20T00:00:00Z',
        challenge_count: 0,
      },
      validationCreatedAt: '2024-01-18T00:00:00Z',
      validationEndedAt: null,
    },
    // Sub-claim 2: CONTRADICTS
    {
      id: 'claim-sub-2',
      label: '창의적 설계 작업은 AI 자동화가 어렵다',
      type: 'claim',
      confidence: 0.72,
      isDirectMatch: false,
      content: '소프트웨어 아키텍처 설계나 복잡한 비즈니스 로직 구현 같은 창의적 작업은 AI가 자동화하기 어렵다.',
      sources: ['https://example.com/ai-limitations'],
      tags: ['Architecture', 'Creativity', 'Limitations'],
      metadata: {
        origin_type: 'AGENT_DERIVED',
        verification_status: 'PENDING',
        verdict: null,
        verdict_date: null,
        challenge_count: 1,
      },
      validationCreatedAt: '2024-01-19T00:00:00Z',
      validationEndedAt: null,
    },
    // Sub-claim 3: QUALIFIES
    {
      id: 'claim-sub-3',
      label: '특정 도메인에서만 유효한 주장',
      type: 'claim',
      confidence: 0.60,
      isDirectMatch: false,
      content: 'AI 코딩 자동화는 웹 개발이나 데이터 처리 같은 특정 도메인에서는 효과적이지만, 임베디드 시스템이나 보안 소프트웨어에서는 제한적이다.',
      sources: ['https://example.com/domain-specific'],
      tags: ['Domain Specific', 'Web Development', 'Embedded'],
      metadata: {
        origin_type: 'AGENT_DERIVED',
        verification_status: 'PENDING',
        verdict: null,
        verdict_date: null,
        challenge_count: 0,
      },
      validationCreatedAt: '2024-01-21T00:00:00Z',
      validationEndedAt: null,
    },
    // Sub-claim 4: SUPPORTS
    {
      id: 'claim-sub-4',
      label: 'AI 코드 생성 도구 시장이 급성장하고 있다',
      type: 'claim',
      confidence: 0.88,
      isDirectMatch: false,
      content: '2023년 AI 코드 생성 도구 시장 규모가 전년 대비 300% 증가했다.',
      sources: ['https://example.com/market-growth'],
      tags: ['Market', 'Growth', 'Statistics'],
      metadata: {
        origin_type: 'AGENT_DERIVED',
        verification_status: 'VERIFIED_TRUE',
        verdict: 'PARTIALLY_TRUE',
        verdict_date: '2024-01-22T00:00:00Z',
        challenge_count: 0,
      },
      validationCreatedAt: '2024-01-20T00:00:00Z',
      validationEndedAt: null,
    },
    // Sub-claim 5: CONTRADICTS
    {
      id: 'claim-sub-5',
      label: '현재 AI는 버그 없는 코드를 100% 생성할 수 없다',
      type: 'claim',
      confidence: 0.45,
      isDirectMatch: false,
      content: 'AI 생성 코드에는 여전히 버그가 존재하며, 인간의 검토가 필수적이다.',
      sources: ['https://example.com/ai-bugs'],
      tags: ['Bugs', 'Quality', 'Review'],
      metadata: {
        origin_type: 'AGENT_DERIVED',
        verification_status: 'VERIFIED_FALSE',
        verdict: 'FALSE',
        verdict_date: '2024-01-23T00:00:00Z',
        challenge_count: 2,
      },
      validationCreatedAt: '2024-01-21T00:00:00Z',
      validationEndedAt: null,
    },
  ],
  edges: [
    { source: 'claim-sub-1', target: 'claim-root-1', relationship: 'SUPPORTS', weight: 0.85 },
    { source: 'claim-sub-2', target: 'claim-root-1', relationship: 'CONTRADICTS', weight: 0.72 },
    { source: 'claim-sub-3', target: 'claim-root-1', relationship: 'QUALIFIES', weight: 0.60 },
    { source: 'claim-sub-4', target: 'claim-root-1', relationship: 'SUPPORTS', weight: 0.88 },
    { source: 'claim-sub-5', target: 'claim-root-1', relationship: 'CONTRADICTS', weight: 0.45 },
  ],
  metadata: {
    graphType: 'argument_map',
    expansionDepth: 1,
    totalNodes: 6,
    directMatchCount: 1,
    expandedCount: 5,
    allowedRelationshipTypes: ['SUPPORTS', 'CONTRADICTS', 'QUALIFIES'],
  },
}

/**
 * TKG (Temporal Knowledge Graph) Mock Data - Argument Map 구조
 * ForceGraph로 렌더링 (force-directed + hop-based LR 레이아웃)
 */
export const mockTKGGraphData: GraphData = {
  nodes: [
    // Root Claim (hop 0)
    {
      id: 'claim-root-1',
      label: 'AI가 2027년까지 대부분의 코딩 작업을 대체할 것이다',
      type: 'claim',
      confidence: 0.75,
      isDirectMatch: true,
      content: 'AI가 2027년까지 대부분의 코딩 작업을 대체할 것이다. 생성형 AI의 발전으로 코드 작성 자동화가 급속도로 진행되고 있다.',
      sources: ['https://example.com/ai-coding-future'],
      tags: ['AI', 'Coding', 'Automation', 'Prediction'],
      metadata: {
        hopDistance: 0,
        isDiscoveryNode: false,
        similarity: 0.75,
        pathConfidence: 0.75,
        origin_type: 'USER_CREATED',
        verification_status: 'PENDING',
        verdict: null,
        verdict_date: null,
        challenge_count: 0,
      },
      validationCreatedAt: '2024-01-15T00:00:00Z',
      validationEndedAt: null,
    },
    // Sub-claim 1: SUPPORTS (hop 1)
    {
      id: 'claim-sub-1',
      label: 'GitHub Copilot 사용자의 55%가 생산성 향상 보고',
      type: 'claim',
      confidence: 0.85,
      isDirectMatch: false,
      content: 'GitHub의 공식 조사에 따르면 Copilot 사용자의 55%가 코딩 생산성이 향상되었다고 보고했다.',
      sources: ['https://example.com/github-copilot-survey'],
      tags: ['GitHub Copilot', 'Productivity', 'Survey'],
      metadata: {
        hopDistance: 1,
        isDiscoveryNode: false,
        similarity: null,
        pathConfidence: 0.85,
        origin_type: 'AGENT_DERIVED',
        verification_status: 'VERIFIED_TRUE',
        verdict: 'TRUE',
        verdict_date: '2024-01-20T00:00:00Z',
        challenge_count: 0,
      },
      validationCreatedAt: '2024-01-18T00:00:00Z',
      validationEndedAt: null,
    },
    // Sub-claim 2: CONTRADICTS (hop 1)
    {
      id: 'claim-sub-2',
      label: '창의적 설계 작업은 AI 자동화가 어렵다',
      type: 'claim',
      confidence: 0.72,
      isDirectMatch: false,
      content: '소프트웨어 아키텍처 설계나 복잡한 비즈니스 로직 구현 같은 창의적 작업은 AI가 자동화하기 어렵다.',
      sources: ['https://example.com/ai-limitations'],
      tags: ['Architecture', 'Creativity', 'Limitations'],
      metadata: {
        hopDistance: 1,
        isDiscoveryNode: true,
        similarity: null,
        pathConfidence: 0.72,
        origin_type: 'AGENT_DERIVED',
        verification_status: 'PENDING',
        verdict: null,
        verdict_date: null,
        challenge_count: 1,
      },
      validationCreatedAt: '2024-01-19T00:00:00Z',
      validationEndedAt: null,
    },
    // Sub-claim 3: QUALIFIES (hop 1)
    {
      id: 'claim-sub-3',
      label: '특정 도메인에서만 유효한 주장',
      type: 'claim',
      confidence: 0.60,
      isDirectMatch: false,
      content: 'AI 코딩 자동화는 웹 개발이나 데이터 처리 같은 특정 도메인에서는 효과적이지만, 임베디드 시스템이나 보안 소프트웨어에서는 제한적이다.',
      sources: ['https://example.com/domain-specific'],
      tags: ['Domain Specific', 'Web Development', 'Embedded'],
      metadata: {
        hopDistance: 1,
        isDiscoveryNode: false,
        similarity: null,
        pathConfidence: 0.60,
        origin_type: 'AGENT_DERIVED',
        verification_status: 'PENDING',
        verdict: null,
        verdict_date: null,
        challenge_count: 0,
      },
      validationCreatedAt: '2024-01-21T00:00:00Z',
      validationEndedAt: null,
    },
    // Sub-claim 4: SUPPORTS (hop 1)
    {
      id: 'claim-sub-4',
      label: 'AI 코드 생성 도구 시장이 급성장하고 있다',
      type: 'claim',
      confidence: 0.88,
      isDirectMatch: false,
      content: '2023년 AI 코드 생성 도구 시장 규모가 전년 대비 300% 증가했다.',
      sources: ['https://example.com/market-growth'],
      tags: ['Market', 'Growth', 'Statistics'],
      metadata: {
        hopDistance: 1,
        isDiscoveryNode: true,
        similarity: null,
        pathConfidence: 0.88,
        origin_type: 'AGENT_DERIVED',
        verification_status: 'VERIFIED_TRUE',
        verdict: 'PARTIALLY_TRUE',
        verdict_date: '2024-01-22T00:00:00Z',
        challenge_count: 0,
      },
      validationCreatedAt: '2024-01-20T00:00:00Z',
      validationEndedAt: null,
    },
    // Sub-claim 5: CONTRADICTS (hop 1)
    {
      id: 'claim-sub-5',
      label: '현재 AI는 버그 없는 코드를 100% 생성할 수 없다',
      type: 'claim',
      confidence: 0.45,
      isDirectMatch: false,
      content: 'AI 생성 코드에는 여전히 버그가 존재하며, 인간의 검토가 필수적이다.',
      sources: ['https://example.com/ai-bugs'],
      tags: ['Bugs', 'Quality', 'Review'],
      metadata: {
        hopDistance: 1,
        isDiscoveryNode: false,
        similarity: null,
        pathConfidence: 0.45,
        origin_type: 'AGENT_DERIVED',
        verification_status: 'VERIFIED_FALSE',
        verdict: 'FALSE',
        verdict_date: '2024-01-23T00:00:00Z',
        challenge_count: 2,
      },
      validationCreatedAt: '2024-01-21T00:00:00Z',
      validationEndedAt: null,
    },
  ],
  edges: [
    { source: 'claim-sub-1', target: 'claim-root-1', relationship: 'SUPPORTS', weight: 0.85 },
    { source: 'claim-sub-2', target: 'claim-root-1', relationship: 'CONTRADICTS', weight: 0.72 },
    { source: 'claim-sub-3', target: 'claim-root-1', relationship: 'QUALIFIES', weight: 0.60 },
    { source: 'claim-sub-4', target: 'claim-root-1', relationship: 'SUPPORTS', weight: 0.88 },
    { source: 'claim-sub-5', target: 'claim-root-1', relationship: 'CONTRADICTS', weight: 0.45 },
  ],
  metadata: {
    graphType: 'argument_map',
    totalNodes: 6,
    totalEdges: 5,
    hopDistribution: { '0': 1, '1': 5 },
    discoveryCount: 2,
    maxHopsUsed: 1,
    maxHopsConfig: 3,
    maxNodesConfig: 50,
    avgPathConfidence: 0.70,
  },
}

/**
 * Timeline Mock Data
 * - TKG 타임라인 데이터
 * - entity별 relation 시간축 표시
 */
export const mockTimelineData: TimelineData = {
  groups: [
    {
      id: 'entity-1',
      content: '삼성전자',
      title: '삼성전자 (Samsung Electronics)',
      data: {
        entityType: 'company',
        entityName: '삼성전자',
        entityCanonicalId: 'samsung-electronics',
      },
    },
    {
      id: 'entity-2',
      content: 'SK하이닉스',
      title: 'SK하이닉스 (SK Hynix)',
      data: {
        entityType: 'company',
        entityName: 'SK하이닉스',
        entityCanonicalId: 'sk-hynix',
      },
    },
    {
      id: 'entity-3',
      content: 'NVIDIA',
      title: 'NVIDIA Corporation',
      data: {
        entityType: 'company',
        entityName: 'NVIDIA',
        entityCanonicalId: 'nvidia',
      },
    },
  ],
  items: [
    {
      id: 'rel-1',
      content: '반도체 영업이익 회복',
      group: 'entity-1',
      start: '2024-01-01T00:00:00Z',
      end: null,
      title: '삼성전자 반도체 부문 영업이익 회복세 (2024 Q1~)',
      className: 'timeline-item-fact',
      data: {
        relType: '영업실적',
        confidence: 0.95,
        subjectName: '삼성전자',
        objectName: '반도체 부문',
        objectCanonicalId: 'samsung-semiconductor-division',
        factblockIds: ['fb-123', 'fb-124'],
      },
    },
    {
      id: 'rel-2',
      content: 'HBM3E 양산 시작',
      group: 'entity-2',
      start: '2024-02-01T00:00:00Z',
      end: null,
      title: 'SK하이닉스 HBM3E 양산 시작 (2024 Q1~)',
      className: 'timeline-item-fact',
      data: {
        relType: '제품출시',
        confidence: 0.93,
        subjectName: 'SK하이닉스',
        objectName: 'HBM3E',
        objectCanonicalId: 'hbm3e',
        factblockIds: ['fb-125'],
      },
    },
    {
      id: 'rel-3',
      content: 'H100 GPU 출시',
      group: 'entity-3',
      start: '2023-03-01T00:00:00Z',
      end: null,
      title: 'NVIDIA H100 GPU 출시 (2023 Q1~)',
      className: 'timeline-item-fact',
      data: {
        relType: '제품출시',
        confidence: 0.90,
        subjectName: 'NVIDIA',
        objectName: 'H100 GPU',
        objectCanonicalId: 'nvidia-h100',
        factblockIds: ['fb-126', 'fb-127'],
      },
    },
    {
      id: 'rel-4',
      content: 'AI 수요 증가',
      group: 'entity-1',
      start: '2023-11-01T00:00:00Z',
      end: null,
      title: '생성형 AI로 인한 메모리 반도체 수요 증가 (2023 Q4~)',
      className: 'timeline-item-analysis',
      data: {
        relType: '시장동향',
        confidence: 0.88,
        subjectName: '삼성전자',
        objectName: 'AI 메모리 수요',
        objectCanonicalId: 'ai-memory-demand',
        factblockIds: ['fb-128'],
      },
    },
  ],
  metadata: {
    entityCount: 3,
    relationCount: 4,
    totalRelationsFound: 4,
    relationsWithoutPeriod: 0,
  },
}

/**
 * 간단한 DG GraphData (테스트용)
 */
export const mockSimpleDGGraph: GraphData = {
  nodes: [
    {
      id: 'simple-1',
      label: 'Root Node',
      type: 'fact',
      confidence: 1.0,
      isDirectMatch: true,
      content: 'This is the root node',
      sources: ['https://example.com/root'],
      tags: ['root'],
      metadata: null,
      validationCreatedAt: '2024-01-01T00:00:00Z',
      validationEndedAt: null,
    },
    {
      id: 'simple-2',
      label: 'Child Node 1',
      type: 'fact',
      confidence: 0.9,
      isDirectMatch: false,
      content: 'First child node',
      sources: ['https://example.com/child1'],
      tags: ['child'],
      metadata: null,
      validationCreatedAt: '2024-01-02T00:00:00Z',
      validationEndedAt: null,
    },
    {
      id: 'simple-3',
      label: 'Child Node 2',
      type: 'analysis',
      confidence: 0.85,
      isDirectMatch: false,
      content: 'Second child node',
      sources: ['https://example.com/child2'],
      tags: ['child'],
      metadata: null,
      validationCreatedAt: '2024-01-03T00:00:00Z',
      validationEndedAt: null,
    },
  ],
  edges: [
    { source: 'simple-1', target: 'simple-2', relationship: 'supports', weight: 0.9 },
    { source: 'simple-1', target: 'simple-3', relationship: 'supports', weight: 0.85 },
  ],
  metadata: {
    graphType: 'document_graph',
    expansionDepth: 1,
    totalNodes: 3,
    directMatchCount: 1,
    expandedCount: 2,
    allowedRelationshipTypes: ['supports'],
  },
}

/**
 * Argument Map Mock Data (based on docs/argument-map-data.md)
 * - Parent Claim과 Sub-claims의 관계 표현
 * - edge_type: SUPPORTS, CONTRADICTS, QUALIFIES
 * - verdict: TRUE, FALSE, PARTIALLY_TRUE, null (open)
 */
export const mockArgumentMapGraph: GraphData = {
  nodes: [
    // Root Claim (Parent)
    {
      id: 'claim-root-1',
      label: 'AI가 2027년까지 대부분의 코딩 작업을 대체할 것이다',
      type: 'claim',
      confidence: 0.75,
      isDirectMatch: true,
      content: 'AI가 2027년까지 대부분의 코딩 작업을 대체할 것이다. 생성형 AI의 발전으로 코드 작성 자동화가 급속도로 진행되고 있다.',
      sources: ['https://example.com/ai-coding-future'],
      tags: ['AI', 'Coding', 'Automation', 'Prediction'],
      metadata: {
        origin_type: 'USER_CREATED',
        verification_status: 'PENDING',
        verdict: null,
        verdict_date: null,
        challenge_count: 0,
      },
      validationCreatedAt: '2024-01-15T00:00:00Z',
      validationEndedAt: null,
    },
    // Sub-claim 1: SUPPORTS (VERIFIED_TRUE)
    {
      id: 'claim-sub-1',
      label: 'GitHub Copilot 사용자의 55%가 생산성 향상 보고',
      type: 'claim',
      confidence: 0.85,
      isDirectMatch: false,
      content: 'GitHub의 공식 조사에 따르면 Copilot 사용자의 55%가 코딩 생산성이 향상되었다고 보고했다.',
      sources: ['https://example.com/github-copilot-survey'],
      tags: ['GitHub Copilot', 'Productivity', 'Survey'],
      metadata: {
        origin_type: 'AGENT_DERIVED',
        verification_status: 'VERIFIED_TRUE',
        verdict: 'TRUE',
        verdict_date: '2024-01-20T00:00:00Z',
        challenge_count: 0,
      },
      validationCreatedAt: '2024-01-18T00:00:00Z',
      validationEndedAt: null,
    },
    // Sub-claim 2: CONTRADICTS (PENDING)
    {
      id: 'claim-sub-2',
      label: '창의적 설계 작업은 AI 자동화가 어렵다',
      type: 'claim',
      confidence: 0.72,
      isDirectMatch: false,
      content: '소프트웨어 아키텍처 설계나 복잡한 비즈니스 로직 구현 같은 창의적 작업은 AI가 자동화하기 어렵다.',
      sources: ['https://example.com/ai-limitations'],
      tags: ['Architecture', 'Creativity', 'Limitations'],
      metadata: {
        origin_type: 'AGENT_DERIVED',
        verification_status: 'PENDING',
        verdict: null,
        verdict_date: null,
        challenge_count: 1,
      },
      validationCreatedAt: '2024-01-19T00:00:00Z',
      validationEndedAt: null,
    },
    // Sub-claim 3: QUALIFIES (PENDING)
    {
      id: 'claim-sub-3',
      label: '특정 도메인에서만 유효한 주장',
      type: 'claim',
      confidence: 0.60,
      isDirectMatch: false,
      content: 'AI 코딩 자동화는 웹 개발이나 데이터 처리 같은 특정 도메인에서는 효과적이지만, 임베디드 시스템이나 보안 소프트웨어에서는 제한적이다.',
      sources: ['https://example.com/domain-specific'],
      tags: ['Domain Specific', 'Web Development', 'Embedded'],
      metadata: {
        origin_type: 'AGENT_DERIVED',
        verification_status: 'PENDING',
        verdict: null,
        verdict_date: null,
        challenge_count: 0,
      },
      validationCreatedAt: '2024-01-21T00:00:00Z',
      validationEndedAt: null,
    },
    // Sub-claim 4: SUPPORTS (PARTIALLY_TRUE)
    {
      id: 'claim-sub-4',
      label: 'AI 코드 생성 도구 시장이 급성장하고 있다',
      type: 'claim',
      confidence: 0.88,
      isDirectMatch: false,
      content: '2023년 AI 코드 생성 도구 시장 규모가 전년 대비 300% 증가했다.',
      sources: ['https://example.com/market-growth'],
      tags: ['Market', 'Growth', 'Statistics'],
      metadata: {
        origin_type: 'AGENT_DERIVED',
        verification_status: 'VERIFIED_TRUE',
        verdict: 'PARTIALLY_TRUE',
        verdict_date: '2024-01-22T00:00:00Z',
        challenge_count: 0,
      },
      validationCreatedAt: '2024-01-20T00:00:00Z',
      validationEndedAt: null,
    },
    // Sub-claim 5: DEPENDS_ON (VERIFIED_FALSE)
    {
      id: 'claim-sub-5',
      label: '현재 AI는 버그 없는 코드를 100% 생성할 수 있다',
      type: 'claim',
      confidence: 0.45,
      isDirectMatch: false,
      content: 'AI 생성 코드에는 여전히 버그가 존재하며, 인간의 검토가 필수적이다.',
      sources: ['https://example.com/ai-bugs'],
      tags: ['Bugs', 'Quality', 'Review'],
      metadata: {
        origin_type: 'AGENT_DERIVED',
        verification_status: 'VERIFIED_FALSE',
        verdict: 'FALSE',
        verdict_date: '2024-01-23T00:00:00Z',
        challenge_count: 2,
      },
      validationCreatedAt: '2024-01-21T00:00:00Z',
      validationEndedAt: null,
    },
  ],
  edges: [
    // Sub-claims → Parent Claim (source = child, target = parent)
    { source: 'claim-sub-1', target: 'claim-root-1', relationship: 'SUPPORTS', weight: 0.85 },
    { source: 'claim-sub-2', target: 'claim-root-1', relationship: 'CONTRADICTS', weight: 0.72 },
    { source: 'claim-sub-3', target: 'claim-root-1', relationship: 'QUALIFIES', weight: 0.60 },
    { source: 'claim-sub-4', target: 'claim-root-1', relationship: 'SUPPORTS', weight: 0.88 },
    { source: 'claim-sub-5', target: 'claim-root-1', relationship: 'CONTRADICTS', weight: 0.45 },
  ],
  metadata: {
    graphType: 'argument_map',
    expansionDepth: 1,
    totalNodes: 6,
    directMatchCount: 1,
    expandedCount: 5,
    allowedRelationshipTypes: ['SUPPORTS', 'CONTRADICTS', 'QUALIFIES', 'DEPENDS_ON'],
  },
}

/**
 * Evidence Graph Mock Data
 * - Claim 노드와 Agent 노드들의 관계
 * - PROVIDES_EVIDENCE 관계로 연결
 */
export const mockEvidenceGraphData: GraphData = {
  nodes: [
    {
      id: 'claim-1',
      label: 'Claim에 대한 Evidence를 보는 중입니다',
      type: 'claim',
      confidence: null,
      isDirectMatch: true,
      content: '이것은 Claim 컨텐츠입니다. (보이지 않습니다)',
      sources: [],
      tags: [],
      metadata: null,
      validationCreatedAt: '2026-03-03T05:33:34.862Z',
      validationEndedAt: null,
    },
    {
      id: 'agent-1',
      label: 'agent-web',
      type: 'agent',
      confidence: null,
      isDirectMatch: false,
      content: 'agent-web content',
      sources: [],
      tags: [],
      metadata: null,
      validationCreatedAt: '2026-03-03T05:33:34.862Z',
      validationEndedAt: null,
    },
    {
      id: 'agent-2',
      label: 'agent-arxiv',
      type: 'agent',
      confidence: null,
      isDirectMatch: false,
      content: 'agent-arxiv content',
      sources: [],
      tags: [],
      metadata: null,
      validationCreatedAt: '2026-03-03T05:33:34.862Z',
      validationEndedAt: null,
    },
  ],
  edges: [
    {
      source: 'agent-1',
      target: 'claim-1',
      relationship: 'PROVIDES_EVIDENCE',
      weight: null,
    },
    {
      source: 'agent-2',
      target: 'claim-1',
      relationship: 'PROVIDES_EVIDENCE',
      weight: null,
    },
  ],
  metadata: {
    graphType: 'evidence',
    totalNodes: 3,
    totalEdges: 2,
    centerType: 'claim',
    agentCount: 2,
    evidenceCount: 0,
    avgConfidence: 0.0,
  },
}

/**
 * Argument Map Root Only Mock Data
 * - Root Claim 노드 하나만 있는 초기 상태
 */
export const mockArgumentMapRootOnly: GraphData = {
  nodes: [
    {
      id: 'root-claim-1',
      label: '이것은 인간이 생성한 Root claim 입니다',
      type: 'root_claim',
      confidence: null,
      isDirectMatch: true,
      content: '이것은 Root Claim 컨텐츠입니다. (보이지 않습니다)',
      sources: [],
      tags: [],
      metadata: {
        origin_type: 'USER_CREATED',
        verification_status: 'PENDING',
        verdict: null,
        verdict_date: null,
        challenge_count: 0,
      },
      validationCreatedAt: '2026-03-03T05:32:28.827Z',
      validationEndedAt: null,
    },
  ],
  edges: [],
  metadata: {
    graphType: 'argument_map',
    expansionDepth: 0,
    totalNodes: 1,
    directMatchCount: 1,
    expandedCount: 0,
    allowedRelationshipTypes: ['SUPPORTS', 'CONTRADICTS', 'QUALIFIES', 'DEPENDS_ON'],
  },
}
