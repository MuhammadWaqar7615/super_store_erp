import React, { useState, useEffect } from 'react';
import api from '../services/api';
import InventoryTable from '../components/inventory/InventoryTable';
import StockAdjustmentModal from '../components/inventory/StockAdjustmentModal';
import StockMovementList from '../components/inventory/StockMovementList';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToAdjust, setProductToAdjust] = useState(null);
  
  // To trigger re-render of Movement List
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchInventory();
  }, [refreshKey]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/inventory');
      setProducts(data.data);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustStock = (product) => {
    setProductToAdjust(product);
    setIsModalOpen(true);
  };

  const handleAdjustmentSuccess = () => {
    setRefreshKey(prev => prev + 1); // Refresh both inventory and movements
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#1B2A4A] p-8 -m-6" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Inventory Management</h1>
        <p className="text-gray-400 mt-2">Monitor stock levels and track movements</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {loading ? (
            <div className="h-96 rounded-2xl bg-white/5 border border-white/10 animate-pulse"></div>
          ) : (
            <InventoryTable 
              products={products} 
              onAdjustStock={handleAdjustStock}
            />
          )}
        </div>
        
        <div className="lg:col-span-1">
          <StockMovementList key={refreshKey} />
        </div>
      </div>

      <StockAdjustmentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleAdjustmentSuccess}
        product={productToAdjust}
      />
    </div>
  );
};

export default Inventory;
