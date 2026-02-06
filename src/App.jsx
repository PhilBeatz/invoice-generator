import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import InvoiceGenerator from './components/InvoiceGenerator';
import Contact from './components/Contact';
import DashboardLayout from './components/DashboardLayout';
import Login from './components/Login';
import SignUp from './components/SignUp';
import ForgotPassword from './components/ForgotPassword';

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('dayonetools_darkmode');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem('dayonetools_darkmode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Listen for auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Protected route wrapper
  const ProtectedRoute = ({ children }) => {
    if (authLoading) return null;
    if (!user) return <Navigate to="/login" replace />;
    return children;
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: darkMode ? '#1a1a2e' : '#f1f5f9' 
    }}>
      <Header darkMode={darkMode} user={user} supabase={supabase} />
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<LandingPage darkMode={darkMode} />} />
          <Route path="/invoicegenerator" element={<InvoiceGenerator darkMode={darkMode} />} />
          <Route path="/contact" element={<Contact darkMode={darkMode} />} />
          <Route path="/login" element={
            user ? <Navigate to="/dashboard" replace /> : <Login darkMode={darkMode} />
          } />
          <Route path="/signup" element={
            user ? <Navigate to="/dashboard" replace /> : <SignUp darkMode={darkMode} />
          } />
          <Route path="/forgot-password" element={<ForgotPassword darkMode={darkMode} />} />
          <Route path="/dashboard/*" element={
            <ProtectedRoute>
              <DashboardLayout darkMode={darkMode} user={user} />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
      <Footer darkMode={darkMode} setDarkMode={setDarkMode} />
    </div>
  );
}
