import React from 'react';

const RecentSales = ({ sales }) => {
  if (!sales || sales.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 h-full">
        <h3 className="text-white text-lg font-semibold mb-4">Recent Sales</h3>
        <p className="text-gray-400 text-sm">No recent sales found.</p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 h-full overflow-hidden flex flex-col">
      <h3 className="text-white text-lg font-semibold mb-6">Recent Sales</h3>
      <div className="flex-1 overflow-y-auto pr-2">
        <ul className="space-y-4">
          {sales.map((sale) => (
            <li key={sale._id} className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <div>
                <p className="text-white font-medium">{sale.invoiceNumber}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(sale.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[#E8446A] font-bold">Rs. {sale.total.toLocaleString()}</p>
                <span className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-wider ${sale.status === 'completed' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                  {sale.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RecentSales;
