import { defineStore } from 'pinia';
import { ref } from 'vue';
import { loginApi } from '../api/user';

export const useUserStore = defineStore('user', () => {
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'));

  async function login(username, password) {
    const res = await loginApi({ username, password });
    const { token, user: userInfo } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userInfo));
    user.value = userInfo;
    return userInfo;
  }

  function logout() {
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  return { user, login, logout };
});
