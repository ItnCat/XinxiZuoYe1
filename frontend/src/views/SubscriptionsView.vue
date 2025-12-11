<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { subscriptionApi } from '../api/subscriptions';
import { userApi } from '../api/users';
import { serviceApi } from '../api/services';
import type { Subscription, User, Service } from '../types';

const subscriptions = ref<Subscription[]>([]);
const users = ref<User[]>([]);
const services = ref<Service[]>([]);
const loading = ref(false);
const showModal = ref(false);
const isEditing = ref(false);
const searchKeyword = ref('');

const currentSubscription = ref<Partial<Subscription>>({
  user_id: 0,
  service_id: 0,
  start_date: new Date().toISOString().split('T')[0],
  end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  auto_renew: false,
  status: 'active',
  payment_method: '',
  amount_paid: 0
});

const loadSubscriptions = async () => {
  loading.value = true;
  try {
    const response = await subscriptionApi.getAll();
    if (response.data.success) {
      subscriptions.value = response.data.data || [];
    }
  } catch (error) {
    console.error('Error loading subscriptions:', error);
    alert('加载订阅失败');
  } finally {
    loading.value = false;
  }
};

const loadUsers = async () => {
  try {
    const response = await userApi.getAll();
    if (response.data.success) {
      users.value = response.data.data || [];
    }
  } catch (error) {
    console.error('Error loading users:', error);
  }
};

const loadServices = async () => {
  try {
    const response = await serviceApi.getAll('active');
    if (response.data.success) {
      services.value = response.data.data || [];
    }
  } catch (error) {
    console.error('Error loading services:', error);
  }
};

