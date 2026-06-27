# Files Module - Testing Guide

## Overview

This guide covers testing for the **Files Module - Document Upload System**, which provides file upload and management functionality integrated with Firebase Storage.

## Module Components

### 📋 File Entity (`src/modules/files/entities/file.entity.ts`)

**Fields:**
- `id`: Unique file identifier
- `fileName`: Generated unique filename (UUID + extension)
- `originalName`: Original filename from upload
- `mimeType`: File MIME type
- `size`: File size in bytes
- `url`: Public Firebase Storage URL
- `uploadedBy`: User ID who uploaded the file
- `relatedEntityType`: Entity type (`urgency`, `patient`, `consultation`, `prescription`, `other`)
- `relatedEntityId`: ID of related entity
- `isActive`: Soft delete flag
- `createdAt`: Upload timestamp
- `updatedAt`: Last update timestamp

### 🔧 Endpoints

#### 1. Upload File
- **Endpoint**: `POST /files/upload`
- **Access**: All authenticated users
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `file` (required): File to upload
  - `relatedEntityType` (optional): Entity type
  - `relatedEntityId` (optional): Entity ID

#### 2. Get File by ID
- **Endpoint**: `GET /files/:id`
- **Access**: All authenticated users
- **Returns**: File metadata

#### 3. Get Files by Related Entity
- **Endpoint**: `GET /files/entity/:entityType/:entityId`
- **Access**: All authenticated users
- **Returns**: Array of files linked to entity

#### 4. Get My Uploaded Files
- **Endpoint**: `GET /files/my`
- **Access**: All authenticated users
- **Returns**: Array of files uploaded by current user

#### 5. Delete File
- **Endpoint**: `DELETE /files/:id`
- **Access**: Owner or ADMIN
- **Returns**: 204 No Content
- **Note**: Soft delete (sets `isActive: false`)

### 🔍 Related Entity Types

- `urgency`: Files related to urgency requests
- `patient`: Files related to patients
- `consultation`: Files related to consultations
- `prescription`: Files related to prescriptions
- `other`: General files

---

## Prerequisites

1. **Server Running**: `npm run start:dev`
2. **Firebase Storage Configured**: Firebase Storage bucket must be accessible
3. **Test Files**: Create test files using `.\create-test-files.ps1`
4. **Newman Installed**: `npm install -g newman` (for automated testing)

---

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@eagles.com | Admin@123456 |
| Secondary Secretary | secretary.douala@eagles.com | Douala@123 |
| Doctor | doctor.nana@eagles.com | Doctor@123 |

---

## Test Scenarios

### ✅ File Upload Tests

#### 1. **Upload File - Without Related Entity**
- **Role**: ADMIN
- **Expected**: 201 Created
- **Verification**:
  - File metadata saved
  - Unique filename generated
  - URL generated
  - `relatedEntityType` is null or 'other'

#### 2. **Upload File - For Patient**
- **Role**: SECONDARY_SECRETARY
- **Expected**: 201 Created
- **Verification**:
  - File linked to patient (`relatedEntityType: "patient"`)
  - `relatedEntityId` matches patient ID

#### 3. **Upload File - For Urgency**
- **Role**: SECONDARY_SECRETARY
- **Expected**: 201 Created
- **Verification**: File linked to urgency

#### 4. **Upload File - For Consultation**
- **Role**: DOCTOR
- **Expected**: 201 Created
- **Verification**: File linked to consultation

#### 5. **Upload File - For Prescription**
- **Role**: DOCTOR
- **Expected**: 201 Created
- **Verification**: File linked to prescription

#### 6. **Upload File - No File (Error)**
- **Role**: ADMIN
- **Expected**: 400 Bad Request
- **Error**: "No file provided"

#### 7. **Upload File - Unauthorized**
- **Role**: None (no token)
- **Expected**: 401 Unauthorized

---

### ✅ File Retrieval Tests

#### 1. **Get File by ID - Success**
- **Role**: ADMIN
- **Expected**: 200 OK
- **Verification**: All file fields present

#### 2. **Get File by ID - Not Found**
- **Role**: ADMIN
- **Expected**: 404 Not Found

#### 3. **Get Files by Related Entity - Patient**
- **Role**: ADMIN
- **Expected**: 200 OK
- **Verification**: Returns array of files linked to patient

#### 4. **Get Files by Related Entity - Urgency**
- **Role**: ADMIN
- **Expected**: 200 OK
- **Verification**: Returns array of files linked to urgency

#### 5. **Get My Uploaded Files**
- **Role**: ADMIN
- **Expected**: 200 OK
- **Verification**: Returns only files uploaded by current user

#### 6. **Get My Uploaded Files - Secondary Secretary**
- **Role**: SECONDARY_SECRETARY
- **Expected**: 200 OK
- **Verification**: Returns only secretary's files

---

### ✅ File Deletion Tests

#### 1. **Delete File - Success**
- **Role**: ADMIN
- **Expected**: 204 No Content
- **Verification**: File soft deleted (not found on subsequent GET)

#### 2. **Delete File - Not Found**
- **Role**: ADMIN
- **Expected**: 404 Not Found

#### 3. **Delete File - Unauthorized**
- **Role**: None (no token)
- **Expected**: 401 Unauthorized

---

### ✅ Integration Tests

#### 1. **Upload Then Retrieve File**
- **Steps**:
  1. Upload file
  2. Retrieve file by ID
