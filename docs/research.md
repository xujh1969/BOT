# 商机跟踪管理程序 — 设计文档

**日期：** 2026-05-09
**状态：** 已确认

---

## 1. 产品概述

一个带密码保护的商机跟踪管理 Web 应用。以中心辐射思维导图展示商机发展过程，节点按时间顺序连线，支持分叉与合并。本地运行，浏览器访问，手机和电脑均可使用。公司 4-5 人共享使用。

---

## 2. 页面结构

```
登录页 → 商机总览（首页）→ 单个商机详情（思维导图）
                         → 设置页（修改密码）
```

### 2.1 登录页
- 共享登录密码，公司 4-5 人使用同一个密码
- 密码哈希存储在 `config.json`
- 首次使用提示设置登录密码和管理员密码

### 2.2 设置页（修改密码）
- 位于首页右上角齿轮图标
- 修改共享登录密码：需要输入管理员密码 + 新登录密码
- 管理员密码只有一人掌握，修改后全员生效
- 首次设置后，管理员密码不可找回（忘记需手动修改 config.json）

### 2.3 商机总览（Dashboard）
- **卡片式布局**，每张卡片展示：商机名称、当前阶段、负责人、状态、超期提示
- **筛选栏**：全部 | 进行中 | 待启动 | 已完成 | 已归档
- 左侧颜色边框区分状态：🟡进行中 / 🔵待启动 / 🟢已完成 / 🔴超期
- 超期节点红色高亮提醒
- 点击卡片 → 进入思维导图详情页
- 右上角「+ 新建商机」按钮

### 2.4 商机详情页（思维导图）
- **中心辐射布局**（方案 C），节点按时间顺序连线，箭头表示发展方向
- 节点自动编号 ①②③...
- 连线带箭头，从早→晚方向
- **分叉**：一个节点 → 多条连线 → 多个并行子节点
- **合并**：多条连线汇聚 → 一个合并节点（虚线标识）
- 节点颜色：🟢已完成 / 🟡进行中 / 🔵待启动 / 🔴超期 / ⏳等待上游
- 节点显示：事项描述 + 负责人 + 截止时间
- 交互：
  - 单击节点 → 展开/收缩子节点
  - 双击节点 → 编辑面板（事项、负责人、截止时间、状态、备注）
  - 右键节点 → 菜单（添加子节点、添加兄弟节点、删除、设为SMART、取消SMART）
  - 拖拽调整布局
- 手机端：双指缩放 + 滑动平移 + 底部工具栏

### 2.5 SMART 关键节点
- 仅关键节点启用 SMART
- 启用后节点右上角显示 ⭐ 星标
- 点击星标 → 右侧弹出 SMART 面板，包含 S/M/A/R/T 五个字段
- 可随时取消 SMART 标记

### 2.6 归档机制
- 所有节点完成后，商机可手动归档
- 归档后从默认列表隐藏，在「已归档」分页查看
- 可随时取消归档恢复

---

## 3. 数据模型

### 商机 (Opportunity)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 唯一标识 |
| name | string | 商机名称 |
| status | active/archived | 商机状态 |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 最后修改时间 |

### 节点 (Node)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 唯一标识 |
| opportunity_id | string | 所属商机 |
| title | string | 事项描述 |
| assignee | string | 负责人 |
| deadline | date | 截止时间 |
| status | 待办/进行中/已完成 | 节点状态 |
| notes | string | 备注 |
| is_smart | boolean | 是否SMART节点 |
| smart_s | string | SMART-具体目标 |
| smart_m | string | SMART-衡量指标 |
| smart_a | string | SMART-可行性 |
| smart_r | string | SMART-相关性 |
| smart_t | string | SMART-时限 |
| parent_ids | string[] | 父节点ID列表（空=根节点，多个=合并） |
| sequence | number | 自动编号 |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 最后修改时间 |

---

## 4. 技术架构

| 层 | 技术 |
|----|------|
| 后端 | Python FastAPI |
| 前端 | React 18 + Vite |
| 思维导图 | ReactFlow |
| 存储 | JSON 文件 (`data/` 目录，每个商机一个文件) |
| 认证 | Session + 密码哈希（登录密码 + 管理员密码） |
| 样式 | 参考目录下的DESIGN.MD，根据用户指定的模版来进行设计 |
| 配置 | `config.json`（登录密码哈希、管理员密码哈希） |

**参考技术方案：**

@xyflow/react          — 图编辑核心
dagre / elkjs          — 自动布局算法
zustand / jotai        — 状态管理（React Flow 推荐 zustand）
antd / shadcn/ui       — 节点内的 UI 组件（表单、标签、图标）



### 项目结构

