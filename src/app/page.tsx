'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '@/firebase';
import { OverviewCards } from '@/components/dashboard/overview-cards';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { getExpenses, getRevenue, getAppointments } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, Loader } from 'lucide-react';
import { Appointment } from '@/lib/types';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth');
    }
  }, [user, isUserLoading, router]);

  const revenue = getRevenue();
  const expenses = getExpenses();
  const appointments = getAppointments();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingAppointments = appointments.filter(app => {
    const appDate = new Date(app.date);
    appDate.setHours(0, 0, 0, 0);
    return appDate >= today;
  }).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 3);

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="h-16 w-16 animate-spin" />
      </div>
    );
  }


  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Painel</h1>
      <OverviewCards />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart revenue={revenue} expenses={expenses} />
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">
                Próximos Compromissos
              </CardTitle>
              <Button asChild size="sm" variant="outline">
                <Link href="/calendar">
                  Ver Todos
                  <ArrowUpRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map((app: Appointment) => (
                    <div key={app.id} className="flex items-center space-x-4">
                      <div className="flex flex-col items-center justify-center p-2 bg-muted rounded-md w-16">
                         <span className="text-sm font-medium text-muted-foreground">{new Date(app.date).toLocaleDateString('pt-BR', { month: 'short' })}</span>
                         <span className="text-xl font-bold">{new Date(app.date).getDate()}</span>
                      </div>
                      <div>
                        <p className="font-semibold">{app.title}</p>
                        <p className="text-sm text-muted-foreground">{app.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                 <p className="text-sm text-muted-foreground text-center py-8">Nenhum compromisso futuro.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <RecentActivity />
    </div>
  );
}
