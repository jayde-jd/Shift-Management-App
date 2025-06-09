<template>
  <el-card>
    <template #header>
      <span>Workers</span>
    </template>
    <el-input
      v-model="newWorker"
      placeholder="Add new worker"
      @keyup.enter="addWorker"
      clearable
      class="mb-3"
    />
    <el-table :data="workers" style="width: 100%">
      <el-table-column prop="name" label="Name" />
    </el-table>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getWorkers, createWorker } from '@/api';
import { ElNotification, ElLoading } from 'element-plus';

const workers = ref([]);
const newWorker = ref('');

const loadWorkers = async () => {
  const loader = ElLoading.service({ fullscreen: true });
  try {
    workers.value = await getWorkers();
  } catch (e) {
    ElNotification.error({ title: 'Error', message: 'Failed to load workers.' });
  } finally {
    loader.close();
  }
};

onMounted(loadWorkers);

const addWorker = async () => {
  if (!newWorker.value.trim()) return;
  const loader = ElLoading.service({ fullscreen: true });
  try {
    await createWorker(newWorker.value);
    newWorker.value = '';
    await loadWorkers();
    ElNotification.success({ title: 'Success', message: 'Worker added' });
  } catch (e) {
    ElNotification.error({ title: 'Error', message: 'Failed to add worker' });
  } finally {
    loader.close();
  }
};
</script>

