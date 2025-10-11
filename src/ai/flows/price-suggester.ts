'use server';

/**
 * @fileOverview AI flow for suggesting a sale price for a finished product.
 *
 * - suggestPrice - A function that suggests a sale price based on product details.
 * - PriceSuggestionInput - The input type for the suggestPrice function.
 * - PriceSuggestionOutput - The return type for the suggestPrice function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PriceSuggestionInputSchema = z.object({
  productName: z.string().describe('The name of the finished product.'),
  productCost: z.number().describe('The total cost to produce the product.'),
  recipeItems: z.string().describe('A summary of the raw materials used in the product.'),
});
export type PriceSuggestionInput = z.infer<typeof PriceSuggestionInputSchema>;

const PriceSuggestionOutputSchema = z.object({
  suggestedPrice: z.number().describe('The suggested retail price for the product.'),
  justification: z.string().describe('A brief explanation of how the price was determined, considering cost, market, and value.'),
});
export type PriceSuggestionOutput = z.infer<typeof PriceSuggestionOutputSchema>;

export async function suggestPrice(input: PriceSuggestionInput): Promise<PriceSuggestionOutput> {
  return priceSuggesterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'priceSuggesterPrompt',
  input: { schema: PriceSuggestionInputSchema },
  output: { schema: PriceSuggestionOutputSchema },
  prompt: `Você é um especialista em precificação para pequenas empresas de alimentos e bebidas.

  Analise os seguintes detalhes do produto:
  - Nome do Produto: {{{productName}}}
  - Custo de Produção: R$ {{{productCost}}}
  - Ingredientes Principais: {{{recipeItems}}}

  Seu trabalho é sugerir um preço de venda final para o cliente. O preço deve garantir uma margem de lucro saudável (geralmente entre 200% e 400% sobre o custo para este setor), mas também ser competitivo e justo para o consumidor.

  Forneça o preço de venda sugerido e uma breve justificativa para sua sugestão, explicando a margem de lucro aplicada e por que é um preço adequado.
  Responda em um formato JSON estruturado.`,
});

const priceSuggesterFlow = ai.defineFlow(
  {
    name: 'priceSuggesterFlow',
    inputSchema: PriceSuggestionInputSchema,
    outputSchema: PriceSuggestionOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
