# 商机追踪系统 (Opportunity Tracker)

一个基于 React 和 FastAPI 的商机追踪系统，支持可视化节点连线图来管理商机数据。

## ✨ 功能特性

- 🎯 **商机管理**：创建、编辑、删除商机
- 🔗 **可视化连线**：使用流程图展示商机节点之间的关系
- 💾 **自动保存**：所有操作自动保存到服务器
- 🔐 **身份认证**：支持密码登录和首次设置
- 📋 **操作日志**：详细记录所有操作，便于调试和追踪
- 📱 **响应式设计**：支持桌面和移动设备

## 🛠️ 技术栈

### 前端
- **React 18** - UI 框架
- **Vite** - 构建工具
- **Tailwind CSS 3** - 样式框架
- **React Flow (@xyflow/react)** - 流程图组件
- **React Router** - 路由管理
- **Zustand** - 状态管理
- **Axios** - HTTP 客户端

### 后端
- **FastAPI** - 高性能 API 框架
- **Python 3.9+** - 编程语言
- **bcrypt** - 密码加密
- **JSON** - 数据存储

## 🚀 快速开始

### 环境要求
- Python 3.9+
- Node.js 18+
- npm 或 yarn

### 安装与运行

1. **克隆项目**
```bash
git clone <repository-url>
cd BOT
```

2. **安装后端依赖**
```bash
pip install fastapi uvicorn bcrypt
```

3. **安装前端依赖**
```bash
cd frontend
npm install
```

4. **构建前端**
```bash
npm run build
```

5. **启动服务器**
```bash
cd ..
python server.py
```

6. **访问应用**

打开浏览器访问 `http://localhost:8000`

### 首次设置

首次访问时，系统会引导您设置登录密码和管理员密码。

## 📁 项目结构

```
BOT/
├── data/                    # 数据存储目录
│   └── *.json               # 商机数据文件
├── docs/                    # 文档目录
│   ├── development_guide.md # 开发指南
│   └── research.md          # 研究文档
├── frontend/                # 前端应用
│   ├── src/
│   │   ├── api/             # API 调用
│   │   ├── components/      # 组件
│   │   │   ├── LogPanel.jsx     # 日志面板
│   │   │   ├── MindMapNode.jsx  # 思维导图节点
│   │   │   ├── NodeEditor.jsx   # 节点编辑器
│   │   │   └── SmartPanel.jsx   # SMART 面板
│   │   ├── pages/           # 页面
│   │   │   ├── Dashboard.jsx    # 仪表盘
│   │   │   ├── Login.jsx        # 登录页
│   │   │   ├── Opportunity.jsx  # 商机详情
│   │   │   └── Settings.jsx     # 设置页
│   │   ├── store/           # 状态管理
│   │   ├── App.jsx          # 应用入口
│   │   └── main.jsx         # 主入口
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── server.py                # 后端服务器
├── config.json              # 配置文件
└── start.bat                # 启动脚本
```

## 🔌 API 接口

### 认证接口
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/login` | 用户登录 |
| POST | `/api/setup` | 首次设置 |
| GET | `/api/check-auth` | 检查认证状态 |
| GET | `/api/check-first-time` | 检查是否首次访问 |

### 商机接口
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/opportunities` | 获取商机列表 |
| GET | `/api/opportunities/{id}` | 获取商机详情 |
| POST | `/api/opportunities` | 创建商机 |
| PUT | `/api/opportunities/{id}` | 更新商机 |
| DELETE | `/api/opportunities/{id}` | 删除商机 |
| POST | `/api/opportunities/{id}/save-all` | 全量保存节点 |

### 节点接口
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/opportunities/{id}/nodes/create` | 创建节点 |
| PUT | `/api/nodes/{id}` | 更新节点 |
| POST | `/api/nodes/{id}/delete` | 删除节点 |

## 🎮 使用说明

### 创建节点
1. 点击「新建节点」按钮
2. 节点会自动添加到画布上

### 连接节点
1. 从节点的内圈（白色小圆）拖拽到目标节点的外圈（深灰色大圆）
2. 连线会自动创建并保存

### 删除节点/连线
1. 点击选中节点或连线
2. 点击「删除选中」按钮或按 Delete/Backspace 键

### 查看日志
1. 点击「📋 日志」按钮打开日志面板
2. 查看所有操作记录

## 📝 开发指南

详细的开发指南请参考 [docs/development_guide.md](docs/development_guide.md)，包含：

- 常见问题及解决方案
- 最佳实践
- 调试技巧
- 代码规范

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 GitHub Issue
- 发送邮件至 [support@example.com]

---

**商机追踪系统** - 高效管理您的商机数据