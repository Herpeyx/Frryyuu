import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface GenerationResult {
    imageUrl: string | null;
    text: string | null;
}

const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 1000;

/**
 * Executes an API call with an exponential backoff retry mechanism for rate limit errors.
 * @param apiCall The async function to call.
 * @returns The result of the apiCall.
 */
const executeWithRetry = async <T>(apiCall: () => Promise<T>): Promise<T> => {
    let attempts = 0;
    let delay = INITIAL_DELAY_MS;

    while (true) {
        try {
            return await apiCall();
        } catch (error: any) {
            attempts++;
            const errorMessage = (error?.message || '').toLowerCase();

            // Check for rate limit error indicators
            if (errorMessage.includes('429') || errorMessage.includes('resource_exhausted') || errorMessage.includes('rate limit')) {
                if (attempts >= MAX_RETRIES) {
                    console.error("API call failed after multiple retries due to rate limiting.", error);
                    throw new Error("The service is currently busy. Please wait a moment and try again.");
                }
                console.warn(`Rate limit exceeded. Retrying in ${delay / 1000}s... (Attempt ${attempts}/${MAX_RETRIES})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
            } else {
                // Not a rate limit error, re-throw immediately
                console.error("An unexpected error occurred calling Gemini API:", error);
                throw new Error(error?.message || "An unexpected error occurred while generating the image.");
            }
        }
    }
};


export const generateImageFromFace = async (
    base64ImageData: string,
    mimeType: string,
    prompt: string
): Promise<GenerationResult> => {
    return executeWithRetry(async () => {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64ImageData,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: prompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        let imageUrl: string | null = null;
        let text: string | null = null;

        if (response.candidates && response.candidates.length > 0) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const base64ImageBytes: string = part.inlineData.data;
                    imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
                } else if (part.text) {
                    text = part.text;
                }
            }
        }
        
        if (!imageUrl) {
             throw new Error(text || 'The AI did not return an image. This could be due to a safety policy. Please adjust your prompt.');
        }

        return { imageUrl, text };
    });
};

export const generateImageFromText = async (
    prompt: string
): Promise<GenerationResult> => {
    return executeWithRetry(async () => {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
            return { imageUrl, text: null };
        } else {
            throw new Error('The AI did not return an image. This could be due to a safety policy. Please adjust your prompt.');
        }
    });
};
