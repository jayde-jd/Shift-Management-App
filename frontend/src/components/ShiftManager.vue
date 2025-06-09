<template>
  <el-card>
    <template #header>
      <span>Shifts</span>
    </template>

    <el-form :inline="true" @submit.prevent>
      <el-form-item label="Worker">
        <el-select v-model="form.workerId"
          placeholder="Select Worker"
          style="width: 200px">
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
        />
      </el-form-item>

      <el-form-item label="End">
        <el-date-picker
          v-model="form.end"
          type="datetime"
          placeholder="End Time"
          value-format="YYYY-MM-DDTHH:mm"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="create">Add Shift</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="shifts" class="mt-4" style="width: 100%">
      <el-table-column label="Worker" :formatter="getWorkerName" />
      <el-table-column label="Start Time" :formatter="row => format(row.start)" />
      <el-table-column label="End Time" :formatter="row => format(row.end)" />
      <el-table-column prop="duration" label="Duration (hrs)" />
    </el-table>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getShifts, createShift, getWorkers, getTimezone } from '@/api';
import { DateTime } from 'luxon';
import { ElNotification, ElLoading } from 'element-plus';

const shifts = ref([]);
const workers = ref([]);
const timezone = ref('');
const form = ref({ workerId: '', start: '', end: '' });

const loadData = async () => {
  const loading = ElLoading.service({ fullscreen: true });
  try {
    [shifts.value, workers.value, timezone.value] = await Promise.all([
      getShifts(),
      getWorkers(),
      getTimezone().then(d => d.timezone),
    ]);
  } catch (e) {
    ElNotification.error({ title: 'Error', message: 'Failed to load data' });
  } finally {
    loading.close();
  }
};

onMounted(loadData);

const create = async () => {
  const { workerId, start, end } = form.value;
  if (!workerId || !start || !end) {
    ElNotification.warning({ title: 'Warning', message: 'All fields are required' });
    return;
  }

  const loading = ElLoading.service({ fullscreen: true });
  try {
    await createShift(form.value);
    ElNotification.success({ title: 'Success', message: 'Shift created successfully' });
    form.value = { workerId: '', start: '', end: '' }; // Reset form
    await loadData(); // Reload shifts
  } catch (e) {
    ElNotification.error({ title: 'Error', message: e.message || 'Failed to create shift' });
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
</script>
