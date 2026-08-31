import React from 'react';

const POSSearch = ({ products, onAddToCart, searchTerm, setSearchTerm }) => {
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) && p.stockQuantity > 0 && p.isActive
  );

  return (
    <div className="flex flex-col h-full bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-4">
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E8446A]/50 transition-all shadow-inner"
            placeholder="Search products to add..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
        {filteredProducts.map(product => (
          <div 
            key={product._id}
            onClick={() => onAddToCart(product)}
            className="bg-white/5 border border-white/10 rounded-xl p-3 cursor-pointer hover:bg-white/10 hover:border-[#E8446A]/50 hover:shadow-[0_0_15px_rgba(232,68,106,0.2)] transition-all group flex flex-col h-full"
          >
            <div className="h-24 w-full bg-black/20 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
              {product.image ? (
                <img src={product.image} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              )}
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-white font-medium text-sm line-clamp-2 leading-tight mb-1">{product.name}</h3>
                <p className="text-gray-400 text-xs truncate">{product.category?.name}</p>
              </div>
              <div className="mt-2 flex justify-between items-end">
                <span className="text-[#E8446A] font-bold">Rs. {product.sellingPrice}</span>
                <span className="text-xs text-gray-500">{product.stockQuantity} in stock</span>
              </div>
            </div>
          </div>
        ))}
        
        {filteredProducts.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-10 opacity-50">
            <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
            <p className="text-gray-400">No products available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default POSSearch;
