import React from "react";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

export default function TrainingTab() {
  return (
    <div className="space-y-8 fade-in">
      {/* Training Stats Header Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-700 p-6 flex gap-12 mb-2">
        <div className="flex flex-col items-center text-primary"><span className="text-xs mb-1">Certificates</span><span className="text-2xl font-bold">3</span></div>
        <div className="flex flex-col items-center text-blue-800"><span className="text-xs mb-1">Highest Score</span><span className="text-2xl font-bold">98%</span></div>
        <div className="flex flex-col items-center text-green-700"><span className="text-xs mb-1">Courses</span><span className="text-2xl font-bold">9</span></div>
      </div>
      {/* Trainings Table */}
      <div className="w-full overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 mt-2">
        <table className="min-w-full text-xs md:text-sm">
          <thead>
            <tr>
              <th className="p-3 text-left">Training</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Score</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Trainings rows here... */}
          </tbody>
        </table>
      </div>
    </div>
  );
}
