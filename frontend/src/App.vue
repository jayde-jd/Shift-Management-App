<template>
  <div>
    <Navbar />

    <main class="p-4 max-w-6xl mx-auto space-y-6">
      <TimezonePicker id="timezone" />
      <div class="grid md:grid-cols-2 gap-4">
        <WorkerManager id="workers" />
        <ShiftManager id="shifts" />
      </div>
    </main>
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue';
import TimezonePicker from './components/TimezonePicker.vue';
import WorkerManager from './components/WorkerManager.vue';
import ShiftManager from './components/ShiftManager.vue';
</script>
