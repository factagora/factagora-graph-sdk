import type { Meta, StoryObj } from '@storybook/react'
import { ForceGraph } from './ForceGraph'
import { mockTKGGraphData } from '../__mocks__/mockData'

const meta: Meta<typeof ForceGraph> = {
  title: 'Graph/ForceGraph',
  component: ForceGraph,
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
  },
}

export default meta
type Story = StoryObj<typeof ForceGraph>

/**
 * 기본 ForceGraph - Light Theme
 * TKG 멀티홉 그래프 시각화
 */
export const Default: Story = {
  args: {
    graphData: mockTKGGraphData,
    theme: 'light',
  },
  parameters: {
    docs: {
      description: {
        story:
          'TKG (Temporal Knowledge Graph)를 force-directed 레이아웃으로 렌더링합니다. hop distance별로 색상(seed: blue, 1-hop: violet, 2-hop: amber)과 크기가 구분됩니다.',
      },
    },
  },
}

/**
 * Dark Theme
 */
export const DarkTheme: Story = {
  args: {
    graphData: mockTKGGraphData,
    theme: 'dark',
  },
  parameters: {
    backgrounds: {
      default: 'dark',
    },
    docs: {
      description: {
        story: 'Dark 모드에서는 배경이 어두워지고 노드/엣지 색상이 조정됩니다.',
      },
    },
  },
}

/**
 * Discovery 노드 강조
 * isDiscoveryNode가 true인 노드는 gold glow 효과
 */
export const WithDiscoveryNodes: Story = {
  args: {
    graphData: mockTKGGraphData,
    theme: 'light',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Discovery 노드 (isDiscoveryNode: true)는 gold 색상의 glow 효과가 적용됩니다. Mock 데이터에서 1-hop-2와 2-hop-1이 Discovery 노드입니다.',
      },
    },
  },
}

/**
 * 노드 클릭 이벤트
 */
export const WithClickEvent: Story = {
  args: {
    graphData: mockTKGGraphData,
    theme: 'light',
    onNodeClick: (node, graphData) => {
      console.log('Node clicked:', node)
      alert(
        `Clicked: ${node.label}\nHop: ${node.metadata?.hopDistance}\nConfidence: ${node.confidence}`
      )
    },
  },
  parameters: {
    docs: {
      description: {
        story: '노드를 클릭하면 해당 노드의 정보가 alert로 표시됩니다.',
      },
    },
  },
}

/**
 * Hover 이벤트
 */
export const WithHoverEvent: Story = {
  args: {
    graphData: mockTKGGraphData,
    theme: 'light',
    hoveredNodeId: null,
    onNodeHover: (nodeId) => {
      console.log('Hovered node:', nodeId)
    },
  },
  parameters: {
    docs: {
      description: {
        story: '노드 위에 마우스를 올리면 콘솔에 로그가 출력됩니다.',
      },
    },
  },
}

/**
 * 인터랙티브 - 클릭 + Hover
 */
export const Interactive: Story = {
  args: {
    graphData: mockTKGGraphData,
    theme: 'light',
    onNodeClick: (node, graphData) => {
      console.log('Clicked:', node.label)
      console.log('Full node data:', node)
      console.log('Graph data:', graphData)
    },
    onNodeHover: (nodeId) => {
      console.log('Hovered:', nodeId)
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          '노드 클릭 및 hover 이벤트를 모두 활성화한 상태입니다. 브라우저 콘솔에서 이벤트 로그를 확인할 수 있습니다.',
      },
    },
  },
}
