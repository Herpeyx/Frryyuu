
import React from 'react';

interface GalleryImage {
  imageUrl: string;
  prompt: string;
}

interface GalleryProps {
  images: GalleryImage[];
  onImageSelect: (imageUrl: string, prompt: string) => void;
}

export const Gallery: React.FC<GalleryProps> = ({ images, onImageSelect }) => {
  if (images.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-semibold mb-4 text-center text-purple-300">Recent Creations</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {images.map((image) => (
          <button
            key={image.imageUrl}
            className="aspect-square bg-gray-800 rounded-lg overflow-hidden cursor-pointer group relative border-2 border-transparent hover:border-purple-500 focus:border-purple-500 focus:outline-none transition-all"
            onClick={() => onImageSelect(image.imageUrl, image.prompt)}
            aria-label={`Select generated image with prompt: ${image.prompt}`}
          >
            <img src={image.imageUrl} alt={`Generated art for prompt: ${image.prompt}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity flex items-center justify-center p-2">
              <p className="text-white text-xs text-center line-clamp-3">{image.prompt}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
