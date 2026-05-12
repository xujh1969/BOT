import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { changePassword } from '../api'

export default function Settings() {
  const [adminPassword, setAdminPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    try {
      if (newPassword !== confirmPassword) {
        setError('新密码两次输入不一致')
        return
      }
      if (!adminPassword || !newPassword) {
        setError('请填写所有字段')
        return
      }

      await changePassword(adminPassword, newPassword)
      setSuccess('密码修改成功')
      setAdminPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err.response?.data?.message || '修改失败，请检查管理员密码')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-soft">
      <header className="bg-canvas border-b border-hairline px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="text-muted hover:text-ink transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-display-md font-semibold text-ink">设置</h1>
      </header>

      <main className="max-w-md mx-auto px-4 py-8">
        <div className="bg-surface-card rounded-lg shadow-sm p-6">
          <h2 className="text-display-sm font-semibold text-ink mb-2">修改登录密码</h2>
          <p className="text-body-sm text-muted mb-6">需要验证管理员密码才能修改共享登录密码</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-caption text-ink mb-2">管理员密码</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-3 bg-canvas border border-hairline rounded-sm text-body-md text-ink placeholder-muted focus:outline-none focus:border-ink transition-colors"
                placeholder="输入管理员密码"
              />
            </div>

            <div>
              <label className="block text-caption text-ink mb-2">新登录密码</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-canvas border border-hairline rounded-sm text-body-md text-ink placeholder-muted focus:outline-none focus:border-ink transition-colors"
                placeholder="设置新的登录密码"
              />
            </div>

            <div>
              <label className="block text-caption text-ink mb-2">确认新密码</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-canvas border border-hairline rounded-sm text-body-md text-ink placeholder-muted focus:outline-none focus:border-ink transition-colors"
                placeholder="再次输入新密码"
              />
            </div>

            {error && (
              <p className="text-sm text-primary-error-text">{error}</p>
            )}

            {success && (
              <p className="text-sm text-green-600">{success}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary text-on-primary font-medium rounded-sm hover:bg-primary-active disabled:bg-primary-disabled transition-colors"
            >
              {isLoading ? '处理中...' : '修改密码'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-surface-soft rounded-sm">
            <h3 className="text-title-sm font-medium text-ink mb-2">注意事项</h3>
            <ul className="text-body-sm text-muted space-y-2">
              <li>• 管理员密码仅由管理员保管，修改后全员生效</li>
              <li>• 忘记管理员密码需手动修改 config.json 文件</li>
              <li>• 建议定期更新登录密码，确保团队安全</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
