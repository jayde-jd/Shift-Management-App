import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import WorkerManager from '../WorkerManager.vue';
import { createTestingPinia } from '@pinia/testing';

describe('WorkerManager.vue', () => {
  it('renders input and add button', () => {
    const wrapper = mount(WorkerManager, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
      },
    });
    expect(wrapper.find('#new-worker-input').exists()).toBe(true);
    expect(wrapper.find('#add-worker-button').text().toLowerCase()).toContain('add');
  });
});
