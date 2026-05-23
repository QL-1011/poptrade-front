<template>
  <div>
    <!-- Search -->
    <div class="panel search-panel">
      <el-form :model="query" inline @submit.prevent="fetchPage" class="search-form">
        <el-form-item label="用户名">
          <el-input v-model="query.username" placeholder="请输入..." clearable />
        </el-form-item>
        <el-form-item label="真实姓名">
          <el-input v-model="query.realName" placeholder="请输入..." clearable />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="query.role" placeholder="全部" clearable>
            <el-option :value="0" label="管理员" />
            <el-option :value="1" label="普通顾客" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部" clearable>
            <el-option :value="1" label="启用" />
            <el-option :value="0" label="禁用" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchPage" class="btn-search">查询</el-button>
          <el-button @click="resetQuery" class="btn-reset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- Actions -->
    <div class="panel action-panel">
      <el-button type="primary" :icon="Plus" @click="openDialog()" aria-label="新增用户">新增用户</el-button>
      <el-button :icon="Delete" :disabled="selected.length === 0" @click="handleBatchDelete" class="btn-danger-outline" aria-label="批量删除用户">
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
          <el-empty description="暂无用户数据" :image-size="80" />
        </template>
        <el-table-column type="selection" width="48" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" min-width="130" />
        <el-table-column prop="realName" label="真实姓名" min-width="130">
          <template #default="{ row }">{{ row.realName || '—' }}</template>
        </el-table-column>
        <el-table-column prop="role" label="角色" width="110">
          <template #default="{ row }">
            <span class="role-tag" :class="row.role === 0 ? 'role-admin' : 'role-customer'">
              {{ row.role === 0 ? '管理员' : '顾客' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch :model-value="row.status === 1" @change="(val) => handleToggleStatus(row, val)" :aria-label="`切换${row.username}状态`" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">{{ row.createTime?.replace('T', ' ') }}</template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" :icon="Edit" @click="openDialog(row)" class="row-btn">编辑</el-button>
            <el-popconfirm title="确定删除该用户？" @confirm="handleDelete(row.id)" confirm-button-text="删除" cancel-button-text="取消">
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
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="480px" @close="resetForm" class="user-dialog">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" class="dialog-form">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" :disabled="!!form.id" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" :prop="form.id ? null : 'password'">
          <el-input v-model="form.password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="真实姓名">
          <el-input v-model="form.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" style="width: 100%">
            <el-option :value="0" label="管理员" />
            <el-option :value="1" label="普通顾客" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
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
import { getUserPage, saveUser, updateUser, deleteUser, deleteUserBatch, updateUserStatus } from '../../api/user';

const loading = ref(false);
const selected = ref([]);
const dialogVisible = ref(false);
const submitLoading = ref(false);
const formRef = ref(null);
const isEdit = computed(() => !!form.id);

const dialogTitle = computed(() => isEdit.value ? '编辑用户' : '新增用户');

const query = reactive({ pageNum: 1, pageSize: 10, username: '', realName: '', status: null, role: null });
const tableData = reactive({ total: 0, list: [], pages: 0 });

const form = reactive({ id: null, username: '', password: '', realName: '', role: 1, status: 1 });
const rules = {
  username: [{ required: true, message: '用户名不能为空', trigger: 'blur' }],
  password: [{ required: true, message: '密码不能为空', trigger: 'blur' }],
};

onMounted(() => fetchPage());

async function fetchPage() {
  loading.value = true;
  try {
    const params = {};
    Object.keys(query).forEach(k => { if (query[k] !== '' && query[k] !== null) params[k] = query[k]; });
    const res = await getUserPage(params);
    Object.assign(tableData, res.data);
  } finally {
    loading.value = false;
  }
}

function resetQuery() {
  Object.assign(query, { pageNum: 1, pageSize: 10, username: '', realName: '', status: null, role: null });
  fetchPage();
}

function openDialog(row = null) {
  if (row) {
    Object.assign(form, { id: row.id, username: row.username, password: '', realName: row.realName || '', role: row.role, status: row.status });
  }
  dialogVisible.value = true;
}

function resetForm() {
  formRef.value?.resetFields();
  Object.assign(form, { id: null, username: '', password: '', realName: '', role: 1, status: 1 });
}

async function handleSubmit() {
  const fields = isEdit.value ? ['username'] : ['username', 'password'];
  const valid = await formRef.value.validateField(fields).catch(() => false);
  if (valid === false) return;

  submitLoading.value = true;
  try {
    if (isEdit.value) {
      await updateUser({ ...form });
      ElMessage.success('修改成功');
    } else {
      await saveUser({ ...form });
      ElMessage.success('新增成功');
    }
    dialogVisible.value = false;
    fetchPage();
  } finally {
    submitLoading.value = false;
  }
}

async function handleDelete(id) {
  await deleteUser(id);
  ElMessage.success('删除成功');
  fetchPage();
}

async function handleBatchDelete() {
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${selected.value.length} 个用户？`, '提示', { type: 'warning' });
  } catch {
    return;
  }
  await deleteUserBatch(selected.value);
  ElMessage.success('批量删除成功');
  selected.value = [];
  fetchPage();
}

async function handleToggleStatus(row, val) {
  await updateUserStatus(row.id, val ? 1 : 0);
  row.status = val ? 1 : 0;
  ElMessage.success(row.status === 1 ? '已启用' : '已禁用');
}
</script>

<style scoped>
/* ---- Panels ---- */
.panel {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  margin-bottom: 16px;
  box-shadow: var(--shadow-sm);
  border-top: 2px solid var(--accent-soft);
}

.search-panel {
  padding: 20px 24px 4px;
}

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

.table-panel {
  padding: 0;
  overflow: hidden;
}

.table-scroll {
  overflow-x: auto;
}

/* ---- Search form ---- */
.search-form :deep(.el-form-item) {
  margin-bottom: 16px;
}

.search-form :deep(.el-input__wrapper),
.search-form :deep(.el-select .el-input__wrapper) {
  background: #fafaf8;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  box-shadow: none;
  width: 148px;
}

.search-form :deep(.el-input__wrapper:hover),
.search-form :deep(.el-select:hover .el-input__wrapper) {
  border-color: #c9c5bc;
}

.search-form :deep(.el-input__wrapper.is-focus),
.search-form :deep(.el-select.is-focus .el-input__wrapper) {
  border-color: var(--accent);
  box-shadow: 0 0 0 1px var(--accent-light);
}

/* ---- Buttons ---- */
.btn-search {
  background: linear-gradient(135deg, var(--sidebar-bg), #333333) !important;
  border-color: var(--sidebar-bg) !important;
  border-radius: var(--radius-sm);
  font-weight: 500;
  letter-spacing: 0.5px;
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

.selected-hint {
  font-size: 13px;
  color: var(--text-muted);
  margin-left: 4px;
}

/* ---- Role tags ---- */
.role-tag {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.role-admin {
  background: rgba(201, 169, 110, 0.15);
  color: #a8894a;
}

.role-customer {
  background: #f2f3f5;
  color: #787f8a;
}

/* ---- Table ---- */
.table-panel :deep(.el-table) {
  --el-table-border-color: var(--border);
}

.table-panel :deep(.el-table__body-wrapper) {
  border: none;
}

.table-panel :deep(.el-table th) {
  border-bottom: 2px solid var(--border) !important;
}

.table-panel :deep(.el-table .el-table__row) {
  transition: background 0.15s ease;
}

.table-panel :deep(.el-table .el-table__row:hover > td) {
  background: #fbfaf7 !important;
  cursor: pointer;
}

.table-panel :deep(.el-table .el-table__row--striped td) {
  background: #fafaf7 !important;
}

.row-btn {
  font-weight: 500;
  padding: 0 6px;
}

/* ---- Pagination ---- */
.table-footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px 24px;
  border-top: 1px solid var(--border-light);
}

/* ---- Dialog ---- */
.user-dialog :deep(.el-dialog) {
  border-radius: var(--radius-lg);
}

.user-dialog :deep(.el-dialog__header) {
  padding: 22px 28px 0;
}

.user-dialog :deep(.el-dialog__title) {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
}

.user-dialog :deep(.el-dialog__body) {
  padding: 20px 28px 8px;
}

.user-dialog :deep(.el-dialog__footer) {
  padding: 12px 28px 22px;
}

.dialog-form :deep(.el-input__wrapper) {
  background: #fafaf8;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  box-shadow: none;
}

.dialog-form :deep(.el-input__wrapper:hover) {
  border-color: #c9c5bc;
}

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
