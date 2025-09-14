
import React from 'react';

export const AnimeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2L14.09 8.26L20 9.27L15.55 13.54L16.91 19.82L12 16.77L7.09 19.82L8.45 13.54L4 9.27L9.91 8.26L12 2Z" />
  </svg>
);
