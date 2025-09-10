# Stock Analytics Dashboard Frontend

This is the frontend for the Stock Analytics Dashboard, built with Next.js and TypeScript.

## Features
- User authentication (Firebase Auth)
- Dashboard for comparing stock performance
- Charting with ECharts
- API integration with FastAPI backend
- Responsive and modern UI

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Configure environment variables:**
   - Copy `.env.local.example` to `.env.local` and fill in your Firebase and backend API details.
3. **Run the development server:**
   ```bash
   npm run dev
   ```

## Environment Variables
See `.env.local.example` for required variables.

## Project Structure
- `src/` - Main source code
  - `app/` - Next.js app directory (pages, layouts)
  - `components/` - Reusable UI components
  - `contexts/` - React context providers (e.g., Auth)
  - `lib/` - Utility libraries (Firebase, API helpers)
- `public/` - Static assets

## API Design
- All API requests to the backend must include the Firebase ID token in the `Authorization` header.
- See backend README for API endpoints.

## Notes
- Do not commit your real `.env.local` or Firebase credentials.
- For any issues, see the backend and frontend READMEs or contact the maintainer.
