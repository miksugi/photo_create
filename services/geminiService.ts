
import { GoogleGenAI } from "@google/genai";

const MODEL_NAME = 'gemini-2.5-flash-image';

export const transformToProfessionalPhoto = async (
  imageBase64: string,
  mimeType: string,
  genderPreference: string = 'unspecified'
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  // Extract base64 content without the data:image/... prefix
  const base64Data = imageBase64.split(',')[1];

  const genderContext = genderPreference !== 'unspecified' 
    ? `The person is ${genderPreference}. `
    : "";

  const prompt = `
    Edit this photo to transform it into a high-end professional studio portrait for a resume or LinkedIn profile.
    
    Requirements:
    1. ${genderContext}Change the clothing to professional business attire (e.g., a well-fitted navy or dark gray suit with a crisp white shirt for men, or a professional blazer/blouse for women).
    2. Change the background to a clean, solid studio backdrop (light gray, soft blue, or off-white).
    3. Enhance the lighting to be soft, professional studio lighting that highlights the face naturally.
    4. Maintain the person's core facial features, hairstyle, and identity accurately while cleaning up stray hairs and improving skin texture subtly.
    5. The final image should look like it was taken by a professional photographer in a dedicated studio.
    6. Ensure the crop is a standard professional headshot (shoulders and head).
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("No image was generated. Please try again.");
    }

    const imagePart = response.candidates[0].content.parts.find(part => part.inlineData);
    
    if (imagePart && imagePart.inlineData) {
      return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
    } else {
      throw new Error("The AI returned a response without an image. This might happen with complex inputs.");
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to process image.");
  }
};
