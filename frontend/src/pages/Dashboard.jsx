import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOpportunities, createOpportunity, archiveOpportunity, unarchiveOpportunity, deleteOpportunity } from '../api'
import { useAuthStore } from '../store/authStore'

const STATUS_COLORS = {
  '活跃': 'border-l-green-400',
  '待跟进': 'border-l-blue-400',
  '已归档': 'border-l-gray-400',
}

const STATUS_BADGE_COLORS = {
  '活跃': 'bg-green-100 text-green-700',
  '待跟进': 'bg-blue-100 text-blue-700',
  '已归档': 'bg-gray-100 text-gray-600',
}

export default function Dashboard() {
  const [opportunities, setOpportunities] = useState([])
  const [filter, setFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newOppName, setNewOppName] = useState('')
  const { logout } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    loadOpportunities()
  }, [filter])

  const loadOpportunities = async () => {
    setIsLoading(true)
    try {
      const status = filter === 'all' ? '' : filter
      const data = await getOpportunities(status)
      setOpportunities(data)
    } catch (err) {
      console.error('Failed to load opportunities:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!newOppName.trim()) return
    try {
      await createOpportunity(newOppName.trim())
      setNewOppName('')
      setShowCreateModal(false)
      loadOpportunities()
    } catch (err) {
      console.error('Failed to create opportunity:', err)
    }
  }

  const handleArchive = async (id) => {
    try {
      await archiveOpportunity(id)
      loadOpportunities()
    } catch (err) {
      console.error('Failed to archive opportunity:', err)
    }
  }

  const handleUnarchive = async (id) => {
    try {
      await unarchiveOpportunity(id)
      loadOpportunities()
    } catch (err) {
      console.error('Failed to unarchive opportunity:', err)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('确定要删除这个商机吗？')) return
    try {
      await deleteOpportunity(id)
      loadOpportunities()
    } catch (err) {
      console.error('Failed to delete opportunity:', err)
    }
  }

  const getStatus = (opp) => {
    if (opp.status === 'archived') return '已归档'
    const nodes = opp.nodes || []
    const hasInProgress = nodes.some(n => n.status === '进行中')
    const hasPending = nodes.some(n => n.status === '待办')
    if (hasInProgress) return '活跃'
    if (hasPending) return '待跟进'
    return '待跟进'
  }

  const getLatestNode = (opp) => {
    const nodes = opp.nodes || []
    if (nodes.length === 0) return null
    const sorted = [...nodes].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    return sorted[0]
  }

  const getAssignees = (opp) => {
    const nodes = opp.nodes || []
    const assignees = [...new Set(nodes.map(n => n.assignee).filter(a => a))]
    return assignees
  }

  const getActiveThreads = (opp) => {
    const nodes = opp.nodes || []
    const activeNodes = nodes.filter(n => n.status === '进行中')
    return activeNodes.length
  }

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now - date
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor(diff / (1000 * 60))

    if (days > 0) return `${days}天前`
    if (hours > 0) return `${hours}小时前`
    if (minutes > 0) return `${minutes}分钟前`
    return '刚刚'
  }

  const handleLogout = async () => {
    try {
      logout()
      navigate('/login')
    } catch (err) {
      console.error('Failed to logout:', err)
    }
  }

  const filteredOpportunities = opportunities.filter(opp => {
    if (filter === 'all') return true
    return getStatus(opp) === filter || opp.status === filter
  })

  return (
    <div className="min-h-screen bg-surface-soft">
      <header className="bg-canvas border-b border-hairline sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-on-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-display-md font-semibold text-ink">商机总览</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/settings')}
              className="w-10 h-10 rounded-full bg-surface-strong flex items-center justify-center text-ink hover:bg-surface-soft transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button
              onClick={handleLogout}
              className="w-10 h-10 rounded-full bg-surface-strong flex items-center justify-center text-ink hover:bg-surface-soft transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { key: 'all', label: '全部' },
              { key: '活跃', label: '活跃' },
              { key: '待跟进', label: '待跟进' },
              { key: '已归档', label: '已归档' },
            ].map(item => (
              <button
                key={item.key}
                onClick={() => setFilter(item.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === item.key
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-card text-ink hover:bg-surface-soft'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary text-on-primary rounded-sm font-medium hover:bg-primary-active transition-colors whitespace-nowrap"
          >
            + 新建商机
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-surface-strong rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <p className="text-body-md text-muted">暂无商机数据</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOpportunities.map(opp => {
              const status = getStatus(opp)
              const latestNode = getLatestNode(opp)
              const assignees = getAssignees(opp)
              const activeThreads = getActiveThreads(opp)
              const totalNodes = (opp.nodes || []).length

              return (
                <div
                  key={opp.id}
                  className={`bg-surface-card rounded-md border-l-4 ${STATUS_COLORS[status]} shadow-sm hover:shadow-md transition-shadow cursor-pointer group`}
                  onClick={() => navigate(`/opportunity/${opp.id}`)}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-title-md text-ink group-hover:text-primary transition-colors pr-2 flex-1">
                        {opp.name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_BADGE_COLORS[status]}`}>
                        {status}
                      </span>
                    </div>

                    {latestNode && (
                      <div className="mb-3 p-2 bg-surface-soft rounded text-sm">
                        <div className="text-muted text-xs mb-1">最近动态</div>
                        <div className="text-ink truncate">{latestNode.title}</div>
                        <div className="text-muted text-xs mt-1">
                          {latestNode.assignee && <span>{latestNode.assignee} · </span>}
                          {formatTimeAgo(latestNode.updated_at)}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted mb-3">
                      <span>{totalNodes} 条记录</span>
                      {activeThreads > 0 && (
                        <span className="text-yellow-600 font-medium">
                          {activeThreads} 项进行中
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted">
                        {assignees.length > 0 ? (
                          <span className="truncate max-w-[160px]" title={assignees.join(', ')}>
                            👤 {assignees.slice(0, 3).join(', ')}{assignees.length > 3 ? ` +${assignees.length - 3}` : ''}
                          </span>
                        ) : (
                          <span className="text-muted-soft">无负责人</span>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {opp.status !== 'archived' ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleArchive(opp.id) }}
                            className="px-2 py-1 text-xs text-muted hover:text-primary hover:bg-primary/10 rounded transition-colors"
                          >
                            归档
                          </button>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleUnarchive(opp.id) }}
                            className="px-2 py-1 text-xs text-muted hover:text-primary hover:bg-primary/10 rounded transition-colors"
                          >
                            取消归档
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(opp.id) }}
                          className="px-2 py-1 text-xs text-muted hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {showCreateModal && (
        <>
          <div className="fixed inset-0 bg-scrim/50 z-50" onClick={() => setShowCreateModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-card rounded-lg shadow-xl p-6 w-full max-w-sm z-50">
            <h2 className="text-display-sm font-semibold text-ink mb-4">新建商机</h2>
            <input
              type="text"
              value={newOppName}
              onChange={(e) => setNewOppName(e.target.value)}
              className="w-full px-4 py-3 bg-canvas border border-hairline rounded-sm text-body-md text-ink placeholder-muted focus:outline-none focus:border-ink transition-colors mb-4"
              placeholder="输入商机名称"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2 bg-surface-strong text-ink rounded-sm hover:bg-surface-soft transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreate}
                disabled={!newOppName.trim()}
                className="flex-1 py-2 bg-primary text-on-primary rounded-sm hover:bg-primary-active disabled:bg-primary-disabled transition-colors"
              >
                创建
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
