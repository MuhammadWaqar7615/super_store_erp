import React from 'react';

const InventoryTable = ({ products, onAdjustStock }) => {
  return (
    <div className="bg-white/10 backdrop-blur-md shadow-xl overflow-x-auto sm:rounded-2xl border border-white/20">
      <table className="min-w-full divide-y divide-white/10">
        <thead className="bg-white/5">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Product</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Stock Level</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {products.map((product) => {
            const isOutOfStock = product.stockQuantity === 0;
            const isLowStock = !isOutOfStock && product.stockQuantity <= product.minimumStock;
            const isGoodStock = !isOutOfStock && !isLowStock;

            return (
              <tr key={product._id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <span className="text-xl font-bold mr-1">{product.stockQuantity}</span>
                  <span className="text-gray-500 text-xs">{product.unit}</span>
                  <span className="text-gray-500 text-xs ml-2">(Min: {product.minimumStock})</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {isGoodStock && <span className="px-3 py-1 inline-flex text-xs font-semibold rounded-full bg-green-500/20 text-green-300 border border-green-500/30">Healthy</span>}
                  {isLowStock && <span className="px-3 py-1 inline-flex text-xs font-semibold rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">Low Stock</span>}
                  {isOutOfStock && <span className="px-3 py-1 inline-flex text-xs font-semibold rounded-full bg-[#E8446A]/20 text-[#E8446A] border border-[#E8446A]/30 shadow-[0_0_10px_rgba(232,68,106,0.3)]">Out of Stock</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => onAdjustStock(product)} className="text-[#E8446A] hover:text-pink-400 font-semibold transition-colors">Adjust Stock</button>
                </td>
              </tr>
            );
          })}
          {products.length === 0 && (
            <tr>
              <td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-400">No products found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;
