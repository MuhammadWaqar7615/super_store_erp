import React, { useEffect, useState } from 'react';
import { getSales } from '../services/saleService';
import ReceiptModal from '../components/pos/ReceiptModal';

const Receipts = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSale, setSelectedSale] = useState(null);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);
        const { data } = await getSales();
        
        // Filter for current month
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const currentMonthSales = data.data.filter(sale => {
          const saleDate = new Date(sale.createdAt);
          return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
        });

        setSales(currentMonthSales);
      } catch (err) {
        setError('Failed to load receipts.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#1B2A4A] p-8 -m-8 text-white">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Receipts (This Month)</h1>
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-white/10 rounded"></div>
            <div className="h-12 bg-white/10 rounded"></div>
            <div className="h-12 bg-white/10 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#1B2A4A] p-8 -m-8 flex items-center justify-center">
        <div className="text-red-500 text-xl bg-white/5 p-8 rounded-2xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#1B2A4A] p-8 -m-8" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div className="text-white max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Receipts (This Month)</h1>
        <div className="bg-white/5 p-6 rounded-2xl shadow-xl border border-white/10 backdrop-blur-md">
          {sales.length === 0 ? (
            <p className="text-gray-400">No receipts found for this month.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-sm">
                    <th className="pb-4 font-semibold px-4">Date</th>
                    <th className="pb-4 font-semibold px-4">Invoice #</th>
                    <th className="pb-4 font-semibold px-4">Total Items</th>
                    <th className="pb-4 font-semibold px-4 text-right">Total Amount</th>
                    <th className="pb-4 font-semibold px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr 
                      key={sale._id} 
                      onClick={() => setSelectedSale(sale)}
                      className="border-b border-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-4 whitespace-nowrap text-gray-300 group-hover:text-white transition-colors">
                        {new Date(sale.createdAt).toLocaleDateString()} {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-4 px-4 text-[#4facfe] font-medium">{sale.invoiceNumber}</td>
                      <td className="py-4 px-4 text-gray-300">{sale.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                      <td className="py-4 px-4 text-right font-bold text-gray-200">Rs. {sale.total.toLocaleString()}</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          (sale.paymentStatus || 'unknown') === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {(sale.paymentStatus || 'unknown').toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedSale && (
        <ReceiptModal 
          sale={selectedSale} 
          onClose={() => setSelectedSale(null)} 
        />
      )}
    </div>
  );
};

export default Receipts;
