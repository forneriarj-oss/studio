'use client'

import { useMemo } from 'react';
import { CalendarClient } from "./calendar-client";
import type { Appointment } from '@/lib/types';
import { useUser, useFirebase, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';

export default function CalendarPage() {
  const { user, firestore } = useFirebase();

  const appointmentsQuery = useMemo(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'appointments');
  }, [user, firestore]);
  
  const { data: appointments, isLoading } = useCollection<Appointment>(appointmentsQuery);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
      <CalendarClient appointments={appointments || []} isLoading={isLoading} />
    </div>
  );
}
