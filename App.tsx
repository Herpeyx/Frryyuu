
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { PromptInput } from './components/PromptInput';
import { ImageDisplay } from './components/ImageDisplay';
import { Loader } from './components/Loader';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { generateImageFromFace, generateImageFromText } from './services/geminiService';
import { Gallery } from './components/Gallery';
import { SavedFaces } from './components/SavedFaces';
import { CameraIcon } from './components/icons/CameraIcon';
import { AnimeIcon } from './components/icons/AnimeIcon';
import { FantasyIcon } from './components/icons/FantasyIcon';
import { CyberpunkIcon } from './components/icons/CyberpunkIcon';

interface GalleryImage {
  imageUrl: string;
  prompt: string;
}

interface SourceImage {
    base64: string;
    mimeType: string;
}

interface SavedFace extends SourceImage {
    previewUrl: string;
}

type GenerationMode = 'fusion' | 'creative';

const STYLES = [
  { id: 'photo', name: 'Photo', prompt: ', photorealistic, 8k, sharp focus, detailed, professional photography', icon: <CameraIcon className="w-6 h-6" /> },
  { id: 'anime', name: 'Anime', prompt: ', anime style, vibrant colors, detailed, digital illustration, trending on pixiv', icon: <AnimeIcon className="w-6 h-6" /> },
  { id: 'fantasy', name: 'Fantasy', prompt: ', epic fantasy art, digital painting, high detail, matte painting, concept art', icon: <FantasyIcon className="w-6 h-6" /> },
  { id: 'cyberpunk', name: 'Cyberpunk', prompt: ', cyberpunk style, neon lights, futuristic, dystopian, cinematic lighting', icon: <CyberpunkIcon className="w-6 h-6" /> },
];

