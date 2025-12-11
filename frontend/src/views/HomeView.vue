<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { subscriptionApi } from '../api/subscriptions';
import { notificationApi } from '../api/notifications';
import type { Subscription } from '../types';

const expiringSoonSubscriptions = ref<Subscription[]>([]);
const unreadNotificationCount = ref(0);
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  try {
    // 获取即将到期的订阅
    const response = await subscriptionApi.getExpiringSoon(7);
    if (response.data.success) {
      expiringSoonSubscriptions.value = response.data.data || [];
    }
    
    // 获取未读通知数量（示例用户ID为1）
    // 在实际应用中，应该从用户认证状态获取
    const notifResponse = await notificationApi.getUnreadCount(1);
    if (notifResponse.data.success) {
      unreadNotificationCount.value = notifResponse.data.data?.count || 0;
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <main class="home-view">
    <div class="container">
      <h1>订阅服务管理系统</h1>
      
      <div class="dashboard">
        <div class="card">
          <h2>系统概览</h2>
          <div class="stats">
            <div class="stat-item">
              <div class="stat-label">即将到期订阅</div>
              <div class="stat-value">{{ expiringSoonSubscriptions.length }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">未读通知</div>
              <div class="stat-value">{{ unreadNotificationCount }}</div>
            </div>
          </div>
        </div>

        <div class="card">
          <h2>即将到期的订阅 (7天内)</h2>
          <div v-if="loading" class="loading">加载中...</div>
          <div v-else-if="expiringSoonSubscriptions.length === 0" class="empty">
            暂无即将到期的订阅
          </div>
          <ul v-else class="subscription-list">
            <li v-for="sub in expiringSoonSubscriptions" :key="sub.subscription_id">
              <div>
                <strong>{{ sub.service_name }}</strong>
                <span class="user">用户: {{ sub.username }}</span>
              </div>
              <div class="expiry">到期日期: {{ sub.end_date }}</div>
            </li>
          </ul>
        </div>

        <div class="quick-links">
          <h2>快速导航</h2>
          <div class="links">
            <router-link to="/users" class="link-card">
              <h3>👥 用户管理</h3>
              <p>管理用户信息</p>
            </router-link>
            <router-link to="/services" class="link-card">
              <h3>📦 服务管理</h3>
              <p>管理订阅服务</p>
            </router-link>
            <router-link to="/subscriptions" class="link-card">
              <h3>📝 订阅管理</h3>
              <p>管理用户订阅</p>
            </router-link>
            <router-link to="/notifications" class="link-card">
              <h3>🔔 通知中心</h3>
              <p>查看系统通知</p>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.home-view {
  padding: 2rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 2rem;
  color: #2c3e50;
}

.dashboard {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card h2 {
  margin-bottom: 1rem;
  color: #2c3e50;
  font-size: 1.25rem;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-item {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  text-align: center;
}

.stat-label {
  font-size: 0.875rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #42b983;
}

.loading, .empty {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
}

.subscription-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.subscription-list li {
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.subscription-list li:last-child {
  border-bottom: none;
}

.user {
  margin-left: 1rem;
  color: #6c757d;
  font-size: 0.875rem;
}

.expiry {
  color: #dc3545;
  font-weight: 500;
}

.quick-links .links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.link-card {
  display: block;
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  transition: transform 0.2s;
}

.link-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.link-card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
}

.link-card p {
  margin: 0;
  opacity: 0.9;
}
</style>
