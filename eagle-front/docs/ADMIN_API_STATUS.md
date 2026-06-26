# Admin Dashboard - API Integration Status

This document explains the current state of API integration for all admin dashboard pages, and why some pages still use mock/static data.

---

## ✅ Fully Connected Pages

These pages are connected to real API endpoints and will fetch/mutate data from the backend:

| Page | Route | API Endpoints Used | Store |
|------|-------|-------------------|-------|
| **Dashboard** | `/admin` | `GET /analytics/network`, `GET /system/health` | `analytics-store` |
| **Users** | `/admin/users` | `GET/POST/PATCH/DELETE /users`, `POST /auth/register` | `users-store` |
| **Hospitals/Centers** | `/admin/hospitals` | `GET/POST/PATCH/DELETE /hospitals` | `hospitals-store` |
| **Incidents** | `/admin/incidents` | `GET/POST/PATCH/DELETE /complaints` | `complaints-store` |
| **Supervision** | `/admin/supervision` | `GET /analytics/network`, `GET /system/health` | `analytics-store` |

---

## ⚠️ Partially Connected / Mock Data Pages

These pages have stores and hooks ready, but use mock data because the backend API doesn't provide all necessary endpoints:

### `/admin/rules` - Operational Rules Configuration

**What's available in API:**
- `GET/PATCH /system/settings` - Basic system settings (maintenance mode, consultation duration, file limits)

**What's NOT available in API:**
- Urgency level configuration (max wait times, notification triggers)
- Patient distribution algorithms
- Bandwidth thresholds
- Delay alert configuration
- Rule simulation engine
- Configuration history/versioning
- Scheduled configuration changes

**Reason:** The Swagger API only exposes basic system settings. Advanced rule configuration (urgency levels, distribution algorithms, simulation) would require additional backend development.

---

### `/admin/supervision` - Technical Monitoring

**What's available in API:**
- Network analytics (center stats, active users)
- System health status

**What's NOT available in API:**
- Real-time CPU/Memory/Disk metrics
- Bandwidth monitoring
- Backup management endpoints
- Maintenance scheduling

**Reason:** Real-time infrastructure monitoring typically requires dedicated monitoring tools (Prometheus, Grafana, etc.) or a separate monitoring microservice. The current API focuses on business metrics, not infrastructure metrics.

---

## ❌ Pages Without API Endpoints

These pages have no corresponding API endpoints in the provided Swagger documentation:

### `/admin/permissions` - Permission Matrix

**Required Endpoints (not in API):**
```
GET    /permissions                    - List all permissions
GET    /permissions/matrix             - Get role-permission matrix
PATCH  /permissions/role/:roleId       - Update permissions for a role
POST   /permissions/custom/:userId     - Add custom permission for user
GET    /permissions/anomalies          - Detect permission inconsistencies
GET    /permissions/requests           - List pending permission requests
POST   /permissions/requests/:id/approve
POST   /permissions/requests/:id/reject
```

**Reason:** Permission management is typically handled at the authentication/authorization service level. The API may use a third-party service (e.g., Auth0, Keycloak) or the permission logic may be hardcoded in the backend.

---

### `/admin/rbac` - Role Hierarchy Management

**Required Endpoints (not in API):**
```
GET    /roles                          - List all roles with hierarchy
POST   /roles                          - Create new role
PATCH  /roles/:id                      - Update role
DELETE /roles/:id                      - Delete role
GET    /roles/:id/permissions          - Get role permissions
PATCH  /roles/:id/permissions          - Update role permissions
GET    /roles/audit                    - Get RBAC audit log
POST   /roles/test-access              - Test permission for user/role
```

**Reason:** RBAC management requires backend support for hierarchical role structures and permission inheritance. This is often managed by dedicated IAM solutions.

---

### `/admin/modules` - Module Management

**Required Endpoints (not in API):**
```
GET    /modules                        - List all system modules
GET    /modules/:id                    - Get module details
PATCH  /modules/:id/toggle             - Enable/disable module
PATCH  /modules/:id/config             - Update module configuration
GET    /modules/dependencies           - Get module dependency graph
```

**Reason:** Module management implies a plugin/microservice architecture. The current API appears to be a monolithic application without modular feature toggling.

---

### `/admin/resolution` - Resolution Templates

**Required Endpoints (not in API):**
```
GET    /resolution-templates           - List resolution templates
POST   /resolution-templates           - Create template
PATCH  /resolution-templates/:id       - Update template
DELETE /resolution-templates/:id       - Delete template
GET    /resolution-templates/categories - List categories
```

**Reason:** Resolution templates are UI/workflow features that could be stored in the database but weren't included in the API specification.

---

### `/admin/centers/validations` - Center Validations

**Partially available:**
- Could potentially use `GET /urgencies` to list pending validations
- Could use `PATCH /urgencies/:id` to approve/reject

**What's NOT available:**
- Center-specific validation workflows
- Bulk validation operations
- Validation statistics by center

---

## 📋 Recommendations for Full Integration

To fully connect all admin pages, the backend team would need to implement:

### Priority 1 - Core Admin Features
1. **Permission Matrix API** - Essential for security management
2. **RBAC API** - Required for proper access control
3. **Extended System Settings API** - For urgency levels and distribution rules

### Priority 2 - Operational Features
4. **Resolution Templates API** - For standardized incident resolution
5. **Module Management API** - For feature toggling

### Priority 3 - Monitoring (Optional)
6. **Infrastructure Monitoring API** - Or integrate with external monitoring tools
7. **Backup Management API** - Or use cloud provider's backup services

---

## Current Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Admin Dashboard                          │
├─────────────────────────────────────────────────────────────┤
│  ✅ Connected          │  ⚠️ Partial          │  ❌ No API   │
├────────────────────────┼─────────────────────┼──────────────┤
│  • Dashboard           │  • Rules (settings) │  • Permissions│
│  • Users               │  • Supervision      │  • RBAC       │
│  • Hospitals           │    (analytics only) │  • Modules    │
│  • Incidents           │                     │  • Resolution │
└────────────────────────┴─────────────────────┴──────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Zustand Stores                            │
├─────────────────────────────────────────────────────────────┤
│  • users-store      • hospitals-store    • analytics-store  │
│  • complaints-store • system-store                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Actions (API Calls)                       │
├─────────────────────────────────────────────────────────────┤
│  • /users           • /hospitals         • /analytics       │
│  • /complaints      • /system            • /auth            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API (Swagger)                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Files Reference

| Store | File | Connected Pages |
|-------|------|-----------------|
| `useUsersStore` | `stores/users-store.ts` | `/admin/users` |
| `useHospitalsStore` | `stores/hospitals-store.ts` | `/admin/hospitals` |
| `useAnalyticsStore` | `stores/analytics-store.ts` | `/admin`, `/admin/supervision` |
| `useComplaintsStore` | `stores/complaints-store.ts` | `/admin/incidents` |
| `useSystemStore` | `stores/system-store.ts` | `/admin/rules` (partial) |

---

*Last updated: January 2026*

