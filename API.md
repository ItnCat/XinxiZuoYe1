# API Documentation - 订阅服务管理系统

Base URL: `http://localhost:3000/api`

所有响应格式统一为：
```json
{
  "success": true/false,
  "data": {}, // 成功时返回的数据
  "error": "错误信息", // 失败时返回的错误信息
  "message": "提示信息"
}
```

## 用户管理 API (Users)

### 1. 获取所有用户
```
GET /api/users
Query Parameters:
  - limit: number (可选, 默认50)
  - offset: number (可选, 默认0)
```

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "user_id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "phone": "13800138000",
      "real_name": "John Doe",
      "status": "active",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 2. 获取单个用户
```
GET /api/users/:id
```

### 3. 创建用户
```
POST /api/users
Content-Type: application/json
```

**请求体**:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "13800138000",
  "real_name": "John Doe",
  "status": "active"
}
```

### 4. 更新用户
```
PUT /api/users/:id
Content-Type: application/json
```

**请求体**:
```json
{
  "username": "john_doe_updated",
  "email": "john_new@example.com",
  "phone": "13900139000",
  "real_name": "John Doe Jr",
  "status": "active"
}
```

### 5. 删除用户
```
DELETE /api/users/:id
```

### 6. 搜索用户
```
GET /api/users/search?q=keyword
```

---

## 服务管理 API (Services)

### 1. 获取所有服务
```
GET /api/services
Query Parameters:
  - status: string (可选, 'active' 或 'inactive')
```

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "service_id": 1,
      "service_name": "基础会员",
      "description": "基础会员服务，享受基本功能",
      "price": 9.99,
      "billing_cycle": "monthly",
      "features": {
        "storage": "10GB",
        "support": "email"
      },
      "status": "active",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 2. 获取单个服务
```
GET /api/services/:id
```

### 3. 创建服务
```
POST /api/services
Content-Type: application/json
```

**请求体**:
```json
{
  "service_name": "高级会员",
  "description": "高级会员服务",
  "price": 29.99,
  "billing_cycle": "monthly",
  "features": {
    "storage": "100GB",
    "support": "24/7"
  },
  "status": "active"
}
```

**billing_cycle 可选值**: `daily`, `weekly`, `monthly`, `yearly`

### 4. 更新服务
```
PUT /api/services/:id
Content-Type: application/json
```

### 5. 删除服务
```
DELETE /api/services/:id
```

### 6. 搜索服务
```
GET /api/services/search?q=keyword
```

---

## 订阅管理 API (Subscriptions)

### 1. 获取所有订阅
```
GET /api/subscriptions
Query Parameters:
  - limit: number (可选, 默认50)
  - offset: number (可选, 默认0)
```

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "subscription_id": 1,
      "user_id": 1,
      "service_id": 1,
      "start_date": "2024-01-01",
      "end_date": "2024-02-01",
      "auto_renew": true,
      "status": "active",
      "payment_method": "支付宝",
      "amount_paid": 9.99,
      "username": "john_doe",
      "email": "john@example.com",
      "service_name": "基础会员",
      "price": 9.99,
      "billing_cycle": "monthly"
    }
  ]
}
```

### 2. 获取单个订阅
```
GET /api/subscriptions/:id
```

### 3. 获取用户的所有订阅
```
GET /api/subscriptions/user/:userId
```

### 4. 创建订阅
```
POST /api/subscriptions
Content-Type: application/json
```

**请求体**:
```json
{
  "user_id": 1,
  "service_id": 1,
  "start_date": "2024-01-01",
  "end_date": "2024-02-01",
  "auto_renew": true,
  "payment_method": "支付宝",
  "amount_paid": 9.99
}
```

### 5. 更新订阅
```
PUT /api/subscriptions/:id
Content-Type: application/json
```

**请求体**:
```json
{
  "end_date": "2024-03-01",
  "auto_renew": false,
  "status": "active"
}
```

**status 可选值**: `active`, `expired`, `cancelled`, `pending`

### 6. 取消订阅
```
POST /api/subscriptions/:id/cancel
```

### 7. 删除订阅
```
DELETE /api/subscriptions/:id
```

### 8. 搜索订阅
```
GET /api/subscriptions/search?q=keyword
```

### 9. 获取即将到期的订阅
```
GET /api/subscriptions/expiring-soon?days=7
Query Parameters:
  - days: number (可选, 默认7, 查询N天内到期的订阅)
```

### 10. 处理自动续费
```
POST /api/subscriptions/auto-renew/process
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "renewed_count": 5,
    "failed_count": 0,
    "renewed": [1, 2, 3, 4, 5],
    "failed": []
  }
}
```

### 11. 更新过期订阅状态
```
POST /api/subscriptions/update-expired
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "updated_count": 3
  }
}
```

---

## 通知管理 API (Notifications)

### 1. 获取所有通知
```
GET /api/notifications
Query Parameters:
  - limit: number (可选, 默认100)
  - offset: number (可选, 默认0)
```

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "notification_id": 1,
      "user_id": 1,
      "subscription_id": 1,
      "notification_type": "renewal_reminder",
      "title": "续费提醒",
      "message": "您的订阅即将到期，请及时续费",
      "is_read": false,
      "sent_at": "2024-01-01T00:00:00.000Z",
      "read_at": null
    }
  ]
}
```

### 2. 获取单个通知
```
GET /api/notifications/:id
```

### 3. 获取用户的通知
```
GET /api/notifications/user/:userId
Query Parameters:
  - limit: number (可选, 默认50)
```

### 4. 获取未读通知数量
```
GET /api/notifications/user/:userId/unread-count
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

### 5. 创建通知
```
POST /api/notifications
Content-Type: application/json
```

**请求体**:
```json
{
  "user_id": 1,
  "subscription_id": 1,
  "notification_type": "renewal_reminder",
  "title": "续费提醒",
  "message": "您的订阅即将到期"
}
```

**notification_type 可选值**:
- `renewal_reminder` - 续费提醒
- `expiry_warning` - 到期警告
- `payment_success` - 支付成功
- `payment_failed` - 支付失败
- `cancellation` - 取消通知

### 6. 标记通知为已读
```
PUT /api/notifications/:id/read
```

### 7. 标记所有通知为已读
```
PUT /api/notifications/user/:userId/read-all
```

### 8. 删除通知
```
DELETE /api/notifications/:id
```

---

## 错误代码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 使用示例

### 使用 curl

```bash
# 获取所有用户
curl http://localhost:3000/api/users

# 创建用户
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_user",
    "email": "test@example.com",
    "password": "password123"
  }'

# 更新订阅的自动续费设置
curl -X PUT http://localhost:3000/api/subscriptions/1 \
  -H "Content-Type: application/json" \
  -d '{"auto_renew": true}'
```

### 使用 JavaScript (axios)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

// 获取所有服务
const services = await api.get('/services');
console.log(services.data);

// 创建订阅
const subscription = await api.post('/subscriptions', {
  user_id: 1,
  service_id: 1,
  start_date: '2024-01-01',
  end_date: '2024-02-01',
  auto_renew: true
});
console.log(subscription.data);
```

---

## 自动任务

系统包含以下自动任务，每24小时运行一次：

1. **更新过期订阅状态** - 将已过期的订阅状态更新为 "expired"
2. **发送到期提醒** - 向即将到期的订阅发送提醒通知
3. **处理自动续费** - 自动为开启自动续费的订阅续费

也可以手动触发：
```bash
# 处理自动续费
curl -X POST http://localhost:3000/api/subscriptions/auto-renew/process

# 更新过期订阅
curl -X POST http://localhost:3000/api/subscriptions/update-expired
```
