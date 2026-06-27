# EAGLE Authentication Error - Complete Solution

**Error Summary**: Authentication failing due to suspended Render backend service  
**Priority**: 🔴 CRITICAL - Production Down  
**Estimated Fix Time**: 15-30 minutes

---

## Root Cause Analysis

### Primary Issue
Your Render backend service (`eagle-back-2fep.onrender.com`) is **SUSPENDED**. When the frontend tries to authenticate, it receives:
```
Status: 401 Unauthorized
Service Suspended
```

### Secondary Issues
1. Missing environment variables (JWT_SECRET, Firebase credentials)
2. Frontend 404 errors for `/terms` and `/legal` routes
3. Admin user may not be seeded in production database

---

## Complete Fix Checklist

### ✅ Step 1: Reactivate Render Service (2 min)

1. Go to: https://dashboard.render.com
2. Find service: `eagle-back-2fep`
3. If suspended, click **"Resume Service"**
4. If active, check **Logs** tab for errors

### ✅ Step 2: Set Environment Variables (10 min)

Go to your service → **Environment** tab → Add these variables:

#### Application Config
```bash
NODE_ENV=production
PORT=10000
```

#### CORS Configuration
```bash
FRONTEND_URL=https://eagle-front.onrender.com
```

#### JWT Secrets (CRITICAL)
Generate a secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Then add:
```bash
JWT_SECRET=<paste-generated-secret-here>
JWT_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d
```

#### Firebase Credentials (REQUIRED)

Get these from Firebase Console:

1. Go to https://console.firebase.google.com
2. Select your EAGLE project
3. Click ⚙️ **Settings** → **Service Accounts**
4. Click **"Generate New Private Key"**
5. Download JSON file

From the JSON, extract and add:

```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYour-Key-Here\n-----END PRIVATE KEY-----\n
```

**⚠️ IMPORTANT for FIREBASE_PRIVATE_KEY:**
- Copy the entire key including `-----BEGIN...-----` and `-----END...-----`
- Keep `\n` characters (don't replace with actual newlines)
- Paste as a single line in Render

### ✅ Step 3: Deploy the Updated Backend (5 min)

After setting environment variables:

1. Go to **Manual Deploy** tab
2. Click **"Deploy latest commit"**
3. Wait for build to complete (watch Logs tab)
4. The seed script will run automatically and create admin in both:
   - ✅ Firebase Authentication
   - ✅ Firestore Database
5. Look for: `🚀 Application is running on: http://localhost:10000`

**Note**: The admin user is now created in BOTH Firebase Auth AND Firestore for proper authentication.

### ✅ Step 4: Verify Deployment (3 min)

Test the backend is working:

```bash
# Test health endpoint
curl https://eagle-back-2fep.onrender.com/

# Test login
curl -X POST https://eagle-back-2fep.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@eagles.com","password":"Admin@123456"}'
```

**Expected Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1...",
  "refreshToken": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": "...",
    "email": "admin@eagles.com",
    "name": "System Administrator",
    "role": "admin"
  },
  "expiresIn": 3600
}
```

### ✅ Step 5: Test Frontend Login (2 min)

1. Open https://eagle-front.onrender.com
2. Try to login with:
   - Email: `admin@eagles.com`
   - Password: `Admin@123456`
3. Should successfully authenticate

---

## Frontend 404 Fixes (Optional - Non-Critical)

The `/terms` and `/legal` 404 errors won't affect authentication but should be fixed.

See: [FRONTEND_ROUTES_FIX.md](./FRONTEND_ROUTES_FIX.md)

---

## What Changed

### Files Modified

1. **package.json** - Added automatic seeding after build
2. **src/main.ts** - Improved CORS configuration
3. **.env.example** - Created environment variable template

### New Configuration

- Enhanced CORS to allow multiple origins
- Auto-seed admin user on deployment
- Better error logging for CORS issues

---

## Verification Commands

After deployment, run these to verify everything:

```bash
# 1. Check service is running
curl -I https://eagle-back-2fep.onrender.com/

# 2. Check Swagger docs
curl https://eagle-back-2fep.onrender.com/api/docs

# 3. Test login
curl -X POST https://eagle-back-2fep.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@eagles.com","password":"Admin@123456"}'

# 4. Test authenticated endpoint (use token from step 3)
curl https://eagle-back-2fep.onrender.com/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

## Common Issues & Solutions

### Issue: Still getting 401 after deployment

**Cause**: Environment variables not set correctly  
**Solution**: 
1. Double-check all env vars are set in Render
2. Redeploy the service
3. Check logs for Firebase authentication errors

### Issue: "Firebase project not found"

**Cause**: Wrong FIREBASE_PROJECT_ID  
**Solution**: Verify project ID matches your Firebase Console

### Issue: "Invalid JWT secret"

**Cause**: JWT_SECRET not set or too weak  
**Solution**: Generate a new strong secret and redeploy

### Issue: "CORS error" from frontend

**Cause**: FRONTEND_URL doesn't match actual frontend URL  
**Solution**: Update FRONTEND_URL to exactly match your frontend domain

---

## Security Checklist

- [ ] JWT_SECRET is strong and unique
- [ ] Firebase credentials are not committed to Git
- [ ] Default admin password will be changed after first login
- [ ] CORS only allows your frontend domain
- [ ] HTTPS is enforced (Render does this automatically)

---

## Monitoring Setup (Recommended)

### Prevent Future Suspensions

Free tier Render services suspend after 15 min of inactivity.

**Solutions**:
1. **Upgrade to paid plan** ($7/month for always-on service)
2. **Use a ping service** (e.g., UptimeRobot) to ping every 14 minutes
3. **Accept suspension** and manually resume when needed

### Set Up Monitoring

1. **UptimeRobot** (free): https://uptimerobot.com
   - Monitor: `https://eagle-back-2fep.onrender.com/`
   - Interval: 5 minutes
   - Alert: Email when down

2. **Render Notifications**
   - Enable email alerts for service issues
   - Monitor deployment failures

---

## Default Credentials

After deployment, login with:

```
Email: admin@eagles.com
Password: Admin@123456
```

**⚠️ CRITICAL**: Change this password immediately after first login!

To change password:
1. Login as admin
2. Go to Settings/Profile
3. Update password to something secure

---

## Next Steps After Fix

1. **Test all authentication flows**
   - Login
   - Logout
   - Token refresh
   - Protected routes

2. **Verify all user roles can login**
   - Admin
   - Doctor
   - Nurse
   - Primary/Secondary users

3. **Check API endpoints**
   - Visit: https://eagle-back-2fep.onrender.com/api/docs
   - Test critical endpoints

4. **Monitor for 24 hours**
   - Check logs for errors
   - Verify service stays up
   - Test frontend functionality

---

## Support

If issues persist:

1. **Check Render Logs**: Dashboard → Logs tab
2. **Check Firebase Console**: Look for authentication errors
3. **Test with Postman**: Use Swagger docs as reference
4. **Verify Environment Variables**: All should be set and valid

---

## Files for Reference

- [QUICK_FIX.md](./QUICK_FIX.md) - Step-by-step quick fix
- [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) - Full deployment guide
- [FRONTEND_ROUTES_FIX.md](./FRONTEND_ROUTES_FIX.md) - Fix frontend 404s
- [.env.example](./.env.example) - Environment variable template

---

**Status**: ✅ Backend code fixed and ready to deploy  
**Action Required**: Configure environment variables on Render and deploy  
**Estimated Downtime**: 0 minutes (deploy while suspended)

---

*Last Updated: January 16, 2026*
