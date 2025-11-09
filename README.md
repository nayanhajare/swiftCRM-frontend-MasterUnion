# SwiftCRM Frontend

A modern, responsive React application for the SwiftCRM system with beautiful UI, real-time updates, and comprehensive lead management features.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Routing](#routing)
- [State Management](#state-management)
- [Components](#components)
- [Styling](#styling)
- [Real-time Features](#real-time-features)
- [Deployment](#deployment)

## 🚀 Features

- **Modern UI/UX** - Beautiful, responsive design with animations
- **Real-time Updates** - Socket.io integration for live updates
- **Dashboard Analytics** - Visual charts and performance metrics
- **Lead Management** - Complete CRUD operations with filtering and search
- **Activity Timeline** - Track all lead interactions
- **Role-Based UI** - Different views based on user role
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark/Light Theme** - Beautiful gradient background with glass morphism
- **Animations** - Smooth transitions and interactions using Framer Motion

## 🛠 Tech Stack

- **Framework**: React 18
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **Styling**: TailwindCSS
- **Animations**: Framer Motion
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Real-time**: Socket.io Client
- **Notifications**: React Toastify
- **Date Handling**: date-fns
- **Build Tool**: Vite

## 📁 Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable components
│   │   ├── Layout.jsx     # Main layout with navigation
│   │   └── LeadModal.jsx    # Lead create/edit modal
│   ├── pages/              # Page components
│   │   ├── Login.jsx       # Login page
│   │   ├── Register.jsx    # Registration page
│   │   ├── Dashboard.jsx   # Dashboard with analytics
│   │   ├── Leads.jsx       # Leads list page
│   │   ├── LeadDetail.jsx  # Lead detail page
│   │   └── Profile.jsx     # User profile page
│   ├── store/              # Redux store
│   │   ├── slices/         # Redux slices
│   │   │   ├── authSlice.js
│   │   │   ├── leadSlice.js
│   │   │   ├── activitySlice.js
│   │   │   └── dashboardSlice.js
│   │   └── store.js        # Store configuration
│   ├── utils/              # Utility functions
│   │   ├── api.js          # Axios instance
│   │   ├── socket.js       # Socket.io client
│   │   └── PrivateRoute.jsx # Protected route wrapper
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── package.json
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # TailwindCSS configuration
└── .env                    # Environment variables
```

## 🔧 Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Steps

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables** (optional)
```bash
# Create .env file
VITE_API_URL=http://localhost:5000/api
```

4. **Start development server**
```bash
npm run dev
```

The application will start on `http://localhost:3000` (or next available port)

## 🔐 Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### Environment Variable Descriptions

- **VITE_API_URL**: Backend API base URL (default: `http://localhost:5000/api`)

**Note**: In Vite, environment variables must be prefixed with `VITE_` to be accessible in the browser.

## 🗺 Routing

### Public Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/login` | `Login` | User login page |
| `/register` | `Register` | User registration page |

### Protected Routes

All routes below require authentication. Unauthenticated users are redirected to `/login`.

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `Dashboard` | Redirects to `/dashboard` |
| `/dashboard` | `Dashboard` | Main dashboard with analytics |
| `/leads` | `Leads` | Leads list with filtering |
| `/leads/:id` | `LeadDetail` | Individual lead detail page |
| `/profile` | `Profile` | User profile page |

### Route Structure

```jsx
<Routes>
  {/* Public Routes */}
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  
  {/* Protected Routes */}
  <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
    <Route index element={<Navigate to="/dashboard" />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="leads" element={<Leads />} />
    <Route path="leads/:id" element={<LeadDetail />} />
    <Route path="profile" element={<Profile />} />
  </Route>
</Routes>
```

## 🗄 State Management

### Redux Store Structure

```javascript
{
  auth: {
    user: null,
    token: null,
    isAuthenticated: false,
    users: [], // For Admin/Manager
    isLoading: false,
    error: null
  },
  leads: {
    leads: [],
    currentLead: null,
    pagination: {},
    isLoading: false,
    error: null
  },
  activities: {
    activities: [],
    isLoading: false,
    error: null
  },
  dashboard: {
    stats: null,
    performance: [],
    isLoading: false,
    error: null
  }
}
```

### Redux Slices

#### authSlice.js
- `login` - User login
- `register` - User registration
- `logout` - User logout
- `getCurrentUser` - Get authenticated user
- `getUsers` - Get all users (Admin/Manager)

#### leadSlice.js
- `fetchLeads` - Get leads with filters
- `fetchLead` - Get single lead
- `createLead` - Create new lead
- `updateLead` - Update lead
- `deleteLead` - Delete lead
- `updateLeadInList` - Update lead in list (for real-time)

#### activitySlice.js
- `fetchActivities` - Get activities
- `createActivity` - Create activity
- `updateActivity` - Update activity
- `deleteActivity` - Delete activity

#### dashboardSlice.js
- `fetchDashboardStats` - Get dashboard statistics
- `fetchPerformance` - Get performance metrics (Admin/Manager)

## 🧩 Components

### Layout Component

Main layout wrapper with:
- Navigation bar
- User profile display
- Role badges
- Logout button
- Page transitions

### LeadModal Component

Modal for creating/editing leads with:
- Form validation
- User assignment (Admin/Manager)
- Status selection
- Source selection

### Page Components

#### Dashboard
- Statistics cards (Total Leads, Total Value, Conversion Rate, Recent Activities)
- Charts:
  - Leads by Status (Pie Chart)
  - Monthly Trend (Line Chart)
  - Leads by Source (Bar Chart)
- Team Performance Table (Admin/Manager)
- Recent Activities List

#### Leads
- Leads table with sorting
- Search functionality
- Status filtering
- Pagination
- Create/Edit/Delete actions
- Real-time updates

#### LeadDetail
- Lead information display
- Activity timeline
- Create activities
- Edit lead information
- Real-time updates

#### Profile
- User information
- Update profile
- Change password (if implemented)

## 🎨 Styling

### TailwindCSS Configuration

The project uses TailwindCSS with custom configuration:
- Custom color palette
- Extended spacing
- Custom animations
- Glass morphism effects

### Global Styles

Located in `src/index.css`:
- Custom animations (fadeIn, slideIn, pulse)
- Glass morphism classes
- Gradient text
- Card hover effects
- Loading spinner

### Color Scheme

- **Primary Gradient**: Blue to Purple (`#667eea` → `#764ba2`)
- **Background**: Gradient (`#667eea` → `#764ba2`)
- **Cards**: White with glass morphism
- **Status Colors**:
  - New: Blue
  - Contacted: Yellow
  - Qualified: Green
  - Proposal: Orange
  - Negotiation: Orange
  - Won: Green
  - Lost: Red

### Animations

Using Framer Motion for:
- Page transitions
- Card animations
- Button interactions
- List item animations
- Modal animations

## 🔌 Real-time Features

### Socket.io Integration

The frontend connects to the backend Socket.io server for real-time updates.

#### Connection

```javascript
import { connectSocket } from './utils/socket'

// Connect when authenticated
const socket = connectSocket(token)
```

#### Event Listeners

**Lead Events:**
- `lead:created` - New lead created
- `lead:updated` - Lead updated
- `lead:deleted` - Lead deleted

**Activity Events:**
- `activity:created` - New activity created
- `activity:updated` - Activity updated
- `activity:deleted` - Activity deleted

#### Implementation Example

```javascript
useEffect(() => {
  const socket = getSocket()
  if (socket) {
    socket.on('lead:created', () => {
      dispatch(fetchLeads(filters))
    })
    
    return () => {
      socket.off('lead:created')
    }
  }
}, [dispatch, filters])
```

## 📱 Responsive Design

The application is fully responsive:
- **Desktop**: Full layout with sidebar navigation
- **Tablet**: Optimized layout
- **Mobile**: Stacked layout with mobile-friendly navigation

### Breakpoints

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## 🧪 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Development Server

The development server runs on `http://localhost:3000` by default (or next available port).

Features:
- Hot Module Replacement (HMR)
- Fast refresh
- Source maps
- Error overlay

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Deployment Platforms

#### Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard:
   - `VITE_API_URL`: Your backend API URL

#### Netlify

1. Install Netlify CLI:
```bash
npm i -g netlify-cli
```

2. Deploy:
```bash
netlify deploy --prod
```

3. Set environment variables in Netlify dashboard

#### GitHub Pages

1. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Add to package.json:
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

3. Deploy:
```bash
npm run deploy
```

### Environment Variables in Production

Make sure to set `VITE_API_URL` to your production backend URL:

```env
VITE_API_URL=https://api.yourdomain.com/api
```

### Build Optimization

The production build includes:
- Code splitting
- Tree shaking
- Minification
- Asset optimization
- Source maps (optional)

## 📦 Dependencies

### Production Dependencies
- `react` - UI library
- `react-dom` - React DOM renderer
- `react-redux` - Redux React bindings
- `@reduxjs/toolkit` - Redux toolkit
- `react-router-dom` - Routing
- `axios` - HTTP client
- `socket.io-client` - Socket.io client
- `recharts` - Chart library
- `react-toastify` - Toast notifications
- `date-fns` - Date utilities
- `framer-motion` - Animation library

### Development Dependencies
- `@vitejs/plugin-react` - Vite React plugin
- `vite` - Build tool
- `tailwindcss` - CSS framework
- `autoprefixer` - CSS autoprefixer
- `postcss` - CSS processor

## 🎯 Features by Role

### Admin
- ✅ View all leads
- ✅ Create/Edit/Delete leads
- ✅ View team performance
- ✅ Assign leads to users
- ✅ View all users

### Manager
- ✅ View all leads
- ✅ Create/Edit/Delete leads
- ✅ View team performance
- ✅ Assign leads to users
- ✅ View all users

### Sales Executive
- ✅ View assigned and own leads
- ✅ Create/Edit leads
- ❌ Cannot delete leads
- ❌ Cannot view team performance
- ❌ Cannot view all leads

## 🔧 Configuration Files

### vite.config.js

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
```

### tailwind.config.js

Custom Tailwind configuration with:
- Content paths
- Theme extensions
- Custom colors
- Custom animations

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check the [main README](../README.md)
- Review backend API documentation

## 🎨 UI/UX Highlights

- **Glass Morphism**: Modern frosted glass effect on cards
- **Gradient Background**: Beautiful purple-blue gradient
- **Smooth Animations**: Framer Motion for fluid interactions
- **Responsive Charts**: Recharts with custom styling
- **Real-time Updates**: Instant UI updates via Socket.io
- **Toast Notifications**: User-friendly feedback
- **Loading States**: Spinner animations
- **Hover Effects**: Interactive elements

---

**Built with ❤️ using React and Vite**

