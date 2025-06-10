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

    <el-table :data="shifts" class="mt-4" style="width: 100%">
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
import { getShifts, createShift, getWorkers, getTimezone, updateShift, deleteShift } from '@/api';
import { DateTime } from 'luxon';
import { ElNotification, ElLoading } from 'element-plus';
import WorkerManager from './WorkerManager.vue';

const shifts = ref([]);
const workers = ref([]);
const timezone = ref('');
const form = ref({ workerId: '', start: '', end: '' });
const dialogVisible = ref(false);
const editingShift = ref(null);
const editForm = ref({ workerId: '', start: '', end: '' });

const loadData = async () => {
  const loading = ElLoading.service({ fullscreen: true });
  try {
    const [shiftsData, workersData, tz] = await Promise.all([
      getShifts(),
      getWorkers(),
      getTimezone().then(d => d.timezone),
    ]);
    shifts.value = shiftsData.sort((a, b) => {
      if (a.workerId !== b.workerId) return a.workerId.localeCompare(b.workerId);
      if (a.start !== b.start) return new Date(a.start) - new Date(b.start);
      return new Date(a.end) - new Date(b.end);
    });
    workers.value = workersData;
    timezone.value = tz;
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
    const response = await createShift(form.value);

    if (response?.id) {
      ElNotification.success({ title: 'Success', message: 'Shift created successfully' });
    } else if (response?.errors?.length) {
      ElNotification.error({ title: 'Error', message: response.errors[0].message });
    }
    form.value = { workerId: '', start: '', end: '' }; // Reset form
    await loadData(); // Reload shifts
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
    const response = await updateShift(editingShift.value.id, editForm.value);
    if (response?.success) {
      ElNotification.success({ title: 'Success', message: 'Shift updated successfully' });
      editingShift.value = null;
      await loadData();
    } else if (response?.errors?.length) {
      ElNotification.error({ title: 'Error', message: response.errors[0].message });
    }
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
    await deleteShift(row.id);
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
