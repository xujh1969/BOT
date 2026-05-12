import { useState, useEffect } from 'react'

export default function SmartPanel({ node, isOpen, onClose, onSave }) {
  const [s, setS] = useState('')
  const [m, setM] = useState('')
  const [a, setA] = useState('')
  const [r, setR] = useState('')
  const [t, setT] = useState('')

  useEffect(() => {
    if (node) {
      setS(node.smart_s || '')
      setM(node.smart_m || '')
      setA(node.smart_a || '')
      setR(node.smart_r || '')
      setT(node.smart_t || '')
    }
  }, [node])

  const handleSave = () => {
    onSave({ s, m, a, r, t })
  }

  if (!isOpen || !node) return null

  return (
    <>
      <div className="fixed inset-0 bg-scrim/50 z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-card rounded-lg shadow-xl p-6 w-full max-w-md z-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-display-sm font-semibold text-ink">⭐ SMART 目标设定</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-strong flex items-center justify-center text-muted hover:text-ink transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-caption text-ink mb-2">
              <span className="inline-block w-6 h-6 bg-blue-500 text-white rounded-full text-xs font-bold text-center mr-2">S</span>
              Specific - 具体目标
            </label>
            <textarea
              value={s}
              onChange={(e) => setS(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 bg-canvas border border-hairline rounded-sm text-body-md text-ink placeholder-muted focus:outline-none focus:border-ink transition-colors resize-none"
              placeholder="目标要具体明确..."
            />
          </div>

          <div>
            <label className="block text-caption text-ink mb-2">
              <span className="inline-block w-6 h-6 bg-green-500 text-white rounded-full text-xs font-bold text-center mr-2">M</span>
              Measurable - 衡量指标
            </label>
            <textarea
              value={m}
              onChange={(e) => setM(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 bg-canvas border border-hairline rounded-sm text-body-md text-ink placeholder-muted focus:outline-none focus:border-ink transition-colors resize-none"
              placeholder="如何衡量目标达成..."
            />
          </div>

          <div>
            <label className="block text-caption text-ink mb-2">
              <span className="inline-block w-6 h-6 bg-yellow-500 text-white rounded-full text-xs font-bold text-center mr-2">A</span>
              Achievable - 可行性
            </label>
            <textarea
              value={a}
              onChange={(e) => setA(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 bg-canvas border border-hairline rounded-sm text-body-md text-ink placeholder-muted focus:outline-none focus:border-ink transition-colors resize-none"
              placeholder="目标是否可实现..."
            />
          </div>

          <div>
            <label className="block text-caption text-ink mb-2">
              <span className="inline-block w-6 h-6 bg-purple-500 text-white rounded-full text-xs font-bold text-center mr-2">R</span>
              Relevant - 相关性
            </label>
            <textarea
              value={r}
              onChange={(e) => setR(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 bg-canvas border border-hairline rounded-sm text-body-md text-ink placeholder-muted focus:outline-none focus:border-ink transition-colors resize-none"
              placeholder="与整体目标的关联..."
            />
          </div>

          <div>
            <label className="block text-caption text-ink mb-2">
              <span className="inline-block w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold text-center mr-2">T</span>
              Time-bound - 时限
            </label>
            <textarea
              value={t}
              onChange={(e) => setT(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 bg-canvas border border-hairline rounded-sm text-body-md text-ink placeholder-muted focus:outline-none focus:border-ink transition-colors resize-none"
              placeholder="明确的时间节点..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-2 bg-surface-strong text-ink rounded-sm hover:bg-surface-soft transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2 bg-primary text-on-primary rounded-sm hover:bg-primary-active transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