- **Expected**: File can be retrieved with same metadata

#### 2. **Verify File URL is Accessible**
- **Expected**: File URL points to Firebase Storage
- **Verification**: URL format is correct

---

## Running Tests

### Step 1: Create Test Files

```powershell
# Create test files for upload testing
.\create-test-files.ps1
```

This creates test files in the `test-files/` directory.

### Step 2: Update Postman Collection

**Important**: Postman collections cannot embed files directly. You need to:

1. Open the collection in Postman
2. For each file upload request, manually select a file:
   - Go to the request
   - In the Body tab, select "form-data"
   - Click "Select Files" next to the `file` field
   - Choose a file from `test-files/` directory

**OR** use the Postman Collection Runner:
- Postman will prompt you to select files for each upload request

### Step 3: Run Tests

```powershell
# Run the PowerShell test script
.\test-files-module.ps1
```

**OR** run Newman directly:

```powershell
newman run "EAGLES_Files_Module_Postman_Collection.json" -e "EAGLES_Local.postman_environment.json" --reporters cli
```

### Manual Testing with Postman

1. **Import Collection**:
   - Import `EAGLES_Files_Module_Postman_Collection.json`
   - Import `EAGLES_Local.postman_environment.json`

2. **Select Files**:
   - For each upload request, select a test file manually

3. **Run Collection**:
   - Select the collection
   - Click "Run"
   - Review test results

### Manual Testing with cURL

#### Upload File
```bash
curl -X POST http://localhost:3000/files/upload \
  -H "Authorization: Bearer {token}" \
  -F "file=@test-files/test-document.txt" \
  -F "relatedEntityType=patient" \
  -F "relatedEntityId={patientId}"
```

#### Get File by ID
```bash
curl -X GET http://localhost:3000/files/{fileId} \
  -H "Authorization: Bearer {token}"
```

#### Get Files by Entity
```bash
curl -X GET http://localhost:3000/files/entity/patient/{patientId} \
  -H "Authorization: Bearer {token}"
```

#### Get My Files
```bash
curl -X GET http://localhost:3000/files/my \
  -H "Authorization: Bearer {token}"
```

#### Delete File
```bash
curl -X DELETE http://localhost:3000/files/{fileId} \
  -H "Authorization: Bearer {token}"
```

---

## Expected Test Results

### ✅ Success Criteria

- **File Upload**: Files uploaded successfully with metadata
- **Unique Filenames**: Each file gets unique UUID-based filename
- **Entity Linking**: Files correctly linked to entities
- **File Retrieval**: Files can be retrieved by ID, entity, or uploader
- **Soft Delete**: Deleted files marked as inactive, not found on GET
- **Access Control**: Authentication required for all operations
- **URL Generation**: Valid Firebase Storage URLs generated

### 📊 Test Coverage

- **Total Requests**: ~20
- **Test Categories**:
  - Setup (4 requests)
  - File Upload Tests (7 requests)
  - File Retrieval Tests (6 requests)
  - File Deletion Tests (3 requests)
  - Integration Tests (2 requests)

---

## Troubleshooting

### Issue: "No file provided" (400)
**Solution**: Ensure file is selected in Postman form-data body

### Issue: "File with ID {id} not found" (404)
**Possible Causes**:
- File was deleted
- File ID is incorrect
- File is soft deleted (`isActive: false`)

**Solution**: Verify file exists and is active

### Issue: Firebase Storage errors
**Possible Causes**:
- Firebase Storage not configured
- Invalid Firebase credentials
- Storage bucket permissions

**Solution**: 
- Check Firebase configuration in `.env`
- Verify Storage bucket exists and is accessible
- Check server logs for detailed errors

### Issue: File URL not accessible
**Possible Causes**:
- File not made public
- Storage bucket permissions
- Network issues

**Solution**: 
- Verify `makePublic()` is called in service
- Check Firebase Storage bucket settings
- Test URL directly in browser

### Issue: Files not appearing in "Get My Files"
**Possible Causes**:
- Wrong user ID
- Files soft deleted
- Query filter issue

**Solution**: 
- Verify `uploadedBy` matches current user ID
- Check if files are active (`isActive: true`)

---

## Security Considerations

1. **Authentication Required**: All endpoints require valid JWT token
2. **File Access**: Files are publicly accessible via generated URLs
3. **Soft Delete**: Files are soft deleted, not permanently removed
4. **File Size Limits**: Consider implementing file size limits in production
5. **File Type Validation**: Consider restricting allowed file types
6. **Storage Quotas**: Monitor Firebase Storage usage

---

## Firebase Storage Structure

Files are stored in the following structure:

```
files/
  ├── urgency/
  │   └── {uuid}.{ext}
  ├── patient/
  │   └── {uuid}.{ext}
  ├── consultation/
  │   └── {uuid}.{ext}
  ├── prescription/
  │   └── {uuid}.{ext}
  └── other/
      └── {uuid}.{ext}
```

---

## Related Documentation

- [Files Controller](../src/modules/files/files.controller.ts)
- [Files Service](../src/modules/files/files.service.ts)
- [Files Repository](../src/modules/files/files.repository.ts)
- [File Entity](../src/modules/files/entities/file.entity.ts)
- [Upload File DTO](../src/modules/files/dto/upload-file.dto.ts)

---

**Last Updated**: 2025-01-XX
**Test Suite Version**: 1.0.0

