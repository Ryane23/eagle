# Render Deployment Guide for EAGLE Backend

## Current Issue

Your Render service has been **suspended**. This commonly happens when:
- The free tier instance goes to sleep and hasn't been restarted
- Environment variables are not configured
- Database seeding hasn't been run
- Build fails on deployment

## Step-by-Step Deployment Fix

### 1. Reactivate Your Render Service

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Navigate to your `eagle-back-2fep` service
3. Check if service is suspended and click **Resume Service**
4. If not suspended, check the **Logs** tab for errors

### 2. Configure Environment Variables

Go to **Environment** tab in your Render service and add these variables:

#### Required Variables

```
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://eagle-front.onrender.com
```

#### JWT Configuration (CRITICAL)
```
JWT_SECRET=<generate-a-strong-random-secret-key>
JWT_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d
```

To generate a strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### Firebase Configuration (REQUIRED)

You need these from your Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Project Settings** > **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file

From that JSON file, extract:

```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYourPrivateKeyHere\n-----END PRIVATE KEY-----\n
```

**IMPORTANT**: For `FIREBASE_PRIVATE_KEY`, copy the entire private key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`. In Render, paste it as one line with `\n` for newlines.

### 3. Update Build & Start Commands

In Render dashboard, verify these settings:

**Build Command:**
```
npm install && npm run build
```

**Start Command:**
```
npm run start:prod
```

### 4. Seed the Admin User (One-Time Setup)

After deployment is successful, you need to seed the admin user:

#### Option A: Add Seed Script to Build (Recommended)

Update your `package.json` build script:
```json
"scripts": {
  "build": "nest build && npm run seed:admin"
}
```

Then redeploy on Render.

#### Option B: Use Render Shell

1. In Render dashboard, go to **Shell** tab
2. Run:
```bash
npm run seed:admin
```

### 5. Verify Deployment

After deployment completes:

**Test Health Endpoint:**
```bash
curl https://eagle-back-2fep.onrender.com/
```

**Test Login:**
```bash
curl -X POST https://eagle-back-2fep.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@eagles.com",
    "password": "Admin@123456"
  }'
```

You should get a 200 response with access token.

### 6. Update Frontend CORS Configuration

Verify your backend accepts requests from your frontend:

The `FRONTEND_URL` environment variable should be:
```
FRONTEND_URL=https://eagle-front.onrender.com
```

### 7. Fix Frontend 404 Errors

The frontend is trying to load `/terms` and `/legal` routes that don't exist. 

**For the frontend team**, add these routes or remove the links temporarily.

## Common Issues & Solutions

### Issue: "Service Suspended"
- **Cause**: Free tier services sleep after inactivity
- **Solution**: Upgrade to paid plan or implement a ping service

### Issue: "Authentication Failed" (401)
- **Cause**: Missing JWT_SECRET or Firebase credentials
- **Solution**: Set all environment variables correctly

### Issue: "Firebase Error"
- **Cause**: Invalid Firebase credentials
- **Solution**: Re-download service account key and update env vars

### Issue: "CORS Error"
- **Cause**: FRONTEND_URL not matching actual frontend URL
- **Solution**: Update FRONTEND_URL to exact frontend domain

## Post-Deployment Checklist

- [ ] Service is running (check dashboard)
- [ ] Environment variables are set
- [ ] Build completed successfully
- [ ] Health endpoint responds (GET /)
- [ ] Login endpoint works (POST /auth/login)
- [ ] Admin user exists in Firestore
- [ ] CORS allows frontend domain
- [ ] Logs show no errors

## Monitoring

Set up these monitors:

1. **Uptime Monitor**: Use UptimeRobot or similar to ping your service every 5 minutes
2. **Log Monitoring**: Check Render logs regularly for errors
3. **Firebase Console**: Monitor Firestore usage and costs

## Security Notes

1. **Change Default Password**: After first login, change the admin password
2. **JWT Secret**: Never commit JWT_SECRET to Git
3. **Firebase Key**: Never commit service account JSON to Git
4. **Environment Variables**: Use Render's encrypted environment variables

## Need Help?

If deployment still fails:

1. Check **Logs** tab in Render dashboard
2. Look for build errors or runtime errors
3. Verify all environment variables are set
4. Check Firebase console for authentication issues
5. Test endpoints using the Swagger docs at `/api/docs`

## Auto-Deploy from Git

To enable automatic deployment:

1. Connect your GitHub repository to Render
2. Set auto-deploy branch to `main` or `master`
3. Each push will trigger a new deployment

---

**Last Updated**: January 16, 2026
