# Admin User Seeding Guide

## Overview

The admin seeding script now creates the admin user in **BOTH** databases:
1. **Firebase Authentication** - For login/authentication
2. **Firestore Database** - For user profile data

This dual-database approach ensures:
- User can authenticate via Firebase Auth
- User profile data is stored and queryable in Firestore
- UID is consistent across both systems

---

## Prerequisites

Before running the seed script, you need:

1. **Firebase Project** - Active Firebase project
2. **Service Account Key** - Downloaded from Firebase Console
3. **Environment Variables** - Properly configured

---

## Setup Steps

### 1. Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your EAGLE project
3. Click ⚙️ **Settings** → **Project Settings**
4. Navigate to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Download the JSON file (keep it secure!)

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your Firebase credentials from the downloaded JSON:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-actual-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
Your-Actual-Private-Key-Goes-Here-With-Real-Newlines
-----END PRIVATE KEY-----"
```

**IMPORTANT**: 
- For local development, use actual newlines in `FIREBASE_PRIVATE_KEY`
- For Render deployment, use `\n` instead of actual newlines

### 3. Run the Seed Script

```bash
npm run seed:admin
```

**Expected Output:**

```
🌱 Starting admin user seeding...

📝 Creating new admin user in Firebase Authentication...
✅ Firebase Auth user created with UID: abc123xyz456

📝 Creating admin user in Firestore...

✅ Admin user created successfully in both Firebase Auth and Firestore!

📧 Email: admin@eagles.com
🔑 Password: Admin@123456
🆔 User ID (UID): abc123xyz456
📍 Firestore Path: users/abc123xyz456

⚠️  IMPORTANT: Please change the admin password after first login!
```

---

## What the Script Does

### Step 1: Check Existing Users

```typescript
// Checks if admin exists in Firestore
const existingAdmin = await firestore
  .collection('users')
  .where('email', '==', 'admin@eagles.com')
  .limit(1)
  .get();

// Checks if admin exists in Firebase Auth
const authUser = await auth.getUserByEmail('admin@eagles.com');
```

### Step 2: Create Firebase Auth User

```typescript
const authUser = await auth.createUser({
  email: 'admin@eagles.com',
  password: 'Admin@123456',
  displayName: 'System Administrator',
  disabled: false,
});
```

### Step 3: Create Firestore Document

```typescript
const userRef = firestore.collection('users').doc(authUser.uid);
await userRef.set({
  id: authUser.uid,           // Same UID as Firebase Auth
  email: 'admin@eagles.com',
  password: hashedPassword,    // Bcrypt hashed
  name: 'System Administrator',
  phone: '+237600000000',
  role: 'admin',
  hospitalId: null,
  specialtyId: null,
  isActive: true,
  createdAt: now,
  updatedAt: now,
});
```

### Step 4: Rollback on Failure

If Firestore creation fails, the script automatically deletes the Firebase Auth user to maintain consistency.

---

## Verification

After seeding, verify the admin user exists:

### Check Firestore

1. Go to Firebase Console → Firestore Database
2. Navigate to `users` collection
3. Look for document with email `admin@eagles.com`

### Check Firebase Auth

1. Go to Firebase Console → Authentication
2. Look for user with email `admin@eagles.com`

### Test Login API

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@eagles.com",
    "password": "Admin@123456"
  }'
```

