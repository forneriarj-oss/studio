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
      'A string containing the user calendar data in JSON format.  Include the date, time, attendees and any description for each appointment.'
    ),
});
export type AppointmentSummaryInput = z.infer<typeof AppointmentSummaryInputSchema>;

const AppointmentSummaryOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise summary of the days appointments including relevant talking points.'),
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
  prompt: `You are an AI assistant designed to summarize a user\'s calendar appointments for the day.

  The user will provide calendar data in JSON format.  Each record contains the appointment time, attendees, and description.

  Your job is to create a concise summary of the appointments, focusing on key talking points and any preparation needed.

  Calendar Data: {{{calendarData}}} `,
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
