import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  useEffect(() => {
    if (!order || order.paymentStatus !== 'pending') return;

    const interval = setInterval(() => {
      fetchOrder();
    }, 3000);

    return () => clearInterval(interval);
  }, [order, id]);

  const fetchOrder = async () => {
    try {
      const res = await axios.get(`${API_URL}/sales/${id}`);
      setOrder(res.data.sale);
    } catch (error) {
      console.error('Failed to fetch order details', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
        <Link to="/orders" className="text-blue-600 hover:underline">Back to My Orders</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link to="/orders" className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to Orders
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none print:bg-transparent">
          {/* Header */}
          <div className="bg-blue-600 px-8 py-10 text-white text-center">
            <h1 className="text-4xl font-black tracking-widest mb-2">SUPER STORE</h1>
            <p className="text-blue-100 uppercase tracking-widest text-sm opacity-80">Official Receipt</p>
          </div>

          <div className="p-8">
            <div className="flex flex-col sm:flex-row justify-between border-b border-gray-100 pb-8 mb-8">
              <div>
                <p className="text-sm text-gray-500 mb-1">Receipt Number</p>
                <p className="font-bold text-gray-900">{order.invoiceNumber}</p>
              </div>
              <div className="mt-4 sm:mt-0 sm:text-right">
                <p className="text-sm text-gray-500 mb-1">Date</p>
                <p className="font-bold text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Items */}
            <div className="mb-8">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="pb-3 text-sm font-semibold text-gray-500 uppercase tracking-wider text-right">Qty</th>
                    <th className="pb-3 text-sm font-semibold text-gray-500 uppercase tracking-wider text-right">Price</th>
                    <th className="pb-3 text-sm font-semibold text-gray-500 uppercase tracking-wider text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.items.map((item, index) => (
                    <tr key={index}>
                      <td className="py-4 font-medium text-gray-900">{item.productName}</td>
                      <td className="py-4 text-right text-gray-600">{item.quantity}</td>
                      <td className="py-4 text-right text-gray-600">Rs. {item.unitPrice}</td>
                      <td className="py-4 text-right font-medium text-gray-900">Rs. {item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-full sm:w-1/2 bg-gray-50 p-6 rounded-xl">
                <div className="flex justify-between items-center text-lg font-bold text-gray-900 border-t border-gray-200 pt-4 mt-2">
                  <span>TOTAL</span>
                  <span className="text-2xl text-blue-600">Rs. {order.total}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200 text-center">
              <p className="text-gray-500 font-medium mb-1">Payment Method: <span className="text-gray-900">Stripe</span></p>
              <p className="text-gray-500 font-medium mb-8">Status: <span className="text-green-600 font-bold uppercase">{order.paymentStatus}</span></p>
              <h3 className="text-xl font-bold text-gray-900 tracking-wider">THANK YOU!</h3>
            </div>
            
            <div className="mt-8 text-center print:hidden">
              <button onClick={() => window.print()} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
