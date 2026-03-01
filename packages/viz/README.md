# @factagora/viz

Factagora 그래프 기반 지식 탐색 SDK - React 시각화 컴포넌트

## Features

- **Graph Visualization**: DG (Document Graph) + TKG (Temporal Knowledge Graph) 시각화
- **Timeline Visualization**: TKG 타임라인 차트 (vis-timeline)
- **Tree-shaking**: 멀티 엔트리 포인트로 번들 크기 최적화
- **Framework Agnostic**: React hooks + 순수 컴포넌트

## Installation

```bash
# GitHub Packages 레지스트리 설정
echo "@factagora:registry=https://npm.pkg.github.com" >> .npmrc

# 패키지 설치
pnpm add @factagora/viz @factagora/types
```

## Usage

### 통합 컴포넌트 (권장) ⭐

그래프와 타임라인을 자동으로 관리하는 통합 컴포넌트:

```tsx
import { ChatVisualization } from '@factagora/viz'
import type { GraphData, TimelineData } from '@factagora/types'

function ChatInterface() {
  return (
    <ChatVisualization
      graphData={graphData}
      timelineData={timelineData}
      mode="tabs"  // 'auto' | 'tabs' | 'stacked' | 'side-by-side'
      defaultView="graph"
      theme="light"
      labels={{
        graphTab: "Knowledge Graph",
        timelineTab: "Timeline"
      }}
      onGraphNodeClick={(node, data) => console.log(node)}
      onTimelineItemClick={(item, data) => console.log(item)}
    />
  )
}
```

**자동 감지 기능:**
- 그래프만 있으면 → GraphPanel만 렌더링
- 타임라인만 있으면 → TimelinePanel만 렌더링
- 둘 다 있으면 → mode에 따라 탭/스택/나란히 보기
- 둘 다 없으면 → null 반환

### 개별 컴포넌트 사용

```tsx
import { GraphPanel, TimelinePanel } from '@factagora/viz'
import type { GraphData, TimelineData } from '@factagora/types'

function ChatInterface() {
  return (
    <>
      <GraphPanel graphData={graphData} theme="light" />
      <TimelinePanel timelineData={timelineData} />
    </>
  )
}
```

### Tree-shaking (Chrome Extension)

```tsx
// 그래프만 import (vis-timeline 번들에서 제외)
import { GraphPanel } from '@factagora/viz/graph'

function SidePanel() {
  return <GraphPanel graphData={graphData} theme="light" />
}
```

### 채팅 UI 전용 Import

```tsx
// ChatVisualization만 import
import { ChatVisualization } from '@factagora/viz/chat'

function ChatInterface() {
  return <ChatVisualization graphData={graphData} timelineData={timelineData} />
}
```

## API

### ChatVisualization

```tsx
interface ChatVisualizationProps {
  graphData?: GraphData | null
  timelineData?: TimelineData | null
  mode?: 'auto' | 'tabs' | 'stacked' | 'side-by-side'
  defaultView?: 'graph' | 'timeline'
  labels?: {
    graphTab?: string
    timelineTab?: string
  }
  theme?: 'light' | 'dark'
  className?: string
  onGraphNodeClick?: (node: GraphNode, graphData: GraphData) => void
  onTimelineItemClick?: (item: TimelineItem, timelineData: TimelineData) => void
}
```

### GraphPanel

```tsx
interface GraphPanelProps {
  graphData: GraphData
  theme?: 'light' | 'dark'
  hideHeader?: boolean
  selectedNodeId?: string | null
  hoveredNodeId?: string | null
  onNodeSelect?: (nodeId: string) => void
  onNodeHover?: (nodeId: string | null) => void
  onNodeClick?: (node: GraphNode, graphData: GraphData) => void
}
```

### TimelinePanel

```tsx
interface TimelinePanelProps {
  timelineData: TimelineData
  labels?: TimelinePanelLabels
  hideHeader?: boolean
  itemColor?: string
  onItemSelect?: (item: TimelineItem, timelineData: TimelineData) => void
}
```

## Entry Points

| Import Path | Contents | Use Case |
|-------------|----------|----------|
| `@factagora/viz` | graph + timeline + chat + stores | 전체 기능 (권장) |
| `@factagora/viz/chat` | ChatVisualization only | 채팅 UI 통합 컴포넌트만 |
| `@factagora/viz/graph` | graph only | 그래프만 (번들 최소화) |
| `@factagora/viz/timeline` | timeline only | 타임라인만 |

## Dependencies

- `react`, `react-dom`: ^18.0.0 || ^19.0.0 (peer)
- `@factagora/types`: workspace:* (types)
- `react-force-graph-2d`: DG 그래프
- `@xyflow/react`: TKG 그래프
- `vis-timeline`: TKG 타임라인 (80KB, tree-shaking 가능)

## License

MIT
