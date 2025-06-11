import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
// @ts-ignore
import * as api from '@/api';
// @ts-ignore
import { useAppStore } from '@/stores';

vi.mock('@/api');

describe('useAppStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('loads workers', async () => {
    api.getWorkers.mockResolvedValue([{ id: 1, name: 'Alice' }]);
    const store = useAppStore();
    await store.loadWorkers();
    expect(store.workers).toEqual([{ id: 1, name: 'Alice' }]);
  });

  it('adds a worker', async () => {
    api.createWorker.mockResolvedValue({});
    api.getWorkers.mockResolvedValue([{ id: 2, name: 'Bob' }]);
    const store = useAppStore();
    await store.addWorker('Bob');
    expect(store.workers).toEqual([{ id: 2, name: 'Bob' }]);
  });

  it('loads shifts', async () => {
    api.getShifts.mockResolvedValue([{ id: 1, workerId: '1', start: '', end: '' }]);
    const store = useAppStore();
    await store.loadShifts();
    expect(store.shifts).toEqual([{ id: 1, workerId: '1', start: '', end: '' }]);
  });

  it('loads timezone', async () => {
    api.getTimezone.mockResolvedValue({ timezone: 'UTC' });
    const store = useAppStore();
    await store.loadTimezone();
    expect(store.timezone).toBe('UTC');
  });
});
