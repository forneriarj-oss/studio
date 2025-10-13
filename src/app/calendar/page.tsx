'use client'

import { useAuth, useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { CalendarClient } from "./calendar-client";
import type { Appointment } from '@/lib/types';

export default function CalendarPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const appointmentsRef = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/appointments`) : null),
    [firestore, user]
  );
  const { data: appointments, isLoading } = useCollection<Appointment>(appointmentsRef);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
      <CalendarClient appointments={appointments || []} isLoading={isLoading} />
    </div>
  );
}
