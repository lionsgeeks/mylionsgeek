import React from "react";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";

const POST_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"];

export default function PostsTab() {
  return (
    <div className="space-y-8 fade-in">
      {/* General Posts Stats Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-700 p-6 flex gap-12 mb-2">
        <div className="flex flex-col items-center text-primary"><span className="text-xs mb-1">Total Posts</span><span className="text-2xl font-bold">35</span></div>
        <div className="flex flex-col items-center text-yellow-600"><span className="text-xs mb-1">Top Likes</span><span className="text-2xl font-bold">953</span></div>
        <div className="flex flex-col items-center text-blue-800"><span className="text-xs mb-1">Top Comments</span><span className="text-2xl font-bold">34</span></div>
      </div>
      {/* All Posts Table */}
      <div className="w-full overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 mt-2">
        <table className="min-w-full text-xs md:text-sm">
          <thead>
            <tr>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Posts rows here... */}
          </tbody>
        </table>
      </div>
    </div>
  );
}
