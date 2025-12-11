-- 订阅服务管理系统数据库设计
-- MySQL 8.0

-- 创建数据库
CREATE DATABASE IF NOT EXISTS subscription_system 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE subscription_system;

-- 用户表 (Users)
CREATE TABLE IF NOT EXISTS users (
    user_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    email VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
    phone VARCHAR(20) COMMENT '手机号',
    password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
    real_name VARCHAR(100) COMMENT '真实姓名',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active' COMMENT '用户状态',
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户信息表';

-- 订阅服务表 (Services)
CREATE TABLE IF NOT EXISTS services (
    service_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '服务ID',
    service_name VARCHAR(100) NOT NULL COMMENT '服务名称',
    description TEXT COMMENT '服务描述',
    price DECIMAL(10, 2) NOT NULL COMMENT '服务价格',
    billing_cycle ENUM('daily', 'weekly', 'monthly', 'yearly') NOT NULL COMMENT '计费周期',
    features JSON COMMENT '服务特性',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '服务状态',
    INDEX idx_status (status),
    INDEX idx_service_name (service_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订阅服务表';

-- 用户订阅表 (Subscriptions)
CREATE TABLE IF NOT EXISTS subscriptions (
    subscription_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '订阅ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    service_id BIGINT NOT NULL COMMENT '服务ID',
    start_date DATE NOT NULL COMMENT '开始日期',
    end_date DATE NOT NULL COMMENT '结束日期',
    auto_renew BOOLEAN DEFAULT FALSE COMMENT '是否自动续费',
    status ENUM('active', 'expired', 'cancelled', 'pending') DEFAULT 'pending' COMMENT '订阅状态',
    payment_method VARCHAR(50) COMMENT '支付方式',
    amount_paid DECIMAL(10, 2) COMMENT '已支付金额',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    cancelled_at TIMESTAMP NULL COMMENT '取消时间',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_service_id (service_id),
    INDEX idx_status (status),
    INDEX idx_end_date (end_date),
    INDEX idx_auto_renew (auto_renew)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户订阅记录表';

-- 通知提醒表 (Notifications)
CREATE TABLE IF NOT EXISTS notifications (
    notification_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '通知ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    subscription_id BIGINT COMMENT '订阅ID',
    notification_type ENUM('renewal_reminder', 'expiry_warning', 'payment_success', 'payment_failed', 'cancellation') NOT NULL COMMENT '通知类型',
    title VARCHAR(200) NOT NULL COMMENT '通知标题',
    message TEXT NOT NULL COMMENT '通知内容',
    is_read BOOLEAN DEFAULT FALSE COMMENT '是否已读',
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '发送时间',
    read_at TIMESTAMP NULL COMMENT '阅读时间',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(subscription_id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_sent_at (sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知提醒表';

-- 支付记录表 (Payments)
CREATE TABLE IF NOT EXISTS payments (
    payment_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '支付ID',
    subscription_id BIGINT NOT NULL COMMENT '订阅ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    amount DECIMAL(10, 2) NOT NULL COMMENT '支付金额',
    payment_method VARCHAR(50) NOT NULL COMMENT '支付方式',
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending' COMMENT '支付状态',
    transaction_id VARCHAR(100) COMMENT '交易ID',
    payment_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '支付时间',
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(subscription_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_subscription_id (subscription_id),
    INDEX idx_user_id (user_id),
    INDEX idx_payment_status (payment_status),
    INDEX idx_payment_time (payment_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='支付记录表';

-- 插入示例数据
-- 插入服务数据
INSERT INTO services (service_name, description, price, billing_cycle, features, status) VALUES
('基础会员', '基础会员服务，享受基本功能', 9.99, 'monthly', '{"storage": "10GB", "support": "email"}', 'active'),
('高级会员', '高级会员服务，解锁更多功能', 29.99, 'monthly', '{"storage": "100GB", "support": "24/7", "priority": true}', 'active'),
('企业版', '企业级服务，适合团队使用', 99.99, 'monthly', '{"storage": "unlimited", "support": "dedicated", "users": 50}', 'active'),
('年度会员', '年度会员，享受优惠价格', 99.99, 'yearly', '{"storage": "50GB", "support": "priority"}', 'active');
