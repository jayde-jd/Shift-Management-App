import { defineStore } from 'pinia';
import {
  getShifts,
  createShift,
  getWorkers,
  createWorker,
  updateWorker,
  deleteWorker,
  getTimezone,
  updateTimezoneShifts,
  updateShift,
  deleteShift
 } from '@/api';

export const useAppStore = defineStore('appStore', {
  state: () => ({
    workers: [],
    shifts: [],
    timezone: '',
    isLoading: false,
  }),
  getters: {
    getWorkerById: state => id => state.workers.find(w => w.id === id),
    getWorkerByName: state => name => state.workers.find(w => w.name === name),
  },
  actions: {
    async loadWorkers() {
      this.isLoading = true;
      try {
        const workers = await getWorkers();
        this.workers = workers;
      } finally {
        this.isLoading = false;
      }
    },
    async addWorker(name) {
      this.isLoading = true;
      try {
        await createWorker(name);
        await this.loadWorkers();
      } finally {
        this.isLoading = false;
      }
    },
    async updateWorker({ id, name }) {
      this.isLoading = true;
      try {
        await updateWorker(id, name);
        await this.loadWorkers();
      } finally {
        this.isLoading = false;
      }
    },
    async deleteWorker(id) {
      this.isLoading = true;
      try {
        await deleteWorker(id);
        await this.loadWorkers();
      } finally {
        this.isLoading = false;
      }
    },
    async loadShifts() {
      this.isLoading = true;
      try {
        const shifts = await getShifts();
        this.shifts = shifts;
      } finally {
        this.isLoading = false;
      }
    },
    async addShift(shift) {
      this.isLoading = true;
      try {
        await createShift(shift);
        await this.loadShifts();
      } finally {
        this.isLoading = false;
      }
    },
    async updateShift({ id, shift }) {
      this.isLoading = true;
      try {
        await updateShift(id, shift);
        await this.loadShifts();
      } finally {
        this.isLoading = false;
      }
    },
    async deleteShift(id) {
      this.isLoading = true;
      try {
        await deleteShift(id);
        await this.loadShifts();
      } finally {
        this.isLoading = false;
      }
    },
    async loadTimezone() {
      const data = await getTimezone();
      this.timezone = data.timezone;
    },
    async updateTimezone(timezone) {
      const result = await updateTimezoneShifts(timezone);
      if (result && result.success) {
        this.timezone = timezone;
      }
      return result;
    },
  },
});
