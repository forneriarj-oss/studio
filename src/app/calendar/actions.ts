"use server";

import { generateAppointmentSummary } from "@/ai/flows/appointment-summary-generator";

export async function getSummary(calendarData: string) {
  if (!calendarData || calendarData === '[]') {
    return { summary: "No appointments for the selected day to summarize.", error: null };
  }
  
  try {
    const result = await generateAppointmentSummary({ calendarData });
    return { summary: result.summary, error: null };
  } catch (e) {
    console.error(e);
    // This provides a more user-friendly error message.
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { summary: null, error: `Failed to generate summary: ${errorMessage}` };
  }
}
