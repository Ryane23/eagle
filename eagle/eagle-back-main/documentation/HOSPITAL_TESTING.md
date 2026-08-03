# Hospital/Center Management - Postman Testing Guide

## Setup

**Base URL**: `http://localhost:3000`

### Environment Variables
Create these variables in your Postman environment:
- `baseUrl`: `http://localhost:3000`
- `accessToken`: (will be auto-saved from login)
- `hospitalId`: (will be manually set for testing)

---

## Prerequisites

### 1. Login as Admin
Use the admin credentials to get an access token with permissions to create/update/delete hospitals.

**Endpoint**: `POST {{baseUrl}}/auth/login`

**Body** (raw JSON):
```json
{
  "email": "admin@eagles.com",
  "password": "Admin@123456"
}
```

**Tests** (add this to automatically save the token):
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("accessToken", response.accessToken);
}
```

---

## Hospital Management Endpoints

### 1. Create Hospital/Center (ADMIN Only)

**Endpoint**: `POST {{baseUrl}}/hospitals`

**Headers**:
- `Authorization`: `Bearer {{accessToken}}`

**Body** (raw JSON) - Create a SECONDARY Center:
```json
{
  "name": "Centre Secondaire de Garoua",
  "type": "SECONDARY",
  "address": "Avenue de la Réunification",
  "city": "Garoua",
  "country": "Cameroon",
  "contactPhone": "+237222999888",
  "contactEmail": "contact@eagles-garoua.cm",
  "code": "GRA",
  "capacity": 35
}
```

**Expected Response** (201 Created):
```json
{
  "id": "generated-id-here",
  "name": "Centre Secondaire de Garoua",
  "type": "SECONDARY",
  "address": "Avenue de la Réunification",
  "city": "Garoua",
  "country": "Cameroon",
  "contactPhone": "+237222999888",
  "contactEmail": "contact@eagles-garoua.cm",
  "code": "GRA",
  "capacity": 35,
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Tests**:
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("hospitalId", response.id);
}
```

**Test: Try Creating Another PRIMARY Center** (Should Fail):
```json
{
  "name": "Another Primary Center",
  "type": "PRIMARY",
  "address": "Test Address",
  "city": "Test City",
  "country": "Cameroon",
  "contactPhone": "+237222111222",
  "contactEmail": "test@eagles.cm"
}
```

**Expected Response** (409 Conflict):
```json
{
  "statusCode": 409,
  "message": "A PRIMARY center already exists. Only one PRIMARY center is allowed.",
  "error": "Conflict"
}
```

---

### 2. Get All Hospitals (ADMIN, PRIMARY_SECRETARY, DOCTOR)

**Endpoint**: `GET {{baseUrl}}/hospitals`

**Headers**:
- `Authorization`: `Bearer {{accessToken}}`

**Expected Response** (200 OK):
```json
[
  {
    "id": "hospital-id-1",
    "name": "Centre Principal de Yaoundé",
    "type": "PRIMARY",
    "address": "Boulevard du 20 Mai, Quartier Administratif",
    "city": "Yaoundé",
    "country": "Cameroon",
    "contactPhone": "+237222123456",
    "contactEmail": "contact@eagles-yaounde.cm",
    "code": "YDE",
    "isActive": true,
    "capacity": 50,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  },
  {
    "id": "hospital-id-2",
    "name": "Centre Secondaire de Douala",
    "type": "SECONDARY",
    ...
  }
]
```

**Test with Different Roles**:
- ✅ Admin login → Should work
- ✅ Primary Secretary login → Should work
- ✅ Doctor login → Should work
- ❌ Secondary Secretary login → Should return 403 Forbidden
- ❌ Nurse login → Should return 403 Forbidden

---

### 3. Get Hospital by ID (ADMIN, PRIMARY_SECRETARY, DOCTOR)

**Endpoint**: `GET {{baseUrl}}/hospitals/{{hospitalId}}`

**Headers**:
- `Authorization`: `Bearer {{accessToken}}`

**Expected Response** (200 OK):
```json
{
  "id": "{{hospitalId}}",
  "name": "Centre Secondaire de Garoua",
  "type": "SECONDARY",
  "address": "Avenue de la Réunification",
  "city": "Garoua",
  "country": "Cameroon",
  "contactPhone": "+237222999888",
  "contactEmail": "contact@eagles-garoua.cm",
  "code": "GRA",
  "capacity": 35,
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Test: Invalid ID** (404 Not Found):
```
GET {{baseUrl}}/hospitals/invalid-id-12345
```

**Expected Response**:
```json
{
  "statusCode": 404,
  "message": "Hospital with ID invalid-id-12345 not found",
  "error": "Not Found"
}
```

---

### 4. Get Hospitals by Type (ADMIN, PRIMARY_SECRETARY, DOCTOR)

**Endpoint**: `GET {{baseUrl}}/hospitals/type/SECONDARY`

**Headers**:
- `Authorization`: `Bearer {{accessToken}}`

**Expected Response** (200 OK):
```json
[
  {
    "id": "hospital-id-2",
    "name": "Centre Secondaire de Douala",
    "type": "SECONDARY",
    ...
  },
  {
    "id": "hospital-id-3",
    "name": "Centre Secondaire de Bafoussam",
    "type": "SECONDARY",
    ...
  }
]
```

**Test: Get PRIMARY Centers**:
```
GET {{baseUrl}}/hospitals/type/PRIMARY
```

**Expected Response**: Array with 1 PRIMARY center

---

### 5. Get PRIMARY Center (ADMIN, PRIMARY_SECRETARY, DOCTOR)

**Endpoint**: `GET {{baseUrl}}/hospitals/primary/center`

**Headers**:
- `Authorization`: `Bearer {{accessToken}}`

**Expected Response** (200 OK):
```json
{
  "id": "hospital-id-1",
  "name": "Centre Principal de Yaoundé",
  "type": "PRIMARY",
  "address": "Boulevard du 20 Mai, Quartier Administratif",
  "city": "Yaoundé",
  "country": "Cameroon",
  "contactPhone": "+237222123456",
  "contactEmail": "contact@eagles-yaounde.cm",
  "code": "YDE",
  "isActive": true,
  "capacity": 50,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

---

### 6. Update Hospital (ADMIN Only)

**Endpoint**: `PATCH {{baseUrl}}/hospitals/{{hospitalId}}`

**Headers**:
- `Authorization`: `Bearer {{accessToken}}`

**Body** (raw JSON):
```json
{
  "name": "Centre Secondaire de Garoua - Mise à jour",
  "contactPhone": "+237222999999",
  "capacity": 40
}
```

**Expected Response** (200 OK):
```json
{
  "id": "{{hospitalId}}",
  "name": "Centre Secondaire de Garoua - Mise à jour",
  "type": "SECONDARY",
  "address": "Avenue de la Réunification",
  "city": "Garoua",
  "country": "Cameroon",
  "contactPhone": "+237222999999",
  "contactEmail": "contact@eagles-garoua.cm",
  "code": "GRA",
  "capacity": 40,
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

**Test: Try Changing Type to PRIMARY** (Should Fail):
```json
{
  "type": "PRIMARY"
}
```

**Expected Response** (409 Conflict):
```json
{
  "statusCode": 409,
  "message": "A PRIMARY center already exists. Only one PRIMARY center is allowed.",
  "error": "Conflict"
}
```

**Test: Non-Admin User** (403 Forbidden):
Login as Primary Secretary or Doctor, then try to update → Should return 403

---

### 7. Activate Hospital (ADMIN Only)

**Endpoint**: `PATCH {{baseUrl}}/hospitals/{{hospitalId}}/activate`

**Headers**:
- `Authorization`: `Bearer {{accessToken}}`

**Expected Response** (200 OK):
```json
{
  "id": "{{hospitalId}}",
  "name": "Centre Secondaire de Garoua - Mise à jour",
  "isActive": true,
  ...
}
```

---

### 8. Deactivate Hospital (ADMIN Only)

**Endpoint**: `PATCH {{baseUrl}}/hospitals/{{hospitalId}}/deactivate`

**Headers**:
- `Authorization`: `Bearer {{accessToken}}`

**Expected Response** (200 OK):
```json
{
  "id": "{{hospitalId}}",
  "name": "Centre Secondaire de Garoua - Mise à jour",
  "isActive": false,
  ...
}
```

**Test: Deactivate PRIMARY Center** (Should Fail):
First get PRIMARY center ID, then try:
```
PATCH {{baseUrl}}/hospitals/{primary-center-id}/deactivate
```

**Expected Response** (400 Bad Request):
```json
{
  "statusCode": 400,
  "message": "Cannot deactivate the PRIMARY center",
  "error": "Bad Request"
}
```

---

### 9. Delete Hospital (ADMIN Only)

**Endpoint**: `DELETE {{baseUrl}}/hospitals/{{hospitalId}}`

**Headers**:
- `Authorization`: `Bearer {{accessToken}}`

**Expected Response** (204 No Content):
- Empty response body

**Test: Delete PRIMARY Center** (Should Fail):
```
DELETE {{baseUrl}}/hospitals/{primary-center-id}
```

**Expected Response** (400 Bad Request):
```json
{
  "statusCode": 400,
  "message": "Cannot delete the PRIMARY center",
  "error": "Bad Request"
}
```

**Test: Non-Admin User** (403 Forbidden):
Login as any other role → Should return 403

---

## Role-Based Access Testing Matrix

| Endpoint | Admin | Primary Secretary | Secondary Secretary | Nurse | Doctor |
|----------|-------|-------------------|---------------------|-------|--------|
| POST /hospitals | ✅ | ❌ 403 | ❌ 403 | ❌ 403 | ❌ 403 |
| GET /hospitals | ✅ | ✅ | ❌ 403 | ❌ 403 | ✅ |
| GET /hospitals/:id | ✅ | ✅ | ❌ 403 | ❌ 403 | ✅ |
| GET /hospitals/type/:type | ✅ | ✅ | ❌ 403 | ❌ 403 | ✅ |
| GET /hospitals/primary/center | ✅ | ✅ | ❌ 403 | ❌ 403 | ✅ |
| PATCH /hospitals/:id | ✅ | ❌ 403 | ❌ 403 | ❌ 403 | ❌ 403 |
| PATCH /hospitals/:id/activate | ✅ | ❌ 403 | ❌ 403 | ❌ 403 | ❌ 403 |
| PATCH /hospitals/:id/deactivate | ✅ | ❌ 403 | ❌ 403 | ❌ 403 | ❌ 403 |
| DELETE /hospitals/:id | ✅ | ❌ 403 | ❌ 403 | ❌ 403 | ❌ 403 |

---

## Business Rules Validation Checklist

- [ ] ✅ Only 1 PRIMARY center can exist (test creating 2nd PRIMARY)
- [ ] ✅ Cannot deactivate PRIMARY center
- [ ] ✅ Cannot delete PRIMARY center
- [ ] ✅ Cannot change type from/to PRIMARY if another PRIMARY exists
- [ ] ✅ ADMIN has full CRUD access
- [ ] ✅ PRIMARY_SECRETARY can only read
- [ ] ✅ DOCTOR can only read
- [ ] ✅ SECONDARY_SECRETARY has no access
- [ ] ✅ NURSE has no access
- [ ] ✅ All required fields validated (name, type, address, city, country, contactPhone, contactEmail)

---

## Testing Order

1. **Login as Admin** → Save access token
2. **Create a new SECONDARY hospital** → Save hospital ID
3. **Get all hospitals** → Verify new hospital appears
4. **Get hospital by ID** → Verify details
5. **Get hospitals by type** → Verify filtering works
6. **Get PRIMARY center** → Verify only 1 PRIMARY exists
7. **Update hospital** → Verify changes applied
8. **Deactivate hospital** → Verify isActive = false
9. **Activate hospital** → Verify isActive = true
10. **Try creating 2nd PRIMARY** → Should fail (409)
11. **Try deactivating PRIMARY** → Should fail (400)
12. **Delete hospital** → Verify deletion
13. **Try deleting PRIMARY** → Should fail (400)
14. **Test with other roles** → Verify access control

---

## Common Errors

| Status Code | Error | Possible Causes |
|-------------|-------|-----------------|
| 400 | Bad Request | Invalid data, business rule violation |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions for role |
| 404 | Not Found | Hospital ID doesn't exist |
| 409 | Conflict | PRIMARY center already exists |

---

## Notes

- Remember to login before testing endpoints
- Replace `{{hospitalId}}` with actual hospital ID from responses
- Test both success and failure scenarios
- Verify business rules are enforced
- Test with all 5 user roles to confirm access control
