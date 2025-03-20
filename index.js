import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { initializeApp } from 'firebase/app'; // Import initializeApp
import 'firebase/firestore'; // Import Firestore
import firebaseConfig from './firebaseConfig';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter

// Initialize Firebase
initializeApp(firebaseConfig);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter> {/* Wrap App with BrowserRouter */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);