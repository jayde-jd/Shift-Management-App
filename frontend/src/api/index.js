const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const fetchJson = async (url, options) => {
  try {
    const res = await fetch(url, options);
    return await res.json();
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

export const getTimezone = async () => {
  try {
    return await fetchJson(`${API_BASE_URL}/timezone`);
  } catch (error) {
    throw error;
  }
};

export const setTimezone = async (timezone) => {
  try {
    return await fetchJson(`${API_BASE_URL}/timezone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timezone }),
    });
  } catch (error) {
    throw error;
  }
};

export const getWorkers = async () => {
  try {
    return await fetchJson(`${API_BASE_URL}/workers`);
  } catch (error) {
    throw error;
  }
};

export const createWorker = async (name) => {
  try {
    return await fetchJson(`${API_BASE_URL}/workers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
  } catch (error) {
    throw error;
  }
};

export const updateWorker = async (id, name) => {
  try {
    return await fetchJson(`${API_BASE_URL}/workers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
  } catch (error) {
    throw error;
  }
};

export const deleteWorker = async (id) => {
  try {
    return await fetchJson(`${API_BASE_URL}/workers/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    throw error;
  }
};

export const getShifts = async () => {
  try {
    return await fetchJson(`${API_BASE_URL}/shifts`);
  } catch (error) {
    throw error;
  }
};

export const createShift = async (shift) => {
  try {
    return await fetchJson(`${API_BASE_URL}/shifts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shift),
    });
  } catch (error) {
    throw error;
  }
};

export const updateShift = async (id, shift) => {
  try {
    return await fetchJson(`${API_BASE_URL}/shifts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shift),
    });
  } catch (error) {
    throw error;
  }
};

export const deleteShift = async (id) => {
  try {
    return await fetchJson(`${API_BASE_URL}/shifts/${id}`, {
      method: 'DELETE' });
  } catch (error) {
    throw error;
  }
};

export const updateTimezoneShifts = async (newTimezone) => {
  try {
    return await fetchJson(`${API_BASE_URL}/shifts/timezone`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newTimezone }),
    });
  } catch (error) {
    throw error;
  }
};
