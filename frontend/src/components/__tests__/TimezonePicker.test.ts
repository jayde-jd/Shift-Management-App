import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
// @ts-ignore
import TimezonePicker from '../TimezonePicker.vue';
import { createTestingPinia } from '@pinia/testing';

describe('TimezonePicker.vue', () => {
  it('renders timezone input', () => {
    const wrapper = mount(TimezonePicker, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
      },
    });
    expect(wrapper.find('#timezone-input').exists()).toBe(true);
  });
});
