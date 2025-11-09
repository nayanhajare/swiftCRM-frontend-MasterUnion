import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://swiftcrm-backend-masterunion.onrender.com/api'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return { Authorization: `Bearer ${token}` }
}

export const fetchLeads = createAsyncThunk(
  'leads/fetchLeads',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/leads`, {
        headers: getAuthHeaders(),
        params
      })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leads')
    }
  }
)

export const fetchLead = createAsyncThunk(
  'leads/fetchLead',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/leads/${id}`, {
        headers: getAuthHeaders()
      })
      return response.data.data.lead
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch lead')
    }
  }
)

export const createLead = createAsyncThunk(
  'leads/createLead',
  async (leadData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/leads`, leadData, {
        headers: getAuthHeaders()
      })
      return response.data.data.lead
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create lead')
    }
  }
)

export const updateLead = createAsyncThunk(
  'leads/updateLead',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/leads/${id}`, data, {
        headers: getAuthHeaders()
      })
      return response.data.data.lead
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update lead')
    }
  }
)

export const deleteLead = createAsyncThunk(
  'leads/deleteLead',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/leads/${id}`, {
        headers: getAuthHeaders()
      })
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete lead')
    }
  }
)

const initialState = {
  leads: [],
  currentLead: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  },
  isLoading: false,
  error: null,
}

const leadSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    clearCurrentLead: (state) => {
      state.currentLead = null
    },
    setLead: (state, action) => {
      state.currentLead = action.payload
    },
    updateLeadInList: (state, action) => {
      const index = state.leads.findIndex(lead => lead.id === action.payload.id)
      if (index !== -1) {
        state.leads[index] = action.payload
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch leads
      .addCase(fetchLeads.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.isLoading = false
        state.leads = action.payload.leads
        state.pagination = action.payload.pagination
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Fetch lead
      .addCase(fetchLead.fulfilled, (state, action) => {
        state.currentLead = action.payload
      })
      // Create lead
      .addCase(createLead.fulfilled, (state, action) => {
        state.leads.unshift(action.payload)
      })
      // Update lead
      .addCase(updateLead.fulfilled, (state, action) => {
        const index = state.leads.findIndex(lead => lead.id === action.payload.id)
        if (index !== -1) {
          state.leads[index] = action.payload
        }
        if (state.currentLead && state.currentLead.id === action.payload.id) {
          state.currentLead = action.payload
        }
      })
      // Delete lead
      .addCase(deleteLead.fulfilled, (state, action) => {
        state.leads = state.leads.filter(lead => lead.id !== action.payload)
        if (state.currentLead && state.currentLead.id === action.payload) {
          state.currentLead = null
        }
      })
  },
})

export const { clearCurrentLead, setLead, updateLeadInList } = leadSlice.actions
export default leadSlice.reducer


