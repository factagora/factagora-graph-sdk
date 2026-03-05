import type { Meta, StoryObj } from '@storybook/react'
import { GraphPanel } from './GraphPanel'
import { mockDGGraphData, mockTKGGraphData, mockSimpleDGGraph, mockArgumentMapGraph } from '../__mocks__/mockData'
import '@xyflow/react/dist/style.css'

const meta: Meta<typeof GraphPanel> = {
  title: 'Graph/GraphPanel',
  component: GraphPanel,
  decorators: [
    (Story) => (
      <div style={{ width: '100%', height: '600px' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    theme: {
      control: 'select',
      options: ['light', 'dark'],
      description: 'Color theme for the graph',
    },
    hideHeader: {
      control: 'boolean',
      description: 'Hide the header section',
    },
  },
}

export default meta
type Story = StoryObj<typeof GraphPanel>

/**
 * DG (Document Graph) - 기본 트리 구조
 * dagre LR 레이아웃으로 자동 배치
 */
export const DocumentGraph: Story = {
  args: {
    graphData: mockDGGraphData,
    theme: 'light',
    hideHeader: false,
    className: 'h-full',
  },
  parameters: {
    docs: {
      description: {
        story: 'Document Graph는 TreeGraph를 사용하여 트리 구조로 렌더링됩니다. dagre LR 레이아웃으로 자동 배치됩니다.',
      },
    },
  },
}

/**
 * DG - Dark Theme
 */
export const DocumentGraphDark: Story = {
  args: {
    graphData: mockDGGraphData,
    theme: 'dark',
    hideHeader: false,
    className: 'h-full',
  },
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
}

/**
 * DG - No Header
 */
export const DocumentGraphNoHeader: Story = {
  args: {
    graphData: mockDGGraphData,
    theme: 'light',
    hideHeader: true,
    className: 'h-full',
  },
}

/**
 * TKG (Temporal Knowledge Graph) - 멀티홉 ForceGraph
 * Canvas 기반 force-directed 레이아웃
 */
export const TemporalKnowledgeGraph: Story = {
  args: {
    graphData: mockTKGGraphData,
    theme: 'light',
    hideHeader: false,
    className: 'h-full',
  },
  parameters: {
    docs: {
      description: {
        story: 'TKG는 ForceGraph를 사용하여 멀티홉 관계를 시각화합니다. hop distance별로 색상과 크기가 구분됩니다.',
      },
    },
  },
}

/**
 * TKG - Dark Theme
 */
export const TemporalKnowledgeGraphDark: Story = {
  args: {
    graphData: mockTKGGraphData,
    theme: 'dark',
    hideHeader: false,
    className: 'h-full',
  },
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
}

/**
 * Simple DG - 최소 구조
 */
export const SimpleGraph: Story = {
  args: {
    graphData: mockSimpleDGGraph,
    theme: 'light',
    hideHeader: false,
    className: 'h-full',
  },
  parameters: {
    docs: {
      description: {
        story: '간단한 3개 노드 그래프로 기본 구조를 확인할 수 있습니다.',
      },
    },
  },
}

/**
 * With Interactions - 노드 클릭 및 hover 이벤트
 */
export const WithInteractions: Story = {
  args: {
    graphData: mockDGGraphData,
    theme: 'light',
    hideHeader: false,
    className: 'h-full',
    onNodeClick: (node, graphData) => {
      console.log('Node clicked:', node.label)
      console.log('Graph data:', graphData)
      alert(`Clicked: ${node.label}`)
    },
    onNodeHover: (nodeId) => {
      console.log('Node hovered:', nodeId)
    },
    onNodeSelect: (nodeId) => {
      console.log('Node selected:', nodeId)
    },
  },
  parameters: {
    docs: {
      description: {
        story: '노드를 클릭하면 alert가 표시되고 콘솔에 로그가 출력됩니다. hover 시에도 콘솔에 로그가 출력됩니다.',
      },
    },
  },
}

/**
 * Argument Map - 주장 검증 그래프
 * Claim 노드들과 SUPPORTS/CONTRADICTS/QUALIFIES 관계 시각화
 */
export const ArgumentMap: Story = {
  args: {
    graphData: mockArgumentMapGraph,
    theme: 'light',
    hideHeader: false,
    className: 'h-full',
  },
  parameters: {
    docs: {
      description: {
        story: 'Argument Map은 주장(claim)과 하위 주장들의 관계를 시각화합니다. SUPPORTS, CONTRADICTS, QUALIFIES 등의 관계 타입을 포함합니다.',
      },
    },
  },
}

/**
 * Argument Map - Dark Theme
 */
export const ArgumentMapDark: Story = {
  args: {
    graphData: mockArgumentMapGraph,
    theme: 'dark',
    hideHeader: false,
    className: 'h-full',
  },
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
}

