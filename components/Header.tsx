import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center">
        <img src="https://carsurin.com/wp-content/uploads/2020/06/carsurin_logo-e1592381275358.png" alt="Company Logo" className="h-10 mr-4" />
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Organization Development Toolkit</h1>
            <p className="text-slate-500 mt-1">AI-powered tools for modern organizations</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
