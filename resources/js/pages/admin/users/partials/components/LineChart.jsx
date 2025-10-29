'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

export const description = 'Monthly absence overview chart';

const LineStatistic = ({ chartData }) => {
    console.log(chartData);

    // const chartData = [
    // 	{ month: "يناير", absence: 2 },
    // 	{ month: "فبراير", absence: 1 },
    // 	{ month: "مارس", absence: 0 },
    // 	{ month: "أبريل", absence: 3 },
    // 	{ month: "ماي", absence: 2 },
    // 	{ month: "يونيو", absence: 1 },
    // 	{ month: "يوليوز", absence: 0 },
    // 	{ month: "غشت", absence: 2 },
    // 	{ month: "شتنبر", absence: 4 },
    // 	{ month: "أكتوبر", absence: 1 },
    // 	{ month: "نونبر", absence: 0 },
    // 	{ month: "دجنبر", absence: 2 },
    // ]

    const chartConfig = {
        absence: {
            label: 'Absence',
            color: '#FFC801',
        },
    };

    return (
        <Card className="border-none bg-transparent py-4 shadow-none sm:py-0">
            <CardHeader className="flex flex-col items-stretch border-b border-neutral-200 !p-0 sm:flex-row dark:border-neutral-800">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-3 sm:pb-0">
                    <CardTitle className="text-lg font-semibold text-white">Student Attendance Statistic</CardTitle>
                </div>
            </CardHeader>

            <CardContent className="px-2 sm:p-6">
                <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
                    <LineChart data={chartData} margin={{ left: 12, right: 12, top: 12, bottom: 12 }}>
                        <CartesianGrid vertical={false} stroke="#333" opacity={0.2} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} stroke="#ccc" />
                        <YAxis
                            allowDecimals={false}
                            tickLine={false}
                            axisLine={false}
                            stroke="#ccc"
                            label={{
                                value: 'Absence Count',
                                angle: -90,
                                position: 'insideLeft',
                                fill: '#ccc',
                            }}
                            reversed={true}
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    className="w-[140px]"
                                    labelFormatter={(label) => `شهر ${label}`}
                                    formatter={(value) => [`${value} Attendances`, 'Absence']}
                                />
                            }
                        />
                        <Line
                            dataKey="absence"
                            type="monotone"
                            stroke="#FFC801"
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#FFC801' }}
                            activeDot={{ r: 6 }}
                            name="Absence"
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};

export default LineStatistic;
