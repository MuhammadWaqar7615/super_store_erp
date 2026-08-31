import React from 'react';

const CategoryTable = ({ categories, onEdit, onDelete }) => {
  return (
    <div className="bg-white/10 backdrop-blur-md shadow-xl overflow-hidden sm:rounded-2xl border border-white/20">
      <table className="min-w-full divide-y divide-white/10">
        <thead className="bg-white/5">
          <tr>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Name</th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Description</th>
            <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {categories.map((category) => (
            <tr key={category._id} className="hover:bg-white/5 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{category.name}</td>
              <td className="px-6 py-4 text-sm text-gray-400">{category.description || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onClick={() => onEdit(category)} className="text-blue-400 hover:text-blue-300 mr-4 transition-colors">Edit</button>
                <button onClick={() => onDelete(category._id)} className="text-[#E8446A] hover:text-pink-400 transition-colors">Delete</button>
              </td>
            </tr>
          ))}
          {categories.length === 0 && (
            <tr>
              <td colSpan="3" className="px-6 py-8 text-center text-sm text-gray-400">No categories found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryTable;
