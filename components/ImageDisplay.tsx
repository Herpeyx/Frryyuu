
import React from 'react';
import { Loader } from './Loader';
import { DownloadIcon } from './icons/DownloadIcon';

interface ImageDisplayProps {
  sourcePreview: string | null;
  generatedImageUrl: string | null;
  isLoading: boolean;
}

const Placeholder: React.FC = () => (
    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-gray-900/50 rounded-lg">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p className="text-lg">Your generated image will appear here</p>
    </div>
);

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ sourcePreview, generatedImageUrl, isLoading }) => {
  return (
    <div className="w-full aspect-square relative flex items-center justify-center bg-black rounded-xl overflow-hidden border border-gray-700">
      {isLoading && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-20">
          <Loader />
          <p className="mt-4 text-lg text-gray-300">Fusing your image...</p>
        </div>
      )}
      
      {!generatedImageUrl && !isLoading && !sourcePreview && <Placeholder />}

      {sourcePreview && !generatedImageUrl && !isLoading && (
         <img src={sourcePreview} alt="Source Preview" className="w-full h-full object-contain" />
      )}
      
      {generatedImageUrl && (
        <>
            <img src={generatedImageUrl} alt="Generated" className="w-full h-full object-contain" />
            <a
                href={generatedImageUrl}
                download="facial-fusion-ai-image.png"
                className="absolute bottom-4 right-4 bg-gray-900/70 text-white p-2 rounded-full hover:bg-purple-600 transition-colors z-10"
                aria-label="Download image"
                title="Download image"
            >
                <DownloadIcon className="w-6 h-6" />
            </a>
        </>
      )}
    </div>
  );
};
