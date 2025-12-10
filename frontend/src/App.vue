<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app">
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-brand">
          <RouterLink to="/">📋 订阅服务管理系统</RouterLink>
        </div>
        <div class="nav-menu">
          <RouterLink to="/" class="nav-link">首页</RouterLink>
          <RouterLink to="/users" class="nav-link">用户管理</RouterLink>
          <RouterLink to="/services" class="nav-link">服务管理</RouterLink>
          <RouterLink to="/subscriptions" class="nav-link">订阅管理</RouterLink>
          <RouterLink to="/notifications" class="nav-link">通知中心</RouterLink>
        </div>
      </div>
    </nav>
    
    <main class="main-content">
      <RouterView />
    </main>

    <footer class="footer">
      <p>&copy; 2024 订阅服务管理系统. Powered by Vue 3 + TypeScript</p>
    </footer>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: #f5f7fa;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand a {
  color: white;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-menu {
  display: flex;
  gap: 1rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-link.router-link-active {
  background-color: rgba(255, 255, 255, 0.2);
  font-weight: 500;
}

.main-content {
  flex: 1;
  min-height: calc(100vh - 140px);
}

.footer {
  background-color: #2c3e50;
  color: white;
  text-align: center;
  padding: 1.5rem;
  margin-top: auto;
}

.footer p {
  margin: 0;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    gap: 1rem;
  }

  .nav-menu {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
