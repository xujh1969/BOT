import { useState, useEffect } from 'react'

const STATUS_OPTIONS = ['待办', '进行中', '已完成', '超时']

export default function NodeModal({ isOpen, onClose, onSave, editData, opportunityId }) {
  const [formData, setFormData] = useState({
    title: '',
    assignee: '',
    department: '',
    description: '',
    acceptance_criteria: '',
    start_date: '',
    due_date: '',
    risk: '',
    status: '待办',
  })
  const [showDescription, setShowDescription] = useState(false)

  useEffect(() => {
    if (editData) {
      setFormData({
        title: editData.label || '',
        assignee: editData.assignee || '',
        department: editData.department || '',
        description: editData.description || '',
        acceptance_criteria: editData.acceptance_criteria || '',
        start_date: editData.start_date || '',
        due_date: editData.due_date || '',
        risk: editData.risk || '',
        status: editData.status || '待办',
      })
      setShowDescription((editData.description || '').length > 0)
    } else {
      setFormData({
        title: '',
        assignee: '',
        department: '',
        description: '',
        acceptance_criteria: '',
        start_date: '',
        due_date: '',
        risk: '',
        status: '待办',
      })
      setShowDescription(false)
    }
  }, [editData])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const nodeData = {
      label: formData.title,
      assignee: formData.assignee,
      department: formData.department,
      description: formData.description,
      acceptance_criteria: formData.acceptance_criteria,
      start_date: formData.start_date,
      due_date: formData.due_date,
      risk: formData.risk,
      status: formData.status,
      parent_relations: editData?.parent_relations || [],
      sequence: editData?.sequence || 1,
    }

    onSave(nodeData, editData?.id)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            {editData ? '编辑节点' : '新建节点'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              任务名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              placeholder="请输入明确的任务描述"
            />
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setShowDescription(!showDescription)}
              className="w-full px-3 py-1.5 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between text-sm text-gray-600"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                任务详情
              </span>
              <svg 
                className={`w-4 h-4 transition-transform ${showDescription ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showDescription && (
              <div className="p-3 border-t border-gray-200">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none text-sm"
                  placeholder="输入任务的详细描述..."
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">负责人</label>
              <input
                type="text"
                name="assignee"
                value={formData.assignee}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                placeholder="负责人"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">部门</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                placeholder="部门"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              >
                {STATUS_OPTIONS.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              验收标准 <span className="text-red-500">*</span>
            </label>
            <textarea
              name="acceptance_criteria"
              value={formData.acceptance_criteria}
              onChange={handleChange}
              required
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none text-sm"
              placeholder="描述任务完成的标准和验收条件"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">截止日期</label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">风险提示</label>
            <textarea
              name="risk"
              value={formData.risk}
              onChange={handleChange}
              rows={1}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none text-sm"
              placeholder="描述存在的困难、风险或能力相关问题"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              {editData ? '保存修改' : '创建节点'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}