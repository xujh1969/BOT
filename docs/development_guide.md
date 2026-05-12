# 商机详情页面开发经验总结

## 一、问题回顾

在开发商机详情页面的节点连线功能时，遇到了多个反复出现的问题：

### 1. 连线方向错误
**问题现象**：所有连线都从顶部圆点连接到顶部圆点，无法选择其他方向
**根本原因**：`MindMapNode` 组件中所有 `Handle` 都定义为 `type="source"`，没有定义 `type="target"`
**解决方案**：为每个方向同时定义 `source` 和 `target` 两种类型的 Handle

### 2. 重新加载连线位置错误
**问题现象**：重新加载页面后，连线位置恢复为默认的顶部到顶部
**根本原因**：数据模型只保存了 `parent_ids`，没有保存具体的 handle 连接信息
**解决方案**：使用 `parent_relations` 字段替代 `parent_ids`，记录 `parent_id`、`source_handle`、`target_handle`

### 3. 删除线段无效
**问题现象**：删除线段后重新加载，线段依然存在
**根本原因**：删除时手动过滤 edges 而不是使用 `applyEdgeChanges`
**解决方案**：使用 React Flow 提供的 `applyEdgeChanges` 处理所有 edge 变更

### 4. 全量保存保存空数据
**问题现象**：保存后所有节点数据消失
**根本原因**：JavaScript 默认参数在函数定义时求值，当时 `nodes` 是空数组
**解决方案**：使用 `useRef` 动态获取最新的 nodes 值

### 5. 删除线段不触发保存
**问题现象**：删除线段后没有触发全量保存
**根本原因**：使用 `edgesRef.current` 而不是 `edges` 状态，ref 在状态更新后才更新
**解决方案**：直接使用 `edges` 状态，并添加到依赖数组

### 6. 删除按钮删除不触发保存
**问题现象**：点击「删除选中」按钮删除线段不触发保存
**根本原因**：`handleDelete` 函数只删除了 edges 状态，没有更新节点的 `parent_relations`
**解决方案**：在 `handleDelete` 中更新 `parent_relations` 并调用 `debouncedSaveAll`

### 7. 同心圆设计连接问题
**问题现象**：用户拖拽连线时容易命中错误的 handle
**根本原因**：同心圆设计中 source handle 在上方（z-index 更高），用户更容易命中
**解决方案**：在 `onConnect` 中添加 handle 解析逻辑，自动识别方向

---

## 二、最佳实践

### 1. Handle 配置规范

```jsx
// 每个方向必须同时定义 source 和 target handle
<Handle type="target" position={Position.Top} id="top-target" className="handle-target-outer" />
<Handle type="source" position={Position.Top} id="top-source" className="handle-source-inner" />
```

### 2. 数据模型设计

使用 `parent_relations` 替代 `parent_ids`：

```javascript
// 推荐
parent_relations: [
  { parent_id: "node1", source_handle: "bottom", target_handle: "top" }
]

// 不推荐
parent_ids: ["node1"]
```

### 3. 状态更新原则

- **直接使用状态**：在事件处理函数中直接使用状态值，不要依赖 ref
- **正确依赖数组**：将使用的状态添加到 `useCallback`/`useEffect` 的依赖数组
- **避免闭包陷阱**：使用 `useRef` 存储需要在异步回调中访问的最新值

### 4. 删除操作规范

```javascript
const handleDelete = useCallback(() => {
  // 1. 获取要删除的边
  const edgesToRemove = new Set(selectedEdges.map(e => e.id))
  
  // 2. 更新节点的 parent_relations
  setNodes(prev => {
    let newNodes = prev.filter(n => !selectedNodes.includes(n.id))
    newNodes = newNodes.map(n => {
      const newRelations = n.data.parent_relations.filter(r => 
        !edgesToRemove.has(`${r.parent_id}-${n.id}-${r.source_handle}-${r.target_handle}`)
      )
      return { ...n, data: { ...n.data, parent_relations: newRelations } }
    })
    // 3. 触发保存
    debouncedSaveAll(newNodes)
    return newNodes
  })
  
  // 4. 更新 edges 状态
  setEdges(prev => prev.filter(e => !edgesToRemove.has(e.id)))
}, [selectedNodes, selectedEdges, edges, debouncedSaveAll])
```

