import React, { useEffect, useState } from 'react';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success) {
          setProducts(data.data);
        } else {
          setError(data.message || 'Failed to fetch products');
        }
      } catch (err) {
        setError('Error connecting to the server');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (error) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-2xl shadow-sm">
          <p className="font-semibold text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-12 relative mx-4 sm:mx-6 lg:mx-8 mt-6">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-60"></div>
        <div className="relative pt-16 pb-20 px-6 sm:px-12 lg:px-20 text-center max-w-4xl mx-auto z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Curated essentials for your <span className="text-indigo-600">lifestyle.</span>
          </h1>
          <p className="text-slate-500 text-lg md:text-xl mb-10 leading-relaxed font-normal max-w-2xl mx-auto">
            Discover a handpicked selection of premium products designed to elevate your everyday experience. 
            Quality, functionality, and unmatched style.
          </p>
          <button className="bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-8 rounded-full transition-colors shadow-md hover:shadow-lg">
            Shop the Collection
          </button>
        </div>
      </div>

      {/* Products Section */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Trending Now</h2>
          <div className="flex gap-2">
            <span className="text-sm font-medium text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full cursor-pointer hover:bg-slate-50">All</span>
            <span className="text-sm font-medium text-slate-400 border border-transparent px-3 py-1 rounded-full cursor-pointer hover:text-slate-600">New Arrivals</span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 animate-pulse">
                <div className="w-full h-56 bg-slate-100 rounded-xl mb-4"></div>
                <div className="h-5 bg-slate-100 rounded-md w-3/4 mb-3"></div>
                <div className="h-4 bg-slate-100 rounded-md w-1/3 mb-4"></div>
                <div className="h-4 bg-slate-50 rounded-md w-full mb-2"></div>
                <div className="h-4 bg-slate-50 rounded-md w-4/5 mb-6"></div>
                <div className="flex justify-between items-center mt-auto">
                  <div className="h-7 bg-slate-100 rounded-md w-1/4"></div>
                  <div className="h-9 bg-slate-100 rounded-lg w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🛍️</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No products found</h3>
            <p className="text-slate-500">We're updating our inventory. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {products.map((product) => (
              <div 
                key={product._id} 
                className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 hover:border-slate-200 transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Image Container */}
                <div className="relative p-3 pb-0">
                  <div className="w-full h-64 rounded-xl overflow-hidden bg-slate-50 relative group-hover:bg-slate-100 transition-colors">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out" 
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <svg className="w-10 h-10 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        <span className="text-sm font-medium">No Image</span>
                      </div>
                    )}
                    
                    {/* Category Badge */}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md shadow-sm border border-slate-100">
                      <span className="text-[10px] font-bold text-indigo-600 tracking-wider uppercase">
                        {product.category?.name || 'Uncategorized'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-grow">
                  <h2 className="text-lg font-bold text-slate-900 mb-1.5 truncate group-hover:text-indigo-600 transition-colors">
                    {product.name}
                  </h2>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-6 font-normal leading-relaxed flex-grow">
                    {product.description}
                  </p>
                  
                  {/* Price & Action */}
                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-100">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400 font-medium mb-0.5">Price</span>
                      <span className="text-xl font-black text-slate-900">
                        ${product.sellingPrice?.toFixed(2)}
                      </span>
                    </div>
                    <button className="flex items-center justify-center bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
