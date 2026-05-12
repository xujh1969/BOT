import { useState, useEffect } from 'react'
import { login } from '../api'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isFirstTime, setIsFirstTime] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login: setAuth, checkAuth, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    checkAuth()
    fetch('/api/check-first-time')
      .then(res => res.json())
      .then(data => {
        if (data.is_first_time) {
          setIsFirstTime(true)
        }
      })
      .catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (isFirstTime) {
        if (newPassword !== confirmPassword) {
          setError('登录密码两次输入不一致')
          return
        }
        if (adminPassword !== confirmAdminPassword) {
          setError('管理员密码两次输入不一致')
          return
        }
        if (!newPassword || !adminPassword) {
          setError('请填写所有密码字段')
          return
        }

        await fetch('/api/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ loginPassword: newPassword, adminPassword })
        })
        
        await login(newPassword)
      } else {
        await login(password)
      }
      setAuth()
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || '登录失败，请检查密码')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-on-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-display-lg font-semibold text-ink mb-2">商机跟踪管理</h1>
          <p className="text-body-sm text-muted">
            {isFirstTime ? '首次使用，请设置密码' : '请输入登录密码'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface-card rounded-lg shadow-lg p-6 space-y-6">
          {isFirstTime ? (
            <>
              <div>
                <label className="block text-caption text-ink mb-2">登录密码</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-canvas border border-hairline rounded-sm text-body-md text-ink placeholder-muted focus:outline-none focus:border-ink transition-colors"
                  placeholder="设置登录密码（4-5人共享）"
                />
              </div>
              <div>
                <label className="block text-caption text-ink mb-2">确认登录密码</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-canvas border border-hairline rounded-sm text-body-md text-ink placeholder-muted focus:outline-none focus:border-ink transition-colors"
                  placeholder="再次输入登录密码"
                />
              </div>
              <div>
                <label className="block text-caption text-ink mb-2">管理员密码</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-canvas border border-hairline rounded-sm text-body-md text-ink placeholder-muted focus:outline-none focus:border-ink transition-colors"
                  placeholder="设置管理员密码（单独保管）"
                />
              </div>
              <div>
                <label className="block text-caption text-ink mb-2">确认管理员密码</label>
                <input
                  type="password"
                  value={confirmAdminPassword}
                  onChange={(e) => setConfirmAdminPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-canvas border border-hairline rounded-sm text-body-md text-ink placeholder-muted focus:outline-none focus:border-ink transition-colors"
                  placeholder="再次输入管理员密码"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-caption text-ink mb-2">登录密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-canvas border border-hairline rounded-sm text-body-md text-ink placeholder-muted focus:outline-none focus:border-ink transition-colors"
                placeholder="请输入登录密码"
                autoFocus
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-primary-error-text">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary text-on-primary font-medium rounded-sm hover:bg-primary-active disabled:bg-primary-disabled transition-colors"
          >
            {isLoading ? '处理中...' : (isFirstTime ? '完成设置' : '登录')}
          </button>
        </form>

        {!isFirstTime && (
          <p className="text-center text-caption-sm text-muted mt-4">
            忘记密码？请联系管理员重置
          </p>
        )}
      </div>
    </div>
  )
}
