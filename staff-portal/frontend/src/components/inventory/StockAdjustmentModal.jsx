import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const StockAdjustmentModal = ({ isOpen, onClose, onSuccess, product }) => {
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setQuantity('');
      setReason('');
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product) return;
    
    setLoading(true);
    setError(null);
    try {
      await api.post('/inventory/adjustment', {
        productId: product._id,
        quantity: Number(quantity),
        reason
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !product) return null;

  const currentStock = product.stockQuantity;
  const newStock = currentStock + Number(quantity || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1B2A4A] border border-white/20 rounded-3xl p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
        <h2 className="text-2xl font-bold text-white mb-2 relative z-10">Adjust Stock</h2>
        <p className="text-gray-400 mb-6 text-sm">{product.name}</p>
        
        {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
          <div className="flex justify-between items-center bg-white/5 rounded-xl p-4 border border-white/10">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider">Current Stock</p>
              <p className="text-white text-xl font-bold">{currentStock}</p>
            </div>
            <div>
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-xs uppercase tracking-wider">New Stock</p>
              <p className={`text-xl font-bold ${newStock < 0 ? 'text-red-400' : 'text-green-400'}`}>{newStock}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Adjustment Quantity *</label>
            <input
              type="number"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#E8446A]/50 transition-all"
              placeholder="+/- quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">Use negative values to reduce stock</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Reason *</label>
            <input
              type="text"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#E8446A]/50 transition-all"
              placeholder="e.g. Damaged goods, manual audit"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-gray-300 hover:bg-white/5 transition-colors font-medium">Cancel</button>
            <button type="submit" disabled={loading || newStock < 0} className="px-5 py-2.5 rounded-xl bg-[#E8446A] hover:bg-[#d4375b] text-white transition-all font-medium shadow-[0_0_15px_rgba(232,68,106,0.4)] disabled:opacity-50">
              {loading ? 'Processing...' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockAdjustmentModal;
