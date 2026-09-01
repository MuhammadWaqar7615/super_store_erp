import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ProductFormModal = ({ isOpen, onClose, onSuccess, productToEdit }) => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    purchasePrice: '',
    sellingPrice: '',
    stockQuantity: '',
    minimumStock: '0',
    unit: 'piece',
    isActive: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) fetchCategories();
  }, [isOpen]);

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name,
        description: productToEdit.description || '',
        category: productToEdit.category?._id || productToEdit.category,
        purchasePrice: productToEdit.purchasePrice,
        sellingPrice: productToEdit.sellingPrice,
        stockQuantity: productToEdit.stockQuantity,
        minimumStock: productToEdit.minimumStock || 0,
        unit: productToEdit.unit || 'piece',
        isActive: productToEdit.isActive
      });
    } else {
      setFormData({
        name: '', description: '', category: '', purchasePrice: '', sellingPrice: '', stockQuantity: '', minimumStock: '0', unit: 'piece', isActive: true
      });
    }
    setImageFile(null);
    setError(null);
  }, [productToEdit, isOpen]);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      if (imageFile) {
        data.append('image', imageFile);
      }

      if (productToEdit) {
        await api.put(`/products/${productToEdit._id}`, data);
      } else {
        await api.post('/products', data);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#1B2A4A] border border-white/20 rounded-3xl p-8 w-full max-w-2xl shadow-2xl relative my-8">
        <h2 className="text-2xl font-bold text-white mb-6 relative z-10">
          {productToEdit ? 'Edit Product' : 'Add Product'}
        </h2>
        
        {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Name *</label>
              <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Category *</label>
              <select required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                <option value="" className="text-black">Select Category</option>
                {categories.map(c => <option key={c._id} value={c._id} className="text-black">{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Purchase Price *</label>
              <input type="number" required min="0" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white" value={formData.purchasePrice} onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Selling Price *</label>
              <input type="number" required min="0" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white" value={formData.sellingPrice} onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Stock Quantity *</label>
              <input type="number" required min="0" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white" value={formData.stockQuantity} onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Minimum Stock</label>
              <input type="number" min="0" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white" value={formData.minimumStock} onChange={(e) => setFormData({ ...formData, minimumStock: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Unit</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })}>
                <option value="piece" className="text-black">Piece</option>
                <option value="kg" className="text-black">Kg</option>
                <option value="liter" className="text-black">Liter</option>
                <option value="pack" className="text-black">Pack</option>
                <option value="box" className="text-black">Box</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Image Upload (Cloudinary)</label>
              <input type="file" accept="image/*" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-1.5 text-white text-sm" onChange={(e) => setImageFile(e.target.files[0])} />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white min-h-[80px]" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-gray-300 hover:bg-white/5 font-medium">Cancel</button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-xl bg-[#E8446A] hover:bg-[#d4375b] text-white font-medium shadow-[0_0_15px_rgba(232,68,106,0.4)] disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
