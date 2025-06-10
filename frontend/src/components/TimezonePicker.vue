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
import { getTimezone, updateTimezoneShifts } from '@/api';
import { ElNotification } from 'element-plus';
import { defineEmits } from 'vue';

const timezone = ref('');
const emit = defineEmits(['timezone-updated']);

onMounted(async () => {
  const data = await getTimezone();
  timezone.value = data.timezone;
});

const updateTimezone = async () => {
  try {
    const result = await updateTimezoneShifts(timezone.value);
    if (result && result.success) {
      ElNotification.success({ title: 'Success', message: 'Timezone and shifts updated' });
      emit('timezone-updated');
    } else if (result && result.error) {
      ElNotification.error({ title: 'Error', message: result.error });
    }
  } catch {
    ElNotification.error({ title: 'Error', message: 'Failed to update timezone and shifts' });
  }
};
</script>

