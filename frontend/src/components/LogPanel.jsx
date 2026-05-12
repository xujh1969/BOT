import { useState, useEffect, useRef, useCallback } from "react"

const LOG_TYPES = {
  INFO: { color: 'text-blue-600', bg: 'bg-blue-50', label: 'INFO' },
  WARN: { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'WARN' },
  ERROR: { color: 'text-red-600', bg: 'bg-red-50', label: 'ERROR' },
  SUCCESS: { color: 'text-green-600', bg: 'bg-green-50', label: 'SUCCESS' },
  DEBUG: { color: 'text-gray-600', bg: 'bg-gray-50', label: 'DEBUG' },
}

export const useLog = () => {
  const [logs, setLogs] = useState([])

  const addLog = useCallback((type, message, details = {}) => {
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
      type,
      message,
      details,
    }
    setLogs(prev => [...prev.slice(-99), newLog])
    console.log(`[${LOG_TYPES[type].label}] ${message}`, details)
  }, [])

  return { logs, addLog }
}

export default function LogPanel({ logs, isOpen, onClose }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs, isOpen])

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="font-medium text-gray-700">操作日志</h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{logs.length} 条记录</span>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl font-light"
            >
              ×
            </button>
          </div>
        </div>
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-2"
        >
          {logs.length === 0 ? (
            <div className="text-center text-gray-400 py-8">暂无日志记录</div>
          ) : (
            logs.map(log => (
              <div
                key={log.id}
                className={`px-3 py-2 rounded-lg text-sm ${LOG_TYPES[log.type].bg}`}
              >
                <div className="flex items-start gap-2">
                  <span className={`font-medium ${LOG_TYPES[log.type].color}`}>
                    [{LOG_TYPES[log.type].label}]
                  </span>
                  <span className="text-gray-400 text-xs">{log.timestamp}</span>
                </div>
                <div className={`mt-1 ${LOG_TYPES[log.type].color}`}>
                  {log.message}
                </div>
                {Object.keys(log.details).length > 0 && (
                  <div className="mt-1 text-xs text-gray-500 font-mono max-w-full break-all">
                    {JSON.stringify(log.details)}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
          <button
            onClick={() => {
              navigator.clipboard.writeText(
                logs.map(l => `[${l.timestamp}] [${LOG_TYPES[l.type].label}] ${l.message}`).join('\n')
              )
            }}
            className="w-full text-sm text-blue-600 hover:text-blue-700 py-2"
          >
            📋 复制日志
          </button>
        </div>
      </div>
    </>
  )
}