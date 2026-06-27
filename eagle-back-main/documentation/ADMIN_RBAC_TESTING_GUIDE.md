# Admin RBAC Functionality - Testing Guide

## Overview

This guide covers comprehensive testing of Admin Role-Based Access Control (RBAC) functionality, including system health monitoring, notification management, and consultation management capabilities exclusive to Administrators.

## Module Functionalities

### 1. System Health Monitoring
- **Get System Health**: `GET /system/health` (ADMIN only)
- Checks database connectivity
- Returns system uptime
- Returns health status (healthy/degraded)
- Response: `{ status, database, timestamp, uptime }`

### 2. Send Notifications (Admin Only)
- **Send Notification**: `POST /notifications/send/:userId` (ADMIN only)
- Manually send notifications to any user
- Supports all notification types (APPOINTMENT, MESSAGE, REMINDER, ALERT, SYSTEM)
- Admin can send notifications to any user in the system

### 3. View All Notifications
- **Get My Notifications**: `GET /notifications/my`
- View all notifications for the authenticated user
- Available to all authenticated users (including Admin)

### 4. View Unread Notifications
- **Get Unread Notifications**: `GET /notifications/my/unread`
- View unread notifications only
- Available to all authenticated users

### 5. Get Unread Count
- **Get Unread Count**: `GET /notifications/my/unread-count`
- Get count of unread notifications
- Response: `{ count: number }`

### 6. Mark Notification as Read
- **Mark as Read**: `PATCH /notifications/:id/read`
- Mark individual notification as read
- Available to notification owner

### 7. Mark All Notifications as Read
- **Mark All as Read**: `PATCH /notifications/read-all`
- Mark all notifications as read at once
- Available to all authenticated users

### 8. Delete Notification (Admin Only)
- **Delete Notification**: `DELETE /notifications/:id` (ADMIN only)
- Delete any notification in the system
- Admin can delete notifications belonging to any user

### 9. Cancel Any Consultation (Admin)
- **Cancel Consultation**: `PATCH /consultations/:id/cancel` (ADMIN, DOCTOR, PRIMARY_SECRETARY)
- Admin can cancel any consultation in the system
- No restriction on consultation assignment
- Updates queue status automatically

### 10. View Any Consultation (Admin)
- **Get Consultation by ID**: `GET /consultations/:id`
- Admin can access any consultation details
- No access restrictions

## Test Collection Structure

### Setup (4 requests)
1. Login - Admin
2. Login - Doctor (For Test Data)
3. Login - Nurse (For Test Data)
4. Get Doctor's Consultations (For Test Data)

### System Health Monitoring (2 requests)
1. Get System Health - Admin (Success)
2. Get System Health - Doctor (Forbidden)

### Send Notifications (Admin Only) (3 requests)
1. Send Notification to Doctor - Admin (Success)
2. Send Notification to Nurse - Admin (Success)
3. Send Notification - Doctor (Forbidden)

### View All Notifications (1 request)
1. Get My Notifications - Admin (Success)

### View Unread Notifications (1 request)
1. Get Unread Notifications - Admin (Success)

### Get Unread Count (1 request)
1. Get Unread Count - Admin (Success)

### Mark Notification as Read (1 request)
1. Mark Notification as Read - Admin (Success)

### Mark All Notifications as Read (1 request)
1. Mark All Notifications as Read - Admin (Success)

### Delete Notification (Admin Only) (2 requests)
1. Delete Notification - Admin (Success)
2. Delete Notification - Doctor (Forbidden)

### Cancel Any Consultation (Admin) (2 requests)
1. Cancel Consultation - Admin (Success)
2. Cancel Already Cancelled Consultation - Admin (Bad Request)

### View Any Consultation (Admin) (1 request)
1. Get Consultation by ID - Admin (Success)

## Prerequisites

1. **Server Running**: Ensure the NestJS server is running on `http://localhost:3000`
   ```bash
   npm run start:dev
   ```

2. **Newman Installed**: Install Newman CLI for running Postman collections
   ```bash
   npm install -g newman
   ```

3. **Environment File**: Ensure `EAGLES_Local.postman_environment.json` exists with:
   - `baseUrl`: `http://localhost:3000`
   - Authentication tokens (will be set automatically during setup)

4. **Test Users**: Ensure the following users exist in the system:
   - Admin: `admin@eagles.com` / `Admin@123456`
   - Doctor: `doctor.nana@eagles.com` / `Doctor@123`
   - Nurse: `nurse.douala@eagles.com` / `Nurse@123`

5. **Test Data**: Ensure there are consultations in the system for testing cancellation functionality.

## Running Tests

### Automated Testing (PowerShell)

```powershell
.\test-admin-rbac.ps1
```

This script will:
1. Check if Newman is installed
2. Verify server is running
3. Run the Postman collection
4. Display test results

