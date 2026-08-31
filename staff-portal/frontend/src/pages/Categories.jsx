import React, { useState, useEffect } from 'react';
import api from '../services/api';
import CategoryTable from '../components/categories/CategoryTable';
import CategoryFormModal from '../components/categories/CategoryFormModal';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/categories');
      setCategories(data.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await api.delete(`/categories/${id}`);
        fetchCategories(); // Refresh list
      } catch (error) {
        console.error('Failed to delete category:', error);
        alert('Failed to delete category. It might be in use.');
      }
    }
  };

  const handleEdit = (category) => {
    setCategoryToEdit(category);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setCategoryToEdit(null);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#1B2A4A] p-8 -m-6" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Categories</h1>
          <p className="text-gray-400 mt-2">Manage product categories</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-[#E8446A] hover:bg-[#d4375b] text-white px-6 py-3 rounded-xl shadow-[0_0_15px_rgba(232,68,106,0.4)] transition-all font-medium flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Add Category
        </button>
      </div>

      {loading ? (
        <div className="h-64 rounded-2xl bg-white/5 border border-white/10 animate-pulse"></div>
      ) : (
        <CategoryTable 
          categories={categories} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
        />
      )}

      <CategoryFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchCategories}
        categoryToEdit={categoryToEdit}
      />
    </div>
  );
};

export default Categories;
