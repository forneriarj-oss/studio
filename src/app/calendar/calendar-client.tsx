'use client';
import { useState, useMemo, useTransition } from 'react';
import type { Appointment } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { getSummary } from './actions';
import { Wand2, User, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface CalendarClientProps {
  appointments: Appointment[];
}

export function CalendarClient({ appointments }: CalendarClientProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [summary, setSummary] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const selectedDayAppointments = useMemo(() => {
    if (!date) return [];
    const selectedDateString = date.toISOString().split('T')[0];
    return appointments
      .filter(app => app.date === selectedDateString)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [date, appointments]);

  const handleGenerateSummary = () => {
    const dataToSummarize = selectedDayAppointments.map(({ id, ...rest }) => rest);
    const calendarData = JSON.stringify(dataToSummarize);
    
    startTransition(async () => {
      const result = await getSummary(calendarData);
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
        setSummary(null);
      } else {
        setSummary(result.summary);
      }
    });
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Card>
          <CardContent className="p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="w-full"
            />
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card className="min-h-[500px]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  Appointments for {date ? date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : '...'}
                </CardTitle>
                <CardDescription>
                  {selectedDayAppointments.length} event{selectedDayAppointments.length !== 1 ? 's' : ''} scheduled.
                </CardDescription>
              </div>
              <Button onClick={handleGenerateSummary} disabled={isPending || selectedDayAppointments.length === 0}>
                <Wand2 className="mr-2 h-4 w-4" />
                {isPending ? 'Generating...' : 'Daily Summary'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Separator className="mb-4" />
            <ScrollArea className="h-[350px]">
              {isPending && (
                <div className="space-y-4 p-1">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              )}
              {!isPending && summary && (
                <div className="prose prose-sm dark:prose-invert max-w-none rounded-lg bg-muted p-4">
                  <h3 className='text-base font-semibold mt-0'>Talking Points & Summary</h3>
                  <p>{summary}</p>
                </div>
              )}
              {!isPending && !summary && selectedDayAppointments.length > 0 && (
                <div className="space-y-4 p-1">
                  {selectedDayAppointments.map(app => (
                    <div key={app.id} className="rounded-lg border p-4">
                      <p className="font-semibold">{app.title}</p>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Clock className="mr-1.5 h-4 w-4" />
                          <span>{app.time}</span>
                        </div>
                        <div className="flex items-center">
                          <User className="mr-1.5 h-4 w-4" />
                          <span>{app.attendees.join(', ')}</span>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-foreground/80">{app.description}</p>
                    </div>
                  ))}
                </div>
              )}
              {!isPending && !summary && selectedDayAppointments.length === 0 && (
                <div className="flex h-[200px] items-center justify-center text-center">
                  <p className="text-muted-foreground">No appointments for this day. <br/> Select another day or click "Daily Summary" for an empty state message.</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
