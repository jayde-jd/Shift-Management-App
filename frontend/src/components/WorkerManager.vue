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
import { storeToRefs } from 'pinia';
import { useAppStore } from '@/stores';

const store = useAppStore();
const {
  workers,
  isLoading
} = storeToRefs(store);

const newWorker = ref('');
const editingWorker = ref(null);
const editName = ref('');

const loadWorkers = () => store.loadWorkers();
onMounted(loadWorkers);

const addWorker = async () => {
  if (!newWorker.value.trim()) return;
  await store.addWorker(newWorker.value);
  newWorker.value = '';
};

const handleEdit = (row) => {
  editingWorker.value = row;
  editName.value = row.name;
};

const saveEdit = async () => {
  if (!editName.value.trim()) return;
  await store.updateWorker({ id: editingWorker.value.id, name: editName.value });
  editingWorker.value = null;
  editName.value = '';
};

const cancelEdit = () => {
  editingWorker.value = null;
  editName.value = '';
};

const handleDelete = async (row) => {
  await store.deleteWorker(row.id);
};
</script>

