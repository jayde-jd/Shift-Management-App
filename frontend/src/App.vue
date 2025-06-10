<template>
  <div>
    <Navbar />

    <main class="p-4 max-w-6xl mx-auto space-y-6">
      <TimezonePicker @timezone-updated="handleTimezoneUpdated" />
      <div class="grid md:grid-cols-2 gap-4">
        <ShiftManager ref="shiftManagerRef" />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Navbar from './components/Navbar.vue';
import TimezonePicker from './components/TimezonePicker.vue';
import ShiftManager from './components/ShiftManager.vue';

const shiftManagerRef = ref(null);

const handleTimezoneUpdated = () => {
  if (shiftManagerRef.value && typeof shiftManagerRef.value.reload === 'function') {
    shiftManagerRef.value.reload();
  }
};
</script>
