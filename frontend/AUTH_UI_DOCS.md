# FreelancerFlow - Authentication UI Documentation

## 🎨 Design System

### Color Palette
- **Primary**: Indigo (`#6366f1`) - Main brand color for CTAs and important actions
- **Secondary**: Gray shades for text and backgrounds
- **Error**: Red (`#ef4444`) for validation errors
- **Success**: Green (`#10b981`) for success states

### Typography
- **Font Family**: Inter (fallback to system fonts)
- **Heading**: 2xl, bold (Login page heading)
- **Body**: sm/base, regular/medium

---

## 📁 Component Architecture

### 1. **Button Component** (`src/components/ui/Button.jsx`)

#### Props
```jsx
{
  children: React.Node,        // Button content
  variant: string,             // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size: string,                // 'sm' | 'md' | 'lg'
  type: string,                // 'button' | 'submit' | 'reset'
  disabled: boolean,           // Disabled state
  loading: boolean,            // Shows spinner when true
  fullWidth: boolean,          // Takes full container width
  onClick: function,           // Click handler
  className: string,           // Additional Tailwind classes
}
```

#### Variants
- **primary**: Indigo background with white text (main CTAs)
- **secondary**: Gray background (secondary actions)
- **outline**: Bordered with no fill (tertiary actions)
- **ghost**: No background, hover effect (inline actions)
- **danger**: Red background for destructive actions

#### Usage Example
```jsx
<Button variant="primary" size="lg" fullWidth loading={isLoading}>
  Sign In
</Button>
```

---

### 2. **Input Component** (`src/components/ui/Input.jsx`)

#### Props
```jsx
{
  label: string,               // Input label
  type: string,                // 'text' | 'email' | 'password' | etc.
  placeholder: string,         // Placeholder text
  value: string,               // Controlled value
  onChange: function,          // Change handler
  onBlur: function,            // Blur handler for validation
  error: string,               // Error message to display
  helperText: string,          // Helper text below input
  required: boolean,           // Shows asterisk on label
  disabled: boolean,           // Disabled state
  name: string,                // Input name attribute
  id: string,                  // Input id (defaults to name)
  showPasswordToggle: boolean, // Show/hide password toggle (for type="password")
  className: string,           // Additional wrapper classes
}
```

#### Features
- ✅ Error state with icon and message
- ✅ Password visibility toggle
- ✅ Focus ring on active state
- ✅ Helper text support
- ✅ Required field indicator (*)
- ✅ Disabled state styling

#### Usage Example
```jsx
<Input
  label="Email Address"
  type="email"
  name="email"
  value={email}
  onChange={handleChange}
  error={errors.email}
  required
  placeholder="you@example.com"
/>

<Input
  label="Password"
  type="password"
  name="password"
  value={password}
  onChange={handleChange}
  error={errors.password}
  showPasswordToggle
  required
/>
```

---

### 3. **LoginPage Component** (`src/pages/auth/LoginPage.jsx`)

#### Features
- ✅ Form validation (email format, password length)
- ✅ Real-time error clearing on input
- ✅ Loading state during submission
- ✅ Forgot password link
- ✅ Sign up redirect
- ✅ Social login buttons (Google, GitHub)
- ✅ Smooth animations (fade in, slide up)
- ✅ Responsive design
- ✅ Accessible form fields

#### Form Validation
```javascript
// Email validation
- Required field check
- Valid email format (regex: /\S+@\S+\.\S+/)

// Password validation
- Required field check
- Minimum 6 characters
```

#### State Management
```jsx
const [formData, setFormData] = useState({
  email: '',
  password: '',
});
const [errors, setErrors] = useState({});
const [loading, setLoading] = useState(false);
```

---

## 🎭 Animations

### CSS Animations (in `global.css`)

#### fadeIn
```css
/* Fade in from top with subtle movement */
.animate-fadeIn {
  animation: fadeIn 0.6s ease-out;
}
```
- **Usage**: Logo and brand section
- **Effect**: Opacity 0 → 1, translateY -10px → 0

#### slideUp
```css
/* Slide up from bottom */
.animate-slideUp {
  animation: slideUp 0.5s ease-out;
}
```
- **Usage**: Login card
- **Effect**: Opacity 0 → 1, translateY 20px → 0

#### Button Loading Spinner
- Built-in SVG spinner with `animate-spin`
- Displays when `loading={true}`

---

## 🚀 Integration Guide

### Step 1: Install Dependencies
```bash
cd frontend
npm install react-router-dom
npm install -D tailwindcss postcss autoprefixer
```

### Step 2: Configure Tailwind
Already configured in:
- `tailwind.config.js`
- `postcss.config.js`
- `src/styles/global.css`

