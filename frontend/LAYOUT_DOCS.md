# FreelancerFlow - Main Layout Documentation

## 🎨 Layout Components Created

### 1. **AppLayout** (`src/layouts/AppLayout.jsx`)
Main application wrapper with sidebar and topbar.

### 2. **Sidebar** (`src/components/sidebar/Sidebar.jsx`)
- Fixed left sidebar (256px width)
- Logo and app name
- Navigation menu with icons
- Active state highlighting
- Logout button at bottom

**Menu Items:**
- Dashboard
- Projects
- Clients
- Time Tracking
- Invoices (with badge "3")
- Settings

### 3. **Topbar** (`src/components/topbar/Topbar.jsx`)
- Fixed top navigation bar
- Search bar
- Notifications dropdown (with unread indicator)
- User avatar dropdown menu

### 4. **SidebarItem** (`src/components/sidebar/SidebarItem.jsx`)
Reusable navigation item component with:
- Active state (indigo background)
- Hover effects
- Icon + label
- Optional badge support

### 5. **Card** (`src/components/ui/Card.jsx`)
Reusable card component with:
- Title, subtitle, icon
- Header actions
- Custom padding options
- Hover effects

## 📱 Dashboard Page

**Stats Cards:**
- Total Earnings: $24,580 (+12.5%)
- This Month: $4,240 (+8.2%)
- Hours Logged: 156h (-3.1%)
- Pending Invoices: 8 (+2)
- Active Projects: 12 (+3)

**Sections:**
- Earnings Overview (chart placeholder)
- Weekly Productivity (chart placeholder)
- Recent Invoices table
- Recent Time Logs table

## 🔐 Protected Routes

Created `ProtectedRoute.jsx` wrapper that:
- Checks authentication status
- Redirects to login if not authenticated
- Wraps protected pages

## 🚀 How to Test

### Option 1: Bypass Auth (Quick Test)
Open `src/routes/ProtectedRoute.jsx` and change line 7 to:
```jsx
const isAuthenticated = true; // Bypass auth for testing
```

### Option 2: Set Auth Token
In browser console:
```javascript
localStorage.setItem('authToken', 'test-token');
```
Then refresh the page.

### Option 3: Login Flow
1. Go to `/login`
2. After login, set token in LoginPage.jsx:
```jsx
localStorage.setItem('authToken', 'your-token');
navigate('/dashboard');
```

## 🗺️ Routes

- `/` → Redirects to `/dashboard`
- `/login` → Login page
- `/register` → Register page
- `/dashboard` → Main dashboard (protected)
- `/projects` → Projects page (placeholder)
- `/clients` → Clients page (placeholder)
- `/time` → Time tracking page (placeholder)
- `/invoices` → Invoices page (placeholder)
- `/settings` → Settings page (placeholder)

## 🎯 Next Steps

1. **Implement actual authentication** - Replace localStorage check with real auth
2. **Add chart libraries** - Install recharts or chart.js for visualizations
3. **Build out pages** - Create full Projects, Clients, Time, Invoices, Settings pages
4. **Connect to API** - Fetch real data from backend
5. **Add responsive mobile menu** - Hamburger menu for mobile devices

## 📦 Dependencies Installed

- `lucide-react` - Modern icon library

## 🎨 Design System

- **Primary Color**: Indigo (#6366f1)
- **Background**: Gray-50
- **Cards**: White with gray-200 border
- **Spacing**: Consistent 6 units (24px)
- **Shadows**: Soft, elevation-based
- **Transitions**: 200ms duration

All components follow the same design language as the Login/Register pages!
