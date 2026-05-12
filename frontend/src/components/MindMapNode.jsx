import { Handle, Position } from "@xyflow/react"

const STATUS_COLORS = {
  '已完成': { bg: '#d1fae5', border: '#10b981', text: '#10b981' },
  '进行中': { bg: '#fef3c7', border: '#f59e0b', text: '#f59e0b' },
  '待办': { bg: '#dbeafe', border: '#3b82f6', text: '#3b82f6' },
}

export default function MindMapNode({ data, selected }) {
  const status = data.status || '待办'
  const colors = STATUS_COLORS[status] || STATUS_COLORS['待办']

  return (
    <div
      className={`relative px-4 py-3 rounded-lg border-2 transition-all ${
        selected ? 'shadow-lg ring-2 ring-offset-2' : 'shadow-sm'
      }`}
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
        minWidth: '200px',
        maxWidth: '300px',
        width: 'fit-content',
      }}
    >
      <Handle
        id="top"
        type="source"
        position={Position.Top}
        isConnectable={true}
        className="w-4 h-4 !bg-gray-500 hover:!bg-gray-700 rounded-full border-2 border-white !opacity-100"
        style={{ top: -8 }}
      />
      <Handle
        id="right"
        type="source"
        position={Position.Right}
        isConnectable={true}
        className="w-4 h-4 !bg-gray-500 hover:!bg-gray-700 rounded-full border-2 border-white !opacity-100"
        style={{ right: -8 }}
      />
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        isConnectable={true}
        className="w-4 h-4 !bg-gray-500 hover:!bg-gray-700 rounded-full border-2 border-white !opacity-100"
        style={{ bottom: -8 }}
      />
      <Handle
        id="left"
        type="source"
        position={Position.Left}
        isConnectable={true}
        className="w-4 h-4 !bg-gray-500 hover:!bg-gray-700 rounded-full border-2 border-white !opacity-100"
        style={{ left: -8 }}
      />

      {data.isSmart && (
        <span className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-bold shadow z-10">
          ⭐
        </span>
      )}

      {data.sequence && (
        <span
          className="absolute -top-3 -left-3 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white shadow z-10"
          style={{ backgroundColor: colors.border }}
        >
          {data.sequence}
        </span>
      )}

      <div className="font-medium text-gray-800 text-base mb-2 line-clamp-2 pr-6">
        {data.label}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
        <span className="truncate">{data.assignee || '未分配'}</span>
        <span className="text-gray-500 text-xs">{data.deadline || '无截止日期'}</span>
      </div>

      <div
        className="mt-1 px-3 py-1 rounded-full text-xs font-medium text-center text-white"
        style={{ backgroundColor: colors.border }}
      >
        {status}
      </div>
    </div>
  )
}
