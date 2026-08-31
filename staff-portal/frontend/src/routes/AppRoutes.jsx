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

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/staff" element={<PrivateRoute allowedRoles={['Admin', 'Cashier']}><AdminLayout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="categories" element={<PrivateRoute allowedRoles={['Admin']}><Categories /></PrivateRoute>} />
        <Route path="products" element={<PrivateRoute allowedRoles={['Admin']}><Products /></PrivateRoute>} />
      </Route>

      {/* Unauthorized Fallback */}
      <Route path="/unauthorized" element={<div className="flex h-screen items-center justify-center text-2xl">Unauthorized Access</div>} />
      
      {/* Catch-all 404 Route */}
      <Route path="*" element={<div className="flex h-screen items-center justify-center text-2xl">404 - Page Not Found</div>} />
    </Routes>
  );
};

export default AppRoutes;
