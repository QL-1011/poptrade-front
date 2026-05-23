import request from './request';

export const loginApi = (data) => request.post('/user/login', data);
export const registerApi = (data) => request.post('/user/register', data);
export const getUserPage = (params) => request.get('/admin/user/page', { params });
export const saveUser = (data) => request.post('/admin/user', data);
export const updateUser = (data) => request.put('/admin/user', data);
export const deleteUser = (id) => request.delete(`/admin/user/${id}`);
export const deleteUserBatch = (ids) => request.delete('/admin/user/batch', { data: ids });
export const getUserById = (id) => request.get(`/admin/user/${id}`);
export const updateUserStatus = (id, status) => request.put(`/admin/user/${id}/status`, null, { params: { status } });
