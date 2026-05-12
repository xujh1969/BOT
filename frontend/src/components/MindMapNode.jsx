import { Handle, Position } from "@xyflow/react"

const STATUS_CONFIG = {
  '已完成': { bg: '#d1fae5', border: '#10b981', text: '#10b981', badgeBg: '#10b981', badgeText: 'white', label: '完成', icon: '✓' },
  '进行中': { bg: '#fef3c7', border: '#f59e0b', text: '#f59e0b', badgeBg: '#f59e0b', badgeText: 'white', label: '进行中', icon: '○' },
  '待办': { bg: '#fef3c7', border: '#f59e0b', text: '#f59e0b', badgeBg: '#f59e0b', badgeText: 'white', label: '待办', icon: '◯' },
  '超时': { bg: '#fee2e2', border: '#ef4444', text: '#ef4444', badgeBg: '#ef4444', badgeText: 'white', label: '超时', icon: '!' },
}

export default function MindMapNode({ data, selected, onEdit, id }) {
  const status = data.status || '待办'
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['待办']
  const hasAcceptance = data.acceptance_criteria && data.acceptance_criteria.length > 0

  const handleEditClick = () => {
    if (onEdit) {
      onEdit({ ...data, id })
    }
  }

  const isOverdue = () => {
    if (status === '已完成') return false
    if (status === '超时') return true
    if (data.due_date) {
      const now = new Date()
      const dueDate = new Date(data.due_date)
      return dueDate < now
    }
    return false
  }

  return (
    <div
      className={`relative rounded-2xl border-2 transition-all shadow-lg ${
        selected ? 'ring-2 ring-offset-2' : ''
      }`}
      style={{
        backgroundColor: '#ffffff',
        borderColor: isOverdue() ? '#ef4444' : '#e0e7ff',
        minWidth: '360px',
        maxWidth: '420px',
        width: 'fit-content',
      }}
    >
      <Handle type="target" position={Position.Top} id="top-target" className="handle-target-outer" />
      <Handle type="source" position={Position.Top} id="top-source" className="handle-source-inner" />
      <Handle type="target" position={Position.Right} id="right-target" className="handle-target-outer" />
      <Handle type="source" position={Position.Right} id="right-source" className="handle-source-inner" />
      <Handle type="target" position={Position.Bottom} id="bottom-target" className="handle-target-outer" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" className="handle-source-inner" />
      <Handle type="target" position={Position.Left} id="left-target" className="handle-target-outer" />
      <Handle type="source" position={Position.Left} id="left-source" className="handle-source-inner" />

      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{data.label || '未命名任务'}</h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span 
              className="px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 whitespace-nowrap min-w-[70px]"
              style={{ backgroundColor: config.badgeBg, color: config.badgeText }}
            >
              <span>{config.icon}</span>
              <span>{config.label}</span>
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleEditClick()
              }}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
              title="编辑"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center">
              <span className="text-white font-medium">{data.assignee?.charAt(0) || '?'}</span>
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-800">{data.assignee || '未分配'}</div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
                {data.department || '未设置部门'}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              发起时间
            </div>
            <div className="text-sm font-medium text-gray-800">
              {data.start_date ? data.start_date : '未设置'}
            </div>
          </div>
          <div className={`rounded-xl p-3 ${isOverdue() ? 'bg-red-50' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
              <svg className={`w-3.5 h-3.5 ${isOverdue() ? 'text-red-500' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              截止时间
            </div>
            <div className={`text-sm font-medium ${isOverdue() ? 'text-red-600' : 'text-gray-800'}`}>
              {data.due_date ? data.due_date : '未设置'}
            </div>
          </div>
        </div>

        {hasAcceptance && (
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              验收标准
            </div>
            <div className="text-sm text-gray-700 pl-5">
              <div className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>{data.acceptance_criteria}</span>
              </div>
            </div>
          </div>
        )}

        {data.risk && data.risk.length > 0 && (
          <div className="bg-orange-50 rounded-xl p-3 mt-3">
            <div className="flex items-center gap-2 text-orange-600 text-xs mb-2">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              风险提示
            </div>
            <div className="text-sm text-orange-700">
              {data.risk}
            </div>
          </div>
        )}
      </div>

      <div className="h-6 bg-gradient-to-r from-indigo-100 via-purple-50 to-pink-50 rounded-b-2xl" />

      <style>{`
        .handle-target-outer {
          width: 14px !important;
          height: 14px !important;
          background: #6366f1 !important;
          border: 3px solid white !important;
          border-radius: 50% !important;
          opacity: 1 !important;
          z-index: 1 !important;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4) !important;
        }
        .handle-target-outer:hover {
          background: #4f46e5 !important;
        }
        .handle-source-inner {
          width: 8px !important;
          height: 8px !important;
          background: white !important;
          border: 2px solid #6366f1 !important;
          border-radius: 50% !important;
          opacity: 1 !important;
          z-index: 2 !important;
        }
        .handle-source-inner:hover {
          background: #f0f0ff !important;
        }
      `}</style>
    </div>
  )
}