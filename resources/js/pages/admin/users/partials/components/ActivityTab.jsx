import React from "react";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent
} from "@/components/ui/chart";
import { LineChart, AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

export default function AttendanceTab() {
  return (
    <div className="space-y-8 fade-in">
      {/* Attendance Absence Days Header Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-700 p-6 mb-2">
        <span className="text-xl font-bold text-error">Absence Days</span>
      </div>
      {/* Absence Days Table */}
      <div className="w-full overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
        <table className="min-w-full text-xs md:text-sm">
          <thead>
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Reason</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-error/10">
              <td className="p-3 font-medium">2025-10-22</td>
              <td className="p-3">Sick Leave</td>
              <td className="p-3 text-error font-semibold">Unexcused</td>
            </tr>
            <tr className="hover:bg-error/10">
              <td className="p-3 font-medium">2025-10-20</td>
              <td className="p-3">Personal</td>
              <td className="p-3 text-green-700 font-semibold">Excused</td>
            </tr>
            {/* More absence rows as needed */}
          </tbody>
        </table>
      </div>
    </div>
  );
}
