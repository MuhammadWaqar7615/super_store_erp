import React from 'react';
import { Outlet } from 'react-router-dom';
import '../auth.css';

const AuthLayout = () => {
  return (
    <div className="auth-body">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
