<template>
  <router-view v-slot="{ Component, route }">
    <transition name="fade" mode="out-in">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>

<style>
:root {
  --sidebar-bg: #171717;
  --sidebar-hover: #262626;
  --sidebar-active: #333333;
  --accent: #D4AF37;
  --accent-hover: #C19B2F;
  --accent-light: rgba(212, 175, 55, 0.12);
  --accent-soft: rgba(212, 175, 55, 0.06);
  --text-primary: #171717;
  --text-secondary: #525252;
  --text-muted: #737373;
  --bg-page: #fafaf8;
  --bg-card: #ffffff;
  --border: #e5e5e5;
  --border-light: #f0f0f0;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 12px 40px rgba(0, 0, 0, 0.10);
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

button, a, [role="button"], .el-button, .el-dropdown {
  cursor: pointer;
}

body {
  font-family: 'Inter', 'Helvetica Neue', 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  background: var(--bg-page);
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.6;
  letter-spacing: -0.01em;
}

/* Focus ring for keyboard navigation */
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: 2px;
}

/* Respect reduced-motion preference */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Page transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Refined scrollbar */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #d4d0c8; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #bbb5a8; }

/* Placeholder card for WIP pages */
.placeholder-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-top: 2px solid var(--accent-soft);
  border-radius: var(--radius-md);
  padding: 80px 40px;
  text-align: center;
  box-shadow: var(--shadow-sm);
  animation: fadeInUp 0.4s ease;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.placeholder-icon {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: var(--bg-page);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  margin-bottom: 20px;
}

.placeholder-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.placeholder-card p {
  font-size: 14px;
  color: var(--text-muted);
}
</style>
