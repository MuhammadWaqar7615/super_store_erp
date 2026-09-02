import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

const POSPendingCarts = ({ onFinalizeSuccess, onBadgeUpdate }) => {
  const [pendingCarts, setPendingCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [finalizingId, setFinalizingId] = useState(null);

  const fetchPendingCarts = async () => {
    try {
      const { data } = await api.get('/cart/pending');
      setPendingCarts(data.data || []);
      if (onBadgeUpdate) onBadgeUpdate(data.data?.length || 0);
      setError('');
    } catch (err) {
      console.error('Failed to fetch pending carts:', err);
      // Optional: set a subtle error state, but polling might recover it
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingCarts();
    const interval = setInterval(fetchPendingCarts, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleFinalize = async (cart) => {
    setFinalizingId(cart._id);
    try {
      const { data } = await api.post(`/cart/${cart._id}/finalize`);
      // data.data should contain the Sale and PaymentIntent info
      onFinalizeSuccess(data.data);
      // Remove from list immediately for better UX
      setPendingCarts(prev => prev.filter(c => c._id !== cart._id));
      if (onBadgeUpdate) onBadgeUpdate(pendingCarts.length - 1);
    } catch (err) {
      // Cart validation failed (e.g., price changed, out of stock)
      const errorMsg = err.response?.data?.message || 'Failed to finalize cart.';
      alert(`Cart Rejected: ${errorMsg}`);
      // Remove from pending list as it is now cancelled
      setPendingCarts(prev => prev.filter(c => c._id !== cart._id));
      if (onBadgeUpdate) onBadgeUpdate(pendingCarts.length - 1);
    } finally {
      setFinalizingId(null);
    }
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 min ago';
    if (diffMins < 60) return `${diffMins} mins ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-white">
        <h2 className="text-[20px] font-semibold text-slate-800 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-slate-500" />
          Pending Carts Queue
        </h2>
        <p className="text-[14px] text-slate-500 mt-1">Customers waiting for checkout</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {pendingCarts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-50">
            <Clock className="w-12 h-12 text-slate-400 mb-4" />
            <p className="text-[16px] text-slate-600 font-medium">No pending carts</p>
            <p className="text-[14px] text-slate-400 mt-1">New carts will appear here automatically</p>
          </div>
        ) : (
          pendingCarts.map((cart) => {
            const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
            const total = cart.items.reduce((sum, item) => sum + (item.quantity * item.unitPriceSnapshot), 0);
            
            return (
              <div 
                key={cart._id} 
                className="bg-white rounded-[8px] border border-slate-200 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-2"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-[16px] font-bold text-slate-800">
                      {cart.customer?.name || 'Walk-in Customer'}
                    </h3>
                    <p className="text-[12px] text-slate-500 mt-1">
                      Submitted {formatRelativeTime(cart.submittedAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[18px] font-bold text-slate-800">Rs. {total.toLocaleString()}</p>
                    <p className="text-[12px] text-slate-500 mt-1">{itemCount} items</p>
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleFinalize(cart)}
                    disabled={finalizingId === cart._id}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[14px] font-medium transition-colors disabled:opacity-50"
                  >
                    {finalizingId === cart._id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Finalize Bill</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default POSPendingCarts;
