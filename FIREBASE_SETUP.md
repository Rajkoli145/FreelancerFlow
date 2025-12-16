# Firebase Authentication Setup Guide

## Frontend Setup (.env)

Add these Firebase configuration values to `/frontend/.env`:

```env
# Get these from Firebase Console > Project Settings > General
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

## Backend Setup (.env)

Add Firebase service account to `/backend/.env`:

```env
# Download service account JSON from Firebase Console > Project Settings > Service Accounts
# Minify the JSON and add as one line:
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key":"..."}
```

## Steps to Get Firebase Credentials:

### 1. Frontend Configuration (Web App)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Project Settings** (gear icon)
4. Scroll to **Your apps** section
5. If no web app exists, click **Add app** > Web icon
6. Copy the config object values to your `.env` file

### 2. Enable Google Authentication
1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Click **Google** provider
3. Toggle **Enable**
4. Add your support email
5. Click **Save**

### 3. Enable GitHub Authentication
1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Click **GitHub** provider
3. Toggle **Enable**
4. You'll need GitHub OAuth credentials:
   - Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - Click **New OAuth App**
   - Fill in:
     - **Application name**: FreelancerFlow
     - **Homepage URL**: https://freelancer-flow-seven.vercel.app
     - **Authorization callback URL**: (copy from Firebase)
   - Click **Register application**
   - Copy **Client ID** and **Client Secret**
5. Paste GitHub credentials into Firebase
6. Click **Save**

### 4. Backend Service Account
1. In Firebase Console, go to **Project Settings** > **Service Accounts**
2. Click **Generate new private key**
3. Download the JSON file
4. **Minify the JSON** (remove all whitespace/newlines)
5. Add to backend `.env` as single line:
   ```env
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
   ```

### 5. Update Authorized Domains
1. In Firebase Console, go to **Authentication** > **Settings** > **Authorized domains**
2. Add your domains:
   - `localhost` (for development)
   - `freelancer-flow-seven.vercel.app` (your Vercel domain)
   - `freelancerflow-59ye.onrender.com` (your backend domain)

## Environment Variables on Render

Add to your Render dashboard:
1. Go to your backend service on Render
2. Navigate to **Environment**
3. Add new environment variable:
   - Key: `FIREBASE_SERVICE_ACCOUNT`
   - Value: Your minified JSON (single line)
4. Save changes and redeploy

## Environment Variables on Vercel

Add to your Vercel dashboard:
1. Go to your project on Vercel
2. Navigate to **Settings** > **Environment Variables**
3. Add each Firebase variable:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
4. Save and redeploy

## Testing Locally

1. Update your local `.env` files with Firebase credentials
2. Restart both frontend and backend servers
3. Visit http://localhost:5173/login
4. Click Google or GitHub icons
5. You should see OAuth popup
6. After authentication, you'll be redirected to dashboard

## Features Implemented

✅ Google OAuth login/signup
✅ GitHub OAuth login/signup  
✅ Automatic user creation on first OAuth login
✅ Firebase UID stored in database
✅ Profile photo synced from OAuth provider
✅ LinkedIn icon (disabled - awaiting implementation)
✅ Neumorphic button styling
✅ Loading states during authentication
✅ Error handling and display

## Security Notes

- Never commit `.env` files to git
- Keep service account JSON secure
- Use environment variables on production
- Firebase SDK handles token verification
- JWT tokens are still used for API authentication

## Troubleshooting

**Error: "Firebase not initialized"**
- Check if `FIREBASE_SERVICE_ACCOUNT` is set in backend .env
- Verify JSON is properly minified (no newlines)

**Error: "Popup blocked"**
- Enable popups for localhost/your domain
- Or use redirect method instead of popup

**Error: "Unauthorized domain"**
- Add your domain to Firebase Authorized Domains
- Wait a few minutes for changes to propagate

**GitHub auth fails**
- Verify GitHub OAuth callback URL matches Firebase
- Check Client ID and Secret are correct
- Ensure app is not in developer mode on GitHub
