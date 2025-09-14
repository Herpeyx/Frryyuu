
import React from 'react';

interface SavedFace {
    base64: string;
    mimeType: string;
    previewUrl: string;
}

interface SavedFacesProps {
  faces: SavedFace[];
  onSelect: (face: SavedFace) => void;
}

export const SavedFaces: React.FC<SavedFacesProps> = ({ faces, onSelect }) => {
  if (faces.length === 0) {
    return null;
  }

  return (
    <div>
        <h3 className="text-lg font-semibold mb-2 text-purple-300/80">Saved Faces</h3>
        <div className="grid grid-cols-4 gap-3">
            {faces.map((face) => (
            <button
                key={face.base64.substring(0, 20)}
                className="aspect-square bg-gray-800 rounded-lg overflow-hidden cursor-pointer group relative border-2 border-gray-700 hover:border-purple-500 focus:border-purple-500 focus:outline-none transition-all"
                onClick={() => onSelect(face)}
                aria-label="Select saved face"
            >
                <img src={face.previewUrl} alt="Saved face" className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                    <p className="text-white text-xs text-center">Use Face</p>
                </div>
            </button>
            ))}
        </div>
    </div>
  );
};
