import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error(error);
    } finally {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-4 text-xl font-bold border-b border-gray-700">ERP System</div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin" className="block py-2 px-4 rounded hover:bg-gray-700 transition">Dashboard</Link>
          {user?.role === 'Admin' && (
            <>
              <Link to="/admin/categories" className="block py-2 px-4 rounded hover:bg-gray-700 transition">Categories</Link>
              <Link to="/admin/products" className="block py-2 px-4 rounded hover:bg-gray-700 transition">Products</Link>
            </>
          )}
        </nav>
        <div className="p-4 border-t border-gray-700 text-sm">
          <p>Logged in as: {user?.email}</p>
          <p className="text-gray-400 mb-2">Role: {user?.role}</p>
          <button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded transition">Logout</button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