```
BOT/
├── server.py              # FastAPI 后端
├── config.json            # 配置（登录密码、管理员密码哈希）
├── data/                  # 商机数据
│   ├── opp_001.json
│   └── ...
├── frontend/              # React 前端
│   └── src/
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Opportunity.jsx
│       │   └── Settings.jsx
│       ├── components/
│       │   ├── MindMap.jsx
│       │   └── SmartPanel.jsx
│       └── api/
│           └── index.js       # API 调用封装
└── start.bat              # 一键启动
```

---

## 7. React Flow 实践经验

### 7.1 多方向连接点配置

**问题描述：**
默认情况下，React Flow 的 Handle 只允许 source→target 的单向连接。如果需要从节点的任意方向拖出连线并连接到任意节点，需要特殊配置。

**解决方案：**

1. **使用 `connectionMode="loose"`**
   ```jsx
   <ReactFlow
     connectionMode="loose"  // 允许从任意 source 连接到任意位置
     ...
   >
   ```

2. **所有 Handle 使用 `type="source"`**
   ```jsx
   <Handle type="source" position={Position.Top} id="top" />
   <Handle type="source" position={Position.Right} id="right" />
   <Handle type="source" position={Position.Bottom} id="bottom" />
   <Handle type="source" position={Position.Left} id="left" />
   ```

3. **每个 Handle 添加唯一 ID**
   - 便于调试和识别连接的起点/终点
   - ID 值应简洁明了（如：`top`, `right`, `bottom`, `left`）

4. **Handle 样式配置**
   ```jsx
   <Handle
     type="source"
     position={Position.Top}
     id="top"
     className="handle-source"
     style={{ top: -8 }}  // 偏移出节点边缘
   />
   ```

5. **内联样式确保优先级**
   ```jsx
   <style>{`
     .handle-source {
       width: 12px !important;
       height: 12px !important;
       background: #6b7280 !important;
       border: 2px solid white !important;
       border-radius: 50% !important;
       opacity: 1 !important;
     }
     .handle-source:hover {
       background: #374151 !important;
     }
   `}</style>
   ```

### 7.2 连接操作方式

- **拖出连线**：点击并拖动任意连接点（灰色圆点），拖到目标节点上释放
- **自由连接**：在 loose 模式下，可以从任意节点的任意连接点拖出，连接到任意节点

### 7.3 常见问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 只有上方原点能拖出 | Handle 类型配置错误 | 使用 `type="source"` 而非混合 source/target |
| 只有上方原点能接收 | 缺少 loose 模式 | 添加 `connectionMode="loose"` |
| 连接点不可见 | CSS 样式被覆盖 | 使用 `!important` 或内联样式 |
| 拖出方向固定 | 多个 Handle 位置重叠 | 添加唯一 ID 和位置偏移 |

### 7.4 节点组件结构示例

```jsx
function MindMapNode({ data, selected }) {
  return (
    <div className="node-container">
      {/* 四个方向的连接点 */}
      <Handle type="source" position={Position.Top} id="top" />
      <Handle type="source" position={Position.Right} id="right" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Left} id="left" />

      {/* 节点内容 */}
      <div className="node-content">
        <div>{data.label}</div>
        <div>{data.assignee}</div>
        <div>{data.status}</div>
      </div>
    </div>
  )
}
```

---

## 8. React Flow 版本兼容性

| 版本 | 包名 | 备注 |
|------|------|------|
| v12 | `@xyflow/react` | 当前使用版本 (^12.0.0) |
| v11 | `@xyflow/react` | 旧版本，使用不同 API |

**注意：** React Flow v12 的 Handle 行为与旧版本有差异，配置时需参考 v12 文档。

---

## 5. API 设计

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/login | 登录密码验证 |
| POST | /api/change-password | 修改登录密码（需管理员密码） |
| GET | /api/opportunities | 获取商机列表（支持筛选参数） |
| POST | /api/opportunities | 创建商机 |
| GET | /api/opportunities/:id | 获取商机详情（含节点） |
| POST | /api/opportunities/:id/update | 更新商机 |
| POST | /api/opportunities/:id/delete | 删除商机 |
| POST | /api/opportunities/:id/nodes/create | 添加节点 |
| POST | /api/nodes/:id/update | 更新节点 |
| POST | /api/nodes/:id/delete | 删除节点 |
| POST | /api/opportunities/:id/archive | 归档商机 |
| POST | /api/opportunities/:id/unarchive | 取消归档 |
| GET | /api/check-auth | 检查登录状态 |

---

## 6. 非功能需求

- 响应式设计，适配手机（375px）到桌面（1920px）
- 商机数量 100+ 时列表加载流畅（< 1秒）
- JSON 文件自动备份（每次保存保留上一个版本）
- 密码错误次数限制（5次后锁定1分钟）
