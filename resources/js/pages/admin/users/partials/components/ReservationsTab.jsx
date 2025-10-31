import React from "react";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)"
];

export default function ReservationsTab() {
  return (
    <div className="space-y-8 fade-in">
      {/* Reservation Stats Header Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-700 p-6 flex gap-12 mb-2">
        <div className="flex flex-col items-center text-primary"><span className="text-xs mb-1">Active</span><span className="text-2xl font-bold">2</span></div>
        <div className="flex flex-col items-center text-blue-600"><span className="text-xs mb-1">Returned</span><span className="text-2xl font-bold">6</span></div>
        <div className="flex flex-col items-center text-error"><span className="text-xs mb-1">Overdue</span><span className="text-2xl font-bold">1</span></div>
      </div>
      {/* Reservations Table */}
      <div className="w-full overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 mt-2">
        <table className="min-w-full text-xs md:text-sm">
          <thead>
            <tr>
              <th className="p-3 text-left">Item</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Reservations rows here... */}
          </tbody>
        </table>
      </div>
    </div>
  );
}
