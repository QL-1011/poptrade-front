import request from './request';

export const getCategoryPage = (params) => request.get('/admin/category/page', { params });
export const getCategoryList = () => request.get('/admin/category/list');
export const saveCategory = (data) => request.post('/admin/category', data);
export const updateCategory = (data) => request.put('/admin/category', data);
export const deleteCategory = (id) => request.delete(`/admin/category/${id}`);
export const deleteCategoryBatch = (ids) => request.delete('/admin/category/batch', { data: ids });