**Expected Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "abc123xyz456",
    "email": "admin@eagles.com",
    "name": "System Administrator",
    "role": "admin",
    "isActive": true
  },
  "expiresIn": 3600
}
```

---

## Troubleshooting

### Error: "Firebase project not found"

**Cause**: `FIREBASE_PROJECT_ID` is incorrect  
**Solution**: Double-check project ID in Firebase Console

### Error: "Invalid credentials"

**Cause**: `FIREBASE_CLIENT_EMAIL` or `FIREBASE_PRIVATE_KEY` is incorrect  
**Solution**: Re-download service account key and update .env

### Error: "Admin user already exists"

**Cause**: Admin was already seeded  
**Solution**: This is normal - script skips creation

**To reset**: 
1. Delete user from Firebase Auth
2. Delete user from Firestore users collection
3. Run seed script again

### Error: "auth/email-already-exists"

**Cause**: User exists in Firebase Auth but not in Firestore  
**Solution**: Either delete from Auth or manually create Firestore doc

---

## Production Deployment (Render)

### Automatic Seeding

The `package.json` includes a `postbuild` script:

```json
"postbuild": "npm run seed:admin || true"
```

This runs automatically after each build on Render.

**Note**: The `|| true` ensures build doesn't fail if admin already exists.

### Manual Seeding on Render

1. Go to Render Dashboard
2. Select your service
3. Open **Shell** tab
4. Run:
```bash
npm run seed:admin
```

---

## Security Best Practices

1. **Never commit** `.env` file to Git
2. **Never commit** Firebase service account JSON
3. **Change default password** immediately after first login
4. **Rotate service account keys** periodically
5. **Use environment variables** for all sensitive data

---

## Default Credentials

**⚠️ FOR INITIAL SETUP ONLY - CHANGE IMMEDIATELY**

```
Email: admin@eagles.com
Password: Admin@123456
```

**After first login:**
1. Login as admin
2. Go to Settings/Profile
3. Change password to a strong, unique password
4. Enable 2FA if available

---

## Clearing the Database (Firestore only)

To clear **all Firestore data** in the `eagles` database (e.g. for a fresh start):

```bash
npm run db:clear
```

This deletes every document in all known collections. It does **not** delete Firebase Authentication users; remove those manually in [Firebase Console → Authentication → Users](https://console.firebase.google.com) if needed.

After clearing, use the **full seed** (see below) so data stays consistent with backend and frontend.

---

## No migrations (Firestore)

EAGLE uses **Firestore** (NoSQL). There are no SQL-style migrations. To keep **frontend, backend, and database aligned**:

1. **Seed order matters.** Create base data first, then users that reference it:
   - Hospitals → Specialties → Users (admin, secretaries, nurses, doctors with `specialtyId`).
2. **Use the full seed flow** after a clear so all references (e.g. `specialtyId`, `hospitalId`) point to existing documents.
3. **One-time full reset:**  
   `npm run db:clear` then `npm run seed:full`.

---

## Full consistent seed (recommended after clear)

To get a **fully consistent dataset** (hospitals, specialties, users, **and** patients, consultations, queue, referrals, notifications, activities, prescriptions, followups) in one go:

```bash
npm run seed:full
```

This runs in order:

1. **seed:specialties** – Default specialties (Médecine Générale, Pédiatrie, etc.).
2. **seed:auth-roles** – Admin, secretaries, nurse, one generic doctor (Firebase Auth + Firestore).
3. **seed:doctors** – One doctor per specialty (Firebase Auth + Firestore); prints credentials.
4. **seed:data** – Patients, consultations, queue entries, referrals, notifications, activities, prescriptions, followups (aligned with backend entities and frontend API types).

After a clear:

```bash
npm run db:clear && npm run seed:full
```

**Consistency:** Seed data matches backend entities (Patient, Consultation, Queue, Referral, etc.) and the shapes the frontend expects from the API. No migrations are needed; run `seed:full` after any clear to keep frontend, backend, and database aligned.

To add or refresh only the “data” layer (patients, consultations, queue, etc.) without recreating users:

```bash
npm run seed:data
```

(Requires hospitals, specialties, and users to already exist from a previous `seed:full`.)

---

## Doctor accounts (by specialty)

After running `npm run seed:doctors` (or `npm run seed:full`), you get **one doctor per specialty** in Firebase Auth and Firestore. All use the same password.

| Specialty | Email | Password |
|-----------|--------|----------|
| Médecine Générale | `doctor.medecine_generale@eagles.com` | `Doctor@123` |
| Pédiatrie | `doctor.pediatrie@eagles.com` | `Doctor@123` |
| Cardiologie | `doctor.cardiologie@eagles.com` | `Doctor@123` |
| Dermatologie | `doctor.dermatologie@eagles.com` | `Doctor@123` |
| Gynécologie-Obstétrique | `doctor.gynecologie_obstetrique@eagles.com` | `Doctor@123` |
| Traumatologie | `doctor.traumatologie@eagles.com` | `Doctor@123` |
| Psychiatrie | `doctor.psychiatrie@eagles.com` | `Doctor@123` |
| Radiologie | `doctor.radiologie@eagles.com` | `Doctor@123` |

The script also prints this table when it finishes. Each doctor has `hospitalId` set to the primary center (YDE) and `specialtyId` set to the corresponding specialty document.

---

## Seeding Other Data

### Seed Hospitals

```bash
npm run seed:hospitals
```

### Seed All Data

```bash
npm run seed:all
```

This runs all seed scripts in order:
1. Admin user
2. Hospitals
3. Specialties
4. Sample users

---

## Database Structure

### Firebase Authentication
```
Users
└── abc123xyz456 (UID)
    ├── email: admin@eagles.com
    ├── displayName: System Administrator
    └── disabled: false
```

### Firestore Database
```
users
└── abc123xyz456 (Document ID = Firebase Auth UID)
    ├── id: "abc123xyz456"
    ├── email: "admin@eagles.com"
    ├── password: "$2b$10$..." (bcrypt hash)
    ├── name: "System Administrator"
    ├── phone: "+237600000000"
    ├── role: "admin"
    ├── hospitalId: null
    ├── specialtyId: null
    ├── isActive: true
    ├── createdAt: Timestamp
    └── updatedAt: Timestamp
```

**Key Point**: Both databases use the **same UID** for consistency.

---

## Why Both Databases?

**Firebase Authentication**:
- Handles login/logout
- Token generation
- Password reset
- Email verification
- Session management

**Firestore**:
- Stores extended user profile
- Supports complex queries
- Stores relationships (hospital, specialty)
- Tracks user activity
- Stores custom fields

---

*Last Updated: January 16, 2026*
