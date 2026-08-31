import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const POSCustomerSelect = ({ selectedCustomer, setSelectedCustomer }) => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      // Assuming a customer endpoint exists. If not, this acts as a placeholder
      const { data } = await api.get('/customers').catch(() => ({ data: { data: [] } }));
      setCustomers(data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.phone && c.phone.includes(search))
  );

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-white font-medium">Customer Selection</h3>
        {selectedCustomer && (
          <button onClick={() => setSelectedCustomer(null)} className="text-xs text-[#E8446A] hover:text-pink-300">
            Clear
          </button>
        )}
      </div>

      {selectedCustomer ? (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 flex items-center">
          <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center font-bold mr-3">
            {selectedCustomer.name.charAt(0)}
          </div>
          <div>
            <p className="text-white font-medium">{selectedCustomer.name}</p>
            <p className="text-green-400 text-xs">{selectedCustomer.phone || selectedCustomer.email || 'Walk-in Customer'}</p>
          </div>
        </div>
      ) : (
        <div className="relative">
          <input
            type="text"
            className="w-full bg-white/10 border border-white/20 rounded-xl pl-3 pr-4 py-2.5 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            placeholder="Search customer by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <div className="absolute top-full mt-1 w-full bg-[#1B2A4A] border border-white/20 rounded-xl shadow-2xl max-h-48 overflow-y-auto z-10">
              <ul className="py-1">
                <li 
                  className="px-4 py-2 hover:bg-white/10 text-white cursor-pointer border-b border-white/5"
                  onClick={() => { setSelectedCustomer({ _id: null, name: 'Walk-in Customer' }); setSearch(''); }}
                >
                  <span className="font-medium text-blue-400">Walk-in Customer</span> (Default)
                </li>
                {filtered.map(c => (
                  <li 
                    key={c._id} 
                    className="px-4 py-2 hover:bg-white/10 text-white cursor-pointer flex justify-between items-center"
                    onClick={() => { setSelectedCustomer(c); setSearch(''); }}
                  >
                    <span>{c.name}</span>
                    <span className="text-xs text-gray-400">{c.phone}</span>
                  </li>
                ))}
                {filtered.length === 0 && search && (
                  <li className="px-4 py-3 text-gray-400 text-sm text-center">No matching customers found.</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default POSCustomerSelect;
