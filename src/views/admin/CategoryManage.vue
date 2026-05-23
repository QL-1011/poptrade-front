<template>
  <div>
    <!-- Search -->
    <div class="panel search-panel">
      <el-form :model="query" inline @submit.prevent="fetchPage" class="search-form">
        <el-form-item label="分类名称">
          <el-input v-model="query.categoryName" placeholder="请输入..." clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchPage" class="btn-search">查询</el-button>
          <el-button @click="resetQuery" class="btn-reset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- Actions -->
    <div class="panel action-panel">
      <el-button type="primary" :icon="Plus" @click="openDialog()" aria-label="新增分类">新增分类</el-button>
      <el-button :icon="Delete" :disabled="selected.length === 0" @click="handleBatchDelete" class="btn-danger-outline" aria-label="批量删除分类">
        批量删除
      </el-button>
      <span v-if="selected.length" class="selected-hint">已选 {{ selected.length }} 项</span>
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
          <el-empty description="暂无分类数据" :image-size="80" />
        </template>
        <el-table-column type="selection" width="48" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="categoryName" label="分类名称" min-width="200" />
        <el-table-column prop="sort" label="排序" width="100" align="center" />
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">{{ row.createTime?.replace('T', ' ') }}</template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" :icon="Edit" @click="openDialog(row)" class="row-btn">编辑</el-button>
            <el-popconfirm title="确定删除该分类？" @confirm="handleDelete(row.id)" confirm-button-text="删除" cancel-button-text="取消">
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
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="460px" @close="resetForm" class="user-dialog">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" class="dialog-form">
        <el-form-item label="分类名称" prop="categoryName">
          <el-input v-model="form.categoryName" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="9999" style="width: 100%" />
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
import { getCategoryPage, saveCategory, updateCategory, deleteCategory, deleteCategoryBatch } from '../../api/category';

const loading = ref(false);
const selected = ref([]);
const dialogVisible = ref(false);
const submitLoading = ref(false);
const formRef = ref(null);
const isEdit = computed(() => !!form.id);

const dialogTitle = computed(() => isEdit.value ? '编辑分类' : '新增分类');

const query = reactive({ pageNum: 1, pageSize: 10, categoryName: '' });
const tableData = reactive({ total: 0, list: [], pages: 0 });

const form = reactive({ id: null, categoryName: '', sort: 0 });
const rules = {
  categoryName: [{ required: true, message: '分类名称不能为空', trigger: 'blur' }],
  sort: [{ required: true, message: '排序不能为空', trigger: 'blur' }],
};

onMounted(() => fetchPage());

async function fetchPage() {
  loading.value = true;
  try {
    const params = {};
    Object.keys(query).forEach(k => { if (query[k] !== '' && query[k] !== null) params[k] = query[k]; });
    const res = await getCategoryPage(params);
    Object.assign(tableData, res.data);
  } finally {
    loading.value = false;
  }
}

function resetQuery() {
  Object.assign(query, { pageNum: 1, pageSize: 10, categoryName: '' });
  fetchPage();
}

function openDialog(row = null) {
  if (row) {
    Object.assign(form, { id: row.id, categoryName: row.categoryName, sort: row.sort });
  }
  dialogVisible.value = true;
}

function resetForm() {
  formRef.value?.resetFields();
  Object.assign(form, { id: null, categoryName: '', sort: 0 });
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  submitLoading.value = true;
  try {
    if (isEdit.value) {
      await updateCategory({ ...form });
      ElMessage.success('修改成功');
    } else {
      await saveCategory({ categoryName: form.categoryName, sort: form.sort });
      ElMessage.success('新增成功');
    }
    dialogVisible.value = false;
    fetchPage();
  } finally {
    submitLoading.value = false;
  }
}

async function handleDelete(id) {
  await deleteCategory(id);
  ElMessage.success('删除成功');
  fetchPage();
}

async function handleBatchDelete() {
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${selected.value.length} 个分类？`, '提示', { type: 'warning' });
  } catch {
    return;
  }
  await deleteCategoryBatch(selected.value);
  ElMessage.success('批量删除成功');
  selected.value = [];
  fetchPage();
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

.table-panel { padding: 0; overflow: hidden; }
.table-scroll { overflow-x: auto; }

.search-form :deep(.el-form-item) { margin-bottom: 16px; }

.search-form :deep(.el-input__wrapper) {
  background: #fafaf8;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  box-shadow: none;
  width: 200px;
}

.search-form :deep(.el-input__wrapper:hover) { border-color: #c9c5bc; }

.search-form :deep(.el-input__wrapper.is-focus) {
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
