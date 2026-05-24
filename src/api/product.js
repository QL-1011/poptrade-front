import request from './request';

export const getProductPage = (params) => request.get('/admin/product/page', { params });
export const getProductById = (id) => request.get(`/admin/product/${id}`);
export const saveProduct = (data) => request.post('/admin/product', data);
export const updateProduct = (data) => request.put('/admin/product', data);
export const deleteProduct = (id) => request.delete(`/admin/product/${id}`);
export const deleteProductBatch = (ids) => request.delete('/admin/product/batch', { data: ids });
export const updateProductStatus = (id, status) => request.put(`/admin/product/${id}/status`, null, { params: { status } });
