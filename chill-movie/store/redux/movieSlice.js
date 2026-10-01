import { createSlice } from '@reduxjs/toolkit';

// Initial State : State awal berupa array kosong yang nantinya akan diisi dengan data API.
const initialState = [];

export const movieSlice = createSlice({
  name: 'movies',
  initialState,
  reducers: {
    // Reducer untuk Data API (Get Data)
    setMovies: (state, action) => {
      return action.payload;
    },
    setData: (state, action) => {
      return action.payload;
    },
    setApiData: (state, action) => {
      return action.payload;
    },
    // Reducer untuk Add Data
    addMovie: (state, action) => {
      state.unshift(action.payload);
    },
    addData: (state, action) => {
      state.unshift(action.payload);
    },
    // Reducer untuk Edit Data
    updateMovie: (state, action) => {
      const index = state.findIndex((item) => String(item.id) === String(action.payload.id));
      if (index !== -1) {
        state[index] = action.payload;
      }
    },
    editData: (state, action) => {
      const index = state.findIndex((item) => String(item.id) === String(action.payload.id));
      if (index !== -1) {
        state[index] = action.payload;
      }
    },
    // Reducer untuk Delete Data
    deleteMovie: (state, action) => {
      return state.filter((item) => String(item.id) !== String(action.payload));
    },
    deleteData: (state, action) => {
      return state.filter((item) => String(item.id) !== String(action.payload));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase('SET_MOVIES', (state, action) => action.payload)
      .addCase('SET_DATA', (state, action) => action.payload)
      .addCase('SET_API_DATA', (state, action) => action.payload)
      .addCase('ADD_MOVIE', (state, action) => {
        state.unshift(action.payload);
      })
      .addCase('ADD_DATA', (state, action) => {
        state.unshift(action.payload);
      })
      .addCase('UPDATE_MOVIE', (state, action) => {
        const index = state.findIndex((item) => String(item.id) === String(action.payload.id));
        if (index !== -1) state[index] = action.payload;
      })
      .addCase('EDIT_DATA', (state, action) => {
        const index = state.findIndex((item) => String(item.id) === String(action.payload.id));
        if (index !== -1) state[index] = action.payload;
      })
      .addCase('DELETE_MOVIE', (state, action) => {
        return state.filter((item) => String(item.id) !== String(action.payload));
      })
      .addCase('DELETE_DATA', (state, action) => {
        return state.filter((item) => String(item.id) !== String(action.payload));
      });
  },
});

// Export action creators
export const {
  setMovies,
  setData,
  setApiData,
  addMovie,
  addData,
  updateMovie,
  editData,
  deleteMovie,
  deleteData,
} = movieSlice.actions;

// Export reducer sebagai default
export default movieSlice.reducer;
