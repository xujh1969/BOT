import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ReactFlowProvider, ReactFlow, Background, Controls, MiniMap, addEdge, applyNodeChanges, applyEdgeChanges, Handle, Position } from "@xyflow/react"
import { getOpportunity, createNode, updateNode, deleteNode, saveAllNodes } from "../api"
import LogPanel, { useLog } from "../components/LogPanel"

const STATUS_COLORS = {
  '已完成': { bg: '#d1fae5', border: '#10b981', text: '#10b981' },
  '进行中': { bg: '#fef3c7', border: '#f59e0b', text: '#f59e0b' },
  '待办': { bg: '#dbeafe', border: '#3b82f6', text: '#3b82f6' },
}

function MindMapNode({ data, selected }) {
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
      <Handle type="target" position={Position.Top} id="top-target" className="handle-target-outer" />
      <Handle type="source" position={Position.Top} id="top-source" className="handle-source-inner" />
      <Handle type="target" position={Position.Right} id="right-target" className="handle-target-outer" />
      <Handle type="source" position={Position.Right} id="right-source" className="handle-source-inner" />
      <Handle type="target" position={Position.Bottom} id="bottom-target" className="handle-target-outer" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" className="handle-source-inner" />
      <Handle type="target" position={Position.Left} id="left-target" className="handle-target-outer" />
      <Handle type="source" position={Position.Left} id="left-source" className="handle-source-inner" />

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

const nodeTypes = {
  mindmap: MindMapNode
}

export default function Opportunity() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [opp, setOpp] = useState(null)
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [selectedNodes, setSelectedNodes] = useState([])
  const [selectedEdges, setSelectedEdges] = useState([])
  const [showLogPanel, setShowLogPanel] = useState(false)
  const nodePositionRef = useRef({})
  const saveTimeoutRef = useRef(null)
  const edgesRef = useRef([])
  const { logs, addLog } = useLog()

  useEffect(() => {
    edgesRef.current = edges
  }, [edges])

  const nodesRef = useRef(nodes)
  useEffect(() => {
    nodesRef.current = nodes
  }, [nodes])

  const debouncedSaveAll = useCallback((nodesToSaveArg) => {
    const nodesToSave = nodesToSaveArg || nodesRef.current
    addLog('DEBUG', 'debouncedSaveAll 被调用', { hasArg: nodesToSaveArg !== undefined, nodeCount: nodesToSave?.length || 0 })
    
    if (!nodesToSave || nodesToSave.length === 0) {
      addLog('WARN', '无节点数据需要保存')
      return
    }
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    saveTimeoutRef.current = setTimeout(async () => {
      addLog('INFO', '开始全量保存节点数据', { nodeCount: nodesToSave.length })
      try {
        const dataToSave = nodesToSave.map(node => ({
          id: node.id,
          opportunity_id: id,
          title: node.data.label,
          assignee: node.data.assignee || "",
          deadline: node.data.deadline || "",
          status: node.data.status || "待办",
          notes: "",
          is_smart: node.data.isSmart || false,
          smart_s: "",
          smart_m: "",
          smart_a: "",
          smart_r: "",
          smart_t: "",
          parent_relations: node.data.parent_relations || [],
          sequence: node.data.sequence || 1,
          position_x: node.position.x,
          position_y: node.position.y,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))
        await saveAllNodes(id, dataToSave)
        addLog('SUCCESS', '全量保存成功', { nodeCount: nodesToSave.length })
      } catch (err) {
        addLog('ERROR', '全量保存失败', { error: err.message })
        console.error("Failed to save all nodes:", err)
      }
    }, 300)
  }, [id])

  useEffect(() => {
    addLog('INFO', '开始加载项目数据', { opportunityId: id })
    getOpportunity(id).then(data => {
      addLog('SUCCESS', '项目数据加载成功', { opportunityName: data.name })
      setOpp(data)
      const ns = []
      const es = []
      if (data.nodes) {
        data.nodes.forEach((n, i) => {
          const parentRelations = n.parent_relations || []
          ns.push({
            id: n.id,
            type: "mindmap",
            data: {
              label: n.title,
              status: n.status || "待办",
              assignee: n.assignee || "",
              deadline: n.deadline || "",
              isSmart: n.is_smart || false,
              sequence: n.sequence || (i + 1),
              parent_relations: parentRelations
            },
            position: { x: n.position_x || 100 + (i % 3) * 250, y: n.position_y || 100 + Math.floor(i / 3) * 180 },
          })
          nodePositionRef.current[n.id] = { x: n.position_x || 100, y: n.position_y || 100 }
          if (parentRelations && parentRelations.length > 0) {
            parentRelations.forEach(relation => {
              const srcHandle = relation.source_handle || "top"
              const tgtHandle = relation.target_handle || "right"
              es.push({
                id: `${relation.parent_id}-${n.id}-${srcHandle}-${tgtHandle}`,
                source: relation.parent_id,
                target: n.id,
                type: "smoothstep",
                sourceHandle: `${srcHandle}-source`,
                targetHandle: `${tgtHandle}-target`,
              })
            })
          } else if (n.parent_ids && n.parent_ids.length > 0) {
            n.parent_ids.forEach(parentId => {
              es.push({
                id: `${parentId}-${n.id}-top-right`,
                source: parentId,
                target: n.id,
                type: "smoothstep",
                sourceHandle: "top-source",
                targetHandle: "right-target",
              })
            })
          }
        })
      }
      addLog('INFO', `节点和连线加载完成`, { nodeCount: ns.length, edgeCount: es.length })
      setNodes(ns)
      setEdges(es)
    }).catch(err => {
      addLog('ERROR', '项目数据加载失败', { error: err.message })
      console.error("Failed to load:", err)
    })
  }, [id])

  const onNodesChange = useCallback((changes) => {
    changes.forEach(change => {
      if (change.type === 'position') {
        addLog('INFO', `节点位置变更`, { nodeId: change.id, position: change.position })
      } else if (change.type === 'remove') {
        addLog('INFO', `节点删除`, { nodeId: change.id })
      }
    })
    setNodes(prev => {
      const newNodes = applyNodeChanges(changes, prev)
      debouncedSaveAll(newNodes)
      return newNodes
    })
  }, [debouncedSaveAll])

  const onEdgesChange = useCallback((changes) => {
    addLog('DEBUG', 'onEdgesChange 被调用', { changeCount: changes.length, types: changes.map(c => c.type) })
    const removalChanges = changes.filter(c => c.type === 'remove')
    if (removalChanges.length > 0) {
      const edgesToRemove = removalChanges.map(r => r.id)
      const edgesCopy = [...edges]
      
      removalChanges.forEach(change => {
        const edge = edgesCopy.find(e => e.id === change.id)
        if (edge) {
          addLog('INFO', `连线删除`, { 
            edgeId: change.id, 
            source: edge.source, 
            target: edge.target,
            sourceHandle: edge.sourceHandle,
            targetHandle: edge.targetHandle
          })
        }
      })
      
      setNodes(prev => {
        let newNodes = [...prev]
        
        removalChanges.forEach(change => {
          const edge = edgesCopy.find(e => e.id === change.id)
          if (edge && edge.target && edge.source) {
            const srcHandle = edge.sourceHandle?.replace('-source', '') || 'top'
            const tgtHandle = edge.targetHandle?.replace('-target', '') || 'right'
            newNodes = newNodes.map(n => {
              if (n.id === edge.target) {
                const currentRelations = n.data.parent_relations || []
                const newRelations = currentRelations.filter(r => 
                  !(r.parent_id === edge.source && 
                    r.source_handle === srcHandle && 
                    r.target_handle === tgtHandle)
                )
                return { ...n, data: { ...n.data, parent_relations: newRelations } }
              }
              return n
            })
          }
        })
        
        debouncedSaveAll(newNodes)
        return newNodes
      })
      
      setEdges(prev => applyEdgeChanges(changes, prev))
    } else {
      setEdges(prev => applyEdgeChanges(changes, prev))
    }
  }, [debouncedSaveAll, edges])

  const onConnect = useCallback((params) => {
    let sourceHandle = params.sourceHandle
    let targetHandle = params.targetHandle
    
    if (!sourceHandle || !sourceHandle.includes('-')) {
      sourceHandle = 'bottom-source'
    }
    if (!targetHandle || !targetHandle.includes('-')) {
      targetHandle = 'top-target'
    }
    
    const sourceHandleType = sourceHandle.replace('-source', '').replace('-target', '')
    const targetHandleType = targetHandle.replace('-source', '').replace('-target', '')
    
    addLog('INFO', `创建连线`, { 
      source: params.source, 
      target: params.target,
      sourceHandle: params.sourceHandle,
      targetHandle: params.targetHandle,
      resolvedSourceHandle: sourceHandleType,
      resolvedTargetHandle: targetHandleType
    })
    
    const newEdge = {
      id: `${params.source}-${params.target}-${sourceHandleType}-${targetHandleType}`,
      source: params.source,
      target: params.target,
      type: "smoothstep",
      sourceHandle: sourceHandle,
      targetHandle: targetHandle
    }
    setEdges(prev => addEdge(newEdge, prev))

    const targetNodeId = params.target
    if (targetNodeId && params.source) {
      setNodes(prev => {
        const targetNode = prev.find(n => n.id === targetNodeId)
        if (targetNode) {
          const currentRelations = targetNode.data.parent_relations || []
          const exists = currentRelations.some(r => r.parent_id === params.source && 
            r.source_handle === sourceHandleType && r.target_handle === targetHandleType)
          if (!exists) {
            const newRelations = [...currentRelations, {
              parent_id: params.source,
              source_handle: sourceHandleType,
              target_handle: targetHandleType
            }]
            const newNodes = prev.map(n =>
              n.id === targetNodeId
                ? { ...n, data: { ...n.data, parent_relations: newRelations } }
                : n
            )
            debouncedSaveAll(newNodes)
            return newNodes
          }
        }
        return prev
      })
    }
  }, [debouncedSaveAll])

  const onSelectionChange = useCallback((params) => {
    setSelectedNodes(params.nodes || [])
    setSelectedEdges(params.edges || [])
  }, [])

  const handleDelete = useCallback(async () => {
    if (selectedNodes.length === 0 && selectedEdges.length === 0) return

    const nodeIdsToDelete = selectedNodes.map(n => n.id)
    const edgeIdsToDelete = selectedEdges.map(e => e.id)
    
    addLog('INFO', `删除操作`, { nodes: nodeIdsToDelete, edges: edgeIdsToDelete })

    for (const nodeId of nodeIdsToDelete) {
      try {
        await deleteNode(nodeId)
        addLog('SUCCESS', `节点删除成功`, { nodeId })
      } catch (err) {
        addLog('ERROR', `节点删除失败`, { nodeId, error: err.message })
        console.error("Failed to delete node:", err)
      }
    }

    const edgesCopy = [...edges]
    const edgesToRemove = new Set(edgeIdsToDelete)
    nodeIdsToDelete.forEach(nodeId => {
      edgesCopy.forEach(e => {
        if (e.source === nodeId || e.target === nodeId) {
          edgesToRemove.add(e.id)
        }
      })
    })

    setNodes(prev => {
      let newNodes = prev.filter(n => !nodeIdsToDelete.includes(n.id))
      
      edgesCopy.forEach(edge => {
        if (edgesToRemove.has(edge.id) && edge.target && edge.source) {
          const srcHandle = edge.sourceHandle?.replace('-source', '') || 'top'
          const tgtHandle = edge.targetHandle?.replace('-target', '') || 'right'
          newNodes = newNodes.map(n => {
            if (n.id === edge.target) {
              const currentRelations = n.data.parent_relations || []
              const newRelations = currentRelations.filter(r => 
                !(r.parent_id === edge.source && 
                  r.source_handle === srcHandle && 
                  r.target_handle === tgtHandle)
              )
              return { ...n, data: { ...n.data, parent_relations: newRelations } }
            }
            return n
          })
        }
      })

      debouncedSaveAll(newNodes)
      return newNodes
    })

    setEdges(prev => prev.filter(e => !edgesToRemove.has(e.id)))

    setSelectedNodes([])
    setSelectedEdges([])
  }, [selectedNodes, selectedEdges, edges, debouncedSaveAll])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && !e.ctrlKey && !e.metaKey) {
        const target = e.target
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
        if (selectedNodes.length > 0 || selectedEdges.length > 0) {
          handleDelete()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedNodes, selectedEdges, handleDelete])

  const handleAddNode = async () => {
    addLog('INFO', '开始创建新节点')
    try {
      const newNode = await createNode(id, {
        title: "新节点",
        status: "待办",
        parent_ids: []
      })
      addLog('SUCCESS', '新节点创建成功', { nodeId: newNode.id })
      const data = await getOpportunity(id)
      setOpp(data)
      const ns = []
      const es = []
      if (data.nodes) {
        data.nodes.forEach((n, i) => {
          const parentRelations = n.parent_relations || []
          ns.push({
            id: n.id,
            type: "mindmap",
            data: {
              label: n.title,
              status: n.status || "待办",
              assignee: n.assignee || "",
              deadline: n.deadline || "",
              isSmart: n.is_smart || false,
              sequence: n.sequence || (i + 1),
              parent_relations: parentRelations
            },
            position: { x: n.position_x || 100 + (i % 3) * 250, y: n.position_y || 100 + Math.floor(i / 3) * 180 },
          })
          nodePositionRef.current[n.id] = { x: n.position_x || 100, y: n.position_y || 100 }
          if (parentRelations && parentRelations.length > 0) {
            parentRelations.forEach(relation => {
              const srcHandle = relation.source_handle || "top"
              const tgtHandle = relation.target_handle || "right"
              es.push({
                id: `${relation.parent_id}-${n.id}-${srcHandle}-${tgtHandle}`,
                source: relation.parent_id,
                target: n.id,
                type: "smoothstep",
                sourceHandle: `${srcHandle}-source`,
                targetHandle: `${tgtHandle}-target`,
              })
            })
          } else if (n.parent_ids && n.parent_ids.length > 0) {
            n.parent_ids.forEach(parentId => {
              es.push({
                id: `${parentId}-${n.id}-top-right`,
                source: parentId,
                target: n.id,
                type: "smoothstep",
                sourceHandle: "top-source",
                targetHandle: "right-target",
              })
            })
          }
        })
      }
      setNodes(ns)
      setEdges(es)
    } catch (err) {
      addLog('ERROR', '新节点创建失败', { error: err.message })
      console.error("Failed to add node:", err)
    }
  }

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  if (!opp) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-600">加载中...</div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      <style>{`
        .handle-target-outer {
          width: 14px !important;
          height: 14px !important;
          background: #374151 !important;
          border: 2px solid white !important;
          border-radius: 50% !important;
          opacity: 1 !important;
          z-index: 1 !important;
        }
        .handle-target-outer:hover {
          background: #1f2937 !important;
        }
        .handle-source-inner {
          width: 8px !important;
          height: 8px !important;
          background: white !important;
          border: 2px solid #374151 !important;
          border-radius: 50% !important;
          opacity: 1 !important;
          z-index: 2 !important;
        }
        .handle-source-inner:hover {
          background: #f3f4f6 !important;
        }
      `}</style>
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate("/")}
          className="text-gray-600 hover:text-gray-800 text-xl font-light"
        >
          ←
        </button>
        <h1 className="font-medium text-gray-800">{opp.name}</h1>
        <button
          onClick={handleAddNode}
          className="ml-auto bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-medium"
        >
          + 新建节点
        </button>
        <button
          onClick={handleDelete}
          disabled={selectedNodes.length === 0 && selectedEdges.length === 0}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          删除选中 ({selectedNodes.length + selectedEdges.length})
        </button>
        <button
          onClick={() => setShowLogPanel(!showLogPanel)}
          className={`px-4 py-2 rounded text-sm font-medium ${
            showLogPanel ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          📋 日志 {logs.length > 0 && `(${logs.length})`}
        </button>
      </header>
      <div className="flex-1 bg-gray-50">
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onSelectionChange={onSelectionChange}
            nodeTypes={nodeTypes}
            className="bg-gray-50"
            fitView
            connectionMode="loose"
            nodesDraggable
          >
            <Background color="#ccc" gap={16} />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
      <LogPanel
        logs={logs}
        isOpen={showLogPanel}
        onClose={() => setShowLogPanel(false)}
      />
    </div>
  )
}
