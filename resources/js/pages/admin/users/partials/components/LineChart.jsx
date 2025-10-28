"use client"

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "Monthly absence overview chart"

const LineStatistic = ({ MonthlyAbsence }) => {
    console.log('hello this is the attendance'+ MonthlyAbsence)

    const chartData = [
        { month: "يناير", absence: 2 },
        { month: "فبراير", absence: 1 },
        { month: "مارس", absence: 0 },
        { month: "أبريل", absence: 3 },
        { month: "ماي", absence: 2 },
        { month: "يونيو", absence: 1 },
        { month: "يوليوز", absence: 0 },
        { month: "غشت", absence: 2 },
        { month: "شتنبر", absence: 4 },
        { month: "أكتوبر", absence: 1 },
        { month: "نونبر", absence: 0 },
        { month: "دجنبر", absence: 2 },
    ]

    const chartConfig = {
        absence: {
            label: "Absence",
            color: "#FFC801",
        },
    }

    return (
        <Card className="py-4 sm:py-0 bg-transparent shadow-none border-none">
            <CardHeader className="flex flex-col items-stretch border-b border-neutral-200 dark:border-neutral-800 !p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-3 sm:pb-0">
                    <CardTitle className="text-lg font-semibold text-white">
                        Student Attendance Statistic
                    </CardTitle>
                </div>
            </CardHeader>

            <CardContent className="px-2 sm:p-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[300px] w-full"
                >
                    <LineChart
                        data={chartData}
                        margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
                    >
                        <CartesianGrid vertical={false} stroke="#333" opacity={0.2} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            stroke="#ccc"
                        />
                        <YAxis
                            allowDecimals={false}
                            tickLine={false}
                            axisLine={false}
                            stroke="#ccc"
                            label={{
                                value: "Absence Count",
                                angle: -90,
                                position: "insideLeft",
                                fill: "#ccc",
                            }}
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    className="w-[140px]"
                                    labelFormatter={(label) => `شهر ${label}`}
                                    formatter={(value) => [`${value} Attendances`, "Absence"]}
                                />
                            }
                        />
                        <Line
                            dataKey="absence"
                            type="monotone"
                            stroke="#FFC801"
                            strokeWidth={3}
                            dot={{ r: 4, fill: "#FFC801" }}
                            activeDot={{ r: 6 }}
                            name="Absence"
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}

export default LineStatistic
