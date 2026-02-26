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

### 전체 Import (live-article)

```tsx
import { GraphPanel, TimelinePanel } from '@factagora/viz'
import type { GraphData, TimelineData } from '@factagora/types'

function ChatInterface() {
  return (
    <>
      <GraphPanel data={graphData} theme="light" />
      <TimelinePanel data={timelineData} theme="light" />
    </>
  )
}
```

### Tree-shaking (Chrome Extension)

```tsx
// 그래프만 import (vis-timeline 번들에서 제외)
import { GraphPanel } from '@factagora/viz/graph'

function SidePanel() {
  return <GraphPanel data={graphData} theme="light" />
}
```

## API

### GraphPanel

```tsx
interface GraphPanelProps {
  data: GraphData
  theme?: 'light' | 'dark'
  labels?: {
    zoomIn: string
    zoomOut: string
    resetZoom: string
  }
}
```

### TimelinePanel

```tsx
interface TimelinePanelProps {
  data: TimelineData
  theme?: 'light' | 'dark'
}
```

## Entry Points

| Import Path | Contents | Use Case |
|-------------|----------|----------|
| `@factagora/viz` | graph + timeline + stores | live-article (전체 기능) |
| `@factagora/viz/graph` | graph only | Chrome Extension (번들 최소화) |
| `@factagora/viz/timeline` | timeline only | 타임라인만 필요한 경우 |

## Dependencies

- `react`, `react-dom`: ^18.0.0 || ^19.0.0 (peer)
- `@factagora/types`: workspace:* (types)
- `react-force-graph-2d`: DG 그래프
- `@xyflow/react`: TKG 그래프
- `vis-timeline`: TKG 타임라인 (80KB, tree-shaking 가능)

## License

MIT
