import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import AdminLayout from '../layouts/AdminLayout';

// Pages
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Categories from '../pages/Categories';
import Products from '../pages/Products';
import Inventory from '../pages/Inventory';
import POS from '../pages/POS';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Layout wrapper for authenticated routes */}
      <Route element={<PrivateRoute allowedRoles={['Admin', 'Cashier']}><AdminLayout /></PrivateRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/categories" element={<PrivateRoute allowedRoles={['Admin']}><Categories /></PrivateRoute>} />
        <Route path="/products" element={<PrivateRoute allowedRoles={['Admin']}><Products /></PrivateRoute>} />
        <Route path="/inventory" element={<PrivateRoute allowedRoles={['Admin']}><Inventory /></PrivateRoute>} />
        <Route path="/pos" element={<PrivateRoute allowedRoles={['Admin', 'Cashier']}><POS /></PrivateRoute>} />
      </Route>

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/staff" element={<Navigate to="/dashboard" replace />} />
      <Route path="/admin" element={<Navigate to="/dashboard" replace />} />

      {/* Unauthorized Fallback */}
      <Route path="/unauthorized" element={<div className="flex h-screen items-center justify-center text-2xl text-white bg-[#1B2A4A]">Unauthorized Access</div>} />
      
      {/* Catch-all 404 Route */}
      <Route path="*" element={<div className="flex h-screen items-center justify-center text-2xl text-white bg-[#1B2A4A]">404 - Page Not Found</div>} />
    </Routes>
  );
};

export default AppRoutes;
