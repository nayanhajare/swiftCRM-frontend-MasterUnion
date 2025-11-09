import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return { Authorization: `Bearer ${token}` }
}

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/stats`, {
        headers: getAuthHeaders()
      })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard stats')
    }
  }
)

export const fetchPerformance = createAsyncThunk(
  'dashboard/fetchPerformance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/performance`, {
        headers: getAuthHeaders()
      })
      return response.data.data.performance
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch performance')
    }
  }
)

const initialState = {
  stats: null,
  performance: [],
  isLoading: false,
  error: null,
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearStats: (state) => {
      state.stats = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false
        state.stats = action.payload
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Fetch performance
      .addCase(fetchPerformance.fulfilled, (state, action) => {
        state.performance = action.payload
      })
  },
})

export const { clearStats } = dashboardSlice.actions
export default dashboardSlice.reducer

