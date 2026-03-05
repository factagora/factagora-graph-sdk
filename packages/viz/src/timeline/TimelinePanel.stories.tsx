import type { Meta, StoryObj } from '@storybook/react'
import { TimelinePanel } from './TimelinePanel'
import { mockTimelineData } from '../__mocks__/mockData'

const meta: Meta<typeof TimelinePanel> = {
  title: 'Timeline/TimelinePanel',
  component: TimelinePanel,
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
    hideHeader: {
      control: 'boolean',
      description: 'Hide the header section',
    },
    itemColor: {
      control: 'color',
      description: 'Color for timeline items',
    },
  },
}

export default meta
type Story = StoryObj<typeof TimelinePanel>

/**
 * 기본 TimelinePanel
 * TKG 타임라인 시각화
 */
export const Default: Story = {
  args: {
    timelineData: mockTimelineData,
    hideHeader: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'TKG 타임라인을 vis-timeline으로 렌더링합니다. entity별로 그룹화되고 시간축을 따라 relation이 표시됩니다.',
      },
    },
  },
}

/**
 * No Header
 */
export const NoHeader: Story = {
  args: {
    timelineData: mockTimelineData,
    hideHeader: true,
  },
  parameters: {
    docs: {
      description: {
        story: '헤더 없이 타임라인만 표시합니다.',
      },
    },
  },
}

/**
 * Custom Color
 */
export const CustomColor: Story = {
  args: {
    timelineData: mockTimelineData,
    hideHeader: false,
    itemColor: '#10b981',
  },
  parameters: {
    docs: {
      description: {
        story: 'itemColor prop으로 타임라인 아이템 색상을 변경할 수 있습니다.',
      },
    },
  },
}

/**
 * Custom Labels
 */
export const CustomLabels: Story = {
  args: {
    timelineData: mockTimelineData,
    hideHeader: false,
    labels: {
      title: '시간축 분석',
      stats: '{entities}개 엔티티 · {relations}개 관계',
      emptyRelations: '표시 가능한 관계가 없습니다',
      emptyRelationsDetail: '{count}개 관계는 시간 정보가 없어 표시되지 않습니다',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'labels prop으로 한글 또는 다른 언어로 라벨을 변경할 수 있습니다.',
      },
    },
  },
}

/**
 * Item Click Event
 */
export const WithClickEvent: Story = {
  args: {
    timelineData: mockTimelineData,
    hideHeader: false,
    onItemSelect: (item, timelineData) => {
      console.log('Timeline item selected:', item)
      alert(`Selected: ${item.content}\nType: ${item.data?.relType}\nConfidence: ${item.data?.confidence}`)
    },
  },
  parameters: {
    docs: {
      description: {
        story: '타임라인 아이템을 클릭하면 해당 아이템의 정보가 alert로 표시됩니다.',
      },
    },
  },
}

/**
 * 전체 기능 - 커스텀 색상 + 클릭 이벤트
 */
export const FullyCustomized: Story = {
  args: {
    timelineData: mockTimelineData,
    hideHeader: false,
    itemColor: '#8b5cf6',
    labels: {
      title: 'TKG 타임라인',
      stats: '{entities}개 기업 · {relations}개 이벤트',
    },
    onItemSelect: (item, timelineData) => {
      console.log('Selected item:', item)
      console.log('Timeline data:', timelineData)
    },
  },
  parameters: {
    docs: {
      description: {
        story: '커스텀 색상, 라벨, 클릭 이벤트를 모두 적용한 예시입니다.',
      },
    },
  },
}
