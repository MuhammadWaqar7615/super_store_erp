import React, { useState, useEffect } from 'react';
import MetricCard from './MetricCard';
import RecentSales from './RecentSales';
import { getCashierDashboardMetrics } from '../../services/reportService';
import { useAuth } from '../../context/AuthContext';

const CashierDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await getCashierDashboardMetrics();
        setData(response.data);
      } catch (err) {
        console.error('Failed to fetch cashier dashboard metrics', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#1B2A4A] p-8 -m-6" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <h1 className="text-3xl font-bold text-white mb-8">Cashier Dashboard</h1>
        {/* Skeleton Loaders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 rounded-2xl bg-white/5 border border-white/10 animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 h-[400px]">
          <div className="rounded-2xl bg-white/5 border border-white/10 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#1B2A4A] p-8 -m-6 flex items-center justify-center">
        <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
          <p className="text-[#E8446A] text-xl mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-[#E8446A] text-white rounded-lg hover:bg-[#d4375b] transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { metrics, recentSales } = data;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#1B2A4A] p-8 -m-6" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Welcome, {user?.name}</h1>
        <p className="text-gray-400 mt-2">Your shift performance for today</p>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <MetricCard 
          title="My Total Sales" 
          value={`Rs. ${metrics.totalSales.toLocaleString()}`}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <MetricCard 
          title="My Total Orders" 
          value={metrics.totalOrders.toLocaleString()}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
        />
        <MetricCard 
          title="Items Sold" 
          value={metrics.itemsSold.toLocaleString()}
          isHighlighted={true}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
        />
      </div>

      {/* Lists section */}
      <div className="grid grid-cols-1 gap-6 h-[400px]">
        <div className="h-full">
          <RecentSales sales={recentSales} />
        </div>
      </div>
    </div>
  );
};

export default CashierDashboard;
