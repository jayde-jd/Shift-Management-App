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
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useAppStore } from '@/stores';
import { ElNotification } from 'element-plus';

const { timezone } = storeToRefs(useAppStore());

const store = useAppStore();
const emit = defineEmits(['timezone-updated']);

onMounted(() => {
  store.loadTimezone();
});

const updateTimezone = async () => {
  try {
    const result = await store.updateTimezone(timezone.value);
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

