/**
 * TreeGraphNode — @xyflow/react 커스텀 노드
 *
 * 타입별 아이콘 + 라벨 박스 (신뢰도 없음). 클릭 시 상세 패널.
 */

'use client'

import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { GraphNode } from '@factagora/types'
import { getNodeIcon, getNodeColorHex } from './graphStyles'

interface TreeGraphNodeData {
  node: GraphNode
  isHovered?: boolean
  isSelected?: boolean
  fontFamily?: string
}

function TreeGraphNodeInner({ data }: { data: any }) {
  const { node, isHovered, isSelected, fontFamily } = data as TreeGraphNodeData
  const Icon = getNodeIcon(node.type)
  const colors = getNodeColorHex(node.type)

  // 배경색, 테두리색 계산
  const bgColor = node.isDirectMatch ? colors.bg : '#f3f4f6'  // 회색 배경 (gray-100)
  const borderColor = node.isDirectMatch ? colors.border : '#d1d5db'  // 회색 테두리 (gray-300)
  const borderStyle = node.isDirectMatch ? 'solid' : 'dashed'
  const iconColor = node.isDirectMatch ? colors.text : '#6b7280'
  const textColor = node.isDirectMatch ? '#000000' : '#6b7280'
  const fontWeight = node.isDirectMatch ? 600 : 400

  // hover/selected 스타일
  const boxShadow = isHovered
    ? '0 0 0 2px rgba(37, 99, 235, 0.6)'
    : isSelected
      ? '0 0 0 2px #2563eb'
      : 'none'
  const transform = isHovered ? 'scale(1.03)' : 'scale(1)'
  const containerBg = isSelected ? 'rgba(37, 99, 235, 0.1)' : bgColor

  const containerStyle: React.CSSProperties = {
    padding: '8px 12px',
    borderRadius: '8px',
    border: `1px ${borderStyle} ${borderColor}`,
    minWidth: '160px',
    maxWidth: '220px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: containerBg,
    boxShadow,
    transform,
  }

  const contentStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }

  const iconStyle: React.CSSProperties = {
    width: '16px',
    height: '16px',
    flexShrink: 0,
    color: iconColor,
  }

  const textStyle: React.CSSProperties = {
    fontSize: '12px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontWeight,
    color: textColor,
    ...(fontFamily && { fontFamily }),
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
        <div style={contentStyle}>
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

export const TreeGraphNode = memo(TreeGraphNodeInner)
