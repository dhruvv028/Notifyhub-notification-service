import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold">NotifyHub</h3>
            <p className="text-sm text-gray-400">A robust notification service</p>
          </div>
          
          <div className="flex space-x-4">
            <a 
              href="#" 
              className="text-gray-400 hover:text-white transition-colors duration-150"
              aria-label="Documentation"
            >
              Docs
            </a>
            <a 
              href="#" 
              className="text-gray-400 hover:text-white transition-colors duration-150"
              aria-label="API"
            >
              API
            </a>
            <a 
              href="#" 
              className="text-gray-400 hover:text-white transition-colors duration-150"
              aria-label="Support"
            >
              Support
            </a>
          </div>
        </div>
        
        <div className="mt-6 border-t border-gray-700 pt-6 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} NotifyHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;