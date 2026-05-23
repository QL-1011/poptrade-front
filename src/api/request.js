import axios from 'axios';
import { ElMessage } from 'element-plus';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// 请求拦截器 —— 自动附带 JWT Token
request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器 —— 统一错误处理，401 自动退出
request.interceptors.response.use(
  (res) => {
    const body = res.data;
    if (body.code === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      ElMessage.error(body.message || '登录已过期，请重新登录');
      window.location.href = '/login';
      return Promise.reject(new Error(body.message));
    }
    if (body.code !== 200) {
      ElMessage.error(body.message || '请求失败');
      return Promise.reject(new Error(body.message));
    }
    return body;
  },
  (err) => {
    ElMessage.error('网络异常，请稍后重试');
    return Promise.reject(err);
  },
);

export default request;
