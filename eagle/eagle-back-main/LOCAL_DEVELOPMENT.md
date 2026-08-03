# Local Development

Run the backend and frontend in separate terminals:

```bash
cd eagle-back-main
npm run start:dev
```

```bash
cd eagle-front
npm run dev
```

The frontend runs at `http://localhost:3000` and expects the API and
Socket.IO server at `http://localhost:3001`.
The backend allows local frontend origins on ports `3000`, `3001`, and `5173`.
Opening `http://localhost:3001` redirects to the complete Swagger API catalog.

If the local environment files do not exist yet, create them from the
templates before starting:

```bash
cp eagle-back-main/.env.example eagle-back-main/.env
cp eagle-front/.env.example eagle-front/.env.local
```

Never commit either environment file. Keep Firebase credentials, JWT secrets,
and encryption keys outside version control.
