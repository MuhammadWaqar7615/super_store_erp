import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import CustomerLayout from '../layouts/CustomerLayout';

// Pages
import CustomerAuth from '../pages/customer/CustomerAuth';

const CustomerRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user || user.role) return <Navigate to="/auth" replace />; // If role exists, it's not a pure customer
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Customer Routes */}
      <Route path="/auth" element={<CustomerAuth />} />
      <Route path="/" element={<CustomerRoute><CustomerLayout /></CustomerRoute>}>
        <Route index element={<div className="p-6">Store</div>} />
      </Route>

      {/* Catch-all 404 Route */}
      <Route path="*" element={<div className="flex h-screen items-center justify-center text-2xl">404 - Page Not Found</div>} />
    </Routes>
  );
};

export default AppRoutes;