### Manual Testing (Postman)

1. **Import Collection**: Import `EAGLES_Admin_RBAC_Postman_Collection.json` into Postman
2. **Import Environment**: Import `EAGLES_Local.postman_environment.json`
3. **Run Collection**: Click "Run" and execute all requests

### Newman CLI (Manual)

```bash
newman run "EAGLES_Admin_RBAC_Postman_Collection.json" \
  -e "EAGLES_Local.postman_environment.json" \
  --reporters cli,json \
  --reporter-json-export "admin-rbac-test-results.json"
```

## Test Scenarios

### 1. System Health Monitoring
- ✅ Admin can access system health endpoint
- ❌ Non-admin users cannot access (403 Forbidden)
- ✅ Response includes status, database, timestamp, and uptime

### 2. Send Notifications
- ✅ Admin can send notifications to any user
- ❌ Non-admin users cannot send notifications (403 Forbidden)
- ✅ Notifications are created with correct type and content
- ✅ Notifications are initially unread

### 3. View Notifications
- ✅ Admin can view their own notifications
- ✅ Unread notifications are filtered correctly
- ✅ Unread count is accurate

### 4. Mark Notifications as Read
- ✅ Individual notifications can be marked as read
- ✅ All notifications can be marked as read at once
- ✅ Read timestamp is recorded

### 5. Delete Notifications
- ✅ Admin can delete any notification
- ❌ Non-admin users cannot delete notifications (403 Forbidden)

### 6. Cancel Consultations
- ✅ Admin can cancel any consultation
- ❌ Cannot cancel already cancelled consultations (400 Bad Request)
- ✅ Queue status is updated when consultation is cancelled

### 7. View Consultations
- ✅ Admin can view any consultation by ID
- ✅ No access restrictions for Admin

## Expected Test Results

### Success Criteria
- All setup requests return 200 OK
- System health endpoint returns health status
- Notifications can be sent, viewed, marked as read, and deleted
- Consultations can be cancelled by Admin
- Access control is enforced correctly (403 for non-admin users)

### Common Issues

1. **Server Not Running**
   - Error: `ECONNREFUSED 127.0.0.1:3000`
   - Solution: Start server with `npm run start:dev`

2. **Authentication Failures**
   - Error: `401 Unauthorized`
   - Solution: Verify user credentials in database

3. **Missing Test Data**
   - Error: Tests fail with "testConsultationId is not set"
   - Solution: Ensure there are consultations in the system. The setup will try to fetch doctor's consultations.

4. **No Consultations Available**
   - Error: `testConsultationId` is not set
   - Solution: Create test consultations first, or modify the test to create a consultation before cancellation tests

5. **Access Control Failures**
   - Error: Expected 403 but got 200
   - Solution: Verify RBAC guards are properly configured in the controllers

## Test Data

The collection uses dynamic test data:
- **Notification Types**: SYSTEM, ALERT, MESSAGE, REMINDER, APPOINTMENT
- **Consultation IDs**: Retrieved from doctor's consultations
- **User IDs**: Retrieved from login responses

## Environment Variables

The following variables are set automatically during test execution:
- `adminToken`: Admin authentication token
- `adminId`: Admin user ID
- `doctorToken`: Doctor authentication token
- `doctorId`: Doctor user ID
- `nurseToken`: Nurse authentication token
- `nurseId`: Nurse user ID
- `testConsultationId`: Consultation ID for testing
- `adminSentNotificationId`: Notification ID sent by Admin
- `adminSentNotificationId2`: Second notification ID sent by Admin

## API Endpoints Tested

- `GET /system/health` - Get system health (ADMIN only)
- `POST /notifications/send/:userId` - Send notification (ADMIN only)
- `GET /notifications/my` - Get my notifications
- `GET /notifications/my/unread` - Get unread notifications
- `GET /notifications/my/unread-count` - Get unread count
- `PATCH /notifications/:id/read` - Mark notification as read
- `PATCH /notifications/read-all` - Mark all notifications as read
- `DELETE /notifications/:id` - Delete notification (ADMIN only)
- `PATCH /consultations/:id/cancel` - Cancel consultation (ADMIN, DOCTOR, PRIMARY_SECRETARY)
- `GET /consultations/:id` - Get consultation by ID

## Security Tests

- ✅ Role-based access control enforced
- ✅ Admin-only endpoints return 403 for non-admin users
- ✅ Missing authentication returns 401 Unauthorized
- ✅ Admin can access any consultation
- ✅ Admin can send notifications to any user
- ✅ Admin can delete any notification

## Notes

- Tests are designed to run sequentially (dependencies between tests)
- Notification IDs are stored in environment after creation
- Consultation ID is retrieved from doctor's consultations during setup
- Some tests may require existing data in the system (consultations)
- Integration tests verify data consistency after operations

