import { configureStore } from '@reduxjs/toolkit';
import movieReducer from './movieSlice.js';

// Daftarkan reducer yang dibuat ke dalam store
export const store = configureStore({
  reducer: {
    movies: movieReducer,
  },
});

export default store;
