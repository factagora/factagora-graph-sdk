import type { Meta, StoryObj } from '@storybook/react'
import { ReactFlowProvider } from '@xyflow/react'
import { TreeGraph } from './TreeGraph'
import { mockDGGraphData, mockSimpleDGGraph } from '../__mocks__/mockData'
import '@xyflow/react/dist/style.css'

const meta: Meta<typeof TreeGraph> = {
  title: 'Graph/TreeGraph',
  component: TreeGraph,
  decorators: [
    (Story) => (
      <ReactFlowProvider>
        <div style={{ width: '100%', height: '600px' }}>
          <Story />
        </div>
      </ReactFlowProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    nodesDraggable: {
      control: 'boolean',
      description: '노드를 드래그하여 위치 조정 가능 여부',
    },
  },
}

export default meta
type Story = StoryObj<typeof TreeGraph>

/**
 * 기본 TreeGraph
 * dagre LR 레이아웃으로 자동 배치
 */
export const Default: Story = {
  args: {
    graphData: mockDGGraphData,
    nodesDraggable: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'DG (Document Graph)를 TreeGraph로 렌더링합니다. dagre LR 레이아웃을 사용하여 자동 배치됩니다.',
      },
    },
  },
}

/**
 * 노드 드래그 가능
 * nodesDraggable={true}로 설정하면 노드를 드래그하여 위치 조정 가능
 */
export const Draggable: Story = {
  args: {
    graphData: mockDGGraphData,
    nodesDraggable: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'nodesDraggable={true}로 설정하면 노드를 드래그하여 자유롭게 위치를 조정할 수 있습니다. 초기 레이아웃은 dagre로 배치되지만 이후 수동으로 조정 가능합니다.',
      },
    },
  },
}

/**
 * 간단한 그래프
 */
export const SimpleTree: Story = {
  args: {
    graphData: mockSimpleDGGraph,
    nodesDraggable: false,
  },
  parameters: {
    docs: {
      description: {
        story: '3개의 노드로 구성된 간단한 트리 구조입니다.',
      },
    },
  },
}

/**
 * 노드 선택 및 Hover
 */
export const WithSelection: Story = {
  args: {
    graphData: mockDGGraphData,
    selectedNodeId: 'node-2',
    hoveredNodeId: null,
    nodesDraggable: false,
    onNodeSelect: (nodeId) => {
      console.log('Selected node:', nodeId)
    },
    onNodeHover: (nodeId) => {
      console.log('Hovered node:', nodeId)
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'selectedNodeId를 지정하면 해당 노드가 선택된 상태로 표시됩니다. hover 시 onNodeHover 콜백이 호출됩니다.',
      },
    },
  },
}

/**
 * 인터랙티브 - 드래그 + 선택
 */
export const Interactive: Story = {
  args: {
    graphData: mockDGGraphData,
    nodesDraggable: true,
    onNodeSelect: (nodeId) => {
      console.log('Node selected:', nodeId)
      alert(`Selected: ${nodeId}`)
    },
    onNodeHover: (nodeId) => {
      console.log('Node hovered:', nodeId)
    },
  },
  parameters: {
    docs: {
      description: {
        story: '노드를 드래그하여 위치를 조정할 수 있고, 클릭 시 alert가 표시됩니다.',
      },
    },
  },
}
