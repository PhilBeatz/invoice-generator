import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import SharedInvoiceView from './components/SharedInvoiceView';
import IndustryConstruction from './components/IndustryConstruction';
import IndustryLegal from './components/IndustryLegal';
import IndustryIT from './components/IndustryIT';
import Industries from './components/Industries';
import UserGuide from './components/UserGuide';

// Protected route wrapper - defined OUTSIDE App to keep stable React identity
function ProtectedRoute({ user, authLoading, children }) {
  if (authLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('dayonetools_darkmode');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const userIdRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('dayonetools_darkmode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Listen for auth state changes — only update state on actual sign-in/sign-out
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const newUser = session?.user ?? null;
      userIdRef.current = newUser?.id || null;
      setUser(newUser);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Only react to real auth changes, not token refreshes
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        const newUser = session?.user ?? null;
        const newId = newUser?.id || null;
        if (newId !== userIdRef.current) {
          userIdRef.current = newId;
          setUser(newUser);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Routes>
      {/* Public share route - completely standalone, no header/footer/auth */}
      <Route path="/share/invoice/:token" element={<SharedInvoiceView />} />
      <Route path="*" element={
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
              <Route path="/docs" element={<UserGuide darkMode={darkMode} />} />
              <Route path="/industries" element={<Industries darkMode={darkMode} />} />
              <Route path="/industries/construction" element={<IndustryConstruction darkMode={darkMode} />} />
              <Route path="/industries/legal" element={<IndustryLegal darkMode={darkMode} />} />
              <Route path="/industries/it" element={<IndustryIT darkMode={darkMode} />} />
              <Route path="/login" element={
                user ? <Navigate to="/dashboard" replace /> : <Login darkMode={darkMode} />
              } />
              <Route path="/signup" element={
                user ? <Navigate to="/dashboard" replace /> : <SignUp darkMode={darkMode} />
              } />
              <Route path="/forgot-password" element={<ForgotPassword darkMode={darkMode} />} />
              <Route path="/dashboard/*" element={
                <ProtectedRoute user={user} authLoading={authLoading}>
                  <DashboardLayout darkMode={darkMode} user={user} />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
          <Footer darkMode={darkMode} setDarkMode={setDarkMode} />
        </div>
      } />
    </Routes>
  );
}
