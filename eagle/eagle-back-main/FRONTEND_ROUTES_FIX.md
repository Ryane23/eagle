# Frontend Missing Routes - Quick Fix

## Issue

The frontend is trying to load these routes that don't exist:
- `/terms` (Terms of Service)
- `/legal` (Legal/Privacy Policy)

This causes 404 errors in the browser console.

## Quick Fix Option 1: Remove the Links (Fastest)

If these pages aren't ready yet, remove or comment out the links temporarily.

**Look for footer or nav components** that might have:
```tsx
<Link href="/terms">Terms of Service</Link>
<Link href="/legal">Privacy Policy</Link>
```

## Quick Fix Option 2: Create Placeholder Pages

### 1. Create Terms Page

Create file: `app/terms/page.tsx`

```tsx
export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
      <p className="text-gray-600">
        Terms of service content coming soon.
      </p>
    </div>
  );
}
```

### 2. Create Legal/Privacy Page

Create file: `app/legal/page.tsx`

```tsx
export default function LegalPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-gray-600">
        Privacy policy content coming soon.
      </p>
    </div>
  );
}
```

## Complete Implementation (Better)

For a proper implementation, create:

```
app/
  terms/
    page.tsx
  legal/
    page.tsx
  privacy/
    page.tsx
```

Each should include:
- SEO metadata
- Proper content structure
- Legal disclaimers
- Last updated date
- Contact information

## Example Complete Page

```tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | EAGLE',
  description: 'Terms of Service for EAGLE Telemedicine Platform',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
          <p className="text-gray-500 mb-8">Last Updated: January 16, 2026</p>
          
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using the EAGLE telemedicine platform, you accept
                and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
              <p className="text-gray-700 mb-4">
                Permission is granted to temporarily access the EAGLE platform for
                personal, non-commercial transitory viewing only.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Medical Disclaimer</h2>
              <p className="text-gray-700 mb-4">
                The EAGLE platform facilitates telemedicine consultations but does
                not provide medical advice directly. Always consult with qualified
                healthcare professionals.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Privacy & Data Protection</h2>
              <p className="text-gray-700 mb-4">
                We are committed to protecting your privacy and personal health
                information. See our Privacy Policy for details.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Contact Information</h2>
              <p className="text-gray-700">
                For questions about these Terms of Service, contact us at:
                <br />
                Email: support@eagle.cm
                <br />
                Website: https://eagle.cm
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

**Note**: These are frontend issues separate from the authentication problem. The authentication issue is caused by the backend service being suspended on Render.
