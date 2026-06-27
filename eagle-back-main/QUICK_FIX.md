# EAGLE Backend - Quick Fixes for Authentication Issues

## Problem Summary

Your Render backend service is **suspended**, causing 401 authentication errors. Here's what you need to do:

---

## Immediate Actions (Do These Now)

### 1. Reactivate Render Service ⚡

1. Go to https://dashboard.render.com
2. Find your `eagle-back-2fep` service
3. If it says "Suspended", click **Resume Service**
4. If not suspended, proceed to step 2

### 2. Set Environment Variables 🔑

**Critical** - Without these, authentication will fail:

Go to your service → **Environment** tab → Add these:

```
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://eagle-front.onrender.com
JWT_SECRET=<paste-the-secret-you-generate-below>
JWT_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d
```

**Generate JWT Secret:**
Run this in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Copy the output and paste it as `JWT_SECRET` value.

### 3. Add Firebase Credentials 🔥

You need these 3 variables from Firebase Console:

1. Go to https://console.firebase.google.com
2. Select your project
3. **Settings** (gear icon) → **Service Accounts** → **Generate New Private Key**
4. Download the JSON file
5. Extract these values:

```
FIREBASE_PROJECT_ID=<from JSON: project_id>
FIREBASE_CLIENT_EMAIL=<from JSON: client_email>
FIREBASE_PRIVATE_KEY=<from JSON: private_key>
```

**IMPORTANT**: When pasting `FIREBASE_PRIVATE_KEY` in Render:
- Copy the entire key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Keep the `\n` characters in the string (don't replace with actual newlines)

### 4. Trigger Redeploy 🚀

After setting environment variables:
1. Go to **Manual Deploy** → **Deploy latest commit**
2. Wait for deployment to complete (check **Logs** tab)

### 5. Test the Backend ✅

Once deployed, test:

```bash
curl https://eagle-back-2fep.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@eagles.com","password":"Admin@123456"}'
```

Expected response: JSON with `accessToken` and `user` object.

---

## Frontend Issues (Secondary)

The 404 errors for `/terms` and `/legal` are separate frontend routing issues. These won't affect login but should be fixed by:

- Adding these routes to your Next.js app, OR
- Removing the links to these pages temporarily

---

## Why This Happened

1. **Service Suspension**: Free tier Render services suspend after 15 minutes of inactivity
2. **Missing Environment Variables**: Without JWT_SECRET and Firebase credentials, authentication can't work
3. **No Admin User**: Database might not have been seeded

---

## Need Help?

If you still get errors after following these steps:

1. Check **Logs** tab in Render dashboard for specific error messages
2. Verify all environment variables are set correctly
3. Make sure Firebase credentials match your actual Firebase project
4. Confirm your Firebase project has Firestore enabled

---

## Default Admin Credentials

Once working:
- **Email**: admin@eagles.com
- **Password**: Admin@123456

**⚠️ Change this password immediately after first login!**
