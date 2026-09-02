import React from 'react';
import { Trash2, CreditCard } from 'lucide-react';

const POSBottomBar = ({ subtotal, onClearCart, onPayNow, canPay }) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-1px_3px_rgba(0,0,0,0.06)] h-24 flex items-center justify-between px-6 z-10">
      <div className="flex items-center space-x-6">
        <button
          onClick={onClearCart}
          className="flex items-center space-x-2 px-4 py-3 rounded-md border border-slate-200 text-red-600 hover:bg-red-50 transition-colors font-medium text-[14px]"
        >
          <Trash2 className="w-5 h-5" />
          <span>Clear Cart</span>
        </button>
      </div>

      <div className="flex items-center space-x-8">
        <div className="text-right">
          <p className="text-[14px] text-slate-500 font-medium uppercase tracking-wider mb-1">Total</p>
          <p className="text-[28px] font-bold text-slate-800 leading-none">
            <span className="text-[18px] text-slate-500 mr-1">Rs.</span>
            {subtotal.toLocaleString()}
          </p>
        </div>
        
        <button
          onClick={onPayNow}
          disabled={!canPay}
          className="flex items-center space-x-3 px-10 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-md font-semibold text-[18px] transition-colors shadow-sm"
        >
          <CreditCard className="w-6 h-6" />
          <span>Pay Now</span>
        </button>
      </div>
    </div>
  );
};

export default POSBottomBar;
