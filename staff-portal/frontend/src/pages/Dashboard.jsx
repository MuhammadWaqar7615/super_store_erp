import React, { useState, useEffect } from 'react';
import MetricCard from '../components/dashboard/MetricCard';
import RecentSales from '../components/dashboard/RecentSales';
import LowStockAlert from '../components/dashboard/LowStockAlert';
import { getDashboardMetrics } from '../services/reportService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Enforcement: Only Admin can view dashboard
    if (user?.role !== 'Admin') {
      // In a real app we might redirect to POS
      // navigate('/staff/pos');
      // For now, we will just set an unauthorized error since we don't have POS yet
      setError('Unauthorized access. Only Admins can view the dashboard.');
      setLoading(false);
      return;
    }

    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await getDashboardMetrics();
        setData(response.data);
      } catch (err) {
        console.error('Failed to fetch dashboard metrics', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#1B2A4A] p-8 -m-6" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>
        {/* Skeleton Loaders */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 rounded-2xl bg-white/5 border border-white/10 animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
          <div className="lg:col-span-2 rounded-2xl bg-white/5 border border-white/10 animate-pulse"></div>
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

  const { metrics, recentSales, lowStockProducts } = data;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#1B2A4A] p-8 -m-6" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Overview</h1>
        <p className="text-gray-400 mt-2">Real-time store metrics and insights</p>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <MetricCard 
          title="Total Sales" 
          value={`Rs. ${metrics.totalSales.toLocaleString()}`}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <MetricCard 
          title="Total Orders" 
          value={metrics.totalOrders.toLocaleString()}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
        />
        <MetricCard 
          title="Net Profit" 
          value={`Rs. ${metrics.netProfit.toLocaleString()}`}
          isHighlighted={true}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
        />
        <MetricCard 
          title="Total Products" 
          value={metrics.totalProducts.toLocaleString()}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
         <MetricCard 
          title="Total COGS" 
          value={`Rs. ${metrics.totalCOGS.toLocaleString()}`}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" /></svg>}
        />
         <MetricCard 
          title="Total Income" 
          value={`Rs. ${metrics.totalIncome.toLocaleString()}`}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>}
        />
         <MetricCard 
          title="Total Expenses" 
          value={`Rs. ${metrics.totalExpenses.toLocaleString()}`}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>}
        />
      </div>

      {/* Lists section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
        <div className="lg:col-span-2 h-full">
          <RecentSales sales={recentSales} />
        </div>
        <div className="h-full">
          <LowStockAlert products={lowStockProducts} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
