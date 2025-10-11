import { OverviewCards } from '@/components/dashboard/overview-cards';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { getExpenses, getRevenue, getAppointments } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';
import { Appointment } from '@/lib/types';

export default function Home() {
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

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <OverviewCards />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart revenue={revenue} expenses={expenses} />
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">
                Upcoming Appointments
              </CardTitle>
              <Button asChild size="sm" variant="outline">
                <Link href="/calendar">
                  View All
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
                         <span className="text-sm font-medium text-muted-foreground">{new Date(app.date).toLocaleDateString('en-US', { month: 'short' })}</span>
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
                 <p className="text-sm text-muted-foreground text-center py-8">No upcoming appointments.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <RecentActivity />
    </div>
  );
}
