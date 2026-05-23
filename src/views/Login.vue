<template>
  <div class="login-wrapper">
    <div class="login-bg" aria-hidden="true">
      <div class="bg-shape bg-shape-1"></div>
      <div class="bg-shape bg-shape-2"></div>
    </div>
    <div class="login-card">
      <div class="card-header">
        <div class="logo-mark" aria-hidden="true">P</div>
        <h1>PopTrade</h1>
        <p>poptrade管理平台</p>
      </div>
      <el-form ref="formRef" :model="form" :rules="rules" size="large" @submit.prevent="handleLogin">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="用户名" :prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码" show-password :prefix-icon="Lock" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit" :loading="loading" class="login-btn">
            登 录
          </el-button>
        </el-form-item>
      </el-form>
      <p class="card-footer">
        欢迎您选购😄
        <br />
        <router-link to="/register" class="register-link">还没有账号？立即注册</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { User, Lock } from '@element-plus/icons-vue';
import { useUserStore } from '../stores/user';

const router = useRouter();
const userStore = useUserStore();
const formRef = ref(null);
const loading = ref(false);

const form = reactive({ username: '', password: '' });
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
};

async function handleLogin() {
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;
  loading.value = true;
  try {
    const user = await userStore.login(form.username, form.password);
    router.replace(user.role === 0 ? '/admin' : '/');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--sidebar-bg);
  overflow: hidden;
}

.login-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.bg-shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.06;
  background: var(--accent);
}

.bg-shape-1 {
  width: 600px;
  height: 600px;
  top: -200px;
  right: -150px;
  animation: float 20s ease-in-out infinite;
}

.bg-shape-2 {
  width: 400px;
  height: 400px;
  bottom: -120px;
  left: -80px;
  animation: float 24s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(30px, -30px) rotate(120deg); }
  66% { transform: translate(-20px, 20px) rotate(240deg); }
}

.login-card {
  position: relative;
  z-index: 1;
  width: 420px;
  padding: 52px 44px 40px;
  background: #fff;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

.card-header {
  text-align: center;
  margin-bottom: 36px;
}

.logo-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--sidebar-bg), #2a2a2a);
  color: var(--accent);
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 1px;
  margin-bottom: 16px;
}

.card-header h1 {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 3px;
  margin-bottom: 6px;
}

.card-header p {
  font-size: 13px;
  color: var(--text-muted);
  letter-spacing: 1px;
}

.login-card :deep(.el-input__wrapper) {
  background: #f8f7f4;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  box-shadow: none;
  padding: 2px 12px;
}

.login-card :deep(.el-input__wrapper:hover) {
  border-color: #c9c5bc;
}

.login-card :deep(.el-input__wrapper.is-focus) {
  border-color: var(--accent);
  box-shadow: 0 0 0 1px var(--accent-light);
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 15px;
  letter-spacing: 4px;
  background: linear-gradient(135deg, var(--sidebar-bg), #333333) !important;
  border-color: var(--sidebar-bg) !important;
  border-radius: var(--radius-sm);
  font-weight: 600;
  transition: all 0.25s ease;
}

.login-btn:hover {
  background: linear-gradient(135deg, #2a2a2a, #404040) !important;
  border-color: #2a2a2a !important;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

.card-footer {
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 8px;
  letter-spacing: 0.5px;
  line-height: 1.8;
}

.register-link {
  color: var(--accent);
  text-decoration: none;
  font-weight: 500;
  font-size: 13px;
  transition: color 0.2s;
}

.register-link:hover {
  color: var(--accent-hover);
  text-decoration: underline;
}
</style>
