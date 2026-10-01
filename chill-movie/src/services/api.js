import axios from 'axios';

// Base URL dari file .env (menghindari hardcoding)
const BASE_URL = import.meta.env.VITE_API_URL || 'https://6a9a16ff9a7ec1b817d20e12.mockapi.io/api/chillmovieapp';

// Buat instance Axios terpusat
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Logging & monitoring request
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} -> ${config.baseURL || ''}${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response Interceptor: Penanganan response & standarisasi error message
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response Success] Status: ${response.status} (${response.config.url})`);
    return response;
  },
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data ||
      error.message ||
      'Terjadi kesalahan saat menghubungi server MockAPI';
    console.warn(`[API Response Error] ${error.config?.url}:`, message);
    return Promise.reject(new Error(typeof message === 'string' ? message : JSON.stringify(message)));
  }
);

// Resource Endpoints
export const ENDPOINTS = {
  MOVIES: '/movies',
  SERIES: '/series',
};

// ==========================================
// GENERIC CRUD API FUNCTIONS
// ==========================================

export const getItems = async (resource = ENDPOINTS.MOVIES, params = {}) => {
  const response = await apiClient.get(resource, { params });
  return response.data;
};

export const getItemById = async (resource, id) => {
  const response = await apiClient.get(`${resource}/${id}`);
  return response.data;
};

export const createItem = async (resource, data) => {
  const response = await apiClient.post(resource, data);
  return response.data;
};

export const updateItem = async (resource, id, data) => {
  const response = await apiClient.put(`${resource}/${id}`, data);
  return response.data;
};

export const patchItem = async (resource, id, data) => {
  const response = await apiClient.patch(`${resource}/${id}`, data);
  return response.data;
};

export const deleteItem = async (resource, id) => {
  const response = await apiClient.delete(`${resource}/${id}`);
  return response.data;
};

// ==========================================
// MOVIE SPECIFIC CRUD FUNCTIONS
// ==========================================

export const getMovies = (params) => getItems(ENDPOINTS.MOVIES, params);
export const getMovieById = (id) => getItemById(ENDPOINTS.MOVIES, id);
export const createMovie = (movieData) => createItem(ENDPOINTS.MOVIES, movieData);
export const updateMovie = (id, movieData) => updateItem(ENDPOINTS.MOVIES, id, movieData);
export const deleteMovie = (id) => deleteItem(ENDPOINTS.MOVIES, id);

// ==========================================
// CRUD API FUNCTIONS (getData, addData, editData, deleteData)
// ==========================================
export const getData = (resource = ENDPOINTS.MOVIES, params = {}) => {
  if (typeof resource === 'object' && resource !== null && !resource.startsWith) {
    return getItems(ENDPOINTS.MOVIES, resource);
  }
  return getItems(resource, params);
};
export const addData = (data, resource = ENDPOINTS.MOVIES) => createItem(resource, data);
export const editData = (id, data, resource = ENDPOINTS.MOVIES) => updateItem(resource, id, data);
export const deleteData = (id, resource = ENDPOINTS.MOVIES) => deleteItem(resource, id);


// ==========================================
// SERIES SPECIFIC CRUD FUNCTIONS
// ==========================================

export const getSeries = (params) => getItems(ENDPOINTS.SERIES, params);
export const getSeriesById = (id) => getItemById(ENDPOINTS.SERIES, id);
export const createSeries = (seriesData) => createItem(ENDPOINTS.SERIES, seriesData);
export const updateSeries = (id, seriesData) => updateItem(ENDPOINTS.SERIES, id, seriesData);
export const deleteSeries = (id) => deleteItem(ENDPOINTS.SERIES, id);

// ==========================================
// HELPER: SYNC / SEED DATA KE MOCKAPI
// ==========================================

/**
 * Membantu mengunggah data awal secara otomatis ke MockAPI jika resource masih kosong
 */
export const seedInitialData = async (moviesSeed = [], seriesSeed = []) => {
  const results = { moviesAdded: 0, seriesAdded: 0, errors: [] };

  // Seed Movies
  try {
    for (const movie of moviesSeed) {
      // Hilangkan id lokal agar MockAPI membuat ID unik sendiri
      const { id, ...data } = movie;
      await createMovie(data);
      results.moviesAdded++;
    }
  } catch (err) {
    results.errors.push(`Movies: ${err.message}`);
  }

  // Seed Series
  try {
    for (const item of seriesSeed) {
      const { id, ...data } = item;
      await createSeries(data);
      results.seriesAdded++;
    }
  } catch (err) {
    results.errors.push(`Series: ${err.message}`);
  }

  return results;
};

export default apiClient;
