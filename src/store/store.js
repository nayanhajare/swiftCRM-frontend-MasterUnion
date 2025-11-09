import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import leadReducer from './slices/leadSlice'
import activityReducer from './slices/activitySlice'
import dashboardReducer from './slices/dashboardSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    leads: leadReducer,
    activities: activityReducer,
    dashboard: dashboardReducer,
  },
})

