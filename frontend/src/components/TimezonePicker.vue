<template>
  <el-card class="mb-4">
    <template #header>
      <span>Preferred Timezone</span>
    </template>
    <el-input
      v-model="timezone"
      placeholder="Enter IANA timezone (e.g. America/New_York)"
      @blur="updateTimezone"
      clearable
    />
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getTimezone, setTimezone } from '@/api';
import { ElNotification } from 'element-plus';

const timezone = ref('');

onMounted(async () => {
  const data = await getTimezone();
  timezone.value = data.timezone;
});

const updateTimezone = async () => {
  try {
    await setTimezone(timezone.value);
    ElNotification.success({ title: 'Success', message: 'Timezone updated' });
  } catch {
    ElNotification.error({ title: 'Error', message: 'Failed to update timezone' });
  }
};
</script>

