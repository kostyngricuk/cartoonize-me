
'use server';

/**
 * @fileOverview Transforms an uploaded photo into a cartoon-style image using GenAI.
 *
 * - cartoonizeImage - A function that handles the image transformation process.
 * - CartoonizeImageInput - The input type for the cartoonizeImage function.
 * - CartoonizeImageOutput - The return type for the cartoonizeImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CartoonizeImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to cartoonize, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type CartoonizeImageInput = z.infer<typeof CartoonizeImageInputSchema>;

const CartoonizeImageOutputSchema = z.object({
  cartoonDataUri: z
    .string()
    .describe('The cartoonized image as a data URI.'),
});
export type CartoonizeImageOutput = z.infer<typeof CartoonizeImageOutputSchema>;

export async function cartoonizeImage(input: CartoonizeImageInput): Promise<CartoonizeImageOutput> {
  return cartoonizeImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'cartoonizeImagePrompt',
  model: 'googleai/gemini-2.0-flash-exp', // Use the experimental image generation model
  input: {schema: CartoonizeImageInputSchema},
  output: {schema: CartoonizeImageOutputSchema},
  prompt: [
    {media: {url: '{{photoDataUri}}'}}, // Use double-stash for data URI
    {text: 'Transform this image into a cartoon style. Output only the generated cartoon image.'}, // Refined prompt
  ],
  config: {
    responseModalities: ['TEXT', 'IMAGE'], // Expect an image in response
  },
});

const cartoonizeImageFlow = ai.defineFlow(
  {
    name: 'cartoonizeImageFlow',
    inputSchema: CartoonizeImageInputSchema,
    outputSchema: CartoonizeImageOutputSchema,
  },
  async input => {
    const {media} = await prompt(input);
    
    if (!media || !media.url) {
      console.error('Image generation failed. AI response did not include media URL:', {media});
      throw new Error('Image generation failed: AI response did not include a valid image URL.');
    }
    
    return {cartoonDataUri: media.url};
  }
);
