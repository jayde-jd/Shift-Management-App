require('dotenv').config({ path: '../.env' });

import axios from 'axios';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL: API_BASE
});
