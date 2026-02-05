import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import InvoiceGenerator from './components/InvoiceGenerator';
import Contact from './components/Contact';
import DashboardLayout from './components/DashboardLayout';

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('dayonetools_darkmode');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('dayonetools_darkmode', JSON.stringify(darkMode));
  }, [darkMode]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: darkMode ? '#1a1a2e' : '#f1f5f9' 
    }}>
      <Header darkMode={darkMode} />
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<LandingPage darkMode={darkMode} />} />
          <Route path="/invoicegenerator" element={<InvoiceGenerator darkMode={darkMode} />} />
          <Route path="/contact" element={<Contact darkMode={darkMode} />} />
          <Route path="/dashboard/*" element={<DashboardLayout darkMode={darkMode} />} />
        </Routes>
      </div>
      <Footer darkMode={darkMode} setDarkMode={setDarkMode} />
    </div>
  );
}
