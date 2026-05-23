<template>
  <div class="customer-shell">
    <header class="customer-topbar">
      <div class="topbar-inner">
        <span class="topbar-logo" @click="router.push('/')" role="link" tabindex="0" aria-label="回到首页">
          <span class="logo-dot" aria-hidden="true">P</span>PopTrade
        </span>
        <nav class="topbar-nav" role="navigation" aria-label="主导航">
          <router-link to="/" class="nav-link" :class="{ active: route.path === '/' }" :aria-current="route.path === '/' ? 'page' : undefined">首页</router-link>
          <router-link to="/orders" class="nav-link" :class="{ active: route.path === '/orders' }" :aria-current="route.path === '/orders' ? 'page' : undefined">我的订单</router-link>
        </nav>
        <div class="topbar-actions">
          <el-badge :value="cartCount" :hidden="!cartCount" :offset="[-4, 4]">
            <el-button :icon="ShoppingCart" circle class="cart-btn" @click="router.push('/cart')" aria-label="购物车" />
          </el-badge>
          <el-dropdown @command="handleCommand" trigger="click">
            <div class="user-chip">
              <el-avatar :size="30" icon="UserFilled" />
              <span>{{ userStore.user?.username }}</span>
              <el-icon style="font-size:12px;color:var(--text-muted)"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </header>
    <main class="customer-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ShoppingCart, ArrowDown } from '@element-plus/icons-vue';
import { useUserStore } from '../stores/user';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const cartCount = ref(0);

function handleCommand(cmd) {
  if (cmd === 'logout') {
    userStore.logout();
    router.replace('/login');
  }
}
</script>

<style scoped>
.customer-shell {
  min-height: 100vh;
  background: var(--bg-page);
}

.customer-topbar {
  height: 60px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  border-top: 2px solid var(--accent);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(8px);
}

.topbar-inner {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 28px;
  gap: 36px;
}

.topbar-logo {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-dot {
  width: 30px;
  height: 30px;
  border-radius: 7px;
  background: var(--sidebar-bg);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
}

.topbar-nav {
  display: flex;
  gap: 4px;
  flex: 1;
}

.nav-link {
  padding: 6px 16px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-link:hover { color: var(--text-primary); background: var(--border-light); }
.nav-link.active { color: var(--accent-hover); font-weight: 600; }
.nav-link:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: -2px;
  border-radius: var(--radius-sm);
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cart-btn {
  border: 1px solid var(--border) !important;
  background: var(--bg-card) !important;
  color: var(--text-secondary) !important;
  transition: all 0.2s ease;
}

.cart-btn:hover {
  border-color: var(--accent) !important;
  color: var(--accent) !important;
  background: var(--accent-soft) !important;
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 4px 10px 4px 4px;
  border-radius: 20px;
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
  transition: background 0.2s;
}

.user-chip:hover { background: var(--border-light); }

.customer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 28px;
  min-height: calc(100vh - 60px);
}
</style>
