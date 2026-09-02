import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isPOS = location.pathname === '/pos';

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
          <Link to="/dashboard" className="block py-2 px-4 rounded hover:bg-gray-700 transition">Dashboard</Link>
          <Link to="/pos" className="block py-2 px-4 rounded hover:bg-gray-700 transition">POS</Link>
          <Link to="/receipts" className="block py-2 px-4 rounded hover:bg-gray-700 transition">Receipts</Link>
          {user?.role === 'Admin' && (
            <>
              <Link to="/categories" className="block py-2 px-4 rounded hover:bg-gray-700 transition">Categories</Link>
              <Link to="/products" className="block py-2 px-4 rounded hover:bg-gray-700 transition">Products</Link>
              <Link to="/inventory" className="block py-2 px-4 rounded hover:bg-gray-700 transition">Inventory</Link>
            </>
          )}
        </nav>
        <div className="p-4 border-t border-gray-700 text-sm">
          <p>Logged in as: {user?.email}</p>
          <p className="text-gray-400 mb-2">Role: {user?.role}</p>
          <button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded transition">Logout</button>
        </div>
      </aside>
      <main className={`flex-1 overflow-auto ${isPOS ? 'p-0' : 'p-8'}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
