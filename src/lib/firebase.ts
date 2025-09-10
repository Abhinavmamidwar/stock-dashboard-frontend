import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCvoMROBuEt2EcRmac55KTX3TYnqqO2cwM",
  authDomain: "stock-analytics-dashboard.firebaseapp.com",
  projectId: "stock-analytics-dashboard",
  storageBucket: "stock-analytics-dashboard.firebasestorage.app",
  messagingSenderId: "943469113089",
  appId: "1:943469113089:web:37b49542cb5ba2ca79f500",
  measurementId: "G-ZXY4TKXC2F",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export { app, auth };

