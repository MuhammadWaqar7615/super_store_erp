import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const MyOrders = () => {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(location.state?.justPaid || false);

  useEffect(() => {
    fetchOrders();

    if (processingPayment) {
      const timer = setTimeout(() => {
        setProcessingPayment(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // Poll every 3 seconds if any order is pending
    const hasPending = orders.some(order => order.status === 'pending');
    if (!hasPending) return;

    const interval = setInterval(() => {
      fetchOrders();
    }, 3000);

    return () => clearInterval(interval);
  }, [orders]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/sales/me`);
      setOrders(res.data.sales);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || processingPayment) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-6"></div>
        <h2 className="text-xl font-semibold text-gray-800">Finalizing your order...</h2>
        <p className="text-gray-500 mt-2">Waiting for payment confirmation</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <Link to="/products" className="text-blue-600 hover:text-blue-700 font-medium">
            Continue Shopping
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
            <Link to="/products" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link key={order._id} to={`/orders/${order._id}`} className="block">
                <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row justify-between items-center group border border-gray-100 hover:border-blue-100">
                  <div className="mb-4 sm:mb-0">
                    <p className="text-sm text-gray-500 mb-1">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <p className="font-semibold text-gray-900">{order.invoiceNumber}</p>
                    <div className="mt-2 flex space-x-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-1">Total</p>
                    <p className="text-xl font-bold text-gray-900">Rs. {order.total}</p>
                    <p className="text-blue-600 text-sm mt-2 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end">
                      View Receipt <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
