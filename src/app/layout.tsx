import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import React from 'react';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'Stock Analytics Dashboard',
  description: 'Compare stock performance with ease',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
