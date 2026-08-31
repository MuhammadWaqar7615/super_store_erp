import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ProductTable from '../components/products/ProductTable';
import ProductFormModal from '../components/products/ProductFormModal';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    let filtered = products;
    if (searchTerm) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (categoryFilter) {
      filtered = filtered.filter(p => p.category?._id === categoryFilter);
    }
    setFilteredProducts(filtered);
  }, [products, searchTerm, categoryFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/products');
      setProducts(data.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (error) {
        alert('Failed to delete product.');
      }
    }
  };

  const handleToggleActive = async (product) => {
    try {
      // Create FormData since the endpoint expects it for updates (multer)
      const data = new FormData();
      data.append('isActive', !product.isActive);
      
      await api.put(`/products/${product._id}`, data);
      fetchProducts();
    } catch (error) {
      console.error('Failed to toggle status');
    }
  };

  const handleEdit = (product) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#1B2A4A] p-8 -m-6" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Products</h1>
          <p className="text-gray-400 mt-2">Manage your catalog and stock</p>
        </div>
        <button onClick={openAddModal} className="bg-[#E8446A] hover:bg-[#d4375b] text-white px-6 py-3 rounded-xl shadow-[0_0_15px_rgba(232,68,106,0.4)] transition-all font-medium flex items-center shrink-0">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
        <input 
          type="text" 
          placeholder="Search products..." 
          className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none flex-1"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none md:w-64"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="" className="text-black">All Categories</option>
          {categories.map(c => <option key={c._id} value={c._id} className="text-black">{c.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="h-96 rounded-2xl bg-white/5 border border-white/10 animate-pulse"></div>
      ) : (
        <ProductTable 
          products={filteredProducts} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
          onToggleActive={handleToggleActive}
        />
      )}

      <ProductFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchProducts}
        productToEdit={productToEdit}
      />
    </div>
  );
};

export default Products;
