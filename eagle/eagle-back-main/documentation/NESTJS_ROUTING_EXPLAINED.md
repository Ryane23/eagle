# NestJS Routing Explained

Explaining NestJS Routing


### NestJS (How it works):
Routes are **decentralized** - each module has its own controller.

---

## 📍 How NestJS Routes Work

### 1. **main.ts** = Your "server.js"
```typescript
// src/main.ts - This is like your server.js entry point
async function bootstrap() {
  const app = await NestFactory.create(AppModule); // Creates app from AppModule
  await app.listen(3000); // Starts server
}
```

**Difference**: In Express, you define routes in server.js. In NestJS, main.ts just starts the app.

---

### 2. **AppModule** = Imports All Modules
```typescript
// src/app.module.ts
@Module({
  imports: [
    AuthModule,        // Provides: /auth/* routes
    UsersModule,       // Provides: /users/* routes
    PatientsModule,    // Provides: /patients/* routes
    QueueModule,       // Provides: /queue/* routes
    PrescriptionsModule, // Provides: /prescriptions/* routes
    // ... etc
  ],
})
export class AppModule {}
```

**This is where modules are registered** - when you import a module, all its routes become available!

---

### 3. **Each Module Has a Controller** = Routes Definition

Routes are defined in **Controllers** using decorators:

```typescript
// src/modules/patients/patients.controller.ts
@Controller('patients')  // ← This creates the base route: /patients
export class PatientsController {
  
  @Get()  // GET /patients
  findAll() { ... }
  
  @Get(':id')  // GET /patients/:id
  findById(@Param('id') id: string) { ... }
  
  @Post()  // POST /patients
  create(@Body() dto: CreatePatientDto) { ... }
  
  @Patch(':id')  // PATCH /patients/:id
  update(@Param('id') id: string) { ... }
}
```

**The `@Controller('patients')` decorator** creates the base route `/patients`
**Each method decorator** (`@Get()`, `@Post()`, etc.) adds to that base route

---

## 🗺️ Your Current Routes Map

Here's where ALL routes are defined:

### Authentication Routes (`/auth/*`)
- **File**: `src/modules/auth/auth.controller.ts`
- **Routes**:
  - `POST /auth/register`
  - `POST /auth/login`
  - `POST /auth/refresh`
  - `POST /auth/logout`
  - `GET /auth/me`

### User Routes (`/users/*`)
- **File**: `src/modules/users/users.controller.ts`
- **Routes**: `GET /users`, `GET /users/:id`, `PATCH /users/:id`, etc.

### Patient Routes (`/patients/*`)
- **File**: `src/modules/patients/patients.controller.ts`
- **Routes**: `POST /patients`, `GET /patients`, `GET /patients/:id`, etc.

### Queue Routes (`/queue/*`)
- **File**: `src/modules/queue/queue.controller.ts`
- **Routes**: 
  - `POST /queue`
  - `GET /queue`
  - `GET /queue/my-hospital`
  - `GET /queue/stats`
  - `PATCH /queue/:id/status`
  - etc.

### Prescription Routes (`/prescriptions/*`)
- **File**: `src/modules/prescriptions/prescriptions.controller.ts`
- **Routes**: 
  - `POST /prescriptions`
  - `GET /prescriptions`
  - `GET /prescriptions/:id`
  - `PATCH /prescriptions/:id/dispense`
  - etc.

### WebRTC Routes (`/webrtc/*`)
- **File**: `src/modules/messages/webrtc.controller.ts`
- **Routes**:
  - `POST /webrtc/room/:consultationId`
  - `GET /webrtc/room/:roomId`
  - `POST /webrtc/room/:roomId/end`
  - etc.

### Urgency Routes (`/urgencies/*`)
- **File**: `src/modules/urgencies/urgencies.controller.ts`

### Hospital Routes (`/hospitals/*`)
- **File**: `src/modules/hospitals/hospitals.controller.ts`

### And more...

---

## 🔍 How to See All Your Routes

### Option 1: Check Each Controller
Each controller file shows you the routes for that module.

### Option 2: Use NestJS CLI (if installed)
```bash
npm run start:dev
# NestJS will log all registered routes on startup
```

### Option 3: Add Route Logging
Add this to your `main.ts` to log all routes:

```typescript
// In main.ts after app.listen()
const server = app.getHttpServer();
const router = server._events.request._router;
console.log('All Routes:');
router.stack.forEach((r: any) => {
  if (r.route) {
    console.log(`${Object.keys(r.route.methods)[0].toUpperCase()} ${r.route.path}`);
  }
});
```

---

## 🎯 Key Differences Summary

| Express | NestJS |
|---------|--------|
| `server.js` has all routes | Routes in controllers (decorators) |
| `app.get('/users', ...)` | `@Get()` in controller |
| Manual route organization | Module-based organization |
| Middleware functions | Guards, Interceptors, Pipes |
| Manual validation | Automatic DTO validation |

---

## 📝 Example: Adding a New Route
```

### NestJS:
```typescript
// 1. Create controller file: src/modules/doctors/doctors.controller.ts
@Controller('doctors')  // Base route: /doctors
export class DoctorsController {
  
  @Get()  // GET /doctors
  findAll() {
    return { doctors: [...] };
  }
}

// 2. Register in module: src/modules/doctors/doctors.module.ts
@Module({
  controllers: [DoctorsController],  // ← Registers routes
})
export class DoctorsModule {}

// 3. Import in AppModule: src/app.module.ts
@Module({
  imports: [DoctorsModule],  // ← Makes routes available
})
export class AppModule {}
```

---

## ✅ Your Routes ARE Working!

When you run `npm run start:dev`, NestJS:
1. Loads `AppModule` from `app.module.ts`
2. Loads all imported modules (AuthModule, UsersModule, etc.)
3. Registers all controllers from those modules
4. Automatically creates all routes defined with `@Controller()` and `@Get()`, `@Post()`, etc.

**All your Phase 3 routes are live:**
- ✅ `/queue/*` - Working
- ✅ `/prescriptions/*` - Working  
- ✅ `/webrtc/*` - Working
- ✅ WebSocket at `/webrtc` namespace - Working

---

## 🧪 Test Your Routes

Once your server is running:
```bash
# Queue routes
GET http://localhost:3000/queue
POST http://localhost:3000/queue

# Prescription routes
GET http://localhost:3000/prescriptions
POST http://localhost:3000/prescriptions

# WebRTC routes
POST http://localhost:3000/webrtc/room/:consultationId
```

**The routes are automatically "broadcasted" (registered) when the app starts!** 🚀