const searchSubscriptions = async () => {
  if (!searchKeyword.value.trim()) {
    await loadSubscriptions();
    return;
  }
  loading.value = true;
  try {
    const response = await subscriptionApi.search(searchKeyword.value);
    if (response.data.success) {
      subscriptions.value = response.data.data || [];
    }
  } catch (error) {
    console.error('Error searching subscriptions:', error);
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  isEditing.value = false;
  currentSubscription.value = {
    user_id: 0,
    service_id: 0,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    auto_renew: false,
    status: 'active',
    payment_method: '支付宝',
    amount_paid: 0
  };
  showModal.value = true;
};

// 当选择服务时，自动更新支付金额
const onServiceChange = () => {
  if (currentSubscription.value.service_id) {
    const selectedService = services.value.find(s => s.service_id === currentSubscription.value.service_id);
    if (selectedService) {
      currentSubscription.value.amount_paid = selectedService.price;
    }
  }
};

const openEditModal = (subscription: Subscription) => {
  isEditing.value = true;
  currentSubscription.value = { ...subscription };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const saveSubscription = async () => {
  try {
    if (isEditing.value && currentSubscription.value.subscription_id) {
      await subscriptionApi.update(currentSubscription.value.subscription_id, currentSubscription.value);
      alert('订阅更新成功');
    } else {
      await subscriptionApi.create(currentSubscription.value as Omit<Subscription, 'subscription_id' | 'created_at' | 'updated_at'>);
      alert('订阅创建成功');
    }
    closeModal();
    await loadSubscriptions();
  } catch (error: any) {
    console.error('Error saving subscription:', error);
    alert(error.response?.data?.error || '保存失败');
  }
};

const cancelSubscription = async (id: number) => {
  if (!confirm('确定要取消这个订阅吗？')) return;
  try {
    await subscriptionApi.cancel(id);
    alert('订阅取消成功');
    await loadSubscriptions();
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    alert('取消失败');
  }
};

const deleteSubscription = async (id: number) => {
  if (!confirm('确定要删除这个订阅吗？')) return;
  try {
    await subscriptionApi.delete(id);
    alert('订阅删除成功');
    await loadSubscriptions();
  } catch (error) {
    console.error('Error deleting subscription:', error);
    alert('删除失败');
  }
};

const toggleAutoRenew = async (subscription: Subscription) => {
  try {
    await subscriptionApi.update(subscription.subscription_id!, {
      auto_renew: !subscription.auto_renew
    });
    await loadSubscriptions();
  } catch (error) {
    console.error('Error toggling auto-renew:', error);
    alert('更新自动续费设置失败');
  }
};

onMounted(() => {
  loadSubscriptions();
  loadUsers();
  loadServices();
});
</script>

<template>
  <div class="subscriptions-view">
    <div class="container">
      <h1>订阅管理</h1>
      
      <div class="toolbar">
        <div class="search-box">
          <input 
            v-model="searchKeyword" 
            @keyup.enter="searchSubscriptions"
            type="text" 
            placeholder="搜索用户名、邮箱或服务名称..." 
          />
          <button @click="searchSubscriptions" class="btn btn-secondary">搜索</button>
          <button v-if="searchKeyword" @click="searchKeyword = ''; loadSubscriptions()" class="btn btn-secondary">清除</button>
        </div>
        <button @click="openCreateModal" class="btn btn-primary">+ 新增订阅</button>
      </div>

      <div v-if="loading" class="loading">加载中...</div>
      
      <div v-else class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>用户</th>
              <th>服务</th>
              <th>开始日期</th>
              <th>结束日期</th>
              <th>状态</th>
              <th>自动续费</th>
              <th>金额</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sub in subscriptions" :key="sub.subscription_id">
              <td>{{ sub.subscription_id }}</td>
              <td>{{ sub.username }}</td>
              <td>{{ sub.service_name }}</td>
              <td>{{ sub.start_date }}</td>
              <td>{{ sub.end_date }}</td>
              <td>
                <span :class="['status-badge', sub.status]">
                  {{ sub.status }}
                </span>
              </td>
              <td>
                <label class="switch">
                  <input 
                    type="checkbox" 
                    :checked="sub.auto_renew"
                    @change="toggleAutoRenew(sub)"
                    :disabled="sub.status !== 'active'"
                  />
                  <span class="slider"></span>
                </label>
              </td>
              <td>¥{{ sub.amount_paid }}</td>
              <td>
                <button @click="openEditModal(sub)" class="btn btn-sm btn-secondary">编辑</button>
                <button 
                  v-if="sub.status === 'active'" 
                  @click="cancelSubscription(sub.subscription_id!)" 
                  class="btn btn-sm btn-warning"
                >
                  取消
                </button>
                <button @click="deleteSubscription(sub.subscription_id!)" class="btn btn-sm btn-danger">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <h2>{{ isEditing ? '编辑订阅' : '新增订阅' }}</h2>
        <form @submit.prevent="saveSubscription">
          <div class="form-group">
            <label>用户 *</label>
            <select v-model.number="currentSubscription.user_id" required :disabled="isEditing">
              <option value="0" disabled>请选择用户</option>
              <option v-for="user in users" :key="user.user_id" :value="user.user_id">
                {{ user.username }} ({{ user.email }})
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>服务 *</label>
            <select v-model.number="currentSubscription.service_id" @change="onServiceChange" required :disabled="isEditing">
              <option value="0" disabled>请选择服务</option>
              <option v-for="service in services" :key="service.service_id" :value="service.service_id">
                {{ service.service_name }} (¥{{ service.price }}/{{ service.billing_cycle }})
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>开始日期 *</label>
            <input v-model="currentSubscription.start_date" type="date" required />
          </div>
          <div class="form-group">
            <label>结束日期 *</label>
            <input v-model="currentSubscription.end_date" type="date" required />
          </div>
          <div class="form-group">
            <label>支付方式 *</label>
            <select v-model="currentSubscription.payment_method" required>
              <option value="支付宝">支付宝</option>
              <option value="微信">微信</option>
              <option value="银行卡">银行卡</option>
            </select>
          </div>
          <div class="form-group">
            <label>支付金额</label>
            <input v-model.number="currentSubscription.amount_paid" type="number" step="0.01" readonly />
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" v-model="currentSubscription.auto_renew" />
              自动续费
            </label>
          </div>
          <div class="form-group">
            <label>状态</label>
            <select v-model="currentSubscription.status">
              <option value="pending">pending (待处理)</option>
              <option value="active">active (激活)</option>
              <option value="expired">expired (已过期)</option>
              <option value="cancelled">cancelled (已取消)</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn btn-secondary">取消</button>
            <button type="submit" class="btn btn-primary">保存</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.subscriptions-view {
  padding: 2rem;
}

.container {
  max-width: 1600px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 2rem;
  color: #2c3e50;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.search-box {
  display: flex;
  gap: 0.5rem;
  flex: 1;
  max-width: 500px;
}

.search-box input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
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

.btn-warning {
  background-color: #ffc107;
  color: #000;
}

.btn-warning:hover {
  background-color: #e0a800;
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
  margin-right: 0.5rem;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

.data-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

.data-table tbody tr:hover {
  background-color: #f8f9fa;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge.active {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-badge.expired {
  background-color: #f8d7da;
  color: #721c24;
}

.status-badge.cancelled {
  background-color: #d6d8db;
  color: #383d41;
}

/* Toggle Switch */
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #42b983;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

input:disabled + .slider {
  background-color: #e9ecef;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
}

.form-group input[type="checkbox"] {
  width: auto;
  margin-right: 0.5rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

/* 响应式设计 - 适配不同窗口尺寸 */
@media (max-width: 1400px) {
  .container {
    max-width: 100%;
    padding: 0 1rem;
  }
}

@media (max-width: 768px) {
  .subscriptions-view {
    padding: 1rem;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    max-width: 100%;
  }

  .table-container {
    overflow-x: auto;
  }

  .data-table {
    min-width: 800px;
  }

  .modal {
    width: 95%;
    max-width: none;
    padding: 1.5rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .subscriptions-view {
    padding: 0.5rem;
  }

  h1 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  .btn {
    font-size: 0.875rem;
    padding: 0.4rem 0.8rem;
  }

  .search-box {
    flex-direction: column;
  }

  .search-box input,
  .search-box button {
    width: 100%;
  }

  .modal {
    padding: 1rem;
  }

  .modal h2 {
    font-size: 1.25rem;
  }
}
</style>
