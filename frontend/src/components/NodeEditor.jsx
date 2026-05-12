import { useState, useEffect } from 'react'

export default function NodeEditor({ node, onSave, onCancel }) {
  const [title, setTitle] = useState('')
  const [assignee, setAssignee] = useState('')
  const [deadline, setDeadline] = useState('')
  const [status, setStatus] = useState('待办')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (node) {
      setTitle(node.title || '')
      setAssignee(node.assignee || '')
      setDeadline(node.deadline || '')
      setStatus(node.status || '待办')
      setNotes(node.notes || '')
    }
  }, [node])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      title,
      assignee,
      deadline,
      status,
      notes,
    })
  }

  return (
    <>
      <div className="fixed inset-0 bg-scrim/50 z-50" onClick={onCancel} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-card rounded-lg shadow-xl p-6 w-full max-w-md z-50 max-h-[90vh] overflow-y-auto">
        <h2 className="text-display-sm font-semibold text-ink mb-4">编辑节点</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-caption text-ink mb-2">事项描述</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-canvas border border-hairline rounded-sm text-body-md text-ink placeholder-muted focus:outline-none focus:border-ink transition-colors"
              placeholder="输入事项描述"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-caption text-ink mb-2">负责人</label>
            <input
              type="text"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="w-full px-4 py-3 bg-canvas border border-hairline rounded-sm text-body-md text-ink placeholder-muted focus:outline-none focus:border-ink transition-colors"
              placeholder="输入负责人姓名"
            />
          </div>

          <div>
            <label className="block text-caption text-ink mb-2">截止时间</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-4 py-3 bg-canvas border border-hairline rounded-sm text-body-md text-ink focus:outline-none focus:border-ink transition-colors"
            />
          </div>

          <div>
            <label className="block text-caption text-ink mb-2">状态</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-3 bg-canvas border border-hairline rounded-sm text-body-md text-ink focus:outline-none focus:border-ink transition-colors"
            >
              <option value="待办">待办</option>
              <option value="进行中">进行中</option>
              <option value="已完成">已完成</option>
            </select>
          </div>

          <div>
            <label className="block text-caption text-ink mb-2">备注</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-canvas border border-hairline rounded-sm text-body-md text-ink placeholder-muted focus:outline-none focus:border-ink transition-colors resize-none"
              placeholder="添加备注（可选）"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2 bg-surface-strong text-ink rounded-sm hover:bg-surface-soft transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex-1 py-2 bg-primary text-on-primary rounded-sm hover:bg-primary-active disabled:bg-primary-disabled transition-colors"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
