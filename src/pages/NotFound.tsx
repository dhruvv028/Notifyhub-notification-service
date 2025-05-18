import React from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <AlertOctagon className="h-16 w-16 text-indigo-500 mb-4" />
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Page Not Found</h1>
      <p className="text-gray-600 mb-6">The page you are looking for doesn't exist or has been moved.</p>
      <Link
        to="/"
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-150"
      >
        Back to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;