import { getAppointments } from "@/lib/data";
import { CalendarClient } from "./calendar-client";

export default function CalendarPage() {
  const appointments = getAppointments();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
      <CalendarClient appointments={appointments} />
    </div>
  );
}
