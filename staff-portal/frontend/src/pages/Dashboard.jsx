import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Welcome back, {user?.email}</h2>
        <p className="text-gray-600">Your current role is: <span className="font-bold text-blue-600">{user?.role}</span></p>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
            <h3 className="font-bold text-blue-800">Total Sales</h3>
            <p className="text-2xl font-black text-blue-900 mt-2">Rs. ---</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg border border-green-100">
            <h3 className="font-bold text-green-800">Income</h3>
            <p className="text-2xl font-black text-green-900 mt-2">Rs. ---</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
            <h3 className="font-bold text-purple-800">Products</h3>
            <p className="text-2xl font-black text-purple-900 mt-2">---</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
