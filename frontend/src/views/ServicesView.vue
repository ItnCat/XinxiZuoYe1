<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { serviceApi } from '../api/services';
import type { Service } from '../types';

const services = ref<Service[]>([]);
const loading = ref(false);
const showModal = ref(false);
const isEditing = ref(false);
const searchKeyword = ref('');

const currentService = ref<Partial<Service>>({
  service_name: '',
  description: '',
  price: 0,
  billing_cycle: 'monthly',
  features: {},
  status: 'active'
});

const loadServices = async () => {
  loading.value = true;
  try {
    const response = await serviceApi.getAll();
    if (response.data.success) {
      services.value = response.data.data || [];
    }
  } catch (error) {
    console.error('Error loading services:', error);
    alert('加载服务失败');
  } finally {
    loading.value = false;
  }
};

const searchServices = async () => {
  if (!searchKeyword.value.trim()) {
    await loadServices();
    return;
  }
  loading.value = true;
  try {
    const response = await serviceApi.search(searchKeyword.value);
    if (response.data.success) {
      services.value = response.data.data || [];
    }
  } catch (error) {
    console.error('Error searching services:', error);
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  isEditing.value = false;
  currentService.value = {
    service_name: '',
    description: '',
    price: 0,
    billing_cycle: 'monthly',
    features: {},
    status: 'active'
  };
  showModal.value = true;
};

const openEditModal = (service: Service) => {
  isEditing.value = true;
  currentService.value = { ...service };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const saveService = async () => {
  try {
    if (isEditing.value && currentService.value.service_id) {
      await serviceApi.update(currentService.value.service_id, currentService.value);
      alert('服务更新成功');
    } else {
      await serviceApi.create(currentService.value as Omit<Service, 'service_id' | 'created_at' | 'updated_at'>);
      alert('服务创建成功');
    }
    closeModal();
    await loadServices();
  } catch (error: any) {
    console.error('Error saving service:', error);
    alert(error.response?.data?.error || '保存失败');
  }
};

const deleteService = async (id: number) => {
  if (!confirm('确定要删除这个服务吗？')) return;
  try {
    await serviceApi.delete(id);
    alert('服务删除成功');
    await loadServices();
  } catch (error) {
    console.error('Error deleting service:', error);
    alert('删除失败');
  }
};

onMounted(() => {
  loadServices();
});
</script>

<template>
  <div class="services-view">
    <div class="container">
      <h1>服务管理</h1>
      
      <div class="toolbar">
        <div class="search-box">
          <input 
            v-model="searchKeyword" 
            @keyup.enter="searchServices"
            type="text" 
            placeholder="搜索服务名称或描述..." 
          />
          <button @click="searchServices" class="btn btn-secondary">搜索</button>
          <button v-if="searchKeyword" @click="searchKeyword = ''; loadServices()" class="btn btn-secondary">清除</button>
        </div>
        <button @click="openCreateModal" class="btn btn-primary">+ 新增服务</button>
      </div>

      <div v-if="loading" class="loading">加载中...</div>
      
      <div v-else class="services-grid">
        <div v-for="service in services" :key="service.service_id" class="service-card">
          <div class="service-header">
            <h3>{{ service.service_name }}</h3>
            <span :class="['status-badge', service.status]">{{ service.status }}</span>
          </div>
          <p class="service-description">{{ service.description || '暂无描述' }}</p>
          <div class="service-details">
            <div class="detail-item">
              <span class="label">价格:</span>
              <span class="value price">¥{{ service.price }}</span>
            </div>
            <div class="detail-item">
              <span class="label">计费周期:</span>
              <span class="value">{{ service.billing_cycle }}</span>
            </div>
          </div>
          <div class="service-actions">
            <button @click="openEditModal(service)" class="btn btn-sm btn-secondary">编辑</button>
            <button @click="deleteService(service.service_id!)" class="btn btn-sm btn-danger">删除</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <h2>{{ isEditing ? '编辑服务' : '新增服务' }}</h2>
        <form @submit.prevent="saveService">
          <div class="form-group">
            <label>服务名称 *</label>
            <input v-model="currentService.service_name" type="text" required />
          </div>
          <div class="form-group">
            <label>描述</label>
            <textarea v-model="currentService.description" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>价格 *</label>
            <input v-model.number="currentService.price" type="number" step="0.01" required />
          </div>
          <div class="form-group">
            <label>计费周期 *</label>
            <select v-model="currentService.billing_cycle" required>
              <option value="daily">daily (每日)</option>
              <option value="weekly">weekly (每周)</option>
              <option value="monthly">monthly (每月)</option>
              <option value="yearly">yearly (每年)</option>
            </select>
          </div>
          <div class="form-group">
            <label>状态</label>
            <select v-model="currentService.status">
              <option value="active">active (激活)</option>
              <option value="inactive">inactive (未激活)</option>
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
.services-view {
  padding: 2rem;
}

.container {
  max-width: 1400px;
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

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.service-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.service-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.service-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.service-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.25rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.active {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.inactive {
  background-color: #f8d7da;
  color: #721c24;
}

.service-description {
  color: #6c757d;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  min-height: 3rem;
}

.service-details {
  border-top: 1px solid #e9ecef;
  padding-top: 1rem;
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.detail-item .label {
  color: #6c757d;
  font-size: 0.875rem;
}

.detail-item .value {
  font-weight: 600;
  color: #2c3e50;
}

.detail-item .price {
  color: #42b983;
  font-size: 1.25rem;
}

.service-actions {
  display: flex;
  gap: 0.5rem;
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
</style>
