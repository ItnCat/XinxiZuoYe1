# 订阅服务管理系统 - 详细安装指南

## 系统要求

- **Node.js**: v16.0.0 或更高版本
- **npm**: v7.0.0 或更高版本
- **MySQL**: 8.0 或更高版本
- **操作系统**: Windows 10/11, macOS 10.15+, 或 Linux

## 安装步骤

### 第一步：安装MySQL 8.0

#### Windows
1. 下载MySQL安装器：https://dev.mysql.com/downloads/installer/
2. 运行安装器，选择"Developer Default"
3. 设置root密码（记住这个密码，稍后需要用到）
4. 完成安装

#### macOS
```bash
brew install mysql
brew services start mysql
mysql_secure_installation
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

### 第二步：创建数据库

1. 登录MySQL：
```bash
mysql -u root -p
```

2. 执行数据库脚本：
```sql
source /path/to/database/schema.sql
```

或者复制`database/schema.sql`的内容并在MySQL命令行中执行。

### 第三步：配置后端

1. 进入后端目录：
```bash
cd backend
```

2. 安装依赖：
```bash
npm install
```

3. 创建环境配置文件：
```bash
cp .env.example .env
```

4. 编辑`.env`文件，配置数据库连接：
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的MySQL密码
DB_NAME=subscription_system

PORT=3000
NODE_ENV=development

JWT_SECRET=你的密钥（随机生成一个复杂的字符串）

CORS_ORIGIN=http://localhost:5173
```

5. 构建TypeScript代码：
```bash
npm run build
```

6. 启动开发服务器：
```bash
npm run dev
```

后端服务将在 `http://localhost:3000` 运行。

### 第四步：配置前端

1. 打开新的终端，进入前端目录：
```bash
cd frontend
```

2. 安装依赖：
```bash
npm install
```

3. 创建环境配置文件：
```bash
cp .env.example .env
```

4. 确认`.env`文件内容：
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

5. 启动开发服务器：
```bash
npm run dev
```

前端应用将在 `http://localhost:5173` 运行。

### 第五步：验证安装

1. 打开浏览器访问 `http://localhost:5173`
2. 应该能看到订阅服务管理系统的首页
3. 点击导航栏中的各个菜单项，验证功能是否正常

## 初始数据

数据库脚本会自动插入一些示例服务数据：
- 基础会员 (¥9.99/月)
- 高级会员 (¥29.99/月)
- 企业版 (¥99.99/月)
- 年度会员 (¥99.99/年)

## 常见问题

### Q1: 数据库连接失败
**解决方案**:
1. 确认MySQL服务正在运行
2. 检查`.env`文件中的数据库配置是否正确
3. 确认MySQL用户有足够的权限
4. 尝试手动连接数据库测试：`mysql -u root -p`

### Q2: 端口已被占用
**解决方案**:
1. 修改后端`.env`文件中的`PORT`为其他端口（如3001）
2. 修改前端`.env`文件中的`VITE_API_BASE_URL`为新端口
3. 或者停止占用端口的程序

### Q3: npm install 失败
**解决方案**:
1. 清理npm缓存：`npm cache clean --force`
2. 删除`node_modules`文件夹和`package-lock.json`
3. 重新运行：`npm install`

### Q4: CORS 错误
**解决方案**:
1. 确认后端`.env`中的`CORS_ORIGIN`与前端URL一致
2. 确认后端服务正在运行

### Q5: TypeScript 编译错误
**解决方案**:
1. 确认Node.js版本 >= 16
2. 删除`dist`文件夹
3. 重新运行：`npm run build`

## 生产环境部署

### 后端部署

1. 构建生产版本：
```bash
cd backend
npm run build
```

2. 使用PM2或类似工具运行：
```bash
npm install -g pm2
pm2 start dist/index.js --name subscription-backend
```

### 前端部署

1. 构建生产版本：
```bash
cd frontend
npm run build
```

2. 将`dist`目录部署到Web服务器（Nginx、Apache等）

### 环境变量

生产环境务必修改：
- `JWT_SECRET` - 使用强密码
- `DB_PASSWORD` - 使用强密码
- `NODE_ENV=production`
- `CORS_ORIGIN` - 设置为实际的前端域名

## 功能测试清单

- [ ] 创建用户
- [ ] 编辑用户信息
- [ ] 删除用户
- [ ] 搜索用户
- [ ] 创建服务
- [ ] 编辑服务
- [ ] 删除服务
- [ ] 创建订阅
- [ ] 编辑订阅
- [ ] 取消订阅
- [ ] 开启/关闭自动续费
- [ ] 查看通知
- [ ] 标记通知为已读
- [ ] 查看即将到期的订阅

## 自动任务说明

系统包含以下自动任务（每24小时运行一次）：

1. **自动续费处理** - 自动为开启自动续费的订阅续费
2. **到期提醒** - 向即将到期的订阅发送提醒通知
3. **过期状态更新** - 将过期的订阅状态更新为"expired"

这些任务在后端启动时自动运行。

## 需要帮助？

如遇到问题，请：
1. 查看终端/控制台的错误信息
2. 检查数据库连接
3. 确认所有依赖已正确安装
4. 查看浏览器开发者工具的网络请求

## 下一步

- 添加用户认证和授权
- 实现支付网关集成
- 添加邮件通知功能
- 实现数据导出功能
- 添加数据统计和报表
