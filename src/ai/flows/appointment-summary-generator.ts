'use server';

/**
 * @fileOverview AI flow for generating summaries of calendar appointments.
 *
 * - generateAppointmentSummary - A function that generates a summary of calendar appointments.
 * - AppointmentSummaryInput - The input type for the generateAppointmentSummary function.
 * - AppointmentSummaryOutput - The return type for the generateAppointmentSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AppointmentSummaryInputSchema = z.object({
  calendarData: z
    .string()
    .describe(
      'Uma string contendo os dados do calendário do usuário em formato JSON. Inclua a data, hora, participantes e qualquer descrição para cada compromisso.'
    ),
});
export type AppointmentSummaryInput = z.infer<typeof AppointmentSummaryInputSchema>;

const AppointmentSummaryOutputSchema = z.object({
  summary: z
    .string()
    .describe('Um resumo conciso dos compromissos do dia, incluindo pontos de discussão relevantes.'),
});
export type AppointmentSummaryOutput = z.infer<typeof AppointmentSummaryOutputSchema>;

export async function generateAppointmentSummary(
  input: AppointmentSummaryInput
): Promise<AppointmentSummaryOutput> {
  return appointmentSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'appointmentSummaryPrompt',
  input: {schema: AppointmentSummaryInputSchema},
  output: {schema: AppointmentSummaryOutputSchema},
  prompt: `Você é um assistente de IA projetado para resumir os compromissos do calendário de um usuário para o dia.

  O usuário fornecerá os dados do calendário em formato JSON. Cada registro contém a hora do compromisso, os participantes e a descrição.

  Seu trabalho é criar um resumo conciso dos compromissos, focando nos principais pontos de discussão e em qualquer preparação necessária.

  Dados do Calendário: {{{calendarData}}} `,
});

const appointmentSummaryFlow = ai.defineFlow(
  {
    name: 'appointmentSummaryFlow',
    inputSchema: AppointmentSummaryInputSchema,
    outputSchema: AppointmentSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
