/**
 * Zustand Stores Index
 * 
 * ARCHITECTURE NOTE:
 * - Server state (API data) is handled by TanStack Query (see hooks/queries/)
 * - Zustand stores are kept only for CLIENT STATE:
 *   - Authentication (auth-store.ts) - persisted session
 *   - UI state (ui-store.ts) - sidebar, modals, theme
 * 
 * Legacy stores below are kept only for the consultation page which
 * still depends on them for start/complete consultation flows.
 */

// ============================================================================
// Client State Stores (RECOMMENDED)
// ============================================================================

// Authentication - persisted to localStorage
export { useAuthStore } from "./auth-store";

// UI State - sidebar, modals, theme
export { useUIStore } from "./ui-store";

// ============================================================================
// Legacy Stores (still used by consultation page - migrate when possible)
// ============================================================================

// Used by doctor/consultation/page.tsx and patient-details-modal.tsx
export { useConsultationsStore } from "./consultations-store";
export { usePatientsStore } from "./patients-store";
