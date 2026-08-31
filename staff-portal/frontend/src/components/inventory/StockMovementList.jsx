import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const StockMovementList = () => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovements();
  }, []);

  const fetchMovements = async () => {
    try {
      const { data } = await api.get('/inventory/movements');
      setMovements(data.data);
    } catch (error) {
      console.error('Failed to fetch movements');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-gray-400">Loading history...</div>;

  return (
    <div className="bg-white/10 backdrop-blur-md shadow-xl overflow-hidden sm:rounded-2xl border border-white/20">
      <div className="px-6 py-4 border-b border-white/10 bg-white/5">
        <h3 className="text-lg font-semibold text-white">Movement History</h3>
      </div>
      <ul className="divide-y divide-white/10 max-h-96 overflow-y-auto">
        {movements.map((mov) => (
          <li key={mov._id} className="p-4 hover:bg-white/5 transition-colors">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-white">{mov.productId?.name || 'Unknown Product'}</p>
                <p className="text-xs text-gray-400 mt-1">
                  <span className={`font-semibold ${mov.type === 'SALE' ? 'text-blue-400' : mov.type === 'ADJUSTMENT' ? 'text-yellow-400' : 'text-green-400'}`}>
                    {mov.type}
                  </span>
                  {' • '}{mov.reason || 'No reason specified'}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${mov.quantity > 0 ? 'text-green-400' : 'text-[#E8446A]'}`}>
                  {mov.quantity > 0 ? '+' : ''}{mov.quantity}
                </p>
                <p className="text-xs text-gray-500">{new Date(mov.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </li>
        ))}
        {movements.length === 0 && (
          <li className="p-6 text-center text-sm text-gray-400">No movements recorded yet.</li>
        )}
      </ul>
    </div>
  );
};

export default StockMovementList;
