# EAGLE Consultation App

EAGLE is a telemedicine consultation platform connecting secondary health
centers with specialist doctors. The repository contains a Next.js frontend
and a NestJS backend backed by Firebase Firestore.

## Project Structure

- `eagle-front`: Next.js frontend application
- `eagle-back-main`: NestJS REST API, Socket.IO signaling, and Firebase data
  access

## Local Development

Create local environment files from the provided templates when setting up a
new machine:

```bash
cp eagle-back-main/.env.example eagle-back-main/.env
cp eagle-front/.env.example eagle-front/.env.local
```

Add valid Firebase and application secrets to the backend `.env`, then start
each application in a separate terminal:

```bash
cd eagle-back-main
npm run start:dev
```

```bash
cd eagle-front
npm run dev
```

Local services:

- Frontend: `http://localhost:3000`
- Backend and API catalog: `http://localhost:3001`
- Swagger UI: `http://localhost:3001/api/docs`
- OpenAPI JSON: `http://localhost:3001/api/docs-json`

## Documentation

- [Changelog](CHANGELOG.md)
- [Local connection audit](LOCAL_CONNECTION_AUDIT.md)
- [Backend local development](eagle-back-main/LOCAL_DEVELOPMENT.md)
- [Backend documentation](eagle-back-main/README.md)
- [Frontend documentation](eagle-front/README.md)

## Security

Environment files are excluded from Git. Never commit Firebase private keys,
JWT secrets, encryption keys, or production credentials.
