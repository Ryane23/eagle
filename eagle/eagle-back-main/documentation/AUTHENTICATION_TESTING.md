# Testing EAGLES Authentication System

## Prerequisites

Before testing, ensure:
1. **Firebase Private Key** is correctly set in `.env`
2. **Server is running**: `npm run start:dev`
3. **Database is seeded**: `npm run seed:all`

---

## Step 1: Fix Firebase Private Key

Your `.env` file currently has a placeholder. Update it with your actual Firebase private key:

```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

**To get your Firebase private key:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `eagles-5c818`
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file
6. Copy the `private_key` value (including BEGIN and END lines)
7. Replace `\n` with actual newlines or keep them as `\n` in the string

---

## Step 2: Seed the Database

Once Firebase is configured, run:

```bash
npm run seed:all
```

This will create:
- ✅ 4 Hospitals (Yaoundé, Douala, Bafoussam, Maroua)
- ✅ 5 Users (Admin, Primary Secretary, Secondary Secretary, Nurse, Doctor)

---

## Step 3: Test Authentication Endpoints

### 🔓 **Test 1: Login as Admin**

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
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "admin@eagles.com",
    "name": "System Administrator",
    "role": "admin",
    "isActive": true
  },
  "expiresIn": 3600
}
```

---

### 🔓 **Test 2: Login as Primary Secretary**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "secretary.primary@eagles.com",
    "password": "Primary@123"
  }'
```

---

### 🔓 **Test 3: Login as Secondary Secretary**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "secretary.douala@eagles.com",
    "password": "Douala@123"
  }'
```

---

### 🔓 **Test 4: Login as Nurse**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nurse.douala@eagles.com",
    "password": "Nurse@123"
  }'
```

---

### 🔓 **Test 5: Login as Doctor**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor.nana@eagles.com",
    "password": "Doctor@123"
  }'
```

---

### 🔒 **Test 6: Get Current User Profile**

Use the `accessToken` from login response:

```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "id": "...",
  "email": "admin@eagles.com",
  "name": "System Administrator",
  "phone": "+237600000000",
  "role": "admin",
  "hospitalId": null,
  "specialtyId": null,
  "isActive": true,
  "createdAt": "2025-11-18T...",
  "updatedAt": "2025-11-18T..."
}
```

---

### 🔒 **Test 7: Register New User (Admin Only)**

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN" \
  -d '{
    "email": "nurse.bafoussam@eagles.com",
    "password": "Nurse@456",
    "name": "Sophie Tchamba",
    "role": "nurse",
    "hospitalId": "HOSPITAL_ID_FROM_SEEDING",
    "phone": "+237655005678"
  }'
```

---

### 🔄 **Test 8: Refresh Access Token**

```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
  }'
```

---

### 🚪 **Test 9: Logout**

```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
  }'
```

---

### ❌ **Test 10: Test Invalid Credentials**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@eagles.com",
    "password": "WrongPassword"
  }'
```

**Expected Response:**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials"
}
```

---

### ❌ **Test 11: Test Unauthorized Access**

Try accessing `/auth/me` without a token:

```bash
curl -X GET http://localhost:3000/auth/me
```

**Expected Response:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

### ❌ **Test 12: Test Role-Based Access**

Try registering a user as a non-admin (should fail):

```bash
# First login as Secondary Secretary
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "secretary.douala@eagles.com",
    "password": "Douala@123"
  }'

# Then try to register (should fail with 403 Forbidden)
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SECRETARY_ACCESS_TOKEN" \
  -d '{
    "email": "test@eagles.com",
    "password": "Test@123",
    "name": "Test User",
    "role": "nurse"
  }'
```

**Expected Response:**
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

---

## Alternative: Use Postman or Insomnia

### Import this collection:

```json
{
  "info": {
    "name": "EAGLES Auth API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Login - Admin",
      "request": {
        "method": "POST",
        "header": [],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"admin@eagles.com\",\n  \"password\": \"Admin@123456\"\n}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        },
        "url": {
          "raw": "http://localhost:3000/auth/login",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["auth", "login"]
        }
      }
    },
    {
      "name": "Get Profile",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{accessToken}}",
            "type": "text"
          }
        ],
        "url": {
          "raw": "http://localhost:3000/auth/me",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["auth", "me"]
        }
      }
    }
  ]
}
```

---

## Expected Outcomes

✅ **Successful Login**: Returns access token + refresh token + user data  
✅ **Get Profile**: Returns user data without password  
✅ **Register (Admin)**: Creates new user  
✅ **Refresh Token**: Returns new access token  
✅ **Logout**: Revokes refresh token  
❌ **Invalid Credentials**: Returns 401 error  
❌ **Unauthorized Access**: Returns 401 error  
❌ **Role Violation**: Returns 403 error  

---

## Troubleshooting

### Issue: "Failed to parse private key"
**Solution**: Update `.env` with actual Firebase private key

### Issue: "User not found" after seeding
**Solution**: Check Firestore console to verify users were created

### Issue: "JWT_SECRET is not defined"
**Solution**: Ensure `.env` file has `JWT_SECRET` value

### Issue: Port 3000 already in use
**Solution**: Stop the running process or change `PORT` in `.env`

---

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@eagles.com | Admin@123456 |
| Primary Secretary | secretary.primary@eagles.com | Primary@123 |
| Secondary Secretary | secretary.douala@eagles.com | Douala@123 |
| Nurse | nurse.douala@eagles.com | Nurse@123 |
| Doctor | doctor.nana@eagles.com | Doctor@123 |

---

**⚠️ IMPORTANT**: Change all default passwords in production!
