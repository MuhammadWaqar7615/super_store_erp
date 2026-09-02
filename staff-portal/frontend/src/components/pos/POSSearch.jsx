import React from 'react';
import { Search, Image as ImageIcon, AlertTriangle } from 'lucide-react';

const POSSearch = ({ products, onAddToCart, searchTerm, setSearchTerm }) => {
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) && p.stockQuantity > 0 && p.isActive
  );

  return (
    <div className="flex flex-col h-full bg-white rounded-[8px] border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <div className="relative">
          <input
            type="text"
            className="w-full bg-white border border-slate-200 rounded-[8px] pl-10 pr-4 py-3 text-[14px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-sm"
            placeholder="Search products by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-3">
          {filteredProducts.map(product => {
            const isLowStock = product.stockQuantity <= (product.minimumStock || 5);
            
            return (
              <div
                key={product._id}
                onClick={() => onAddToCart(product)}
                className="bg-white border border-slate-200 rounded-[8px] p-2 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all group flex items-center gap-3 relative"
              >
                <div className="h-16 w-16 bg-slate-100 rounded-[6px] shrink-0 flex items-center justify-center overflow-hidden border border-slate-100">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-slate-300" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0 py-0.5">
                  <h3 className="text-slate-800 font-semibold text-[13px] truncate mb-0.5" title={product.name}>{product.name}</h3>
                  <p className="text-slate-500 text-[11px] truncate mb-1.5">{product.category?.name || 'Uncategorized'}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700 font-bold text-[14px]">Rs. {product.sellingPrice}</span>
                    <span className={`text-[11px] flex items-center font-medium bg-slate-100 px-1.5 py-0.5 rounded ${isLowStock ? 'text-amber-600 bg-amber-50' : 'text-slate-500'}`}>
                      {isLowStock && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {product.stockQuantity} in stock
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 opacity-60">
            <Search className="w-12 h-12 text-slate-400 mb-3" />
            <p className="text-slate-600 text-[16px] font-medium">No products found</p>
            <p className="text-slate-500 text-[14px] mt-1">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default POSSearch;
