import React, { useState, useEffect } from 'react';
import api from '../services/api';
import POSSearch from '../components/pos/POSSearch';
import POSCart from '../components/pos/POSCart';
import POSCustomerSelect from '../components/pos/POSCustomerSelect';
import POSPaymentModal from '../components/pos/POSPaymentModal';

const POS = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState({ _id: null, name: 'Walk-in Customer' });
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data.data);
    } catch (error) {
      console.error('Failed to fetch products for POS');
    }
  };

  const handleAddToCart = (product) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.product._id === product._id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) return prevCart; // Prevent over-adding
        return prevCart.map(item => 
          item.product._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCart(prevCart => prevCart.map(item => 
      item.product._id === productId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const handleRemoveItem = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.product._id !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.product.sellingPrice * item.quantity), 0);

  const handleCheckoutClick = async () => {
    if (cart.length === 0) return;
    
    // Optional: Call /sales/validate to double check stock before showing modal
    try {
      const items = cart.map(item => ({
        productId: item.product._id,
        quantity: item.quantity
      }));
      await api.post('/sales/validate', { items });
      setIsPaymentModalOpen(true);
    } catch (error) {
      alert(error.response?.data?.message || 'Validation failed. Check stock levels.');
    }
  };

  const handlePaymentSuccess = (saleData) => {
    setIsPaymentModalOpen(false);
    setCart([]); // Clear cart
    setSelectedCustomer({ _id: null, name: 'Walk-in Customer' });
    fetchProducts(); // Refresh stock
    
    // Print receipt functionality (mocked for now)
    alert(`Payment successful! Receipt ${saleData.invoiceNumber} generated.`);
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-[#1B2A4A] p-4 lg:p-6 -m-6 flex flex-col lg:flex-row gap-6 overflow-hidden" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Left side: Products Grid */}
      <div className="w-full lg:w-2/3 h-full flex flex-col">
        <POSSearch 
          products={products}
          onAddToCart={handleAddToCart}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      </div>

      {/* Right side: Cart & Checkout */}
      <div className="w-full lg:w-1/3 h-full flex flex-col gap-4">
        <POSCustomerSelect 
          selectedCustomer={selectedCustomer}
          setSelectedCustomer={setSelectedCustomer}
        />
        
        <div className="flex-1 min-h-0">
          <POSCart 
            cart={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            subtotal={subtotal}
          />
        </div>

        <button 
          onClick={handleCheckoutClick}
          disabled={cart.length === 0}
          className="w-full bg-[#E8446A] hover:bg-[#d4375b] text-white py-4 rounded-2xl text-xl font-bold shadow-[0_0_20px_rgba(232,68,106,0.3)] transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center"
        >
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          Checkout — Rs. {subtotal}
        </button>
      </div>

      <POSPaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        amount={subtotal}
        cart={cart}
        customer={selectedCustomer}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default POS;