### 5. 连接创建规范

```javascript
const onConnect = useCallback((params) => {
  // 1. 解析 handle，处理同心圆设计的命中问题
  let sourceHandle = params.sourceHandle || 'bottom-source'
  let targetHandle = params.targetHandle || 'top-target'
  
  // 2. 提取方向信息
  const sourceHandleType = sourceHandle.replace('-source', '').replace('-target', '')
  const targetHandleType = targetHandle.replace('-source', '').replace('-target', '')
  
  // 3. 创建 edge
  const newEdge = {
    id: `${params.source}-${params.target}-${sourceHandleType}-${targetHandleType}`,
    source: params.source,
    target: params.target,
    sourceHandle,
    targetHandle
  }
  setEdges(prev => addEdge(newEdge, prev))
  
  // 4. 更新节点的 parent_relations
  setNodes(prev => {
    const newNodes = prev.map(n => {
      if (n.id === params.target) {
        const newRelations = [...(n.data.parent_relations || []), {
          parent_id: params.source,
          source_handle: sourceHandleType,
          target_handle: targetHandleType
        }]
        return { ...n, data: { ...n.data, parent_relations: newRelations } }
      }
      return n
    })
    // 5. 触发保存
    debouncedSaveAll(newNodes)
    return newNodes
  })
}, [debouncedSaveAll])
```

### 6. 全量保存实现

```javascript
const nodesRef = useRef(nodes)
useEffect(() => {
  nodesRef.current = nodes
}, [nodes])

const debouncedSaveAll = useCallback((nodesToSaveArg) => {
  const nodesToSave = nodesToSaveArg || nodesRef.current
  if (!nodesToSave || nodesToSave.length === 0) {
    return
  }
  
  if (saveTimeoutRef.current) {
    clearTimeout(saveTimeoutRef.current)
  }
  
  saveTimeoutRef.current = setTimeout(async () => {
    const dataToSave = nodesToSave.map(node => ({
      id: node.id,
      title: node.data.label,
      parent_relations: node.data.parent_relations || [],
      position_x: node.position.x,
      position_y: node.position.y,
      // ... 其他字段
    }))
    await saveAllNodes(id, dataToSave)
  }, 300)
}, [id])
```

---

## 三、调试技巧

### 1. 添加详细日志

在关键函数入口添加日志，追踪执行流程：

```javascript
const onEdgesChange = useCallback((changes) => {
  addLog('DEBUG', 'onEdgesChange 被调用', { changeCount: changes.length, types: changes.map(c => c.type) })
  // ...
}, [debouncedSaveAll, edges])
```

### 2. 服务器端日志

在 API 端点添加日志，确认请求是否到达：

```python
@app.post("/api/opportunities/{id}/save-all")
async def save_all_nodes(id: str, data: dict, request: Request):
    print(f"[SERVER] 接收到全量保存请求, opportunityId: {id}")
    if 'nodes' in data:
        print(f"[SERVER] 正在保存 {len(data['nodes'])} 个节点")
    # ...
```

### 3. 验证数据文件

定期检查数据文件内容，确认保存的数据格式正确：

```bash
cat data/{opportunity_id}.json
```

---

## 四、常见陷阱

| 陷阱 | 症状 | 解决方案 |
|------|------|----------|
| 默认参数在定义时求值 | 保存空数据 | 使用 useRef 动态获取最新值 |
| 依赖数组缺少状态 | 闭包中使用旧值 | 添加正确的依赖 |
| Ref 未及时更新 | 删除时找不到边 | 直接使用状态而非 ref |
| 只更新状态不保存 | 修改丢失 | 在状态更新后调用保存函数 |
| Handle 类型错误 | 连线方向错误 | 同时定义 source 和 target |

---

## 五、总结

成功实现节点连线功能的关键在于：

1. **正确配置 Handle**：每个方向同时定义 source 和 target
2. **完整的数据模型**：保存详细的连接关系信息
3. **状态管理规范**：正确使用状态和依赖数组
4. **删除逻辑完整**：同时更新 edges 和 nodes 的 parent_relations
5. **调试日志完善**：添加详细日志追踪问题

遵循这些原则可以避免大部分常见问题，提高开发效率和代码可靠性。