import React from 'react';

const POSCart = ({ cart, onUpdateQuantity, onRemoveItem, subtotal }) => {
  return (
    <div className="flex flex-col h-full bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex-1 overflow-hidden">
      <div className="p-4 border-b border-white/10 bg-white/5">
        <h2 className="text-lg font-bold text-white flex items-center">
          <svg className="w-5 h-5 mr-2 text-[#E8446A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          Current Order
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-50">
            <p className="text-gray-400">Cart is empty</p>
            <p className="text-xs text-gray-500 mt-1">Select products to add</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {cart.map((item, index) => (
              <li key={item.product._id || index} className="bg-white/5 border border-white/10 rounded-xl p-3 flex justify-between items-center group">
                <div className="flex-1 mr-3">
                  <h4 className="text-white text-sm font-medium line-clamp-1">{item.product.name}</h4>
                  <p className="text-gray-400 text-xs">Rs. {item.product.sellingPrice} / {item.product.unit}</p>
                </div>
                
                <div className="flex items-center space-x-3 bg-black/20 rounded-lg p-1">
                  <button 
                    onClick={() => onUpdateQuantity(item.product._id, item.quantity - 1)}
                    className="w-7 h-7 flex items-center justify-center rounded-md bg-white/10 text-white hover:bg-[#E8446A] transition-colors"
                  >
                    -
                  </button>
                  <span className="text-white font-medium w-4 text-center text-sm">{item.quantity}</span>
                  <button 
                    onClick={() => onUpdateQuantity(item.product._id, item.quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center rounded-md bg-white/10 text-white hover:bg-[#E8446A] transition-colors"
                    disabled={item.quantity >= item.product.stockQuantity}
                  >
                    +
                  </button>
                </div>
                
                <div className="w-20 text-right ml-3">
                  <p className="text-white font-bold text-sm">Rs. {item.product.sellingPrice * item.quantity}</p>
                </div>
                
                <button 
                  onClick={() => onRemoveItem(item.product._id)}
                  className="ml-2 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors rounded-full hover:bg-red-500/10 opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="p-4 border-t border-white/10 bg-black/20 mt-auto">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400">Subtotal</span>
          <span className="text-white font-medium">Rs. {subtotal}</span>
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-400">Discount/Tax</span>
          <span className="text-white font-medium">Rs. 0</span>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-white/10">
          <span className="text-lg font-medium text-white">Total</span>
          <span className="text-2xl font-bold text-[#E8446A]">Rs. {subtotal}</span>
        </div>
      </div>
    </div>
  );
};

export default POSCart;
