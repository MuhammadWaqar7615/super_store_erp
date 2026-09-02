import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, UserPlus, User, Phone, Mail, X } from 'lucide-react';

const POSCustomerSelect = ({ selectedCustomer, setSelectedCustomer }) => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Quick Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data } = await api.get('/customers').catch(() => ({ data: { data: [] } }));
      setCustomers(data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone && c.phone.includes(search)) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    setAddError('');
    
    // Phone validation based on placeholder limit (11 digits)
    const phoneRegex = /^[0-9]{11}$/;
    if (!phoneRegex.test(newCustomer.phone)) {
      setAddError('Phone must be exactly 11 digits (e.g. 03001234567).');
      setIsAdding(false);
      return;
    }
    
    // Instead of creating a permanent DB customer, just use this info for the receipt
    setSelectedCustomer({
      _id: null,
      isWalkIn: true,
      name: newCustomer.name,
      phone: newCustomer.phone,
      email: newCustomer.email
    });
    
    setShowAddModal(false);
    setNewCustomer({ name: '', phone: '', email: '' });
    setSearch('');
    setIsAdding(false);
  };

  return (
    <div className="bg-white rounded-[8px] border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <h3 className="text-slate-800 font-semibold text-[16px] flex items-center">
          <User className="w-5 h-5 mr-2 text-blue-600" />
          Customer
        </h3>
        
        {selectedCustomer ? (
          <button 
            onClick={() => setSelectedCustomer(null)} 
            className="text-[12px] font-medium text-slate-500 hover:text-red-600 transition-colors flex items-center"
          >
            <X className="w-3 h-3 mr-1" /> Clear
          </button>
        ) : (
          <button 
            onClick={() => setShowAddModal(true)} 
            className="text-[12px] font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center"
          >
            <UserPlus className="w-3.5 h-3.5 mr-1" /> Quick Add
          </button>
        )}
      </div>

      <div className="p-4">
        {selectedCustomer ? (
          <div className="bg-slate-50 border border-slate-200 rounded-[8px] p-3 flex items-start">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-3 shrink-0">
              {selectedCustomer.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-slate-800 font-bold text-[14px] truncate">{selectedCustomer.name}</p>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider ${
                  selectedCustomer.isRegistered 
                    ? 'bg-green-100 text-green-700' 
                    : selectedCustomer._id ? 'bg-slate-200 text-slate-600' : 'bg-amber-100 text-amber-700'
                }`}>
                  {selectedCustomer.isRegistered ? 'Registered' : selectedCustomer._id ? 'Walk-in' : 'Guest'}
                </span>
              </div>
              {selectedCustomer.phone && (
                <p className="text-slate-500 text-[12px] flex items-center mt-1">
                  <Phone className="w-3 h-3 mr-1" /> {selectedCustomer.phone}
                </p>
              )}
              {selectedCustomer.email && (
                <p className="text-slate-500 text-[12px] flex items-center mt-0.5 truncate">
                  <Mail className="w-3 h-3 mr-1" /> {selectedCustomer.email}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="relative">
              <input
                type="text"
                className="w-full bg-white border border-slate-200 rounded-[8px] pl-9 pr-4 py-2.5 text-slate-800 text-[14px] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-sm"
                placeholder="Search by name, phone, email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
            
            {showDropdown && search && (
              <div className="absolute top-full mt-1 w-full bg-white border border-slate-200 rounded-[8px] shadow-lg max-h-60 overflow-y-auto z-20">
                <ul className="py-1">
                  {filtered.map(c => (
                    <li
                      key={c._id}
                      className="px-4 py-2 hover:bg-slate-50 text-slate-800 cursor-pointer border-b border-slate-100 last:border-0"
                      onClick={() => { 
                        setSelectedCustomer(c); 
                        setSearch(''); 
                        setShowDropdown(false); 
                      }}
                    >
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="font-semibold text-[14px]">{c.name}</span>
                        {c.isRegistered && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-green-100 text-green-700 rounded-sm">REG</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center text-[12px] text-slate-500">
                        <span>{c.phone}</span>
                        <span className="truncate ml-2">{c.email}</span>
                      </div>
                    </li>
                  ))}
                  {filtered.length === 0 && (
                    <li className="px-4 py-3 text-slate-500 text-[14px] text-center bg-slate-50">
                      No matching customers found.
                      <button 
                        onClick={() => {
                          setShowDropdown(false);
                          setShowAddModal(true);
                        }}
                        className="block w-full mt-2 text-blue-600 font-medium hover:underline"
                      >
                        Add New Customer
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            )}
            
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-[8px] flex items-start">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mr-3">
                <User className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-amber-800">No Customer Selected</p>
                <p className="text-[12px] text-amber-700 mt-0.5">Please search for an existing customer or add a new walk-in.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[8px] shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="text-[18px] font-bold text-slate-800">Quick Add Walk-in</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleQuickAdd} className="p-6">
              {addError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-[14px] rounded-[4px]">
                  {addError}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[14px] font-medium text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    className="w-full bg-white border border-slate-300 rounded-[4px] px-3 py-2 text-[14px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-[14px] font-medium text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    maxLength={11}
                    placeholder="e.g. 03001234567"
                    className="w-full bg-white border border-slate-300 rounded-[4px] px-3 py-2 text-[14px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    value={newCustomer.phone}
                    onChange={(e) => {
                      // Only allow digits to be typed
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setNewCustomer({...newCustomer, phone: val});
                    }}
                  />
                  <p className="text-[12px] text-slate-500 mt-1">Exactly 11 digits.</p>
                </div>
                
                <div>
                  <label className="block text-[14px] font-medium text-slate-700 mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    maxLength={100}
                    className="w-full bg-white border border-slate-300 rounded-[4px] px-3 py-2 text-[14px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-[4px] text-slate-700 text-[14px] font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="px-4 py-2 bg-blue-600 text-white rounded-[4px] text-[14px] font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {isAdding && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                  {isAdding ? 'Adding...' : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSCustomerSelect;
