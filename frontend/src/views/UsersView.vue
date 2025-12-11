<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { userApi } from '../api/users';
import type { User } from '../types';

const users = ref<User[]>([]);
const loading = ref(false);
const showModal = ref(false);
const isEditing = ref(false);
const searchKeyword = ref('');

const currentUser = ref<Partial<User> & { password?: string }>({
  username: '',
  email: '',
  phone: '',
  real_name: '',
  status: 'active',
  password: ''
});

const loadUsers = async () => {
  loading.value = true;
  try {
    const response = await userApi.getAll();
    if (response.data.success) {
      users.value = response.data.data || [];
    }
  } catch (error) {
    console.error('Error loading users:', error);
    alert('加载用户失败');
  } finally {
    loading.value = false;
  }
};

const searchUsers = async () => {
  if (!searchKeyword.value.trim()) {
    await loadUsers();
    return;
  }
  loading.value = true;
  try {
    const response = await userApi.search(searchKeyword.value);
    if (response.data.success) {
      users.value = response.data.data || [];
    }
  } catch (error) {
    console.error('Error searching users:', error);
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  isEditing.value = false;
  currentUser.value = {
    username: '',
    email: '',
    phone: '',
    real_name: '',
    status: 'active',
    password: ''
  };
  showModal.value = true;
};

const openEditModal = (user: User) => {
  isEditing.value = true;
  currentUser.value = { ...user };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  currentUser.value = {
    username: '',
    email: '',
    phone: '',
    real_name: '',
    status: 'active',
    password: ''
  };
};

const saveUser = async () => {
  try {
    if (isEditing.value && currentUser.value.user_id) {
      await userApi.update(currentUser.value.user_id, currentUser.value);
      alert('用户更新成功');
    } else {
      if (!currentUser.value.password) {
        alert('密码不能为空');
        return;
      }
      await userApi.create(currentUser.value as Partial<User> & { password: string });
      alert('用户创建成功');
    }
    closeModal();
    await loadUsers();
  } catch (error: any) {
    console.error('Error saving user:', error);
    alert(error.response?.data?.error || '保存失败');
  }
};

const deleteUser = async (id: number) => {
  if (!confirm('确定要删除这个用户吗？')) return;
  try {
    await userApi.delete(id);
    alert('用户删除成功');
    await loadUsers();
  } catch (error) {
    console.error('Error deleting user:', error);
    alert('删除失败');
  }
};

onMounted(() => {
  loadUsers();
});
</script>

<template>
  <div class="users-view">
    <div class="container">
      <h1>用户管理</h1>
      
      <div class="toolbar">
        <div class="search-box">
          <input 
            v-model="searchKeyword" 
            @keyup.enter="searchUsers"
            type="text" 
            placeholder="搜索用户名、邮箱或真实姓名..." 
          />
          <button @click="searchUsers" class="btn btn-secondary">搜索</button>
          <button v-if="searchKeyword" @click="searchKeyword = ''; loadUsers()" class="btn btn-secondary">清除</button>
        </div>
        <button @click="openCreateModal" class="btn btn-primary">+ 新增用户</button>
      </div>

      <div v-if="loading" class="loading">加载中...</div>
      
      <div v-else class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>用户名</th>
              <th>邮箱</th>
              <th>手机号</th>
              <th>真实姓名</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.user_id">
              <td>{{ user.user_id }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.phone || '-' }}</td>
              <td>{{ user.real_name || '-' }}</td>
              <td>
                <span :class="['status-badge', user.status]">
                  {{ user.status }}
                </span>
              </td>
              <td>{{ new Date(user.created_at || '').toLocaleDateString() }}</td>
              <td>
                <button @click="openEditModal(user)" class="btn btn-sm btn-secondary">编辑</button>
                <button @click="deleteUser(user.user_id!)" class="btn btn-sm btn-danger">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <h2>{{ isEditing ? '编辑用户' : '新增用户' }}</h2>
        <form @submit.prevent="saveUser">
          <div class="form-group">
            <label>用户名 *</label>
            <input v-model="currentUser.username" type="text" required />
          </div>
          <div class="form-group">
            <label>邮箱 *</label>
            <input v-model="currentUser.email" type="email" required />
          </div>
          <div class="form-group">
            <label>手机号</label>
            <input v-model="currentUser.phone" type="text" />
          </div>
          <div class="form-group">
            <label>真实姓名</label>
            <input v-model="currentUser.real_name" type="text" />
          </div>
          <div class="form-group" v-if="!isEditing">
            <label>密码 *</label>
            <input v-model="currentUser.password" type="password" required />
          </div>
          <div class="form-group">
            <label>状态</label>
            <select v-model="currentUser.status">
              <option value="active">active</option>
              <option value="inactive">inactive</option>
              <option value="suspended">suspended</option>
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
.users-view {
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

.status-badge.inactive {
  background-color: #f8d7da;
  color: #721c24;
}

.status-badge.suspended {
  background-color: #fff3cd;
  color: #856404;
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