### Step 3: Add to Router
```jsx
// src/main.jsx or App.jsx
import LoginPage from './pages/auth/LoginPage';

<Route path="/login" element={<LoginPage />} />
```

### Step 4: Connect to API
Replace the TODO in `handleSubmit`:
```jsx
// In LoginPage.jsx
import { loginApi } from '../../api/authApi';

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;
  
  setLoading(true);
  try {
    const response = await loginApi(formData);
    // Store token, redirect, etc.
    navigate('/dashboard');
  } catch (error) {
    setErrors({ general: error.message });
  } finally {
    setLoading(false);
  }
};
```

---

## 🎯 Design Principles

### 1. **Minimalism**
- Clean white card on subtle gradient background
- Ample whitespace (8px spacing units)
- No unnecessary decorations

### 2. **Modern SaaS Aesthetic**
- Rounded corners (2xl for card, lg for inputs)
- Soft shadows with low opacity
- Indigo accent color (similar to Stripe/Linear)

### 3. **Accessibility**
- Semantic HTML (`<form>`, `<label>`, `<button>`)
- Focus rings on all interactive elements
- Error messages with icons and ARIA-friendly markup
- Proper input labeling

### 4. **Responsive**
- Mobile-first approach
- max-w-md container (448px)
- Padding adjusts for mobile (p-4)

### 5. **User Experience**
- Real-time validation feedback
- Loading states prevent double-submission
- Password visibility toggle for convenience
- Clear error messages

---

## 🎨 Optional Enhancements

### 1. Add Framer Motion for Advanced Animations
```bash
npm install framer-motion
```

```jsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  {/* Login card content */}
</motion.div>
```

### 2. Add Toast Notifications
```bash
npm install react-hot-toast
```

```jsx
import toast from 'react-hot-toast';

// On success
toast.success('Login successful!');

// On error
toast.error('Invalid credentials');
```

### 3. Add Form Library for Complex Validation
```bash
npm install react-hook-form zod @hookform/resolvers
```

### 4. Add Loading Skeleton
```jsx
// While checking auth state
<div className="animate-pulse bg-gray-200 h-10 rounded-lg" />
```

---

## 📱 Screenshots Reference

### Layout Breakdown
```
┌─────────────────────────────────────┐
│         [Logo Icon]                 │
│      FreelancerFlow                 │
│   Project & Invoice Management      │ ← Brand Section (fadeIn)
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │   Welcome Back                │  │
│  │   Manage your projects...     │  │
│  │                               │  │
│  │   Email Address *             │  │
│  │   [________________]          │  │
│  │                               │  │
│  │   Password *      Forgot?     │  │
│  │   [________________] [👁]    │  │
│  │                               │  │
│  │   [    Sign In Button    ]    │  │
│  │                               │  │
│  │   ────  Or continue with ──── │  │
│  │                               │  │
│  │   [Google]     [GitHub]       │  │
│  │                               │  │
│  │   Don't have an account?      │  │
│  │   Sign up                     │  │
│  └───────────────────────────────┘  │ ← Card (slideUp)
│                                     │
│   By signing in, you agree to...   │
└─────────────────────────────────────┘
```

---

## 🔧 Customization Tips

### Change Brand Color
Update in `tailwind.config.js`:
```js
colors: {
  primary: {
    600: '#your-color', // Main brand color
  }
}
```

Then update component classes:
- `bg-indigo-600` → `bg-primary-600`
- `text-indigo-600` → `text-primary-600`

### Adjust Card Width
```jsx
// In LoginPage.jsx
<div className="w-full max-w-lg"> {/* Change max-w-md to max-w-lg */}
```

### Change Font
```html
<!-- In index.html -->
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
```

```js
// In tailwind.config.js
fontFamily: {
  sans: ['Plus Jakarta Sans', 'sans-serif'],
}
```

---

## 🐛 Common Issues

### Tailwind Styles Not Applied
1. Check `global.css` is imported in `main.jsx`
2. Verify `tailwind.config.js` content paths include all component files
3. Restart dev server: `npm run dev`

### Password Toggle Not Working
- Ensure `showPasswordToggle` prop is set to `true`
- Check Input component has `type="password"`

### Form Not Submitting
- Check `type="submit"` on Button inside `<form>`
- Verify `onSubmit` handler on form element

---

## ✅ Testing Checklist

- [ ] Email validation works (invalid format shows error)
- [ ] Password validation works (< 6 chars shows error)
- [ ] Password toggle shows/hides password
- [ ] Forgot password link navigates correctly
- [ ] Sign up link navigates correctly
- [ ] Loading state shows on submit
- [ ] Errors clear when user types
- [ ] Form submits on Enter key
- [ ] Responsive on mobile (< 640px)
- [ ] Tab navigation works properly
- [ ] Focus states visible on all inputs

---

## 📄 License
This component is part of FreelancerFlow SaaS application.
