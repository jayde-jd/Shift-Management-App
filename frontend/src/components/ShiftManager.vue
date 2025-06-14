<template>
  <el-card>
    <template #header>
      <div class="shift-header">
        <span>Shifts</span>
        <el-button type="primary"
          @click="dialogVisible = true">
          Workers
        </el-button>
      </div>
    </template>

    <el-form :inline="true" @submit.prevent>
      <el-form-item label="Worker">
        <el-select v-model="form.workerId"
          placeholder="Select Worker"
          class="worker-select">
          <el-option
            v-for="w in workers"
            :key="w.id"
            :label="w.name"
            :value="w.name"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Start">
        <el-date-picker
          v-model="form.start"
          type="datetime"
          placeholder="Start Time"
          value-format="YYYY-MM-DDTHH:mm"
          :disabled-date="disableFutureDates"
          :show-now="false"
        />
      </el-form-item>

      <el-form-item label="End">
        <el-date-picker
          v-model="form.end"
          type="datetime"
          placeholder="End Time"
          value-format="YYYY-MM-DDTHH:mm"
          :disabled-date="disableFutureDates"
          :show-now="false"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary"
          @click="create">
          Add Shift
        </el-button>
      </el-form-item>
    </el-form>

    <el-table :data="shifts"
      class="mt-4"
      style="width: 100%; max-height: 500px; overflow: auto">
      <el-table-column
        label="Worker"
        :formatter="getWorkerName" />
      <el-table-column
        label="Start Time"
        >
        <template #default="scope">
          <template v-if="editingShift && editingShift.id === scope.row.id">
            <el-date-picker
              v-model="editForm.start"
              type="datetime"
              value-format="YYYY-MM-DDTHH:mm"
              style="width: 180px" />
          </template>
          <template v-else>
            {{ format(scope.row.start) }}
          </template>
        </template>
      </el-table-column>
      <el-table-column
        label="End Time"
        >
        <template #default="scope">
          <template v-if="editingShift && editingShift.id === scope.row.id">
            <el-date-picker
              v-model="editForm.end"
              type="datetime"
              value-format="YYYY-MM-DDTHH:mm"
              style="width: 180px" />
          </template>
          <template v-else>
            {{ format(scope.row.end) }}
          </template>
        </template>
      </el-table-column>
      <el-table-column
        prop="duration"
        label="Duration (hrs)" />
      <el-table-column
        label="Actions"
        width="180">
        <template #default="scope">
          <template v-if="editingShift && editingShift.id === scope.row.id">
            <el-select v-model="editForm.workerId"
              style="width: 120px; margin-right: 8px"
              v-show="false">
              <el-option v-for="w in workers" :key="w.id" :label="w.name" :value="w.name" />
            </el-select>
            <el-button type="success" size="small" @click="saveEdit">Save</el-button>
            <el-button size="small" @click="cancelEdit">Cancel</el-button>
          </template>
          <template v-else>
            <el-button type="primary" size="small" @click="startEdit(scope.row)">Edit</el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row)">Delete</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      title="Workers"
      :close-on-click-modal="false"
      @close="loadData"
      style="width: 700px; max-width: 90%">
      <WorkerManager />
    </el-dialog>
  </el-card>
</template>

<style scoped>
.shift-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.worker-select {
  width: 200px;
}
</style>

<script setup>
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useAppStore } from '@/stores';
import { DateTime } from 'luxon';
import { ElNotification, ElLoading } from 'element-plus';
import WorkerManager from './WorkerManager.vue';

const store = useAppStore();
const {
  shifts,
  workers,
  timezone,
} = storeToRefs(store);

const form = ref({ workerId: '', start: '', end: '' });
const dialogVisible = ref(false);
const editingShift = ref(null);
const editForm = ref({ workerId: '', start: '', end: '' });

const loadData = async () => {
  const loading = ElLoading.service({ fullscreen: true });
  try {
    await Promise.all([
      store.loadShifts(),
      store.loadWorkers(),
      store.loadTimezone(),
    ]);
    // Sort shifts by start, then end, and group by workerId
    const grouped = {};
    shifts.value
      .sort((a, b) => {
        if (a.workerId !== b.workerId) {
          return a.workerId.localeCompare(b.workerId);
        }
        if (a.start !== b.start) {
          return a.start.localeCompare(b.start);
        }
        return a.end.localeCompare(b.end);
      })
      .forEach(shift => {
        if (!grouped[shift.workerId]) grouped[shift.workerId] = [];
        grouped[shift.workerId].push(shift);
      });
    // Flatten grouped shifts back to array for display
    shifts.value = Object.values(grouped).flat();

    workers.value = [...workers.value].sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    ElNotification.error({ title: 'Error', message: 'Failed to load data' });
  } finally {
    loading.close();
  }
};

onMounted(loadData);

// Expose reload method for parent
const reload = loadData;

defineExpose({ reload });

const create = async () => {
  const { workerId, start, end } = form.value;
  if (!workerId || !start || !end) {
    ElNotification.warning({ title: 'Warning', message: 'All fields are required' });
    return;
  }
  const loading = ElLoading.service({ fullscreen: true });
  try {
    await store.addShift(form.value);
    ElNotification.success({ title: 'Success', message: 'Shift created successfully' });
    form.value = { workerId: '', start: '', end: '' };
    await loadData();
  } catch (e) {
    ElNotification.error({ title: 'Error', message: e.message || 'Failed to create shift' });
  } finally {
    loading.close();
  }
};

const startEdit = (row) => {
  editingShift.value = row;
  editForm.value = { workerId: row.workerId, start: row.start, end: row.end };
};

const saveEdit = async () => {
  if (!editForm.value.workerId || !editForm.value.start || !editForm.value.end) {
    ElNotification.warning({ title: 'Warning', message: 'All fields are required' });
    return;
  }
  const loading = ElLoading.service({ fullscreen: true });
  try {
    await store.updateShift({ id: editingShift.value.id, shift: editForm.value });
    ElNotification.success({ title: 'Success', message: 'Shift updated successfully' });
    editingShift.value = null;
    await loadData();
  } catch (e) {
    ElNotification.error({ title: 'Error', message: e.message || 'Failed to update shift' });
  } finally {
    loading.close();
  }
};

const cancelEdit = () => {
  editingShift.value = null;
};

const handleDelete = async (row) => {
  const loading = ElLoading.service({ fullscreen: true });
  try {
    await store.deleteShift(row.id);
    ElNotification.success({ title: 'Success', message: 'Shift deleted successfully' });
    await loadData();
  } catch (e) {
    ElNotification.error({ title: 'Error', message: e.message || 'Failed to delete shift' });
  } finally {
    loading.close();
  }
};

const getWorkerName = (row) => {
  const worker = workers.value.find(w => w.name === row.workerId);
  return worker?.name || 'Unknown';
};

const format = (iso) =>
  DateTime.fromISO(iso).setZone(timezone.value).toLocaleString(DateTime.DATETIME_MED);

const disableFutureDates = (date) => {
  const now = new Date();
  return date.getTime() > now.getTime();
};
</script>
