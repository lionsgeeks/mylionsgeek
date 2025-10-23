"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import {
    Card,
    CardContent,
    // CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "An interactive line chart"

const chartData = [
    { date: "2025-10-01", absent: 2 }, // غاب في الغداء
    { date: "2025-10-02", absent: 1 }, // غاب في الصباح
    { date: "2025-10-03", absent: 3 }, // غاب في المساء
    { date: "2025-10-04", absent: 1 }, // غاب في كل الفترات
    { date: "2025-10-05", absent: 0 }, // حاضر في كل الفترات
    { date: "2025-10-06", absent: 1 }, // غاب في الغداء
    { date: "2025-10-07", absent: 1 }, // غاب في الصباح و المساء
]


const chartConfig = {
    morning: {
        label: "Morning",
        color: "var(--chart-1)",
    },
    lunch: {
        label: "Lunch",
        color: "var(--chart-2)",
    },
    evening: {
        label: "Evening",
        color: "var(--chart-3)",
    },
} satisfies ChartConfig


const LineStatistic = () => {
    return (
        <Card className="py-4 sm:py-0 bg-transparent">
            <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-3 sm:pb-0">
                    <CardTitle>Student Attendance Overview</CardTitle>
                </div>
            </CardHeader>

            <CardContent className="px-2 sm:p-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[250px] w-full"
                >
                    <LineChart
                        accessibilityLayer
                        data={chartData}
                        margin={{ left: 12, right: 12 }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const date = new Date(value)
                                return date.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                })
                            }}
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    className="w-[150px]"
                                    labelFormatter={(value) =>
                                        new Date(value).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })
                                    }
                                    formatter={(value) => (value === 1 ? "Absent" : "Present")}
                                />
                            }
                        />
                        <Line
                            dataKey="absent"
                            type="monotone"
                            stroke="#ef4444"
                            strokeWidth={2}
                            dot={true}
                            name="غياب الطالب"
                        />

                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}


export default LineStatistic;