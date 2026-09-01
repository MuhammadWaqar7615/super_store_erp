import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CustomerLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
              S
            </div>
            Super<span className="text-indigo-600">Store</span>
          </Link>
          
          <div className="flex items-center space-x-6">
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Shop</Link>
              <Link to="/" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Categories</Link>
            </nav>

            <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm font-medium text-slate-600 hidden sm:block">
                    Hello, <span className="text-slate-900 font-semibold">{user.name || user.email?.split('@')[0]}</span>
                  </span>
                  <button 
                    onClick={handleLogout} 
                    className="text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link 
                  to="/auth" 
                  className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-2 rounded-full transition-colors shadow-sm"
                >
                  Log in
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="w-full">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-slate-200 mt-20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-white font-bold text-xs">
              S
            </div>
            Super<span className="text-indigo-600">Store</span>
          </div>
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Super Store ERP. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default CustomerLayout;