const App: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<SourceImage | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [savedFaces, setSavedFaces] = useState<SavedFace[]>([]);
  const [focusOnFeet, setFocusOnFeet] = useState<boolean>(false);
  const [mode, setMode] = useState<GenerationMode>('fusion');
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedFaces = localStorage.getItem('savedFaces');
      if (storedFaces) {
        setSavedFaces(JSON.parse(storedFaces));
      }
    } catch (e) {
      console.error("Failed to parse saved faces from localStorage", e);
      localStorage.removeItem('savedFaces');
    }
  }, []);

  const handleFileSelect = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const fullDataUrl = reader.result as string;
        const base64Data = fullDataUrl.split(',')[1];
        setSourceImage({ base64: base64Data, mimeType: file.type });
        setSourcePreview(fullDataUrl);
      };
      reader.readAsDataURL(file);
      setGeneratedImageUrl(null);
      setGeneratedText(null);
      setError(null);
    } else {
      setSourceImage(null);
      setSourcePreview(null);
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!prompt) {
      setError('Please provide a prompt.');
      return;
    }
    if (mode === 'fusion' && !sourceImage) {
      setError('Please provide a face for Facial Fusion mode.');
      return;
    }


    setIsLoading(true);
    setError(null);
    setGeneratedImageUrl(null);
    setGeneratedText(null);

    try {
      let finalPrompt = prompt;
      
      if (mode === 'fusion' && selectedStyle) {
        const style = STYLES.find(s => s.id === selectedStyle);
        if (style) {
          finalPrompt += style.prompt;
        }
      }

      if (focusOnFeet) {
        finalPrompt += ', focusing on capturing perfectly formed, beautiful female feet in the composition';
      }
      
      let result: { imageUrl: string | null; text: string | null; };

      if (mode === 'fusion') {
        result = await generateImageFromFace(sourceImage!.base64, sourceImage!.mimeType, finalPrompt);
      } else {
        result = await generateImageFromText(finalPrompt);
      }


      if (result.imageUrl) {
        setGeneratedImageUrl(result.imageUrl);
        const newGalleryImage = { imageUrl: result.imageUrl!, prompt };
        setGallery(prevGallery => [newGalleryImage, ...prevGallery].slice(0, 6));

        if (mode === 'fusion' && sourceImage && sourcePreview) {
            const isAlreadySaved = savedFaces.some(face => face.base64 === sourceImage.base64);
            if (!isAlreadySaved) {
                const newFace: SavedFace = { ...sourceImage, previewUrl: sourcePreview };
                const updatedFaces = [newFace, ...savedFaces].slice(0, 4);
                setSavedFaces(updatedFaces);
                localStorage.setItem('savedFaces', JSON.stringify(updatedFaces));
            }
        }

      } else {
        setError('The AI did not return an image. Please try a different prompt.');
      }
      setGeneratedText(result.text);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An error occurred while generating the image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [sourceImage, prompt, focusOnFeet, savedFaces, sourcePreview, mode, selectedStyle]);

  const handleGalleryImageSelect = (imageUrl: string, imagePrompt: string) => {
    setGeneratedImageUrl(imageUrl);
    setPrompt(imagePrompt);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSavedFace = (face: SavedFace) => {
    setSourceImage({ base64: face.base64, mimeType: face.mimeType });
    setSourcePreview(face.previewUrl);
    setGeneratedImageUrl(null);
    setGeneratedText(null);
    setError(null);
    setMode('fusion');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/30">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Controls Column */}
          <div className="flex flex-col gap-6 p-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl">
            
            <div className="flex justify-center p-1 bg-gray-900/60 rounded-lg">
              <button
                onClick={() => setMode('fusion')}
                className={`w-1/2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${mode === 'fusion' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-700/50'}`}
                aria-pressed={mode === 'fusion'}
              >
                Facial Fusion
              </button>
              <button
                onClick={() => setMode('creative')}
                className={`w-1/2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${mode === 'creative' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-700/50'}`}
                aria-pressed={mode === 'creative'}
              >
                Creative Generation
              </button>
            </div>

            {mode === 'fusion' && (
              <>
                <div>
                  <h2 className="text-xl font-semibold mb-3 text-purple-300">1. Upload a Face</h2>
                  <ImageUploader onFileSelect={handleFileSelect} preview={sourcePreview} />
                </div>
                <SavedFaces faces={savedFaces} onSelect={handleSelectSavedFace} />
              </>
            )}

            <div>
              <h2 className="text-xl font-semibold mb-3 text-purple-300">
                {mode === 'fusion' ? '2. Describe Your Vision' : '1. Describe Your Vision'}
              </h2>
              <PromptInput value={prompt} onChange={setPrompt} />
            </div>
            
            {mode === 'fusion' && (
              <div>
                <h2 className="text-xl font-semibold mb-3 text-purple-300">3. Choose a Style</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {STYLES.map(style => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(prev => prev === style.id ? null : style.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-200 ${selectedStyle === style.id ? 'bg-purple-600/30 border-purple-500' : 'bg-gray-900/60 border-gray-700 hover:border-gray-500'}`}
                    >
                      {style.icon}
                      <span className={`mt-2 text-sm font-medium ${selectedStyle === style.id ? 'text-white' : 'text-gray-300'}`}>{style.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}


            <div className="flex items-center space-x-3 bg-gray-900/60 p-3 rounded-lg">
                <input
                    type="checkbox"
                    id="feetFocus"
                    checked={focusOnFeet}
                    onChange={(e) => setFocusOnFeet(e.target.checked)}
                    className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-600 cursor-pointer"
                />
                <label htmlFor="feetFocus" className="text-gray-300 font-medium cursor-pointer select-none">
                    Focus on perfect female feet
                </label>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading || !prompt || (mode === 'fusion' && !sourceImage)}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900/50 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105"
              aria-label="Generate new image"
            >
              {isLoading ? (
                <>
                  <Loader />
                  Generating...
                </>
              ) : (
                <>
                  <SparklesIcon />
                  Generate Image
                </>
              )}
            </button>
            {error && <p className="text-red-400 text-center mt-2">{error}</p>}
          </div>

          {/* Display Column */}
          <div className="flex flex-col gap-6 p-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl">
             <h2 className="text-xl font-semibold text-purple-300">Result</h2>
             <ImageDisplay
                sourcePreview={sourcePreview}
                generatedImageUrl={generatedImageUrl}
                isLoading={isLoading}
              />
              {generatedText && (
                <div className="mt-4 p-4 bg-gray-900/70 rounded-lg">
                    <p className="text-gray-300 italic">{generatedText}</p>
                </div>
              )}
          </div>
        </div>

        <Gallery images={gallery} onImageSelect={handleGalleryImageSelect} />

      </main>
      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>Powered by Gemini AI. Create stunning visuals with perfect facial resemblance.</p>
      </footer>
    </div>
  );
};

export default App;
