/**
 * TreeGraphNode — @xyflow/react 커스텀 노드
 *
 * 타입별 아이콘 + 라벨 박스 (신뢰도 없음). 클릭 시 상세 패널.
 */

'use client'

import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { GraphNode } from '@factagora/types'
import { getNodeIcon, getNodeColor } from './graphStyles'

// 간단한 className 유틸
function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}

interface TreeGraphNodeData {
  node: GraphNode
  isHovered?: boolean
  isSelected?: boolean
}

function TreeGraphNodeInner({ data }: { data: any }) {
  const { node, isHovered, isSelected } = data as TreeGraphNodeData
  const Icon = getNodeIcon(node.type)
  const color = getNodeColor(node.type)

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-muted-foreground/40 !border-0"
      />

      <div
        className={cn(
          'px-3 py-2 rounded-lg border min-w-[160px] max-w-[220px] cursor-pointer transition-all duration-200',
          node.isDirectMatch
            ? cn(color.bg, color.border, 'border-solid')
            : 'bg-card border-border border-dashed',
          isHovered && 'ring-2 ring-primary/60 scale-[1.03]',
          isSelected && 'ring-2 ring-primary bg-primary/10'
        )}
      >
        <div className="flex items-center gap-2">
          <Icon
            className={cn(
              'w-4 h-4 flex-shrink-0',
              node.isDirectMatch ? color.text : 'text-muted-foreground'
            )}
          />
          <span
            className={cn(
              'text-xs truncate',
              node.isDirectMatch
                ? 'font-semibold text-foreground'
                : 'font-normal text-muted-foreground'
            )}
            title={node.label}
          >
            {node.label}
          </span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-muted-foreground/40 !border-0"
      />
    </>
  )
}

export const TreeGraphNode = memo(TreeGraphNodeInner)
