import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const CategoryFormModal = ({ isOpen, onClose, onSuccess, categoryToEdit }) => {
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (categoryToEdit) {
      setFormData({ name: categoryToEdit.name, description: categoryToEdit.description || '' });
    } else {
      setFormData({ name: '', description: '' });
    }
    setError(null);
  }, [categoryToEdit, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (categoryToEdit) {
        await api.put(`/categories/${categoryToEdit._id}`, formData);
      } else {
        await api.post('/categories', formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1B2A4A] border border-white/20 rounded-3xl p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#E8446A] rounded-full blur-[80px] opacity-20"></div>
        
        <h2 className="text-2xl font-bold text-white mb-6 relative z-10">
          {categoryToEdit ? 'Edit Category' : 'Add Category'}
        </h2>
        
        {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Name *</label>
            <input
              type="text"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E8446A]/50 focus:border-transparent transition-all"
              placeholder="e.g. Beverages"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E8446A]/50 focus:border-transparent transition-all min-h-[100px]"
              placeholder="Optional description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-gray-300 hover:bg-white/5 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-[#E8446A] hover:bg-[#d4375b] text-white transition-all font-medium shadow-[0_0_15px_rgba(232,68,106,0.4)] disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryFormModal;
