import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import InvoiceGenerator from './components/InvoiceGenerator';

export default function App() {
  return (
    <div style={{ minHeight: '100vh', background: '#1a1a2e' }}>
      <Header />
      <Routes>
        <Route path="/" element={<InvoiceGenerator />} />
        <Route path="/invoicegenerator" element={<InvoiceGenerator />} />
      </Routes>
    </div>
  );
}
