import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ShoppingCart, Clock } from 'lucide-react';
import POSSearch from '../components/pos/POSSearch';
import POSCart from '../components/pos/POSCart';
import POSCustomerSelect from '../components/pos/POSCustomerSelect';
import POSPendingCarts from '../components/pos/POSPendingCarts';
import POSBottomBar from '../components/pos/POSBottomBar';
import POSPaymentModal from '../components/pos/POSPaymentModal';

const POS = () => {
  const [activeTab, setActiveTab] = useState('cart'); // 'cart' | 'pending'
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [pendingCartsCount, setPendingCartsCount] = useState(0);
  const [isCartExpanded, setIsCartExpanded] = useState(false);

  useEffect(() => {
    fetchProducts();
    // Initial fetch for pending carts count
    fetchPendingCartsCount();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data.data || []);
    } catch (error) {
      console.error('Failed to fetch products for POS');
    }
  };

  const fetchPendingCartsCount = async () => {
    try {
      const { data } = await api.get('/cart/pending');
      setPendingCartsCount(data.data?.length || 0);
    } catch (error) {
      console.error('Failed to fetch pending carts count');
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

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear the entire cart?')) {
      setCart([]);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.product.sellingPrice * item.quantity), 0);

  const handleCheckoutClick = async () => {
    if (cart.length === 0) return;
    if (!selectedCustomer) {
      alert("Please select a customer or add a walk-in customer before proceeding.");
      return;
    }

    // Call /sales/validate to double check stock before showing modal
    try {
      const items = cart.map(item => ({
        productId: item.product._id,
        quantity: item.quantity
      }));
      await api.post('/sales/validate', { items });
      setIsPaymentModalOpen(true);
    } catch (error) {
      alert(error.response?.data?.message || 'Validation failed. Check stock levels or prices.');
    }
  };

  const handlePaymentSuccess = (saleData) => {
    setIsPaymentModalOpen(false);
    setCart([]); // Clear cart
    setSelectedCustomer(null);
    fetchProducts(); // Refresh stock

    // Print receipt functionality
    alert(`Payment successful! Receipt ${saleData?.invoiceNumber || ''} generated.`);
  };

  const handleFinalizePendingSuccess = (saleData) => {
    fetchProducts(); // Refresh stock after pending cart is paid
    alert(`Pending Cart finalized! Receipt generated.`);
  };

  const canPay = cart.length > 0 && selectedCustomer !== null;

  return (
    <div className="flex flex-col h-full bg-slate-50 relative font-sans text-slate-800">


      {/* 3.2 Main Content Area */}
      {/* pb-28 to account for the 96px bottom bar + padding */}
      <div className="flex flex-1 overflow-hidden p-6 gap-6 pb-28">

        {/* Left Column (65%) */}
        <div className="w-[65%] flex flex-col gap-6 h-full">
          {/* Top half: Product Search */}
          <div className={`${isCartExpanded ? 'h-[50%]' : 'flex-1'} min-h-0 transition-all duration-300`}>
            <POSSearch
              products={products}
              onAddToCart={handleAddToCart}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </div>

          {/* Bottom half: Current Cart */}
          <div className={`${isCartExpanded ? 'h-[50%]' : 'h-auto'} min-h-0 transition-all duration-300`}>
            <POSCart
              cart={cart}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              isExpanded={isCartExpanded}
              onToggleExpand={() => setIsCartExpanded(!isCartExpanded)}
            />
          </div>
        </div>

        {/* Right Column (35%) */}
        <div className="w-[35%] h-full flex flex-col gap-4">
          {/* Section Header Toggles */}
          <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('cart')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-[14px] font-medium transition-colors ${activeTab === 'cart'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Active Cart</span>
            </button>

            <button
              onClick={() => setActiveTab('pending')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-[14px] font-medium transition-colors relative ${activeTab === 'pending'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                }`}
            >
              <Clock className="w-4 h-4" />
              <span>Pending Carts</span>
              {pendingCartsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {pendingCartsCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex-1 min-h-0">
            {activeTab === 'cart' ? (
              <div className="flex flex-col h-full">
                <POSCustomerSelect
                  selectedCustomer={selectedCustomer}
                  setSelectedCustomer={setSelectedCustomer}
                />

                <div className="mt-4 flex-1 bg-white rounded-[8px] border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-6 flex flex-col justify-center items-center text-center opacity-70">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <h4 className="text-[16px] font-semibold text-slate-700 mb-2">Checkout Ready</h4>
                  <p className="text-[14px] text-slate-500 max-w-xs">Build the cart on the left, select a customer, and click Pay Now to process the transaction.</p>
                </div>
              </div>
            ) : (
              <POSPendingCarts
                onFinalizeSuccess={handleFinalizePendingSuccess}
                onBadgeUpdate={setPendingCartsCount}
              />
            )}
          </div>
        </div>
      </div>

      {/* 3.3 Bottom Action Bar */}
      <POSBottomBar
        subtotal={subtotal}
        onClearCart={handleClearCart}
        onPayNow={handleCheckoutClick}
        canPay={canPay}
      />

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
