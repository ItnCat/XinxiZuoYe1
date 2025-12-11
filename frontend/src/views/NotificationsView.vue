<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { notificationApi } from '../api/notifications';
import type { Notification } from '../types';

const notifications = ref<Notification[]>([]);
const loading = ref(false);
const selectedUserId = ref(1); // 示例用户ID

const unreadNotifications = computed(() => 
  notifications.value.filter(n => !n.is_read)
);

const readNotifications = computed(() => 
  notifications.value.filter(n => n.is_read)
);

const loadNotifications = async () => {
  loading.value = true;
  try {
    const response = await notificationApi.getByUserId(selectedUserId.value);
    if (response.data.success) {
      notifications.value = response.data.data || [];
    }
  } catch (error) {
    console.error('Error loading notifications:', error);
    alert('加载通知失败');
  } finally {
    loading.value = false;
  }
};

const markAsRead = async (id: number) => {
  try {
    await notificationApi.markAsRead(id);
    await loadNotifications();
  } catch (error) {
    console.error('Error marking notification as read:', error);
    alert('标记失败');
  }
};

const markAllAsRead = async () => {
  try {
    await notificationApi.markAllAsRead(selectedUserId.value);
    await loadNotifications();
  } catch (error) {
    console.error('Error marking all as read:', error);
    alert('标记失败');
  }
};

const deleteNotification = async (id: number) => {
  if (!confirm('确定要删除这个通知吗？')) return;
  try {
    await notificationApi.delete(id);
    await loadNotifications();
  } catch (error) {
    console.error('Error deleting notification:', error);
    alert('删除失败');
  }
};

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'renewal_reminder':
      return '🔄';
    case 'expiry_warning':
      return '⚠️';
    case 'payment_success':
      return '✅';
    case 'payment_failed':
      return '❌';
    case 'cancellation':
      return '🚫';
    default:
      return '📢';
  }
};

const getNotificationTypeLabel = (type: string) => {
  switch (type) {
    case 'renewal_reminder':
      return '续费提醒';
    case 'expiry_warning':
      return '到期警告';
    case 'payment_success':
      return '支付成功';
    case 'payment_failed':
      return '支付失败';
    case 'cancellation':
      return '取消通知';
    default:
      return '通知';
  }
};

onMounted(() => {
  loadNotifications();
});
</script>

<template>
  <div class="notifications-view">
    <div class="container">
      <div class="header">
        <h1>通知中心</h1>
        <button 
          v-if="unreadNotifications.length > 0"
          @click="markAllAsRead" 
          class="btn btn-secondary"
        >
          全部标记为已读
        </button>
      </div>
      
      <div class="stats">
        <div class="stat-card">
          <div class="stat-value">{{ notifications.length }}</div>
          <div class="stat-label">总通知</div>
        </div>
        <div class="stat-card unread">
          <div class="stat-value">{{ unreadNotifications.length }}</div>
          <div class="stat-label">未读</div>
        </div>
        <div class="stat-card read">
          <div class="stat-value">{{ readNotifications.length }}</div>
          <div class="stat-label">已读</div>
        </div>
      </div>

      <div v-if="loading" class="loading">加载中...</div>
      
      <div v-else>
        <!-- 未读通知 -->
        <div v-if="unreadNotifications.length > 0" class="notification-section">
          <h2>未读通知</h2>
          <div class="notifications-list">
            <div 
              v-for="notif in unreadNotifications" 
              :key="notif.notification_id"
              class="notification-card unread"
            >
              <div class="notification-icon">
                {{ getNotificationIcon(notif.notification_type) }}
              </div>
              <div class="notification-content">
                <div class="notification-header">
                  <h3>{{ notif.title }}</h3>
                  <span class="notification-type">
                    {{ getNotificationTypeLabel(notif.notification_type) }}
                  </span>
                </div>
                <p class="notification-message">{{ notif.message }}</p>
                <div class="notification-footer">
                  <span class="notification-time">
                    {{ new Date(notif.sent_at || '').toLocaleString('zh-CN') }}
                  </span>
                  <div class="notification-actions">
                    <button 
                      @click="markAsRead(notif.notification_id!)" 
                      class="btn btn-sm btn-primary"
                    >
                      标记已读
                    </button>
                    <button 
                      @click="deleteNotification(notif.notification_id!)" 
                      class="btn btn-sm btn-danger"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 已读通知 -->
        <div v-if="readNotifications.length > 0" class="notification-section">
          <h2>已读通知</h2>
          <div class="notifications-list">
            <div 
              v-for="notif in readNotifications" 
              :key="notif.notification_id"
              class="notification-card"
            >
              <div class="notification-icon">
                {{ getNotificationIcon(notif.notification_type) }}
              </div>
              <div class="notification-content">
                <div class="notification-header">
                  <h3>{{ notif.title }}</h3>
                  <span class="notification-type">
                    {{ getNotificationTypeLabel(notif.notification_type) }}
                  </span>
                </div>
                <p class="notification-message">{{ notif.message }}</p>
                <div class="notification-footer">
                  <span class="notification-time">
                    {{ new Date(notif.sent_at || '').toLocaleString('zh-CN') }}
                  </span>
                  <button 
                    @click="deleteNotification(notif.notification_id!)" 
                    class="btn btn-sm btn-danger"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="notifications.length === 0" class="empty">
          <div class="empty-icon">📭</div>
          <p>暂无通知</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notifications-view {
  padding: 2rem;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

h1 {
  margin: 0;
  color: #2c3e50;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-card.unread {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-card.read {
  background: linear-gradient(135deg, #42b983 0%, #359268 100%);
  color: white;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.9;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: #42b983;
  color: white;
}

.btn-primary:hover {
  background-color: #359268;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn-sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
}

.notification-section {
  margin-bottom: 2rem;
}

.notification-section h2 {
  font-size: 1.25rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.notification-card {
  display: flex;
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.notification-card:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.notification-card.unread {
  border-left: 4px solid #42b983;
  background: #f8f9fa;
}

.notification-icon {
  font-size: 2rem;
  margin-right: 1rem;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.notification-header h3 {
  margin: 0;
  font-size: 1.125rem;
  color: #2c3e50;
}

.notification-type {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: #e9ecef;
  color: #495057;
}

.notification-message {
  color: #6c757d;
  margin: 0.5rem 0;
  line-height: 1.5;
}

.notification-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.notification-time {
  font-size: 0.875rem;
  color: #6c757d;
}

.notification-actions {
  display: flex;
  gap: 0.5rem;
}

.empty {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty p {
  color: #6c757d;
  font-size: 1.125rem;
}
</style>
