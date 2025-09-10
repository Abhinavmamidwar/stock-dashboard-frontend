📊 Stock Analytics Dashboard – Frontend

This is the frontend application for the Stock Analytics Dashboard project.
It is built using Next.js (React + TypeScript) and connects with the backend (FastAPI) to fetch and display stock market analytics.

🚀 Features

🔐 User Authentication (Signup / Login using Firebase Auth)

📈 Stock Data Visualization with dynamic charts

⚡ API Integration with backend (FastAPI + Yahoo Finance)

🎨 Reusable UI Components (Buttons, Inputs, Navbar, Select, etc.)

📊 Dashboard Page for real-time stock analysis

🌐 Modern Frontend Stack – Next.js, TypeScript, TailwindCSS (optional if used)

🏗️ Project Structure
```bash
frontend/
│── components/
│   ├── StockChart.js     # Stock chart visualization
│
│── contexts/
│   ├── AuthContext.tsx   # Authentication context
│
│── lib/
│   ├── api.ts            # API client to interact with backend
│   ├── firebase.ts       # Firebase configuration
│
│── public/               # Static assets
│   ├── favicon.ico
│   ├── next.svg
│
│── src/
│   ├── app/
│       ├── api/stock-data/route.ts   # API route for fetching stock data
│       ├── dashboard/page.tsx        # Dashboard page
│       ├── login/page.tsx            # Login page
│       ├── signup/page.tsx           # Signup page
│       ├── globals.css               # Global styles
│       ├── layout.tsx                # Layout wrapper
│       ├── ui.module.css             # Scoped CSS modules
│── components/
│    ├── ui/               # Reusable UI components (Button, Input, Navbar, Select)
│       ├── Button.tsx
│       ├── Input.tsx   
│       ├── Select.tsx
│       ├── Navbar.tsx
│ 
│── .env.local            # Environment variables
│── next.config.js        # Next.js configuration
│── package.json          # Project dependencies
│── tsconfig.json         # TypeScript configuration
│── README.md             # Documentation
```
⚙️ Installation & Setup
1️⃣ Clone the repository
```bash
git clone https://github.com/your-username/stock-dashboard-frontend.git
cd stock-dashboard-frontend
```
2️⃣ Install dependencies
```bash
npm install
# or
yarn install
```
3️⃣ Configure environment variables

Create a .env.local file in the root directory:
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000   # Backend FastAPI URL
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

⚠️ Do not commit .env.local (already in .gitignore).

4️⃣ Run the development server
```bash
npm run dev
# or
yarn dev
```

The app will be running at:
👉 http://localhost:3000

📦 Build for Production
```bash
npm run build
npm start
```
🔗 Backend Integration

This frontend connects to the FastAPI backend for stock data.
👉 Backend repo: stock-dashboard-backend

📝 License

This project is licensed under the MIT License
.
