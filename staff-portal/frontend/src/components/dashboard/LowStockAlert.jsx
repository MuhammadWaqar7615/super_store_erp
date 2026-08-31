import React from 'react';

const LowStockAlert = ({ products }) => {
  if (!products || products.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 h-full">
        <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
          <span className="mr-2">Low Stock Alerts</span>
        </h3>
        <p className="text-gray-400 text-sm">All products are sufficiently stocked.</p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-[#E8446A]/30 shadow-[0_0_15px_rgba(232,68,106,0.15)] h-full overflow-hidden flex flex-col">
      <h3 className="text-[#E8446A] text-lg font-semibold mb-6 flex items-center">
        <svg className="w-5 h-5 mr-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        Low Stock Alerts
      </h3>
      <div className="flex-1 overflow-y-auto pr-2">
        <ul className="space-y-4">
          {products.map((product) => (
            <li key={product._id} className="flex justify-between items-center p-4 rounded-xl bg-[#E8446A]/10 border border-[#E8446A]/20">
              <div>
                <p className="text-white font-medium truncate max-w-[180px]" title={product.name}>{product.name}</p>
                <p className="text-xs text-gray-400 mt-1">Min: {product.minimumStock} {product.unit}</p>
              </div>
              <div className="text-right">
                <p className={`text-xl font-bold ${product.stockQuantity === 0 ? 'text-red-500' : 'text-orange-400'}`}>
                  {product.stockQuantity}
                </p>
                <span className="text-xs text-gray-400">{product.unit}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LowStockAlert;
