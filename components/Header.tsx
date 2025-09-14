
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="py-6">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
          Facial Fusion AI
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          Transform faces into works of art.
        </p>
      </div>
    </header>
  );
};
