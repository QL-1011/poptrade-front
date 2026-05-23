<template>
  <div class="admin-shell">
    <aside class="admin-sidebar">
      <div class="sidebar-brand">
        <span class="brand-mark" aria-hidden="true">P</span>
        <span class="brand-text">PopTrade</span>
      </div>
      <nav class="sidebar-nav" role="navigation" aria-label="管理导航">
        <router-link to="/admin/users" class="nav-item" :class="{ active: route.path === '/admin/users' }" :aria-current="route.path === '/admin/users' ? 'page' : undefined">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </router-link>
        <router-link to="/admin/categories" class="nav-item" :class="{ active: route.path === '/admin/categories' }" :aria-current="route.path === '/admin/categories' ? 'page' : undefined">
          <el-icon><Grid /></el-icon>
          <span>分类管理</span>
        </router-link>
        <router-link to="/admin/products" class="nav-item" :class="{ active: route.path === '/admin/products' }" :aria-current="route.path === '/admin/products' ? 'page' : undefined">
          <el-icon><Goods /></el-icon>
          <span>商品管理</span>
        </router-link>
        <router-link to="/admin/orders" class="nav-item" :class="{ active: route.path === '/admin/orders' }" :aria-current="route.path === '/admin/orders' ? 'page' : undefined">
          <el-icon><Document /></el-icon>
          <span>订单管理</span>
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <span class="version">v1.0</span>
      </div>
    </aside>

    <div class="admin-main">
      <header class="admin-topbar">
        <h2 class="topbar-title">{{ route.meta.title }}</h2>
        <el-dropdown @command="handleCommand" trigger="click">
          <div class="topbar-user">
            <el-avatar :size="34" icon="UserFilled" />
            <span class="user-name">{{ userStore.user?.username }}</span>
            <el-icon class="user-arrow"><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">
                <el-icon><SwitchButton /></el-icon> 退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </header>
      <div class="admin-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { ArrowDown, SwitchButton } from '@element-plus/icons-vue';
import { useUserStore } from '../stores/user';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

function handleCommand(cmd) {
  if (cmd === 'logout') {
    userStore.logout();
    router.replace('/login');
  }
}
</script>

<style scoped>
.admin-shell {
  display: flex;
  min-height: 100vh;
}

/* ---- Sidebar ---- */
.admin-sidebar {
  width: 232px;
  background: var(--sidebar-bg);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 200;
}

.sidebar-brand {
  height: 64px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 20px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.brand-mark {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: var(--accent);
  color: var(--sidebar-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 800;
  flex-shrink: 0;
}

.brand-text {
  font-size: 17px;
  font-weight: 700;
  color: #e8e4da;
  letter-spacing: 2px;
}

.sidebar-nav {
  flex: 1;
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: #8b909e;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  font-weight: 500;
}

.nav-item:hover {
  background: var(--sidebar-hover);
  color: #c4c8d4;
}

.nav-item.active {
  background: var(--sidebar-active);
  color: var(--accent);
  font-weight: 600;
}

.nav-item:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: -2px;
  border-radius: var(--radius-sm);
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  width: 3px;
  height: 20px;
  background: var(--accent);
  border-radius: 0 2px 2px 0;
}

.nav-item :deep(.el-icon) {
  font-size: 18px;
}

.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(255,255,255,0.06);
}

.version {
  font-size: 11px;
  color: #555555;
  letter-spacing: 1px;
}

/* ---- Main area ---- */
.admin-main {
  flex: 1;
  margin-left: 232px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.admin-topbar {
  height: 64px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  border-top: 2px solid var(--accent);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.topbar-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 0.5px;
  border-left: 3px solid var(--accent);
  padding-left: 12px;
}

.topbar-user {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  transition: background 0.2s;
}

.topbar-user:hover {
  background: var(--bg-page);
}

.user-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.user-arrow {
  font-size: 12px;
  color: var(--text-muted);
}

.admin-content {
  flex: 1;
  padding: 24px 28px;
  background: var(--bg-page);
}
</style>
