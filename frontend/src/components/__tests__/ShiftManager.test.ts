import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import ShiftManager from '../ShiftManager.vue';
import { createTestingPinia } from '@pinia/testing';

describe('ShiftManager.vue', () => {
  it('renders shift header', () => {
    const wrapper = mount(ShiftManager, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
      },
    });
    expect(wrapper.text()).toContain('Shifts');
  });
});
