import React from 'react';

const MetricCard = ({ title, value, icon, isHighlighted }) => {
  return (
    <div className={`p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 transition-all duration-300 hover:-translate-y-1 ${isHighlighted ? 'shadow-[0_0_15px_rgba(232,68,106,0.5)] border-[#E8446A]' : 'shadow-lg'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-200 text-sm font-medium tracking-wider uppercase">{title}</h3>
        <div className={`p-2 rounded-full bg-white/5 ${isHighlighted ? 'text-[#E8446A]' : 'text-blue-300'}`}>
          {icon}
        </div>
      </div>
      <p className={`text-3xl font-bold ${isHighlighted ? 'text-[#E8446A]' : 'text-white'}`}>{value}</p>
    </div>
  );
};

export default MetricCard;
