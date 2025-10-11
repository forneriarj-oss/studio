'use server';

import { suggestPrice } from '@/ai/flows/price-suggester';
import type { PriceSuggestionInput } from '@/ai/flows/price-suggester';

export async function getPriceSuggestion(input: PriceSuggestionInput) {
  try {
    const result = await suggestPrice(input);
    return { suggestion: result, error: null };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'Ocorreu um erro desconhecido ao obter a sugestão.';
    return { suggestion: null, error: `Falha ao sugerir preço: ${errorMessage}` };
  }
}
