<template>
  <div>
    <!-- Search -->
    <div class="panel search-panel">
      <el-form :model="query" inline @submit.prevent="fetchPage" class="search-form">
        <el-form-item label="商品名称">
          <el-input v-model="query.productName" placeholder="请输入..." clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部" clearable>
            <el-option :value="1" label="上架" />
            <el-option :value="0" label="下架" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchPage" class="btn-search">查询</el-button>
          <el-button @click="resetQuery" class="btn-reset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- Category Tabs -->
    <div class="panel category-tabs-panel">
      <div class="category-tabs">
        <button
          class="category-tab"
          :class="{ active: activeCategory === null }"
          @click="switchCategory(null)"
        >
          全部
          <span class="tab-count">{{ totalAll }}</span>
        </button>
        <button
          v-for="c in categoryList"
          :key="c.id"
          class="category-tab"
          :class="{ active: activeCategory === c.id }"
          @click="switchCategory(c.id)"
        >
          {{ c.categoryName }}
        </button>
      </div>
    </div>

    <!-- Actions -->
    <div class="panel action-panel">
      <el-button type="primary" :icon="Plus" @click="openDialog()" aria-label="新增商品">新增商品</el-button>
      <el-button :icon="Delete" :disabled="selected.length === 0" @click="handleBatchDelete" class="btn-danger-outline" aria-label="批量删除商品">
        批量删除
      </el-button>
      <span v-if="selected.length" class="selected-hint">已选 {{ selected.length }} 项</span>
      <span class="current-category-hint" v-if="activeCategory !== null">
        当前分类：<strong>{{ currentCategoryName }}</strong>
      </span>
    </div>

    <!-- Table -->
    <div class="panel table-panel">
      <div class="table-scroll">
        <el-table :data="tableData.list" stripe v-loading="loading"
        @selection-change="(rows) => selected = rows.map(r => r.id)"
        style="width: 100%"
        :header-cell-style="{ background: '#fafaf8', color: '#64748b', fontWeight: 600, fontSize: '13px', borderColor: 'var(--border)' }"
        :row-style="{ fontSize: '14px' }"
      >
        <template #empty>
          <el-empty description="暂无商品数据" :image-size="80" />
        </template>
        <el-table-column type="selection" width="48" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="productName" label="商品名称" min-width="160" />
        <el-table-column prop="price" label="价格" width="120" align="right">
          <template #default="{ row }">
            <span class="price-cell">&yen;{{ row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="90" align="center" />
        <el-table-column prop="categoryName" label="分类" width="120">
          <template #default="{ row }">
            <span class="category-badge">{{ row.categoryName || '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch :model-value="row.status === 1" @change="(val) => handleToggleStatus(row, val)" :aria-label="`切换${row.productName}状态`" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">{{ row.createTime?.replace('T', ' ') }}</template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" :icon="Edit" @click="openDialog(row)" class="row-btn">编辑</el-button>
            <el-popconfirm title="确定删除该商品？" @confirm="handleDelete(row.id)" confirm-button-text="删除" cancel-button-text="取消">
              <template #reference>
                <el-button link type="danger" :icon="Delete" class="row-btn">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      </div>

      <div class="table-footer">
        <el-pagination
          v-model:current-page="query.pageNum"
          v-model:page-size="query.pageSize"
          :total="tableData.total"
          :page-sizes="[5, 10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @change="fetchPage"
        />
      </div>
    </div>

    <!-- Dialog -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="520px" @close="resetForm" class="user-dialog">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" class="dialog-form">
        <el-form-item label="商品名称" prop="productName">
          <el-input v-model="form.productName" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="form.price" :min="0" :precision="2" :step="1" style="width: 100%" placeholder="请输入价格" />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="form.stock" :min="0" :step="1" style="width: 100%" placeholder="请输入库存" />
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="form.categoryId" style="width: 100%" placeholder="请选择分类">
            <el-option v-for="c in categoryList" :key="c.id" :value="c.id" :label="c.categoryName" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">上架</el-radio>
            <el-radio :value="0">下架</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="图片">
          <el-input v-model="form.img" placeholder="请输入图片 URL（可选）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false" class="btn-cancel">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit" class="btn-confirm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Edit, Delete } from '@element-plus/icons-vue';
import { getProductPage, saveProduct, updateProduct, deleteProduct, deleteProductBatch, updateProductStatus } from '../../api/product';
import { getCategoryList } from '../../api/category';

const loading = ref(false);
const selected = ref([]);
const dialogVisible = ref(false);
const submitLoading = ref(false);
const formRef = ref(null);
const categoryList = ref([]);
const activeCategory = ref(null);
const isEdit = computed(() => !!form.id);

const dialogTitle = computed(() => isEdit.value ? '编辑商品' : '新增商品');

const currentCategoryName = computed(() => {
  const c = categoryList.value.find(item => item.id === activeCategory.value);
  return c ? c.categoryName : '';
});

const totalAll = ref(0);

const query = reactive({ pageNum: 1, pageSize: 10, productName: '', categoryId: null, status: null });
const tableData = reactive({ total: 0, list: [], pages: 0 });

const form = reactive({ id: null, productName: '', price: null, stock: null, categoryId: null, status: 1, img: '' });
const rules = {
  productName: [{ required: true, message: '商品名称不能为空', trigger: 'blur' }],
  price: [{ required: true, message: '价格不能为空', trigger: 'blur' }],
  stock: [{ required: true, message: '库存不能为空', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
};

onMounted(async () => {
  await loadCategories();
  fetchTotalCount();
  fetchPage();
});

async function loadCategories() {
  try {
    const res = await getCategoryList();
    categoryList.value = res.data || [];
  } catch { /* ignore */ }
}

async function fetchTotalCount() {
  try {
    const res = await getProductPage({ pageNum: 1, pageSize: 1 });
    totalAll.value = res.data?.total || 0;
  } catch { /* ignore */ }
}

function switchCategory(categoryId) {
  activeCategory.value = categoryId;
  query.categoryId = categoryId;
  query.pageNum = 1;
  query.productName = '';
  query.status = null;
  fetchPage();
}

async function fetchPage() {
  loading.value = true;
  try {
    const params = {};
    Object.keys(query).forEach(k => { if (query[k] !== '' && query[k] !== null) params[k] = query[k]; });
    const res = await getProductPage(params);
    Object.assign(tableData, res.data);
  } finally {
    loading.value = false;
  }
}

function resetQuery() {
  Object.assign(query, { pageNum: 1, pageSize: 10, productName: '', categoryId: activeCategory.value, status: null });
  fetchPage();
}

function openDialog(row = null) {
  if (row) {
    Object.assign(form, {
      id: row.id, productName: row.productName, price: row.price,
      stock: row.stock, categoryId: row.categoryId, status: row.status, img: row.img || ''
    });
  }
  dialogVisible.value = true;
}

function resetForm() {
  formRef.value?.resetFields();
  Object.assign(form, { id: null, productName: '', price: null, stock: null, categoryId: null, status: 1, img: '' });
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  submitLoading.value = true;
  try {
    const data = { ...form };
    if (isEdit.value) {
      await updateProduct(data);
      ElMessage.success('修改成功');
    } else {
      await saveProduct(data);
      ElMessage.success('新增成功');
    }
    dialogVisible.value = false;
    fetchTotalCount();
    fetchPage();
  } finally {
    submitLoading.value = false;
  }
}

async function handleDelete(id) {
  await deleteProduct(id);
  ElMessage.success('删除成功');
  fetchTotalCount();
  fetchPage();
}

async function handleBatchDelete() {
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${selected.value.length} 个商品？`, '提示', { type: 'warning' });
  } catch {
    return;
  }
  await deleteProductBatch(selected.value);
  ElMessage.success('批量删除成功');
  selected.value = [];
  fetchTotalCount();
  fetchPage();
}

async function handleToggleStatus(row, val) {
  await updateProductStatus(row.id, val ? 1 : 0);
  row.status = val ? 1 : 0;
  ElMessage.success(row.status === 1 ? '已上架' : '已下架');
}
</script>

<style scoped>
.panel {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  margin-bottom: 16px;
  box-shadow: var(--shadow-sm);
  border-top: 2px solid var(--accent-soft);
}

.search-panel { padding: 20px 24px 4px; }

/* ---- Category Tabs ---- */
.category-tabs-panel {
  padding: 16px 24px;
}

.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.category-tab {
  padding: 8px 20px;
  border: 1px solid var(--border);
  border-radius: 100px;
  background: #fafaf8;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  line-height: 1;
}

.category-tab:hover {
  border-color: var(--accent);
  color: var(--accent-hover);
  background: var(--accent-soft);
}

.category-tab.active {
  background: linear-gradient(135deg, var(--sidebar-bg), #333333);
  border-color: var(--sidebar-bg);
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.2);
  font-size: 12px;
  font-weight: 600;
}

.category-tab:not(.active) .tab-count {
  background: #e8e6df;
  color: var(--text-muted);
}

/* ---- Action Panel ---- */
.action-panel {
  padding: 14px 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-left: 3px solid var(--accent);
}

.action-panel :deep(.el-button--primary) {
  background: linear-gradient(135deg, var(--sidebar-bg), #333333) !important;
  border-color: var(--sidebar-bg) !important;
  border-radius: var(--radius-sm);
  font-weight: 500;
  transition: all 0.2s ease;
}

.action-panel :deep(.el-button--primary:hover) {
  background: linear-gradient(135deg, #2a2a2a, #404040) !important;
  border-color: #2a2a2a !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
}

.current-category-hint {
  margin-left: auto;
  font-size: 13px;
  color: var(--text-muted);
}

.current-category-hint strong {
  color: var(--accent-hover);
  font-weight: 600;
}

.table-panel { padding: 0; overflow: hidden; }
.table-scroll { overflow-x: auto; }

.search-form :deep(.el-form-item) { margin-bottom: 16px; }

.search-form :deep(.el-input__wrapper),
.search-form :deep(.el-select .el-input__wrapper) {
  background: #fafaf8;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  box-shadow: none;
  width: 160px;
}

.search-form :deep(.el-input__wrapper:hover),
.search-form :deep(.el-select:hover .el-input__wrapper) { border-color: #c9c5bc; }

.search-form :deep(.el-input__wrapper.is-focus),
.search-form :deep(.el-select.is-focus .el-input__wrapper) {
  border-color: var(--accent);
  box-shadow: 0 0 0 1px var(--accent-light);
}

.btn-search {
  background: linear-gradient(135deg, var(--sidebar-bg), #333333) !important;
  border-color: var(--sidebar-bg) !important;
  border-radius: var(--radius-sm);
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-search:hover {
  background: linear-gradient(135deg, #2a2a2a, #404040) !important;
  border-color: #2a2a2a !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
}

.btn-reset {
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.btn-reset:hover {
  border-color: var(--accent);
  color: var(--accent-hover);
  background: var(--accent-soft);
}

.btn-danger-outline {
  border: 1px solid #f0c0c0 !important;
  color: #d45353 !important;
  background: #fff !important;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.btn-danger-outline:hover:not(:disabled) {
  background: #fef5f5 !important;
  border-color: #e3a0a0 !important;
}

.selected-hint { font-size: 13px; color: var(--text-muted); margin-left: 4px; }

.price-cell { font-weight: 600; color: #d45353; }

.category-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 500;
  background: rgba(212, 175, 55, 0.1);
  color: #a8894a;
}

.table-panel :deep(.el-table) { --el-table-border-color: var(--border); }
.table-panel :deep(.el-table__body-wrapper) { border: none; }
.table-panel :deep(.el-table th) { border-bottom: 2px solid var(--border) !important; }
.table-panel :deep(.el-table .el-table__row) { transition: background 0.15s ease; }

.table-panel :deep(.el-table .el-table__row:hover > td) {
  background: #fbfaf7 !important;
  cursor: pointer;
}

.table-panel :deep(.el-table .el-table__row--striped td) { background: #fafaf7 !important; }

.row-btn { font-weight: 500; padding: 0 6px; }

.table-footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px 24px;
  border-top: 1px solid var(--border-light);
}

.user-dialog :deep(.el-dialog) { border-radius: var(--radius-lg); }
.user-dialog :deep(.el-dialog__header) { padding: 22px 28px 0; }
.user-dialog :deep(.el-dialog__title) { font-size: 17px; font-weight: 700; color: var(--text-primary); }
.user-dialog :deep(.el-dialog__body) { padding: 20px 28px 8px; }
.user-dialog :deep(.el-dialog__footer) { padding: 12px 28px 22px; }

.dialog-form :deep(.el-input__wrapper) {
  background: #fafaf8;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  box-shadow: none;
}

.dialog-form :deep(.el-input__wrapper:hover) { border-color: #c9c5bc; }

.dialog-form :deep(.el-input__wrapper.is-focus) {
  border-color: var(--accent);
  box-shadow: 0 0 0 1px var(--accent-light);
}

.dialog-form :deep(.el-select .el-input__wrapper) {
  background: #fafaf8;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  box-shadow: none;
}

.dialog-form :deep(.el-input-number) { width: 100%; }
.dialog-form :deep(.el-input-number .el-input__wrapper) {
  background: #fafaf8;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  box-shadow: none;
}

.btn-cancel {
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  border-color: var(--accent);
  color: var(--accent-hover);
  background: var(--accent-soft);
}

.btn-confirm {
  background: linear-gradient(135deg, var(--sidebar-bg), #333333) !important;
  border-color: var(--sidebar-bg) !important;
  border-radius: var(--radius-sm);
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-confirm:hover {
  background: linear-gradient(135deg, #2a2a2a, #404040) !important;
  border-color: #2a2a2a !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
}
</style>
