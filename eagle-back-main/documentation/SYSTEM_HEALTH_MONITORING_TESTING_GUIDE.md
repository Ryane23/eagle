# System Health Monitoring - Testing Guide

## Overview

This guide covers testing for the **System Health Monitoring** endpoint, which provides administrators with system status, database connectivity, and server uptime information.

## Module Components

### 📋 Endpoint

#### GET /system/health
- **Access**: `ADMIN` only
- **Location**: `src/modules/system/system.controller.ts`
- **Service Method**: `SystemService.getHealth()`

### 🔧 Response Format

```json
{
  "status": "healthy" | "degraded",
  "database": "healthy" | "unhealthy",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "uptime": 3600
}
```

**Fields:**
- `status`: Overall system status (`healthy` when database is healthy, `degraded` otherwise)
- `database`: Database connectivity status (`healthy` or `unhealthy`)
- `timestamp`: Current server timestamp
- `uptime`: Server uptime in seconds (integer)

### 🔍 Health Check Logic

1. **Database Connectivity**: Attempts to access Firestore by calling `systemRepository.getSettings()`
   - If successful → `database: "healthy"`
   - If error occurs → `database: "unhealthy"`

2. **System Status**: 
   - `healthy` when database is healthy
   - `degraded` when database is unhealthy

3. **Uptime**: Uses `process.uptime()` to get server uptime in seconds

---

## Prerequisites

1. **Server Running**: `npm run start:dev`
2. **Database Seeded**: `npm run seed:all` (optional, but recommended)
3. **Newman Installed**: `npm install -g newman` (for automated testing)

---

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@eagles.com | Admin@123456 |
| Doctor | doctor.nana@eagles.com | Doctor@123 |

---

## Test Scenarios

### ✅ Health Monitoring Tests

#### 1. **Get System Health - Admin (Success)**
- **Role**: ADMIN
- **Expected**: 200 OK
- **Verification**:
  - Response has `status` field (healthy or degraded)
  - Response has `database` field (healthy or unhealthy)
  - Response has `timestamp` field
  - Response has `uptime` field (number >= 0)
  - If database is healthy, status should be healthy

#### 2. **Get System Health - Doctor (Forbidden)**
- **Role**: DOCTOR
- **Expected**: 403 Forbidden
- **Verification**: Error message indicates access denied

#### 3. **Get System Health - Unauthorized (No Token)**
- **Role**: None (no authentication)
- **Expected**: 401 Unauthorized
- **Verification**: Authentication required

#### 4. **Get System Health - Verify Timestamp Format**
- **Role**: ADMIN
- **Expected**: 200 OK
- **Verification**:
  - Timestamp is valid and parseable
  - Timestamp is recent (within last minute)

#### 5. **Get System Health - Verify Uptime Increases**
- **Role**: ADMIN
- **Expected**: 200 OK
- **Verification**:
  - Uptime is a positive number
  - Uptime increases over time (tested with delay)

#### 6. **Get System Health - Multiple Requests (Consistency)**
- **Role**: ADMIN
- **Expected**: 200 OK
- **Verification**:
  - Multiple requests return consistent database status
  - Response format is consistent

---

## Running Tests

### Automated Testing (Recommended)

```powershell
# Run the PowerShell test script
.\test-system-health-monitoring.ps1
```

This script will:
1. Check if Newman is installed
2. Verify server is running
3. Run the Postman collection
4. Display test results

### Manual Testing with Postman

1. **Import Collection**:
   - Import `EAGLES_System_Health_Monitoring_Postman_Collection.json`
   - Import `EAGLES_Local.postman_environment.json`

2. **Run Collection**:
   - Select the collection
   - Click "Run"
   - Review test results

### Manual Testing with cURL

#### Get System Health (Admin)
```bash
curl -X GET http://localhost:3000/system/health \
  -H "Authorization: Bearer {adminToken}"
```

**Expected Response:**
```json
{
  "status": "healthy",
  "database": "healthy",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "uptime": 3600
}
```

#### Get System Health (Doctor - Should Fail)
```bash
curl -X GET http://localhost:3000/system/health \
  -H "Authorization: Bearer {doctorToken}"
```

**Expected Response:** 403 Forbidden

---

## Expected Test Results

### ✅ Success Criteria

- **Admin Access**: Can successfully retrieve health status
- **Access Control**: Non-admin roles receive 403 Forbidden
- **Unauthorized Access**: Requests without token receive 401 Unauthorized
- **Database Check**: Correctly reports database connectivity status
- **Uptime Tracking**: Returns valid uptime value that increases over time
- **Timestamp**: Returns valid, recent timestamp
- **Response Format**: All required fields present with correct types

### 📊 Test Coverage

- **Total Requests**: 6
- **Test Categories**:
  - Setup (2 requests)
  - Health Monitoring Tests (6 requests)

---

## Troubleshooting

### Issue: "Database status is unhealthy"
**Possible Causes**:
- Firestore connection issue
- Invalid Firebase credentials
- Network connectivity problems

**Solution**: 
- Check Firebase configuration in `.env`
- Verify Firestore is accessible
- Check server logs for database errors

### Issue: "Uptime is 0 or negative"
**Possible Causes**:
- Server just started
- Process uptime calculation issue

**Solution**: 
- Wait a few seconds and retry
- Check server logs for process issues

### Issue: "403 Forbidden" for Admin
**Possible Causes**:
- Invalid or expired token
- User role not set correctly

**Solution**: 
- Re-login to get fresh token
- Verify user role in database

### Issue: "Timestamp parsing fails"
**Possible Causes**:
- Firestore timestamp format
- Date serialization issue

**Solution**: 
- Test handles multiple timestamp formats
- Check server response format

---

## Security Considerations

1. **Access Control**: Only ADMIN role can access health endpoint
2. **Authentication Required**: All requests must include valid JWT token
3. **No Sensitive Data**: Health endpoint doesn't expose sensitive system information
4. **Rate Limiting**: Consider implementing rate limiting for production

---

## Related Documentation

- [System Controller](../src/modules/system/system.controller.ts)
- [System Service](../src/modules/system/system.service.ts)
- [System Repository](../src/modules/system/system.repository.ts)

---

## Monitoring Best Practices

1. **Regular Health Checks**: Set up automated monitoring to call this endpoint periodically
2. **Alerting**: Configure alerts when status is "degraded" or database is "unhealthy"
3. **Logging**: Log health check results for trend analysis
4. **Dashboard**: Display health status on admin dashboard

---

**Last Updated**: 2025-01-XX
**Test Suite Version**: 1.0.0

