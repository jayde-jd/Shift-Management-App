import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import Navbar from '../Navbar.vue';

describe('Navbar.vue', () => {
  it('renders navbar brand', () => {
    const wrapper = mount(Navbar);
    expect(wrapper.text()).toContain('Shift Management System');
  });
});
