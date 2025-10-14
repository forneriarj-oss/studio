'use client'

import { CalendarClient } from "./calendar-client";
import type { Appointment } from '@/lib/types';

const MOCK_APPOINTMENTS: Appointment[] = [
    { id: '1', startTime: new Date().toISOString(), endTime: new Date(new Date().setHours(new Date().getHours() + 1)).toISOString(), description: 'Reunião com Fornecedor de Embalagens' },
    { id: '2', startTime: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), endTime: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), description: 'Entrevista com novo confeiteiro' },
];

export default function CalendarPage() {
  const appointments = MOCK_APPOINTMENTS;
  const isLoading = false;

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
      <CalendarClient appointments={appointments || []} isLoading={isLoading} />
    </div>
  );
}
