/**
 * ArgumentMapGraphNode — Argument Map 그래프용 커스텀 노드
 *
 * TreeGraphNode와 동일한 간단한 디자인 (아이콘 + 라벨만)
 * graphStyles.ts 사용
 */

'use client'

import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { GraphNode } from '@factagora/types'
import { getNodeIcon, getNodeColorHex } from './graphStyles'

interface ArgumentMapGraphNodeData {
  node: GraphNode
  isHovered?: boolean
  isSelected?: boolean
}

function ArgumentMapGraphNodeComponent({ data }: { data: any }) {
  const { node, isHovered, isSelected } = data as ArgumentMapGraphNodeData
  const Icon = getNodeIcon(node.type)
  const colors = getNodeColorHex(node.type)

  // TreeGraphNode와 동일한 스타일 계산
  const bgColor = node.isDirectMatch ? colors.bg : '#f3f4f6'
  const borderColor = node.isDirectMatch ? colors.border : '#d1d5db'
  const borderStyle = node.isDirectMatch ? 'solid' : 'dashed'
  const iconColor = node.isDirectMatch ? colors.text : '#6b7280'
  const textColor = node.isDirectMatch ? '#000000' : '#6b7280'
  const fontWeight = node.isDirectMatch ? 600 : 400

  const boxShadow = isHovered
    ? '0 0 0 2px rgba(37, 99, 235, 0.6)'
    : isSelected
      ? '0 0 0 2px rgba(37, 99, 235, 1)'
      : 'none'

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    backgroundColor: bgColor,
    border: `1.5px ${borderStyle} ${borderColor}`,
    borderRadius: '8px',
    minWidth: '180px',
    maxWidth: '220px',
    boxShadow,
    transition: 'all 0.2s ease',
  }

  const iconStyle: React.CSSProperties = {
    width: '16px',
    height: '16px',
    color: iconColor,
    flexShrink: 0,
  }

  const textStyle: React.CSSProperties = {
    fontSize: '12px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontWeight,
    color: textColor,
  }

  const handleStyle: React.CSSProperties = {
    width: '8px',
    height: '8px',
    backgroundColor: 'rgba(107, 114, 128, 0.4)',
    border: '0',
  }

  return (
    <>
      <Handle type="target" position={Position.Left} style={handleStyle} />

      <div style={containerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '8px' }}>
          <Icon style={iconStyle} />
          <span style={textStyle} title={node.label}>
            {node.label}
          </span>
        </div>
      </div>

      <Handle type="source" position={Position.Right} style={handleStyle} />
    </>
  )
}

export const ArgumentMapGraphNode = memo(ArgumentMapGraphNodeComponent)
