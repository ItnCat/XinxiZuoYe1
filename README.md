# 订阅服务管理系统 (Subscription Service Management System)

一个完整的订阅服务管理系统，包含前端和后端，用于管理用户信息、订阅服务信息、用户订阅记录等。

## 技术栈

### 后端
- **Node.js** + **Express** - Web服务器框架
- **TypeScript** - 类型安全的JavaScript超集
- **MySQL 8.0** - 关系型数据库
- **mysql2** - MySQL客户端
- **bcryptjs** - 密码加密
- **cors** - 跨域资源共享
- **dotenv** - 环境变量管理

### 前端
- **Vue 3** - 渐进式JavaScript框架
- **TypeScript** - 类型安全
- **Vue Router** - 路由管理
- **Axios** - HTTP客户端
- **Pinia** - 状态管理

### 开发工具
- **Cursor / VSCode** - 代码编辑器
- **npm** - 包管理器

## 功能特性

### 核心功能
1. **用户管理**
   - 创建、查询、修改、删除用户
   - 用户信息管理（用户名、邮箱、手机号、真实姓名等）
   - 用户状态管理（激活、停用、暂停）

2. **服务管理**
   - 创建、查询、修改、删除订阅服务
   - 服务定价和计费周期设置
   - 服务特性配置

3. **订阅管理**
   - 用户订阅服务
   - 查询订阅记录
   - 修改订阅信息
   - **取消订阅**
   - **自动续费**功能
   - 订阅状态跟踪（激活、过期、取消、待处理）

4. **通知提醒系统**
   - 订阅到期提醒
   - 续费提醒
   - 支付成功/失败通知
   - 取消订阅通知
   - 未读通知数量统计

5. **搜索功能**
   - 用户搜索（按用户名、邮箱、真实姓名）
   - 服务搜索（按服务名称、描述）
   - 订阅搜索（按用户、服务）

## 项目结构

```
XinxiZuoYe1/
├── backend/                # 后端代码
│   ├── src/
│   │   ├── config/        # 配置文件
│   │   │   └── database.ts
│   │   ├── controllers/   # 控制器
│   │   │   ├── userController.ts
│   │   │   ├── serviceController.ts
│   │   │   ├── subscriptionController.ts
│   │   │   └── notificationController.ts
│   │   ├── models/        # 数据模型
│   │   │   ├── User.ts
│   │   │   ├── Service.ts
│   │   │   ├── Subscription.ts
│   │   │   └── Notification.ts
│   │   ├── routes/        # 路由
│   │   │   ├── userRoutes.ts
│   │   │   ├── serviceRoutes.ts
│   │   │   ├── subscriptionRoutes.ts
│   │   │   └── notificationRoutes.ts
│   │   └── index.ts       # 入口文件
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/              # 前端代码
│   ├── src/
│   │   ├── api/          # API服务层
│   │   ├── views/        # 页面组件
│   │   ├── types/        # TypeScript类型定义
│   │   ├── router/       # 路由配置
│   │   └── App.vue
│   ├── package.json
│   └── .env.example
└── database/             # 数据库脚本
    └── schema.sql        # 数据库表结构

```

## 安装和运行

### 前置要求
- Node.js (v16 或更高版本)
- MySQL 8.0
- npm 或 yarn

### 1. 数据库设置

```bash
# 登录MySQL
mysql -u root -p

# 执行数据库脚本
source database/schema.sql
```

### 2. 后端设置

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑.env文件，配置数据库连接信息

# 构建TypeScript
npm run build

# 启动开发服务器
npm run dev

# 或生产环境启动
npm start
```

后端服务将运行在 `http://localhost:3000`

### 3. 前端设置

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑.env文件，配置API地址

# 启动开发服务器
npm run dev

# 或构建生产版本
npm run build
```

前端应用将运行在 `http://localhost:5173`

## API端点

