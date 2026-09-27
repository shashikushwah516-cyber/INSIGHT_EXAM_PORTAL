import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-gray-900 p-4 text-white flex justify-between items-center shadow-md">
      <div className="font-bold text-xl tracking-wide">Insight Exam Portal</div>
      <div className="space-x-6 flex items-center">
        <Link to="/login" className="hover:text-blue-400 transition duration-200">Login</Link>
        <Link to="/register" className="hover:text-blue-400 transition duration-200">Register</Link>
        <Link to="/exam" className="hover:text-blue-400 transition duration-200">Exam Window</Link>
      </div>
    </nav>
  );
}

export default Navbar;