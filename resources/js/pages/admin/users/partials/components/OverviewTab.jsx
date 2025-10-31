import React from "react";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent
} from "@/components/ui/chart";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

const OVERVIEW_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)"
];

export default function OverviewTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 fade-in">
      {/* Engagement Pie Chart - Responsive */}
      <ChartContainer
        className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 sm:p-6 shadow-md flex flex-col items-center justify-center"
        id="user-engagement-pie"
        config={{
          Training: { label: "Training", color: "var(--chart-1)" },
          Projects: { label: "Projects", color: "var(--chart-2)" },
          Posts: { label: "Posts", color: "var(--chart-3)" },
        }}
      >
        <h2 className="text-lg font-bold text-neutral-800 dark:text-yellow-400 mb-2">Engagement Breakdown</h2>
        <PieChart width={320} height={220}>
          <Pie
            data={[
              { name: "Training", value: 28 },
              { name: "Projects", value: 42 },
              { name: "Posts", value: 30 },
            ]}
            dataKey="value"
            innerRadius={40}
            outerRadius={75}
            nameKey="name"
            labelLine={false}
            label={({ name }) => name}
          >
            {OVERVIEW_COLORS.map((color, idx) => (
              <Cell key={color} fill={color} />
            ))}
          </Pie>
          <Legend content={<ChartLegendContent />} />
          <ChartTooltipContent />
        </PieChart>
      </ChartContainer>
      {/* Stats, Line chart, Activities List */}
      <div className="flex flex-col gap-6 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 sm:p-6 shadow-md w-full">
        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-1">
          <div className="bg-muted dark:bg-muted/10 p-4 rounded-lg flex flex-col items-center">
            <span className="text-xs text-muted-foreground mb-1">Posts</span>
            <span className="font-semibold text-xl text-primary">35</span>
          </div>
          <div className="bg-muted dark:bg-muted/10 p-4 rounded-lg flex flex-col items-center">
            <span className="text-xs text-muted-foreground mb-1">Projects</span>
            <span className="font-semibold text-xl text-primary">8</span>
          </div>
          <div className="bg-muted dark:bg-muted/10 p-4 rounded-lg flex flex-col items-center">
            <span className="text-xs text-muted-foreground mb-1">Trainings</span>
            <span className="font-semibold text-xl text-primary">3</span>
          </div>
          <div className="bg-muted dark:bg-muted/10 p-4 rounded-lg flex flex-col items-center">
            <span className="text-xs text-muted-foreground mb-1">Comments</span>
            <span className="font-semibold text-xl text-primary">158</span>
          </div>
        </div>
        {/* Streak Line Chart (responsive) */}
        <ChartContainer
          id="login-streak-line"
          className="w-full pt-0 flex-1"
          config={{
            Logins: { label: "Logins", color: "var(--chart-2)" },
          }}
        >
          <LineChart width={380} height={190} data={[
            { month: "Apr", Logins: 8 },
            { month: "May", Logins: 14 },
            { month: "Jun", Logins: 11 },
            { month: "Jul", Logins: 12 },
            { month: "Aug", Logins: 15 },
            { month: "Sep", Logins: 10 },
            { month: "Oct", Logins: 17 }
          ]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <ChartTooltipContent />
            <Line
              type="monotone"
              dataKey="Logins"
              stroke="var(--chart-2)"
              strokeWidth={2}
              activeDot={{ r: 7 }}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ChartContainer>
        {/* Mock Activities Table (Responsive, admin actions) */}
        <div className="w-full overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 mt-2">
          <table className="min-w-full text-xs md:text-sm">
            <thead>
              <tr>
                <th className="p-3 text-left">Activity</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-muted/20">
                <td className="p-3 font-medium">Login</td>
                <td className="p-3">2025-10-30</td>
                <td className="p-3 text-blue-700 dark:text-blue-300">Access</td>
                <td className="p-3 flex flex-col sm:flex-row gap-2">
                  <button className="w-full sm:w-auto px-3 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-semibold hover:bg-blue-200 dark:hover:bg-blue-700 transition focus:ring-2 focus:ring-yellow-500">View</button>
                  <button className="w-full sm:w-auto px-3 py-1 rounded bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 font-semibold hover:bg-red-200 dark:hover:bg-red-700 transition focus:ring-2 focus:ring-yellow-500">Delete</button>
                </td>
              </tr>
              <tr className="hover:bg-muted/20">
                <td className="p-3 font-medium">Posted in Forum</td>
                <td className="p-3">2025-10-28</td>
                <td className="p-3 text-green-700 dark:text-green-300">Forum</td>
                <td className="p-3 flex flex-col sm:flex-row gap-2">
                  <button className="w-full sm:w-auto px-3 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-semibold hover:bg-blue-200 dark:hover:bg-blue-700 transition focus:ring-2 focus:ring-yellow-500">View</button>
                  <button className="w-full sm:w-auto px-3 py-1 rounded bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 font-semibold hover:bg-red-200 dark:hover:bg-red-700 transition focus:ring-2 focus:ring-yellow-500">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
