import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return { Authorization: `Bearer ${token}` }
}

export const fetchActivities = createAsyncThunk(
  'activities/fetchActivities',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/activities`, {
        headers: getAuthHeaders(),
        params
      })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch activities')
    }
  }
)

export const createActivity = createAsyncThunk(
  'activities/createActivity',
  async (activityData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/activities`, activityData, {
        headers: getAuthHeaders()
      })
      return response.data.data.activity
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create activity')
    }
  }
)

export const updateActivity = createAsyncThunk(
  'activities/updateActivity',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/activities/${id}`, data, {
        headers: getAuthHeaders()
      })
      return response.data.data.activity
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update activity')
    }
  }
)

export const deleteActivity = createAsyncThunk(
  'activities/deleteActivity',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/activities/${id}`, {
        headers: getAuthHeaders()
      })
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete activity')
    }
  }
)

const initialState = {
  activities: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 50,
    pages: 0
  },
  isLoading: false,
  error: null,
}

const activitySlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {
    addActivity: (state, action) => {
      state.activities.unshift(action.payload)
    },
    updateActivityInList: (state, action) => {
      const index = state.activities.findIndex(activity => activity.id === action.payload.id)
      if (index !== -1) {
        state.activities[index] = action.payload
      }
    },
    removeActivity: (state, action) => {
      state.activities = state.activities.filter(activity => activity.id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch activities
      .addCase(fetchActivities.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.isLoading = false
        state.activities = action.payload.activities
        state.pagination = action.payload.pagination
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Create activity
      .addCase(createActivity.fulfilled, (state, action) => {
        state.activities.unshift(action.payload)
      })
      // Update activity
      .addCase(updateActivity.fulfilled, (state, action) => {
        const index = state.activities.findIndex(activity => activity.id === action.payload.id)
        if (index !== -1) {
          state.activities[index] = action.payload
        }
      })
      // Delete activity
      .addCase(deleteActivity.fulfilled, (state, action) => {
        state.activities = state.activities.filter(activity => activity.id !== action.payload)
      })
  },
})

export const { addActivity, updateActivityInList, removeActivity } = activitySlice.actions
export default activitySlice.reducer

