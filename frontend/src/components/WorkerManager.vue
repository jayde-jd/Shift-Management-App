<template>
  <el-card>
    <div class="worker-manager-add-row">
      <el-input
        v-model="newWorker"
        placeholder="Add new worker"
        @keyup.enter="addWorker"
        clearable
        class="worker-manager-input"
        :disabled="isLoading"
      />
      <el-button type="primary"
        @click="addWorker"
        :loading="isLoading"
        :disabled="isLoading">
        Add
      </el-button>
    </div>
    <el-table :data="workers"
      class="worker-manager-table"
      :loading="isLoading">
      <el-table-column prop="name" label="Name" />
      <el-table-column fixed="right" label="Actions" width="150">
        <template #default="scope">
          <template v-if="editingWorker && editingWorker.id === scope.row.id">
            <el-input v-model="editName"
              size="small"
              class="worker-manager-edit-input" />
            <el-button type="success"
              size="small"
              @click="saveEdit">
              Save
            </el-button>
            <el-button size="small"
              @click="cancelEdit">
              Cancel
            </el-button>
          </template>
          <template v-else>
            <el-button type="primary"
              size="small"
              @click="handleEdit(scope.row)">
              Edit
            </el-button>
            <el-button type="danger"
              size="small"
              @click="handleDelete(scope.row)">
              Delete
            </el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<style scoped>
.worker-manager-add-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 1rem;
}
.worker-manager-input {
  flex: 1;
}
.worker-manager-table {
  width: 100%;
  max-height: 200vh;
  overflow: auto;
}
.worker-manager-edit-input {
  width: 120px;
  margin-right: 8px;
}
</style>

<script setup>
import { ref, onMounted } from 'vue';
import { getWorkers, createWorker, updateWorker, deleteWorker } from '@/api';
import { ElNotification } from 'element-plus';

const workers = ref([]);
const newWorker = ref('');
const isLoading = ref(false);
const editingWorker = ref(null);
const editName = ref('');

const loadWorkers = async () => {
  isLoading.value = true;
  try {
    workers.value = await getWorkers();
  } catch (e) {
    ElNotification.error({ title: 'Error', message: 'Failed to load workers.' });
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadWorkers);

const addWorker = async () => {
  if (!newWorker.value.trim()) return;
  isLoading.value = true;
  try {
    await createWorker(newWorker.value);
    newWorker.value = '';
    await loadWorkers();
    ElNotification.success({ title: 'Success', message: 'Worker added' });
  } catch (e) {
    ElNotification.error({ title: 'Error', message: 'Failed to add worker' });
  } finally {
    isLoading.value = false;
  }
};

const handleEdit = (row) => {
  editingWorker.value = row;
  editName.value = row.name;
};

const saveEdit = async () => {
  if (!editName.value.trim()) return;
  isLoading.value = true;
  try {
    await updateWorker(editingWorker.value.id, editName.value);
    editingWorker.value = null;
    editName.value = '';
    await loadWorkers();
    ElNotification.success({ title: 'Success', message: 'Worker updated' });
  } catch (e) {
    ElNotification.error({ title: 'Error', message: 'Failed to update worker' });
  } finally {
    isLoading.value = false;
  }
};

const cancelEdit = () => {
  editingWorker.value = null;
  editName.value = '';
};

const handleDelete = async (row) => {
  isLoading.value = true;
  try {
    await deleteWorker(row.id);
    await loadWorkers();
    ElNotification.success({ title: 'Success', message: 'Worker deleted' });
  } catch (e) {
    ElNotification.error({ title: 'Error', message: 'Failed to delete worker' });
  } finally {
    isLoading.value = false;
  }
};
</script>

