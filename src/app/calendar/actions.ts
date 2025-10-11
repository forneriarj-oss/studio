"use server";

import { generateAppointmentSummary } from "@/ai/flows/appointment-summary-generator";

export async function getSummary(calendarData: string) {
  if (!calendarData || calendarData === '[]') {
    return { summary: "Nenhum compromisso para o dia selecionado para resumir.", error: null };
  }
  
  try {
    const result = await generateAppointmentSummary({ calendarData });
    return { summary: result.summary, error: null };
  } catch (e) {
    console.error(e);
    // This provides a more user-friendly error message.
    const errorMessage = e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.';
    return { summary: null, error: `Falha ao gerar resumo: ${errorMessage}` };
  }
}
