import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

export function ReservationTrendChart({ reservationTrend = [], todayReservations = 0, weekReservations = 0, monthReservations = 0 }) {
    const periodData = [
        { name: 'Today', value: todayReservations },
        { name: 'This week', value: weekReservations },
        { name: 'This month', value: monthReservations },
    ];

    const chartConfig = {
        count: { label: 'Reservations', color: 'var(--color-alpha)' },
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
                {periodData.map((item) => (
                    <div
                        key={item.name}
                        className="rounded-xl border border-alpha/15 bg-alpha/[0.04] px-3 py-4 text-center dark:border-light/10 dark:bg-alpha/[0.06]"
                    >
                        <p className="text-[11px] font-semibold tracking-wide text-beta/55 uppercase dark:text-light/55">{item.name}</p>
                        <p className="mt-1.5 text-2xl font-bold text-beta dark:text-light">{item.value}</p>
                    </div>
                ))}
            </div>

            {reservationTrend.length > 0 && (
                <div>
                    <p className="mb-3 text-sm font-medium text-beta/70 dark:text-light/70">Last 7 days</p>
                    <ChartContainer config={chartConfig} className="aspect-auto h-[240px] w-full">
                        <BarChart data={reservationTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-alpha/10 dark:stroke-light/10" />
                            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                            <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} width={32} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="count" fill="var(--color-alpha)" radius={[8, 8, 0, 0]} name="Reservations" />
                        </BarChart>
                    </ChartContainer>
                </div>
            )}
        </div>
    );
}

export function TaskCompletionLineChart({ taskCompletionTrend = [] }) {
    const chartConfig = {
        count: { label: 'Completed tasks', color: 'var(--color-alpha)' },
    };

    if (taskCompletionTrend.length === 0) {
        return <p className="py-10 text-center text-sm text-muted-foreground">No task activity yet</p>;
    }

    return (
        <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
            <LineChart data={taskCompletionTrend} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-alpha/10 dark:stroke-light/10" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} width={32} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                    type="monotone"
                    dataKey="count"
                    stroke="var(--color-alpha)"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: 'var(--color-alpha)', strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: 'var(--color-alpha)', stroke: 'var(--color-beta)', strokeWidth: 2 }}
                    name="Completed tasks"
                />
            </LineChart>
        </ChartContainer>
    );
}
