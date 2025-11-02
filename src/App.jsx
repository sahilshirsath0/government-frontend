import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import Announcements from './pages/admin/Announcements';
import Gallery from './pages/admin/Gallery';
import Awards from './pages/admin/Awards';
import Members from './pages/admin/Members';
import Feedback from './pages/admin/Feedback';
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import NagrikSeva from './components/admin/NagrikSeva';
import VillageDetails from './components/admin/VillageDetails';
import Programs from './components/admin/Programs';
import './i18n';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* Protected Admin Routes */}
          <Route path="/admin-dashboard" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="awards" element={<Awards />} />
            <Route path="members" element={<Members />} />
            <Route path="feedback" element={<Feedback />} />
             <Route path="nagrik-seva" element={<NagrikSeva />} />
            <Route path="village-details" element={<VillageDetails />} />
            <Route path="programs" element={<Programs />} />
          </Route>

          {/* Redirect */}
          <Route path="/" element={<Navigate to="/admin-login" replace />} />
          
          {/* 404 */}
          <Route path="*" element={<Navigate to="/admin-login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
