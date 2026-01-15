import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CaseDetail from './pages/CaseDetail';
import NewCase from './pages/NewCase';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/case/:id" element={<CaseDetail />} />
          <Route path="/new-case" element={<NewCase />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
