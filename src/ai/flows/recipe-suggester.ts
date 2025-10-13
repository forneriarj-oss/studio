'use server';

/**
 * @fileOverview AI flow for suggesting recipe ingredients based on a flavor name.
 *
 * - suggestRecipeItems - A function that suggests ingredients.
 * - RecipeSuggestionInput - The input type for the function.
 * - RecipeSuggestionOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RecipeSuggestionInputSchema = z.object({
  flavorName: z.string().describe('The name of the product flavor (e.g., "Bolo de cenoura com chocolate").'),
  availableMaterials: z.array(z.object({
    id: z.string(),
    description: z.string(),
  })).describe('An array of all available raw materials in the inventory.'),
});
export type RecipeSuggestionInput = z.infer<typeof RecipeSuggestionInputSchema>;

const RecipeSuggestionOutputSchema = z.object({
  suggestedMaterialIds: z.array(z.string()).describe('An array of IDs of the suggested raw materials from the available list.'),
});
export type RecipeSuggestionOutput = z.infer<typeof RecipeSuggestionOutputSchema>;


export async function suggestRecipeItems(input: RecipeSuggestionInput): Promise<RecipeSuggestionOutput> {
  return recipeSuggesterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recipeSuggesterPrompt',
  input: { schema: RecipeSuggestionInputSchema },
  output: { schema: RecipeSuggestionOutputSchema },
  prompt: `Você é um especialista em confeitaria e produção de alimentos.
  
  Sua tarefa é analisar um nome de sabor de produto e, com base em uma lista de matérias-primas disponíveis, sugerir quais delas devem compor a receita para esse sabor.

  Analise o seguinte nome de sabor:
  - Sabor: {{{flavorName}}}

  Considere a seguinte lista de matérias-primas disponíveis no estoque:
  {{#each availableMaterials}}
  - ID: {{id}}, Descrição: "{{description}}"
  {{/each}}

  Com base no nome do sabor, identifique os ingredientes mais prováveis da lista. Retorne APENAS os IDs das matérias-primas que você sugere que sejam incluídas na receita.
  
  Por exemplo, se o sabor for "Bolo de Fubá com Goiabada" e a lista incluir "Farinha de Trigo", "Fubá", "Goiabada Cascão" e "Ovos", sua resposta deve conter os IDs de "Fubá" e "Goiabada Cascão". Não inclua ingredientes genéricos como "Ovos" ou "Farinha" a menos que sejam explicitamente mencionados ou fortemente implícitos.
  
  Responda em um formato JSON estruturado.`,
});

const recipeSuggesterFlow = ai.defineFlow(
  {
    name: 'recipeSuggesterFlow',
    inputSchema: RecipeSuggestionInputSchema,
    outputSchema: RecipeSuggestionOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