### 用户管理 (`/api/users`)
- `GET /api/users` - 获取所有用户
- `GET /api/users/:id` - 获取单个用户
- `POST /api/users` - 创建用户
- `PUT /api/users/:id` - 更新用户
- `DELETE /api/users/:id` - 删除用户
- `GET /api/users/search?q=keyword` - 搜索用户

### 服务管理 (`/api/services`)
- `GET /api/services` - 获取所有服务
- `GET /api/services/:id` - 获取单个服务
- `POST /api/services` - 创建服务
- `PUT /api/services/:id` - 更新服务
- `DELETE /api/services/:id` - 删除服务
- `GET /api/services/search?q=keyword` - 搜索服务

### 订阅管理 (`/api/subscriptions`)
- `GET /api/subscriptions` - 获取所有订阅
- `GET /api/subscriptions/:id` - 获取单个订阅
- `GET /api/subscriptions/user/:userId` - 获取用户的订阅
- `POST /api/subscriptions` - 创建订阅
- `PUT /api/subscriptions/:id` - 更新订阅
- `POST /api/subscriptions/:id/cancel` - 取消订阅
- `DELETE /api/subscriptions/:id` - 删除订阅
- `GET /api/subscriptions/expiring-soon?days=7` - 获取即将到期的订阅
- `POST /api/subscriptions/auto-renew/process` - 处理自动续费
- `POST /api/subscriptions/update-expired` - 更新过期订阅状态

### 通知管理 (`/api/notifications`)
- `GET /api/notifications` - 获取所有通知
- `GET /api/notifications/:id` - 获取单个通知
- `GET /api/notifications/user/:userId` - 获取用户的通知
- `GET /api/notifications/user/:userId/unread-count` - 获取未读通知数量
- `POST /api/notifications` - 创建通知
- `PUT /api/notifications/:id/read` - 标记为已读
- `PUT /api/notifications/user/:userId/read-all` - 标记所有为已读
- `DELETE /api/notifications/:id` - 删除通知

## 数据库设计

### 主要表结构

#### users (用户表)
- user_id: 用户ID (主键)
- username: 用户名
- email: 邮箱
- phone: 手机号
- password_hash: 密码哈希
- real_name: 真实姓名
- status: 状态 (active/inactive/suspended)
- created_at, updated_at: 时间戳

#### services (服务表)
- service_id: 服务ID (主键)
- service_name: 服务名称
- description: 描述
- price: 价格
- billing_cycle: 计费周期 (daily/weekly/monthly/yearly)
- features: 特性 (JSON)
- status: 状态 (active/inactive)
- created_at, updated_at: 时间戳

#### subscriptions (订阅表)
- subscription_id: 订阅ID (主键)
- user_id: 用户ID (外键)
- service_id: 服务ID (外键)
- start_date: 开始日期
- end_date: 结束日期
- auto_renew: 是否自动续费
- status: 状态 (active/expired/cancelled/pending)
- payment_method: 支付方式
- amount_paid: 已支付金额
- created_at, updated_at, cancelled_at: 时间戳

#### notifications (通知表)
- notification_id: 通知ID (主键)
- user_id: 用户ID (外键)
- subscription_id: 订阅ID (外键)
- notification_type: 通知类型
- title: 标题
- message: 消息内容
- is_read: 是否已读
- sent_at, read_at: 时间戳

## 使用说明

### 1. 创建用户
访问"用户管理"页面，点击"新增用户"按钮，填写用户信息并提交。

### 2. 创建服务
访问"服务管理"页面，点击"新增服务"按钮，配置服务信息、价格和计费周期。

### 3. 创建订阅
访问"订阅管理"页面，点击"新增订阅"按钮，选择用户和服务，设置订阅期限。

### 4. 自动续费
在订阅管理页面，可以通过开关控制每个订阅的自动续费功能。

### 5. 取消订阅
在订阅管理页面，点击"取消"按钮可以取消激活的订阅。

### 6. 查看通知
访问"通知中心"查看系统通知，包括续费提醒、到期警告等。

## 开发和贡献

欢迎提交问题和拉取请求！

## 许可证

MIT License

## 联系方式

如有问题，请通过GitHub Issues联系。