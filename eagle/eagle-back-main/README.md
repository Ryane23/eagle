# EAGLES Teleconsultation Backend

A secure, HIPAA-compliant healthcare teleconsultation platform built with NestJS and Firebase/Firestore. This backend system provides comprehensive patient management, real-time consultations, encrypted health records, and queue management for healthcare providers.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Module Overview](#module-overview)
- [Security Implementation](#security-implementation)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Deployment](#deployment)

---

## ✨ Features

- 🔐 **Secure Authentication** - Token-based authentication with refresh tokens
- 👥 **Role-Based Access Control** - Admin, Doctor, Patient, and Nurse roles
- 🏥 **Patient Management** - Complete patient record system with encrypted health data
- 💬 **Real-Time Messaging** - WebSocket-based chat for consultations
- 📹 **Multi-Channel Consultations** - Support for Video, Audio, and Chat consultations
- 🔒 **AES-256 Encryption** - End-to-end encryption for sensitive health information
- 📊 **Queue Management** - Smart patient queue with priority levels
- ⚕️ **Specialty Management** - Medical specialty categorization
- 🔔 **Notifications System** - Real-time user notifications
- 📝 **Follow-up Tracking** - Appointment and follow-up management
- 🚨 **Urgency Triage** - Emergency case prioritization

---

## 🛠️ Tech Stack

- **Framework:** [NestJS](https://nestjs.com/) 11.x
- **Language:** TypeScript 5.x
- **Database:** Firebase Firestore
- **Authentication:** Firebase Admin SDK + JWT
- **Encryption:** AES-256-CBC (Node.js Crypto)
- **Runtime:** Node.js 22.x
- **Testing:** Jest
- **Code Quality:** ESLint + Prettier

---

## 📁 Project Structure

```
src
├── app.module.ts
├── main.ts
├── common
│   ├── decorators
│   ├── dtos
│   ├── exceptions
│   ├── filters
│   ├── guards
│   ├── interceptors
│   └── pipes
├── auth
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── jwt.strategy.ts
│   └── local.strategy.ts
├── users
│   ├── users.controller.ts
│   ├── users.module.ts
│   ├── users.service.ts
│   └── entities
├── patients
│   ├── patients.controller.ts
│   ├── patients.module.ts
│   ├── patients.service.ts
│   └── entities
├── doctors
│   ├── doctors.controller.ts
│   ├── doctors.module.ts
│   ├── doctors.service.ts
│   └── entities
├── nurses
│   ├── nurses.controller.ts
│   ├── nurses.module.ts
│   ├── nurses.service.ts
│   └── entities
├── specialties
│   ├── specialties.controller.ts
│   ├── specialties.module.ts
│   ├── specialties.service.ts
│   └── entities
├── appointments
│   ├── appointments.controller.ts
│   ├── appointments.module.ts
│   ├── appointments.service.ts
│   └── entities
├── follow-ups
│   ├── follow-ups.controller.ts
│   ├── follow-ups.module.ts
│   ├── follow-ups.service.ts
│   └── entities
├── notifications
│   ├── notifications.controller.ts
│   ├── notifications.module.ts
│   ├── notifications.service.ts
│   └── entities
├── messages
│   ├── messages.controller.ts
│   ├── messages.module.ts
│   ├── messages.service.ts
│   └── entities
├── queues
│   ├── queues.controller.ts
│   ├── queues.module.ts
│   ├── queues.service.ts
│   └── entities
├── encryption
│   ├── encryption.service.ts
│   └── interfaces
└── health
    ├── health.controller.ts
    ├── health.module.ts
    └── health.service.ts
```

---

## ⚙️ Configuration

Configuration is managed via environment variables. Duplicate the `.env.example` file to `.env` and update the values accordingly.

Key configuration options include:

- `PORT`: The port the application will run on.
- `JWT_SECRET`: Secret key for JWT authentication.
- `FIREBASE_PROJECT_ID`: Firebase project ID.
- `FIREBASE_PRIVATE_KEY`: Firebase private key.
- `FIREBASE_CLIENT_EMAIL`: Firebase client email.
- `AES_KEY`: Key for AES encryption (32 bytes for AES-256).

---

## 📦 Installation

Install the dependencies:

```bash
npm install
```

---

## ▶️ Running the Application

To run the application, use the following command:

```bash
npm run start:dev
```

This will start the application in development mode. For production, use `npm run start:prod`.

---

## 📜 Module Overview

### Auth Module

Handles user authentication and authorization.

- **Controller:** `auth.controller.ts`
- **Service:** `auth.service.ts`
- **Strategies:** `jwt.strategy.ts`, `local.strategy.ts`

### Users Module

Manages user data and roles.

- **Controller:** `users.controller.ts`
- **Service:** `users.service.ts`
- **Entities:** `entities` folder

### Patients Module

Manages patient data and records.

- **Controller:** `patients.controller.ts`
- **Service:** `patients.service.ts`
- **Entities:** `entities` folder

### Doctors Module

Manages doctor data and records.

- **Controller:** `doctors.controller.ts`
- **Service:** `doctors.service.ts`
- **Entities:** `entities` folder

### Nurses Module

Manages nurse data and records.

- **Controller:** `nurses.controller.ts`
- **Service:** `nurses.service.ts`
- **Entities:** `entities` folder

### Specialties Module

Manages medical specialties.

- **Controller:** `specialties.controller.ts`
- **Service:** `specialties.service.ts`
- **Entities:** `entities` folder

### Appointments Module

Manages patient appointments.

- **Controller:** `appointments.controller.ts`
- **Service:** `appointments.service.ts`
- **Entities:** `entities` folder

### Follow-ups Module

Manages follow-up appointments and tracking.

- **Controller:** `follow-ups.controller.ts`
- **Service:** `follow-ups.service.ts`
- **Entities:** `entities` folder

### Notifications Module

Manages user notifications.

- **Controller:** `notifications.controller.ts`
- **Service:** `notifications.service.ts`
- **Entities:** `entities` folder

### Messages Module

Manages real-time messages and chat.

- **Controller:** `messages.controller.ts`
- **Service:** `messages.service.ts`
- **Entities:** `entities` folder

### Queues Module

Manages patient queues and triage.

- **Controller:** `queues.controller.ts`
- **Service:** `queues.service.ts`
- **Entities:** `entities` folder

### Encryption Module

Handles encryption and decryption of sensitive data.

- **Service:** `encryption.service.ts`
- **Interfaces:** `interfaces` folder

### Health Module

Checks application health and readiness.

- **Controller:** `health.controller.ts`
- **Service:** `health.service.ts`

---

## 🔒 Security Implementation

The application implements several security measures:

- **Authentication:** JWT-based authentication with refresh tokens.
- **Authorization:** Role-based access control (RBAC) for different user roles.
- **Data Encryption:** AES-256 encryption for sensitive data at rest and in transit.
- **Input Validation:** Strict validation of incoming data using class-validator.
- **Error Handling:** Centralized error handling with user-friendly messages.

---

## 📡 API Endpoints

API endpoints are organized by module. Each module has its own set of endpoints for managing resources.

Example endpoints:

- `POST /auth/login`: User login
- `GET /users`: Get all users (Admin only)
- `POST /patients`: Create a new patient record
- `GET /appointments`: Get all appointments for a patient
- `POST /messages`: Send a new message in a consultation
- `PATCH /queues/:id`: Update a patient's queue status

Refer to the [OpenAPI specification](openapi.yaml) for the complete API documentation.

---

## 🧪 Testing

The application uses Jest for testing. To run the tests, use the following command:

```bash
npm run test
```

For test coverage, use:

```bash
npm run test:cov
```

---

## 🚀 Deployment

For deployment, the following steps are recommended:

1. Set up a production database in Firebase.
2. Configure environment variables for production.
3. Build the application:

   ```bash
   npm run build
   ```

4. Deploy the application using a Node.js hosting service (e.g., Heroku, AWS, DigitalOcean).

Refer to the [NestJS deployment guide](https://docs.nestjs.com/cli/overview#deploying-your-application) for detailed instructions.

---

## 📚 Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Firebase Firestore Documentation](https://firebase.google.com/docs/firestore)
- [JWT Documentation](https://jwt.io/introduction/)
- [AES Encryption Documentation](https://www.owasp.org/index.php/Category:Cryptography)
- [OpenAPI Specification](https://swagger.io/specification/)

---

## 📅 Changelog

### 1.0.0

- Initial release of EAGLES Teleconsultation Backend.
- Implemented core features: authentication, user management, patient management, and real-time messaging.
- Set up testing and basic deployment instructions.

### 1.1.0

- Added appointment and follow-up management.
- Improved security with role-based access control and data encryption.
- Enhanced documentation and API specifications.

### 1.2.0

- Integrated video and audio consultation support.
- Added notifications system and queue management.
- Updated dependencies and improved code quality.

### 1.3.0

- Major refactor of the codebase for better maintainability.
- Improved error handling and input validation.
- Enhanced testing coverage and CI/CD integration.

### 1.4.0

- Added support for multiple languages and localization.
- Improved performance and reduced response times.
- Enhanced security measures and compliance with HIPAA guidelines.

### 1.5.0

- Integrated with external healthcare APIs for better patient data management.
- Added analytics and reporting features for healthcare providers.
- Improved deployment process and documentation.

---

## Default Credentials

For initial setup and testing, the following default credentials are provided:

👤 Admin:
   Email: admin@eagles.com
   Password: Admin@123456

👤 Primary Secretary:
   Email: secretary.primary@eagles.com
   Password: Primary@123

👤 Secondary Secretary (Douala):
   Email: secretary.douala@eagles.com
   Password: Douala@123

👤 Nurse (Douala):
   Email: nurse.douala@eagles.com
   Password: Nurse@123

👤 Doctor:
   Email: doctor.nana@eagles.com
   Password: Doctor@123

---
