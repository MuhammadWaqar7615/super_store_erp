import React from 'react';
import { ShoppingBag, Minus, Plus, X, ChevronUp, ChevronDown } from 'lucide-react';

const POSCart = ({ cart, onUpdateQuantity, onRemoveItem, isExpanded = true, onToggleExpand }) => {
  return (
    <div className="flex flex-col h-full bg-white rounded-[8px] border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden transition-all duration-300">
      <div 
        className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors shrink-0"
        onClick={onToggleExpand}
      >
        <h2 className="text-[16px] font-semibold text-slate-800 flex items-center">
          <ShoppingBag className="w-5 h-5 mr-2 text-blue-600" />
          Current Order
        </h2>
        <div className="flex items-center space-x-3">
          <span className="bg-slate-200 text-slate-700 text-[12px] font-bold px-2 py-0.5 rounded-full">
            {cart.length} {cart.length === 1 ? 'item' : 'items'}
          </span>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-slate-500" />
          ) : (
            <ChevronUp className="w-5 h-5 text-slate-500" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="flex-1 overflow-y-auto p-4 bg-white">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-60">
              <ShoppingBag className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-slate-600 text-[16px] font-medium">Your cart is empty</p>
              <p className="text-slate-500 text-[14px] mt-1">Search for products to add</p>
            </div>
          ) : (
          <ul className="space-y-3">
            {cart.map((item, index) => (
              <li key={item.product._id || index} className="group relative flex justify-between items-center p-3 rounded-[8px] border border-slate-100 bg-slate-50 hover:border-slate-300 hover:bg-slate-100 transition-colors">

                <div className="flex-1 min-w-0 pr-4">
                  <h4 className="text-slate-800 text-[14px] font-medium truncate" title={item.product.name}>
                    {item.product.name}
                  </h4>
                  <p className="text-slate-500 text-[12px] mt-0.5">Rs. {item.product.sellingPrice} / {item.product.unit}</p>
                </div>

                <div className="flex items-center space-x-1 bg-white border border-slate-200 rounded-md p-0.5 mr-4 shadow-sm">
                  <button
                    onClick={() => onUpdateQuantity(item.product._id, item.quantity - 1)}
                    className="w-7 h-7 flex items-center justify-center rounded-[4px] text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-slate-800 font-semibold w-6 text-center text-[14px] select-none">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(item.product._id, item.quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center rounded-[4px] text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                    disabled={item.quantity >= item.product.stockQuantity}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right w-24">
                  <p className="text-slate-800 font-bold text-[14px]">
                    Rs. {(item.product.sellingPrice * item.quantity).toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => onRemoveItem(item.product._id)}
                  className="absolute -right-2 -top-2 w-6 h-6 flex items-center justify-center text-slate-400 bg-white border border-slate-200 rounded-full hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                  title="Remove item"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
        </div>
      )}
    </div>
  );
};

export default POSCart;
